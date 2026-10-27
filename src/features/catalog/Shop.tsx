import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../../lib/hooks/useCatalog';
import { ProductCard } from '../../components/ui/ProductCard';
import { ProductGridSkeleton } from '../../components/ui/Skeleton';

const CATEGORIES = ['All', 'Earrings', 'Bracelets', 'Necklaces', 'Rings', 'Gift Sets'];

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'All';
  const currentSort = searchParams.get('sort') || 'featured';

  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useProducts(currentCategory, currentSort);

  const handleCategoryChange = (cat: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', cat);
    }
    setSearchParams(nextParams);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextParams = new URLSearchParams(searchParams);
    const val = e.target.value;
    if (val === 'featured') {
      nextParams.delete('sort');
    } else {
      nextParams.set('sort', val);
    }
    setSearchParams(nextParams);
  };

  return (
    <div className="max-w-site mx-auto px-5 md:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-light text-ink">Catalogue</h1>
        <p className="text-xs text-muted mt-1 font-light">
          Effortless jewellery crafted for everyday elegance
        </p>
      </div>

      {/* Controls row: Category Tabs on left, Sort on right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4 mb-8">
        {/* Category Tabs */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none"
          role="tablist"
          aria-label="Filter products by category"
        >
          {CATEGORIES.map((cat) => {
            const isActive = currentCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleCategoryChange(cat)}
                className={`min-h-[38px] px-3.5 py-1.5 text-xs whitespace-nowrap rounded-ui transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
                  isActive
                    ? 'bg-ink text-bg font-medium'
                    : 'bg-surface text-ink hover:bg-line/70 font-light'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <label htmlFor="shop-sort" className="text-muted font-light whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="shop-sort"
            value={currentSort}
            onChange={handleSortChange}
            aria-label="Sort products"
            className="bg-surface border border-line text-ink rounded-ui px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest Drop</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="py-16 text-center space-y-3">
          <p className="text-xs text-danger">We couldn’t load the catalogue. Check your connection.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 border border-line text-xs font-normal rounded-ui hover:border-ink transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && <ProductGridSkeleton count={8} />}

      {/* Empty State */}
      {!isLoading && !isError && products?.length === 0 && (
        <div className="py-20 text-center space-y-3 border border-line/40 bg-surface/50 p-8">
          <p className="text-xs sm:text-sm text-ink font-light">
            No pieces in this category yet.
          </p>
          <button
            type="button"
            onClick={() => handleCategoryChange('All')}
            className="text-xs text-accent underline underline-offset-4 font-normal"
          >
            View all jewellery
          </button>
        </div>
      )}

      {/* Product Grid: 2 cols on mobile, 4 on desktop, 22px row gap, 16px col gap */}
      {!isLoading && !isError && products && products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-[22px]">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
