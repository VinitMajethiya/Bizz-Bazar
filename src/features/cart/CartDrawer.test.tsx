import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartDrawer } from './CartDrawer';
import { useCartStore } from './cartStore';
import * as placeOrderModule from '../enquiries/placeOrder';

const { mockCatalog } = vi.hoisted(() => ({
  mockCatalog: [
    {
      id: 'prod-in-stock',
      slug: 'lilac-twist-hoops',
      name: 'Lilac Twist Hoops',
      category: 'Earrings',
      description: null,
      pricePaise: 49900,
      compareAtPricePaise: 69900,
      stockStatus: 'in_stock' as const,
      stockQty: 10,
      badge: 'New drop',
      options: { materials: ['Gold'], sizes: [] },
      specs: {},
      isFeatured: true,
      isArchived: false,
      sortOrder: 1,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      images: [],
    },
    {
      id: 'prod-sold-out',
      slug: 'crystal-square-drops',
      name: 'Crystal Square Drops',
      category: 'Earrings',
      description: null,
      pricePaise: 54900,
      compareAtPricePaise: null,
      stockStatus: 'sold_out' as const,
      stockQty: 0,
      badge: 'Sold out',
      options: { materials: ['Gold'], sizes: [] },
      specs: {},
      isFeatured: false,
      isArchived: false,
      sortOrder: 2,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      images: [],
    },
  ],
}));

vi.mock('../../lib/api/products', () => ({
  fetchProducts: vi.fn().mockImplementation(() => Promise.resolve(mockCatalog)),
}));

function renderDrawer() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CartDrawer />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('CartDrawer Component', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useCartStore.setState({ isOpen: true });
  });

  it('renders empty bag message from CONTENT.md when bag has no items', () => {
    renderDrawer();

    expect(
      screen.getByText('Your bag is empty. Add a piece from the catalogue.')
    ).toBeInTheDocument();
    expect(screen.getByText('Go to the catalogue')).toBeInTheDocument();
  });

  it('renders items, calculates live subtotal, and updates gift note', async () => {
    useCartStore.getState().addLine({
      productId: 'prod-in-stock',
      options: { material: 'Gold' },
      qty: 2,
    });

    renderDrawer();

    expect(await screen.findByText('Lilac Twist Hoops')).toBeInTheDocument();
    expect(screen.getAllByText('₹998').length).toBeGreaterThanOrEqual(1); // line total & subtotal

    // Gift note textarea
    const noteArea = screen.getByLabelText(/gift note or custom instructions/i);
    fireEvent.change(noteArea, { target: { value: 'For Maya' } });
    expect(useCartStore.getState().note).toBe('For Maya');
  });

  it('flags sold out product and disables order buttons until removed', async () => {
    useCartStore.getState().addLine({
      productId: 'prod-sold-out',
      options: { material: 'Gold' },
      qty: 1,
    });

    renderDrawer();

    expect(await screen.findByText('Crystal Square Drops')).toBeInTheDocument();
    expect(screen.getByText(/sold out \u2022 please remove/i)).toBeInTheDocument();

    // Order buttons must be disabled
    const whatsappBtn = screen.getByRole('button', { name: /order on whatsapp/i });
    const instagramBtn = screen.getByRole('button', { name: /order on instagram/i });

    expect(whatsappBtn).toBeDisabled();
    expect(instagramBtn).toBeDisabled();
  });

  it('calls placeOrder when order button is tapped', async () => {
    const placeOrderSpy = vi.spyOn(placeOrderModule, 'placeOrder').mockResolvedValue(true);

    useCartStore.getState().addLine({
      productId: 'prod-in-stock',
      options: { material: 'Gold' },
      qty: 1,
    });

    renderDrawer();

    expect(await screen.findByText('Lilac Twist Hoops')).toBeInTheDocument();

    const whatsappBtn = screen.getByRole('button', { name: /order on whatsapp/i });
    expect(whatsappBtn).not.toBeDisabled();

    fireEvent.click(whatsappBtn);
    expect(placeOrderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'whatsapp',
        isFromBag: true,
      })
    );
  });
});
