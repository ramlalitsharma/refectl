import { News } from './models/News';

const SYSTEM_TAG_PREFIXES = [
  'quality_score:',
  'source_host:',
  'trust_score:',
  'verification_count:',
  'neutrality_score:',
  'image_origin:',
  'image_credit:',
  'image_caption:',
  'image_source_url:',
  'image_license:',
];

const SYSTEM_TAGS = new Set([
  'source_trusted',
  'source_unverified',
  'source_missing',
  'source_blocked',
  'multi_source_verified',
  'manual_publish_override',
]);

type ImageOrigin = 'ai' | 'source' | 'library' | 'unknown';
type ImageLicense = 'owned' | 'partner' | 'creative_commons' | 'public_domain' | 'unknown';

export type NewsImageMeta = {
  origin: ImageOrigin;
  credit?: string;
  caption?: string;
  sourceUrl?: string;
  license: ImageLicense;
};

function encodeTagValue(value: string): string {
  return encodeURIComponent(value.trim());
}

function decodeTagValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function readTag(tags: string[], prefix: string): string | undefined {
  const hit = tags.find((tag) => tag.startsWith(prefix));
  if (!hit) return undefined;
  return decodeTagValue(hit.slice(prefix.length));
}

export function extractNewsImageMeta(tags?: string[]): NewsImageMeta {
  const normalized = tags || [];
  return {
    origin: (readTag(normalized, 'image_origin:') as ImageOrigin) || 'unknown',
    credit: readTag(normalized, 'image_credit:'),
    caption: readTag(normalized, 'image_caption:'),
    sourceUrl: readTag(normalized, 'image_source_url:'),
    license: (readTag(normalized, 'image_license:') as ImageLicense) || 'unknown',
  };
}

export function attachNewsImageMeta(tags: string[] = [], meta: Partial<NewsImageMeta>): string[] {
  const cleaned = tags.filter(
    (tag) =>
      !tag.startsWith('image_origin:') &&
      !tag.startsWith('image_credit:') &&
      !tag.startsWith('image_caption:') &&
      !tag.startsWith('image_source_url:') &&
      !tag.startsWith('image_license:')
  );

  if (meta.origin) cleaned.push(`image_origin:${encodeTagValue(meta.origin)}`);
  if (meta.credit) cleaned.push(`image_credit:${encodeTagValue(meta.credit)}`);
  if (meta.caption) cleaned.push(`image_caption:${encodeTagValue(meta.caption)}`);
  if (meta.sourceUrl) cleaned.push(`image_source_url:${encodeTagValue(meta.sourceUrl)}`);
  if (meta.license) cleaned.push(`image_license:${encodeTagValue(meta.license)}`);

  return Array.from(new Set(cleaned));
}

export function getRenderableNewsImage(news: Partial<News>): {
  src?: string;
  credit: string;
  caption?: string;
  sourceUrl?: string;
  isExternalSource: boolean;
} {
  const meta = extractNewsImageMeta(news.tags || []);
  const isSourceLicensed =
    meta.origin === 'source' &&
    (meta.license === 'partner' || meta.license === 'creative_commons' || meta.license === 'public_domain');

  if (isSourceLicensed && news.cover_image) {
    return {
      src: news.cover_image,
      credit: meta.credit || news.source_name || 'Source image',
      caption: meta.caption,
      sourceUrl: meta.sourceUrl || news.source_url,
      isExternalSource: true,
    };
  }

  if (news.cover_image) {
    return {
      src: news.cover_image,
      credit: meta.credit || (meta.origin === 'library' ? 'Licensed image library' : 'Terai Times AI Desk'),
      caption: meta.caption,
      sourceUrl: meta.sourceUrl,
      isExternalSource: false,
    };
  }

  return {
    src: undefined,
    credit: 'Terai Times',
    caption: meta.caption,
    sourceUrl: meta.sourceUrl,
    isExternalSource: false,
  };
}

export function inferNewsImageMeta(params: {
  coverImage?: string;
  sourceName?: string;
  sourceUrl?: string;
}): Partial<NewsImageMeta> {
  const coverImage = String(params.coverImage || '').trim();
  if (!coverImage) {
    return {
      origin: 'unknown',
      credit: 'Terai Times',
      license: 'unknown',
      sourceUrl: params.sourceUrl,
    };
  }

  const lowered = coverImage.toLowerCase();
  if (
    lowered.startsWith('/uploads') ||
    lowered.includes('supabase.co/storage') ||
    lowered.startsWith('/news-')
  ) {
    return {
      origin: 'ai',
      credit: 'Terai Times AI Desk',
      license: 'owned',
      sourceUrl: params.sourceUrl,
    };
  }

  if (/unsplash\.com|pexels\.com|pixabay\.com/.test(lowered)) {
    return {
      origin: 'library',
      credit: params.sourceName || 'Licensed image library',
      license: 'partner',
      sourceUrl: coverImage,
    };
  }

  return {
    origin: 'source',
    credit: params.sourceName || 'Source image',
    license: 'unknown',
    sourceUrl: params.sourceUrl || coverImage,
  };
}

export function isSystemNewsTag(tag: string): boolean {
  return SYSTEM_TAGS.has(tag) || SYSTEM_TAG_PREFIXES.some((prefix) => tag.startsWith(prefix));
}

export function getPublicNewsTags(tags?: string[]): string[] {
  return (tags || []).filter((tag) => !isSystemNewsTag(tag));
}
