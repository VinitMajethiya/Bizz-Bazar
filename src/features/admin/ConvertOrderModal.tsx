import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useAdminOrderMutations } from '../../lib/hooks/useAdminOrders';
import { rupeesToPaise } from '../../lib/money';

interface ConvertOrderModalProps {
  enquiryId: string;
  enquiryRef: string;
  initialTotalPaise: number;
  initialName?: string;
  initialPhone?: string;
  initialAddress?: string;
  isOpen: boolean;
  onClose: () => void;
  onConverted: (orderId: string) => void;
}

export const ConvertOrderModal: React.FC<ConvertOrderModalProps> = ({
  enquiryId,
  enquiryRef,
  initialTotalPaise,
  initialName = '',
  initialPhone = '',
  initialAddress = '',
  isOpen,
  onClose,
  onConverted,
}) => {
  const [customerName, setCustomerName] = useState(initialName);
  const [customerPhone, setCustomerPhone] = useState(initialPhone);
  const [shippingAddress, setShippingAddress] = useState(initialAddress);
  const [totalRupees, setTotalRupees] = useState((initialTotalPaise / 100).toString());
  const [error, setError] = useState<string | null>(null);

  const { convertEnquiry, isConverting } = useAdminOrderMutations();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const name = customerName.trim();
    const phone = customerPhone.trim();
    const address = shippingAddress.trim();
    const numRupees = parseFloat(totalRupees);

    if (name.length < 2) {
      setError('Customer name must be at least 2 characters');
      return;
    }

    if (phone.length < 8) {
      setError('Please enter a valid customer phone number');
      return;
    }

    if (address.length < 10 || address.length > 300) {
      setError('Shipping address must be between 10 and 300 characters');
      return;
    }

    if (isNaN(numRupees) || numRupees < 0) {
      setError('Please enter a valid order total');
      return;
    }

    try {
      const result = await convertEnquiry({
        enquiryId,
        customerName: name,
        customerPhone: phone,
        shippingAddress: address,
        totalPaise: rupeesToPaise(numRupees),
      });

      onClose();
      onConverted(result.order_id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to convert enquiry';
      setError(msg);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="convert-dialog-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md bg-bg border border-line p-6 shadow-xl space-y-5 rounded-none">
        <div className="flex items-start justify-between">
          <div>
            <h2 id="convert-dialog-title" className="text-base font-normal text-ink">
              Convert Enquiry to Order
            </h2>
            <p className="text-xs text-muted font-light mt-0.5">
              Reference: <span className="font-mono text-ink font-medium">{enquiryRef}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 text-muted hover:text-ink transition-colors"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="p-3 bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="conv-name" className="block text-xs font-normal text-ink mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              id="conv-name"
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Sneha Patel"
              className="w-full bg-surface border border-line px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light"
            />
          </div>

          <div>
            <label htmlFor="conv-phone" className="block text-xs font-normal text-ink mb-1">
              Customer Phone <span className="text-red-500">*</span>
            </label>
            <input
              id="conv-phone"
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full bg-surface border border-line px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="conv-address" className="text-xs font-normal text-ink">
                Shipping Address <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-muted font-mono">
                {shippingAddress.trim().length} / 300
              </span>
            </div>
            <textarea
              id="conv-address"
              rows={3}
              required
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Flat/House no, Street, Landmark, City, State, PIN code"
              className="w-full bg-surface border border-line p-2.5 text-xs text-ink focus:outline-none focus:border-ink font-light"
            />
          </div>

          <div>
            <label htmlFor="conv-total" className="block text-xs font-normal text-ink mb-1">
              Confirmed Total (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs text-muted font-light select-none">₹</span>
              <input
                id="conv-total"
                type="number"
                step="any"
                min="0"
                required
                value={totalRupees}
                onChange={(e) => setTotalRupees(e.target.value)}
                className="w-full bg-surface border border-line pl-7 pr-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light font-mono"
              />
            </div>
            <p className="text-[10px] text-muted font-light mt-1">
              Prefilled from enquiry subtotal. You can adjust for agreed courier fees or custom discounts.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              disabled={isConverting}
              className="px-3.5 py-2 border border-line text-xs text-ink hover:bg-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isConverting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink text-bg text-xs font-normal rounded-ui hover:bg-accent transition-colors disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isConverting ? 'Creating order...' : 'Confirm & Create Order'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvertOrderModal;
