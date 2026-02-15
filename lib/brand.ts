export const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || 'Refectl';
export const BRAND_SHORT_NAME = process.env.NEXT_PUBLIC_BRAND_SHORT_NAME || BRAND_NAME;
export const BRAND_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.refectl.com';
export const BRAND_TWITTER = process.env.NEXT_PUBLIC_BRAND_TWITTER || '@refectl';
export const BRAND_OG_IMAGE = process.env.NEXT_PUBLIC_BRAND_OG_IMAGE || '/logo.svg';

export function brandLogoUrl(): string {
  const path = BRAND_OG_IMAGE.startsWith('/') ? BRAND_OG_IMAGE : `/${BRAND_OG_IMAGE}`;
  return `${BRAND_URL}${path}`;
}

export async function resolveBaseUrl(): Promise<string> {
  try {
    const { headers } = await import('next/headers');
    const h = await headers();
    const proto = h.get('x-forwarded-proto') || 'http';
    const host = h.get('host');
    if (host) return `${proto}://${host}`;
  } catch { }
  return BRAND_URL;
}
