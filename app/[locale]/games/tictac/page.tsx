import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { TicTacToePage } from '@/games/tic-tac-toe/frontend/TicTacToePage';
import { BRAND_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Tic Tac Toe | ${BRAND_NAME} Games`,
  description: 'A lightning-fast tactical duel. Outsmart your opponent in a premium browser arena.',
};

export default async function TicTacToeRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <TicTacToePage />;
}
