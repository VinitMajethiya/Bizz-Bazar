import React from 'react';
import { Tag, Sparkles } from 'lucide-react';

export const DealsPage: React.FC = () => {
  return (
    <div className="max-w-site mx-auto px-5 md:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-ink">Special Offers &amp; Bundles</h1>
        <p className="text-xs text-muted mt-1">Exclusive discounts on curated jewellery sets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deal Card Placeholder */}
        <div className="border border-line bg-surface p-6 rounded-ui space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-accent font-medium bg-bg px-2.5 py-1 rounded-ui border border-line">
              <Tag className="w-3.5 h-3.5" /> 10% Off
            </span>
            <span className="text-[11px] text-muted">Limited time offer</span>
          </div>

          <div>
            <h2 className="text-lg font-normal text-ink">Welcome Drop Special</h2>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Use code <span className="font-mono font-medium text-ink">FIRST10</span> when ordering in chat to receive 10% off your entire first purchase.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-line text-xs">
            <span className="font-mono bg-bg border border-line px-3 py-1.5 rounded-ui text-ink select-all">
              FIRST10
            </span>
            <span className="text-[11px] text-muted">Active now</span>
          </div>
        </div>

        {/* Bundle Card Placeholder */}
        <div className="border border-line bg-surface p-6 rounded-ui space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-accent font-medium bg-bg px-2.5 py-1 rounded-ui border border-line">
              <Sparkles className="w-3.5 h-3.5" /> Curated Bundle
            </span>
            <span className="text-[11px] text-muted">Bestseller Set</span>
          </div>

          <div>
            <h2 className="text-lg font-normal text-ink">The Stacking Duo</h2>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Pair any cuff with matching hoops for a bundled price. Select your favourites in the catalogue.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-line text-xs">
            <span className="text-[11px] text-muted">Mention &quot;Stacking Duo&quot; in DM</span>
            <span className="text-ink font-medium">Save ₹300</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealsPage;
