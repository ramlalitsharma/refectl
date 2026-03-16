import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { SnakePage } from '@/games/snake/frontend/SnakePage';
import { BRAND_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Neon Snake | ${BRAND_NAME} Games`,
  description: 'High-speed reflex play in a neon arena. A modern snake experience for browsers.',
};

export default async function SnakeRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SnakePage />;
}
