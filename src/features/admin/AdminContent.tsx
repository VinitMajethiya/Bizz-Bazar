import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Save,
  Upload,
  Copy,
  Trash2,
  ExternalLink,
  Plus,
  X,
  AlertCircle,
  Users,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { fetchSiteSettings } from '../../lib/api/settings';
import {
  updateAdminSiteSettings,
  uploadAdminHeroImage,
  fetchAdminCMSPages,
  updateAdminCMSPage,
  fetchAdminNewsletterLeads,
  deleteAdminNewsletterLead,
  fetchAdminContactMessages,
  deleteAdminContactMessage,
  type NewsletterLeadItem,
  type ContactMessageItem,
} from '../../lib/api/adminContent';
import type { SiteSettings, Guarantee } from '../../lib/types';
import { MarkdownRenderer } from '../../components/ui/MarkdownRenderer';
import { useToastStore } from '../../components/ui/toastStore';

type ContentTab = 'settings' | 'pages' | 'leads';

export const AdminContent: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as ContentTab) || 'settings';

  const [activeTab, setActiveTab] = useState<ContentTab>(
    ['settings', 'pages', 'leads'].includes(currentTab) ? currentTab : 'settings'
  );

  const { showToast } = useToastStore();

  const handleTabChange = (tab: ContentTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl md:text-2xl font-light text-ink">Content &amp; Site Settings</h1>
        <p className="text-xs text-muted mt-0.5">
          Manage storefront copy, announcement ticker, hero banner, policy CMS pages, and view customer leads.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-line text-xs font-normal">
        <button
          type="button"
          onClick={() => handleTabChange('settings')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-accent text-accent font-medium'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          Site Settings
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('pages')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'pages'
              ? 'border-b-2 border-accent text-accent font-medium'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          CMS Pages
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('leads')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'leads'
              ? 'border-b-2 border-accent text-accent font-medium'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          Leads &amp; Messages
        </button>
      </div>

      {activeTab === 'settings' && <SiteSettingsEditor onSaveSuccess={() => showToast('Site settings saved successfully.', 'success')} />}
      {activeTab === 'pages' && <CMSPagesEditor onSaveSuccess={() => showToast('Page content updated successfully.', 'success')} />}
      {activeTab === 'leads' && <LeadsAndMessagesViewer />}
    </div>
  );
};

/* =========================================================================
 * TAB 1: SITE SETTINGS EDITOR
 * ========================================================================= */
