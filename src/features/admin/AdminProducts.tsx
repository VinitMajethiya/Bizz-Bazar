import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';

export const AdminProducts: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-light text-ink">Products</h1>
          <p className="text-xs text-muted mt-1">Manage catalogue pieces, photos, and stock</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink text-bg text-xs uppercase tracking-wider font-medium rounded-ui hover:bg-accent transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 p-3 bg-surface border border-line rounded-ui text-xs">
        <Search className="w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search products by name..."
          className="bg-transparent border-none w-full text-ink focus:outline-none text-xs"
        />
      </div>

      {/* Products Table / List */}
      <div className="border border-line rounded-ui bg-surface divide-y divide-line overflow-hidden">
        {[
          { id: '1', name: 'Lilac Twist Hoops', category: 'Earrings', price: '₹499', stock: 'In stock', badge: 'New Drop' },
          { id: '2', name: 'Ruby Claw Studs', category: 'Earrings', price: '₹649', stock: 'In stock', badge: 'Bestseller' },
          { id: '3', name: 'Seashell Cuff', category: 'Bracelets', price: '₹899', stock: 'In stock', badge: 'Limited Edition' },
          { id: '4', name: 'Golden Blossom Studs', category: 'Earrings', price: '₹749', stock: 'Low stock', badge: 'Low Stock' },
          { id: '15', name: 'Crystal Square Drops', category: 'Earrings', price: '₹549', stock: 'Sold out', badge: 'Sold Out' },
        ].map((prod) => (
          <div key={prod.id} className="p-3.5 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-bg border border-line rounded-ui flex items-center justify-center text-[10px] text-muted flex-shrink-0">
                Img
              </div>
              <div className="min-w-0">
                <Link
                  to={`/admin/products/${prod.id}`}
                  className="font-medium text-ink hover:text-accent truncate block"
                >
                  {prod.name}
                </Link>
                <p className="text-[11px] text-muted">{prod.category} &bull; {prod.stock}</p>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="font-medium text-ink block">{prod.price}</span>
              <Link
                to={`/admin/products/${prod.id}`}
                className="text-[11px] text-accent hover:underline"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;

