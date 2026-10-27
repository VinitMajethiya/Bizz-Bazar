import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="space-y-2.5 animate-pulse" aria-hidden="true">
      <div className="w-full aspect-square bg-surface border border-line/60" />
      <div className="space-y-1.5 pt-1">
        <div className="h-3 bg-surface rounded-none w-3/4" />
        <div className="h-3 bg-surface rounded-none w-1/3" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-site mx-auto px-5 md:px-8 py-8 md:py-12 animate-pulse" aria-hidden="true">
      <div className="h-3 bg-surface w-32 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div className="space-y-4">
          <div className="w-full aspect-square bg-surface border border-line" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-surface" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-3 bg-surface w-20" />
            <div className="h-7 bg-surface w-3/4" />
            <div className="h-5 bg-surface w-1/3" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-surface w-16" />
            <div className="h-9 bg-surface w-48" />
          </div>
          <div className="space-y-3 pt-4">
            <div className="h-11 bg-surface w-full" />
            <div className="h-11 bg-surface w-full" />
            <div className="h-11 bg-surface w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
