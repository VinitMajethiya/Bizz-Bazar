import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, Instagram, ShoppingBag, ZoomIn, X } from 'lucide-react';
import { useProduct, useRelatedProducts, useSiteSettings } from '../../lib/hooks/useCatalog';
import { useProductReviewStats } from '../../lib/hooks/useReviews';
import { useCartStore, type CartLine } from '../cart/cartStore';
import { placeOrder, isOrderInProgress } from '../enquiries/placeOrder';
import { ProductCard } from '../../components/ui/ProductCard';
import { PriceTag } from '../../components/ui/PriceTag';
import { Accordion } from '../../components/ui/Accordion';
import { StarRating } from '../../components/ui/StarRating';
import { ImageWithFallback } from '../../components/ui/ImageWithFallback';
import { ProductDetailSkeleton } from '../../components/ui/Skeleton';
import { ProductReviewsSection } from '../reviews/ProductReviewsSection';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: product, isLoading, isError } = useProduct(slug);
  const { data: reviewStats } = useProductReviewStats(product?.id);
  const { data: relatedProducts } = useRelatedProducts(
    product?.category || '',
    product?.id || ''
  );
  const { data: settings } = useSiteSettings();
  const { addLine, openDrawer } = useCartStore();

  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  // Sync default options when product loads
  useEffect(() => {
    if (product) {
      if (product.options.materials.length > 0) {
        setSelectedMaterial(product.options.materials[0]);
      }
      if (product.options.sizes.length > 0) {
        setSelectedSize(product.options.sizes[0]);
      }
      setActiveImageIndex(0);
      setQuantity(1);
    }
  }, [product]);

  // Variant-aware gallery image: when material changes, look for matching image
  const handleMaterialChange = (mat: string) => {
    setSelectedMaterial(mat);
    if (!product || product.images.length === 0) return;

    const variantIndex = product.images.findIndex(
      (img) => img.variantKey?.toLowerCase() === mat.toLowerCase()
    );
    if (variantIndex !== -1) {
      setActiveImageIndex(variantIndex);
    }
  };

  const handleAddToBag = () => {
    if (isSoldOut || !product) return;
    addLine(
      {
        productId: product.id,
        options: {
          ...(selectedMaterial ? { material: selectedMaterial } : {}),
          ...(selectedSize ? { size: selectedSize } : {}),
        },
        qty: quantity,
      },
      product.stockQty
    );
    openDrawer();
  };

  const handleDirectOrder = async (channel: 'whatsapp' | 'instagram') => {
    if (isSoldOut || !product || isOrdering || isOrderInProgress()) return;

    setIsOrdering(true);
    try {
      const line: CartLine = {
        productId: product.id,
        options: {
          ...(selectedMaterial ? { material: selectedMaterial } : {}),
          ...(selectedSize ? { size: selectedSize } : {}),
        },
        qty: quantity,
      };

      await placeOrder({
        channel,
        lines: [line],
        note: null,
        settings,
        isFromBag: false,
      });
    } finally {
      setIsOrdering(false);
    }
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !product) {
    return (
      <div className="max-w-site mx-auto px-5 py-24 text-center space-y-4">
        <h1 className="text-2xl font-light text-ink">Piece not found</h1>
        <p className="text-xs text-muted">
          The piece you are looking for may have been archived or removed.
        </p>
        <div>
          <Link
            to="/shop"
            className="text-xs font-normal text-accent underline underline-offset-4"
          >
            Back to the catalogue
          </Link>
        </div>
      </div>
    );
  }

  const isSoldOut = product.stockStatus === 'sold_out';
  const isLowStock = product.stockStatus === 'low_stock';
  const activeImage = product.images[activeImageIndex] || product.images[0];
  const maxQty = product.stockQty ? Math.min(10, product.stockQty) : 10;

  // Accordion Items
  const accordionItems = [
    {
      id: 'specs',
      title: 'Material and specifications',
      content: (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {Object.entries(product.specs).map(([key, value]) => (
            <div key={key} className="space-y-0.5">
              <dt className="text-muted font-normal">{key}</dt>
              <dd className="text-ink font-light">{value}</dd>
            </div>
          ))}
          {Object.keys(product.specs).length === 0 && (
            <p className="text-muted">
              Anti-tarnish plated brass or stainless steel, nickel-free and hypoallergenic.
            </p>
          )}
        </dl>
      ),
    },
    {
      id: 'sizing',
      title: 'Sizing guide',
      content: (
        <p>
          Cuffs and chains are adjustable to comfortably fit most wrist and neck sizes. Hoops measure approximately 20 to 25 mm across unless noted. For ring sizing, measure the inside diameter of a ring you already wear.
        </p>
      ),
    },
    {
      id: 'care',
      title: 'Care and maintenance',
      content: (
        <p>
          Keep it dry, put it on after applying perfume and lotion, and store it in your By Raya signature box when not wearing it. Avoid swimming and showering with your pieces.
        </p>
      ),
    },
    {
      id: 'packaging',
      title: 'Packaging and gifting',
      content: (
        <p>
          Every piece comes in a gift box with a care card. Add a gift note in your bag.
        </p>
      ),
    },
  ];

  return (
    <div className="max-w-site mx-auto px-5 md:px-8 py-8 md:py-12">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-muted mb-6 flex items-center gap-1.5" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-ink transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-ink transition-colors">
          Catalogue
        </Link>
        <span>/</span>
        <Link
          to={`/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:text-ink transition-colors"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-ink truncate max-w-[200px]" aria-current="page">
          {product.name}
        </span>
      </nav>

      {/* Main Product Layout: 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 pb-16 border-b border-line">
        {/* Gallery Column */}
        <div className="space-y-3">
          {/* Main Visual */}
          <div className="relative aspect-square bg-surface border border-line/60 overflow-hidden group">
            <ImageWithFallback
              src={activeImage?.imageUrl}
              alt={activeImage?.alt || product.name}
              fallbackInitial={product.name.charAt(0)}
              aspectRatio="square"
            />

            {/* Tap to zoom button */}
            {activeImage?.imageUrl && (
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                aria-label="Zoom product photograph"
                className="absolute bottom-3 right-3 p-2 bg-bg/90 backdrop-blur-sm text-ink border border-line rounded-ui opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus-visible:ring-1 focus-visible:ring-accent"
              >
                <ZoomIn className="w-4 h-4 stroke-[1.5]" />
              </button>
            )}
          </div>

          {/* Thumbnails row */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
              {product.images.map((img, idx) => {
                const isActive = idx === activeImageIndex;
                return (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`View photo ${idx + 1}`}
                    className={`aspect-square bg-surface border overflow-hidden transition-colors rounded-none focus:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
                      isActive ? 'border-ink ring-1 ring-ink' : 'border-line/60 hover:border-ink/50'
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.alt || `${product.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="space-y-6">
          {/* Header & Pricing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <Link
                to={`/shop?category=${encodeURIComponent(product.category)}`}
                className="text-xs text-muted hover:text-accent font-normal transition-colors"
              >
                {product.category}
              </Link>
              {reviewStats && reviewStats.totalReviews > 0 && (
                <StarRating
                  rating={reviewStats.averageRating}
                  totalReviews={reviewStats.totalReviews}
                  showNumber
                />
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-light text-ink leading-tight">
              {product.name}
            </h1>

            <PriceTag
              pricePaise={product.pricePaise}
              compareAtPricePaise={product.compareAtPricePaise}
              showSavingPercent
              size="lg"
            />

            {/* Stock indicator */}
            <div className="pt-1">
              {isSoldOut ? (
                <span className="text-xs font-normal text-muted inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-muted" /> Sold out &bull; Back soon
                </span>
              ) : isLowStock ? (
                <span className="text-xs font-normal text-danger inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-danger animate-pulse" /> Only a few left in stock
                </span>
              ) : (
                <span className="text-xs font-normal text-ink inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-600" /> In stock &bull; Available
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-xs sm:text-sm text-muted leading-relaxed font-light">
              {product.description}
            </p>
          )}

          {/* Material Selector Chips */}
          {product.options.materials.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-normal text-ink block">
                Material: <span className="font-light text-muted">{selectedMaterial}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.options.materials.map((mat) => {
                  const isSelected = selectedMaterial === mat;
                  return (
                    <button
                      key={mat}
                      type="button"
                      disabled={isSoldOut}
                      onClick={() => handleMaterialChange(mat)}
                      className={`min-h-[38px] px-3.5 py-1.5 text-xs rounded-ui border transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
                        isSelected
                          ? 'border-ink bg-ink text-bg font-medium'
                          : 'border-line bg-surface text-ink hover:border-muted font-light'
                      } ${isSoldOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {mat}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector Chips */}
          {product.options.sizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-normal text-ink block">
                Size: <span className="font-light text-muted">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.options.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={isSoldOut}
                      onClick={() => setSelectedSize(size)}
                      className={`min-h-[38px] px-3.5 py-1.5 text-xs rounded-ui border transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
                        isSelected
                          ? 'border-ink bg-ink text-bg font-medium'
                          : 'border-line bg-surface text-ink hover:border-muted font-light'
                      } ${isSoldOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-xs font-normal text-ink block">
              Quantity
            </label>
            <div className="inline-flex items-center border border-line rounded-ui bg-surface">
              <button
                type="button"
                disabled={isSoldOut || quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center text-ink hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &minus;
              </button>
              <span className="px-4 text-xs font-medium text-ink">{quantity}</span>
              <button
                type="button"
                disabled={isSoldOut || quantity >= maxQty}
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                aria-label="Increase quantity"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center text-ink hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          {/* Three Primary Order Buttons */}
          <div className="space-y-2.5 pt-2">
            {/* 1. Order on WhatsApp (Solid Ink) */}
            <button
              type="button"
              disabled={isSoldOut || isOrdering}
              onClick={() => handleDirectOrder('whatsapp')}
              aria-label={isSoldOut ? 'Sold out' : 'Order on WhatsApp'}
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 bg-ink text-bg text-xs font-normal rounded-ui hover:bg-accent transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-40 disabled:hover:bg-ink disabled:cursor-not-allowed"
            >
              <MessageCircle className="w-4 h-4 stroke-[1.5]" />
              {isSoldOut ? 'Sold out' : isOrdering ? 'Preparing...' : 'Order on WhatsApp'}
            </button>

            {/* 2. Order on Instagram (Outlined) */}
            <button
              type="button"
              disabled={isSoldOut || isOrdering}
              onClick={() => handleDirectOrder('instagram')}
              aria-label={isSoldOut ? 'Sold out' : 'Order on Instagram'}
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 border border-ink text-ink text-xs font-normal rounded-ui hover:border-accent hover:text-accent transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-40 disabled:hover:border-ink disabled:hover:text-ink disabled:cursor-not-allowed"
            >
              <Instagram className="w-4 h-4 stroke-[1.5]" />
              {isSoldOut ? 'Sold out' : isOrdering ? 'Preparing...' : 'Order on Instagram'}
            </button>

            {/* 3. Add to Bag (Outlined Surface) */}
            <button
              type="button"
              disabled={isSoldOut}
              onClick={handleAddToBag}
              aria-label={isSoldOut ? 'Sold out' : 'Add to bag'}
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 border border-line bg-surface text-ink text-xs font-normal rounded-ui hover:bg-line/60 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
              {isSoldOut ? 'Sold out' : 'Add to bag'}
            </button>
          </div>

          {/* 5 Accordions */}
          <div className="pt-2">
            <Accordion items={accordionItems} defaultOpenId="specs" />
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <ProductReviewsSection productId={product.id} productName={product.name} />

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="py-12">
          <div className="mb-6">
            <h2 className="text-lg font-normal text-ink">You might also like</h2>
            <p className="text-xs text-muted font-light mt-0.5">
              More pieces in {product.category}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Zoom Lightbox Modal */}
      {isZoomOpen && activeImage?.imageUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsZoomOpen(false)}
        >
          <div className="relative max-w-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              aria-label="Close zoom preview"
              className="absolute top-3 right-3 p-2 bg-bg text-ink rounded-full z-10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
            <img
              src={activeImage.imageUrl}
              alt={activeImage.alt || product.name}
              className="max-h-[85vh] w-auto mx-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
