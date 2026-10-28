import React from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  MessageCircle,
  Star,
  AlertTriangle,
  Users,
  Package,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useAdminOverview } from '../../lib/hooks/useAdmin';
import { formatINR } from '../../lib/money';

export const AdminOverview: React.FC = () => {
  const { data, isLoading, error, refetch, isRefetching } = useAdminOverview();

  const counters = [
    {
      label: 'New Enquiries',
      count: data?.counters.newEnquiries ?? 0,
      icon: Inbox,
      to: '/admin/enquiries?status=new',
      highlight: (data?.counters.newEnquiries ?? 0) > 0,
    },
    {
      label: 'Total Enquiries',
      count: data?.counters.totalEnquiries ?? 0,
      icon: MessageCircle,
      to: '/admin/enquiries?status=all',
      highlight: false,
    },
    {
      label: 'Live Products',
      count: data?.counters.liveProducts ?? 0,
      icon: Package,
      to: '/admin/products',
      highlight: false,
    },
    {
      label: 'Low Stock or Sold Out',
      count: data?.counters.lowStockOrSoldOut ?? 0,
      icon: AlertTriangle,
      to: '/admin/products?status=low_stock',
      highlight: (data?.counters.lowStockOrSoldOut ?? 0) > 0,
    },
    {
      label: 'Pending Reviews',
      count: data?.counters.pendingReviews ?? 0,
      icon: Star,
      to: '/admin/reviews?tab=pending',
      highlight: false,
    },
    {
      label: 'Drop Alert Sign-ups',
      count: data?.counters.dropAlertLeads ?? 0,
      icon: Users,
      to: '/admin/content',
      highlight: false,
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-normal text-ink">Overview</h1>
          <p className="text-xs text-muted font-light mt-0.5">Realtime metrics from your store</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="p-2 border border-line text-muted hover:text-ink transition-colors"
          aria-label="Refresh dashboard metrics"
        >
          <RefreshCw
            className={`w-4 h-4 stroke-[1.5] ${isRefetching ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-surface border border-red-500/20 text-xs text-ink space-y-2">
          <p className="text-red-600 dark:text-red-400 font-medium">Failed to load overview data</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs text-ink underline"
          >
            Retry
          </button>
        </div>
      ) : null}

      {/* Counters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {counters.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              to={c.to}
              className={`p-4 bg-surface border transition-colors ${
                c.highlight
                  ? 'border-accent/60 bg-accent/5'
                  : 'border-line hover:border-ink'
              }`}
            >
              <div className="flex items-center justify-between text-muted mb-2">
                <span className="text-[11px] font-light truncate">{c.label}</span>
                <Icon className="w-3.5 h-3.5 text-muted flex-shrink-0 stroke-[1.5]" />
              </div>
              <p className="text-2xl font-light text-ink">
                {isLoading ? '-' : c.count}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Five Latest Enquiries */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-normal text-ink">
              Latest Enquiries
            </h2>
            <p className="text-[11px] text-muted font-light">Recent customer requests from WhatsApp and Instagram</p>
          </div>
          <Link
            to="/admin/enquiries"
            className="text-xs text-ink hover:text-accent transition-colors flex items-center gap-1"
          >
            <span>View all</span>
            <ExternalLink className="w-3 h-3 stroke-[1.5]" />
          </Link>
        </div>

        {isLoading ? (
          <div className="border border-line bg-surface p-6 text-center text-xs text-muted font-light">
            Loading recent enquiries...
          </div>
        ) : !data?.latestEnquiries || data.latestEnquiries.length === 0 ? (
          <div className="border border-line bg-surface p-8 text-center space-y-1">
            <p className="text-xs text-ink font-normal">No enquiries yet</p>
            <p className="text-[11px] text-muted font-light">
              Customer enquiries from WhatsApp and Instagram DM will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="border border-line bg-surface divide-y divide-line overflow-hidden">
            {data.latestEnquiries.map((enq) => (
              <div
                key={enq.id}
                className="p-3.5 flex items-center justify-between gap-4 text-xs hover:bg-bg/50 transition-colors"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-ink font-medium">{enq.ref}</span>
                    <span className="px-1.5 py-0.5 text-[10px] font-mono bg-bg border border-line text-muted">
                      {enq.channel}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 text-[10px] font-mono lowercase ${
                        enq.status === 'new'
                          ? 'text-accent font-medium'
                          : 'text-muted'
                      }`}
                    >
                      {enq.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted truncate max-w-sm font-light">
                    {enq.itemsSummary}
                  </p>
                  {enq.customerNote && (
                    <p className="text-[10px] text-ink/70 italic truncate max-w-sm">
                      &quot;{enq.customerNote}&quot;
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-medium text-ink">{formatINR(enq.subtotalPaise)}</p>
                  <p className="text-[10px] text-muted font-light">
                    {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;
