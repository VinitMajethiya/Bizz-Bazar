import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  Instagram,
  Radio,
} from 'lucide-react';
import { useAdminEnquiries } from '../../lib/hooks/useAdminEnquiries';
import { formatINR } from '../../lib/money';
import { formatAge } from '../../lib/orders/formatAge';
import type { EnquiryStatus } from '../../lib/database.types';

const STATUS_CHIPS: Array<{ id: string; label: string; status?: EnquiryStatus }> = [
  { id: 'new', label: 'New', status: 'new' },
  { id: 'handled', label: 'Handled', status: 'handled' },
  { id: 'dropped', label: 'Dropped', status: 'dropped' },
  { id: 'all', label: 'All' },
];

export const AdminEnquiries: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStatus = searchParams.get('status') || 'new';
  const currentChannel = searchParams.get('channel') || 'all';

  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: enquiries,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useAdminEnquiries({
    status: currentStatus,
    channel: currentChannel,
    search: searchQuery,
  });

  const handleStatusFilter = (statusId: string) => {
    const params = new URLSearchParams(searchParams);
    if (statusId === 'new') {
      params.delete('status'); // 'new' is default
    } else {
      params.set('status', statusId);
    }
    setSearchParams(params);
  };

  const handleChannelFilter = (channel: string) => {
    const params = new URLSearchParams(searchParams);
    if (channel === 'all') {
      params.delete('channel');
    } else {
      params.set('channel', channel);
    }
    setSearchParams(params);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-light text-ink">Enquiries</h1>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
              title="Realtime updates active"
            >
              <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-600" />
              Live
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            Incoming order enquiries from WhatsApp and Instagram DM
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="p-2 border border-line text-muted hover:text-ink transition-colors self-start sm:self-auto"
          aria-label="Refresh enquiries"
        >
          <RefreshCw
            className={`w-4 h-4 stroke-[1.5] ${isRefetching ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {/* Filter Chips: New, Handled, Dropped, All */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-line">
        {STATUS_CHIPS.map((chip) => {
          const isActive = currentStatus === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => handleStatusFilter(chip.id)}
              className={`px-3 py-1.5 text-xs font-normal whitespace-nowrap transition-colors rounded-ui ${
                isActive
                  ? 'bg-ink text-bg font-medium'
                  : 'text-muted hover:text-ink hover:bg-surface'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Search and Channel Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.5]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ref (e.g. BR-7K3F) or item name..."
            className="w-full bg-surface border border-line text-ink text-xs pl-9 pr-3 py-2 rounded-ui focus:outline-none focus:border-accent"
          />
        </div>

        {/* Channel Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted whitespace-nowrap">Channel:</span>
          <select
            value={currentChannel}
            onChange={(e) => handleChannelFilter(e.target.value)}
            className="bg-surface border border-line text-ink text-xs px-2.5 py-2 rounded-ui focus:outline-none focus:border-accent"
            aria-label="Channel"
          >
            <option value="all">All Channels</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
          </select>
        </div>
      </div>

      {/* Inbox List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-20 bg-surface border border-line/60 animate-pulse rounded-ui"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 bg-surface border border-line text-center space-y-3 rounded-ui">
            <p className="text-xs text-red-600">Failed to load enquiries</p>
            <button
              onClick={() => refetch()}
              className="text-xs underline text-muted hover:text-ink"
            >
              Retry
            </button>
          </div>
        ) : !enquiries || enquiries.length === 0 ? (
          <div className="p-12 bg-surface border border-line text-center space-y-2 rounded-ui">
            <p className="text-sm font-normal text-ink">No enquiries found</p>
            <p className="text-xs text-muted font-light max-w-sm mx-auto">
              {searchQuery || currentStatus !== 'all' || currentChannel !== 'all'
                ? 'Try adjusting your search query or filters.'
                : 'When customers tap "Order on WhatsApp" or "Order on Instagram", their enquiries will appear here in realtime.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {enquiries.map((item) => {
              const isNew = item.status === 'new';

              return (
                <Link
                  key={item.id}
                  to={`/admin/enquiries/${item.id}`}
                  className={`block border transition-colors rounded-ui p-4 bg-surface hover:border-accent/60 ${
                    isNew
                      ? 'border-accent/40 bg-accent/[0.02] shadow-sm'
                      : 'border-line/70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Ref, Channel, Age, Items */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-medium text-ink">
                          {item.ref}
                        </span>

                        {/* Channel Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono border rounded-ui ${
                            item.channel === 'whatsapp'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}
                        >
                          {item.channel === 'whatsapp' ? (
                            <MessageCircle className="w-2.5 h-2.5" />
                          ) : (
                            <Instagram className="w-2.5 h-2.5" />
                          )}
                          {item.channel}
                        </span>

                        {/* Relative Age */}
                        <span className="text-[11px] text-muted font-light">
                          {formatAge(item.createdAt)}
                        </span>

                        {/* Status Tag */}
                        <span
                          className={`px-2 py-0.5 text-[10px] font-mono rounded-ui ${
                            item.status === 'new'
                              ? 'bg-accent/15 text-accent font-medium'
                              : item.status === 'handled'
                                ? 'bg-bg text-ink border border-line'
                                : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      {/* Items summary */}
                      <p className="text-xs text-ink/90 font-light truncate max-w-xl">
                        {item.itemsSummary}
                      </p>

                      {/* Customer Note Preview */}
                      {item.customerNote && (
                        <p className="text-[11px] text-muted italic truncate max-w-lg">
                          &quot;{item.customerNote}&quot;
                        </p>
                      )}
                    </div>

                    {/* Right: Subtotal & Link */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-line/40 shrink-0">
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-medium text-ink">
                          {formatINR(item.subtotalPaise)}
                        </p>
                      </div>
                      <span className="text-[11px] text-accent flex items-center gap-1 sm:mt-1 hover:underline">
                        View <ExternalLink className="w-3 h-3 stroke-[1.5]" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEnquiries;
