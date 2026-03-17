import type { Metadata } from 'next';
import { BRAND_NAME, BRAND_URL, BRAND_OG_IMAGE, BRAND_TWITTER } from '@/lib/brand';

export type GameSlug = 'ludo' | 'tictac' | 'chess' | 'snake';

export type GameSeoConfig = {
  slug: GameSlug;
  title: string;
  headline: string;
  description: string;
  genre: string[];
  keywords: string[];
  status: 'LIVE' | 'COMING SOON';
  image: string;
};

export const GAME_SEO: Record<GameSlug, GameSeoConfig> = {
  ludo: {
    slug: 'ludo',
    title: 'Ludo Royale',
    headline: 'Classic strategy board play with neon polish.',
    description:
      'Race to the center, block rivals, and win fast matches. Ludo Royale brings competitive, browser-first gameplay with rich visuals.',
    genre: ['Board', 'Strategy', 'Multiplayer'],
    keywords: ['ludo online', 'play ludo', 'ludo game', 'board game', 'multiplayer ludo', 'browser ludo'],
    status: 'LIVE',
    image: '/og/games/ludo.svg',
  },
  tictac: {
    slug: 'tictac',
    title: 'Tic Tac Toe',
    headline: 'Lightning-fast tactical duels.',
    description:
      'A classic tactical duel built for instant browser play. Outsmart opponents with perfect positioning and timing.',
    genre: ['Strategy', 'Puzzle', 'Casual'],
    keywords: ['tic tac toe online', 'play tic tac toe', 'xo game', 'strategy game', 'browser game'],
    status: 'LIVE',
    image: '/og/games/tictac.svg',
  },
  chess: {
    slug: 'chess',
    title: 'Nebula Chess',
    headline: 'Master openings and tactics with cinematic UI.',
    description:
      'Train tactics and openings in a cinematic chess arena designed for competitive browser play.',
    genre: ['Strategy', 'Board'],
    keywords: ['chess online', 'play chess', 'chess tactics', 'browser chess', 'strategy board game'],
    status: 'COMING SOON',
    image: '/og/games/chess.svg',
  },
  snake: {
    slug: 'snake',
    title: 'Neon Snake',
    headline: 'High-speed reflex action in a neon arena.',
    description:
      'A modern snake experience with neon visuals, responsive controls, and quick replay loops.',
    genre: ['Arcade', 'Casual'],
    keywords: ['snake game online', 'play snake', 'arcade browser game', 'neon snake'],
    status: 'COMING SOON',
    image: '/og/games/snake.svg',
  },
};

export const GAME_ROUTES = Object.keys(GAME_SEO) as GameSlug[];

const resolveImageUrl = (path: string) => {
  if (!path) return `${BRAND_URL}${BRAND_OG_IMAGE.startsWith('/') ? BRAND_OG_IMAGE : `/${BRAND_OG_IMAGE}`}`;
  if (path.startsWith('http')) return path;
  return `${BRAND_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export const buildGameMetadata = (locale: string, slug: GameSlug): Metadata => {
  const config = GAME_SEO[slug];
  const url = `${BRAND_URL}/${locale}/games/${slug}`;
  const image = resolveImageUrl(config.image || BRAND_OG_IMAGE);

  return {
    title: `${config.title} | ${BRAND_NAME} Games`,
    description: config.description,
    keywords: config.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      url,
      title: `${config.title} | ${BRAND_NAME}`,
      description: config.description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${config.title} - ${BRAND_NAME}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${config.title} | ${BRAND_NAME}`,
      description: config.description,
      images: [image],
      creator: BRAND_TWITTER,
    },
  };
};

export const buildGameJsonLd = (locale: string, slug: GameSlug) => {
  const config = GAME_SEO[slug];
  const url = `${BRAND_URL}/${locale}/games/${slug}`;
  const image = resolveImageUrl(config.image || BRAND_OG_IMAGE);

  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: config.title,
    description: config.description,
    url,
    image,
    inLanguage: locale,
    genre: config.genre,
    gamePlatform: 'Web Browser',
    applicationCategory: 'Game',
    operatingSystem: 'Any',
    publisher: {
      '@type': 'Organization',
      name: BRAND_NAME,
      url: BRAND_URL,
    },
  };
};

export const buildGamesHubMetadata = (locale: string): Metadata => {
  const url = `${BRAND_URL}/${locale}/games`;
  const image = resolveImageUrl(BRAND_OG_IMAGE);

  return {
    title: `${BRAND_NAME} Games | Play Online Browser Games`,
    description: 'Play premium browser games with instant launch, neon visuals, and competitive depth. No installs. Just play.',
    keywords: [
      'online games',
      'browser games',
      'play games online',
      'free games',
      'multiplayer games',
      'strategy games',
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      url,
      title: `${BRAND_NAME} Games`,
      description: 'Premium browser games with instant launch, sharp visuals, and competitive depth.',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${BRAND_NAME} Games`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${BRAND_NAME} Games`,
      description: 'Play premium browser games instantly. No installs.',
      images: [image],
      creator: BRAND_TWITTER,
    },
  };
};

export const buildGamesHubJsonLd = (locale: string) => {
  const url = `${BRAND_URL}/${locale}/games`;
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${BRAND_NAME} Games`,
    description: 'Premium browser games with instant launch and competitive depth.',
    url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: GAME_ROUTES.map((slug, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${BRAND_URL}/${locale}/games/${slug}`,
        name: GAME_SEO[slug].title,
      })),
    },
  };
};
