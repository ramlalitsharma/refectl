import type { Metadata } from 'next';
import { SeoModule } from '@/modules/core/shared';

export class ForgeShopSeoService extends SeoModule {
  constructor() {
    super('forge-shop-seo');
  }

  buildShopIndexMetadata(locale: string): Metadata {
    return {
      title: 'Forge Shop | Refectl',
      description:
        'Discover AI tools, automation products, and workspace utilities in the Refectl Forge Shop.',
      alternates: {
        canonical: `/${locale}/shop`,
      },
    };
  }
}
