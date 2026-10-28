import React, { useEffect, useRef, useState } from 'react';
import { X, Copy, Check, ExternalLink, Instagram, MessageCircle } from 'lucide-react';
import { useOrderModalStore } from './orderModalStore';
import { useToastStore } from '../../components/ui/toastStore';
import { useCartStore } from '../cart/cartStore';

export const OrderModal: React.FC = () => {
  const { isOpen, channel, ref: orderRef, message, targetUrl, isFromBag, closeModal } =
    useOrderModalStore();
  const { showToast } = useToastStore();
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      // Focus modal on open
      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Trap focus and Esc to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    let success = false;

    // 1. Try modern navigator.clipboard.writeText if available in a secure context
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      try {
        await navigator.clipboard.writeText(message);
        success = true;
      } catch {
        // Permission denied or non-secure context; will fall through to execCommand
        success = false;
      }
    }

    // 2. Fallback to readonly textarea auto-select + execCommand('copy')
    if (!success) {
      try {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.select();
          textareaRef.current.setSelectionRange(0, message.length);
          success = document.execCommand('copy');
        } else {
          const tempArea = document.createElement('textarea');
          tempArea.value = message;
          tempArea.setAttribute('readonly', '');
          tempArea.style.position = 'fixed';
          tempArea.style.left = '-9999px';
          document.body.appendChild(tempArea);
          tempArea.select();
          success = document.execCommand('copy');
          document.body.removeChild(tempArea);
        }
      } catch {
        success = false;
      }
    }

    // Only show the toast if a copy actually happened
    if (success) {
      setCopied(true);
      showToast('Order copied. Paste it in the chat.', 'success');
      setTimeout(() => setCopied(false), 2500);
    } else {
      // Keep textarea focused and selected so the user can easily copy manually
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }
  };

  const handleOpenChat = () => {
    if (isFromBag) {
      useCartStore.getState().clearCart();
    }
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    closeModal();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={closeModal}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-bg border border-line p-6 shadow-lg rounded-none space-y-5"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 id="order-modal-title" className="text-base font-medium text-ink">
              {channel === 'instagram' ? 'Complete Order on Instagram' : 'Continue to WhatsApp'}
            </h2>
            <p className="text-xs text-muted font-light mt-0.5">
              Reference: <span className="font-mono text-ink font-medium">{orderRef}</span>
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={closeModal}
            aria-label="Close dialog"
            className="p-1.5 text-muted hover:text-ink transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {channel === 'instagram' ? (
          <div className="space-y-4">
            <p className="text-xs text-muted font-light leading-relaxed">
              We’ve saved your enquiry! Copy your order details below, then open Instagram and paste the message into our DM.
            </p>

            <div>
              <label htmlFor="instagram-order-message" className="sr-only">
                Order message
              </label>
              <textarea
                id="instagram-order-message"
                ref={textareaRef}
                readOnly
                value={message}
                rows={6}
                aria-label="Order message to copy"
                className="w-full bg-surface border border-line p-3 text-xs text-ink font-light leading-relaxed select-all resize-none focus:outline-none focus:border-ink font-mono"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                className="w-full min-h-[42px] inline-flex items-center justify-center gap-2 bg-ink text-bg text-xs font-normal rounded-ui hover:bg-accent transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 stroke-[1.5]" />
                    <span>Copy message</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenChat}
                className="w-full min-h-[42px] inline-flex items-center justify-center gap-2 border border-ink text-ink text-xs font-normal rounded-ui hover:border-accent hover:text-accent transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              >
                <Instagram className="w-4 h-4 stroke-[1.5]" />
                <span>Open Instagram</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-muted font-light leading-relaxed">
              Your order enquiry has been registered under reference{' '}
              <span className="font-mono text-ink">{orderRef}</span>. Tap below to send your prefilled order message in WhatsApp chat.
            </p>

            <button
              type="button"
              onClick={handleOpenChat}
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 bg-ink text-bg text-xs font-normal rounded-ui hover:bg-accent transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              <MessageCircle className="w-4 h-4 stroke-[1.5]" />
              <span>Continue to WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderModal;
