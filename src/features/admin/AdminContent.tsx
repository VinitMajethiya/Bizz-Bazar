import React, { useState } from 'react';
import { Save } from 'lucide-react';

export const AdminContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'settings' | 'pages' | 'leads'>('settings');

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl md:text-2xl font-light text-ink">Content &amp; Site Settings</h1>
        <p className="text-xs text-muted mt-1">
          Edit brand contact info, announcement ticker, CMS pages, and view leads
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-line text-xs">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-1.5 transition-colors ${
            activeTab === 'settings'
              ? 'border-b-2 border-accent text-accent font-medium'
              : 'text-muted hover:text-ink'
          }`}
        >
          Site Settings
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          className={`px-3.5 py-1.5 transition-colors ${
            activeTab === 'pages'
              ? 'border-b-2 border-accent text-accent font-medium'
              : 'text-muted hover:text-ink'
          }`}
        >
          CMS Pages
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-3.5 py-1.5 transition-colors ${
            activeTab === 'leads'
              ? 'border-b-2 border-accent text-accent font-medium'
              : 'text-muted hover:text-ink'
          }`}
        >
          Drop Alerts &amp; Messages
        </button>
      </div>

      {activeTab === 'settings' && (
        <form className="space-y-4 bg-surface border border-line p-6 rounded-ui text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-ink font-medium mb-1">Brand Name</label>
              <input
                type="text"
                defaultValue="By Raya.co"
                className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-ink focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-ink font-medium mb-1">WhatsApp Business Number</label>
              <input
                type="text"
                defaultValue="919999999999"
                className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-ink focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-ink font-medium mb-1">Instagram Handle (without @)</label>
              <input
                type="text"
                defaultValue="by.raya.co"
                className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-ink focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-ink font-medium mb-1">Support Email</label>
              <input
                type="email"
                defaultValue="hello@byraya.co"
                className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-ink focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-ink font-medium mb-1">Announcement Ticker Text</label>
            <input
              type="text"
              defaultValue="Everyday luxury, without the luxury price. DM to order."
              className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-ink focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink text-bg text-xs uppercase tracking-wider font-medium rounded-ui hover:bg-accent transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> Save Settings
            </button>
          </div>
        </form>
      )}

      {activeTab === 'pages' && (
        <div className="bg-surface border border-line p-6 rounded-ui text-xs space-y-4">
          <label className="block text-ink font-medium">Select Page to Edit</label>
          <select className="bg-bg border border-line rounded-ui px-3 py-2 text-xs text-ink w-full max-w-xs focus:outline-none focus:ring-1 focus:ring-accent">
            <option value="our-story">Our Story (/our-story)</option>
            <option value="shipping-returns">Shipping &amp; Returns (/shipping-returns)</option>
            <option value="privacy">Privacy Policy (/privacy)</option>
            <option value="terms">Terms of Service (/terms)</option>
          </select>
          <div className="p-4 bg-bg border border-line rounded-ui text-muted">
            Markdown editor with live preview (Phase 7)
          </div>
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="bg-surface border border-line p-6 rounded-ui text-xs space-y-4">
          <h3 className="font-medium text-ink">Drop Alert Subscribers</h3>
          <p className="text-muted">14 shoppers requested alerts for new collections.</p>
        </div>
      )}
    </div>
  );
};

export default AdminContent;

