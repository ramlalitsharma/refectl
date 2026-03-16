import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { LudoPage } from '@/games/ludo/frontend/LudoPage';
import { BRAND_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Ludo Royale | ${BRAND_NAME} Games`,
  description: 'Race to the center in a competitive, neon-lit Ludo arena built for instant browser play.',
};

export default async function LudoRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LudoPage />;
}
