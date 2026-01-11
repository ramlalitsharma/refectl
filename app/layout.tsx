import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";
import Script from "next/script";
import { CookieConsent } from '@/components/CookieConsent';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { GlobalBackButton } from '@/components/layout/GlobalBackButton';
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';
import "./globals.css";
import "@/styles/md-editor.css";
import { ToastProvider } from '@/components/ui/ToastManager';
import { Analytics } from "@vercel/analytics/next";
import { BRAND_NAME, BRAND_URL, BRAND_TWITTER, BRAND_OG_IMAGE, brandLogoUrl } from '@/lib/brand';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND_NAME} - AI-Powered Adaptive Learning Platform`,
    template: `%s | ${BRAND_NAME}`,
  },
  description: `Transform your learning with AI-orchestrated adaptive quizzes that evolve in real-time. Get personalized learning paths, predict knowledge gaps with 95% accuracy, and master any subject faster with ${BRAND_NAME}.`,
  keywords: ["adaptive learning", "AI quizzes", "online education", "learning platform", "adaptive testing", "personalized learning", "quiz generator", "education technology"],
  authors: [{ name: BRAND_NAME }],
  creator: BRAND_NAME,
  publisher: BRAND_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(BRAND_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BRAND_URL,
    title: `${BRAND_NAME} - AI-Powered Adaptive Learning Platform`,
    description: "Transform your learning with AI-orchestrated adaptive quizzes, real-time performance tracking, and personalized learning paths.",
    siteName: BRAND_NAME,
    images: [
      {
        url: BRAND_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} - Adaptive Learning Platform`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} - AI-Powered Adaptive Learning Platform`,
    description: "Transform your learning with AI-orchestrated adaptive quizzes and personalized learning paths.",
    images: [BRAND_OG_IMAGE],
    creator: BRAND_TWITTER,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: BRAND_OG_IMAGE, type: 'image/svg+xml' },
    ],
    shortcut: ['/favicon.svg'],
    apple: [{ url: BRAND_OG_IMAGE }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <meta name="google-adsense-account" content="ca-pub-8149507764464883" />
          <link rel="preconnect" href="https://api.openai.com" />
          <link rel="preconnect" href="https://img.clerk.com" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'EducationalOrganization',
                name: BRAND_NAME,
                description: 'AI-powered adaptive learning platform with real-time quiz adaptation',
                url: BRAND_URL,
                logo: brandLogoUrl(),
                sameAs: [
                  `https://twitter.com/${BRAND_TWITTER.replace('@', '')}`,
                ],
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
                },
              }),
            }}
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider>
            <ToastProvider>
              <GlobalBackButton />
              <div className="flex min-h-screen flex-col bg-[#f4f6f9] text-slate-900">
                <Suspense>
                  <Navbar />
                </Suspense>
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
              <CookieConsent />
              <ServiceWorkerRegistration />
            </ToastProvider>
          </ThemeProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider >
  );
}
