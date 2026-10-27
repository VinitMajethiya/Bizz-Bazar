import type { Database, StockStatus } from './database.types';

export type ProductRow = Database['public']['Tables']['products']['Row'];
export type ProductImageRow = Database['public']['Tables']['product_images']['Row'];
export type SiteSettingRow = Database['public']['Tables']['site_settings']['Row'];
export type ReviewRow = Database['public']['Tables']['reviews']['Row'];

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  storagePath: string | null;
  alt: string | null;
  isHero: boolean;
  displayOrder: number;
  variantKey: string | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  pricePaise: number;
  compareAtPricePaise: number | null;
  stockStatus: StockStatus;
  stockQty: number | null;
  badge: string | null;
  options: {
    materials: string[];
    sizes: string[];
  };
  specs: Record<string, string>;
  isFeatured: boolean;
  isArchived: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
}

export interface Guarantee {
  title: string;
  text: string;
}

export interface SiteSettings {
  brand_name: string;
  whatsapp_number: string;
  instagram_handle: string;
  support_email: string;
  tagline: string;
  business_hours: string;
  ticker_text: string;
  hero_headline: string;
  hero_text: string;
  hero_image_url: string;
  story_teaser: string;
  guarantees: Guarantee[];
  footer_text: string;
}

export interface Review {
  id: string;
  productId: string | null;
  rating: number;
  reviewerName: string;
  title: string | null;
  reviewText: string;
  status: 'pending' | 'approved' | 'rejected';
  isOffline: boolean;
  createdAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
}

