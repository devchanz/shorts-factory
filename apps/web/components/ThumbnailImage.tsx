'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';

export default function ThumbnailImage({ src, alt, ...props }: ImageProps) {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setImgSrc(src);
        setHasError(false);
    }, [src]);

    const handleError = () => {
        if (typeof imgSrc !== 'string' || hasError) return;

        // Downgrade strategy: maxresdefault -> hqdefault -> mqdefault -> default
        if (imgSrc.includes('maxresdefault.jpg')) {
            setImgSrc(imgSrc.replace('maxresdefault.jpg', 'hqdefault.jpg'));
        } else if (imgSrc.includes('hqdefault.jpg')) {
            setImgSrc(imgSrc.replace('hqdefault.jpg', 'mqdefault.jpg'));
        } else if (imgSrc.includes('mqdefault.jpg')) {
            setImgSrc(imgSrc.replace('mqdefault.jpg', 'default.jpg'));
        } else {
            setHasError(true);
        }
    };

    if (hasError) {
        return (
            <div
                className={`bg-gray-800 flex flex-col items-center justify-center text-gray-500 text-xs ${props.className || ''}`}
                style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-1 opacity-50">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <span>No Thumbnail</span>
            </div>
        );
    }

    return (
        <Image
            {...props}
            src={imgSrc}
            alt={alt}
            onError={handleError}
        />
    );
}
