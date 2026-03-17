import { setRequestLocale } from 'next-intl/server';
import { SnakePage } from '@/games/snake/frontend/SnakePage';
import { buildGameJsonLd, buildGameMetadata } from '@/games/shared/seo';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildGameMetadata(locale, 'snake');
}

export default async function SnakeRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const jsonLd = buildGameJsonLd(locale, 'snake');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SnakePage />
    </>
  );
}
