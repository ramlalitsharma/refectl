import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { serializeDiscussionPost } from '@/lib/models/Discussion';
import { DiscussionDetail } from '@/components/discussions/DiscussionDetail';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Card, CardContent } from '@/components/ui/Card';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

interface DiscussionPageProps {
  params: Promise<{ postId: string }>;
}

export default async function DiscussionPage({ params }: DiscussionPageProps) {
  const { postId } = await params;
  const { userId } = await auth();

  const db = await getDatabase();
  const post = await db.collection('discussions').findOne({
    $or: [{ _id: new ObjectId(postId) }, { id: postId }],
  });

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Discussion Not Found</h1>
            <p className="text-slate-600">The discussion post could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f6f9] min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Discussions', href: '/discussions' },
            { label: post.title || 'Discussion' },
          ]}
        />

        {(() => {
          const serialized = serializeDiscussionPost(post as any);
          const uiPost = {
            ...serialized,
            id: String(serialized.id || ''),
            createdAt:
              serialized.createdAt instanceof Date
                ? serialized.createdAt.toISOString()
                : String(serialized.createdAt),
            replies: (serialized.replies || []).map((r: any) => ({
              ...r,
              id: String(r.id || ''),
              createdAt:
                r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
            })),
          };
          return (
            <DiscussionDetail post={uiPost as any} currentUserId={userId || undefined} />
          );
        })()}
      </div>
    </div>
  );
}

