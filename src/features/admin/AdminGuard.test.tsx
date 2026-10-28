import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AdminGuard } from './AdminGuard';
import * as authApi from '../../lib/api/auth';

vi.mock('../../lib/api/auth', () => ({
  checkCurrentAdmin: vi.fn(),
  signOutAdmin: vi.fn(),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
  isSupabaseConfigured: false,
}));

describe('AdminGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRoutes = (initialEntry = '/admin') => {
    return render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <div data-testid="admin-content">Admin Portal Active</div>
                </AdminGuard>
              }
            />
            <Route
              path="/admin/login"
              element={<div data-testid="login-page">Login Page</div>}
            />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );
  };

  it('renders loading indicator while checking admin session', () => {
    // Return a pending promise
    vi.mocked(authApi.checkCurrentAdmin).mockReturnValue(new Promise(() => {}));
    renderWithRoutes();
    expect(screen.getByText('Verifying access...')).toBeInTheDocument();
  });

  it('redirects to /admin/login when user has no active session', async () => {
    vi.mocked(authApi.checkCurrentAdmin).mockResolvedValue({
      isAuthenticated: false,
      isAdmin: false,
      userId: null,
    });

    renderWithRoutes();

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
  });

  it('signs out and rejects non-admin users with error state', async () => {
    vi.mocked(authApi.checkCurrentAdmin).mockResolvedValue({
      isAuthenticated: true,
      isAdmin: false,
      userId: 'customer-123',
    });

    renderWithRoutes();

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
    expect(authApi.signOutAdmin).toHaveBeenCalled();
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
  });

  it('permits authorized admin users and renders protected content', async () => {
    vi.mocked(authApi.checkCurrentAdmin).mockResolvedValue({
      isAuthenticated: true,
      isAdmin: true,
      userId: 'admin-123',
    });

    renderWithRoutes();

    await waitFor(() => {
      expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    });
  });
});
