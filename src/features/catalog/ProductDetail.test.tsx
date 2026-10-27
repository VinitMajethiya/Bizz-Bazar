import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductDetail } from './ProductDetail';

const { testProducts } = vi.hoisted(() => ({
  testProducts: [
    {
      id: 'p-1',
      slug: 'lilac-twist-hoops',
      name: 'Lilac Twist Hoops',
      category: 'Earrings',
      description: 'Chic twist hoops featuring delicate lilac accents.',
      pricePaise: 49900,
      compareAtPricePaise: 69900,
      stockStatus: 'in_stock' as const,
      stockQty: 25,
      badge: 'New drop',
      options: { materials: ['Gold', 'Rose Gold'], sizes: [] },
      specs: {},
      isFeatured: true,
      isArchived: false,
      sortOrder: 1,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      images: [],
    },
    {
      id: 'p-3',
      slug: 'crystal-square-drops',
      name: 'Crystal Square Drops',
      category: 'Earrings',
      description: 'Geometric faceted square drop stones.',
      pricePaise: 54900,
      compareAtPricePaise: null,
      stockStatus: 'sold_out' as const,
      stockQty: 0,
      badge: 'Sold out',
      options: { materials: ['Gold'], sizes: [] },
      specs: {},
      isFeatured: false,
      isArchived: false,
      sortOrder: 15,
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-01-15T00:00:00Z',
      images: [],
    },
  ],
}));

vi.mock('../../lib/api/products', () => ({
  fetchProductBySlug: vi.fn().mockImplementation((slug: string) => {
    const found = testProducts.find((p) => p.slug === slug);
    return Promise.resolve(found || null);
  }),
  fetchRelatedProducts: vi.fn().mockResolvedValue([]),
}));

function renderProductDetail(slug: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/product/${slug}`]}>
        <Routes>
          <Route path="/product/:slug" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('ProductDetail Page', () => {
  it('renders available product with active order buttons', async () => {
    renderProductDetail('lilac-twist-hoops');

    // Title and price
    expect(
      await screen.findByRole('heading', { name: 'Lilac Twist Hoops', level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByText('₹499')).toBeInTheDocument();

    // Material chips
    expect(screen.getByRole('button', { name: 'Gold' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rose Gold' })).toBeInTheDocument();

    // Active order buttons
    const whatsappBtn = screen.getByRole('button', { name: /order on whatsapp/i });
    const instagramBtn = screen.getByRole('button', { name: /order on instagram/i });
    const bagBtn = screen.getByRole('button', { name: /add to bag/i });

    expect(whatsappBtn).not.toBeDisabled();
    expect(instagramBtn).not.toBeDisabled();
    expect(bagBtn).not.toBeDisabled();
  });

  it('renders sold out state with disabled order buttons', async () => {
    renderProductDetail('crystal-square-drops');

    expect(
      await screen.findByRole('heading', { name: 'Crystal Square Drops', level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByText(/sold out \u2022 back soon/i)).toBeInTheDocument();

    // All order buttons should be disabled
    const buttons = screen.getAllByRole('button', { name: /sold out/i });
    expect(buttons.length).toBeGreaterThanOrEqual(3);
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });
});
