import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ChessPage } from '@/games/chess/frontend/ChessPage';
import { BRAND_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Nebula Chess | ${BRAND_NAME} Games`,
  description: 'Master openings and tactics with a cinematic chess arena built for the browser.',
};

export default async function ChessRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ChessPage />;
}
