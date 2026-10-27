import React from 'react';

export const ShippingReturns: React.FC = () => {
  return (
    <article className="max-w-site mx-auto px-5 md:px-8 py-12 md:py-16">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="space-y-2 border-b border-line pb-6">
          <h1 className="text-3xl font-light text-ink">Shipping &amp; Returns</h1>
        </header>

        <div className="space-y-4 text-xs md:text-sm text-ink/90 leading-relaxed font-light">
          <h2 className="text-sm font-medium text-ink">Dispatch &amp; Delivery</h2>
          <p>
            Orders are confirmed directly in chat. We dispatch within 24 to 48 hours following confirmation. Delivery typically takes 3 to 7 working days across India, and tracking details are shared as soon as the package ships.
          </p>

          <h2 className="text-sm font-medium text-ink pt-2">Exchange Policy</h2>
          <p>
            Due to hygiene considerations, earrings cannot be returned unless received in a damaged or defective condition. If any item arrives damaged, please message us within 48 hours of delivery with photos, and we will promptly arrange an exchange.
          </p>
        </div>
      </div>
    </article>
  );
};

export default ShippingReturns;

