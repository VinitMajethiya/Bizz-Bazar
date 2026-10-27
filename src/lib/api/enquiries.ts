import { supabase } from '../supabase';
import type { ChatChannel, Json } from '../database.types';
import type { CartLine } from '../../features/cart/cartStore';

export interface CreateEnquiryItemPayload {
  product_id: string;
  options?: Record<string, string>;
  qty: number;
}

export interface EnquiryServerLineItem {
  product_id: string;
  name: string;
  options?: {
    material?: string;
    size?: string;
  };
  unit_price_paise: number;
  qty: number;
}

export interface CreateEnquiryResult {
  ref: string;
  items: EnquiryServerLineItem[];
  subtotal_paise: number;
  discount_paise: number;
}

export async function createEnquiryRpc(
  channel: ChatChannel,
  lines: CartLine[],
  note?: string | null
): Promise<CreateEnquiryResult> {
  if (!lines || lines.length === 0) {
    throw new Error('Bag is empty');
  }

  const payload: CreateEnquiryItemPayload[] = lines.map((l) => ({
    product_id: l.productId,
    options: {
      ...(l.options.material ? { material: l.options.material } : {}),
      ...(l.options.size ? { size: l.options.size } : {}),
    },
    qty: l.qty,
  }));

  const { data, error } = await supabase.rpc('create_enquiry', {
    p_items: payload as unknown as Json,
    p_channel: channel,
    p_note: note ? note.trim().slice(0, 500) : null,
    p_coupon: null,
  });

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create enquiry');
  }

  // The RPC returns jsonb with { ref, items, subtotal_paise, discount_paise }
  return data as unknown as CreateEnquiryResult;
}
