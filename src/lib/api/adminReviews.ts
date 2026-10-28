import { supabase, isSupabaseConfigured } from '../supabase';
import type { ReviewStatus } from '../database.types';

export interface AdminReviewItem {
  id: string;
  productId: string | null;
  productName: string | null;
  productSlug: string | null;
  rating: number;
  reviewerName: string;
  title: string | null;
  reviewText: string;
  status: ReviewStatus;
  isOffline: boolean;
  showOnHome: boolean;
  createdAt: string;
}

export interface AdminReviewsData {
  reviews: AdminReviewItem[];
  counts: {
    pending: number;
    shown: number;
    hidden: number;
  };
}

export interface CreateManualTestimonialInput {
  productId: string | null;
  reviewerName: string;
  rating: number;
  title?: string | null;
  reviewText: string;
  showOnHome: boolean;
}

/**
 * Fetch all reviews for admin moderation along with linked product titles.
 */
export async function fetchAdminReviews(): Promise<AdminReviewsData> {
  if (!isSupabaseConfigured) {
    return {
      reviews: [],
      counts: { pending: 0, shown: 0, hidden: 0 },
    };
  }

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      product_id,
      rating,
      reviewer_name,
      title,
      review_text,
      status,
      is_offline,
      show_on_home,
      created_at,
      products:product_id (
        id,
        name,
        slug
      )
    `)
    .order('created_at', { ascending: false });

  if (error || !data) {
    throw new Error(error?.message || 'Failed to fetch reviews for admin.');
  }

  const reviews: AdminReviewItem[] = data.map((r) => {
    // products join can be an object or array in Supabase types
    const prod = Array.isArray(r.products) ? r.products[0] : r.products;

    return {
      id: r.id,
      productId: r.product_id,
      productName: prod?.name ?? null,
      productSlug: prod?.slug ?? null,
      rating: r.rating,
      reviewerName: r.reviewer_name,
      title: r.title,
      reviewText: r.review_text,
      status: r.status,
      isOffline: r.is_offline,
      showOnHome: r.show_on_home,
      createdAt: r.created_at,
    };
  });

  const counts = {
    pending: reviews.filter((r) => r.status === 'pending').length,
    shown: reviews.filter((r) => r.status === 'approved').length,
    hidden: reviews.filter((r) => r.status === 'rejected').length,
  };

  return { reviews, counts };
}

/**
 * Update review status:
 * 'approved' -> Shown
 * 'rejected' -> Hidden (clears show_on_home)
 * 'pending' -> Pending
 */
export async function updateAdminReviewStatus(
  id: string,
  newStatus: ReviewStatus
): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured.');
  }

  const updates: { status: ReviewStatus; show_on_home?: boolean } = {
    status: newStatus,
  };

  if (newStatus === 'rejected') {
    updates.show_on_home = false;
  }

  const { error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Toggle whether an approved review appears on the home page.
 */
export async function toggleAdminReviewShowOnHome(
  id: string,
  showOnHome: boolean
): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured.');
  }

  const { error } = await supabase
    .from('reviews')
    .update({ show_on_home: showOnHome })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Permanently delete a review from the database.
 */
export async function deleteAdminReview(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured.');
  }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Create an owner-added offline testimonial.
 */
export async function createManualTestimonial(
  input: CreateManualTestimonialInput
): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured.');
  }

  const { error } = await supabase.from('reviews').insert({
    product_id: input.productId,
    reviewer_name: input.reviewerName.trim(),
    rating: input.rating,
    title: input.title ? input.title.trim() : null,
    review_text: input.reviewText.trim(),
    status: 'approved',
    is_offline: true,
    show_on_home: input.showOnHome,
  });

  if (error) {
    throw new Error(error.message);
  }
}
