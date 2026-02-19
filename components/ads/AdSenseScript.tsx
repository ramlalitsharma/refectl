// This is a server component - no 'use client' needed for just a Script tag
import Script from 'next/script';

/**
 * AdSenseScript - Loads Google AdSense for Auto Ads.
 * 
 * IMPORTANT: Do NOT manually call adsbygoogle.push({}) here.
 * Auto Ads are fully managed by Google's AI engine. Manual push calls
 * are only for explicitly defined ad units (<ins class="adsbygoogle">)
 * and will cause errors / reduce auto ad density if called without
 * a corresponding ad slot element.
 */
export function AdSenseScript() {
    return (
        <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8149507764464883"
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
    );
}
