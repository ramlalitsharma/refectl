import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { serializeSiteSettings } from '@/lib/models/SiteSettings';

export const runtime = 'nodejs';

async function ensureAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  await requireAdmin();
}

export async function GET() {
  try {
    await ensureAdmin();

    const db = await getDatabase();
    const settings = await db
      .collection('siteSettings')
      .findOne({}, { sort: { updatedAt: -1 } });

    if (!settings) {
      const defaults = {
        branding: {
          siteName: 'AdaptIQ',
          tagline: 'AI-Powered Adaptive Learning Platform',
          primaryColor: '#0f766e',
          accentColor: '#10b981',
        },
        supportEmail: 'support@example.com',
        defaultLanguage: 'en',
        timezone: 'UTC',
        navigation: [
          { label: 'Courses', href: '/courses' },
          { label: 'Blog', href: '/blog' },
          { label: 'Pricing', href: '/pricing' },
        ],
        seo: {
          title: 'AdaptIQ – Adaptive Learning LMS',
          description: 'Adaptive learning platform delivering AI-powered courses, exams, and analytics.',
          keywords: ['adaptive learning', 'LMS', 'AI courses'],
        },
        footerHtml: '<p>© AdaptIQ. All rights reserved.</p>',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await db.collection('siteSettings').insertOne(defaults);
      return NextResponse.json({ settings: serializeSiteSettings({ ...defaults, _id: result.insertedId }) });
    }

    return NextResponse.json({ settings: serializeSiteSettings(settings as any) });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Site settings fetch error:', error);
    return NextResponse.json({ error: 'Failed to load site settings', message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureAdmin();

    const body = await req.json();
    const {
      branding,
      supportEmail,
      defaultLanguage,
      timezone,
      navigation,
      seo,
      footerHtml,
      published,
    } = body;

    if (!branding?.siteName) {
      return NextResponse.json({ error: 'Branding siteName is required' }, { status: 400 });
    }

    const now = new Date();
    const doc = {
      branding: {
        siteName: branding.siteName,
        tagline: branding.tagline || '',
        logoUrl: branding.logoUrl || '',
        faviconUrl: branding.faviconUrl || '',
        primaryColor: branding.primaryColor || '#0f766e',
        accentColor: branding.accentColor || '#10b981',
      },
      supportEmail: supportEmail || '',
      defaultLanguage: defaultLanguage || 'en',
      timezone: timezone || 'UTC',
      navigation: Array.isArray(navigation)
        ? navigation.map((link: any) => ({
            label: String(link.label || ''),
            href: String(link.href || '#'),
            target: link.target === '_blank' ? '_blank' : '_self',
          }))
        : [],
      seo: {
        title: seo?.title || '',
        description: seo?.description || '',
        keywords: Array.isArray(seo?.keywords)
          ? seo.keywords.map((k: any) => String(k)).filter(Boolean)
          : [],
        image: seo?.image || '',
      },
      footerHtml: footerHtml || '',
      publishedAt: published ? now : undefined,
      updatedAt: now,
    };

    const db = await getDatabase();
    const result = await db
      .collection('siteSettings')
      .findOneAndUpdate(
        {},
        {
          $set: doc,
          $setOnInsert: { createdAt: now },
        },
        {
          upsert: true,
          returnDocument: 'after',
        },
      );

    const updated = (result as any)?.value;
    return NextResponse.json({ settings: serializeSiteSettings(updated as any) });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Site settings update error:', error);
    return NextResponse.json({ error: 'Failed to update site settings', message: error.message }, { status: 500 });
  }
}
