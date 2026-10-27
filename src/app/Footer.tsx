import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../lib/hooks/useCatalog';

export const Footer: React.FC = () => {
  const { data: settings } = useSiteSettings();

  const brandName = settings?.brand_name || 'By Raya.co';
  const instagramHandle = settings?.instagram_handle || 'by.raya.co';
  const footerText =
    settings?.footer_text ||
    'Effortless elegance for every occasion. Everyday luxury, without the luxury price.';

  return (
    <footer className="border-t border-line bg-surface mt-auto text-ink transition-colors">
      <div className="max-w-site mx-auto px-5 md:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-ink">
              {brandName}
            </h3>
            <p className="text-xs text-muted leading-relaxed max-w-xs font-light">
              {footerText}
            </p>
            <p className="text-xs text-muted">
              Connect on Instagram:{' '}
              <a
                href={`https://instagram.com/${instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline font-medium"
              >
                @{instagramHandle}
              </a>
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-ink">
              Catalogue
            </h3>
            <ul className="space-y-2 text-xs text-muted font-light">
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
                <Link to="/shop?category=Gift Sets" className="hover:text-ink transition-colors">
                  Gift Sets
                </Link>
              </li>
              <li>
                <Link to="/deals" className="hover:text-ink transition-colors">
                  Deals &amp; Sets
                </Link>
              </li>
            </ul>
          </div>

          {/* About & Contact */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-ink">
              About
            </h3>
            <ul className="space-y-2 text-xs text-muted font-light">
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
                  Shipping &amp; Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Admin */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-ink">
              Legal
            </h3>
            <ul className="space-y-2 text-xs text-muted font-light">
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

        <div className="border-t border-line/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted font-light">
          <p>&copy; {new Date().getFullYear()} {brandName}. All rights reserved.</p>
          <p>Orders are placed via WhatsApp &amp; Instagram DM.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
