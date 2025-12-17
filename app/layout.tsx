import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";
import { CookieConsent } from '@/components/CookieConsent';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';
import "./globals.css";
import "@/styles/md-editor.css";

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
    default: "AdaptIQ - AI-Powered Adaptive Learning Platform",
    template: "%s | AdaptIQ",
  },
  description: "Transform your learning with AI-orchestrated adaptive quizzes that evolve in real-time. Get personalized learning paths, predict knowledge gaps with 95% accuracy, and master any subject faster with AdaptIQ.",
  keywords: ["adaptive learning", "AI quizzes", "online education", "learning platform", "adaptive testing", "personalized learning", "quiz generator", "education technology"],
  authors: [{ name: "AdaptIQ" }],
  creator: "AdaptIQ",
  publisher: "AdaptIQ",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://adaptiq.com'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://adaptiq.com',
    title: "AdaptIQ - AI-Powered Adaptive Learning Platform",
    description: "Transform your learning with AI-orchestrated adaptive quizzes, real-time performance tracking, and personalized learning paths.",
    siteName: "AdaptIQ",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AdaptIQ - Adaptive Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AdaptIQ - AI-Powered Adaptive Learning Platform",
    description: "Transform your learning with AI-orchestrated adaptive quizzes and personalized learning paths.",
    images: ["/og-image.png"],
    creator: "@adaptiq",
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
      { url: '/adaptiq.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/favicon.svg'],
    apple: [{ url: '/adaptiq.svg' }],
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
          <link rel="preconnect" href="https://api.openai.com" />
          <link rel="preconnect" href="https://img.clerk.com" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'EducationalOrganization',
                name: 'AdaptIQ',
                description: 'AI-powered adaptive learning platform with real-time quiz adaptation',
                url: process.env.NEXT_PUBLIC_APP_URL || 'https://adaptiq.com',
                logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://adaptiq.com'}/logo.png`,
                sameAs: [
                  'https://twitter.com/adaptiq',
                  'https://facebook.com/adaptiq',
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
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
