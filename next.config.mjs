import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "**.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
      },
      {
        protocol: "https",
        hostname: "th.bing.com",
      },
      {
        protocol: "https",
        hostname: "www.bing.com",
      },
      {
        protocol: "https",
        hostname: "*.bing.com",
      },
      {
        protocol: "https",
        hostname: "**.static.aljazeera.com",
      },
      {
        protocol: "https",
        hostname: "**.bbci.co.uk",
      },
      {
        protocol: "https",
        hostname: "singhadarbar.com",
      },
      {
        protocol: "https",
        hostname: "**.onlinekhabar.com",
      },
      {
        protocol: "https",
        hostname: "onlinekhabar.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "external-content.duckduckgo.com",
      },
      {
        protocol: "https",
        hostname: "**.duckduckgo.com",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingRoot: process.cwd(),
  experimental: {
    serverActions: {
      bodySizeLimit: "1gb",
    },
  },
};

export default withNextIntl(nextConfig);
