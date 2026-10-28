import { describe, it, expect, vi, beforeEach } from 'vitest';
import { placeOrder } from './placeOrder';
import { useToastStore } from '../../components/ui/toastStore';
import { useOrderModalStore } from './orderModalStore';
import { useCartStore } from '../cart/cartStore';
import * as enquiriesApi from '../../lib/api/enquiries';
import type { SiteSettings } from '../../lib/types';

const mockSettings: SiteSettings = {
  brand_name: 'By Raya.co',
  whatsapp_number: '+91 99999-88888',
  instagram_handle: 'by.raya.co',
  support_email: 'hello@byraya.co',
  tagline: 'Effortless elegance',
  business_hours: '10am - 7pm',
  ticker_text: 'DM to order',
  hero_headline: 'Effortless elegance',
  hero_text: 'Everyday luxury',
  hero_image_url: '',
  story_teaser: 'Our story',
  guarantees: [],
  footer_text: 'By Raya',
};

describe('placeOrder flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useToastStore.setState({ message: null, type: 'info' });
    useOrderModalStore.setState({ isOpen: false, ref: '', message: '' });
    useCartStore.getState().clearCart();
  });

  it('successfully creates enquiry and redirects on WhatsApp', async () => {
    const mockRpcResult = {
      ref: 'BR-TEST01',
      items: [
        {
          product_id: 'prod-1',
          name: 'Lilac Twist Hoops',
          options: { material: 'Gold' },
          unit_price_paise: 49900,
          qty: 1,
        },
      ],
      subtotal_paise: 49900,
      discount_paise: 0,
    };

    vi.spyOn(enquiriesApi, 'createEnquiryRpc').mockResolvedValue(mockRpcResult);

    useCartStore.getState().addLine({
      productId: 'prod-1',
      options: { material: 'Gold' },
      qty: 1,
    });

    const success = await placeOrder({
      channel: 'whatsapp',
      lines: useCartStore.getState().lines,
      note: 'Birthday gift',
      settings: mockSettings,
      isFromBag: true,
    });

    expect(success).toBe(true);
    expect(enquiriesApi.createEnquiryRpc).toHaveBeenCalledTimes(1);
    expect(enquiriesApi.createEnquiryRpc).toHaveBeenCalledWith(
      'whatsapp',
      expect.any(Array),
      'Birthday gift'
    );
    // Cart should be cleared after placing order from bag
    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  it('successfully creates enquiry and opens Instagram modal', async () => {
    const mockRpcResult = {
      ref: 'BR-TEST02',
      items: [
        {
          product_id: 'prod-2',
          name: 'Bow Studs',
          options: { material: 'Gold' },
          unit_price_paise: 39900,
          qty: 2,
        },
      ],
      subtotal_paise: 79800,
      discount_paise: 0,
    };

    vi.spyOn(enquiriesApi, 'createEnquiryRpc').mockResolvedValue(mockRpcResult);

    const success = await placeOrder({
      channel: 'instagram',
      lines: [{ productId: 'prod-2', options: { material: 'Gold' }, qty: 2 }],
      note: null,
      settings: mockSettings,
      isFromBag: false,
    });

    expect(success).toBe(true);
    expect(enquiriesApi.createEnquiryRpc).toHaveBeenCalledTimes(1);

    // Modal should be opened with ref and message
    const modalState = useOrderModalStore.getState();
    expect(modalState.isOpen).toBe(true);
    expect(modalState.channel).toBe('instagram');
    expect(modalState.ref).toBe('BR-TEST02');
    expect(modalState.message).toContain('Bow Studs (Gold) x2 = ₹798');
    expect(modalState.targetUrl).toBe('https://ig.me/m/by.raya.co');
  });

  it('blocks chat and shows error toast when RPC fails', async () => {
    vi.spyOn(enquiriesApi, 'createEnquiryRpc').mockRejectedValue(new Error('Network error'));

    const success = await placeOrder({
      channel: 'whatsapp',
      lines: [{ productId: 'prod-1', options: {}, qty: 1 }],
      settings: mockSettings,
    });

    expect(success).toBe(false);
    expect(useOrderModalStore.getState().isOpen).toBe(false);

    // Toast with required exact string from PRD/CONTENT.md
    const toast = useToastStore.getState();
    expect(toast.message).toBe('We couldn’t save your enquiry. Check your connection and try again.');
    expect(toast.type).toBe('error');
  });

  it('prevents duplicate submissions when double-tapped in flight', async () => {
    // Delay resolution to simulate in-flight request
    let resolveRpc: (val: enquiriesApi.CreateEnquiryResult) => void;
    const pendingPromise = new Promise<enquiriesApi.CreateEnquiryResult>((resolve) => {
      resolveRpc = resolve;
    });

    vi.spyOn(enquiriesApi, 'createEnquiryRpc').mockReturnValue(pendingPromise);

    const call1 = placeOrder({
      channel: 'whatsapp',
      lines: [{ productId: 'prod-1', options: {}, qty: 1 }],
      settings: mockSettings,
    });

    // Immediate second call
    const call2 = placeOrder({
      channel: 'whatsapp',
      lines: [{ productId: 'prod-1', options: {}, qty: 1 }],
      settings: mockSettings,
    });

    // Second call must be rejected immediately without calling RPC again
    const res2 = await call2;
    expect(res2).toBe(false);
    expect(enquiriesApi.createEnquiryRpc).toHaveBeenCalledTimes(1);

    // Finish first call
    resolveRpc!({
      ref: 'BR-111111',
      items: [{ product_id: 'p1', name: 'Item', options: {}, unit_price_paise: 100, qty: 1 }],
      subtotal_paise: 100,
      discount_paise: 0,
    });

    const res1 = await call1;
    expect(res1).toBe(true);
  });
});