const SiteSettingsEditor: React.FC<{ onSaveSuccess: () => void }> = ({ onSaveSuccess }) => {
  const queryClient = useQueryClient();
  const { data: settingsData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-site-settings'],
    queryFn: fetchSiteSettings,
  });

  const [form, setForm] = useState<SiteSettings | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (settingsData) {
      setForm(settingsData);
    }
  }, [settingsData]);

  const updateMutation = useMutation({
    mutationFn: (newSettings: SiteSettings) => updateAdminSiteSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      onSaveSuccess();
    },
    onError: (err: Error) => {
      setErrorMessage(err.message);
    },
  });

  if (isLoading || !form) {
    return (
      <div className="py-16 text-center text-xs text-muted font-light bg-surface border border-line rounded-ui">
        Loading site settings...
      </div>
    );
  }

  const handleFieldChange = (field: keyof SiteSettings, value: unknown) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setErrorMessage(null);
    try {
      const publicUrl = await uploadAdminHeroImage(file);
      handleFieldChange('hero_image_url', publicUrl);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Hero image upload failed.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleGuaranteeChange = (idx: number, field: keyof Guarantee, value: string) => {
    if (!form) return;
    const updated = [...form.guarantees];
    updated[idx] = { ...updated[idx], [field]: value };
    handleFieldChange('guarantees', updated);
  };

  const handleAddGuarantee = () => {
    if (!form) return;
    handleFieldChange('guarantees', [...form.guarantees, { title: 'New Guarantee', text: 'Description text' }]);
  };

  const handleRemoveGuarantee = (idx: number) => {
    if (!form) return;
    const updated = form.guarantees.filter((_, i) => i !== idx);
    handleFieldChange('guarantees', updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setErrorMessage(null);
    updateMutation.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-ui flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Brand & Contact Information */}
      <div className="bg-surface border border-line p-5 sm:p-6 rounded-ui space-y-4">
        <h2 className="text-xs font-medium text-ink">Brand &amp; Contact Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="brand_name" className="block text-xs font-normal text-ink mb-1">
              Brand Name <span className="text-red-500">*</span>
            </label>
            <input
              id="brand_name"
              type="text"
              value={form.brand_name}
              onChange={(e) => handleFieldChange('brand_name', e.target.value)}
              className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light"
              required
            />
          </div>

          <div>
            <label htmlFor="tagline" className="block text-xs font-normal text-ink mb-1">
              Tagline
            </label>
            <input
              id="tagline"
              type="text"
              value={form.tagline}
              onChange={(e) => handleFieldChange('tagline', e.target.value)}
              className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light"
            />
          </div>

          <div>
            <label htmlFor="whatsapp_number" className="block text-xs font-normal text-ink mb-1">
              WhatsApp Business Number <span className="text-red-500">*</span>
            </label>
            <input
              id="whatsapp_number"
              type="text"
              value={form.whatsapp_number}
              onChange={(e) => handleFieldChange('whatsapp_number', e.target.value)}
              placeholder="e.g. 919876543210 (with country code)"
              className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light font-mono"
              required
            />
            <p className="text-[11px] text-muted mt-0.5">Digits only, including country code (e.g. 91 for India).</p>
          </div>

          <div>
            <label htmlFor="instagram_handle" className="block text-xs font-normal text-ink mb-1">
              Instagram Handle (without @) <span className="text-red-500">*</span>
            </label>
            <input
              id="instagram_handle"
              type="text"
              value={form.instagram_handle}
              onChange={(e) => handleFieldChange('instagram_handle', e.target.value)}
              placeholder="e.g. by.raya.co"
              className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light"
              required
            />
          </div>

          <div>
            <label htmlFor="support_email" className="block text-xs font-normal text-ink mb-1">
              Support Email <span className="text-red-500">*</span>
            </label>
            <input
              id="support_email"
              type="email"
              value={form.support_email}
              onChange={(e) => handleFieldChange('support_email', e.target.value)}
              className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light"
              required
            />
          </div>

          <div>
            <label htmlFor="business_hours" className="block text-xs font-normal text-ink mb-1">
              Business Hours
            </label>
            <input
              id="business_hours"
              type="text"
              value={form.business_hours}
              onChange={(e) => handleFieldChange('business_hours', e.target.value)}
              placeholder="e.g. Mon – Sat: 10:00 AM – 7:00 PM IST"
              className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light"
            />
          </div>
        </div>
      </div>

      {/* 2. Announcement Ticker & Story Teaser */}
      <div className="bg-surface border border-line p-5 sm:p-6 rounded-ui space-y-4">
        <h2 className="text-xs font-medium text-ink">Storefront Copy &amp; Ticker</h2>

        <div className="space-y-3">
          <div>
            <label htmlFor="ticker_text" className="block text-xs font-normal text-ink mb-1">
              Top Announcement Ticker
            </label>
            <input
              id="ticker_text"
              type="text"
              value={form.ticker_text}
              onChange={(e) => handleFieldChange('ticker_text', e.target.value)}
              className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light"
            />
          </div>

          <div>
            <label htmlFor="story_teaser" className="block text-xs font-normal text-ink mb-1">
              Home Story Teaser Text
            </label>
            <textarea
              id="story_teaser"
              rows={3}
              value={form.story_teaser}
              onChange={(e) => handleFieldChange('story_teaser', e.target.value)}
              className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light resize-y"
            />
          </div>

          <div>
            <label htmlFor="footer_text" className="block text-xs font-normal text-ink mb-1">
              Footer Brand Statement
            </label>
            <textarea
              id="footer_text"
              rows={2}
              value={form.footer_text}
              onChange={(e) => handleFieldChange('footer_text', e.target.value)}
              className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light resize-y"
            />
          </div>
        </div>
      </div>

      {/* 3. Hero Banner & Image */}
      <div className="bg-surface border border-line p-5 sm:p-6 rounded-ui space-y-4">
        <h2 className="text-xs font-medium text-ink">Hero Banner</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label htmlFor="hero_headline" className="block text-xs font-normal text-ink mb-1">
                Hero Headline
              </label>
              <input
                id="hero_headline"
                type="text"
                value={form.hero_headline}
                onChange={(e) => handleFieldChange('hero_headline', e.target.value)}
                className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light"
              />
            </div>

            <div>
              <label htmlFor="hero_text" className="block text-xs font-normal text-ink mb-1">
                Hero Subtext
              </label>
              <textarea
                id="hero_text"
                rows={3}
                value={form.hero_text}
                onChange={(e) => handleFieldChange('hero_text', e.target.value)}
                className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light resize-y"
              />
            </div>
          </div>

          {/* Hero Image Upload & Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-normal text-ink">Hero Photograph</label>
            <div className="aspect-[16/9] bg-bg border border-line rounded-ui overflow-hidden flex items-center justify-center relative">
              {form.hero_image_url ? (
                <img
                  src={form.hero_image_url}
                  alt="Hero Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-muted font-light">No hero image uploaded</span>
              )}

              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs text-white">
                  Uploading...
                </div>
              )}
            </div>

            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line bg-surface text-ink text-xs font-normal rounded-ui hover:bg-bg cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploadingImage ? 'Uploading...' : 'Replace Hero Photo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleHeroImageUpload}
                disabled={isUploadingImage}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 4. Home Guarantees */}
      <div className="bg-surface border border-line p-5 sm:p-6 rounded-ui space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-medium text-ink">Home Guarantees Strip</h2>
            <p className="text-[11px] text-muted font-light">Key value propositions shown on the home page</p>
          </div>
          <button
            type="button"
            onClick={handleAddGuarantee}
            className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-normal"
          >
            <Plus className="w-3.5 h-3.5" /> Add Guarantee
          </button>
        </div>

        <div className="space-y-2.5">
          {form.guarantees.map((g, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={g.title}
                onChange={(e) => handleGuaranteeChange(idx, 'title', e.target.value)}
                placeholder="Title (e.g. Skin-friendly)"
                className="w-1/3 bg-bg border border-line rounded-ui px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-ink font-light"
              />
              <input
                type="text"
                value={g.text}
                onChange={(e) => handleGuaranteeChange(idx, 'text', e.target.value)}
                placeholder="Description"
                className="flex-1 bg-bg border border-line rounded-ui px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-ink font-light"
              />
              <button
                type="button"
                onClick={() => handleRemoveGuarantee(idx)}
                className="p-1.5 text-muted hover:text-red-500"
                aria-label="Remove guarantee"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="p-2 border border-line text-ink rounded-ui hover:bg-surface disabled:opacity-50 transition-colors"
          aria-label="Refresh settings"
        >
          <RefreshCw className={`w-4 h-4 stroke-[1.5] ${isRefetching ? 'animate-spin' : ''}`} />
        </button>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="inline-flex items-center gap-1.5 px-5 py-2 bg-ink text-bg text-xs font-normal rounded-ui hover:bg-accent transition-colors disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{updateMutation.isPending ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </form>
  );
};

/* =========================================================================
 * TAB 2: CMS PAGES EDITOR WITH SPLIT LIVE PREVIEW
 * ========================================================================= */
const CMSPagesEditor: React.FC<{ onSaveSuccess: () => void }> = ({ onSaveSuccess }) => {
  const queryClient = useQueryClient();
  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['admin-cms-pages'],
    queryFn: fetchAdminCMSPages,
  });

  const [selectedSlug, setSelectedSlug] = useState<string>('our-story');
  const [title, setTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [bodyMd, setBodyMd] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedPage = pages.find((p) => p.slug === selectedSlug);

  useEffect(() => {
    if (selectedPage) {
      setTitle(selectedPage.title);
      setMetaDescription(selectedPage.metaDescription || '');
      setBodyMd(selectedPage.bodyMd);
    }
  }, [selectedPage]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateAdminCMSPage(selectedSlug, {
        title,
        metaDescription: metaDescription || null,
        bodyMd,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cms-pages'] });
      queryClient.invalidateQueries({ queryKey: ['cms-page', selectedSlug] });
      onSaveSuccess();
    },
    onError: (err: Error) => {
      setErrorMessage(err.message);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    updateMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Page Selection Bar */}
      <div className="bg-surface border border-line p-4 rounded-ui flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="page-select" className="text-xs font-normal text-ink">
            Page:
          </label>
          <select
            id="page-select"
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="bg-bg border border-line px-3 py-1.5 text-xs text-ink rounded-ui focus:outline-none focus:border-ink font-light"
          >
            <option value="our-story">Our Story (/our-story)</option>
            <option value="how-to-order">How to Order (/how-to-order)</option>
            <option value="privacy">Privacy Policy (/privacy)</option>
            <option value="terms">Terms of Service (/terms)</option>
          </select>
        </div>

        <a
          href={`/${selectedSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-normal self-start sm:self-auto"
        >
          <span>View live page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-xs text-muted font-light bg-surface border border-line rounded-ui">
          Loading page content...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-ui flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Meta Details */}
          <div className="bg-surface border border-line p-5 rounded-ui space-y-4">
            <h2 className="text-xs font-medium text-ink">Page Metadata</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="page-title" className="block text-xs font-normal text-ink mb-1">
                  Page Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="page-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="page-meta" className="block text-xs font-normal text-ink">
                    Meta Description
                  </label>
                  <span className="text-[10px] text-muted">{metaDescription.length}/160</span>
                </div>
                <input
                  id="page-meta"
                  type="text"
                  maxLength={160}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Summary for search engines..."
                  className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light"
                />
              </div>
            </div>
          </div>

          {/* Markdown Split Editor */}
          <div className="bg-surface border border-line p-5 rounded-ui space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="page-body" className="text-xs font-medium text-ink">
                Page Body (Markdown Editor &amp; Live Preview)
              </label>
              <span className="text-[10px] text-muted">Supports headings (#), lists (-), bold (**), italic (*), and links ([title](url))</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Raw Editor */}
              <textarea
                id="page-body"
                rows={16}
                value={bodyMd}
                onChange={(e) => setBodyMd(e.target.value)}
                placeholder="Write page content in markdown format..."
                className="w-full bg-bg border border-line rounded-ui p-3 text-xs text-ink font-mono focus:outline-none focus:border-ink resize-y leading-relaxed"
              />

              {/* Live Preview */}
              <div className="bg-bg border border-line rounded-ui p-4 overflow-y-auto max-h-[400px]">
                <div className="text-[10px] font-mono text-muted border-b border-line pb-1 mb-3">
                  Live Preview:
                </div>
                <div className="max-w-none">
                  <h1 className="text-2xl font-light text-ink pb-2 border-b border-line mb-4">
                    {title}
                  </h1>
                  <MarkdownRenderer content={bodyMd} />
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-ink text-bg text-xs font-normal rounded-ui hover:bg-accent transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{updateMutation.isPending ? 'Saving...' : 'Save Page'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

/* =========================================================================
 * TAB 3: LEADS & MESSAGES VIEWER
 * ========================================================================= */
const LeadsAndMessagesViewer: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['admin-newsletter-leads'],
    queryFn: fetchAdminNewsletterLeads,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['admin-contact-messages'],
    queryFn: fetchAdminContactMessages,
  });

  // Deletion targets
  const [deleteLeadTarget, setDeleteLeadTarget] = useState<NewsletterLeadItem | null>(null);
  const [deleteMessageTarget, setDeleteMessageTarget] = useState<ContactMessageItem | null>(null);

  const deleteLeadMutation = useMutation({
    mutationFn: (id: string) => deleteAdminNewsletterLead(id),
    onSuccess: () => {
      setDeleteLeadTarget(null);
      queryClient.invalidateQueries({ queryKey: ['admin-newsletter-leads'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
      showToast('Subscriber removed.', 'info');
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (id: string) => deleteAdminContactMessage(id),
    onSuccess: () => {
      setDeleteMessageTarget(null);
      queryClient.invalidateQueries({ queryKey: ['admin-contact-messages'] });
      showToast('Message deleted.', 'info');
    },
  });

  const handleCopyAllLeads = async () => {
    if (leads.length === 0) return;
    const allContacts = leads.map((l) => l.contact).join('\n');
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(allContacts);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = allContacts;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast(`Copied ${leads.length} contacts to clipboard.`, 'success');
    } catch {
      showToast('Failed to copy contacts.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Section 1: Drop-Alert Signups */}
      <div className="bg-surface border border-line rounded-ui overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-accent" />
            <div>
              <h2 className="text-xs font-medium text-ink">
                Drop-Alert Subscribers ({leads.length})
              </h2>
              <p className="text-[11px] text-muted font-light">
                Shoppers who signed up on the home page for new collection alerts
              </p>
            </div>
          </div>

          {leads.length > 0 && (
            <button
              type="button"
              onClick={handleCopyAllLeads}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line bg-bg text-ink text-xs font-normal rounded-ui hover:bg-surface self-start sm:self-auto transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy All Contacts</span>
            </button>
          )}
        </div>

        {leadsLoading ? (
          <div className="p-8 text-center text-xs text-muted font-light">Loading subscribers...</div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted font-light">
            No drop-alert subscribers yet.
          </div>
        ) : (
          <div className="divide-y divide-line/60">
            {leads.map((lead) => {
              const formattedDate = new Date(lead.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={lead.id}
                  className="p-3.5 sm:px-5 flex items-center justify-between gap-4 hover:bg-bg/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono text-ink font-medium">{lead.contact}</span>
                    <p className="text-[11px] text-muted font-light">Subscribed {formattedDate}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDeleteLeadTarget(lead)}
                    className="p-1.5 text-muted hover:text-red-500 transition-colors"
                    aria-label={`Remove subscriber ${lead.contact}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Contact Messages Inbox */}
      <div className="bg-surface border border-line rounded-ui overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-line flex items-center gap-2.5">
          <MessageSquare className="w-4 h-4 text-accent" />
          <div>
            <h2 className="text-xs font-medium text-ink">
              Contact Form Messages ({messages.length})
            </h2>
            <p className="text-[11px] text-muted font-light">
              Inquiries submitted through the /contact page
            </p>
          </div>
        </div>

        {messagesLoading ? (
          <div className="p-8 text-center text-xs text-muted font-light">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted font-light">
            No contact messages received yet.
          </div>
        ) : (
          <div className="divide-y divide-line/60">
            {messages.map((msg) => {
              const formattedDate = new Date(msg.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={msg.id} className="p-4 sm:p-5 space-y-2 hover:bg-bg/40 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-ink">{msg.name}</span>
                      <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-ui">
                        {msg.contact}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-muted font-light">{formattedDate}</span>
                      <button
                        type="button"
                        onClick={() => setDeleteMessageTarget(msg)}
                        className="p-1 text-muted hover:text-red-500 transition-colors"
                        aria-label={`Delete message from ${msg.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-ink/90 font-light leading-relaxed whitespace-pre-line bg-bg/50 p-3 rounded-ui border border-line/40">
                    {msg.message}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Lead Modal */}
      {deleteLeadTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDeleteLeadTarget(null)}
        >
          <div
            className="bg-surface border border-line max-w-sm w-full p-6 space-y-4 rounded-ui text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1.5">
              <h2 className="text-base font-normal text-ink">Remove Subscriber?</h2>
              <p className="text-xs text-muted font-light leading-relaxed">
                Remove <strong className="font-mono text-ink">{deleteLeadTarget.contact}</strong> from the drop-alert list?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteLeadTarget(null)}
                className="px-4 py-2 border border-line text-xs font-normal text-ink rounded-ui hover:bg-bg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteLeadMutation.mutate(deleteLeadTarget.id)}
                disabled={deleteLeadMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white text-xs font-normal rounded-ui hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteLeadMutation.isPending ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Message Modal */}
      {deleteMessageTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDeleteMessageTarget(null)}
        >
          <div
            className="bg-surface border border-line max-w-sm w-full p-6 space-y-4 rounded-ui text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1.5">
              <h2 className="text-base font-normal text-ink">Delete Contact Message?</h2>
              <p className="text-xs text-muted font-light leading-relaxed">
                Permanently delete message from <strong className="text-ink">{deleteMessageTarget.name}</strong>?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteMessageTarget(null)}
                className="px-4 py-2 border border-line text-xs font-normal text-ink rounded-ui hover:bg-bg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMessageMutation.mutate(deleteMessageTarget.id)}
                disabled={deleteMessageMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white text-xs font-normal rounded-ui hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteMessageMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContent;
