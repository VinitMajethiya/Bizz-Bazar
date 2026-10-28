import { supabase, isSupabaseConfigured } from '../supabase';
import type { ChatChannel, EnquiryStatus } from '../database.types';

export interface AdminCounters {
  liveProducts: number;
  lowStockOrSoldOut: number;
  dropAlertLeads: number;
  newEnquiries: number;
  ordersInProgress: number;
  pendingReviews: number;
  liveDeals: number;
}

export interface AdminEnquiryItemSummary {
  name: string;
  qty: number;
  options?: { material?: string; size?: string };
}

export interface AdminLatestEnquiry {
  id: string;
  ref: string;
  channel: ChatChannel;
  customerNote: string | null;
  subtotalPaise: number;
  status: EnquiryStatus;
  createdAt: string;
  itemsSummary: string;
}

export async function fetchAdminOverviewStats(): Promise<{
  counters: AdminCounters;
  latestEnquiries: AdminLatestEnquiry[];
}> {
  if (!isSupabaseConfigured) {
    return {
      counters: {
        liveProducts: 0,
        lowStockOrSoldOut: 0,
        dropAlertLeads: 0,
        newEnquiries: 0,
        ordersInProgress: 0,
        pendingReviews: 0,
        liveDeals: 0,
      },
      latestEnquiries: [],
    };
  }

  // 1. Live products count
  const { count: liveProductsCount } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('is_archived', false);

  // 2. Low stock or sold out count
  const { count: lowStockCount } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('is_archived', false)
    .in('stock_status', ['low_stock', 'sold_out']);

  // 3. Drop alert leads count
  const { count: leadsCount } = await supabase
    .from('newsletter_leads')
    .select('id', { count: 'exact', head: true });

  // 4. New enquiries count (status = 'new')
  const { count: newEnquiriesCount } = await supabase
    .from('enquiries')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new');

  // 5. Orders in progress count (status in confirmed, processing, packed, shipped)
  const { count: inProgressOrdersCount } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .in('status', ['confirmed', 'processing', 'packed', 'shipped']);

  // 6. Recent enquiries list
  const { data: recentEnquiries } = await supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  const formattedEnquiries: AdminLatestEnquiry[] = (recentEnquiries || []).map((e) => {
    let itemsStr = 'Order items';
    if (Array.isArray(e.items_json)) {
      itemsStr = (e.items_json as unknown as AdminEnquiryItemSummary[])
        .map((item) => `${item.name}${item.options?.material ? ` (${item.options.material})` : ''} x${item.qty}`)
        .join(', ');
    }

    return {
      id: e.id,
      ref: e.ref,
      channel: e.channel,
      customerNote: e.customer_note,
      subtotalPaise: e.subtotal_paise,
      status: e.status,
      createdAt: e.created_at,
      itemsSummary: itemsStr,
    };
  });

  return {
    counters: {
      liveProducts: liveProductsCount || 0,
      lowStockOrSoldOut: lowStockCount || 0,
      dropAlertLeads: leadsCount || 0,
      newEnquiries: newEnquiriesCount || 0,
      ordersInProgress: inProgressOrdersCount || 0,
      pendingReviews: 0, // Until Phase 7
      liveDeals: 0, // Until Phase 6
    },
    latestEnquiries: formattedEnquiries,
  };
}
