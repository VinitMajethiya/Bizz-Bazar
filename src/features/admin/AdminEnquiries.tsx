import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Download,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  Instagram,
  Radio,
  Calendar,
  X,
} from 'lucide-react';
import { useAdminPipeline } from '../../lib/hooks/useAdminOrders';
import { formatINR } from '../../lib/money';
import { formatAge } from '../../lib/orders/formatAge';
import { triggerCsvDownload } from '../../lib/orders/csvExport';
import { useToastStore } from '@/components/ui/toastStore';
import {
  exportOrdersToCsvString,
  type UnifiedPipelineStatus,
} from '../../lib/api/adminOrders';

const PIPELINE_TABS: Array<{ id: string; label: string; status?: UnifiedPipelineStatus }> = [
  { id: 'all', label: 'All Pipeline' },
  { id: 'new', label: 'New', status: 'new' },
  { id: 'confirmed', label: 'Confirmed', status: 'confirmed' },
  { id: 'processing', label: 'Processing', status: 'processing' },
  { id: 'packed', label: 'Packed', status: 'packed' },
  { id: 'shipped', label: 'Shipped', status: 'shipped' },
  { id: 'delivered', label: 'Delivered', status: 'delivered' },
  { id: 'cancelled', label: 'Cancelled', status: 'cancelled' },
  { id: 'dropped', label: 'Dropped', status: 'dropped' },
];

