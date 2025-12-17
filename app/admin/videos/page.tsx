import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { VideoLibrary } from '@/components/admin/VideoLibrary';

export const dynamic = 'force-dynamic';

export default async function VideoLibraryPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  return (
    <div className="bg-[#f4f6f9] min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Video Library</h1>
          <p className="text-slate-600 mt-2">
            Upload and manage videos. Link them to courses when needed.
          </p>
        </div>
        <VideoLibrary />
      </div>
    </div>
  );
}

