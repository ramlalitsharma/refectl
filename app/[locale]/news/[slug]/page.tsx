import type { Metadata } from 'next';
import {
  NewsDetailPage as NewsDetailModulePage,
  generateNewsDetailMetadata,
} from '@/modules/terai-times/frontend/public';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string; locale: string }> }
): Promise<Metadata> {
  return generateNewsDetailMetadata({ params });
}

export default async function NewsDetailPageRoute({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  return NewsDetailModulePage({ params });
}
