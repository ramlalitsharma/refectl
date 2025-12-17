import { DiscussionForum } from '@/components/discussions/DiscussionForum';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getDatabase } from '@/lib/mongodb';
import { serializeDiscussionPost } from '@/lib/models/Discussion';

export const dynamic = 'force-dynamic';

export default async function ForumPage() {
  const db = await getDatabase();
  const posts = await db
    .collection('discussions')
    .find({})
    .sort({ isPinned: -1, replyCount: -1, createdAt: -1 })
    .limit(25)
    .toArray()
    .catch(() => []);

  const serialized = posts.map((post: any) => {
    const clean = serializeDiscussionPost(post);
    return {
      ...clean,
      createdAt: clean.createdAt.toISOString(),
      updatedAt: clean.updatedAt.toISOString(),
    };
  });

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-12 space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-teal-600 font-semibold">Community</p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Forum & peer learning</h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Ask technical questions, get teaching tips, or showcase your wins. Moderated by superadmins and powered by our
            reputation system.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="info" className="uppercase tracking-wide text-[11px]">Always-on help desk</Badge>
            <Badge variant="success" className="uppercase tracking-wide text-[11px]">Teacher verified answers</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-6">
        <Card className="border border-dashed border-slate-300 bg-white">
          <CardContent className="py-6 grid gap-4 md:grid-cols-3 text-sm text-slate-600">
            <div>
              <p className="text-2xl font-semibold text-slate-900">24/7</p>
              <p>Community coverage across time zones</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">+4k</p>
              <p>Threads covering courses, careers, exams, and business</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">Human + AI</p>
              <p>Hybrid moderation keeps discussions sharp and respectful</p>
            </div>
          </CardContent>
        </Card>

        <DiscussionForum initialPosts={serialized as any} />
      </div>
    </div>
  );
}

