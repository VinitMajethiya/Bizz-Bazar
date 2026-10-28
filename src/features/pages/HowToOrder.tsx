import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useCMSPage } from '../../lib/api/pages';
import { MarkdownRenderer } from '../../components/ui/MarkdownRenderer';

export const HowToOrder: React.FC = () => {
  const { data: page, isLoading } = useCMSPage('how-to-order');

  const title = page?.title || 'How to Order';
  const metaDescription =
    page?.metaDescription ||
    'Simple guide to placing an order directly on WhatsApp or Instagram DM with By Raya.co.';

  return (
    <>
      <Helmet>
        <title>{title} — By Raya.co</title>
        <meta name="description" content={metaDescription} />
      </Helmet>

      <article className="max-w-site mx-auto px-5 md:px-8 py-12 md:py-16">
        <div className="max-w-2xl mx-auto space-y-6">
          <header className="space-y-2 border-b border-line pb-6">
            <h1 className="text-3xl font-light text-ink">{title}</h1>
          </header>

          {/* Signature Packaging Visual */}
          <div className="aspect-[21/9] sm:aspect-[16/7] w-full bg-surface border border-line overflow-hidden rounded-ui">
            <img
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=85"
              alt="By Raya signature gift packaging and unboxing"
              className="w-full h-full object-cover"
            />
          </div>

          {isLoading ? (
            <div className="space-y-3 py-6 animate-pulse">
              <div className="h-4 bg-line/50 rounded w-full" />
              <div className="h-4 bg-line/50 rounded w-5/6" />
              <div className="h-4 bg-line/50 rounded w-4/6" />
            </div>
          ) : (
            <MarkdownRenderer content={page?.bodyMd || ''} />
          )}
        </div>
      </article>
    </>
  );
};

export default HowToOrder;
