import { setRequestLocale } from 'next-intl/server';
import { GamesHome } from '@/games/portal/frontend/GamesHome';
import { buildGamesHubJsonLd, buildGamesHubMetadata } from '@/games/shared/seo';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildGamesHubMetadata(locale);
}

export default async function GamesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const jsonLd = buildGamesHubJsonLd(locale);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GamesHome locale={locale} />
    </>
  );
}
