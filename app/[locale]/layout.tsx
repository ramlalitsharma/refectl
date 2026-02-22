import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";
import Script from "next/script";
import { CookieConsent } from "@/components/CookieConsent";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlobalBackButton } from "@/components/layout/GlobalBackButton";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import { locales } from "@/lib/navigation";
import { notFound } from "next/navigation";
import "../globals.css";
import "@/styles/md-editor.css";

export const dynamic = "force-dynamic";

import { ToastProvider } from "@/components/ui/ToastManager";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import {
  BRAND_NAME,
  BRAND_URL,
  BRAND_TWITTER,
  BRAND_OG_IMAGE,
  brandLogoUrl,
} from "@/lib/brand";
import { isAnalyticsConfigured } from "@/lib/analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = BRAND_URL;

  return {
    title: {
      default: `${BRAND_NAME} - AI-Powered Adaptive Learning Platform`,
      template: `%s | ${BRAND_NAME}`,
    },
    description: `Transform your learning with AI-orchestrated adaptive quizzes that evolve in real-time. Get personalized learning paths, predict knowledge gaps with 95% accuracy, and master any subject faster with ${BRAND_NAME}.`,
    keywords: [
      "adaptive learning",
      "AI quizzes",
      "online education",
      "learning platform",
      "adaptive testing",
      "personalized learning",
      "quiz generator",
      "education technology",
    ],
    authors: [{ name: BRAND_NAME }],
    creator: BRAND_NAME,
    publisher: BRAND_NAME,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}`])
      ),
    },
    openGraph: {
      type: "website",
      locale: locale === 'en' ? 'en_US' : locale,
      url: `${baseUrl}/${locale}`,
      title: `${BRAND_NAME} - AI-Powered Adaptive Learning Platform`,
      description:
        "Transform your learning with AI-orchestrated adaptive quizzes, real-time performance tracking, and personalized learning paths.",
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
      description:
        "Transform your learning with AI-orchestrated adaptive quizzes and personalized learning paths.",
      images: [BRAND_OG_IMAGE],
      creator: BRAND_TWITTER,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_VERIFICATION,
    },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: BRAND_OG_IMAGE, type: "image/svg+xml" },
      ],
      shortcut: ["/favicon.svg"],
      apple: [{ url: BRAND_OG_IMAGE }],
    },
  };
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}


export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Fetching messages for client components
  const messages = await getMessages({ locale });


  const enableProdAnalytics = process.env.NODE_ENV === "production" && isAnalyticsConfigured();

  return (
    <ClerkProvider>
      <html lang={locale} suppressHydrationWarning>
        <head>
          <AdSenseScript />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function () {
                  try {
                    var stored = localStorage.getItem('theme');
                    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    var isDark = stored === 'dark' || (!stored && systemDark);
                    document.documentElement.classList.toggle('dark', isDark);
                    document.documentElement.classList.toggle('light', !isDark);
                  } catch (e) {}
                })();
              `,
            }}
          />
          <meta
            name="google-adsense-account"
            content="ca-pub-8149507764464883"
          />
          {/* Google Analytics 4 */}
          <Script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-RNZ9J7M4CD"
            strategy="afterInteractive"
          />
          <Script
            id="gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-RNZ9J7M4CD');
              `,
            }}
          />
          <link
            rel="preconnect"
            href="https://clerk.refectl.com"
          />
          <link rel="preconnect" href="https://api.openai.com" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://img.clerk.com" />
          <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
          <meta
            httpEquiv="Content-Security-Policy"
            content="upgrade-insecure-requests"
          />
          {process.env.NODE_ENV !== "production" && (
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  (function () {
                    try {
                      if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.getRegistrations().then(function (regs) {
                          regs.forEach(function (r) { r.unregister(); });
                        });
                      }
                      if (window.caches && caches.keys) {
                        caches.keys().then(function (keys) {
                          keys.forEach(function (k) { caches.delete(k); });
                        });
                      }
                    } catch (e) {}
                  })();
                `,
              }}
            />
          )}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "EducationalOrganization",
                name: BRAND_NAME,
                description:
                  "AI-powered adaptive learning platform with real-time quiz adaptation",
                url: BRAND_URL,
                logo: brandLogoUrl(),
                sameAs: [
                  `https://twitter.com/${BRAND_TWITTER.replace("@", "")}`,
                ],
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  availability: "https://schema.org/InStock",
                },
              }),
            }}
          />
          {enableProdAnalytics && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                strategy="afterInteractive"
              />
              <Script id="google-analytics" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `}
              </Script>
            </>
          )}
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} antialiased bg-background text-foreground transition-colors duration-300 selection:bg-elite-accent-cyan/30 custom-scrollbar`}
        >
          <NextIntlClientProvider messages={messages} locale={locale}>
            <ErrorBoundary>
              <ThemeProvider>
                <ToastProvider>
                  <GlobalBackButton />
                  <div className="flex min-h-screen flex-col">
                    <Suspense>
                      <Navbar />
                    </Suspense>

                    {/* MAIN CONTENT */}
                    <main className="flex-1">
                      {children}
                    </main>
                    <Footer />
                  </div>
                  <CookieConsent />
                  <ServiceWorkerRegistration />
                </ToastProvider>
              </ThemeProvider>
            </ErrorBoundary>
          </NextIntlClientProvider>
          <PostHogProvider>
            {process.env.NODE_ENV === "production" && (
              <>
                <Analytics />
                <SpeedInsights />
              </>
            )}
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
