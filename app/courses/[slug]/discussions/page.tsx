import { getDatabase } from '@/lib/mongodb';
import { DiscussionForum } from '@/components/discussions/DiscussionForum';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface CourseDiscussionsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CourseDiscussionsPage({ params }: CourseDiscussionsPageProps) {
  const { slug } = await params;

  const db = await getDatabase();
  const course = await db.collection('courses').findOne({ slug });

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
            <p className="text-slate-600">The course could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch existing discussions
  const discussions = await db
    .collection('discussions')
    .find({ courseId: String(course._id) })
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(50)
    .toArray();

  const posts = discussions.map((d: any) => ({
    id: String(d._id),
    title: d.title,
    content: d.content,
    authorId: d.authorId,
    authorName: d.authorName,
    authorAvatar: d.authorAvatar,
    tags: d.tags || [],
    isPinned: d.isPinned || false,
    views: d.views || 0,
    upvotes: d.upvotes || 0,
    replyCount: d.replyCount || d.replies?.length || 0,
    createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt,
  }));

  return (
    <div className="bg-[#f4f6f9] min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Courses', href: '/courses' },
            { label: course.title, href: `/courses/${slug}` },
            { label: 'Discussions' },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{course.title} - Discussions</h1>
            <p className="text-slate-600 mt-1">Ask questions and discuss course content</p>
          </div>
          <Link href={`/courses/${slug}`}>
            <Button variant="outline">Back to Course</Button>
          </Link>
        </div>

        <DiscussionForum courseId={String(course._id)} initialPosts={posts} />
      </div>
    </div>
  );
}

