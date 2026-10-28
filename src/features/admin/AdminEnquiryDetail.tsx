import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  Truck,
  MessageCircle,
  Instagram,
  ShoppingBag,
  User,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  useAdminPipelineItem,
  useAdminOrderMutations,
} from '../../lib/hooks/useAdminOrders';
import { formatINR } from '../../lib/money';
import { formatAge } from '../../lib/orders/formatAge';
import { buildAdminReplyMessage } from '../../lib/orders/replyBuilder';
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  isValidOrderTransition,
} from '../../lib/orders/statusStepper';
import { ConvertOrderModal } from './ConvertOrderModal';
import { useToastStore } from '@/components/ui/toastStore';
import type { OrderStatus } from '../../lib/database.types';

export const AdminEnquiryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToastStore();

  const { data: item, isLoading, error, refetch } = useAdminPipelineItem(id);
  const {
    updateEnquiryStatus,
    isUpdatingEnquiryStatus,
    updateOrderStatus,
    isUpdatingOrderStatus,
    updateOrderDetails,
    isUpdatingOrderDetails,
  } = useAdminOrderMutations();

  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showShippedModal, setShowShippedModal] = useState(false);
  const [courierInput, setCourierInput] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [copiedReply, setCopiedReply] = useState(false);

  // Sync state when data loads
  React.useEffect(() => {
    if (item) {
      setCourierInput(item.courier || '');
      setTrackingInput(item.trackingNumber || '');
      setNotesInput(item.internalNotes || '');
      setCustName(item.customerName || '');
      setCustPhone(item.customerPhone || '');
      setCustAddress(item.shippingAddress || '');
    }
  }, [item]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-muted font-light">
        Loading details...
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="p-8 text-center space-y-3 bg-surface border border-line max-w-lg mx-auto">
        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
          Enquiry or order not found
        </p>
        <Link
          to="/admin/enquiries"
          className="inline-block px-4 py-2 border border-line text-xs text-ink hover:bg-bg"
        >
          Return to Enquiries &amp; Orders
        </Link>
      </div>
    );
  }

  const isOrder = Boolean(item.orderId);

  const handleCopyReplyMessage = async () => {
    const text = buildAdminReplyMessage({
      ref: item.ref,
      subtotalPaise: item.subtotalPaise,
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

    if (!success) {
      try {
        const temp = document.createElement('textarea');
        temp.value = text;
        temp.setAttribute('readonly', '');
        temp.style.position = 'fixed';
        temp.style.left = '-9999px';
        document.body.appendChild(temp);
        temp.select();
        success = document.execCommand('copy');
        document.body.removeChild(temp);
      } catch {
        success = false;
      }
    }

    if (success) {
      setCopiedReply(true);
      showToast('Order reply copied. Paste it in the chat.', 'success');
      setTimeout(() => setCopiedReply(false), 2500);
    } else {
      showToast('Could not auto-copy reply text.', 'info');
    }
  };

  const handleStatusStep = async (newStatus: OrderStatus) => {
    if (!item.orderId) return;

    if (newStatus === 'shipped') {
      setShowShippedModal(true);
      return;
    }

    if (newStatus === 'cancelled') {
      setShowCancelModal(true);
      return;
    }

    await updateOrderStatus({
      orderId: item.orderId,
      status: newStatus,
    });
  };

  const handleConfirmShipped = async () => {
    if (!item.orderId) return;
    await updateOrderStatus({
      orderId: item.orderId,
      status: 'shipped',
      courier: courierInput,
      trackingNumber: trackingInput,
    });
    setShowShippedModal(false);
  };

  const handleConfirmCancel = async () => {
    if (!item.orderId) return;
    await updateOrderStatus({
      orderId: item.orderId,
      status: 'cancelled',
    });
    setShowCancelModal(false);
  };

  const handleSaveNotes = async () => {
    if (!item.orderId) return;
    await updateOrderDetails({
      orderId: item.orderId,
      details: { internalNotes: notesInput },
    });
  };

  const handleSaveCustomerDetails = async () => {
    if (!item.orderId) return;
    await updateOrderDetails({
      orderId: item.orderId,
      details: {
        customerName: custName,
        customerPhone: custPhone,
        shippingAddress: custAddress,
      },
    });
    setIsEditingCustomer(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top navigation & metadata bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/enquiries"
            className="p-2 border border-line text-muted hover:text-ink transition-colors"
            aria-label="Back to enquiries list"
          >
            <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-normal text-ink font-mono">{item.ref}</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase bg-bg border border-line text-muted">
                {item.channel === 'whatsapp' ? (
                  <>
                    <MessageCircle className="w-3 h-3 text-emerald-500" />
                    <span>WhatsApp</span>
                  </>
                ) : (
                  <>
                    <Instagram className="w-3 h-3 text-pink-500" />
                    <span>Instagram</span>
                  </>
                )}
              </span>
              <span
                className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${
                  item.displayStatus === 'new'
                    ? 'bg-accent text-bg font-normal'
                    : item.displayStatus === 'confirmed'
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
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
            </div>
            <p className="text-xs text-muted font-light mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3 h-3 stroke-[1.5]" />
              <span>Created {formatAge(item.createdAt)}</span>
              <span>&bull;</span>
              <span>{new Date(item.createdAt).toLocaleString('en-IN')}</span>
            </p>
          </div>
        </div>

        {/* Quick action buttons for enquiry */}
        {!isOrder && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyReplyMessage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line text-xs text-ink hover:bg-surface transition-colors flex-1 sm:flex-none justify-center"
            >
              {copiedReply ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 stroke-[1.5]" />}
              <span>{copiedReply ? 'Copied' : 'Copy reply message'}</span>
            </button>

            {item.enquiryStatus === 'dropped' ? (
              <button
                type="button"
                onClick={() => updateEnquiryStatus({ enquiryId: item.enquiryId, status: 'new' })}
                disabled={isUpdatingEnquiryStatus}
                className="px-3 py-1.5 border border-line text-xs text-ink hover:bg-surface"
              >
                Reopen enquiry
              </button>
            ) : (
              <button
                type="button"
                onClick={() => updateEnquiryStatus({ enquiryId: item.enquiryId, status: 'dropped' })}
                disabled={isUpdatingEnquiryStatus}
                className="px-3 py-1.5 border border-red-500/30 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10"
              >
                Mark dropped
              </button>
            )}

            {item.enquiryStatus !== 'dropped' && (
              <button
                type="button"
                onClick={() => setShowConvertModal(true)}
                className="px-4 py-1.5 bg-ink text-bg text-xs font-normal hover:bg-accent transition-colors flex-1 sm:flex-none justify-center"
              >
                Convert to order
              </button>
            )}
          </div>
        )}
      </div>

      {/* Fulfillment Status Stepper (Active for converted orders) */}
      {isOrder && item.orderStatus && (
        <div className="bg-surface border border-line p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 stroke-[1.5]" />
              <span>Fulfillment Pipeline</span>
            </h2>
            {item.orderStatus !== 'cancelled' && item.orderStatus !== 'delivered' && (
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="text-[11px] text-red-500 hover:underline"
              >
                Cancel order
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            {ORDER_STATUS_FLOW.map((step, idx) => {
              const isCurrent = item.orderStatus === step;
              const isPassed =
                item.orderStatus !== 'cancelled' &&
                ORDER_STATUS_FLOW.indexOf(item.orderStatus!) >= idx;
              const canClick = isValidOrderTransition(item.orderStatus!, step);

              return (
                <button
                  key={step}
                  type="button"
                  disabled={!canClick || isUpdatingOrderStatus}
                  onClick={() => handleStatusStep(step)}
                  className={`p-2.5 text-center border text-xs transition-colors rounded-none ${
                    isCurrent
                      ? 'border-ink bg-ink text-bg font-normal'
                      : isPassed
                      ? 'border-line bg-surface text-ink'
                      : canClick
                      ? 'border-dashed border-line text-muted hover:border-ink hover:text-ink'
                      : 'border-line/40 text-muted/40 cursor-not-allowed opacity-50'
                  }`}
                >
                  <p className="text-[10px] font-mono text-muted/70 mb-0.5">
                    Step {idx + 1}
                  </p>
                  <p className="capitalize font-medium">{ORDER_STATUS_LABELS[step]}</p>
                </button>
              );
            })}
          </div>

          {/* Courier and tracking display */}
          <div className="pt-2 border-t border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-muted font-light">Courier:</span>
              <span className="text-ink font-normal">{item.courier || 'Unassigned'}</span>
              <span className="text-muted font-light">&bull; Tracking:</span>
              <span className="font-mono text-ink font-medium">
                {item.trackingNumber || 'Pending dispatch'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowShippedModal(true)}
              className="text-xs text-accent hover:underline"
            >
              Update tracking info &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Grid: Order Items & Customer Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Items breakdown */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface border border-line p-5 space-y-4">
            <h2 className="text-xs font-medium text-ink uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
              <span>Enquiry Items ({item.items.length})</span>
            </h2>

            <div className="divide-y divide-line border border-line bg-bg">
              {item.items.map((it, idx) => (
                <div
                  key={idx}
                  className="p-3.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="font-normal text-ink truncate">{it.name}</p>
                    <p className="text-[11px] text-muted font-light">
                      {it.options?.material ? `Material: ${it.options.material}` : ''}
                      {it.options?.size ? ` • Size: ${it.options.size}` : ''}
                    </p>
                    <p className="text-[11px] text-muted font-mono">
                      {formatINR(it.unit_price_paise)} &times; {it.qty}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 font-medium text-ink font-mono">
                    {formatINR(it.unit_price_paise * it.qty)}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 pt-2 text-xs border-t border-line">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="font-mono">{formatINR(item.subtotalPaise)}</span>
              </div>
              {item.discountPaise > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount</span>
                  <span className="font-mono">-{formatINR(item.discountPaise)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-medium text-ink pt-1.5 border-t border-line">
                <span>Total</span>
                <span className="font-mono">{formatINR(item.totalPaise)}</span>
              </div>
            </div>

            {/* Customer Note (rendered strictly as plain text) */}
            {item.customerNote && (
              <div className="bg-surface border border-line p-3 text-xs space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted block">
                  Customer Gift Note / Instructions:
                </span>
                <p className="text-ink font-light italic whitespace-pre-wrap">
                  {item.customerNote}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 span): Customer & Internal Notes */}
        <div className="space-y-6">
          {/* Customer Delivery Details */}
          <div className="bg-surface border border-line p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-medium text-ink uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 stroke-[1.5]" />
                <span>Customer Details</span>
              </h2>
              {isOrder && !isEditingCustomer && (
                <button
                  type="button"
                  onClick={() => setIsEditingCustomer(true)}
                  className="text-[11px] text-accent hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingCustomer ? (
              <div className="space-y-3 pt-1 text-xs">
                <div>
                  <label className="block text-[11px] text-muted mb-1">Name</label>
                  <input
                    type="text"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full bg-bg border border-line p-1.5 text-xs text-ink focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-muted mb-1">Phone</label>
                  <input
                    type="text"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full bg-bg border border-line p-1.5 text-xs text-ink focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-muted mb-1">Address</label>
                  <textarea
                    rows={3}
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    className="w-full bg-bg border border-line p-1.5 text-xs text-ink focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingCustomer(false)}
                    className="px-2.5 py-1 border border-line text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isUpdatingOrderDetails}
                    onClick={handleSaveCustomerDetails}
                    className="px-3 py-1 bg-ink text-bg text-xs hover:bg-accent"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : item.customerName ? (
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-muted font-light block">Name</span>
                  <p className="text-ink font-normal">{item.customerName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted font-light block">Phone</span>
                  <p className="text-ink font-mono">{item.customerPhone}</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted font-light block">Shipping Address</span>
                  <p className="text-ink font-light whitespace-pre-wrap leading-relaxed">
                    {item.shippingAddress}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted font-light space-y-2">
                <p>No address details yet.</p>
                <button
                  type="button"
                  onClick={() => setShowConvertModal(true)}
                  className="text-accent underline block"
                >
                  Convert to order to enter customer address &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Internal Notes */}
          {isOrder && (
            <div className="bg-surface border border-line p-5 space-y-3">
              <h2 className="text-xs font-medium text-ink uppercase tracking-wider">
                Internal Staff Notes
              </h2>
              <textarea
                rows={3}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                onBlur={handleSaveNotes}
                placeholder="Courier special requests, packaging notes, customer DM preferences..."
                className="w-full bg-bg border border-line p-2.5 text-xs text-ink focus:outline-none focus:border-ink font-light"
              />
              <p className="text-[10px] text-muted font-light">
                Auto-saved on blur. Visible only to store administrators.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Convert Order Dialog */}
      <ConvertOrderModal
        isOpen={showConvertModal}
        enquiryId={item.enquiryId}
        enquiryRef={item.ref}
        initialTotalPaise={item.subtotalPaise - item.discountPaise}
        initialName={item.customerName || ''}
        initialPhone={item.customerPhone || ''}
        initialAddress={item.shippingAddress || ''}
        onClose={() => setShowConvertModal(false)}
        onConverted={() => {
          refetch();
        }}
      />

      {/* Shipped & Tracking Modal */}
      {showShippedModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="shipped-dialog-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-sm bg-bg border border-line p-6 space-y-4 rounded-none">
            <h2 id="shipped-dialog-title" className="text-base font-normal text-ink">
              Dispatch &amp; Courier Details
            </h2>
            <div className="space-y-3 pt-1">
              <div>
                <label htmlFor="modal-courier" className="block text-xs font-normal text-ink mb-1">
                  Courier Partner
                </label>
                <input
                  id="modal-courier"
                  type="text"
                  value={courierInput}
                  onChange={(e) => setCourierInput(e.target.value)}
                  placeholder="e.g. Delhivery, Blue Dart, DTDC"
                  className="w-full bg-surface border border-line px-3 py-2 text-xs text-ink focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="modal-tracking" className="block text-xs font-normal text-ink mb-1">
                  Tracking Number / AWB
                </label>
                <input
                  id="modal-tracking"
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="e.g. 14298172901"
                  className="w-full bg-surface border border-line px-3 py-2 text-xs text-ink font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setShowShippedModal(false)}
                className="px-3.5 py-2 border border-line text-xs text-ink hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingOrderStatus}
                onClick={handleConfirmShipped}
                className="px-4 py-2 bg-ink text-bg text-xs font-normal hover:bg-accent"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-dialog-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-sm bg-bg border border-line p-6 space-y-4 rounded-none">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h2 id="cancel-dialog-title" className="text-base font-normal text-ink">
                Cancel Order {item.ref}?
              </h2>
            </div>
            <p className="text-xs text-muted font-light leading-relaxed">
              Are you sure you want to mark this order as cancelled? This stops the fulfillment pipeline.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-3.5 py-2 border border-line text-xs text-ink"
              >
                Go back
              </button>
              <button
                type="button"
                disabled={isUpdatingOrderStatus}
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-red-600 text-white text-xs font-normal hover:bg-red-700"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEnquiryDetail;
