import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MessageCircle, Instagram, Mail, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSiteSettings } from '../../lib/hooks/useCatalog';
import { cleanWhatsAppNumber } from '../../lib/validation/schemas';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export const Contact: React.FC = () => {
  const { data: settings } = useSiteSettings();

  const brandName = settings?.brand_name || 'By Raya.co';
  const rawWhatsApp = settings?.whatsapp_number || '919999999999';
  const whatsappNumber = cleanWhatsAppNumber(rawWhatsApp);
  const instagramHandle = settings?.instagram_handle || 'by.raya.co';
  const supportEmail = settings?.support_email || 'hello@byraya.co';
  const businessHours = settings?.business_hours || 'Mon – Sat: 10:00 AM – 7:00 PM IST';

  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Honeypot check
    if (honeypot.trim()) {
      setIsSubmitted(true);
      return;
    }

    if (!name.trim() || !contactInfo.trim() || !message.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('contact_messages').insert({
          name: name.trim(),
          contact: contactInfo.trim(),
          message: message.trim(),
        });

        if (error) {
          throw new Error(error.message);
        }
      }

      setIsSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send your message. Please try again or message us on WhatsApp.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us — {brandName}</title>
        <meta
          name="description"
          content={`Get in touch with ${brandName} directly via WhatsApp or Instagram DM.`}
        />
      </Helmet>

      <div className="max-w-site mx-auto px-5 md:px-8 py-12 md:py-16">
        <div className="max-w-3xl mx-auto space-y-10">
          <header className="space-y-2 border-b border-line pb-6">
            <h1 className="text-3xl font-light text-ink">Contact Us</h1>
            <p className="text-xs text-muted font-light">
              Have a question about a piece or your order? Message us directly for the fastest response.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Quick Channels */}
            <div className="space-y-4">
              <h2 className="text-xs font-medium text-ink">
                Direct Messaging
              </h2>

              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-surface border border-line rounded-ui hover:border-accent transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-xs font-medium text-ink">WhatsApp</p>
                  <p className="text-[11px] text-muted">Fastest reply for orders &amp; custom requests</p>
                </div>
              </a>

              <a
                href={`https://ig.me/m/${instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-surface border border-line rounded-ui hover:border-accent transition-colors"
              >
                <Instagram className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-xs font-medium text-ink">Instagram DM</p>
                  <p className="text-[11px] text-muted">@{instagramHandle}</p>
                </div>
              </a>

              <div className="p-4 bg-surface border border-line rounded-ui space-y-2">
                <div className="flex items-center gap-2 text-xs text-ink">
                  <Mail className="w-4 h-4 text-muted flex-shrink-0" />
                  <a href={`mailto:${supportEmail}`} className="hover:underline">
                    {supportEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Clock className="w-4 h-4 text-muted flex-shrink-0" />
                  <span>{businessHours}</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <h2 className="text-xs font-medium text-ink">
                Send a Note
              </h2>

              {isSubmitted ? (
                <div className="p-6 bg-surface border border-line rounded-ui text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-medium text-ink">Message Received</h3>
                  <p className="text-xs text-muted font-light leading-relaxed">
                    Thank you! We received your message and will reply shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setName('');
                      setContactInfo('');
                      setMessage('');
                    }}
                    className="text-xs text-accent underline pt-2"
                  >
                    Send another note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3 bg-surface border border-line p-5 rounded-ui">
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-ui flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Honeypot field for bot protection */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website">Do not fill this</label>
                    <input
                      id="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-name" className="text-xs text-ink block mb-1 font-normal">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      maxLength={80}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Radhika S."
                      className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-info" className="text-xs text-ink block mb-1 font-normal">
                      Email or Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-info"
                      type="text"
                      required
                      maxLength={120}
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="e.g. radhika@example.com or 9876543210"
                      className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-msg" className="text-xs text-ink block mb-1 font-normal">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="contact-msg"
                      rows={4}
                      required
                      maxLength={2000}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help you today?"
                      className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[40px] bg-ink text-bg text-xs font-normal rounded-ui hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
