import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminProducts,
  fetchAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  archiveAdminProduct,
  uploadProductImage,
  updateProductImage,
  reorderProductImages,
  deleteProductImage,
  type AdminProductFilters,
} from '../api/adminProducts';
import { fetchAdminOverviewStats } from '../api/adminOverview';
import type { ProductDbPayload } from '../validation/productSchema';
import { useToastStore } from '@/components/ui/toastStore';

export function useAdminProducts(filters?: AdminProductFilters) {
  return useQuery({
    queryKey: ['admin', 'products', filters],
    queryFn: () => fetchAdminProducts(filters),
    staleTime: 30 * 1000,
  });
}

export function useAdminProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: () => {
      if (!id || id === 'new') return Promise.resolve(null);
      return fetchAdminProductById(id);
    },
    enabled: Boolean(id && id !== 'new'),
    staleTime: 30 * 1000,
  });
}

export function useAdminOverview() {
  return useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: fetchAdminOverviewStats,
    staleTime: 30 * 1000,
  });
}

export function useAdminProductMutations() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  const createMutation = useMutation({
    mutationFn: (payload: ProductDbPayload) => createAdminProduct(payload),
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showToast(`Product "${newProduct.name}" created successfully`, 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to create product', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ProductDbPayload> }) =>
      updateAdminProduct(id, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', updated.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', updated.slug] });
      showToast(`Product "${updated.name}" updated`, 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to update product', 'error');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: ({ id, isArchived }: { id: string; isArchived: boolean }) =>
      archiveAdminProduct(id, isArchived),
    onSuccess: (_, { isArchived }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showToast(isArchived ? 'Product archived' : 'Product unarchived', 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to change archive status', 'error');
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: ({
      productId,
      file,
      options,
    }: {
      productId: string;
      file: File;
      options?: { alt?: string; isHero?: boolean; variantKey?: string };
    }) => uploadProductImage(productId, file, options),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', productId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showToast('Image uploaded successfully', 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to upload photo', 'error');
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: ({
      productId,
      imageId,
      updates,
    }: {
      productId: string;
      imageId: string;
      updates: { alt?: string | null; isHero?: boolean; variantKey?: string | null };
    }) => updateProductImage(productId, imageId, updates),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', productId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to update image', 'error');
    },
  });

  const reorderImagesMutation = useMutation({
    mutationFn: ({
      productId,
      imageIdsInOrder,
    }: {
      productId: string;
      imageIdsInOrder: string[];
    }) => reorderProductImages(productId, imageIdsInOrder),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to reorder images', 'error');
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: ({
      productId,
      imageId,
      storagePath,
    }: {
      productId: string;
      imageId: string;
      storagePath?: string | null;
    }) => deleteProductImage(productId, imageId, storagePath),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', productId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showToast('Image deleted', 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to delete image', 'error');
    },
  });

  return {
    createProduct: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateProduct: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    archiveProduct: archiveMutation.mutateAsync,
    isArchiving: archiveMutation.isPending,
    uploadImage: uploadImageMutation.mutateAsync,
    isUploadingImage: uploadImageMutation.isPending,
    updateImage: updateImageMutation.mutateAsync,
    isUpdatingImage: updateImageMutation.isPending,
    reorderImages: reorderImagesMutation.mutateAsync,
    isReorderingImages: reorderImagesMutation.isPending,
    deleteImage: deleteImageMutation.mutateAsync,
    isDeletingImage: deleteImageMutation.isPending,
  };
}
