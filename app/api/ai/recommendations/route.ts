import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { openai } from '@/lib/openai';
import { sanitizeInput } from '@/lib/validation';

type CourseDoc = {
  _id: unknown;
  title?: string;
  slug?: string;
  subject?: string;
  level?: string;
  summary?: string;
  thumbnail?: string;
  price?: number;
  metadata?: { tags?: string[] };
};

const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX = 10;
const rateMap = new Map<string, { ts: number; count: number }>();

export async function GET(_req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const key = `ai-recommendations:${userId}`;
    const nowTs = Date.now();
    const existing = rateMap.get(key);
    if (existing && nowTs - existing.ts < RATE_LIMIT_WINDOW_MS) {
      if (existing.count >= RATE_LIMIT_MAX) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
      rateMap.set(key, { ts: existing.ts, count: existing.count + 1 });
    } else {
      rateMap.set(key, { ts: nowTs, count: 1 });
    }

    const db = await getDatabase();

    // Get user's learning history
    const [enrollments, completedCourses] = await Promise.all([
      db.collection('enrollments').find({ userId, status: 'approved' }).toArray(),
      db.collection('enrollments').find({ userId, status: 'completed' }).toArray(),
    ]);

    // Get all available courses
    const allCourses = (await db
      .collection('courses')
      .find({ status: 'published' })
      .toArray()) as CourseDoc[];

    // Get user's interests from completed courses
    const completedCourseIds = completedCourses
      .map((e) => {
        const cid = (e as Record<string, unknown>)['courseId'];
        return cid ? String(cid) : '';
      })
      .filter(Boolean);
    const completedCourseData = allCourses.filter((c) => completedCourseIds.includes(String(c._id)));

    const subjects = [...new Set(completedCourseData.map((c) => c.subject).filter(Boolean))].slice(0, 10);
    const tags = completedCourseData
      .flatMap((c) => c.metadata?.tags || [])
      .map((t: string) => sanitizeInput(String(t)).slice(0, 40))
      .slice(0, 20);

    // Use AI to generate personalized recommendations
    if (openai && subjects.length > 0) {
      try {
        const prompt = `Based on a user's learning history:
- Completed subjects: ${subjects.join(', ')}
- Interests: ${tags.slice(0, 10).join(', ')}
- Completed ${completedCourses.length} courses

Generate 5 personalized course recommendations. Return only a JSON array of course titles that would be good next steps for this learner.`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        });

        const aiRecommendations = JSON.parse(response.choices[0]?.message?.content || '{}');
        const recommendedTitles: string[] = Array.isArray(aiRecommendations.recommendations)
          ? aiRecommendations.recommendations
          : [];

        // Merge AI-selected titles into tags to influence fallback sorting
        for (const title of recommendedTitles.slice(0, 10)) {
          tags.push(title.toLowerCase());
        }
      } catch (aiError) {
        console.error('AI recommendation error:', aiError);
      }
    }

    // Fallback: Recommend based on similar subjects/tags
    const enrolledCourseIds = enrollments
      .map((e) => {
        const cid = (e as Record<string, unknown>)['courseId'];
        return cid ? String(cid) : '';
      })
      .filter(Boolean);
    const recommendations = allCourses
      .filter((c) => {
        const courseId = String(c._id);
        const courseTags = (c.metadata?.tags || []).map((t) => String(t).toLowerCase());
        return (
          !enrolledCourseIds.includes(courseId) &&
          (subjects.includes(c.subject || '') || tags.some((tag) => courseTags.includes(tag)))
        );
      })
      .sort((a, b) => {
        const aMatch = subjects.includes(a.subject || '') ? 1 : 0;
        const bMatch = subjects.includes(b.subject || '') ? 1 : 0;
        return bMatch - aMatch;
      })
      .slice(0, 10)
      .map((c) => ({
        id: String(c._id),
        title: c.title,
        slug: c.slug,
        subject: c.subject,
        level: c.level,
        summary: c.summary,
        thumbnail: c.thumbnail,
        price: c.price,
      }));

    return NextResponse.json({ recommendations });
  } catch (error: unknown) {
    console.error('Recommendations error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to get recommendations', message: msg }, { status: 500 });
  }
}

