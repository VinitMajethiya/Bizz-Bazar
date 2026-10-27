import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../lib/types';
import { Badge } from './Badge';
import { PriceTag } from './PriceTag';
import { ImageWithFallback } from './ImageWithFallback';

export interface ProductCardProps {
  product: Product;
  className?: string;
}

function toSentenceCase(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const heroImage = product.images.find((img) => img.isHero) || product.images[0];
  const isSoldOut = product.stockStatus === 'sold_out';

  // Determine badge text and variant
  let badgeText = product.badge;
  let badgeVariant: 'default' | 'sale' | 'sold_out' | 'low_stock' = 'default';

  if (isSoldOut) {
    badgeText = 'Sold out';
    badgeVariant = 'sold_out';
  } else if (product.stockStatus === 'low_stock') {
    badgeText = badgeText ? toSentenceCase(badgeText) : 'Low stock';
    badgeVariant = 'low_stock';
  } else if (
    product.compareAtPricePaise &&
    product.compareAtPricePaise > product.pricePaise &&
    (!badgeText || badgeText.toLowerCase() === 'sale')
  ) {
    badgeText = 'Sale';
    badgeVariant = 'sale';
  } else if (badgeText) {
    badgeText = toSentenceCase(badgeText);
  }

  return (
    <Link
      to={`/product/${product.slug}`}
      className={`group block space-y-2.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-none ${className}`}
      aria-label={`${product.name}, price ${product.pricePaise / 100} rupees${isSoldOut ? ' (Sold Out)' : ''}`}
    >
      <div className="relative w-full aspect-square bg-surface border border-line/60 overflow-hidden">
        {/* Badge in top-left */}
        {badgeText && (
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <Badge variant={badgeVariant}>{badgeText}</Badge>
          </div>
        )}

        {/* Product photo with fallback */}
        <div className={`w-full h-full transition-transform duration-300 ${isSoldOut ? 'opacity-60' : 'group-hover:scale-[1.02]'}`}>
          <ImageWithFallback
            src={heroImage?.imageUrl}
            alt={heroImage?.alt || product.name}
            fallbackInitial={product.name.charAt(0)}
            aspectRatio="square"
          />
        </div>

        {/* Subtle overlay for sold out */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-bg/20 flex items-center justify-center pointer-events-none">
            <span className="sr-only">Item sold out</span>
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        <h3 className="text-[13px] text-ink font-normal leading-snug line-clamp-1 group-hover:text-accent transition-colors">
          {product.name}
        </h3>

        <PriceTag
          pricePaise={product.pricePaise}
          compareAtPricePaise={product.compareAtPricePaise}
          size="sm"
        />
      </div>
    </Link>
  );
};

export default ProductCard;

