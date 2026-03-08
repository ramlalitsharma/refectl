'use server';

import { NewsService } from '@/lib/news-service';
import { requireContentWriter } from '@/lib/admin-check';
import { revalidatePath } from 'next/cache';
import { verifySourceSafety } from '@/lib/source-safety';
import { attachNewsImageMeta, inferNewsImageMeta } from '@/lib/news-image-metadata';

export async function createNews(formData: FormData) {
    await requireContentWriter();

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const summary = formData.get('summary') as string;
    const cover_image = formData.get('cover_image') as string;
    const status = formData.get('status') as 'draft' | 'published';
    const category = formData.get('category') as string;
    const country = formData.get('country') as string;
    const is_trending = formData.get('is_trending') === 'true';
    const tags = (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [];
    const source_url = formData.get('source_url') as string;
    const source_name = formData.get('source_name') as string;
    let finalStatus: any = status;
    const finalTags = [...tags];

    if (source_url) {
        const sourceCheck = await verifySourceSafety({ sourceUrl: source_url, sourceName: source_name });
        if (sourceCheck.sourceHost) {
            finalTags.push(`source_host:${sourceCheck.sourceHost}`);
        }
        if (sourceCheck.sourceVerdict === 'blocked' || sourceCheck.safeBrowsingVerdict === 'unsafe') {
            return { error: 'Source URL failed safety validation.' };
        }
        if (sourceCheck.sourceVerdict === 'trusted') {
            finalTags.push('source_trusted');
        } else {
            finalTags.push('source_unverified');
            if (status === 'published') {
                finalStatus = 'pending_approval';
            }
        }
    } else {
        finalTags.push('source_missing');
    }

    const imageMeta = inferNewsImageMeta({
        coverImage: cover_image,
        sourceName: source_name,
        sourceUrl: source_url,
    });
    const decoratedTags = attachNewsImageMeta(finalTags, imageMeta);

    // Generate slug from title if not provided
    let slug = formData.get('slug') as string;
    if (!slug) {
        slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    try {
        const { auth } = await import('@clerk/nextjs/server');
        const { userId } = await auth();

        await NewsService.upsertNews({
            title,
            slug,
            content,
            summary,
            cover_image,
            status: finalStatus,
            category,
            country,
            is_trending,
            tags: decoratedTags,
            source_url,
            source_name,
            author_id: userId || 'system',
        });
    } catch (e) {
        console.error(e);
        return { error: 'Failed to create news' };
    }

    revalidatePath('/admin/studio/news');
    revalidatePath('/news');
    return { ok: true, slug };
}

export async function updateNews(id: string, formData: FormData) {
    await requireContentWriter();

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const summary = formData.get('summary') as string;
    const cover_image = formData.get('cover_image') as string;
    const status = formData.get('status') as 'draft' | 'published';
    const category = formData.get('category') as string;
    const country = formData.get('country') as string;
    const is_trending = formData.get('is_trending') === 'true';
    const tags = (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [];
    let slug = (formData.get('slug') as string) || '';
    const source_url = formData.get('source_url') as string;
    const source_name = formData.get('source_name') as string;
    let finalStatus: any = status;
    const finalTags = [...tags];

    if (source_url) {
        const sourceCheck = await verifySourceSafety({ sourceUrl: source_url, sourceName: source_name });
        if (sourceCheck.sourceHost) {
            finalTags.push(`source_host:${sourceCheck.sourceHost}`);
        }
        if (sourceCheck.sourceVerdict === 'blocked' || sourceCheck.safeBrowsingVerdict === 'unsafe') {
            return { error: 'Source URL failed safety validation.' };
        }
        if (sourceCheck.sourceVerdict === 'trusted') {
            finalTags.push('source_trusted');
        } else {
            finalTags.push('source_unverified');
            if (status === 'published') {
                finalStatus = 'pending_approval';
            }
        }
    } else {
        finalTags.push('source_missing');
    }

    const imageMeta = inferNewsImageMeta({
        coverImage: cover_image,
        sourceName: source_name,
        sourceUrl: source_url,
    });
    const decoratedTags = attachNewsImageMeta(finalTags, imageMeta);

    if (!slug) {
        slug = (title || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    try {
        await NewsService.upsertNews({
            id,
            title,
            slug,
            content,
            summary,
            cover_image,
            status: finalStatus,
            category,
            country,
            is_trending,
            tags: decoratedTags,
            source_url,
            source_name
        });
    } catch (e) {
        console.error(e);
        return { error: 'Failed to update news' };
    }

    revalidatePath('/admin/studio/news');
    revalidatePath('/news');
    return { ok: true, slug };
}

export async function deleteNews(id: string) {
    await requireContentWriter();
    try {
        await NewsService.deleteNews(id);
        revalidatePath('/admin/studio/news');
    } catch {
        return { error: 'Failed to delete news' };
    }
}

function normalizeTags(tags?: string[] | string): string[] {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags.filter(Boolean);
    return tags.split(',').map((t) => t.trim()).filter(Boolean);
}

function finalizeTags(tags: string[], ...remove: string[]) {
    const filtered = tags.filter((t) => !remove.includes(t));
    return Array.from(new Set(filtered));
}

export async function approveSourceTrustAction(formData: FormData) {
    await requireContentWriter();
    const id = String(formData.get('id') || '').trim();
    if (!id) return { error: 'Missing id' };

    const item = await NewsService.getNewsById(id);
    if (!item) return { error: 'News not found' };

    const tags = normalizeTags(item.tags);
    const nextTags = finalizeTags(
        [...tags, 'source_trusted'],
        'source_unverified',
        'source_blocked',
        'source_missing'
    );
    const nextStatus = (item.status || '').toLowerCase() === 'pending_approval' ? 'published' : item.status;

    await NewsService.upsertNews({
        id,
        tags: nextTags,
        status: nextStatus,
    });

    revalidatePath('/admin/studio/news');
    if (item.slug) revalidatePath(`/news/${item.slug}`);
    return { ok: true };
}

export async function blockSourceAction(formData: FormData) {
    await requireContentWriter();
    const id = String(formData.get('id') || '').trim();
    if (!id) return { error: 'Missing id' };

    const item = await NewsService.getNewsById(id);
    if (!item) return { error: 'News not found' };

    const tags = normalizeTags(item.tags);
    const nextTags = finalizeTags(
        [...tags, 'source_blocked'],
        'source_trusted',
        'source_unverified'
    );

    await NewsService.upsertNews({
        id,
        tags: nextTags,
        status: 'draft',
    });

    revalidatePath('/admin/studio/news');
    if (item.slug) revalidatePath(`/news/${item.slug}`);
    return { ok: true };
}
