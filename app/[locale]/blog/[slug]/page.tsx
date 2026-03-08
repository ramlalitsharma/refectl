import type { Metadata } from 'next';
import {
  BlogDetailPage as BlogDetailModulePage,
  generateBlogDetailMetadata,
} from '@/modules/blogs/frontend/public';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return generateBlogDetailMetadata({ params });
}

export default async function BlogPostPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  return BlogDetailModulePage({ params });
}
