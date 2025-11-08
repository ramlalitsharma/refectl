export interface NavigationLink {
  label: string;
  href: string;
  target?: '_self' | '_blank';
}

export interface SiteSeoDefaults {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
}

export interface SiteBranding {
  siteName: string;
  tagline?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  accentColor?: string;
}

export interface SiteSettings {
  _id?: any;
  branding: SiteBranding;
  supportEmail?: string;
  defaultLanguage?: string;
  timezone?: string;
  navigation: NavigationLink[];
  seo: SiteSeoDefaults;
  footerHtml?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export function serializeSiteSettings(settings: SiteSettings & { _id?: any }) {
  return {
    id: settings._id ? String(settings._id) : undefined,
    branding: settings.branding,
    supportEmail: settings.supportEmail || '',
    defaultLanguage: settings.defaultLanguage || 'en',
    timezone: settings.timezone || 'UTC',
    navigation: settings.navigation || [],
    seo: settings.seo || { title: '', description: '', keywords: [] },
    footerHtml: settings.footerHtml || '',
    publishedAt:
      settings.publishedAt instanceof Date
        ? settings.publishedAt.toISOString()
        : settings.publishedAt,
    createdAt:
      settings.createdAt instanceof Date
        ? settings.createdAt.toISOString()
        : settings.createdAt,
    updatedAt:
      settings.updatedAt instanceof Date
        ? settings.updatedAt.toISOString()
        : settings.updatedAt,
  };
}
