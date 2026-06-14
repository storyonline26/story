import React from 'react';

const ANNOUNCEMENTS = [
  'FREE SHIPPING ON ORDERS ABOVE INR 999',
  'SALE 20% OFF',
  '100% AUTHENTIC BRANDED FASHION',
  'NEW ARRIVALS EVERY WEEK',
  'EASY RETURNS & EXCHANGES',
  'CURATED IN INDIA FOR YOU',
];

interface AnnouncementTickerProps {
  items?: string[];
}

export const AnnouncementTicker: React.FC<AnnouncementTickerProps> = ({ items = ANNOUNCEMENTS }) => {
  const visibleItems = items.map((item) => item.trim()).filter(Boolean);
  if (visibleItems.length === 0) return null;

  const separator = '   *   ';
  const text = visibleItems.join(separator);
  const repeated = `${text}${separator}${text}${separator}`;

  return (
    <div className="w-full overflow-hidden border-b border-[#e5e5e5] bg-[#F5F5F5] py-2">
      <div className="animate-marquee whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-[#333333]">
        {repeated}
      </div>
    </div>
  );
};
