import React from 'react';
import { getDatabase } from '@/lib/mongodb';
import { Metadata } from 'next';
import { BlogClientList } from '@/components/blog/BlogClientList';
import { BRAND_URL } from '@/lib/brand';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Blog | Refectl Insights",
    description: "Deep dives into AI pedagogy, adaptive learning, and platform updates.",
    alternates: {
      canonical: `/${locale}/blog`,
    },
  };
}

export default async function BlogIndexPage() {
  const db = await getDatabase();
  const posts = await db.collection('blogs')
    .find({ status: 'published' })
    .sort({ createdAt: -1 })
    .toArray();

  const serializedPosts = JSON.parse(JSON.stringify(posts));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": BRAND_URL
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": `${BRAND_URL}/blog`
              }
            ]
          })
        }}
      />
      <BlogClientList initialPosts={serializedPosts} />
    </>
  );
}



