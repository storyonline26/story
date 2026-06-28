import React from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface ConnectionErrorProps {
  onRetry?: () => void;
  type?: 'products' | 'page' | 'general';
}

export const ConnectionError: React.FC<ConnectionErrorProps> = ({ onRetry, type = 'general' }) => {
  const [retrying, setRetrying] = React.useState(false);

  const handleRetry = () => {
    if (!onRetry) {
      window.location.reload();
      return;
    }
    setRetrying(true);
    onRetry();
    setTimeout(() => setRetrying(false), 2000);
  };

  if (type === 'products') {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F8F6F1]">
          <WifiOff size={24} className="text-[#6B625A]" />
        </div>
        <h3 className="mt-4 text-[16px] font-semibold text-[#111111]">Products loading...</h3>
        <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-[#6B625A]">
          We're having trouble connecting. Please check your internet and try again.
        </p>
        <button
          type="button"
          onClick={handleRetry}
          disabled={retrying}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-full border border-[#111111] px-5 text-[12px] font-semibold text-[#111111] transition hover:bg-[#111111] hover:text-white disabled:opacity-50"
        >
          <RefreshCw size={14} className={retrying ? 'animate-spin' : ''} />
          {retrying ? 'Retrying...' : 'Try again'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F8F6F1]">
        <Wifi size={28} className="text-[#6B625A]" />
      </div>
      <h2 className="mt-6 font-display text-2xl font-bold text-[#111111]">We'll be right back</h2>
      <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-[#6B625A]">
        STORY India is experiencing a temporary connection issue. Our team is on it. Please try again in a moment.
      </p>
      <button
        type="button"
        onClick={handleRetry}
        disabled={retrying}
        className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#111111] px-7 text-[13px] font-semibold text-white transition hover:bg-black disabled:opacity-50"
      >
        <RefreshCw size={15} className={retrying ? 'animate-spin' : ''} />
        {retrying ? 'Reconnecting...' : 'Refresh page'}
      </button>
      <p className="mt-8 text-[11px] text-[#6B625A]">
        If the issue persists, contact us at <span className="font-medium text-[#111111]">care@story.in</span>
      </p>
    </div>
  );
};
