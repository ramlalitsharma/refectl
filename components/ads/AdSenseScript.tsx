'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

export function AdSenseScript() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        try {
            if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
                (window as any).adsbygoogle.push({});
            }
        } catch (e) {
            console.error("AdSense push error:", e);
        }
    }, [pathname, searchParams]);

    return (
        <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8149507764464883"
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
    );
}
