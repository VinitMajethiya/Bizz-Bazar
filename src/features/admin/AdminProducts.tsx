import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Archive, ExternalLink, RefreshCw } from 'lucide-react';
import { useAdminProducts, useAdminProductMutations } from '../../lib/hooks/useAdmin';
import { formatINR } from '../../lib/money';
import { productCategories } from '../../lib/validation/productSchema';

export const AdminProducts: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [archiveTarget, setArchiveTarget] = useState<{ id: string; name: string; isArchived: boolean } | null>(null);

  const { data: products, isLoading, error, refetch, isRefetching } = useAdminProducts({
    search,
    category,
    status,
  });

  const { archiveProduct, isArchiving } = useAdminProductMutations();

  const handleConfirmArchive = async () => {
    if (!archiveTarget) return;
    try {
      await archiveProduct({ id: archiveTarget.id, isArchived: !archiveTarget.isArchived });
      setArchiveTarget(null);
    } catch {
      // Toast shown by mutation
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-normal text-ink">Products</h1>
          <p className="text-xs text-muted font-light mt-0.5">
            Manage catalogue inventory, pricing, and photography
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="p-2 border border-line text-muted hover:text-ink transition-colors"
            aria-label="Refresh product list"
          >
            <RefreshCw
              className={`w-4 h-4 stroke-[1.5] ${isRefetching ? 'animate-spin' : ''}`}
            />
          </button>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink text-bg text-xs font-normal rounded-ui hover:bg-accent transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[1.5]" />
            <span>Add product</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-surface border border-line">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 pointer-events-none stroke-[1.5]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name..."
            className="w-full bg-bg border border-line pl-9 pr-3 py-1.5 text-xs text-ink placeholder:text-muted focus:outline-none focus:border-ink font-light"
          />
        </div>

        <div>
          <label htmlFor="filter-category" className="sr-only">Category</label>
          <select
            id="filter-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-bg border border-line px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-ink font-light"
          >
            <option value="All">All Categories</option>
            {productCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-status" className="sr-only">Status</label>
          <select
            id="filter-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-bg border border-line px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-ink font-light"
          >
            <option value="All">All Statuses</option>
            <option value="in_stock">In stock</option>
            <option value="low_stock">Low stock</option>
            <option value="sold_out">Sold out</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Loading, Error, Empty & List States */}
      {isLoading ? (
        <div className="border border-line bg-surface p-12 text-center text-xs text-muted font-light">
          Loading products catalogue...
        </div>
      ) : error ? (
        <div className="border border-line bg-surface p-8 text-center space-y-3">
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            Failed to load products
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 border border-line text-xs text-ink hover:bg-bg transition-colors"
          >
            Retry
          </button>
        </div>
      ) : !products || products.length === 0 ? (
        <div className="border border-line bg-surface p-12 text-center space-y-3">
          <p className="text-xs text-ink font-medium">No products found</p>
          <p className="text-[11px] text-muted font-light max-w-sm mx-auto">
            {search || category !== 'All' || status !== 'All'
              ? 'No products matched your active filters. Try adjusting your search query or filters.'
              : 'Your catalogue is empty. Tap "Add product" to create your first jewellery piece.'}
          </p>
        </div>
      ) : (
        <div className="border border-line bg-surface divide-y divide-line overflow-hidden">
          {products.map((prod) => {
            const heroImage = prod.images.find((img) => img.isHero) || prod.images[0];
            return (
              <div
                key={prod.id}
                className="p-3.5 flex items-center justify-between gap-4 text-xs hover:bg-bg/40 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 bg-bg border border-line flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {heroImage ? (
                      <img
                        src={heroImage.imageUrl}
                        alt={heroImage.alt || prod.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        width={48}
                        height={48}
                      />
                    ) : (
                      <span className="text-[10px] text-muted font-serif">
                        {prod.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/products/${prod.id}`}
                        className="font-normal text-ink hover:text-accent truncate block"
                      >
                        {prod.name}
                      </Link>
                      {prod.isArchived && (
                        <span className="px-1.5 py-0.2 text-[9px] font-mono text-muted bg-bg border border-line">
                          Archived
                        </span>
                      )}
                      {prod.badge && (
                        <span className="px-1.5 py-0.2 text-[9px] text-ink border border-line font-light">
                          {prod.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted font-light">
                      {prod.category} &bull;{' '}
                      <span
                        className={
                          prod.stockStatus === 'sold_out'
                            ? 'text-red-500'
                            : prod.stockStatus === 'low_stock'
                            ? 'text-amber-500'
                            : 'text-muted'
                        }
                      >
                        {prod.stockStatus === 'in_stock'
                          ? 'In stock'
                          : prod.stockStatus === 'low_stock'
                          ? 'Low stock'
                          : 'Sold out'}
                      </span>
                      {prod.stockQty !== null ? ` (${prod.stockQty} left)` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 text-right">
                  <div>
                    <span className="font-medium text-ink block">
                      {formatINR(prod.pricePaise)}
                    </span>
                    <span className="text-[10px] text-muted font-mono block">
                      /{prod.slug}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 pl-2">
                    {!prod.isArchived && (
                      <a
                        href={`/product/${prod.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 border border-line text-muted hover:text-ink transition-colors"
                        title="View on live storefront"
                        aria-label={`View ${prod.name} on site`}
                      >
                        <ExternalLink className="w-3.5 h-3.5 stroke-[1.5]" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setArchiveTarget({
                          id: prod.id,
                          name: prod.name,
                          isArchived: prod.isArchived,
                        })
                      }
                      className="p-1.5 border border-line text-muted hover:text-ink transition-colors"
                      title={prod.isArchived ? 'Unarchive product' : 'Archive product'}
                      aria-label={`${prod.isArchived ? 'Unarchive' : 'Archive'} ${prod.name}`}
                    >
                      <Archive className="w-3.5 h-3.5 stroke-[1.5]" />
                    </button>
                    <Link
                      to={`/admin/products/${prod.id}`}
                      className="px-2.5 py-1 bg-surface border border-line text-[11px] text-ink hover:border-ink transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog for Destructive Archive Action */}
      {archiveTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="archive-dialog-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-sm bg-bg border border-line p-6 space-y-4 rounded-none">
            <h2 id="archive-dialog-title" className="text-base font-normal text-ink">
              {archiveTarget.isArchived ? 'Unarchive Product?' : 'Archive Product?'}
            </h2>
            <p className="text-xs text-muted font-light leading-relaxed">
              Are you sure you want to {archiveTarget.isArchived ? 'unarchive' : 'archive'}{' '}
              <strong className="text-ink font-medium">&quot;{archiveTarget.name}&quot;</strong>?
              {!archiveTarget.isArchived &&
                ' Archived products disappear from the public store catalogue but preserve all historic enquiries and orders.'}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setArchiveTarget(null)}
                className="px-3.5 py-2 border border-line text-xs text-ink hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isArchiving}
                onClick={handleConfirmArchive}
                className="px-4 py-2 bg-ink text-bg text-xs font-normal hover:bg-accent transition-colors disabled:opacity-50"
              >
                {isArchiving
                  ? 'Saving...'
                  : archiveTarget.isArchived
                  ? 'Confirm Unarchive'
                  : 'Confirm Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
