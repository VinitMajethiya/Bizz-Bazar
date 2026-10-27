import React, { useEffect } from 'react';
import { useToastStore } from './toastStore';

export const Toast: React.FC = () => {
  const { message, type, hideToast } = useToastStore();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      hideToast();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, hideToast]);

  if (!message) return null;

  const bgStyles = {
    info: 'bg-ink text-bg border-line',
    success: 'bg-ink text-bg border-line',
    error: 'bg-danger text-bg border-line',
  }[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-ui text-xs font-normal border shadow-md animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center gap-3 max-w-[90vw] text-center"
      style={{ backgroundColor: type === 'error' ? 'var(--danger)' : 'var(--ink)' }}
    >
      <span className={bgStyles}>{message}</span>
    </div>
  );
};

export default Toast;
