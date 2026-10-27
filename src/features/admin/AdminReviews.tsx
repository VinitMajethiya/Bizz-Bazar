import React from 'react';
import { Star, Plus, Check, X, Trash2 } from 'lucide-react';

export const AdminReviews: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-light text-ink">Reviews Moderation</h1>
          <p className="text-xs text-muted mt-1">Approve customer feedback and record offline testimonials</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink text-bg text-xs uppercase tracking-wider font-medium rounded-ui hover:bg-accent transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-line text-xs">
        <button className="px-3 py-1.5 border-b-2 border-accent text-accent font-medium">
          Pending (2)
        </button>
        <button className="px-3 py-1.5 text-muted hover:text-ink">
          Approved (12)
        </button>
        <button className="px-3 py-1.5 text-muted hover:text-ink">
          Rejected (1)
        </button>
      </div>

      {/* Review Queue */}
      <div className="space-y-4">
        <div className="border border-line rounded-ui bg-surface p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-accent">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span className="text-[10px] text-muted">Submitted 1 hour ago</span>
          </div>

          <div>
            <h3 className="text-xs font-medium text-ink">“Looks way more expensive than it is.”</h3>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">
              Bought the Lilac Twist Hoops. The finish is stunning and completely skin-friendly!
            </p>
            <p className="text-[11px] text-ink font-medium mt-1">Riya &bull; Pune</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
            <button
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs border border-line rounded-ui text-danger hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs border border-line rounded-ui text-muted hover:text-ink transition-colors"
            >
              <X className="w-3 h-3" /> Reject
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-ink text-bg rounded-ui hover:bg-accent transition-colors font-medium"
            >
              <Check className="w-3 h-3" /> Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;
