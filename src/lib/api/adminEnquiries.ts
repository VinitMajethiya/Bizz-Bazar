import { supabase } from '../supabase';
import type { ChatChannel, EnquiryStatus } from '../database.types';

export interface EnquiryItemData {
  product_id: string;
  name: string;
  options?: { material?: string; size?: string };
  unit_price_paise: number;
  qty: number;
}

export interface AdminEnquiry {
  id: string;
  ref: string;
  channel: ChatChannel;
  items: EnquiryItemData[];
  itemsSummary: string;
  subtotalPaise: number;
  totalPaise: number;
  customerNote: string | null;
  internalNotes: string | null;
  status: EnquiryStatus; // 'new' | 'handled' | 'dropped'
  createdAt: string;
}

export interface EnquiryInboxFilters {
  status?: string; // 'all' | 'new' | 'handled' | 'dropped'
  channel?: string; // 'all' | 'whatsapp' | 'instagram'
  search?: string;
}

export function formatItemsSummary(items: EnquiryItemData[]): string {
  if (!Array.isArray(items) || items.length === 0) return 'No items';
  return items
    .map(
      (it) =>
        `${it.name}${it.options?.material ? ` (${it.options.material})` : ''} x${it.qty}`
    )
    .join(', ');
}

export async function fetchAdminEnquiries(
  filters?: EnquiryInboxFilters
): Promise<AdminEnquiry[]> {
  let query = supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status as EnquiryStatus);
  }

  if (filters?.channel && filters.channel !== 'all') {
    query = query.eq('channel', filters.channel as ChatChannel);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load enquiries: ${error.message}`);
  }

  let items: AdminEnquiry[] = (data || []).map((e) => {
    const parsedItems: EnquiryItemData[] = Array.isArray(e.items_json)
      ? (e.items_json as unknown as EnquiryItemData[])
      : [];

    return {
      id: e.id,
      ref: e.ref,
      channel: e.channel,
      items: parsedItems,
      itemsSummary: formatItemsSummary(parsedItems),
      subtotalPaise: e.subtotal_paise,
      totalPaise: e.subtotal_paise,
      customerNote: e.customer_note,
      internalNotes: e.internal_notes || null,
      status: e.status,
      createdAt: e.created_at,
    };
  });

  // Client-side search by reference or item name
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    items = items.filter(
      (it) =>
        it.ref.toLowerCase().includes(q) ||
        it.itemsSummary.toLowerCase().includes(q)
    );
  }

  return items;
}

export async function fetchAdminEnquiryById(id: string): Promise<AdminEnquiry | null> {
  const { data: e, error } = await supabase
    .from('enquiries')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !e) {
    return null;
  }

  const parsedItems: EnquiryItemData[] = Array.isArray(e.items_json)
    ? (e.items_json as unknown as EnquiryItemData[])
    : [];

  return {
    id: e.id,
    ref: e.ref,
    channel: e.channel,
    items: parsedItems,
    itemsSummary: formatItemsSummary(parsedItems),
    subtotalPaise: e.subtotal_paise,
    totalPaise: e.subtotal_paise,
    customerNote: e.customer_note,
    internalNotes: e.internal_notes || null,
    status: e.status,
    createdAt: e.created_at,
  };
}

export async function updateEnquiryStatus(
  enquiryId: string,
  status: EnquiryStatus
): Promise<void> {
  const { error } = await supabase
    .from('enquiries')
    .update({ status })
    .eq('id', enquiryId);

  if (error) {
    throw new Error(`Failed to update enquiry status: ${error.message}`);
  }
}

export async function updateEnquiryInternalNotes(
  enquiryId: string,
  notes: string | null
): Promise<void> {
  const { error } = await supabase
    .from('enquiries')
    .update({ internal_notes: notes ? notes.trim() : null })
    .eq('id', enquiryId);

  if (error) {
    throw new Error(`Failed to update internal notes: ${error.message}`);
  }
}

