import { setRequestLocale } from 'next-intl/server';
import { ChessPage } from '@/games/chess/frontend/ChessPage';
import { buildGameJsonLd, buildGameMetadata } from '@/games/shared/seo';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildGameMetadata(locale, 'chess');
}

export default async function ChessRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const jsonLd = buildGameJsonLd(locale, 'chess');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ChessPage />
    </>
  );
}
