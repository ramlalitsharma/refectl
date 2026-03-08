import { NextRequest } from 'next/server';
import {
  handleDiscussionByIdGet,
  handleDiscussionReplyPost,
} from '@/modules/forum/backend/http/discussionsRoute';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  return handleDiscussionByIdGet(req, params);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  return handleDiscussionReplyPost(req, params);
}

