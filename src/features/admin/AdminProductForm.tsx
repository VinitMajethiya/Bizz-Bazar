import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ExternalLink, Plus, X } from 'lucide-react';
import {
  productFormSchema,
  formInputToDbPayload,
  generateSlug,
  productCategories,
  badgeOptions,
  type ProductFormInput,
} from '../../lib/validation/productSchema';
import {
  useAdminProduct,
  useAdminProductMutations,
} from '../../lib/hooks/useAdmin';
import { MediaPanel } from './MediaPanel';
import { checkSlugUnique } from '../../lib/api/adminProducts';

interface SpecRow {
  key: string;
  value: string;
}

export const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();

  const { data: existingProduct, isLoading: isFetching } = useAdminProduct(id);
  const { createProduct, updateProduct, archiveProduct, isCreating, isUpdating, isArchiving } =
    useAdminProductMutations();

  const [categoriesList, setCategoriesList] = useState<string[]>([...productCategories]);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newMaterialInput, setNewMaterialInput] = useState('');
  const [newSizeInput, setNewSizeInput] = useState('');
  const [archiveTarget, setArchiveTarget] = useState<boolean>(false);
  const [saveAndAddAnother, setSaveAndAddAnother] = useState(false);
  const [slugWarningPendingData, setSlugWarningPendingData] = useState<ProductFormInput | null>(null);

  // Specifications key-value state for the dynamic table
  const [specsRows, setSpecsRows] = useState<SpecRow[]>([
    { key: 'Material', value: '18k Gold Vermeil over 925 Sterling Silver' },
    { key: 'Plating', value: 'Anti-tarnish protective coating' },
    { key: 'Weight', value: '3.2g' },
  ]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      category: 'Earrings',
      description: '',
      priceRupees: '',
      compareAtPriceRupees: '',
      stockStatus: 'in_stock',
      stockQty: '',
      badge: '',
      materials: ['Gold', 'Silver'],
      sizes: [],
      specs: {},
      isFeatured: false,
      isArchived: false,
    },
  });

  const watchedName = watch('name');
  const watchedMaterials = watch('materials') || [];
  const watchedSizes = watch('sizes') || [];
  const watchedDescription = watch('description') || '';
  const watchedStockQty = watch('stockQty');

  // Auto-generate slug when name changes (only if slug was clean/untouched or new)
  useEffect(() => {
    if (isNew && watchedName) {
      const generated = generateSlug(watchedName);
      setValue('slug', generated, { shouldValidate: true, shouldDirty: true });
    }
  }, [isNew, watchedName, setValue]);

  // When stockQty is entered as 0, auto-switch stockStatus to sold_out
  useEffect(() => {
    if (watchedStockQty === 0 || watchedStockQty === '0') {
      setValue('stockStatus', 'sold_out');
    }
  }, [watchedStockQty, setValue]);

  // Populate existing product on load
  useEffect(() => {
    if (existingProduct) {
      if (existingProduct.category) {
        setCategoriesList((prev) =>
          prev.includes(existingProduct.category) ? prev : [...prev, existingProduct.category]
        );
      }

      // Convert specs object to rows
      const specEntries = Object.entries(existingProduct.specs || {});
      if (specEntries.length > 0) {
        setSpecsRows(specEntries.map(([key, value]) => ({ key, value })));
      }

      reset({
        name: existingProduct.name,
        slug: existingProduct.slug,
        category: existingProduct.category,
        description: existingProduct.description || '',
        priceRupees: existingProduct.pricePaise / 100,
        compareAtPriceRupees: existingProduct.compareAtPricePaise
          ? existingProduct.compareAtPricePaise / 100
          : '',
        stockStatus: existingProduct.stockStatus,
        stockQty: existingProduct.stockQty !== null ? existingProduct.stockQty : '',
        badge: existingProduct.badge || '',
        materials: existingProduct.options?.materials || [],
        sizes: existingProduct.options?.sizes || [],
        specs: existingProduct.specs || {},
        isFeatured: existingProduct.isFeatured,
        isArchived: existingProduct.isArchived,
      });
    }
  }, [existingProduct, reset]);

  // Warn on leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (!categoriesList.includes(trimmed)) {
      setCategoriesList((prev) => [...prev, trimmed]);
    }
    setValue('category', trimmed, { shouldDirty: true });
    setNewCategoryInput('');
    setShowNewCategory(false);
  };

  const handleAddMaterial = () => {
    const trimmed = newMaterialInput.trim();
    if (!trimmed || watchedMaterials.includes(trimmed)) return;
    setValue('materials', [...watchedMaterials, trimmed], { shouldDirty: true });
    setNewMaterialInput('');
  };

  const handleRemoveMaterial = (item: string) => {
    setValue(
      'materials',
      watchedMaterials.filter((m) => m !== item),
      { shouldDirty: true }
    );
  };

  const handleAddSize = () => {
    const trimmed = newSizeInput.trim();
    if (!trimmed || watchedSizes.includes(trimmed)) return;
    setValue('sizes', [...watchedSizes, trimmed], { shouldDirty: true });
    setNewSizeInput('');
  };

  const handleRemoveSize = (item: string) => {
    setValue(
      'sizes',
      watchedSizes.filter((s) => s !== item),
      { shouldDirty: true }
    );
  };

  const handleAddSpecRow = () => {
    setSpecsRows((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveSpecRow = (index: number) => {
    setSpecsRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', text: string) => {
    setSpecsRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: text };
      return updated;
    });
  };

  const executeSave = async (data: ProductFormInput) => {
    // Convert specsRows to object
    const specsObj: Record<string, string> = {};
    specsRows.forEach((row) => {
      const k = row.key.trim();
      const v = row.value.trim();
      if (k) specsObj[k] = v;
    });
    data.specs = specsObj;

    const dbPayload = formInputToDbPayload(data);

    try {
      if (isNew) {
        const created = await createProduct(dbPayload);
        if (saveAndAddAnother) {
          reset();
          navigate('/admin/products/new', { replace: true });
        } else {
          // Open product form with saved product to allow immediate media upload
          navigate(`/admin/products/${created.id}`, { replace: true });
        }
      } else if (id) {
        await updateProduct({ id, payload: dbPayload });
        if (saveAndAddAnother) {
          navigate('/admin/products/new');
        }
      }
    } catch {
      // Inputs remain untouched on error
    }
  };

  const onSubmit = async (data: ProductFormInput) => {
    // Unique check on slug before submitting
    const isUnique = await checkSlugUnique(data.slug, isNew ? undefined : id);
    if (!isUnique) {
      setError('slug', { message: 'This slug is already used by another piece' });
      return;
    }

    // Check if slug changed on an existing product
    if (!isNew && existingProduct && data.slug !== existingProduct.slug) {
      setSlugWarningPendingData(data);
      return;
    }

    await executeSave(data);
  };

  const handleArchiveProduct = async () => {
    if (!id || !existingProduct) return;
    try {
      await archiveProduct({ id, isArchived: !existingProduct.isArchived });
      setArchiveTarget(false);
      navigate('/admin/products');
    } catch {
      // Toast handles error
    }
  };

  if (!isNew && isFetching) {
    return (
      <div className="p-12 text-center text-xs text-muted font-light">
        Loading product specifications...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 border border-line text-muted hover:text-ink transition-colors"
            aria-label="Back to products list"
          >
            <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
          </Link>
          <div>
            <h1 className="text-xl font-normal text-ink">
              {isNew ? 'Add Product' : `Edit: ${existingProduct?.name || 'Product'}`}
            </h1>
            <p className="text-xs text-muted font-light mt-0.5">
              {isNew ? 'Create a new piece in the catalogue' : `ID: ${id}`}
            </p>
          </div>
        </div>

        {!isNew && existingProduct && !existingProduct.isArchived && (
          <a
            href={`/product/${existingProduct.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line text-xs text-ink hover:border-ink transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="hidden sm:inline">View on site</span>
          </a>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Core details section */}
        <div className="bg-surface border border-line p-5 sm:p-6 space-y-4">
          <h2 className="text-xs font-medium text-ink uppercase tracking-wider">
            Essential Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="prod-name" className="block text-xs font-normal text-ink mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                id="prod-name"
                type="text"
                {...register('name')}
                placeholder="e.g. Lilac Twist Hoops"
                className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light"
              />
              {errors.name && (
                <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="prod-slug" className="block text-xs font-normal text-ink mb-1">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="bg-bg border border-r-0 border-line px-2.5 py-2 text-xs text-muted font-mono select-none">
                  /product/
                </span>
                <input
                  id="prod-slug"
                  type="text"
                  {...register('slug')}
                  placeholder="lilac-twist-hoops"
                  className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink font-mono focus:outline-none focus:border-ink font-light"
                />
              </div>
              {errors.slug && (
                <p className="text-[11px] text-red-500 mt-1">{errors.slug.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="prod-category" className="text-xs font-normal text-ink">
                  Category <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                  className="text-[11px] text-accent hover:underline"
                >
                  {showNewCategory ? 'Cancel' : '+ Add custom'}
                </button>
              </div>

              {showNewCategory ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    placeholder="New category..."
                    className="w-full bg-bg border border-line px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-ink"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3 py-1.5 bg-ink text-bg text-xs hover:bg-accent"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <select
                  id="prod-category"
                  {...register('category')}
                  className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
              {errors.category && (
                <p className="text-[11px] text-red-500 mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="prod-badge" className="block text-xs font-normal text-ink mb-1">
                Badge
              </label>
              <select
                id="prod-badge"
                {...register('badge')}
                className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light"
              >
                {badgeOptions.map((b) => (
                  <option key={b} value={b}>
                    {b === '' ? 'None' : b}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="prod-desc" className="text-xs font-normal text-ink">
                  Description
                </label>
                <span className="text-[10px] text-muted font-mono">
                  {watchedDescription.length} / 600
                </span>
              </div>
              <textarea
                id="prod-desc"
                rows={4}
                maxLength={600}
                {...register('description')}
                placeholder="Everyday elegance jewellery description..."
                className="w-full bg-bg border border-line p-3 text-xs text-ink font-light focus:outline-none focus:border-ink"
              />
              {errors.description && (
                <p className="text-[11px] text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Pricing and Stock */}
        <div className="bg-surface border border-line p-5 sm:p-6 space-y-4">
          <h2 className="text-xs font-medium text-ink uppercase tracking-wider">
            Pricing &amp; Inventory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prod-price" className="block text-xs font-normal text-ink mb-1">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs text-muted font-light">₹</span>
                <input
                  id="prod-price"
                  type="number"
                  step="any"
                  min="0"
                  {...register('priceRupees')}
                  placeholder="499"
                  className="w-full bg-bg border border-line pl-7 pr-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light"
                />
              </div>
              {errors.priceRupees && (
                <p className="text-[11px] text-red-500 mt-1">{errors.priceRupees.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="prod-compare-at" className="block text-xs font-normal text-ink mb-1">
                Compare-at Price (₹) <span className="text-muted font-light">(optional)</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs text-muted font-light">₹</span>
                <input
                  id="prod-compare-at"
                  type="number"
                  step="any"
                  min="0"
                  {...register('compareAtPriceRupees')}
                  placeholder="699"
                  className="w-full bg-bg border border-line pl-7 pr-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light"
                />
              </div>
              {errors.compareAtPriceRupees && (
                <p className="text-[11px] text-red-500 mt-1">
                  {errors.compareAtPriceRupees.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="prod-stock-status" className="block text-xs font-normal text-ink mb-1">
                Stock Status
              </label>
              <select
                id="prod-stock-status"
                {...register('stockStatus')}
                className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light"
              >
                <option value="in_stock">In stock</option>
                <option value="low_stock">Low stock</option>
                <option value="sold_out">Sold out</option>
              </select>
            </div>

            <div>
              <label htmlFor="prod-stock-qty" className="block text-xs font-normal text-ink mb-1">
                Stock Quantity <span className="text-muted font-light">(0 forces Sold out)</span>
              </label>
              <input
                id="prod-stock-qty"
                type="number"
                min="0"
                step="1"
                {...register('stockQty')}
                placeholder="Leave blank for uncounted"
                className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink font-light"
              />
              {errors.stockQty && (
                <p className="text-[11px] text-red-500 mt-1">{errors.stockQty.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Options (Materials & Sizes chips) */}
        <div className="bg-surface border border-line p-5 sm:p-6 space-y-4">
          <h2 className="text-xs font-medium text-ink uppercase tracking-wider">
            Variants &amp; Options
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-normal text-ink mb-1.5">
                Available Materials
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {watchedMaterials.map((mat) => (
                  <span
                    key={mat}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-bg border border-line text-ink"
                  >
                    <span>{mat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterial(mat)}
                      className="text-muted hover:text-ink"
                      aria-label={`Remove material ${mat}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 max-w-xs">
                <input
                  type="text"
                  value={newMaterialInput}
                  onChange={(e) => setNewMaterialInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMaterial();
                    }
                  }}
                  placeholder="Add material (e.g. Rose Gold)..."
                  className="w-full bg-bg border border-line px-2.5 py-1 text-xs text-ink focus:outline-none focus:border-ink"
                />
                <button
                  type="button"
                  onClick={handleAddMaterial}
                  className="px-3 py-1 bg-ink text-bg text-xs hover:bg-accent"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-normal text-ink mb-1.5">
                Sizes <span className="text-muted font-light">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {watchedSizes.map((sz) => (
                  <span
                    key={sz}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-bg border border-line text-ink"
                  >
                    <span>{sz}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(sz)}
                      className="text-muted hover:text-ink"
                      aria-label={`Remove size ${sz}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 max-w-xs">
                <input
                  type="text"
                  value={newSizeInput}
                  onChange={(e) => setNewSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSize();
                    }
                  }}
                  placeholder="Add size (e.g. Size 6, 16-inch)..."
                  className="w-full bg-bg border border-line px-2.5 py-1 text-xs text-ink focus:outline-none focus:border-ink"
                />
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="px-3 py-1 bg-ink text-bg text-xs hover:bg-accent"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Key-Value rows */}
        <div className="bg-surface border border-line p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium text-ink uppercase tracking-wider">
              Product Specifications
            </h2>
            <button
              type="button"
              onClick={handleAddSpecRow}
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Add specification</span>
            </button>
          </div>

          <div className="space-y-2">
            {specsRows.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={row.key}
                  onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                  placeholder="Key (e.g. Plating)"
                  className="w-1/3 bg-bg border border-line px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-ink font-light"
                />
                <input
                  type="text"
                  value={row.value}
                  onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                  placeholder="Value (e.g. Anti-tarnish)"
                  className="flex-1 bg-bg border border-line px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-ink font-light"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSpecRow(idx)}
                  className="p-1.5 text-muted hover:text-red-500"
                  aria-label="Remove specification row"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Photography / Media Panel */}
        <div className="bg-surface border border-line p-5 sm:p-6">
          <MediaPanel
            productId={id || 'new'}
            images={existingProduct?.images || []}
            materials={watchedMaterials}
            isNew={isNew}
          />
        </div>

        {/* Visibility Toggles */}
        <div className="bg-surface border border-line p-5 sm:p-6 space-y-4">
          <h2 className="text-xs font-medium text-ink uppercase tracking-wider">
            Visibility &amp; Status
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('isFeatured')}
                className="w-4 h-4 rounded-none text-ink focus:ring-accent"
              />
              <div>
                <span className="text-xs font-normal text-ink block">Feature on homepage</span>
                <span className="text-[11px] text-muted font-light block">
                  Highlighted in the bestsellers and curated homepage showcase.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('isArchived')}
                className="w-4 h-4 rounded-none text-ink focus:ring-accent"
              />
              <div>
                <span className="text-xs font-normal text-ink block">Archive product</span>
                <span className="text-[11px] text-muted font-light block">
                  Hidden from the store catalogue. Historic enquiries and orders are preserved.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {!isNew && existingProduct ? (
            <button
              type="button"
              onClick={() => setArchiveTarget(true)}
              className="px-4 py-2 border border-red-500/40 text-red-600 dark:text-red-400 text-xs hover:bg-red-500/10 transition-colors"
            >
              {existingProduct.isArchived ? 'Unarchive Product' : 'Archive Product'}
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link
              to="/admin/products"
              className="px-4 py-2 border border-line text-xs text-ink hover:bg-surface transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || isCreating || isUpdating}
              onClick={() => setSaveAndAddAnother(true)}
              className="px-4 py-2 border border-ink text-xs text-ink hover:bg-bg transition-colors disabled:opacity-50"
            >
              Save and add another
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isCreating || isUpdating}
              onClick={() => setSaveAndAddAnother(false)}
              className="px-5 py-2 bg-ink text-bg text-xs font-normal hover:bg-accent transition-colors disabled:opacity-50"
            >
              {isSubmitting || isCreating || isUpdating ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </div>
      </form>

      {/* Archive Confirmation Dialog */}
      {archiveTarget && existingProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="form-archive-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-sm bg-bg border border-line p-6 space-y-4 rounded-none">
            <h2 id="form-archive-title" className="text-base font-normal text-ink">
              {existingProduct.isArchived ? 'Unarchive' : 'Archive'} &quot;{existingProduct.name}&quot;?
            </h2>
            <p className="text-xs text-muted font-light leading-relaxed">
              Are you sure you want to {existingProduct.isArchived ? 'restore' : 'archive'} this piece?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setArchiveTarget(false)}
                className="px-3.5 py-2 border border-line text-xs text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isArchiving}
                onClick={handleArchiveProduct}
                className="px-4 py-2 bg-ink text-bg text-xs font-normal hover:bg-accent disabled:opacity-50"
              >
                {isArchiving ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slug Change Warning Dialog */}
      {slugWarningPendingData && existingProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="slug-warning-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-sm bg-bg border border-line p-6 space-y-4 rounded-none">
            <h2 id="slug-warning-title" className="text-base font-normal text-ink">
              Changing the slug breaks existing links to this product
            </h2>
            <p className="text-xs text-muted font-light leading-relaxed">
              You are changing the URL slug from{' '}
              <span className="font-mono text-ink">/{existingProduct.slug}</span> to{' '}
              <span className="font-mono text-ink">/{slugWarningPendingData.slug}</span>. Any external links, bookmarks, or previous order messages using the old URL will no longer reach this page.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSlugWarningPendingData(null)}
                className="px-3.5 py-2 border border-line text-xs text-ink hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const pending = slugWarningPendingData;
                  setSlugWarningPendingData(null);
                  executeSave(pending);
                }}
                className="px-4 py-2 bg-ink text-bg text-xs font-normal hover:bg-accent transition-colors"
              >
                Confirm slug change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductForm;
