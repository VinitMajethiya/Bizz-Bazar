import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings, useFeaturedProducts, useDropAlertMutation } from '../../lib/hooks/useCatalog';
import { useHomeTestimonials } from '../../lib/hooks/useReviews';
import { ProductCard } from '../../components/ui/ProductCard';
import { ProductGridSkeleton } from '../../components/ui/Skeleton';
import { StarRating } from '../../components/ui/StarRating';

const CATEGORIES_MOSAIC = [
  {
    name: 'Earrings',
    query: 'Earrings',
    span: 'col-span-1',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
    subtitle: 'Hoops, studs & drops',
  },
  {
    name: 'Bracelets',
    query: 'Bracelets',
    span: 'col-span-1',
    image: 'https://images.unsplash.com/photo-1611591475152-47354c86e246?auto=format&fit=crop&w=800&q=80',
    subtitle: 'Cuffs & delicate chains',
  },
  {
    name: 'Necklaces',
    query: 'Necklaces',
    span: 'col-span-1',
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80',
    subtitle: 'Pendants & layer pieces',
  },
  {
    name: 'Rings & Gift Sets',
    query: 'Gift Sets',
    span: 'col-span-1 sm:col-span-3',
    isWide: true,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80',
    subtitle: 'Curated gift boxes & stacks',
  },
];

const INSTAGRAM_POSTS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=600&q=80',
    alt: 'Gold twist hoops on linen',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    alt: 'Everyday elegance styling',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    alt: 'Layered gold chains',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=600&q=80',
    alt: 'Gift packaging and care card',
  },
];

export const Home: React.FC = () => {
  const { data: settings } = useSiteSettings();
  const instagramHandle = settings?.instagram_handle || 'by.raya.co';
  const instagramUrl = `https://www.instagram.com/${instagramHandle}`;
  const {
    data: featuredProducts,
    isLoading: featuredLoading,
    isError: featuredError,
    refetch: refetchFeatured,
  } = useFeaturedProducts(4);
  const { data: testimonials = [] } = useHomeTestimonials(6);

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

  const heroImage =
    settings?.hero_image_url ||
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=85';

  return (
    <div className="w-full">
      {/* 1. Hero Section (DESIGN.md: on mobile image sits on top and text below; on desktop headline bottom-left over image) */}
      <section className="relative w-full border-b border-line bg-surface overflow-hidden">
        <div className="max-w-site mx-auto">
          <div className="flex flex-col md:relative md:min-h-[520px] lg:min-h-[600px] md:justify-end">
            {/* Hero Photograph / Visual */}
            <div className="w-full aspect-[4/3] md:aspect-auto md:absolute md:inset-0 bg-surface overflow-hidden">
              <img
                src={heroImage}
                alt={settings?.hero_headline || 'By Raya jewellery collection'}
                className="w-full h-full object-cover"
              />
              {/* Desktop dark scrim for readability */}
              <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
            </div>

            {/* Hero Copy: sits below on mobile, anchored bottom-left on desktop */}
            <div className="bg-bg md:bg-transparent px-5 py-8 md:p-12 md:relative md:z-10 max-w-xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light leading-[1.08] text-ink md:text-white mb-3 drop-shadow-xs">
                {settings?.hero_headline || 'Effortless elegance for every occasion'}
              </h1>
              <p className="text-xs sm:text-sm text-muted md:text-white/90 leading-relaxed font-light mb-5 max-w-md">
                {settings?.hero_text || 'Everyday luxury, without the luxury price. Pick your piece and DM us to order.'}
              </p>
              <div>
                <Link
                  to="/shop"
                  className="text-xs font-normal text-ink md:text-white hover:text-accent underline underline-offset-4 transition-colors"
                >
                  Go to the catalogue
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
                <h3 className="text-xs font-medium text-ink">
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

          {featuredLoading && <ProductGridSkeleton count={4} />}

          {featuredError && (
            <div className="py-10 text-center space-y-2 border border-line/40 bg-surface/30 p-6">
              <p className="text-xs text-danger">We couldn’t load bestsellers. Check your connection.</p>
              <button
                type="button"
                onClick={() => refetchFeatured()}
                className="text-xs underline underline-offset-4 text-ink hover:text-accent"
              >
                Retry
              </button>
            </div>
          )}

          {!featuredLoading && !featuredError && featuredProducts && featuredProducts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
              {featuredProducts.map((product) => (
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
                className={`group relative bg-surface border border-line/60 overflow-hidden rounded-ui ${
                  cat.isWide ? 'aspect-[2/1] sm:aspect-[3/1]' : 'aspect-square'
                } ${cat.span} flex items-end p-5 transition-all duration-300 hover:border-accent hover:shadow-xs`}
              >
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10 group-hover:from-black/80 transition-colors" />
                </div>
                <div className="relative z-10 text-white">
                  <span className="text-sm sm:text-base font-normal tracking-wide block drop-shadow-sm">
                    {cat.name}
                  </span>
                  <span className="text-[11px] text-white/80 font-light block mt-0.5">
                    {cat.subtitle}
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
            <div className="aspect-[4/3] bg-surface border border-line/60 overflow-hidden rounded-ui">
              <img
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=85"
                alt="By Raya handcrafted demi-fine jewellery"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="space-y-4 max-w-lg">
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
                  className="text-xs font-normal text-ink hover:text-accent underline underline-offset-4 transition-colors"
                >
                  Read our story
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials (Rendered only when approved testimonials with show_on_home = true exist) */}
      {testimonials.length > 0 && (
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
                  className="bg-bg border border-line/60 p-6 space-y-3 rounded-ui"
                >
                  <StarRating rating={item.rating} size="sm" />
                  {item.title && (
                    <h3 className="text-xs font-medium text-ink">{item.title}</h3>
                  )}
                  <p className="text-xs sm:text-sm text-ink font-light italic leading-relaxed whitespace-pre-line">
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
      )}

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
                  className="px-5 py-2.5 bg-ink text-bg text-xs font-normal hover:bg-accent transition-colors rounded-ui focus:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-50"
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
            <h2 className="text-sm font-medium text-ink">
              On Instagram
            </h2>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline mt-1 inline-block font-light"
            >
              @{instagramHandle}
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {INSTAGRAM_POSTS.map((post) => (
              <a
                key={post.id}
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square bg-surface border border-line/60 overflow-hidden rounded-ui hover:border-accent transition-colors"
                aria-label={`View Instagram post: ${post.alt}`}
              >
                <img
                  src={post.image}
                  alt={post.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-[11px] font-medium bg-black/60 px-2.5 py-1 rounded-full">
                    @{instagramHandle}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
