import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getUserRole } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { BlogEditorCanvas } from '@/components/admin/studio/BlogEditorCanvas';

export const dynamic = 'force-dynamic';

export default async function EditBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { slug } = await params;
  if (slug === 'new') {
    return <BlogEditorCanvas />;
  }

  const role = await getUserRole();
  const db = await getDatabase();
  
  const blog = await db.collection('blogs').findOne({ slug });
  if (!blog) notFound();

  // Check permission (only author or admin)
  if (role !== 'admin' && role !== 'superadmin' && blog.authorId !== userId) {
    redirect('/admin/studio/blogs');
  }

  const formatted = {
    title: blog.title,
    content: blog.content,
    status: blog.status,
    slug: blog.slug,
  };

  return <BlogEditorCanvas initialData={formatted} slug={slug} />;
}
