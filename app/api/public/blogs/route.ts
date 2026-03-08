import { handlePublicBlogsGet } from '@/modules/blogs/backend/http/publicBlogsRoute';

export const dynamic = 'force-dynamic';

export async function GET() {
    return handlePublicBlogsGet();
}
