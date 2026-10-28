import { supabase, isSupabaseConfigured } from '../supabase';
import type { Product, ProductImage } from '../types';
import { mapProduct } from './products';
import { resizeImageForUpload } from '../images/resize';
import type { ProductDbPayload } from '../validation/productSchema';

export interface AdminProductFilters {
  search?: string;
  category?: string;
  status?: string;
}

export async function fetchAdminProducts(filters?: AdminProductFilters): Promise<Product[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  let query = supabase
    .from('products')
    .select('*, images:product_images(*)')
    .order('created_at', { ascending: false });

  if (filters?.search && filters.search.trim()) {
    query = query.ilike('name', `%${filters.search.trim()}%`);
  }

  if (filters?.category && filters.category !== 'All') {
    query = query.eq('category', filters.category);
  }

  if (filters?.status && filters.status !== 'All') {
    if (filters.status === 'archived') {
      query = query.eq('is_archived', true);
    } else {
      query = query
        .eq('is_archived', false)
        .eq('stock_status', filters.status as 'in_stock' | 'low_stock' | 'sold_out');
    }
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to load admin products: ${error.message}`);
  }

  return (data || []).map(mapProduct);
}

export async function fetchAdminProductById(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return mapProduct(data);
}

export async function checkSlugUnique(slug: string, currentProductId?: string): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  let query = supabase.from('products').select('id').eq('slug', slug);
  if (currentProductId) {
    query = query.neq('id', currentProductId);
  }

  const { data, error } = await query;
  if (error) return true;
  return !data || data.length === 0;
}

export async function createAdminProduct(payload: ProductDbPayload): Promise<Product> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured');
  }

  // Ensure slug uniqueness
  const isUnique = await checkSlugUnique(payload.slug);
  if (!isUnique) {
    throw new Error(`Slug "${payload.slug}" is already in use by another product.`);
  }

  const { data, error } = await supabase
    .from('products')
    .insert([payload])
    .select('*, images:product_images(*)')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create product');
  }

  return mapProduct(data);
}

export async function updateAdminProduct(
  id: string,
  payload: Partial<ProductDbPayload>
): Promise<Product> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured');
  }

  if (payload.slug) {
    const isUnique = await checkSlugUnique(payload.slug, id);
    if (!isUnique) {
      throw new Error(`Slug "${payload.slug}" is already in use by another product.`);
    }
  }

  const { data, error } = await supabase
    .from('products')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, images:product_images(*)')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to update product');
  }

  return mapProduct(data);
}

export async function archiveAdminProduct(id: string, isArchived = true): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase
    .from('products')
    .update({ is_archived: isArchived, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update archive status: ${error.message}`);
  }
}

