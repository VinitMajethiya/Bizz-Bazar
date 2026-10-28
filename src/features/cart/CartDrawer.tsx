import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, MessageCircle, Instagram, AlertCircle, ShoppingBag } from 'lucide-react';
import { useCartStore } from './cartStore';
import { useProducts, useSiteSettings } from '../../lib/hooks/useCatalog';
import { formatINR } from '../../lib/money';
import { placeOrder, isOrderInProgress } from '../enquiries/placeOrder';
import { ImageWithFallback } from '../../components/ui/ImageWithFallback';

export const CartDrawer: React.FC = () => {
  const { lines, note, isOpen, closeDrawer, updateQty, removeLine, setNote } = useCartStore();
  const { data: allProducts } = useProducts();
  const { data: settings } = useSiteSettings();
  const [submitting, setSubmitting] = React.useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Manage focus trap and return focus on close
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);
    } else if (previouslyFocusedElement.current) {
      previouslyFocusedElement.current.focus();
    }
  }, [isOpen]);

  // Handle Escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDrawer();
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeDrawer]);

  if (!isOpen) return null;

  // Compute live line items and subtotal
  let subtotalPaise = 0;
  let hasBlockedItems = false;

  const enrichedLines = lines.map((line, index) => {
    const product = allProducts?.find((p) => p.id === line.productId);
    const isMissing = !product || product.isArchived;
    const isSoldOut = product?.stockStatus === 'sold_out';
    const isBlocked = isMissing || isSoldOut;

    if (isBlocked) {
      hasBlockedItems = true;
    } else if (product) {
      subtotalPaise += product.pricePaise * line.qty;
    }

    const heroImage = product?.images?.find((img) => img.isHero) || product?.images?.[0];

    return {
      ...line,
      index,
      product,
      isMissing,
      isSoldOut,
      isBlocked,
      heroImage,
    };
  });

  const handleOrder = async (channel: 'whatsapp' | 'instagram') => {
    if (submitting || isOrderInProgress() || hasBlockedItems || lines.length === 0) return;

    setSubmitting(true);
    try {
      await placeOrder({
        channel,
        lines,
        note,
        settings,
        isBagCheckout: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
      onClick={closeDrawer}
    >
      <div
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full bg-bg border-l border-line shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-250"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-normal text-ink">Your bag</h2>
            <span className="text-xs text-muted font-light">
              ({lines.reduce((acc, l) => acc + l.qty, 0)})
            </span>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={closeDrawer}
            aria-label="Close bag"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-muted hover:text-ink transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {lines.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <ShoppingBag className="w-10 h-10 text-muted/40 mx-auto stroke-[1]" />
              <p className="text-xs sm:text-sm text-ink font-light max-w-xs mx-auto leading-relaxed">
                Your bag is empty. Add a piece from the catalogue.
              </p>
              <div>
                <Link
                  to="/shop"
                  onClick={closeDrawer}
                  className="text-xs text-accent underline underline-offset-4 hover:text-ink transition-colors font-normal"
                >
                  Go to the catalogue
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Blocked items warning banner */}
              {hasBlockedItems && (
                <div className="p-3.5 bg-danger/10 border border-danger/30 text-danger text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p className="font-light leading-relaxed">
                    Some items in your bag are sold out or no longer available. Please remove them to place your order.
                  </p>
                </div>
              )}

              {/* Line items list */}
              <div className="divide-y divide-line/60">
                {enrichedLines.map((item) => (
                  <div key={`${item.productId}-${JSON.stringify(item.options)}`} className="py-4 flex gap-3.5">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 flex-shrink-0 bg-surface border border-line overflow-hidden">
                      <ImageWithFallback
                        src={item.heroImage?.imageUrl}
                        alt={item.product?.name || 'Jewellery piece'}
                        fallbackInitial={item.product?.name?.charAt(0) || 'R'}
                        aspectRatio="square"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xs font-normal text-ink leading-snug line-clamp-1">
                            {item.product?.name || 'Jewellery Piece'}
                          </h3>
                          <button
                            type="button"
                            onClick={() => removeLine(item.index)}
                            aria-label={`Remove ${item.product?.name || 'item'}`}
                            className="text-muted hover:text-danger transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                          </button>
                        </div>

                        {/* Selected options */}
                        {item.options && (item.options.material || item.options.size) && (
                          <p className="text-[11px] text-muted font-light">
                            {[item.options.material, item.options.size].filter(Boolean).join(' · ')}
                          </p>
                        )}

                        {/* Status warning if blocked */}
                        {item.isMissing ? (
                          <span className="text-[11px] text-danger font-medium block">
                            No longer available
                          </span>
                        ) : item.isSoldOut ? (
                          <span className="text-[11px] text-danger font-medium block">
                            Sold out &bull; Please remove
                          </span>
                        ) : (
                          <p className="text-xs font-normal text-ink pt-0.5">
                            {formatINR(item.product?.pricePaise || 0)}
                          </p>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      {!item.isBlocked && (
                        <div className="pt-2 flex items-center justify-between">
                          <div className="inline-flex items-center border border-line rounded-ui bg-surface">
                            <button
                              type="button"
                              onClick={() => updateQty(item.index, item.qty - 1, item.product?.stockQty)}
                              aria-label="Decrease quantity"
                              className="w-7 h-7 flex items-center justify-center text-xs text-ink hover:text-accent"
                            >
                              &minus;
                            </button>
                            <span className="px-2 text-xs font-medium text-ink">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.index, item.qty + 1, item.product?.stockQty)}
                              aria-label="Increase quantity"
                              className="w-7 h-7 flex items-center justify-center text-xs text-ink hover:text-accent"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-xs font-medium text-ink">
                            {formatINR((item.product?.pricePaise || 0) * item.qty)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Gift Note Section */}
              <div className="pt-2 space-y-1.5 border-t border-line">
                <label htmlFor="bag-gift-note" className="text-xs text-ink font-normal block">
                  Gift note or custom instructions
                </label>
                <textarea
                  id="bag-gift-note"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="E.g., Happy birthday Riya! (or specific size notes)"
                  className="w-full bg-surface border border-line rounded-ui p-2.5 text-xs text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent font-light"
                />
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer Pinned at Bottom */}
        {lines.length > 0 && (
          <div className="p-5 border-t border-line bg-surface/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted font-light">Subtotal</span>
              <span className="text-sm font-medium text-ink">{formatINR(subtotalPaise)}</span>
            </div>

            <p className="text-[11px] text-muted font-light">
              Orders are placed via chat. No online payment required.
            </p>

            <div className="space-y-2 pt-1">
              {/* Order on WhatsApp */}
              <button
                type="button"
                disabled={submitting || hasBlockedItems}
                onClick={() => handleOrder('whatsapp')}
                aria-label="Order on WhatsApp"
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 bg-ink text-bg text-xs font-normal rounded-ui hover:bg-accent transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <MessageCircle className="w-4 h-4 stroke-[1.5]" />
                {submitting ? 'Preparing...' : 'Order on WhatsApp'}
              </button>

              {/* Order on Instagram */}
              <button
                type="button"
                disabled={submitting || hasBlockedItems}
                onClick={() => handleOrder('instagram')}
                aria-label="Order on Instagram"
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 border border-ink text-ink text-xs font-normal rounded-ui hover:border-accent hover:text-accent transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Instagram className="w-4 h-4 stroke-[1.5]" />
                {submitting ? 'Preparing...' : 'Order on Instagram'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;

