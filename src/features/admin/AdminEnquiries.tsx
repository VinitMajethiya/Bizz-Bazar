import React from 'react';
import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';

export const AdminEnquiries: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-light text-ink">Enquiries &amp; Orders</h1>
          <p className="text-xs text-muted mt-1">Live order pipeline synced with chat channels</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line bg-surface text-ink text-xs rounded-ui hover:bg-bg transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-line text-xs">
        {['All', 'New', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map((st, i) => (
          <button
            key={st}
            className={`min-h-[32px] px-3 py-1 rounded-ui whitespace-nowrap transition-colors ${
              i === 0 ? 'bg-ink text-bg font-medium' : 'bg-surface text-ink hover:bg-line/60'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="border border-line rounded-ui bg-surface divide-y divide-line overflow-hidden">
        {[
          { id: '1', ref: 'BR-7K3F9A', status: 'new', channel: 'WhatsApp', items: 'Lilac Twist Hoops (Gold) x1', total: '₹499', age: '12 min ago' },
          { id: '2', ref: 'BR-9X2A1C', status: 'confirmed', channel: 'Instagram', items: 'Ruby Claw Studs x1, Bow Studs x1', total: '₹1,048', age: '45 min ago' },
          { id: '3', ref: 'BR-4M8P2Q', status: 'processing', channel: 'WhatsApp', items: 'Seashell Cuff (Gold) x1', total: '₹899', age: '2 hours ago' },
        ].map((item) => (
          <Link
            key={item.ref}
            to={`/admin/enquiries/${item.id}`}
            className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-bg/50 transition-colors block"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-ink">{item.ref}</span>
                <span className="bg-bg border border-line px-1.5 py-0.5 text-[10px] text-muted rounded-ui">
                  {item.channel}
                </span>
                <span className="capitalize px-1.5 py-0.5 text-[10px] bg-accent/10 text-accent rounded-ui">
                  {item.status}
                </span>
              </div>
              <p className="text-muted text-[11px]">{item.items}</p>
            </div>
            <div className="text-right">
              <span className="font-medium text-ink block">{item.total}</span>
              <span className="text-[10px] text-muted">{item.age}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminEnquiries;