export const AdminEnquiries: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStatus = searchParams.get('status') || 'all';
  const currentChannel = searchParams.get('channel') || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const { showToast } = useToastStore();

  const {
    data: pipelineItems,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useAdminPipeline({
    status: currentStatus,
    channel: currentChannel,
    search: searchQuery,
  });

  const handleStatusTab = (statusId: string) => {
    const params = new URLSearchParams(searchParams);
    if (statusId === 'all') {
      params.delete('status');
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

  const handleDownloadCsv = async () => {
    setIsExporting(true);
    try {
      const csv = await exportOrdersToCsvString(
        exportStartDate || undefined,
        exportEndDate || undefined
      );
      const dateSuffix = new Date().toISOString().slice(0, 10);
      triggerCsvDownload(csv, `by-raya-orders-${dateSuffix}.csv`);
      showToast('Orders exported to CSV', 'success');
      setShowExportModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      showToast(msg, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-normal text-ink">
              Enquiries &amp; Orders
            </h1>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              title="Realtime sync enabled"
            >
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-xs text-muted font-light mt-0.5">
            Single unified pipeline from customer chat enquiry to delivered parcel
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="p-2 border border-line text-muted hover:text-ink transition-colors"
            aria-label="Refresh pipeline"
          >
            <RefreshCw
              className={`w-4 h-4 stroke-[1.5] ${isRefetching ? 'animate-spin' : ''}`}
            />
          </button>
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-line text-xs text-ink hover:bg-surface transition-colors"
          >
            <Download className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Bar (Pipeline Stepper Statuses) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-line text-xs font-light no-scrollbar">
        {PIPELINE_TABS.map((tab) => {
          const isActive = currentStatus === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleStatusTab(tab.id)}
              className={`px-3 py-1.5 whitespace-nowrap border text-xs transition-colors ${
                isActive
                  ? 'bg-ink text-bg border-ink font-normal'
                  : 'bg-surface border-line text-muted hover:text-ink hover:border-ink/50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Channel Filter row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-surface border border-line">
        <div className="relative sm:col-span-2 flex items-center">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 pointer-events-none stroke-[1.5]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ref (e.g. BR-7K3F), customer name, or items..."
            className="w-full bg-bg border border-line pl-9 pr-3 py-1.5 text-xs text-ink placeholder:text-muted focus:outline-none focus:border-ink font-light"
          />
        </div>

        <div>
          <label htmlFor="pipeline-channel-filter" className="sr-only">Channel</label>
          <select
            id="pipeline-channel-filter"
            value={currentChannel}
            onChange={(e) => handleChannelFilter(e.target.value)}
            className="w-full bg-bg border border-line px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-ink font-light"
          >
            <option value="all">All Channels</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
          </select>
        </div>
      </div>

      {/* Pipeline List View */}
      {isLoading ? (
        <div className="border border-line bg-surface p-12 text-center text-xs text-muted font-light">
          Loading order pipeline...
        </div>
      ) : error ? (
        <div className="border border-line bg-surface p-8 text-center space-y-3">
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            Failed to load pipeline
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 border border-line text-xs text-ink hover:bg-bg transition-colors"
          >
            Retry
          </button>
        </div>
      ) : !pipelineItems || pipelineItems.length === 0 ? (
        <div className="border border-line bg-surface p-12 text-center space-y-2">
          <p className="text-xs text-ink font-normal">No enquiries or orders found</p>
          <p className="text-[11px] text-muted font-light max-w-sm mx-auto">
            {searchQuery || currentStatus !== 'all' || currentChannel !== 'all'
              ? 'No items matched your current filters. Try resetting the status or channel filter.'
              : 'When customers tap "Order on WhatsApp" or "Order on Instagram", their enquiries will stream into this pipeline in realtime.'}
          </p>
        </div>
      ) : (
        <div className="border border-line bg-surface divide-y divide-line overflow-hidden">
          {pipelineItems.map((item) => {
            const isNewItem = item.displayStatus === 'new';

            return (
              <Link
                key={item.id}
                to={`/admin/enquiries/${item.id}`}
                className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-colors block ${
                  isNewItem
                    ? 'bg-accent/5 hover:bg-accent/10 border-l-2 border-l-accent'
                    : 'hover:bg-bg/40'
                }`}
              >
                {/* Reference, Channel, Customer & Items */}
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-medium text-ink">{item.ref}</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono uppercase bg-bg border border-line text-muted">
                      {item.channel === 'whatsapp' ? (
                        <>
                          <MessageCircle className="w-2.5 h-2.5 text-emerald-500" />
                          <span>WhatsApp</span>
                        </>
                      ) : (
                        <>
                          <Instagram className="w-2.5 h-2.5 text-pink-500" />
                          <span>Instagram</span>
                        </>
                      )}
                    </span>

                    {/* Status Pill */}
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider ${
                        item.displayStatus === 'new'
                          ? 'bg-accent text-bg font-normal'
                          : item.displayStatus === 'confirmed'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : item.displayStatus === 'processing'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : item.displayStatus === 'packed'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                          : item.displayStatus === 'shipped'
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                          : item.displayStatus === 'delivered'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : item.displayStatus === 'dropped'
                          ? 'bg-line text-muted'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                      }`}
                    >
                      {item.displayStatus}
                    </span>

                    {item.customerName && (
                      <span className="text-ink font-normal">
                        &bull; {item.customerName}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-muted truncate max-w-md font-light">
                    {item.itemsSummary}
                  </p>

                  {item.customerNote && (
                    <p className="text-[10px] text-ink/70 italic truncate max-w-md">
                      Note: &quot;{item.customerNote}&quot;
                    </p>
                  )}
                </div>

                {/* Subtotal / Age / Arrow */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-line text-right">
                  <span className="font-medium text-ink block text-sm">
                    {formatINR(item.totalPaise)}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted font-light">
                    <span>{formatAge(item.createdAt)}</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* CSV Date Range Export Modal */}
      {showExportModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="csv-export-dialog-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-sm bg-bg border border-line p-6 space-y-4 rounded-none">
            <div className="flex items-start justify-between">
              <div>
                <h2 id="csv-export-dialog-title" className="text-base font-normal text-ink">
                  Export Orders to CSV
                </h2>
                <p className="text-xs text-muted font-light mt-0.5">
                  Select date range or leave blank to export all orders
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-1 text-muted hover:text-ink"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-normal text-ink mb-1">
                  From Date <span className="text-muted font-light">(optional)</span>
                </label>
                <div className="relative flex items-center">
                  <Calendar className="w-3.5 h-3.5 text-muted absolute left-3 pointer-events-none" />
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="w-full bg-surface border border-line pl-9 pr-3 py-1.5 text-xs text-ink focus:outline-none focus:border-ink font-light"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-normal text-ink mb-1">
                  To Date <span className="text-muted font-light">(optional)</span>
                </label>
                <div className="relative flex items-center">
                  <Calendar className="w-3.5 h-3.5 text-muted absolute left-3 pointer-events-none" />
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    className="w-full bg-surface border border-line pl-9 pr-3 py-1.5 text-xs text-ink focus:outline-none focus:border-ink font-light"
                  />
                </div>
              </div>
            </div>

            <p className="text-[10px] text-muted font-light leading-relaxed">
              Export includes customer names, contact numbers, delivery addresses, itemized lines, and fulfillment statuses. Encoded in UTF-8 with BOM for Excel compatibility with sanitized formula injection defense.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-3.5 py-2 border border-line text-xs text-ink hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={handleDownloadCsv}
                className="px-4 py-2 bg-ink text-bg text-xs font-normal hover:bg-accent transition-colors disabled:opacity-50"
              >
                {isExporting ? 'Generating CSV...' : 'Download CSV'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEnquiries;
