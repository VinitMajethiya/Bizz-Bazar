import React from 'react';
import { Link } from 'react-router-dom';
import { Inbox, ShoppingCart, Star, Tag, AlertTriangle, Users } from 'lucide-react';

export const AdminOverview: React.FC = () => {
  const counters = [
    { label: 'New Enquiries', count: 3, icon: Inbox, to: '/admin/enquiries?status=new', highlight: true },
    { label: 'Orders in Progress', count: 7, icon: ShoppingCart, to: '/admin/enquiries?status=processing' },
    { label: 'Pending Reviews', count: 2, icon: Star, to: '/admin/reviews?status=pending' },
    { label: 'Live Deals', count: 1, icon: Tag, to: '/admin/deals' },
    { label: 'Low Stock / Sold Out', count: 2, icon: AlertTriangle, to: '/admin/products?status=low_stock' },
    { label: 'Drop Alert Sign-ups', count: 14, icon: Users, to: '/admin/content' },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-xl md:text-2xl font-light text-ink">Dashboard Overview</h1>
        <p className="text-xs text-muted mt-1">Live metrics from your storefront</p>
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {counters.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              to={c.to}
              className={`p-4 bg-surface border rounded-ui transition-colors ${
                c.highlight
                  ? 'border-accent/40 bg-accent/5'
                  : 'border-line hover:border-muted'
              }`}
            >
              <div className="flex items-center justify-between text-muted mb-2">
                <span className="text-[11px] uppercase tracking-wider">{c.label}</span>
                <Icon className="w-4 h-4 text-ink" />
              </div>
              <p className="text-2xl font-light text-ink">{c.count}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent Enquiries Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wider text-ink">
            Latest Enquiries
          </h2>
          <Link to="/admin/enquiries" className="text-xs text-accent hover:underline">
            View all &rarr;
          </Link>
        </div>

        <div className="border border-line rounded-ui bg-surface divide-y divide-line overflow-hidden">
          {[
            { ref: 'BR-7K3F9A', customer: 'Sneha M.', items: 'Lilac Twist Hoops (Gold) x1', total: '₹499', age: '12 min ago', channel: 'WhatsApp' },
            { ref: 'BR-9X2A1C', customer: 'Pooja K.', items: 'Ruby Claw Studs x1, Bow Studs x1', total: '₹1,048', age: '45 min ago', channel: 'Instagram' },
            { ref: 'BR-4M8P2Q', customer: 'Ananya S.', items: 'Seashell Cuff (Gold) x1', total: '₹899', age: '2 hours ago', channel: 'WhatsApp' },
          ].map((enq) => (
            <div key={enq.ref} className="p-3.5 flex items-center justify-between gap-4 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-ink">{enq.ref}</span>
                  <span className="bg-bg border border-line px-1.5 py-0.5 text-[10px] text-muted rounded-ui">
                    {enq.channel}
                  </span>
                </div>
                <p className="text-muted text-[11px] truncate max-w-xs">{enq.items}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-ink">{enq.total}</p>
                <p className="text-[10px] text-muted">{enq.age}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;

