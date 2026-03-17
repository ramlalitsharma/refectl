import { setRequestLocale } from 'next-intl/server';
import { TicTacToePage } from '@/games/tic-tac-toe/frontend/TicTacToePage';
import { buildGameJsonLd, buildGameMetadata } from '@/games/shared/seo';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildGameMetadata(locale, 'tictac');
}

export default async function TicTacToeRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const jsonLd = buildGameJsonLd(locale, 'tictac');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TicTacToePage />
    </>
  );
}
