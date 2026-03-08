import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsImage } from './NewsImage';
import { CountryDropdown } from './CountryDropdown';

type EngagementNewsItem = {
  id: string;
  slug: string;
  title: string;
  category?: string;
  country?: string;
  summary?: string;
  cover_image?: string;
};

type EngagementData = {
  recent?: EngagementNewsItem[];
  popular?: EngagementNewsItem[];
  countries?: string[];
};

export function EngagementHubPanel({ engagement }: { engagement: EngagementData | null | undefined }) {
  if (!engagement) return null;

  const latestNews = engagement.recent || [];
  const trendingNews = engagement.popular || [];

  return (
    <section className="nda-more-news-panel font-sans w-full max-w-[1200px] mx-auto px-4 md:px-8 py-10">
      {latestNews.length > 0 && (
        <div className="mb-14">
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
            <h2 className="text-[1.35rem] font-bold text-[#111111] dark:text-white">Read Next</h2>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded text-gray-400 hover:text-[#111111] dark:hover:text-white transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded text-gray-400 hover:text-[#111111] dark:hover:text-white transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {latestNews.slice(0, 4).map((n) => (
              <Link key={n.id} href={`/news/${n.slug}`} className="group flex flex-col gap-2">
                <div className="w-full aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-900">
                  <NewsImage
                    src={n.cover_image || '/news-placeholder.jpg'}
                    alt={n.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-[#555] dark:text-gray-400 uppercase">{n.category || 'World'}</span>
                  <h3 className="font-bold text-[15px] leading-tight text-[#111] dark:text-gray-100 mt-0.5 group-hover:underline decoration-1 underline-offset-2">
                    {n.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {trendingNews.length > 0 && (
        <div>
          <div className="mb-4 border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center gap-2">
            <CountryDropdown
              initialCountries={
                Array.from(new Set([...trendingNews.map((n) => n.country).filter(Boolean), ...(engagement.countries || [])])) as string[]
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <Link href={`/news/${trendingNews[0].slug}`} className="group flex flex-col gap-3">
              <div className="w-full aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-900">
                <NewsImage
                  src={trendingNews[0].cover_image || '/news-placeholder.jpg'}
                  alt={trendingNews[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div>
                <h3 className="font-bold text-[clamp(1.8rem,3vw,2.4rem)] leading-[1.1] tracking-tight text-[#111] dark:text-white group-hover:underline decoration-2 underline-offset-4 mb-2 text-balance">
                  {trendingNews[0].title}
                </h3>
                <div className="text-[12px] text-[#555] dark:text-gray-400 mb-2">
                  <span>{trendingNews[0].country || 'Global'}</span>
                  <span className="mx-1.5">·</span>
                  <span>Updated recently</span>
                </div>
                <p className="text-[15px] text-[#333] dark:text-gray-300 leading-relaxed font-serif max-w-[95%]">
                  {trendingNews[0].summary ||
                    'A significant geopolitical development requires attention from global markets. Click to read the full intelligence brief.'}
                </p>
              </div>
            </Link>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
              {trendingNews.slice(1, 5).map((n) => (
                <Link key={n.id} href={`/news/${n.slug}`} className="group flex flex-col gap-2">
                  <div className="w-full aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <NewsImage
                      src={n.cover_image || '/news-placeholder.jpg'}
                      alt={n.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#555] dark:text-gray-400 capitalize">{n.category || 'News'}</span>
                    <h4 className="font-bold text-[16px] leading-[1.25] text-[#111] dark:text-white mt-0.5 group-hover:underline decoration-1 underline-offset-2">
                      {n.title}
                    </h4>
                    <div className="text-[11px] text-[#555] dark:text-gray-400 mt-1.5">Updated recently</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
