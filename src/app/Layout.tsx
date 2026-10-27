import React from 'react';
import { Outlet } from 'react-router-dom';
import { Ticker } from './Ticker';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from '../features/cart/CartDrawer';
import { OrderModal } from '../features/enquiries/OrderModal';
import { Toast } from '../components/ui/Toast';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink transition-colors">
      <Ticker />
      <Header />
      <main className="flex-1 w-full" id="main-content">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <OrderModal />
      <Toast />
    </div>
  );
};

export default Layout;
