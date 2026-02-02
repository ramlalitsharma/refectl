'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface FallbackImageProps extends ImageProps {
    fallbackSrc?: string;
}

export function FallbackImage({
    src,
    alt,
    fallbackSrc = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    ...props
}: FallbackImageProps) {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    return (
        <Image
            {...props}
            src={imgSrc}
            alt={alt}
            onError={() => {
                if (!hasError) {
                    setImgSrc(fallbackSrc);
                    setHasError(true);
                }
            }}
        />
    );
}
