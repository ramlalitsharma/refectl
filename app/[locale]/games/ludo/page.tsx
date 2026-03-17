import { setRequestLocale } from 'next-intl/server';
import { LudoPage } from '@/games/ludo/frontend/LudoPage';
import { buildGameJsonLd, buildGameMetadata } from '@/games/shared/seo';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildGameMetadata(locale, 'ludo');
}

export default async function LudoRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const jsonLd = buildGameJsonLd(locale, 'ludo');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LudoPage />
    </>
  );
}
