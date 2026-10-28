import React, { useRef, useState } from 'react';
import {
  Upload,
  Star,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
  AlertCircle,
} from 'lucide-react';
import type { ProductImage } from '../../lib/types';
import { useAdminProductMutations } from '../../lib/hooks/useAdmin';

interface MediaPanelProps {
  productId: string;
  images: ProductImage[];
  materials: string[];
  isNew?: boolean;
}

export const MediaPanel: React.FC<MediaPanelProps> = ({
  productId,
  images,
  materials,
  isNew,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductImage | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    uploadImage,
    updateImage,
    reorderImages,
    deleteImage,
    isDeletingImage,
  } = useAdminProductMutations();

  if (isNew) {
    return (
      <div className="border border-line bg-surface p-6 rounded-none space-y-2 text-center">
        <h3 className="text-xs font-normal text-ink">Product Photos</h3>
        <p className="text-xs text-muted font-light max-w-sm mx-auto">
          Save this product first to upload and manage its photographs.
        </p>
      </div>
    );
  }

  // Sort images by hero first, then displayOrder
  const sortedImages = [...images].sort((a, b) => {
    if (a.isHero !== b.isHero) return a.isHero ? -1 : 1;
    return a.displayOrder - b.displayOrder;
  });

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const fileList = Array.from(files);
      for (const file of fileList) {
        // Automatically make hero if no images exist yet
        const isFirst = images.length === 0;
        await uploadImage({
          productId,
          file,
          options: {
            isHero: isFirst,
            alt: '',
          },
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Photo upload failed';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetHero = async (img: ProductImage) => {
    if (img.isHero) return;
    try {
      await updateImage({
        productId,
        imageId: img.id,
        updates: { isHero: true },
      });
    } catch {
      // Toast handles error
    }
  };

  const handleAltChange = async (img: ProductImage, newAlt: string) => {
    if (img.alt === newAlt) return;
    try {
      await updateImage({
        productId,
        imageId: img.id,
        updates: { alt: newAlt },
      });
    } catch {
      // Toast handles error
    }
  };

  const handleMaterialChange = async (img: ProductImage, newMaterial: string) => {
    const variantKey = newMaterial === '' ? null : newMaterial;
    if (img.variantKey === variantKey) return;
    try {
      await updateImage({
        productId,
        imageId: img.id,
        updates: { variantKey },
      });
    } catch {
      // Toast handles error
    }
  };

  const handleMove = async (currentIndex: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sortedImages.length) return;

    const newOrder = [...sortedImages];
    const [moved] = newOrder.splice(currentIndex, 1);
    newOrder.splice(newIndex, 0, moved);

    const ids = newOrder.map((item) => item.id);
    try {
      await reorderImages({
        productId,
        imageIdsInOrder: ids,
      });
    } catch {
      // Toast handles error
    }
  };

  const handleDrop = async (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newOrder = [...sortedImages];
    const [moved] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, moved);

    setDraggedIndex(null);
    const ids = newOrder.map((item) => item.id);
    try {
      await reorderImages({
        productId,
        imageIdsInOrder: ids,
      });
    } catch {
      // Toast handles error
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteImage({
        productId,
        imageId: deleteTarget.id,
        storagePath: deleteTarget.storagePath,
      });
      setDeleteTarget(null);
    } catch {
      // Toast handles error
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-normal text-ink">Product Photography</h3>
          <p className="text-[11px] text-muted font-light">
            Upload images. Automatically resized to 1600px WebP in browser.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-ink text-xs text-ink hover:bg-ink hover:text-bg transition-colors disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>{isUploading ? 'Resizing & Uploading...' : 'Upload Photos'}</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/avif"
        onChange={handleFilesSelected}
        className="hidden"
      />

      {uploadError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {sortedImages.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-line p-8 text-center cursor-pointer hover:border-ink transition-colors bg-bg"
        >
          <Upload className="w-6 h-6 text-muted mx-auto mb-2 stroke-[1.5]" />
          <p className="text-xs text-ink font-normal">Click to upload photos</p>
          <p className="text-[11px] text-muted font-light mt-0.5">
            PNG, JPEG or WebP up to 10MB. 1600px WebP conversion runs client-side.
          </p>
        </div>
      ) : (
        <div className="border border-line bg-surface divide-y divide-line overflow-hidden">
          {sortedImages.map((img, idx) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => setDraggedIndex(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(idx)}
              className="p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-surface hover:bg-bg/50 transition-colors"
            >
              {/* Drag Handle & Thumbnail */}
              <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                <div
                  className="hidden sm:block text-muted hover:text-ink cursor-grab active:cursor-grabbing p-1"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4 stroke-[1.5]" />
                </div>

                <div className="relative w-14 h-14 bg-bg border border-line flex-shrink-0 overflow-hidden">
                  <img
                    src={img.imageUrl}
                    alt={img.alt || 'Product thumbnail'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width={56}
                    height={56}
                  />
                  {img.isHero && (
                    <span className="absolute bottom-0 inset-x-0 bg-ink/90 text-bg text-[9px] text-center font-mono py-0.5 uppercase tracking-wider">
                      Hero
                    </span>
                  )}
                </div>

                {/* Alt & Material inputs */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <input
                    type="text"
                    defaultValue={img.alt || ''}
                    placeholder="Image description (alt text)..."
                    onBlur={(e) => handleAltChange(img, e.target.value.trim())}
                    className="w-full bg-bg border border-line px-2.5 py-1 text-xs text-ink focus:outline-none focus:border-ink font-light placeholder:text-muted"
                  />

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted font-light flex-shrink-0">
                      Show for material:
                    </span>
                    <select
                      value={img.variantKey || ''}
                      onChange={(e) => handleMaterialChange(img, e.target.value)}
                      className="bg-bg border border-line px-2 py-0.5 text-[11px] text-ink focus:outline-none focus:border-ink font-light flex-1 max-w-xs"
                    >
                      <option value="">All materials</option>
                      {materials.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions: Hero, Reorder, Delete */}
              <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-line">
                <button
                  type="button"
                  onClick={() => handleSetHero(img)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] border transition-colors ${
                    img.isHero
                      ? 'bg-ink text-bg border-ink'
                      : 'border-line text-muted hover:text-ink hover:border-ink'
                  }`}
                  title="Make this the cover photograph"
                >
                  <Star className={`w-3 h-3 stroke-[1.5] ${img.isHero ? 'fill-bg' : ''}`} />
                  <span>{img.isHero ? 'Cover Photo' : 'Set as Hero'}</span>
                </button>

                {/* Mobile Up / Down Steppers */}
                <div className="flex items-center gap-1 sm:hidden">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1 border border-line text-muted hover:text-ink disabled:opacity-30"
                    aria-label="Move photo up"
                  >
                    <ArrowUp className="w-3.5 h-3.5 stroke-[1.5]" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sortedImages.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1 border border-line text-muted hover:text-ink disabled:opacity-30"
                    aria-label="Move photo down"
                  >
                    <ArrowDown className="w-3.5 h-3.5 stroke-[1.5]" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(img)}
                  className="p-1.5 border border-line text-muted hover:text-red-500 hover:border-red-500/40 transition-colors"
                  aria-label="Delete photo"
                  title="Delete photo"
                >
                  <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-photo-dialog-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-sm bg-bg border border-line p-6 space-y-4 rounded-none">
            <h2 id="delete-photo-dialog-title" className="text-base font-normal text-ink">
              Delete Product Photo?
            </h2>
            <p className="text-xs text-muted font-light leading-relaxed">
              Are you sure you want to remove this photo? Both the storage image file and the
              catalogue entry will be deleted.
              {deleteTarget.isHero &&
                ' Since this was the hero cover photo, the next photo will be automatically promoted as hero.'}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-2 border border-line text-xs text-ink hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingImage}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white text-xs font-normal hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeletingImage ? 'Deleting...' : 'Delete Photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaPanel;
