import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/products"
          className="p-2 border border-line rounded-ui text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-light text-ink">
            {isNew ? 'New Product' : `Edit Product #${id}`}
          </h1>
          <p className="text-xs text-muted">Enter product specifications and photos</p>
        </div>
      </div>

      <form className="space-y-6 bg-surface border border-line p-6 rounded-ui">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-ink mb-1">Product Name</label>
            <input
              type="text"
              placeholder="e.g. Lilac Twist Hoops"
              className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1">Category</label>
            <select className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent">
              <option value="Earrings">Earrings</option>
              <option value="Bracelets">Bracelets</option>
              <option value="Necklaces">Necklaces</option>
              <option value="Rings">Rings</option>
              <option value="Gift Sets">Gift Sets</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1">Price (₹)</label>
            <input
              type="number"
              placeholder="499"
              className="w-full bg-bg border border-line rounded-ui px-3 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        {/* Media Placeholder */}
        <div className="border-t border-line pt-4 space-y-2">
          <h3 className="text-xs font-medium text-ink">Product Photos</h3>
          <div className="border-2 border-dashed border-line p-6 text-center rounded-ui bg-bg">
            <p className="text-xs text-muted">Upload and image resizing pipeline (Phase 4)</p>
          </div>
        </div>

        <div className="pt-4 border-t border-line flex items-center justify-end gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2 border border-line rounded-ui text-xs text-ink hover:bg-bg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            className="px-5 py-2 bg-ink text-bg text-xs uppercase tracking-wider font-medium rounded-ui hover:bg-accent transition-colors"
          >
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
