import { createEnquiryRpc } from '../../lib/api/enquiries';
import { cleanWhatsAppNumber } from '../../lib/validation/schemas';
import { buildOrderMessage, encodeForWhatsApp } from './messageBuilder';
import { useOrderModalStore } from './orderModalStore';
import { useToastStore } from '../../components/ui/toastStore';
import { useCartStore, type CartLine } from '../cart/cartStore';
import { DEFAULT_SITE_SETTINGS } from '../../lib/api/settings';
import type { SiteSettings } from '../../lib/types';

let isSubmitting = false;

export function isOrderInProgress(): boolean {
  return isSubmitting;
}

export interface PlaceOrderOptions {
  channel: 'whatsapp' | 'instagram';
  lines: CartLine[];
  note?: string | null;
  settings?: SiteSettings;
  isFromBag?: boolean;
}

export async function placeOrder({
  channel,
  lines,
  note,
  settings,
  isFromBag = false,
}: PlaceOrderOptions): Promise<boolean> {
  if (isSubmitting) {
    return false;
  }

  const { showToast } = useToastStore.getState();

  // Validate lines
  if (!lines || lines.length === 0) {
    showToast('Your bag is empty. Add a piece from the catalogue.', 'error');
    return false;
  }

  // Validate contact channel in settings (fallback to default settings if loading or unset)
  const brandName = settings?.brand_name || DEFAULT_SITE_SETTINGS.brand_name;
  const rawWhatsapp = settings?.whatsapp_number || DEFAULT_SITE_SETTINGS.whatsapp_number;
  const rawInstagram = settings?.instagram_handle || DEFAULT_SITE_SETTINGS.instagram_handle;
  const whatsappNumber = rawWhatsapp ? cleanWhatsAppNumber(rawWhatsapp) : '';
  const instagramHandle = rawInstagram ? rawInstagram.replace(/^@/, '') : '';

  if (channel === 'whatsapp' && !whatsappNumber) {
    showToast('WhatsApp ordering is currently unavailable. Please check back shortly.', 'error');
    return false;
  }

  if (channel === 'instagram' && !instagramHandle) {
    showToast('Instagram ordering is currently unavailable. Please check back shortly.', 'error');
    return false;
  }

  isSubmitting = true;

  try {
    const result = await createEnquiryRpc(channel, lines, note);

    // Build message from RPC response (server prices)
    const formattedItems = result.items.map((it) => ({
      name: it.name,
      options: it.options,
      qty: it.qty,
      lineTotalPaise: it.unit_price_paise * it.qty,
    }));

    const message = buildOrderMessage({
      brandName,
      ref: result.ref,
      items: formattedItems,
      subtotalPaise: result.subtotal_paise,
      note,
    });

    if (channel === 'whatsapp') {
      const targetUrl = `https://wa.me/${whatsappNumber}?text=${encodeForWhatsApp(message)}`;

      try {
        if (typeof window !== 'undefined') {
          window.location.href = targetUrl;
        }
      } catch {
        // Fallback modal if browser blocks redirect
        useOrderModalStore.getState().openModal({
          channel: 'whatsapp',
          ref: result.ref,
          message,
          targetUrl,
          isFromBag,
        });
      }

      if (isFromBag) {
        useCartStore.getState().clearCart();
        useCartStore.getState().closeDrawer();
      }
    } else {
      // Instagram: Always show modal with Reference, Message, Copy button, and Open Instagram button
      const targetUrl = `https://ig.me/m/${instagramHandle}`;
      useOrderModalStore.getState().openModal({
        channel: 'instagram',
        ref: result.ref,
        message,
        targetUrl,
        isFromBag,
      });

      if (isFromBag) {
        useCartStore.getState().closeDrawer();
      }
    }

    return true;
  } catch {
    showToast(
      'We couldn’t save your enquiry. Check your connection and try again.',
      'error'
    );
    return false;
  } finally {
    isSubmitting = false;
  }
}
