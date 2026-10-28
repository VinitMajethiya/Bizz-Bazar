import { supabase } from '../supabase';
import type { ChatChannel, EnquiryStatus, OrderStatus, Database } from '../database.types';
import { buildOrdersCsv, type OrderCsvRecord } from '../orders/csvExport';

export type UnifiedPipelineStatus =
  | 'new'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'dropped';

export interface EnquiryItemData {
  product_id: string;
  name: string;
  options?: { material?: string; size?: string };
  unit_price_paise: number;
  qty: number;
}

export interface UnifiedPipelineItem {
  id: string; // Enquiry ID
  enquiryId: string;
  orderId: string | null;
  ref: string;
  channel: ChatChannel;
  items: EnquiryItemData[];
  itemsSummary: string;
  subtotalPaise: number;
  discountPaise: number;
  totalPaise: number;
  customerName: string | null;
  customerPhone: string | null;
  shippingAddress: string | null;
  customerNote: string | null;
  enquiryStatus: EnquiryStatus;
  orderStatus: OrderStatus | null;
  displayStatus: UnifiedPipelineStatus;
  createdAt: string;
  updatedAt?: string;
  courier: string | null;
  trackingNumber: string | null;
  internalNotes: string | null;
}

export interface PipelineFilters {
  status?: string; // 'all' or UnifiedPipelineStatus
  channel?: string; // 'all', 'whatsapp', 'instagram'
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

export async function fetchUnifiedPipeline(
  filters?: PipelineFilters
): Promise<UnifiedPipelineItem[]> {
  // Fetch enquiries with their linked orders
  const { data: rawEnquiries, error } = await supabase
    .from('enquiries')
    .select('*, orders(*)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load enquiries and orders: ${error.message}`);
  }

  const items: UnifiedPipelineItem[] = (rawEnquiries || []).map((e) => {
    const rawOrders = (e as unknown as { orders?: Array<{
      id: string;
      customer_name: string | null;
      customer_phone: string | null;
      shipping_address: string | null;
      courier: string | null;
      tracking_number: string | null;
      internal_notes: string | null;
      status: OrderStatus;
      total_paise: number;
      created_at: string;
      updated_at: string;
    }> }).orders;

    const linkedOrder = rawOrders && rawOrders.length > 0 ? rawOrders[0] : null;

    let displayStatus: UnifiedPipelineStatus = 'new';
    if (e.status === 'dropped') {
      displayStatus = 'dropped';
    } else if (linkedOrder) {
      displayStatus = linkedOrder.status;
    } else if (e.status === 'converted') {
      displayStatus = 'confirmed';
    } else {
      displayStatus = 'new';
    }

    const parsedItems: EnquiryItemData[] = Array.isArray(e.items_json)
      ? (e.items_json as unknown as EnquiryItemData[])
      : [];

    return {
      id: e.id,
      enquiryId: e.id,
      orderId: linkedOrder ? linkedOrder.id : null,
      ref: e.ref,
      channel: e.channel,
      items: parsedItems,
      itemsSummary: formatItemsSummary(parsedItems),
      subtotalPaise: e.subtotal_paise,
      discountPaise: e.discount_paise || 0,
      totalPaise: linkedOrder ? linkedOrder.total_paise : e.subtotal_paise - (e.discount_paise || 0),
      customerName: linkedOrder ? linkedOrder.customer_name : null,
      customerPhone: linkedOrder ? linkedOrder.customer_phone : null,
      shippingAddress: linkedOrder ? linkedOrder.shipping_address : null,
      customerNote: e.customer_note,
      enquiryStatus: e.status,
      orderStatus: linkedOrder ? linkedOrder.status : null,
      displayStatus,
      createdAt: e.created_at,
      updatedAt: linkedOrder ? linkedOrder.updated_at : undefined,
      courier: linkedOrder ? linkedOrder.courier : null,
      trackingNumber: linkedOrder ? linkedOrder.tracking_number : null,
      internalNotes: linkedOrder ? linkedOrder.internal_notes : null,
    };
  });

  // Client-side filtering
  return items.filter((item) => {
    // Status filter
    if (filters?.status && filters.status !== 'all') {
      if (item.displayStatus !== filters.status) return false;
    }

    // Channel filter
    if (filters?.channel && filters.channel !== 'all') {
      if (item.channel !== filters.channel) return false;
    }

    // Search query (matches ref, customer name, phone, item summary)
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      const matchRef = item.ref.toLowerCase().includes(q);
      const matchName = item.customerName ? item.customerName.toLowerCase().includes(q) : false;
      const matchPhone = item.customerPhone ? item.customerPhone.includes(q) : false;
      const matchItems = item.itemsSummary.toLowerCase().includes(q);
      if (!matchRef && !matchName && !matchPhone && !matchItems) return false;
    }

    return true;
  });
}

