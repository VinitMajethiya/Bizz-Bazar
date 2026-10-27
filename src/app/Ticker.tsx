import React from 'react';

interface TickerProps {
  text?: string;
}

export const Ticker: React.FC<TickerProps> = ({
  text = 'Everyday luxury, without the luxury price. DM to order.',
}) => {
  return (
    <div
      role="region"
      aria-label="Announcement"
      className="bg-ink text-bg text-[12px] py-1.5 px-4 overflow-hidden select-none font-normal"
    >
      <div className="max-w-site mx-auto flex items-center justify-center text-center">
        <p className="truncate tracking-wide">{text}</p>
      </div>
    </div>
  );
};

export default Ticker;

