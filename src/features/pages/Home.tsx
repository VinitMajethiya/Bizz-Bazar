import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings, useFeaturedProducts, useReviews, useDropAlertMutation } from '../../lib/hooks/useCatalog';
import { ProductCard } from '../../components/ui/ProductCard';
import { ProductGridSkeleton } from '../../components/ui/Skeleton';
import { ImageWithFallback } from '../../components/ui/ImageWithFallback';

const CATEGORIES_MOSAIC = [
  { name: 'Earrings', query: 'Earrings', span: 'col-span-1' },
  { name: 'Bracelets', query: 'Bracelets', span: 'col-span-1' },
  { name: 'Necklaces', query: 'Necklaces', span: 'col-span-1' },
  { name: 'Rings & Gift Sets', query: 'Gift Sets', span: 'col-span-1 sm:col-span-3', isWide: true },
];

export const Home: React.FC = () => {
  const { data: settings } = useSiteSettings();
  const { data: featuredProducts, isLoading: featuredLoading } = useFeaturedProducts(4);
  const { data: reviewData } = useReviews();

  // Drop alert state
  const [contactInput, setContactInput] = useState('');
  const [dropAlertStatus, setDropAlertStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [dropAlertError, setDropAlertError] = useState('');
  const dropAlertMutation = useDropAlertMutation();

  const handleDropAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInput.trim()) return;

    try {
      setDropAlertError('');
      await dropAlertMutation.mutateAsync(contactInput);
      setDropAlertStatus('success');
      setContactInput('');
    } catch (err: unknown) {
      setDropAlertStatus('error');
      setDropAlertError(err instanceof Error ? err.message : 'Please enter a valid email or phone');
    }
  };

  const guarantees = settings?.guarantees || [
    { title: 'Anti-tarnish finish', text: 'Plated and sealed for daily wear.' },
    { title: 'Skin-friendly', text: 'Nickel-free and hypoallergenic.' },
    { title: 'Gift ready', text: 'Every order is packed in a gift box.' },
    { title: 'Order by DM', text: 'Message us and we’ll confirm everything in chat.' },
  ];

  const testimonials = reviewData?.reviews?.slice(0, 3) || [];

  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <section className="relative w-full border-b border-line bg-surface">
        <div className="max-w-site mx-auto">
          {/* Mobile: Image on top, text below. Desktop: Full photo with text overlaid bottom-left */}
          <div className="flex flex-col md:relative md:min-h-[520px] lg:min-h-[600px] justify-end">
            {/* Hero Photograph / Visual */}
            <div className="w-full aspect-[4/3] md:aspect-auto md:absolute md:inset-0 bg-surface overflow-hidden">
              {settings?.hero_image_url ? (
                <img
                  src={settings.hero_image_url}
                  alt={settings.hero_headline || 'By Raya jewellery collection'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#f2ece4] dark:bg-[#1f1918] flex flex-col items-center justify-center p-8 text-center">
                  <span className="text-3xl md:text-5xl font-light text-muted/40 font-serif mb-2">
                    By Raya.co
                  </span>
                  <p className="text-xs text-muted uppercase tracking-[0.25em]">
                    Everyday luxury, without the luxury price
                  </p>
                </div>
              )}
              {/* Desktop dark scrim for readability */}
              <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>

            {/* Hero Copy */}
            <div className="px-5 py-8 md:p-12 md:relative md:z-10 max-w-xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light leading-[1.08] text-ink md:text-white mb-3">
                {settings?.hero_headline || 'Effortless elegance for every occasion'}
              </h1>
              <p className="text-xs sm:text-sm text-muted md:text-white/90 leading-relaxed font-light mb-5 max-w-md">
                {settings?.hero_text || 'Everyday luxury, without the luxury price. Pick your piece and DM us to order.'}
              </p>
              <div>
                <Link
                  to="/shop"
                  className="text-xs uppercase tracking-widest font-medium text-ink md:text-white hover:text-accent underline underline-offset-8 transition-colors"
                >
                  Go to the catalogue &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Guarantees Section (Text only, no icons in circles - DESIGN.md) */}
      <section className="border-b border-line py-8 sm:py-10 bg-bg">
        <div className="max-w-site mx-auto px-5 md:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {guarantees.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <h3 className="text-xs font-medium text-ink uppercase tracking-wider">
                  {item.title}
                </h3>
                <p className="text-[12px] text-muted leading-relaxed font-light">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Bestsellers Row */}
      <section className="py-12 sm:py-16 border-b border-line">
        <div className="max-w-site mx-auto px-5 md:px-8">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <h2 className="text-lg font-normal text-ink">Bestsellers</h2>
              <p className="text-xs text-muted mt-0.5 font-light">
                Favourite pieces from the collection
              </p>
            </div>
            <Link
              to="/shop"
              className="text-xs text-ink hover:text-accent underline underline-offset-4 font-normal transition-colors"
            >
              View all
            </Link>
          </div>

          {featuredLoading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
              {featuredProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Category Mosaic */}
      <section className="py-12 sm:py-16 border-b border-line bg-bg">
        <div className="max-w-site mx-auto px-5 md:px-8">
          <div className="mb-8">
            <h2 className="text-lg font-normal text-ink">Shop by category</h2>
            <p className="text-xs text-muted mt-0.5 font-light">
              Crafted for everyday wear and layering
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CATEGORIES_MOSAIC.map((cat) => (
              <Link
                key={cat.name}
                to={`/shop?category=${encodeURIComponent(cat.query)}`}
                className={`group relative bg-surface border border-line/60 overflow-hidden ${
                  cat.isWide ? 'aspect-[2/1] sm:aspect-[3/1]' : 'aspect-square'
                } ${cat.span} flex items-end p-5 transition-transform duration-200 hover:border-ink/40`}
              >
                <div className="absolute inset-0 bg-surface transition-opacity group-hover:opacity-90 flex items-center justify-center">
                  <span className="text-4xl text-muted/20 font-serif select-none">
                    {cat.name.charAt(0)}
                  </span>
                </div>
                <div className="relative z-10">
                  <span className="text-xs uppercase tracking-widest font-medium text-ink group-hover:text-accent transition-colors">
                    {cat.name} &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Story Teaser */}
      <section className="py-14 sm:py-20 border-b border-line">
        <div className="max-w-site mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="aspect-[4/3] bg-surface border border-line/60 overflow-hidden">
              <ImageWithFallback
                src={null}
                alt="By Raya jewellery craft"
                fallbackInitial="R"
                aspectRatio="landscape"
              />
            </div>
            <div className="space-y-4 max-w-lg">
              <span className="text-xs uppercase tracking-[0.2em] text-muted font-medium">
                Our Story
              </span>
              <h2 className="text-2xl font-light text-ink leading-snug">
                Everyday luxury, without the luxury price
              </h2>
              <p className="text-xs sm:text-sm text-muted leading-relaxed font-light">
                {settings?.story_teaser ||
                  'By Raya.co is jewellery for everyday wear: pieces that look expensive without the price tag. We believe that effortless elegance should not be reserved only for special occasions.'}
              </p>
              <div className="pt-2">
                <Link
                  to="/our-story"
                  className="text-xs uppercase tracking-widest font-medium text-ink hover:text-accent underline underline-offset-4 transition-colors"
                >
                  Read our story &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className="py-12 sm:py-16 border-b border-line bg-surface">
        <div className="max-w-site mx-auto px-5 md:px-8">
          <div className="text-center max-w-md mx-auto mb-10">
            <h2 className="text-lg font-normal text-ink">What customers say</h2>
            <p className="text-xs text-muted mt-0.5 font-light">
              Real experiences from our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="bg-bg border border-line/60 p-6 space-y-3"
              >
                <p className="text-xs sm:text-sm text-ink font-light italic leading-relaxed">
                  “{item.reviewText}”
                </p>
                <div className="text-xs font-medium text-muted">
                  — {item.reviewerName}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Drop Alert Signup */}
      <section className="py-12 sm:py-16 border-b border-line bg-bg">
        <div className="max-w-md mx-auto px-5 text-center space-y-4">
          <h2 className="text-lg font-normal text-ink">
            Hear about new drops first
          </h2>
          <p className="text-xs text-muted font-light leading-relaxed">
            Get early access when new pieces land. No spam, ever.
          </p>

          {dropAlertStatus === 'success' ? (
            <div className="p-4 bg-surface border border-line text-xs font-medium text-ink">
              ✓ You’re on the list.
            </div>
          ) : (
            <form onSubmit={handleDropAlertSubmit} className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  placeholder="Email or phone number"
                  aria-label="Email or phone number for drop alerts"
                  className="flex-1 bg-surface border border-line px-3.5 py-2.5 text-xs text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent rounded-ui"
                  required
                />
                <button
                  type="submit"
                  disabled={dropAlertMutation.isPending}
                  className="px-5 py-2.5 bg-ink text-bg text-xs uppercase tracking-wider font-medium hover:bg-accent transition-colors rounded-ui focus:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-50"
                >
                  {dropAlertMutation.isPending ? 'Joining...' : 'Notify me'}
                </button>
              </div>
              {dropAlertError && (
                <p className="text-left text-[11px] text-danger">{dropAlertError}</p>
              )}
            </form>
          )}
        </div>
      </section>

      {/* 8. On Instagram Strip */}
      <section className="py-10 sm:py-14 bg-surface text-center border-b border-line">
        <div className="max-w-site mx-auto px-5 md:px-8">
          <div className="mb-6">
            <h2 className="text-sm uppercase tracking-widest font-medium text-ink">
              On Instagram
            </h2>
            <a
              href="https://instagram.com/by.raya.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline mt-1 inline-block"
            >
              @by.raya.co
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <a
                key={i}
                href="https://instagram.com/by.raya.co"
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square bg-bg border border-line/60 flex items-center justify-center text-xs text-muted hover:border-ink transition-colors"
                aria-label={`View Instagram post ${i}`}
              >
                <span className="text-[11px] font-light">@by.raya.co #{i}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
