import type { Metadata } from 'next';
import {
  BlogIndexPage as BlogIndexModulePage,
  generateBlogIndexMetadata,
} from '@/modules/blogs/frontend/public';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return generateBlogIndexMetadata({ params });
}

export default async function BlogIndexPageRoute() {
  return BlogIndexModulePage();
}