export async function fetchPipelineItemDetail(
  id: string
): Promise<UnifiedPipelineItem | null> {
  // Search by enquiry ID or Order ID
  const { data: enquiry, error } = await supabase
    .from('enquiries')
    .select('*, orders(*)')
    .eq('id', id)
    .single();

  if (error || !enquiry) {
    // Try searching by order ID directly
    const { data: orderWithEnquiry } = await supabase
      .from('orders')
      .select('*, enquiries(*)')
      .eq('id', id)
      .single();

    if (!orderWithEnquiry || !orderWithEnquiry.enquiries) return null;
    const e = orderWithEnquiry.enquiries;
    const parsedItems: EnquiryItemData[] = Array.isArray(e.items_json)
      ? (e.items_json as unknown as EnquiryItemData[])
      : [];

    return {
      id: e.id,
      enquiryId: e.id,
      orderId: orderWithEnquiry.id,
      ref: e.ref,
      channel: e.channel,
      items: parsedItems,
      itemsSummary: formatItemsSummary(parsedItems),
      subtotalPaise: e.subtotal_paise,
      discountPaise: e.discount_paise || 0,
      totalPaise: orderWithEnquiry.total_paise,
      customerName: orderWithEnquiry.customer_name,
      customerPhone: orderWithEnquiry.customer_phone,
      shippingAddress: orderWithEnquiry.shipping_address,
      customerNote: e.customer_note,
      enquiryStatus: e.status,
      orderStatus: orderWithEnquiry.status,
      displayStatus: orderWithEnquiry.status,
      createdAt: e.created_at,
      updatedAt: orderWithEnquiry.updated_at,
      courier: orderWithEnquiry.courier,
      trackingNumber: orderWithEnquiry.tracking_number,
      internalNotes: orderWithEnquiry.internal_notes,
    };
  }

  const rawOrders = (enquiry as unknown as { orders?: Array<{
    id: string;
    customer_name: string | null;
    customer_phone: string | null;
    shipping_address: string | null;
    courier: string | null;
    tracking_number: string | null;
    internal_notes: string | null;
    status: OrderStatus;
    total_paise: number;
    created_at: string;
    updated_at: string;
  }> }).orders;

  const linkedOrder = rawOrders && rawOrders.length > 0 ? rawOrders[0] : null;

  let displayStatus: UnifiedPipelineStatus = 'new';
  if (enquiry.status === 'dropped') {
    displayStatus = 'dropped';
  } else if (linkedOrder) {
    displayStatus = linkedOrder.status;
  } else if (enquiry.status === 'converted') {
    displayStatus = 'confirmed';
  }

  const parsedItems: EnquiryItemData[] = Array.isArray(enquiry.items_json)
    ? (enquiry.items_json as unknown as EnquiryItemData[])
    : [];

  return {
    id: enquiry.id,
    enquiryId: enquiry.id,
    orderId: linkedOrder ? linkedOrder.id : null,
    ref: enquiry.ref,
    channel: enquiry.channel,
    items: parsedItems,
    itemsSummary: formatItemsSummary(parsedItems),
    subtotalPaise: enquiry.subtotal_paise,
    discountPaise: enquiry.discount_paise || 0,
    totalPaise: linkedOrder ? linkedOrder.total_paise : enquiry.subtotal_paise - (enquiry.discount_paise || 0),
    customerName: linkedOrder ? linkedOrder.customer_name : null,
    customerPhone: linkedOrder ? linkedOrder.customer_phone : null,
    shippingAddress: linkedOrder ? linkedOrder.shipping_address : null,
    customerNote: enquiry.customer_note,
    enquiryStatus: enquiry.status,
    orderStatus: linkedOrder ? linkedOrder.status : null,
    displayStatus,
    createdAt: enquiry.created_at,
    updatedAt: linkedOrder ? linkedOrder.updated_at : undefined,
    courier: linkedOrder ? linkedOrder.courier : null,
    trackingNumber: linkedOrder ? linkedOrder.tracking_number : null,
    internalNotes: linkedOrder ? linkedOrder.internal_notes : null,
  };
}

