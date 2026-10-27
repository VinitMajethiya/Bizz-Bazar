import { useQuery, useMutation } from '@tanstack/react-query';
import {
  fetchProducts,
  fetchFeaturedProducts,
  fetchProductBySlug,
  fetchRelatedProducts,
} from '../api/products';
import { fetchSiteSettings } from '../api/settings';
import { fetchApprovedReviews } from '../api/reviews';
import { submitDropAlert } from '../api/leads';
import type { Product, SiteSettings, ReviewStats } from '../types';

export function useProducts(category?: string, sort?: string) {
  return useQuery<Product[]>({
    queryKey: ['products', { category: category || 'All', sort: sort || 'featured' }],
    queryFn: () => fetchProducts({ category, sort }),
    staleTime: 60 * 1000, // 1 minute as specified in ARCHITECTURE.md
  });
}

export function useFeaturedProducts(limit = 4) {
  return useQuery<Product[]>({
    queryKey: ['products', 'featured', limit],
    queryFn: () => fetchFeaturedProducts(limit),
    staleTime: 60 * 1000,
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery<Product | null>({
    queryKey: ['product', slug],
    queryFn: () => {
      if (!slug) return Promise.resolve(null);
      return fetchProductBySlug(slug);
    },
    enabled: Boolean(slug),
    staleTime: 60 * 1000,
  });
}

export function useRelatedProducts(category: string, currentProductId: string, limit = 4) {
  return useQuery<Product[]>({
    queryKey: ['products', 'related', category, currentProductId, limit],
    queryFn: () => fetchRelatedProducts(category, currentProductId, limit),
    enabled: Boolean(category && currentProductId),
    staleTime: 60 * 1000,
  });
}

export function useSiteSettings() {
  return useQuery<SiteSettings>({
    queryKey: ['settings'],
    queryFn: fetchSiteSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes as specified in ARCHITECTURE.md
  });
}

export function useReviews(productId?: string) {
  return useQuery<ReviewStats>({
    queryKey: ['reviews', productId || 'all'],
    queryFn: () => fetchApprovedReviews(productId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDropAlertMutation() {
  return useMutation({
    mutationFn: (contact: string) => submitDropAlert(contact),
  });
}
