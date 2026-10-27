import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'sale' | 'sold_out' | 'low_stock';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'sale':
        return 'bg-bg text-accent border-line';
      case 'sold_out':
        return 'bg-surface text-muted border-line line-through';
      case 'low_stock':
        return 'bg-bg text-danger border-line';
      default:
        return 'bg-bg text-ink border-line';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[11px] font-normal border rounded-none select-none ${getVariantStyles()} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;

