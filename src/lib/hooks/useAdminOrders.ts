import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchUnifiedPipeline,
  fetchPipelineItemDetail,
  convertEnquiryToOrderRpc,
  updateEnquiryStatus,
  updateOrderStatus,
  updateOrderCustomerDetails,
  type PipelineFilters,
  type ConvertOrderParams,
  type EditOrderCustomerDetails,
} from '../api/adminOrders';
import { supabase, isSupabaseConfigured } from '../supabase';
import { useToastStore } from '@/components/ui/toastStore';
import type { OrderStatus } from '../database.types';

export function useAdminPipeline(filters?: PipelineFilters) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'pipeline', filters],
    queryFn: () => fetchUnifiedPipeline(filters),
    staleTime: 15 * 1000,
  });

  // Realtime subscription on enquiries & window focus fallback
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('admin-pipeline-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'enquiries' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin', 'pipeline'] });
          queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin', 'pipeline'] });
          queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
        }
      )
      .subscribe();

    // Fallback on window focus if socket was paused in background
    const handleFocus = () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('focus', handleFocus);
    };
  }, [queryClient]);

  return query;
}

export function useAdminPipelineItem(id: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'pipeline-item', id],
    queryFn: () => {
      if (!id) return Promise.resolve(null);
      return fetchPipelineItemDetail(id);
    },
    enabled: Boolean(id),
    staleTime: 15 * 1000,
  });
}

export function useAdminOrderMutations() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  const convertMutation = useMutation({
    mutationFn: (params: ConvertOrderParams) => convertEnquiryToOrderRpc(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pipeline-item', data.enquiry_id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pipeline-item', data.order_id] });
      showToast('Enquiry successfully converted to order!', 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to convert enquiry', 'error');
    },
  });

  const enquiryStatusMutation = useMutation({
    mutationFn: ({ enquiryId, status }: { enquiryId: string; status: 'dropped' | 'new' }) =>
      updateEnquiryStatus(enquiryId, status),
    onSuccess: (_, { status, enquiryId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pipeline-item', enquiryId] });
      showToast(status === 'dropped' ? 'Enquiry marked as dropped' : 'Enquiry reopened', 'info');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to update enquiry', 'error');
    },
  });

  const orderStatusMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
      courier,
      trackingNumber,
    }: {
      orderId: string;
      status: OrderStatus;
      courier?: string | null;
      trackingNumber?: string | null;
    }) => updateOrderStatus(orderId, status, courier, trackingNumber),
    onSuccess: (_, { orderId, status }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pipeline-item', orderId] });
      showToast(`Order status updated to ${status}`, 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to update order status', 'error');
    },
  });

  const orderDetailsMutation = useMutation({
    mutationFn: ({
      orderId,
      details,
    }: {
      orderId: string;
      details: EditOrderCustomerDetails;
    }) => updateOrderCustomerDetails(orderId, details),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pipeline-item', orderId] });
      showToast('Order details saved', 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to save order details', 'error');
    },
  });

  return {
    convertEnquiry: convertMutation.mutateAsync,
    isConverting: convertMutation.isPending,
    updateEnquiryStatus: enquiryStatusMutation.mutateAsync,
    isUpdatingEnquiryStatus: enquiryStatusMutation.isPending,
    updateOrderStatus: orderStatusMutation.mutateAsync,
    isUpdatingOrderStatus: orderStatusMutation.isPending,
    updateOrderDetails: orderDetailsMutation.mutateAsync,
    isUpdatingOrderDetails: orderDetailsMutation.isPending,
  };
}
