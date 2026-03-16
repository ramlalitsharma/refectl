'use client';

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { RouteAwareShell } from '@/components/layout/RouteAwareShell';
import { GlobalBackButton } from '@/components/layout/GlobalBackButton';
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToastProvider } from '@/components/ui/ToastManager';
import { CookieConsent } from '@/components/CookieConsent';
import { PostHogProvider } from '@/components/providers/PostHogProvider';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

type ClientProvidersProps = {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, any>;
  enableProdAnalytics: boolean;
};

export function ClientProviders({
  children,
  locale,
  messages,
  enableProdAnalytics,
}: ClientProvidersProps) {
  return (
    <ClerkProvider>
      <NextIntlClientProvider messages={messages} locale={locale}>
        <ErrorBoundary>
          <ThemeProvider>
            <ToastProvider>
              <GlobalBackButton />
              <RouteAwareShell>{children}</RouteAwareShell>
              <CookieConsent />
              <ServiceWorkerRegistration />
            </ToastProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </NextIntlClientProvider>
      <PostHogProvider>
        {enableProdAnalytics && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </PostHogProvider>
    </ClerkProvider>
  );
}
