import React from 'react';

export const Privacy: React.FC = () => {
  return (
    <article className="max-w-site mx-auto px-5 md:px-8 py-12 md:py-16">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="space-y-2 border-b border-line pb-6">
          <h1 className="text-3xl font-light text-ink">Privacy Policy</h1>
        </header>

        <div className="space-y-4 text-xs md:text-sm text-ink/90 leading-relaxed font-light">
          <p>
            At By Raya.co, we respect your privacy. This policy describes how we collect and manage your personal data when browsing our catalogue or initiating orders.
          </p>
          <h2 className="text-sm font-medium text-ink pt-2">1. Information We Collect</h2>
          <p>
            When you initiate an order, we record your chosen pieces, options, and enquiry reference code. Specific contact details and instructions are shared directly with us in chat.
          </p>
          <h2 className="text-sm font-medium text-ink pt-2">2. Local Storage</h2>
          <p>
            We use browser localStorage exclusively for preserving your shopping bag and theme preference across sessions.
          </p>
          <h2 className="text-sm font-medium text-ink pt-2">3. Third Parties</h2>
          <p>
            We never sell or distribute your contact details to third parties.
          </p>
        </div>
      </div>
    </article>
  );
};

export default Privacy;

