import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { BlogCreatorStudio } from '@/components/admin/BlogCreatorStudio';

export const dynamic = 'force-dynamic';

export default async function BlogStudioPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const db = await getDatabase();
  const blogs = await db
    .collection('blogs')
    .find({}, { projection: { title: 1, status: 1, createdAt: 1 } })
    .sort({ createdAt: -1 })
    .limit(12)
    .toArray();

  const formatted = blogs.map((blog: any) => ({
    id: blog._id ? String(blog._id) : blog.slug,
    title: blog.title,
    status: blog.status || 'draft',
    createdAt: blog.createdAt,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold text-slate-900">Blog Studio</h1>
          <p className="mt-1 text-sm text-slate-500">
            Craft persuasive stories, AI-generated outlines, and marketing CTAs in one streamlined workspace.
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-10">
        <BlogCreatorStudio recentBlogs={formatted} />
      </main>
    </div>
  );
}
