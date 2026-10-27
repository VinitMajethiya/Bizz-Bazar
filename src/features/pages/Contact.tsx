import React, { useState } from 'react';
import { MessageCircle, Instagram, Mail, Clock } from 'lucide-react';

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
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
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-surface border border-line rounded-ui hover:border-accent transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-accent" />
              <div>
                <p className="text-xs font-medium text-ink">WhatsApp</p>
                <p className="text-[11px] text-muted">Fastest reply for orders &amp; queries</p>
              </div>
            </a>

            <a
              href="https://ig.me/m/by.raya.co"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-surface border border-line rounded-ui hover:border-accent transition-colors"
            >
              <Instagram className="w-5 h-5 text-accent" />
              <div>
                <p className="text-xs font-medium text-ink">Instagram DM</p>
                <p className="text-[11px] text-muted">@by.raya.co</p>
              </div>
            </a>

            <div className="p-4 bg-surface border border-line rounded-ui space-y-2">
              <div className="flex items-center gap-2 text-xs text-ink">
                <Mail className="w-4 h-4 text-muted" />
                <span>hello@byraya.co</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <Clock className="w-4 h-4 text-muted" />
                <span>Mon – Sat: 10:00 AM – 7:00 PM IST</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <h2 className="text-xs font-medium text-ink">
              Send a Note
            </h2>

            {submitted ? (
              <div className="p-4 bg-surface border border-line rounded-ui text-xs text-ink">
                Thank you! We received your message and will reply shortly.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Honeypot field for bot protection */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                <div>
                  <label htmlFor="contact-name" className="text-xs text-muted block mb-1">
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    className="w-full bg-surface border border-line rounded-ui px-3 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div>
                  <label htmlFor="contact-info" className="text-xs text-muted block mb-1">
                    Email or Phone
                  </label>
                  <input
                    id="contact-info"
                    type="text"
                    required
                    className="w-full bg-surface border border-line rounded-ui px-3 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div>
                  <label htmlFor="contact-msg" className="text-xs text-muted block mb-1">
                    Message
                  </label>
                  <textarea
                    id="contact-msg"
                    rows={4}
                    required
                    className="w-full bg-surface border border-line rounded-ui px-3 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[40px] bg-ink text-bg text-xs font-normal rounded-ui hover:bg-accent transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

