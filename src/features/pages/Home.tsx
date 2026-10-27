import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, HeartHandshake, Gift } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full border-b border-line bg-surface overflow-hidden">
        <div className="max-w-site mx-auto px-5 md:px-8 py-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl space-y-5 text-center md:text-left">
            <span className="text-xs uppercase tracking-[0.25em] text-muted font-medium">
              By Raya.co Collection
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-ink leading-tight">
              Effortless elegance for every occasion
            </h1>
            <p className="text-sm md:text-base text-muted max-w-md mx-auto md:mx-0 leading-relaxed font-light">
              Everyday luxury, without the luxury price. Pick your piece and DM us on WhatsApp or Instagram to order.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <Link
                to="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-ink text-bg text-xs uppercase tracking-widest font-medium hover:bg-accent transition-colors rounded-ui focus-visible:ring-1 focus-visible:ring-accent"
              >
                Go to the catalogue
              </Link>
              <Link
                to="/deals"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-ink text-ink text-xs uppercase tracking-widest font-medium hover:border-accent hover:text-accent transition-colors rounded-ui focus-visible:ring-1 focus-visible:ring-accent"
              >
                View Live Deals
              </Link>
            </div>
          </div>

          {/* Hero Visual Placeholder */}
          <div className="w-full md:w-1/2 aspect-square max-w-md bg-bg border border-line flex flex-col items-center justify-center p-8 text-center">
            <Sparkles className="w-8 h-8 text-accent mb-3 stroke-[1.2]" />
            <p className="text-sm text-ink font-light italic">Everyday luxury</p>
            <p className="text-xs text-muted mt-1">Photo catalogue coming in Phase 1</p>
          </div>
        </div>
      </section>

      {/* Guarantees Section */}
      <section className="border-b border-line py-8 bg-bg">
        <div className="max-w-site mx-auto px-5 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="space-y-1">
              <ShieldCheck className="w-4 h-4 text-accent mx-auto md:mx-0 mb-1" />
              <h3 className="text-xs font-medium text-ink uppercase tracking-wider">Anti-tarnish</h3>
              <p className="text-[11px] text-muted">Plated &amp; sealed for daily wear</p>
            </div>
            <div className="space-y-1">
              <HeartHandshake className="w-4 h-4 text-accent mx-auto md:mx-0 mb-1" />
              <h3 className="text-xs font-medium text-ink uppercase tracking-wider">Skin-friendly</h3>
              <p className="text-[11px] text-muted">Nickel-free &amp; hypoallergenic</p>
            </div>
            <div className="space-y-1">
              <Gift className="w-4 h-4 text-accent mx-auto md:mx-0 mb-1" />
              <h3 className="text-xs font-medium text-ink uppercase tracking-wider">Gift Ready</h3>
              <p className="text-[11px] text-muted">Packed in a complimentary gift box</p>
            </div>
            <div className="space-y-1">
              <Sparkles className="w-4 h-4 text-accent mx-auto md:mx-0 mb-1" />
              <h3 className="text-xs font-medium text-ink uppercase tracking-wider">Order by DM</h3>
              <p className="text-[11px] text-muted">Instant confirmation in chat</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Preview */}
      <section className="py-14 md:py-20 max-w-site mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg md:text-xl font-normal text-ink">Bestsellers</h2>
            <p className="text-xs text-muted mt-0.5">Favourite pieces from the collection</p>
          </div>
          <Link
            to="/shop"
            className="text-xs text-ink hover:text-accent underline underline-offset-4 flex items-center gap-1 font-medium"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {['Lilac Twist Hoops', 'Ruby Claw Studs', 'Seashell Cuff', 'Bow Studs'].map((name, i) => (
            <Link
              key={name}
              to={`/product/${name.toLowerCase().replace(/\s+/g, '-')}`}
              className="group block space-y-2.5"
            >
              <div className="aspect-square bg-surface border border-line flex flex-col items-center justify-center p-4 text-center transition-transform group-hover:scale-[1.01]">
                <span className="text-xs text-muted font-light">Photo coming soon</span>
              </div>
              <div>
                <p className="text-[13px] text-ink font-normal group-hover:text-accent transition-colors">
                  {name}
                </p>
                <p className="text-[12px] text-muted mt-0.5">₹{499 + i * 150}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

