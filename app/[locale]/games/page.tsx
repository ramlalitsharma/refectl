import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { GamesHome } from '@/games/portal/frontend/GamesHome';
import { BRAND_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Games | ${BRAND_NAME}`,
  description: 'Play premium browser games with instant launch, neon visuals, and competitive depth.',
};

export default async function GamesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <GamesHome locale={locale} />;
}
