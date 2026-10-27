import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useCartStore } from '@/features/cart/cartStore';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lines, openDrawer } = useCartStore();
  const totalCount = lines.reduce((acc, l) => acc + l.qty, 0);

  return (
    <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur-sm border-b border-line transition-colors">
      <div className="max-w-site mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile menu toggle + nav links */}
        <div className="flex items-center gap-4 flex-1">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden min-h-[40px] min-w-[40px] inline-flex items-center justify-center p-2 text-ink hover:text-accent rounded-ui focus-visible:ring-1 focus-visible:ring-accent"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 stroke-[1.5]" />
            ) : (
              <Menu className="w-5 h-5 stroke-[1.5]" />
            )}
          </button>

          <nav className="hidden md:flex items-center gap-6 text-[13px] tracking-wide" aria-label="Main Navigation">
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `transition-colors hover:text-accent ${isActive ? 'text-accent font-medium' : 'text-ink'}`
              }
            >
              Catalogue
            </NavLink>
            <NavLink
              to="/deals"
              className={({ isActive }) =>
                `transition-colors hover:text-accent ${isActive ? 'text-accent font-medium' : 'text-ink'}`
              }
            >
              Deals
            </NavLink>
            <NavLink
              to="/our-story"
              className={({ isActive }) =>
                `transition-colors hover:text-accent ${isActive ? 'text-accent font-medium' : 'text-ink'}`
              }
            >
              Our Story
            </NavLink>
          </nav>
        </div>

        {/* Center: Brand wordmark / Logo */}
        <div className="flex-shrink-0 text-center">
          <Logo />
        </div>

        {/* Right: Actions (Theme toggle, Bag) */}
        <div className="flex items-center justify-end gap-1 flex-1">
          <ThemeToggle />

          <button
            type="button"
            aria-label={`Shopping bag (${totalCount} ${totalCount === 1 ? 'item' : 'items'})`}
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center p-2 text-ink hover:text-accent rounded-ui relative focus-visible:ring-1 focus-visible:ring-accent"
            onClick={openDrawer}
          >
            <ShoppingBag className="w-4 h-4 stroke-[1.5]" aria-hidden="true" />
            {totalCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-ink text-bg text-[10px] font-normal rounded-full flex items-center justify-center leading-none">
                {totalCount}
              </span>
            )}
            <span className="sr-only">{totalCount} items in bag</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-line bg-surface px-5 py-4 animate-in fade-in duration-200">
          <nav className="flex flex-col gap-3 text-sm">
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-ink hover:text-accent transition-colors"
            >
              Catalogue
            </Link>
            <Link
              to="/deals"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-ink hover:text-accent transition-colors"
            >
              Deals & Offers
            </Link>
            <Link
              to="/our-story"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-ink hover:text-accent transition-colors"
            >
              Our Story
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-ink hover:text-accent transition-colors"
            >
              Contact
            </Link>
            <div className="pt-2 border-t border-line text-xs text-muted flex justify-between items-center">
              <span>Admin Portal</span>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-accent underline"
              >
                Owner sign in
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

