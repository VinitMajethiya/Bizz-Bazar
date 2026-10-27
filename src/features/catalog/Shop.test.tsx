import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Shop } from './Shop';

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

  it('renders product cards from catalog', async () => {
    renderWithProviders(<Shop />);

    // Since fallback catalogue loads synchronously/instantly, we can find items
    const productItem = await screen.findByText('Lilac Twist Hoops');
    expect(productItem).toBeInTheDocument();
  });
});
