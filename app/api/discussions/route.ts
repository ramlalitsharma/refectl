import { NextRequest } from 'next/server';
import { handleDiscussionsGet, handleDiscussionsPost } from '@/modules/forum/backend/http/discussionsRoute';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleDiscussionsGet(req);
}

export async function POST(req: NextRequest) {
  return handleDiscussionsPost(req);
}

