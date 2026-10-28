import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PlaceholderProps {
  title: string;
  phase: string;
  description: string;
}

export const AdminPlaceholder: React.FC<PlaceholderProps> = ({ title, phase, description }) => {
  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Link
          to="/admin"
          className="p-2 border border-line text-muted hover:text-ink transition-colors"
          aria-label="Back to overview"
        >
          <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
        </Link>
        <div>
          <h1 className="text-xl font-normal text-ink">{title}</h1>
          <p className="text-xs text-muted font-light">{phase}</p>
        </div>
      </div>

      <div className="bg-surface border border-line p-8 text-center space-y-3">
        <span className="inline-block px-2.5 py-1 text-[10px] font-mono uppercase bg-bg border border-line text-muted">
          {phase}
        </span>
        <h2 className="text-sm font-normal text-ink">Coming in a later phase</h2>
        <p className="text-xs text-muted font-light max-w-md mx-auto leading-relaxed">
          {description}
        </p>
        <div className="pt-2">
          <Link
            to="/admin"
            className="inline-flex items-center justify-center px-4 py-2 bg-ink text-bg text-xs font-normal rounded-ui hover:bg-accent transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export const AdminReviewsPlaceholder: React.FC = () => (
  <AdminPlaceholder
    title="Customer Reviews"
    phase="Phase 6"
    description="Review moderation dashboard to approve, reject, or feature customer testimonials and offline reviews."
  />
);

export const AdminContentPlaceholder: React.FC = () => (
  <AdminPlaceholder
    title="Content & Settings"
    phase="Phase 7"
    description="Live CMS editor for our story, policy pages, Instagram bio sync, announcement ticker, and hero banner photos."
  />
);

