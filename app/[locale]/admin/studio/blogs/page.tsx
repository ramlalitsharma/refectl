import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserRole } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { BlogDashboard } from '@/components/admin/studio/BlogDashboard';

export const dynamic = 'force-dynamic';

export default async function BlogStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { status: statusFilter } = await searchParams;

  const role = await getUserRole();
  if (!role || !['superadmin', 'admin', 'teacher', 'student', 'user'].includes(role)) {
    redirect('/dashboard');
  }

  const db = await getDatabase();
  // Include blogs by the user OR system blogs by Mota CEO
  const query: any = (role === 'admin' || role === 'superadmin') 
    ? {} 
    : { $or: [{ authorId: userId }, { authorId: { $in: ['system', 'institutional-studio-desk'] } }] };
  
  if (statusFilter) {
    query.status = statusFilter;
  }

  const blogs = await db
    .collection('blogs')
    .find(query, { projection: { title: 1, status: 1, createdAt: 1, slug: 1, authorId: 1, coverImage: 1, authorName: 1 } })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const formatted = blogs.map((blog: any) => ({
    id: blog._id ? String(blog._id) : blog.slug,
    slug: blog.slug,
    title: blog.title,
    status: blog.status || 'draft',
    createdAt: blog.createdAt,
    heroImage: blog.coverImage || '',
    authorName: blog.authorName || (['system', 'institutional-studio-desk'].includes(blog.authorId) ? 'Mota CEO' : 'Author'),
    isSystem: ['system', 'institutional-studio-desk'].includes(blog.authorId),
  }));

  return <BlogDashboard blogs={formatted} />;
}
