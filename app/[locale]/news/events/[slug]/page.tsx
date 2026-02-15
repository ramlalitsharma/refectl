import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BRAND_URL } from '@/lib/brand';
import { NewsNavbar } from '@/components/layout/NewsNavbar';
import { NewsEventService } from '@/lib/news-event-service';
import { EventShowcase } from '@/components/news/EventShowcase';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const event = await NewsEventService.getEventBySlug(slug);
  if (!event) return { title: 'Event Not Found | Terai Times' };
  return {
    title: event.metaTitle || `${event.title} | Special Event | Terai Times`,
    description: event.metaDescription || event.summary || `Live special event updates from Terai Times.`,
    alternates: {
      canonical: `${BRAND_URL}/news/events/${event.slug}`,
    },
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await NewsEventService.getEventBySlug(slug);
  if (!event) notFound();

  return (
    <div className="news-page-shell min-h-screen pb-16">
      <NewsNavbar />
      <main className="container mx-auto px-4 pt-8 space-y-6">
        <Link href="/news" className="news-back-link">
          <ArrowLeft size={14} />
          Back to News
        </Link>
        <EventShowcase items={[event as any]} />
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-3xl font-black text-slate-900">{event.title}</h1>
          <p className="text-slate-600 mt-3 leading-relaxed">{event.summary}</p>
          <div className="mt-5 text-xs uppercase tracking-widest font-black text-slate-500">
            Scope: {event.scope === 'global' ? 'Global' : event.country || 'Country'} | Type: {event.eventType || 'Special'}
          </div>
        </section>
      </main>
    </div>
  );
}

