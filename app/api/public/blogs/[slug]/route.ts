import { NextRequest } from 'next/server';
import { handlePublicBlogBySlugGet } from '@/modules/blogs/backend/http/publicBlogsRoute';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    return handlePublicBlogBySlugGet(req, params);
}
