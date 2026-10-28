import { supabase, isSupabaseConfigured } from '../supabase';
import type { Review, ReviewStats } from '../types';

export interface ProductReviewStats {
  averageRating: number;
  totalReviews: number;
}

export interface PaginatedReviews {
  reviews: Review[];
  hasMore: boolean;
  total: number;
}

export interface SubmitReviewInput {
  productId: string;
  reviewerName: string;
  rating: number;
  title?: string | null;
  reviewText: string;
}

/**
 * Fetch review count and average rating for a product from the product_review_stats view.
 */
export async function fetchProductReviewStats(productId: string): Promise<ProductReviewStats> {
  if (!isSupabaseConfigured || !productId) {
    return { averageRating: 0, totalReviews: 0 };
  }

  try {
    const { data, error } = await supabase
      .from('product_review_stats')
      .select('avg_rating, review_count')
      .eq('product_id', productId)
      .maybeSingle();

    if (error || !data) {
      return { averageRating: 0, totalReviews: 0 };
    }

    const avg = data.avg_rating ? Number(Number(data.avg_rating).toFixed(1)) : 0;
    return {
      averageRating: avg,
      totalReviews: data.review_count || 0,
    };
  } catch {
    return { averageRating: 0, totalReviews: 0 };
  }
}

/**
 * Fetch approved reviews for a specific product, ordered newest-first, 5 at a time.
 */
export async function fetchProductReviews(
  productId: string,
  page: number = 0,
  pageSize: number = 5
): Promise<PaginatedReviews> {
  if (!isSupabaseConfigured || !productId) {
    return { reviews: [], hasMore: false, total: 0 };
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;

  try {
    const { data, count, error } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error || !data) {
      return { reviews: [], hasMore: false, total: 0 };
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
      showOnHome: r.show_on_home,
      createdAt: r.created_at,
    }));

    const total = count || 0;
    const hasMore = from + reviews.length < total;

    return { reviews, hasMore, total };
  } catch {
    return { reviews: [], hasMore: false, total: 0 };
  }
}

/**
 * Fetch testimonials for the home page.
 * Only reviews where status is 'approved' AND show_on_home is true, up to limit (default 6).
 */
export async function fetchHomeTestimonials(limit: number = 6): Promise<Review[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('status', 'approved')
      .eq('show_on_home', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map((r) => ({
      id: r.id,
      productId: r.product_id,
      rating: r.rating,
      reviewerName: r.reviewer_name,
      title: r.title,
      reviewText: r.review_text,
      status: r.status,
      isOffline: r.is_offline,
      showOnHome: r.show_on_home,
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}

/**
 * Submit a customer review. Always inserted as 'pending', 'is_offline = false', 'show_on_home = false'.
 */
export async function submitReview(input: SubmitReviewInput): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Database is not configured.');
  }

  const { error } = await supabase.from('reviews').insert({
    product_id: input.productId,
    reviewer_name: input.reviewerName.trim(),
    rating: input.rating,
    title: input.title ? input.title.trim() : null,
    review_text: input.reviewText.trim(),
    status: 'pending',
    is_offline: false,
    show_on_home: false,
  });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Compatibility helper for existing callers
 */
export async function fetchApprovedReviews(productId?: string): Promise<ReviewStats> {
  if (!productId) {
    const testimonials = await fetchHomeTestimonials(6);
    return {
      averageRating: 5.0,
      totalReviews: testimonials.length,
      reviews: testimonials,
    };
  }

  const [stats, paginated] = await Promise.all([
    fetchProductReviewStats(productId),
    fetchProductReviews(productId, 0, 50),
  ]);

  return {
    averageRating: stats.averageRating || 5.0,
    totalReviews: stats.totalReviews,
    reviews: paginated.reviews,
  };
}
