import { supabase, isSupabaseConfigured } from '../supabase';
import type { ChatChannel, EnquiryStatus } from '../database.types';

export interface AdminCounters {
  newEnquiries: number;
  totalEnquiries: number;
  liveProducts: number;
  lowStockOrSoldOut: number;
  pendingReviews: number;
  dropAlertLeads: number;
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
        newEnquiries: 0,
        totalEnquiries: 0,
        liveProducts: 0,
        lowStockOrSoldOut: 0,
        pendingReviews: 0,
        dropAlertLeads: 0,
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

  // 5. Total enquiries count
  const { count: totalEnquiriesCount } = await supabase
    .from('enquiries')
    .select('id', { count: 'exact', head: true });

  // 6. Recent enquiries list
  const { data: recentEnquiries } = await supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  const formattedEnquiries: AdminLatestEnquiry[] = (recentEnquiries || []).map((e) => {
    let itemsStr = 'Enquiry items';
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
      newEnquiries: newEnquiriesCount || 0,
      totalEnquiries: totalEnquiriesCount || 0,
      liveProducts: liveProductsCount || 0,
      lowStockOrSoldOut: lowStockCount || 0,
      pendingReviews: 0, // Until Phase 6
      dropAlertLeads: leadsCount || 0,
    },
    latestEnquiries: formattedEnquiries,
  };
}
