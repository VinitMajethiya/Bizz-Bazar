import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useCMSPage } from '../../lib/api/pages';
import { MarkdownRenderer } from '../../components/ui/MarkdownRenderer';

export const OurStory: React.FC = () => {
  const { data: page, isLoading } = useCMSPage('our-story');

  const title = page?.title || 'Our Story';
  const metaDescription =
    page?.metaDescription ||
    'By Raya.co is jewellery for everyday wear: pieces that look expensive without the price tag.';

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

export default OurStory;
