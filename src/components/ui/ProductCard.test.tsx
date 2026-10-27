import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import type { Product } from '../../lib/types';

const mockProduct: Product = {
  id: 'prod-1',
  slug: 'lilac-twist-hoops',
  name: 'Lilac Twist Hoops',
  category: 'Earrings',
  description: 'Chic twist hoops',
  pricePaise: 49900,
  compareAtPricePaise: 69900,
  stockStatus: 'in_stock',
  stockQty: 10,
  badge: 'New Drop',
  options: { materials: ['Gold'], sizes: [] },
  specs: {},
  isFeatured: true,
  isArchived: false,
  sortOrder: 1,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  images: [],
};

describe('ProductCard Component', () => {
  it('renders product name and formatted price', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );

    expect(screen.getByText('Lilac Twist Hoops')).toBeInTheDocument();
    expect(screen.getByText('₹499')).toBeInTheDocument();
    expect(screen.getByText('₹699')).toBeInTheDocument();
  });

  it('renders product badge correctly', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );

    expect(screen.getByText('New drop')).toBeInTheDocument();
  });

  it('renders sold out badge and state when stockStatus is sold_out', () => {
    const soldOutProduct: Product = {
      ...mockProduct,
      stockStatus: 'sold_out',
      stockQty: 0,
      badge: null,
    };

    render(
      <MemoryRouter>
        <ProductCard product={soldOutProduct} />
      </MemoryRouter>
    );

    expect(screen.getByText('Sold out')).toBeInTheDocument();
  });
});

