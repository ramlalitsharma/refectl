'use client';

import { useEffect } from 'react';
import { useRouter } from '@/lib/navigation';

export default function ShopWhiteboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to actual whiteboard
    router.push('/tools/whiteboard');
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">Redirecting to Whiteboard...</h1>
      <p className="text-gray-600">Please wait while we load the digital whiteboard.</p>
    </div>
  );
}
