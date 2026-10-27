import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Share2, MessageCircle, Instagram } from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedMaterial, setSelectedMaterial] = useState('Gold');
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>('material');

  const toggleAccordion = (key: string) => {
    setOpenAccordion(openAccordion === key ? null : key);
  };

  const displayName = slug
    ? slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'Jewellery Piece';

  return (
    <div className="max-w-site mx-auto px-5 md:px-8 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted mb-6 flex items-center gap-1.5" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-ink">Shop</Link>
        <span>/</span>
        <span className="text-ink truncate max-w-[200px]">{displayName}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Gallery column */}
        <div className="space-y-4">
          <div className="aspect-square bg-surface border border-line flex flex-col items-center justify-center p-6 text-center">
            <span className="text-sm text-muted">Primary product photo</span>
            <span className="text-xs text-muted/80 mt-1">Variant: {selectedMaterial}</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square bg-surface border border-line flex items-center justify-center text-[11px] text-muted cursor-pointer hover:border-ink transition-colors"
              >
                Thumb {i}
              </div>
            ))}
          </div>
        </div>

        {/* Details column */}
        <div className="space-y-6">
          <div>
            <span className="text-xs text-muted uppercase tracking-wider">Earrings</span>
            <h1 className="text-2xl md:text-3xl font-light text-ink mt-1">{displayName}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-lg font-medium text-ink">₹499</span>
              <span className="text-sm text-muted line-through">₹699</span>
              <span className="text-xs text-accent font-medium bg-surface px-1.5 py-0.5 rounded-ui">
                Save 29%
              </span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-400 mt-2 font-medium">
              In stock &bull; Ready to dispatch
            </p>
          </div>

          {/* Material Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-ink uppercase tracking-wider block">
              Material: <span className="font-normal text-muted">{selectedMaterial}</span>
            </label>
            <div className="flex gap-2">
              {['Gold', 'Silver', 'Rose Gold'].map((mat) => (
                <button
                  key={mat}
                  type="button"
                  onClick={() => setSelectedMaterial(mat)}
                  className={`min-h-[36px] px-3 py-1.5 text-xs rounded-ui border transition-colors ${
                    selectedMaterial === mat
                      ? 'border-ink bg-ink text-bg font-medium'
                      : 'border-line bg-surface text-ink hover:border-muted'
                  }`}
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-ink uppercase tracking-wider block">
              Quantity
            </label>
            <div className="inline-flex items-center border border-line rounded-ui bg-surface">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
                className="min-h-[36px] min-w-[36px] flex items-center justify-center text-ink hover:text-accent"
              >
                -
              </button>
              <span className="px-3 text-xs font-medium text-ink">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                aria-label="Increase quantity"
                className="min-h-[36px] min-w-[36px] flex items-center justify-center text-ink hover:text-accent"
              >
                +
              </button>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 bg-ink text-bg text-xs uppercase tracking-widest font-medium rounded-ui hover:bg-accent transition-colors focus-visible:ring-1 focus-visible:ring-accent"
            >
              <MessageCircle className="w-4 h-4" />
              Order on WhatsApp
            </button>
            <button
              type="button"
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 border border-ink text-ink text-xs uppercase tracking-widest font-medium rounded-ui hover:border-accent hover:text-accent transition-colors focus-visible:ring-1 focus-visible:ring-accent"
            >
              <Instagram className="w-4 h-4" />
              Order on Instagram
            </button>
            <button
              type="button"
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 border border-line bg-surface text-ink text-xs uppercase tracking-widest font-medium rounded-ui hover:bg-line/60 transition-colors focus-visible:ring-1 focus-visible:ring-accent"
            >
              Add to bag
            </button>
          </div>

          {/* 5 Accordions from CONTENT.md / PRD.md */}
          <div className="border-t border-line divide-y divide-line pt-2">
            {[
              {
                id: 'material',
                title: 'Material and specifications',
                body: 'Anti-tarnish plated brass or stainless steel, nickel-free. Exact weight and dimensions are crafted for comfortable daily wear.',
              },
              {
                id: 'sizing',
                title: 'Sizing guide',
                body: 'Hoops measure approximately 25mm across. Cuffs and chains are adjustable.',
              },
              {
                id: 'care',
                title: 'Care and maintenance',
                body: 'Keep it dry, put it on after perfume and lotion, and store it in the gift box when you are not wearing it.',
              },
              {
                id: 'packaging',
                title: 'Packaging and gifting',
                body: 'Every piece arrives safely packed in our signature gift box with a care card. Add a custom gift note in your bag.',
              },
              {
                id: 'shipping',
                title: 'Shipping, exchange and warranty',
                body: 'Orders dispatch in 24 to 48 hours. If a piece arrives damaged or faulty, message us within 48 hours for an exchange.',
              },
            ].map((section) => (
              <div key={section.id} className="py-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion(section.id)}
                  className="w-full flex items-center justify-between text-left text-xs font-medium text-ink uppercase tracking-wider py-1 focus-visible:ring-1 focus-visible:ring-accent"
                  aria-expanded={openAccordion === section.id}
                >
                  <span>{section.title}</span>
                  {openAccordion === section.id ? (
                    <ChevronUp className="w-4 h-4 text-muted" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted" />
                  )}
                </button>
                {openAccordion === section.id && (
                  <p className="mt-2 text-xs text-muted leading-relaxed font-light">
                    {section.body}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Social Share Link */}
          <div className="pt-2 flex items-center gap-2 text-xs text-muted">
            <Share2 className="w-3.5 h-3.5" />
            <span>Share piece: copy link from browser</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
