import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  MessageCircle,
  Instagram,
  CheckCircle,
  RotateCcw,
  AlertTriangle,
  X,
  FileText,
} from 'lucide-react';
import {
  useAdminEnquiryDetail,
  useAdminEnquiryMutations,
} from '../../lib/hooks/useAdminEnquiries';
import { formatINR } from '../../lib/money';
import { formatAge } from '../../lib/orders/formatAge';
import { buildAdminReplyMessage } from '../../lib/orders/replyBuilder';
import { useToastStore } from '@/components/ui/toastStore';

export const AdminEnquiryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: item, isLoading, error, refetch, isRefetching } = useAdminEnquiryDetail(id);
  const { updateStatus, isUpdatingStatus, saveNotes, isSavingNotes } = useAdminEnquiryMutations();
  const { showToast } = useToastStore();

  const [copied, setCopied] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [showDropConfirm, setShowDropConfirm] = useState(false);

  const fallbackTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync internal notes state when enquiry data loads
  useEffect(() => {
    if (item) {
      setInternalNotes(item.internalNotes || '');
    }
  }, [item]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl animate-pulse">
        <div className="h-6 w-32 bg-surface rounded-ui" />
        <div className="h-48 bg-surface rounded-ui" />
        <div className="h-64 bg-surface rounded-ui" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="p-8 bg-surface border border-line text-center space-y-4 max-w-md mx-auto my-12 rounded-ui">
        <p className="text-sm text-red-600">Enquiry not found or could not be loaded</p>
        <Link
          to="/admin/enquiries"
          className="inline-flex items-center gap-2 text-xs text-ink underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to inbox
        </Link>
      </div>
    );
  }

  // Copy reply message with robust clipboard API and execCommand fallback
  const handleCopyReplyMessage = async () => {
    const text = buildAdminReplyMessage({
      ref: item.ref,
      itemsSummary: item.itemsSummary,
      subtotalPaise: item.totalPaise,
    });

    let success = false;
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      try {
        await navigator.clipboard.writeText(text);
        success = true;
      } catch {
        success = false;
      }
    }

    if (!success && fallbackTextareaRef.current) {
      try {
        fallbackTextareaRef.current.value = text;
        fallbackTextareaRef.current.select();
        success = document.execCommand('copy');
      } catch {
        success = false;
      }
    }

    if (success) {
      setCopied(true);
      showToast('Reply message copied. Paste it in the chat.', 'success');
      setTimeout(() => setCopied(false), 3000);
    } else {
      showToast('Could not auto-copy. Select and copy from the text box.', 'error');
    }
  };

  const handleNotesBlur = async () => {
    if (item && internalNotes !== (item.internalNotes || '')) {
      await saveNotes({
        enquiryId: item.id,
        notes: internalNotes,
      });
    }
  };

  const replyPreviewText = buildAdminReplyMessage({
    ref: item.ref,
    itemsSummary: item.itemsSummary,
    subtotalPaise: item.totalPaise,
  });

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Hidden fallback textarea for non-secure contexts */}
      <textarea
        ref={fallbackTextareaRef}
        readOnly
        aria-hidden="true"
        className="sr-only"
        tabIndex={-1}
      />

      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
        <Link
          to="/admin/enquiries"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to inbox
        </Link>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="p-1.5 border border-line text-muted hover:text-ink transition-colors"
          aria-label="Refresh detail"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Header Info & Actions */}
      <div className="bg-surface border border-line p-5 rounded-ui space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-mono font-medium text-ink">{item.ref}</h1>

              {/* Channel badge */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono border rounded-ui ${
                  item.channel === 'whatsapp'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-purple-50 text-purple-800 border-purple-200'
                }`}
              >
                {item.channel === 'whatsapp' ? (
                  <MessageCircle className="w-3 h-3" />
                ) : (
                  <Instagram className="w-3 h-3" />
                )}
                {item.channel}
              </span>

              {/* Status Tag */}
              <span
                className={`px-2 py-0.5 text-xs font-mono rounded-ui ${
                  item.status === 'new'
                    ? 'bg-accent/15 text-accent font-medium'
                    : item.status === 'handled'
                      ? 'bg-bg text-ink border border-line font-medium'
                      : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {item.status}
              </span>
            </div>

            <p className="text-xs text-muted font-light">
              Created {formatAge(item.createdAt)} &bull;{' '}
              {new Date(item.createdAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {item.status === 'new' ? (
              <>
                <button
                  type="button"
                  onClick={() => updateStatus({ enquiryId: item.id, status: 'handled' })}
                  disabled={isUpdatingStatus}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink text-bg text-xs font-normal hover:bg-accent transition-colors rounded-ui"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Mark handled
                </button>
                <button
                  type="button"
                  onClick={() => setShowDropConfirm(true)}
                  disabled={isUpdatingStatus}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line text-xs text-muted hover:text-red-700 hover:border-red-300 transition-colors rounded-ui"
                >
                  Mark as dropped
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => updateStatus({ enquiryId: item.id, status: 'new' })}
                  disabled={isUpdatingStatus}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line text-xs text-ink hover:bg-bg transition-colors rounded-ui"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reopen
                </button>
                {item.status !== 'dropped' && (
                  <button
                    type="button"
                    onClick={() => setShowDropConfirm(true)}
                    disabled={isUpdatingStatus}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line text-xs text-muted hover:text-red-700 hover:border-red-300 transition-colors rounded-ui"
                  >
                    Mark as dropped
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              onClick={handleCopyReplyMessage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line bg-bg text-xs text-ink hover:border-accent transition-colors rounded-ui"
              title="Copy response template to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy reply</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Reply Message Box */}
        <div className="bg-bg/60 border border-line/70 p-3 rounded-ui space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted">
            <span className="flex items-center gap-1.5 font-medium text-ink">
              <FileText className="w-3 h-3" /> Reply message draft
            </span>
            <span>Formatted for chat</span>
          </div>
          <p className="text-xs font-mono text-ink/90 whitespace-pre-wrap select-all bg-surface p-2.5 border border-line/40 rounded-ui">
            {replyPreviewText}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-surface border border-line rounded-ui overflow-hidden">
        <div className="p-4 border-b border-line bg-bg/40">
          <h2 className="text-xs font-medium text-ink">
            Enquiry Items ({item.items.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-line/60 text-muted font-light bg-bg/20">
                <th className="py-2.5 px-4 font-normal">Piece</th>
                <th className="py-2.5 px-4 font-normal">Options</th>
                <th className="py-2.5 px-4 font-normal text-center">Qty</th>
                <th className="py-2.5 px-4 font-normal text-right">Price</th>
                <th className="py-2.5 px-4 font-normal text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/40 font-light">
              {item.items.map((it, idx) => (
                <tr key={idx} className="hover:bg-bg/30">
                  <td className="py-3 px-4 font-normal text-ink">{it.name}</td>
                  <td className="py-3 px-4 text-muted">
                    {it.options?.material && <span>{it.options.material}</span>}
                    {it.options?.size && (
                      <span className="ml-1.5 font-mono text-[11px]">[{it.options.size}]</span>
                    )}
                    {!it.options?.material && !it.options?.size && <span>&mdash;</span>}
                  </td>
                  <td className="py-3 px-4 text-center font-mono">{it.qty}</td>
                  <td className="py-3 px-4 text-right font-mono text-muted">
                    {formatINR(it.unit_price_paise)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-ink font-normal">
                    {formatINR(it.unit_price_paise * it.qty)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-line/80 bg-bg/40 font-medium">
                <td colSpan={4} className="py-2.5 px-4 text-right text-ink">
                  Total:
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-sm text-ink font-normal">
                  {formatINR(item.subtotalPaise)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Customer Note (rendered strictly as plain text) */}
      {item.customerNote && (
        <div className="bg-surface border border-line p-4 rounded-ui space-y-1.5">
          <h2 className="text-xs font-medium text-ink">
            Customer Gift Note / Custom Request
          </h2>
          <p className="text-xs text-ink/90 font-light italic bg-bg/40 p-3 rounded-ui border border-line/40">
            &quot;{item.customerNote}&quot;
          </p>
        </div>
      )}

      {/* Internal Notes Box (Autosave on blur with a toast) */}
      <div className="bg-surface border border-line p-4 rounded-ui space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="internal-notes" className="text-xs font-medium text-ink">
            Internal Notes
          </label>
          <span className="text-[10px] text-muted">Autosaves on blur</span>
        </div>
        <textarea
          id="internal-notes"
          rows={3}
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="Private notes (customer chat handle, custom requests, availability notes)..."
          className="w-full bg-bg border border-line text-ink text-xs p-3 rounded-ui focus:outline-none focus:border-accent font-light"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleNotesBlur}
            disabled={isSavingNotes || internalNotes === (item.internalNotes || '')}
            className="px-3 py-1 bg-ink text-bg text-[11px] font-normal rounded-ui hover:bg-accent disabled:opacity-40 transition-colors"
          >
            {isSavingNotes ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Marking as Dropped */}
      {showDropConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-surface border border-line max-w-sm w-full p-6 rounded-ui shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5 stroke-[1.5]" />
                <h3 className="text-sm font-medium text-ink">Mark Enquiry as Dropped?</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDropConfirm(false)}
                className="text-muted hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted font-light leading-relaxed">
              This moves enquiry <strong className="font-mono text-ink">{item.ref}</strong> to
              the Dropped view. You can reopen it at any time.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDropConfirm(false)}
                className="px-3 py-1.5 border border-line text-xs text-muted hover:text-ink transition-colors rounded-ui"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowDropConfirm(false);
                  await updateStatus({ enquiryId: item.id, status: 'dropped' });
                }}
                className="px-3 py-1.5 bg-red-600 text-white text-xs font-normal hover:bg-red-700 transition-colors rounded-ui"
              >
                Mark as dropped
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEnquiryDetail;
