import React, { useState } from 'react';

export interface ImageWithFallbackProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt: string;
  fallbackInitial?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  className?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackInitial = 'R',
  aspectRatio = 'square',
  className = '',
  loading = 'lazy',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const initial = (fallbackInitial || alt || 'R').trim().charAt(0).toUpperCase();

  const aspectClass = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  }[aspectRatio];

  // Missing or failed image fallback
  if (!src || hasError) {
    return (
      <div
        className={`w-full ${aspectClass} bg-surface border border-line/60 flex flex-col items-center justify-center p-4 text-center select-none ${className}`}
        aria-label={`${alt} (Photo coming soon)`}
      >
        <span className="text-2xl sm:text-3xl font-light text-muted/60 font-serif mb-1">
          {initial}
        </span>
        <span className="text-[11px] text-muted font-light">
          Photo coming soon
        </span>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${aspectClass} bg-surface overflow-hidden ${className}`}>
      {/* Skeleton / background while image is loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-surface animate-pulse" aria-hidden="true" />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};

export default ImageWithFallback;
