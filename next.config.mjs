import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // pdfjs-dist requires canvas on the server; alias it to empty module to prevent errors
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
    }
    return config;
  },
  async redirects() {
    return [
      { source: '/news', destination: '/en/news', permanent: false },
      { source: '/news/:path*', destination: '/en/news/:path*', permanent: false },
    ];
  },
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
      {
        protocol: "https",
        hostname: "img1.hscicdn.com",
      },
      {
        protocol: "https",
        hostname: "**.hscicdn.com",
      },
      {
        protocol: "https",
        hostname: "**.independent.co.uk",
      },
      {
        protocol: "https",
        hostname: "static.independent.co.uk",
      },
      {
        protocol: "https",
        hostname: "**.reuters.com",
      },
      {
        protocol: "https",
        hostname: "**.theguardian.com",
      },
      {
        protocol: "https",
        hostname: "**.cnn.com",
      },
      {
        protocol: "https",
        hostname: "**.abcnews.com",
      },
      {
        protocol: "https",
        hostname: "**.apnews.com",
      },
      {
        protocol: "https",
        hostname: "**.nytimes.com",
      },
      {
        protocol: "https",
        hostname: "**.bloomberg.com",
      },
      {
        protocol: "https",
        hostname: "**.aljazeera.net",
      },
      {
        protocol: "https",
        hostname: "economictimes.indiatimes.com",
      },
      {
        protocol: "https",
        hostname: "**.indiatimes.com",
      },
      {
        protocol: "https",
        hostname: "www.scmp.com",
      },
      {
        protocol: "https",
        hostname: "www.dawn.com",
      },
      {
        protocol: "https",
        hostname: "www.prothomalo.com",
      },
      {
        protocol: "https",
        hostname: "www.asahi.com",
      },
      {
        protocol: "https",
        hostname: "**.elpais.com",
      },
      {
        protocol: "https",
        hostname: "**.lemonde.fr",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "1gb",
    },
  },
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
