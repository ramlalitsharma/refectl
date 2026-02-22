// This is a server component - no 'use client' needed for just a Script tag
import Script from 'next/script';

/**
 * AdSenseScript - Loads Google AdSense for Auto Ads.
 * 
 * IMPORTANT: Auto Ads are fully managed by Google.
 * We use 'afterInteractive' to allow the page to settle before ads appear,
 * which often improves layout stability and ad density.
 */
export function AdSenseScript() {
    return (
        <>
            <Script
                id="adsense-init"
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8149507764464883"
                strategy="afterInteractive"
                crossOrigin="anonymous"
            />
            <Script
                id="adsense-auto-ads"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                      (window.adsbygoogle = window.adsbygoogle || []).push({
                        google_ad_client: "ca-pub-8149507764464883",
                        enable_page_level_ads: true
                      });
                    `,
                }}
            />
        </>
    );
}
