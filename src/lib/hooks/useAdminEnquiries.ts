import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';
import {
  fetchAdminEnquiries,
  fetchAdminEnquiryById,
  updateEnquiryStatus,
  updateEnquiryInternalNotes,
  type EnquiryInboxFilters,
} from '../api/adminEnquiries';
import type { EnquiryStatus } from '../database.types';
import { useToastStore } from '@/components/ui/toastStore';

export function useAdminEnquiries(filters?: EnquiryInboxFilters) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-enquiries', filters?.status, filters?.channel, filters?.search],
    queryFn: () => fetchAdminEnquiries(filters),
    staleTime: 10_000,
  });

  // Realtime subscription on enquiries table
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('admin-enquiries-inbox')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'enquiries' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });
          queryClient.invalidateQueries({ queryKey: ['admin-overview-stats'] });
        }
      )
      .subscribe();

    const handleFocus = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('focus', handleFocus);
    };
  }, [queryClient]);

  return query;
}

export function useAdminEnquiryDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['admin-enquiry-detail', id],
    queryFn: () => (id ? fetchAdminEnquiryById(id) : null),
    enabled: Boolean(id),
    staleTime: 5_000,
  });
}

export function useAdminEnquiryMutations() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  const statusMutation = useMutation({
    mutationFn: ({
      enquiryId,
      status,
    }: {
      enquiryId: string;
      status: EnquiryStatus;
    }) => updateEnquiryStatus(enquiryId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['admin-enquiry-detail', variables.enquiryId] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview-stats'] });

      const label =
        variables.status === 'handled'
          ? 'Enquiry marked as handled'
          : variables.status === 'dropped'
            ? 'Enquiry marked as dropped'
            : 'Enquiry reopened';
      showToast(label, 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to update enquiry status', 'error');
    },
  });

  const notesMutation = useMutation({
    mutationFn: ({
      enquiryId,
      notes,
    }: {
      enquiryId: string;
      notes: string | null;
    }) => updateEnquiryInternalNotes(enquiryId, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-enquiry-detail', variables.enquiryId] });
      showToast('Internal notes saved', 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to save notes', 'error');
    },
  });

  return {
    updateStatus: statusMutation.mutateAsync,
    isUpdatingStatus: statusMutation.isPending,
    saveNotes: notesMutation.mutateAsync,
    isSavingNotes: notesMutation.isPending,
  };
}
