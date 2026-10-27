import React from 'react';

export const OurStory: React.FC = () => {
  return (
    <article className="max-w-site mx-auto px-5 md:px-8 py-12 md:py-16">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="space-y-2 border-b border-line pb-6">
          <span className="text-xs uppercase tracking-[0.2em] text-muted">About The Brand</span>
          <h1 className="text-3xl font-light text-ink">Our Story</h1>
        </header>

        <div className="space-y-4 text-sm text-ink/90 leading-relaxed font-light">
          <p>
            By Raya.co is jewellery for everyday wear: pieces that look expensive without the price tag.
          </p>
          <p>
            We believe that effortless elegance shouldn’t be reserved only for special occasions. Every piece in our collection is carefully selected for timeless aesthetic appeal, anti-tarnish durability, and daily comfort.
          </p>
          <p>
            Operating directly through personal chat and Instagram direct messages allows us to provide warm, attentive customer care with every piece packaged beautifully in our gift-ready boxes.
          </p>
        </div>
      </div>
    </article>
  );
};

export default OurStory;

