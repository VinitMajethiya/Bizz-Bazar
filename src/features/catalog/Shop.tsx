import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const CATEGORIES = ['All', 'Earrings', 'Bracelets', 'Necklaces', 'Rings', 'Gift Sets'];

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'All';
  const currentSort = searchParams.get('sort') || 'featured';

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
    nextParams.set('sort', e.target.value);
    setSearchParams(nextParams);
  };

  return (
    <div className="max-w-site mx-auto px-5 md:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-ink">Catalogue</h1>
        <p className="text-xs text-muted mt-1">Explore effortless jewellery for everyday wear</p>
      </div>

      {/* Tabs and Sort controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-4 mb-8">
        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`min-h-[36px] px-3.5 py-1.5 text-xs whitespace-nowrap rounded-ui transition-colors ${
                  isActive
                    ? 'bg-ink text-bg font-medium'
                    : 'bg-surface text-ink hover:bg-line/60'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <label htmlFor="shop-sort" className="text-muted">
            Sort by:
          </label>
          <select
            id="shop-sort"
            value={currentSort}
            onChange={handleSortChange}
            className="bg-surface border border-line text-ink rounded-ui px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest Drop</option>
          </select>
        </div>
      </div>

      {/* Product Grid Placeholder */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { name: 'Lilac Twist Hoops', slug: 'lilac-twist-hoops', price: '₹499', compare: '₹699', badge: 'New Drop' },
          { name: 'Ruby Claw Studs', slug: 'ruby-claw-studs', price: '₹649', compare: null, badge: 'Bestseller' },
          { name: 'Seashell Cuff', slug: 'seashell-cuff', price: '₹899', compare: '₹1,199', badge: 'Limited Edition' },
          { name: 'Golden Blossom Studs', slug: 'golden-blossom-studs', price: '₹749', compare: null, badge: 'Low Stock' },
          { name: 'Turquoise Daisy Necklace', slug: 'turquoise-daisy-necklace', price: '₹999', compare: null, badge: 'Bestseller' },
          { name: 'Stacked Chain Set', slug: 'stacked-chain-set', price: '₹1,199', compare: '₹1,499', badge: 'Sale' },
          { name: 'Ocean Shell Pendant', slug: 'ocean-shell-pendant', price: '₹849', compare: null, badge: 'New Drop' },
          { name: 'Crystal Square Drops', slug: 'crystal-square-drops', price: '₹549', compare: null, badge: 'Sold Out' },
        ].map((item) => (
          <Link
            key={item.slug}
            to={`/product/${item.slug}`}
            className="group block space-y-2"
          >
            <div className="relative aspect-square bg-surface border border-line flex flex-col items-center justify-center p-4 transition-transform group-hover:scale-[1.01]">
              {item.badge && (
                <span className="absolute top-2 left-2 bg-bg border border-line text-ink px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-medium">
                  {item.badge}
                </span>
              )}
              <span className="text-xs text-muted">Photo placeholder</span>
            </div>
            <div>
              <p className="text-[13px] text-ink font-normal group-hover:text-accent transition-colors">
                {item.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[12px] font-medium text-ink">{item.price}</span>
                {item.compare && (
                  <span className="text-[11px] text-muted line-through">{item.compare}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Shop;

