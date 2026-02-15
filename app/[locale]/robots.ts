import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.refectl.com';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/_next/static/', '/_next/image/'],
      disallow: ['/api/', '/dashboard/', '/admin/', '/settings/', '/onboarding/', '/studio/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
