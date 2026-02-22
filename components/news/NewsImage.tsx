'use client';

import { useState } from 'react';
import Image from 'next/image';

interface NewsImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function NewsImage({
  src,
  alt,
  className,
  fallbackSrc = '/news-placeholder.jpg',
  width,
  height,
  ...props
}: NewsImageProps) {
  const [error, setError] = useState(false);

  // Robust path detection
  const isValidSrc = src && typeof src === 'string' && src.length > 5;
  const showFallback = error || !isValidSrc;

  return (
    <div className={`relative overflow-hidden bg-slate-900/10 ${className || ''}`}>
      <Image
        src={showFallback ? fallbackSrc : (src as string)}
        alt={alt || 'News Image'}
        fill
        className={`object-cover transition-opacity duration-500 ${error ? 'opacity-40' : 'opacity-100'}`}
        onError={() => {
          console.warn(`[NewsImage] Failed to load: ${src}. Rolling back to placeholder.`);
          setError(true);
        }}
        unoptimized={typeof src === 'string' && src.startsWith('/uploads')}
        {...props}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none">
          <span className="text-[8px] font-black uppercase tracking-tighter text-white/40">Source Offline</span>
        </div>
      )}
    </div>
  );
}
