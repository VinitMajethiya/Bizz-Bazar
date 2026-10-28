import React from 'react';

export const Terms: React.FC = () => {
  return (
    <article className="max-w-site mx-auto px-5 md:px-8 py-12 md:py-16">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="space-y-2 border-b border-line pb-6">
          <h1 className="text-3xl font-light text-ink">Terms of Service</h1>
        </header>

        <div className="space-y-4 text-xs md:text-sm text-ink/90 leading-relaxed font-light">
          <p>
            Welcome to By Raya.co. By accessing our catalogue or ordering via chat, you agree to these terms.
          </p>
          <h2 className="text-sm font-medium text-ink pt-2">1. Chat Ordering</h2>
          <p>
            Orders placed on the storefront are enquiries confirmed in chat. Payment and delivery are arranged directly with the shop in chat. Prices and stock availability can change until confirmation.
          </p>
          <h2 className="text-sm font-medium text-ink pt-2">2. Pricing and Availability</h2>
          <p>
            All prices are in Indian Rupees (INR). We reserve the right to correct typographical errors or discontinue items.
          </p>
        </div>
      </div>
    </article>
  );
};

export default Terms;

