import { supabase } from '../supabase';
import type { Product, ProductImage } from '../types';

interface RawProductImage {
  id: string;
  product_id: string;
  image_url: string;
  storage_path: string | null;
  alt: string | null;
  is_hero: boolean;
  display_order: number;
  variant_key: string | null;
}

interface RawProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  price_paise: number;
  compare_at_price_paise: number | null;
  stock_status: 'in_stock' | 'low_stock' | 'sold_out';
  stock_qty: number | null;
  badge: string | null;
  options: {
    materials: string[];
    sizes: string[];
  };
  specs_json: Record<string, string>;
  is_featured: boolean;
  is_archived: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  images?: RawProductImage[];
}

export function mapProduct(raw: RawProduct): Product {
  const images: ProductImage[] = (raw.images || [])
    .sort((a, b) => {
      if (a.is_hero !== b.is_hero) return a.is_hero ? -1 : 1;
      return a.display_order - b.display_order;
    })
    .map((img) => ({
      id: img.id,
      productId: img.product_id,
      imageUrl: img.image_url,
      storagePath: img.storage_path,
      alt: img.alt,
      isHero: img.is_hero,
      displayOrder: img.display_order,
      variantKey: img.variant_key,
    }));

  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    category: raw.category,
    description: raw.description,
    pricePaise: raw.price_paise,
    compareAtPricePaise: raw.compare_at_price_paise,
    stockStatus: raw.stock_status,
    stockQty: raw.stock_qty,
    badge: raw.badge,
    options: raw.options || { materials: [], sizes: [] },
    specs: raw.specs_json || {},
    isFeatured: raw.is_featured,
    isArchived: raw.is_archived,
    sortOrder: raw.sort_order,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    images,
  };
}

export interface FetchProductsOptions {
  category?: string;
  sort?: string;
  limit?: number;
}

export async function fetchProducts(options?: FetchProductsOptions): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('is_archived', false);

  if (options?.category && options.category !== 'All') {
    query = query.eq('category', options.category);
  }

  // Apply sorting
  switch (options?.sort) {
    case 'price-asc':
      query = query.order('price_paise', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('price_paise', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'featured':
    default:
      query = query
        .order('is_featured', { ascending: false })
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      break;
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || 'Failed to fetch products');
  }

  return (data as unknown as RawProduct[]).map(mapProduct);
}

export async function fetchFeaturedProducts(limit = 4): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('is_archived', false)
    .eq('is_featured', true)
    .order('sort_order', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(error.message || 'Failed to fetch featured products');
  }

  return (data as unknown as RawProduct[]).map(mapProduct);
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('slug', slug)
    .eq('is_archived', false)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Failed to fetch product');
  }

  if (!data) return null;

  return mapProduct(data as unknown as RawProduct);
}

export async function fetchRelatedProducts(
  category: string,
  currentProductId: string,
  limit = 4
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('category', category)
    .eq('is_archived', false)
    .neq('id', currentProductId)
    .order('sort_order', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(error.message || 'Failed to fetch related products');
  }

  return (data as unknown as RawProduct[]).map(mapProduct);
}
