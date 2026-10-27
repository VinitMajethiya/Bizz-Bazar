import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Shop } from './Shop';

const { mockProducts } = vi.hoisted(() => ({
  mockProducts: [
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
  ],
}));

vi.mock('../../lib/api/products', () => ({
  fetchProducts: vi.fn().mockImplementation(() => Promise.resolve(mockProducts)),
}));

function renderWithProviders(ui: React.ReactElement, initialEntries = ['/shop']) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Shop Page', () => {
  it('renders catalogue heading and category tabs', async () => {
    renderWithProviders(<Shop />);

    expect(screen.getByText('Catalogue')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Earrings' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Bracelets' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Necklaces' })).toBeInTheDocument();
  });

  it('renders sort dropdown with expected options', () => {
    renderWithProviders(<Shop />);

    const select = screen.getByLabelText('Sort products') as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.value).toBe('featured');
  });

  it('renders product cards from mocked supabase response', async () => {
    renderWithProviders(<Shop />);

    const productItem = await screen.findByText('Lilac Twist Hoops');
    expect(productItem).toBeInTheDocument();
  });
});
