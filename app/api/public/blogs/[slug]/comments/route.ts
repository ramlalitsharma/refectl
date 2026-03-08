import { NextRequest } from 'next/server';
import {
    handlePublicBlogCommentsDelete,
    handlePublicBlogCommentsGet,
    handlePublicBlogCommentsPost,
} from '@/modules/blogs/backend/http/publicBlogsRoute';

export const dynamic = 'force-dynamic';

// GET: Fetch hierarchical comments for a blog post
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    return handlePublicBlogCommentsGet(req, params);
}

// POST: Add a new comment or reply
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    return handlePublicBlogCommentsPost(req, params);
}

// DELETE: Remove a comment (requires ownership or admin)
// Note: In a production app, we might just "soft delete" to keep the thread structure
export async function DELETE(req: NextRequest) {
    return handlePublicBlogCommentsDelete(req);
}
