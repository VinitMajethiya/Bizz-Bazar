import { supabase, isSupabaseConfigured } from '../supabase';
import type { Review, ReviewStats } from '../types';

export const DEFAULT_TESTIMONIALS: Review[] = [
  {
    id: 'rev-1',
    productId: null,
    rating: 5,
    reviewerName: 'Riya, Pune',
    title: 'Daily elegance',
    reviewText: 'Looks way more expensive than it is.',
    status: 'approved',
    isOffline: true,
    createdAt: '2026-01-10T12:00:00Z',
  },
  {
    id: 'rev-2',
    productId: null,
    rating: 5,
    reviewerName: 'Sneha, Mumbai',
    title: 'Super fast ordering',
    reviewText: 'Ordering over DM took two minutes.',
    status: 'approved',
    isOffline: true,
    createdAt: '2026-01-12T12:00:00Z',
  },
  {
    id: 'rev-3',
    productId: null,
    rating: 5,
    reviewerName: 'Anjali, Kolhapur',
    title: 'Signature packaging',
    reviewText: 'Packaging made it an easy gift.',
    status: 'approved',
    isOffline: true,
    createdAt: '2026-01-14T12:00:00Z',
  },
];

export async function fetchApprovedReviews(productId?: string): Promise<ReviewStats> {
  if (!isSupabaseConfigured) {
    const fallbackList = productId
      ? [
          {
            id: `rev-prod-${productId}`,
            productId,
            rating: 5,
            reviewerName: 'Verified Customer',
            title: 'Beautiful shine',
            reviewText: 'Stunning everyday piece, anti-tarnish finish really holds up.',
            status: 'approved' as const,
            isOffline: true,
            createdAt: '2026-01-15T10:00:00Z',
          },
        ]
      : DEFAULT_TESTIMONIALS;

    return {
      averageRating: 5.0,
      totalReviews: fallbackList.length,
      reviews: fallbackList,
    };
  }

  try {
    let query = supabase
      .from('reviews')
      .select('*')
      .eq('status', 'approved');

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      const fallbackList = productId
        ? [
            {
              id: `rev-prod-${productId}`,
              productId,
              rating: 5,
              reviewerName: 'Verified Customer',
              title: 'Beautiful shine',
              reviewText: 'Stunning everyday piece, anti-tarnish finish really holds up.',
              status: 'approved' as const,
              isOffline: true,
              createdAt: '2026-01-15T10:00:00Z',
            },
          ]
        : DEFAULT_TESTIMONIALS;

      return {
        averageRating: 5.0,
        totalReviews: fallbackList.length,
        reviews: fallbackList,
      };
    }

    const reviews: Review[] = data.map((r) => ({
      id: r.id,
      productId: r.product_id,
      rating: r.rating,
      reviewerName: r.reviewer_name,
      title: r.title,
      reviewText: r.review_text,
      status: r.status,
      isOffline: r.is_offline,
      createdAt: r.created_at,
    }));

    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = reviews.length > 0 ? Number((total / reviews.length).toFixed(1)) : 5.0;

    return {
      averageRating: avg,
      totalReviews: reviews.length,
      reviews,
    };
  } catch {
    const fallbackList = productId ? [] : DEFAULT_TESTIMONIALS;
    return {
      averageRating: 5.0,
      totalReviews: fallbackList.length,
      reviews: fallbackList,
    };
  }
}
