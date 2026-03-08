import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { BlogPostClient } from '@/components/blog/BlogPostClient';
import { BlogsPublicService, BlogsSeoService } from '@/modules/blogs/backend/services';

export async function generateBlogDetailMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const seo = new BlogsSeoService();
  return seo.buildPostMetadata(slug);
}

export async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = new BlogsPublicService();
  const post = await service.getPublishedPostBySlug(slug);

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

  const serializedPost = JSON.parse(JSON.stringify(post));
  return <BlogPostClient post={serializedPost} slug={slug} content={post.markdown || ''} />;
}

