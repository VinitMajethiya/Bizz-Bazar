import React from 'react';
import { useSiteSettings } from '../lib/hooks/useCatalog';

export interface TickerProps {
  customText?: string;
}

export const Ticker: React.FC<TickerProps> = ({ customText }) => {
  const { data: settings } = useSiteSettings();

  const tickerText =
    customText ||
    settings?.ticker_text ||
    'Everyday luxury, without the luxury price. DM to order.';

  return (
    <div
      role="region"
      aria-label="Announcement"
      className="bg-ink text-bg text-[12px] py-2 px-4 overflow-hidden select-none font-normal tracking-wide border-b border-line/20"
    >
      <div className="max-w-site mx-auto flex items-center justify-center text-center">
        <p className="truncate text-center">
          {tickerText}
        </p>
      </div>
    </div>
  );
};

export default Ticker;
