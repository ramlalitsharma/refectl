import type { Metadata } from 'next';
import { FeatureModule } from './FeatureModule';

export abstract class SeoModule extends FeatureModule {
  protected normalizeFilter(value?: string): string {
    const raw = (value || '').trim();
    return raw.length ? raw : 'All';
  }

  abstract buildPageMetadata(params: Record<string, any>): Metadata | Promise<Metadata>;
}