export interface ConvertOrderParams {
  enquiryId: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  totalPaise: number;
}

export async function convertEnquiryToOrderRpc(
  params: ConvertOrderParams
): Promise<{ order_id: string; enquiry_id: string; status: OrderStatus }> {
  const { data, error } = await supabase.rpc('convert_enquiry_to_order', {
    p_enquiry_id: params.enquiryId,
    p_name: params.customerName.trim(),
    p_phone: params.customerPhone.trim(),
    p_address: params.shippingAddress.trim(),
    p_total_paise: params.totalPaise,
  });

  if (error || !data) {
    throw new Error(error?.message || 'Failed to convert enquiry to order');
  }

  return data as { order_id: string; enquiry_id: string; status: OrderStatus };
}

export async function updateEnquiryStatus(
  enquiryId: string,
  status: 'dropped' | 'new'
): Promise<void> {
  const { error } = await supabase
    .from('enquiries')
    .update({ status })
    .eq('id', enquiryId);

  if (error) {
    throw new Error(`Failed to update enquiry status: ${error.message}`);
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  courier?: string | null,
  trackingNumber?: string | null
): Promise<void> {
  const updates: Database['public']['Tables']['orders']['Update'] = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (courier !== undefined) updates.courier = courier ? courier.trim() : null;
  if (trackingNumber !== undefined)
    updates.tracking_number = trackingNumber ? trackingNumber.trim() : null;

  const { error } = await supabase.from('orders').update(updates).eq('id', orderId);

  if (error) {
    throw new Error(`Failed to update order status: ${error.message}`);
  }
}

export interface EditOrderCustomerDetails {
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: string;
  internalNotes?: string;
  courier?: string;
  trackingNumber?: string;
}

export async function updateOrderCustomerDetails(
  orderId: string,
  details: EditOrderCustomerDetails
): Promise<void> {
  const updates: Database['public']['Tables']['orders']['Update'] = {
    updated_at: new Date().toISOString(),
  };

  if (details.customerName !== undefined) updates.customer_name = details.customerName.trim();
  if (details.customerPhone !== undefined) updates.customer_phone = details.customerPhone.trim();
  if (details.shippingAddress !== undefined)
    updates.shipping_address = details.shippingAddress.trim();
  if (details.internalNotes !== undefined) updates.internal_notes = details.internalNotes.trim();
  if (details.courier !== undefined) updates.courier = details.courier.trim();
  if (details.trackingNumber !== undefined)
    updates.tracking_number = details.trackingNumber.trim();

  const { error } = await supabase.from('orders').update(updates).eq('id', orderId);

  if (error) {
    throw new Error(`Failed to update order details: ${error.message}`);
  }
}

export async function exportOrdersToCsvString(
  startDate?: string,
  endDate?: string
): Promise<string> {
  let query = supabase
    .from('orders')
    .select('*, enquiries(ref, items_json)')
    .order('created_at', { ascending: false });

  if (startDate) {
    query = query.gte('created_at', new Date(startDate).toISOString());
  }

  if (endDate) {
    // End of day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    query = query.lte('created_at', end.toISOString());
  }

  const { data: rawOrders, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch orders for CSV export: ${error.message}`);
  }

  const records: OrderCsvRecord[] = (rawOrders || []).map((o) => {
    const enq = (o as unknown as { enquiries?: { ref: string; items_json: EnquiryItemData[] } }).enquiries;
    const items = enq && Array.isArray(enq.items_json) ? enq.items_json : [];

    return {
      orderId: o.id,
      enquiryRef: enq ? enq.ref : '',
      createdAt: o.created_at,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      shippingAddress: o.shipping_address,
      itemsSummary: formatItemsSummary(items),
      totalPaise: o.total_paise,
      status: o.status,
      courier: o.courier,
      trackingNumber: o.tracking_number,
    };
  });

  return buildOrdersCsv(records);
}
