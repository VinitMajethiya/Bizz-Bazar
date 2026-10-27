import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductDetail } from './ProductDetail';

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
    // 'crystal-square-drops' is sold_out in CATALOG.md
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
