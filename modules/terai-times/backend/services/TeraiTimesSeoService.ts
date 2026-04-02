import type { Metadata } from 'next';
import { BRAND_URL } from '@/lib/brand';
import { locales } from '@/lib/navigation';
import { SeoModule } from '@/modules/core/shared';
import { TeraiTimesArticleService } from './TeraiTimesArticleService';

export class TeraiTimesSeoService extends SeoModule {
  private readonly articleService = new TeraiTimesArticleService();

  constructor() {
    super('terai-times-seo');
  }

  async buildPageMetadata(params: Record<string, any> & { locale?: string }): Promise<Metadata> {
    const category = this.normalizeFilter(params?.category as string | undefined);
    const country = this.normalizeFilter(params?.country as string | undefined);
    const locale = (params?.locale as string) || 'en';
    const canonicalUrl = `${BRAND_URL}/${locale}/news`;

    const title =
      category !== 'All'
        ? `${category} News | Terai Times Global Desk`
        : country !== 'All'
          ? `${country} News | Terai Times Global Desk`
          : 'Terai Times News | Global Intelligence, Live Coverage, Market Pulse';

    const description =
      category !== 'All'
        ? `Latest ${category} news, live updates, expert analysis, and strategic context from the Terai Times global desk.`
        : country !== 'All'
          ? `Breaking news, premium analysis, and strategic updates from ${country} with world-class coverage from Terai Times.`
          : 'World-class news coverage, global market intelligence, strategic analysis, and premium live updates from Terai Times.';

    const keywords = [
      'Terai Times',
      'global news',
      'breaking news',
      'live news updates',
      'market intelligence',
      'world news analysis',
      category !== 'All' ? `${category.toLowerCase()} news` : null,
      country !== 'All' ? `${country.toLowerCase()} news` : null,
    ].filter(Boolean) as string[];

    return {
      title,
      description,
      keywords,
      alternates: {
        canonical: canonicalUrl,
        languages: Object.fromEntries(
          locales.map((l) => [l, `${BRAND_URL}/${l}/news`])
        ),
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        type: 'website',
        siteName: 'Terai Times',
        images: [
          {
            url: `${BRAND_URL}/og-news.png`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`${BRAND_URL}/og-news.png`],
      },
    };
  }

  async buildArticleMetadata(slug: string, locale: string = 'en'): Promise<Metadata> {
    try {
      const news = await this.articleService.getArticleBySlug(slug);
      if (!news) return { title: 'Intelligence Not Found' };
      const author = await this.articleService.getAuthor(news.author_id || 'system');
      const publishedDate = news.published_at || news.created_at;
      const imageUrl = news.cover_image || `${BRAND_URL}/og-news.png`;

      return {
        title: `${news.title} | Terai Times News`,
        description: news.summary,
        alternates: {
          canonical: `${BRAND_URL}/${locale}/news/${slug}`,
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BRAND_URL}/${l}/news/${slug}`])
          ),
        },
        openGraph: {
          title: news.title,
          description: news.summary,
          url: `${BRAND_URL}/${locale}/news/${slug}`,
          type: 'article',
          publishedTime: publishedDate,
          authors: [author.name || 'Refectl Intelligence Agency'],
          siteName: 'Terai Times',
          images: [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: news.title,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title: news.title,
          description: news.summary,
          images: [imageUrl],
        },
      };
    } catch {
      return { title: 'Terai Times News' };
    }
  }

  /**
   * Generates NewsArticle JSON-LD for Search Engines
   */
  async getArticleSchema(slug: string, locale: string = 'en') {
    try {
      const news = await this.articleService.getArticleBySlug(slug);
      if (!news) return null;
      const author = await this.articleService.getAuthor(news.author_id || 'system');
      const publishedDate = news.published_at || news.created_at;

      return {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: news.title,
        description: news.summary,
        image: [news.cover_image].filter(Boolean),
        datePublished: publishedDate,
        dateModified: news.updated_at || publishedDate,
        author: [
          {
            '@type': 'Person',
            name: author.name || 'Refectl Intelligence Agency',
            url: `${BRAND_URL}/${locale}/news/author/${author.id || 'system'}`,
          },
        ],
        publisher: {
          '@type': 'Organization',
          name: 'Terai Times',
          logo: {
            '@type': 'ImageObject',
            url: `${BRAND_URL}/logo-premium.png`,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${BRAND_URL}/${locale}/news/${slug}`,
        },
      };
    } catch {
      return null;
    }
  }

  /**
   * Generates CollectionPage JSON-LD for the News Landing
   */
  getLandingSchema(locale: string = 'en') {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Terai Times Global Intelligence Desk',
      description: 'World-class news coverage and strategic market intelligence.',
      url: `${BRAND_URL}/${locale}/news`,
      publisher: {
        '@type': 'Organization',
        name: 'Terai Times',
      },
    };
  }
}
