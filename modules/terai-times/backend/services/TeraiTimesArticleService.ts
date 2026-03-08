import { FeatureModule } from '@/modules/core/shared';
import { NewsService } from '@/lib/news-service';
import { getNewsAuthorById } from '@/lib/news-authors';

export class TeraiTimesArticleService extends FeatureModule {
  constructor() {
    super('terai-times-article');
  }

  async getArticleBySlug(slug: string) {
    return NewsService.getNewsBySlug(slug);
  }

  async getTrending(limit = 8) {
    return NewsService.getTrendingNews(limit);
  }

  async getAuthor(authorId?: string) {
    if (!authorId) {
      return { authorId: 'system', name: 'Refectl Intelligence Agency', role: 'News Desk' } as any;
    }
    return getNewsAuthorById(authorId);
  }

  async getDetailPayload(slug: string) {
    const news = await this.getArticleBySlug(slug);
    if (!news) return { news: null, author: null, related: [], engagement: null };

    // Modular parallel fetching for the Engagement Hub
    const [trendingNews, recentNews, popularCategories, popularCountries, author] = await Promise.all([
      NewsService.getTrendingNews(4),
      NewsService.getRecentNews(4),
      NewsService.getPopularCategories(5),
      NewsService.getPopularCountries(5),
      this.getAuthor(news.author_id || 'system'),
    ]);

    const related = (Array.isArray(trendingNews) ? trendingNews : []).filter((n: any) => n.id !== news.id);

    const engagement = {
      popular: trendingNews.filter((n: any) => n.id !== news.id).slice(0, 3),
      recent: recentNews.filter((n: any) => n.id !== news.id).slice(0, 3),
      categories: popularCategories,
      countries: popularCountries
    };

    return { news, author, related, engagement };
  }
}

