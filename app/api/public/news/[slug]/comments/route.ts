import { NextRequest } from 'next/server';
import {
  handlePublicNewsCommentsDelete,
  handlePublicNewsCommentsGet,
  handlePublicNewsCommentsPost,
} from '@/modules/terai-times/backend/http/publicNewsRoute';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return handlePublicNewsCommentsGet(req, params);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return handlePublicNewsCommentsPost(req, params);
}

export async function DELETE(req: NextRequest) {
  return handlePublicNewsCommentsDelete(req);
}
