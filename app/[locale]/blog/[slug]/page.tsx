import React from 'react';
import { getDatabase } from '@/lib/mongodb';
import { Metadata } from 'next';
import { BlogPostClient } from '@/components/blog/BlogPostClient';
import { BRAND_URL } from '@/lib/brand';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDatabase();
  const post = await db.collection('blogs').findOne({ slug, status: 'published' });

  const baseUrl = BRAND_URL;

  if (!post) {
    return {
      title: 'Post Not Found',
      alternates: { canonical: `${baseUrl}/blog/${slug}` },
    };
  }

  return {
    title: post.title,
    description: post.excerpt || post.title,
    alternates: { canonical: `${baseUrl}/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDatabase();
  const post = await db.collection('blogs').findOne({ slug, status: 'published' });

  if (!post) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Post not found</h1>
        <p className="text-slate-400 mb-8">The article you are looking for has been moved or archived.</p>
        <Link href="/blog" className="flex items-center gap-2 text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Blog
        </Link>
      </div>
    );
  }

  // Serialize post for client
  const serializedPost = JSON.parse(JSON.stringify(post));

  return (
    <BlogPostClient post={serializedPost} slug={slug} content={post.markdown || ''} />
  );
}