export async function uploadProductImage(
  productId: string,
  file: File,
  options?: {
    alt?: string;
    isHero?: boolean;
    variantKey?: string;
  }
): Promise<ProductImage> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured');
  }

  // 1. Resize image to max 1600px long edge and encode as WebP / JPEG
  const resized = await resizeImageForUpload(file, 1600);

  // 2. Upload to storage: product-images/<productId>/<uuid>.<ext>
  const fileExt = resized.extension;
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const storagePath = `${productId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(storagePath, resized.blob, {
      contentType: resized.mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  // 3. Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('product-images').getPublicUrl(storagePath);

  // 4. Determine display order & hero logic
  const { data: existingImages } = await supabase
    .from('product_images')
    .select('id, display_order, is_hero')
    .eq('product_id', productId)
    .order('display_order', { ascending: false });

  const nextOrder = existingImages && existingImages.length > 0 ? existingImages[0].display_order + 1 : 0;
  const isFirstImage = !existingImages || existingImages.length === 0;
  const shouldBeHero = options?.isHero !== undefined ? options.isHero : isFirstImage;

  if (shouldBeHero && existingImages && existingImages.length > 0) {
    // Unset existing heroes to respect unique constraint
    await supabase
      .from('product_images')
      .update({ is_hero: false })
      .eq('product_id', productId);
  }

  // 5. Insert product_images row
  const { data: inserted, error: insertError } = await supabase
    .from('product_images')
    .insert([
      {
        product_id: productId,
        image_url: publicUrl,
        storage_path: storagePath,
        alt: options?.alt?.trim() || null,
        is_hero: shouldBeHero,
        display_order: nextOrder,
        variant_key: options?.variantKey?.trim() || null,
      },
    ])
    .select('*')
    .single();

  if (insertError || !inserted) {
    // Rollback uploaded storage object
    await supabase.storage.from('product-images').remove([storagePath]);
    throw new Error(`Failed to record image record: ${insertError?.message}`);
  }

  return {
    id: inserted.id,
    productId: inserted.product_id,
    imageUrl: inserted.image_url,
    storagePath: inserted.storage_path,
    alt: inserted.alt,
    isHero: inserted.is_hero,
    displayOrder: inserted.display_order,
    variantKey: inserted.variant_key,
  };
}

export async function updateProductImage(
  productId: string,
  imageId: string,
  updates: {
    alt?: string | null;
    isHero?: boolean;
    variantKey?: string | null;
  }
): Promise<void> {
  if (!isSupabaseConfigured) return;

  if (updates.isHero) {
    // Clear other heroes first
    await supabase
      .from('product_images')
      .update({ is_hero: false })
      .eq('product_id', productId);
  }

  const { error } = await supabase
    .from('product_images')
    .update({
      ...(updates.alt !== undefined && { alt: updates.alt }),
      ...(updates.isHero !== undefined && { is_hero: updates.isHero }),
      ...(updates.variantKey !== undefined && { variant_key: updates.variantKey }),
    })
    .eq('id', imageId);

  if (error) {
    throw new Error(`Failed to update image details: ${error.message}`);
  }
}

export async function reorderProductImages(
  productId: string,
  imageIdsInOrder: string[]
): Promise<void> {
  if (!isSupabaseConfigured) return;

  const updates = imageIdsInOrder.map((id, index) =>
    supabase
      .from('product_images')
      .update({ display_order: index })
      .eq('id', id)
      .eq('product_id', productId)
  );

  await Promise.all(updates);
}

export async function deleteProductImage(
  productId: string,
  imageId: string,
  storagePath?: string | null
): Promise<void> {
  if (!isSupabaseConfigured) return;

  // 1. Check if the image being deleted is the hero
  const { data: currentImage } = await supabase
    .from('product_images')
    .select('is_hero')
    .eq('id', imageId)
    .single();

  const wasHero = currentImage?.is_hero || false;

  // 2. Remove row from database
  const { error: dbError } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId);

  if (dbError) {
    throw new Error(`Failed to delete image: ${dbError.message}`);
  }

  // 3. Remove from storage bucket if storagePath exists
  if (storagePath) {
    await supabase.storage.from('product-images').remove([storagePath]);
  }

  // 4. If it was hero, promote next available image
  if (wasHero) {
    const { data: remainingImages } = await supabase
      .from('product_images')
      .select('id')
      .eq('product_id', productId)
      .order('display_order', { ascending: true })
      .limit(1);

    if (remainingImages && remainingImages.length > 0) {
      await supabase
        .from('product_images')
        .update({ is_hero: true })
        .eq('id', remainingImages[0].id);
    }
  }
}

/**
 * Deletes a product along with all associated storage images and database rows,
 * guaranteeing no orphaned files remain in the storage bucket.
 */
export async function deleteAdminProduct(productId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  // 1. Retrieve all image storage paths for this product
  const { data: images } = await supabase
    .from('product_images')
    .select('storage_path')
    .eq('product_id', productId);

  const paths = (images || [])
    .map((img) => img.storage_path)
    .filter((p): p is string => Boolean(p));

  // 2. Remove files from Supabase Storage
  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from('product-images')
      .remove(paths);
    if (storageError) {
      console.warn('Storage files cleanup warning:', storageError.message);
    }
  }

  // 3. Delete product images rows
  await supabase.from('product_images').delete().eq('product_id', productId);

  // 4. Delete the product record
  const { error: productDeleteError } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (productDeleteError) {
    throw new Error(`Failed to delete product: ${productDeleteError.message}`);
  }
}


