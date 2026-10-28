import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Home from '@/features/pages/Home';
import Shop from '@/features/catalog/Shop';
import ProductDetail from '@/features/catalog/ProductDetail';
import OurStory from '@/features/pages/OurStory';
import Contact from '@/features/pages/Contact';
import Privacy from '@/features/pages/Privacy';
import Terms from '@/features/pages/Terms';
import HowToOrder from '@/features/pages/HowToOrder';
import NotFound from '@/features/pages/NotFound';

// Lazy-loaded admin routes so shoppers never download admin code
const AdminGuard = lazy(() => import('@/features/admin/AdminGuard'));
const AdminLayout = lazy(() => import('@/features/admin/AdminLayout'));
const AdminLogin = lazy(() => import('@/features/admin/AdminLogin'));
const AdminOverview = lazy(() => import('@/features/admin/AdminOverview'));
const AdminProducts = lazy(() => import('@/features/admin/AdminProducts'));
const AdminProductForm = lazy(() => import('@/features/admin/AdminProductForm'));
const AdminEnquiries = lazy(() => import('@/features/admin/AdminEnquiries'));
const AdminEnquiryDetail = lazy(() => import('@/features/admin/AdminEnquiryDetail'));
const AdminMore = lazy(() => import('@/features/admin/AdminMore'));

// Placeholders for subsequent phases (Reviews, Content)
const AdminReviews = lazy(() =>
  import('@/features/admin/AdminPlaceholders').then((m) => ({
    default: m.AdminReviewsPlaceholder,
  }))
);
const AdminContent = lazy(() =>
  import('@/features/admin/AdminPlaceholders').then((m) => ({
    default: m.AdminContentPlaceholder,
  }))
);

const adminFallback = (
  <div className="min-h-screen bg-bg flex items-center justify-center p-8 text-xs text-muted">
    Loading admin portal...
  </div>
);

export const router = createBrowserRouter([
  // Public Storefront inside Layout Shell
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'shop', element: <Shop /> },
      { path: 'product/:slug', element: <ProductDetail /> },
      { path: 'our-story', element: <OurStory /> },
      { path: 'about', element: <Navigate to="/our-story" replace /> },
      { path: 'contact', element: <Contact /> },
      { path: 'privacy', element: <Privacy /> },
      { path: 'terms', element: <Terms /> },
      { path: 'how-to-order', element: <HowToOrder /> },
      { path: 'shipping-returns', element: <Navigate to="/how-to-order" replace /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  // Admin Login (independent of AdminLayout)
  {
    path: '/admin/login',
    element: (
      <Suspense fallback={adminFallback}>
        <AdminLogin />
      </Suspense>
    ),
  },
  // Admin Protected Shell & Nested Routes
  {
    path: '/admin',
    element: (
      <Suspense fallback={adminFallback}>
        <AdminGuard>
          <AdminLayout />
        </AdminGuard>
      </Suspense>
    ),
    children: [
      { index: true, element: <AdminOverview /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'products/new', element: <AdminProductForm /> },
      { path: 'products/:id', element: <AdminProductForm /> },
      { path: 'enquiries', element: <AdminEnquiries /> },
      { path: 'enquiries/:id', element: <AdminEnquiryDetail /> },
      { path: 'reviews', element: <AdminReviews /> },
      { path: 'content', element: <AdminContent /> },
      { path: 'more', element: <AdminMore /> },
    ],
  },
]);
