import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tag, Settings, ExternalLink, LogOut, Shield } from 'lucide-react';
import { signOutAdmin } from '../../lib/api/auth';
import { useToastStore } from '@/components/ui/toastStore';

export const AdminMore: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  const handleSignOut = async () => {
    try {
      await signOutAdmin();
      showToast('Signed out successfully', 'info');
      navigate('/admin/login', { replace: true });
    } catch {
      navigate('/admin/login', { replace: true });
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-xl font-normal text-ink">More Settings &amp; Tools</h1>
        <p className="text-xs text-muted font-light mt-1">Additional admin sections and actions</p>
      </div>

      <div className="border border-line divide-y divide-line bg-surface rounded-none">
        <Link
          to="/admin/deals"
          className="p-4 flex items-center justify-between hover:bg-bg transition-colors"
        >
          <div className="flex items-center gap-3">
            <Tag className="w-4 h-4 text-ink stroke-[1.5]" />
            <div>
              <p className="text-xs font-normal text-ink">Deals &amp; Discounts</p>
              <p className="text-[11px] text-muted font-light">Manage promotions and bundle offers</p>
            </div>
          </div>
          <span className="text-[10px] text-muted font-mono uppercase bg-bg px-2 py-0.5 border border-line">Phase 6</span>
        </Link>

        <Link
          to="/admin/content"
          className="p-4 flex items-center justify-between hover:bg-bg transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-ink stroke-[1.5]" />
            <div>
              <p className="text-xs font-normal text-ink">Content &amp; Site Settings</p>
              <p className="text-[11px] text-muted font-light">Customise announcement ticker, bio, and policy pages</p>
            </div>
          </div>
          <span className="text-[10px] text-muted font-mono uppercase bg-bg px-2 py-0.5 border border-line">Phase 7</span>
        </Link>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 flex items-center justify-between hover:bg-bg transition-colors"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4 text-ink stroke-[1.5]" />
            <div>
              <p className="text-xs font-normal text-ink">View Live Storefront</p>
              <p className="text-[11px] text-muted font-light">Open By Raya.co customer storefront in a new tab</p>
            </div>
          </div>
        </a>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-ink stroke-[1.5]" />
            <div>
              <p className="text-xs font-normal text-ink">Admin Session</p>
              <p className="text-[11px] text-muted font-light">Signed in as verified store administrator</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 border border-red-500/40 text-red-600 dark:text-red-400 text-xs font-normal hover:bg-red-500/10 transition-colors rounded-none"
        >
          <LogOut className="w-4 h-4 stroke-[1.5]" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default AdminMore;
