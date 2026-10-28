import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MessageCircle, Instagram, ShoppingBag } from 'lucide-react';

export const HowToOrder: React.FC = () => {
  return (
    <article className="max-w-site mx-auto px-5 md:px-8 py-12 md:py-16">
      <Helmet>
        <title>How to Order | By Raya.co</title>
        <meta
          name="description"
          content="Simple, personal ordering via chat. Browse our catalogue and place your order on WhatsApp or Instagram DM."
        />
      </Helmet>

      <div className="max-w-2xl mx-auto space-y-8">
        <header className="space-y-2 border-b border-line pb-6">
          <h1 className="text-3xl font-light text-ink">How to order</h1>
          <p className="text-xs text-muted font-light">
            We operate as a personal, digital catalogue. Here is how ordering works.
          </p>
        </header>

        <div className="space-y-8 text-xs md:text-sm text-ink/90 leading-relaxed font-light">
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-surface border border-line flex items-center justify-center shrink-0 text-muted">
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-medium text-ink">1. Browse and pick your pieces</h2>
              <p>
                Explore our catalogue and add pieces you love to your bag. Choose your preferred material or size if options are available, and add an optional gift note or custom request.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-surface border border-line flex items-center justify-center shrink-0 text-muted">
              <MessageCircle className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-medium text-ink">2. Tap Order on WhatsApp or Instagram</h2>
              <p>
                From your bag, tap <strong>Order on WhatsApp</strong> or <strong>Order on Instagram</strong>. An enquiry record with your selected pieces and enquiry reference number is saved automatically so your request is never lost.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-surface border border-line flex items-center justify-center shrink-0 text-muted">
              <Instagram className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-medium text-ink">3. We confirm availability and details in chat</h2>
              <p>
                We review your enquiry, confirm stock availability, and finalize details directly with you in chat. [owner: add specific payment instructions, delivery zones, and response times here]
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-line space-y-2 text-xs text-muted">
            <p>
              Have a question before ordering? Reach out to us anytime on WhatsApp or DM us at <a href="https://instagram.com/by.raya.co" target="_blank" rel="noopener noreferrer" className="text-accent underline">@by.raya.co</a>.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default HowToOrder;
