import React from 'react';
import { formatINR, savingPercent } from '../../lib/money';

export interface PriceTagProps {
  pricePaise: number;
  compareAtPricePaise?: number | null;
  showSavingPercent?: boolean;
  size?: 'sm' | 'base' | 'lg';
  className?: string;
}

export const PriceTag: React.FC<PriceTagProps> = ({
  pricePaise,
  compareAtPricePaise,
  showSavingPercent = false,
  size = 'sm',
  className = '',
}) => {
  const isSale = Boolean(compareAtPricePaise && compareAtPricePaise > pricePaise);
  const discount = isSale && compareAtPricePaise ? savingPercent(pricePaise, compareAtPricePaise) : 0;

  const sizeClasses = {
    sm: {
      price: 'text-[12px]',
      compare: 'text-[11px]',
      percent: 'text-[10px]',
    },
    base: {
      price: 'text-sm font-medium',
      compare: 'text-xs',
      percent: 'text-[11px]',
    },
    lg: {
      price: 'text-xl font-medium',
      compare: 'text-sm',
      percent: 'text-xs',
    },
  }[size];

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <span
        className={`font-normal ${isSale ? 'text-accent font-medium' : 'text-ink'} ${sizeClasses.price}`}
      >
        {formatINR(pricePaise)}
      </span>

      {isSale && compareAtPricePaise && (
        <span className={`text-muted line-through ${sizeClasses.compare}`}>
          {formatINR(compareAtPricePaise)}
        </span>
      )}

      {showSavingPercent && discount > 0 && (
        <span
          className={`bg-surface text-accent px-1.5 py-0.5 rounded-ui font-medium ${sizeClasses.percent}`}
        >
          Save {discount}%
        </span>
      )}
    </div>
  );
};

export default PriceTag;

