import React from 'react';
import { Plus, Tag } from 'lucide-react';

export const AdminDeals: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-light text-ink">Deals &amp; Offers</h1>
          <p className="text-xs text-muted mt-1">Configure active promotional coupons and bundles</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink text-bg text-xs uppercase tracking-wider font-medium rounded-ui hover:bg-accent transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Deal
        </button>
      </div>

      <div className="border border-line rounded-ui bg-surface divide-y divide-line">
        <div className="p-4 flex items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-accent" />
              <span className="font-medium text-ink">Welcome 10% Off</span>
              <span className="bg-bg border border-line px-1.5 py-0.5 text-[10px] text-accent font-mono rounded-ui">
                FIRST10
              </span>
            </div>
            <p className="text-muted text-[11px]">10% off all products &bull; Active</p>
          </div>
          <span className="px-2.5 py-1 text-[11px] bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 rounded-ui">
            Live
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminDeals;

