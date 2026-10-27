import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Copy, CheckCircle } from 'lucide-react';

export const AdminEnquiryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/enquiries"
          className="p-2 border border-line rounded-ui text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-light text-ink">Enquiry Detail</h1>
          <p className="text-xs text-muted">ID: {id} &bull; Reference: BR-7K3F9A</p>
        </div>
      </div>

      <div className="bg-surface border border-line p-6 rounded-ui space-y-6">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <span className="text-[11px] text-muted uppercase">Channel</span>
            <p className="text-sm font-medium text-ink">WhatsApp</p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-muted uppercase">Status</span>
            <p className="text-sm font-medium text-accent">New</p>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-ink">Order Items</h3>
          <div className="border border-line rounded-ui bg-bg p-3 divide-y divide-line text-xs">
            <div className="py-2 flex justify-between">
              <div>
                <p className="font-medium text-ink">Lilac Twist Hoops</p>
                <p className="text-[11px] text-muted">Option: Gold &bull; Qty: 1</p>
              </div>
              <span className="text-ink font-medium">₹499</span>
            </div>
          </div>
          <div className="flex justify-between text-xs font-medium text-ink pt-1">
            <span>Subtotal</span>
            <span>₹499</span>
          </div>
        </div>

        {/* Customer Actions */}
        <div className="border-t border-line pt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-2 bg-ink text-bg text-xs uppercase tracking-wider font-medium rounded-ui hover:bg-accent transition-colors"
          >
            <CheckCircle className="w-4 h-4" /> Convert to Order
          </button>
          <button
            type="button"
            className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-2 border border-line bg-bg text-ink text-xs uppercase tracking-wider font-medium rounded-ui hover:bg-surface transition-colors"
          >
            <Copy className="w-4 h-4" /> Copy Reply Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEnquiryDetail;

