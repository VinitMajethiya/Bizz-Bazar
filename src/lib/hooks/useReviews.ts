import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProductReviewStats,
  fetchProductReviews,
  fetchHomeTestimonials,
  submitReview,
  type SubmitReviewInput,
} from '../api/reviews';

export function useProductReviewStats(productId?: string) {
  return useQuery({
    queryKey: ['product-review-stats', productId],
    queryFn: () => (productId ? fetchProductReviewStats(productId) : { averageRating: 0, totalReviews: 0 }),
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useProductReviews(productId?: string, page: number = 0, pageSize: number = 5) {
  return useQuery({
    queryKey: ['product-reviews', productId, page, pageSize],
    queryFn: () =>
      productId
        ? fetchProductReviews(productId, page, pageSize)
        : { reviews: [], hasMore: false, total: 0 },
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useHomeTestimonials(limit: number = 6) {
  return useQuery({
    queryKey: ['home-testimonials', limit],
    queryFn: () => fetchHomeTestimonials(limit),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmitReviewInput) => submitReview(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['product-review-stats', variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: ['product-reviews', variables.productId],
      });
    },
  });
}
