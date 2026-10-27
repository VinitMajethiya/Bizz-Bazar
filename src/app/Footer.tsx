import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-line bg-surface mt-auto text-ink transition-colors">
      <div className="max-w-site mx-auto px-5 md:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest font-medium text-ink">
              By Raya.co
            </h3>
            <p className="text-xs text-muted leading-relaxed max-w-xs">
              Effortless elegance for every occasion. Everyday luxury, without the luxury price.
            </p>
            <p className="text-xs text-muted">
              Connect on Instagram:{' '}
              <a
                href="https://instagram.com/by.raya.co"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline font-medium"
              >
                @by.raya.co
              </a>
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest font-medium text-ink">
              Shop
            </h3>
            <ul className="space-y-2 text-xs text-muted">
              <li>
                <Link to="/shop" className="hover:text-ink transition-colors">
                  All Jewellery
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Earrings" className="hover:text-ink transition-colors">
                  Earrings
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Bracelets" className="hover:text-ink transition-colors">
                  Bracelets
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Necklaces" className="hover:text-ink transition-colors">
                  Necklaces
                </Link>
              </li>
              <li>
                <Link to="/deals" className="hover:text-ink transition-colors">
                  Deals & Sets
                </Link>
              </li>
            </ul>
          </div>

          {/* About & Contact */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest font-medium text-ink">
              About
            </h3>
            <ul className="space-y-2 text-xs text-muted">
              <li>
                <Link to="/our-story" className="hover:text-ink transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-ink transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping-returns" className="hover:text-ink transition-colors">
                  Shipping & Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Admin */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest font-medium text-ink">
              Legal
            </h3>
            <ul className="space-y-2 text-xs text-muted">
              <li>
                <Link to="/privacy" className="hover:text-ink transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-ink transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li className="pt-2">
                <Link to="/admin" className="text-[11px] text-muted hover:text-accent transition-colors">
                  Admin Sign In &rarr;
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-line/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted">
          <p>&copy; {new Date().getFullYear()} By Raya.co. All rights reserved.</p>
          <p>Orders are confirmed via WhatsApp &amp; Instagram DM.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

