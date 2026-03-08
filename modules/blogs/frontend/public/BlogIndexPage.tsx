import React from 'react';
import type { Metadata } from 'next';
import { BRAND_URL } from '@/lib/brand';
import { BlogClientList } from '@/components/blog/BlogClientList';
import { BlogsPublicService, BlogsSeoService } from '@/modules/blogs/backend/services';

export async function generateBlogIndexMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = new BlogsSeoService();
  return seo.buildPageMetadata({ locale });
}

export async function BlogIndexPage() {
  const service = new BlogsPublicService();
  const posts = await service.getPublishedPosts();
  const serializedPosts = JSON.parse(JSON.stringify(posts));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: BRAND_URL,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: `${BRAND_URL}/blog`,
              },
            ],
          }),
        }}
      />
      <BlogClientList initialPosts={serializedPosts} />
    </>
  );
}

