import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Star,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Search,
  AlertCircle,
  X,
  RefreshCw,
  Home as HomeIcon,
} from 'lucide-react';
import {
  fetchAdminReviews,
  updateAdminReviewStatus,
  toggleAdminReviewShowOnHome,
  deleteAdminReview,
  createManualTestimonial,
  type AdminReviewItem,
} from '../../lib/api/adminReviews';
import { useAdminProducts } from '../../lib/hooks/useAdmin';
import { StarRating } from '../../components/ui/StarRating';

type ActiveTab = 'pending' | 'shown' | 'hidden';

export const AdminReviews: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as ActiveTab) || 'pending';

  const [activeTab, setActiveTab] = useState<ActiveTab>(
    ['pending', 'shown', 'hidden'].includes(currentTab) ? currentTab : 'pending'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminReviewItem | null>(null);

  // Queries
  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: fetchAdminReviews,
  });

  const { data: productsData } = useAdminProducts();
  const products = productsData || [];

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' | 'pending' }) =>
      updateAdminReviewStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['home-testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['product-review-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
  });

  const toggleHomeMutation = useMutation({
    mutationFn: ({ id, showOnHome }: { id: string; showOnHome: boolean }) =>
      toggleAdminReviewShowOnHome(id, showOnHome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['home-testimonials'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminReview(id),
    onSuccess: () => {
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['home-testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['product-review-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
  });

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    if (!data?.reviews) return [];

    return data.reviews.filter((rev) => {
      // Tab filter
      if (activeTab === 'pending' && rev.status !== 'pending') return false;
      if (activeTab === 'shown' && rev.status !== 'approved') return false;
      if (activeTab === 'hidden' && rev.status !== 'rejected') return false;

      // Product filter
      if (productFilter === 'NONE' && rev.productId !== null) return false;
      if (productFilter !== 'ALL' && productFilter !== 'NONE' && rev.productId !== productFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = rev.reviewerName.toLowerCase().includes(q);
        const matchesTitle = rev.title?.toLowerCase().includes(q);
        const matchesText = rev.reviewText.toLowerCase().includes(q);
        const matchesProduct = rev.productName?.toLowerCase().includes(q);
        if (!matchesName && !matchesTitle && !matchesText && !matchesProduct) {
          return false;
        }
      }

      return true;
    });
  }, [data?.reviews, activeTab, productFilter, searchQuery]);

  const counts = data?.counts || { pending: 0, shown: 0, hidden: 0 };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-light text-ink">Reviews Moderation</h1>
          <p className="text-xs text-muted mt-0.5">
            Approve customer feedback, toggle home page testimonials, or record offline reviews.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="p-2 border border-line text-ink rounded-ui hover:bg-surface disabled:opacity-50 transition-colors"
            aria-label="Refresh reviews"
          >
            <RefreshCw className={`w-4 h-4 stroke-[1.5] ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-ink text-bg text-xs font-normal rounded-ui hover:bg-accent transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Add Testimonial</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-line text-xs font-normal">
        <button
          type="button"
          onClick={() => handleTabChange('pending')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'border-accent text-accent font-medium'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <span>Pending</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              counts.pending > 0 ? 'bg-accent/15 text-accent' : 'bg-surface text-muted border border-line'
            }`}
          >
            {counts.pending}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('shown')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'shown'
              ? 'border-accent text-accent font-medium'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <span>Shown</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-surface text-muted border border-line">
            {counts.shown}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('hidden')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'hidden'
              ? 'border-accent text-accent font-medium'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <span>Hidden</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-surface text-muted border border-line">
            {counts.hidden}
          </span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by reviewer name, title, or review text..."
            className="w-full bg-surface border border-line pl-9 pr-3 py-2 text-xs text-ink placeholder:text-muted rounded-ui focus:outline-none focus:border-ink font-light"
          />
        </div>

        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          aria-label="Filter reviews by product"
          className="w-full sm:w-64 bg-surface border border-line px-3 py-2 text-xs text-ink rounded-ui focus:outline-none focus:border-ink font-light"
        >
          <option value="ALL">All Pieces &amp; Testimonials</option>
          <option value="NONE">Whole Shop (General Testimonials)</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Reviews Queue List */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-muted font-light bg-surface border border-line rounded-ui">
          Loading reviews queue...
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 text-red-700 text-xs rounded-ui flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Error loading reviews: {(error as Error).message}</span>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-16 text-center text-xs text-muted font-light bg-surface border border-line rounded-ui space-y-2">
          <p>
            {activeTab === 'pending'
              ? 'No pending reviews in moderation queue.'
              : activeTab === 'shown'
                ? 'No approved reviews currently shown on the storefront.'
                : 'No hidden reviews in archive.'}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-accent underline text-xs"
            >
              Clear search filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((rev) => {
            const formattedDate = new Date(rev.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={rev.id}
                className="bg-surface border border-line p-5 rounded-ui space-y-3.5 transition-colors"
              >
                {/* Header row: Linked Piece & Meta badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/50 pb-3">
                  <div className="flex items-center gap-2">
                    {rev.productId && rev.productSlug ? (
                      <Link
                        to={`/product/${rev.productSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-normal text-ink hover:text-accent hover:underline flex items-center gap-1"
                      >
                        <span>{rev.productName || 'View Product'}</span>
                      </Link>
                    ) : (
                      <span className="text-xs font-normal text-muted">
                        Whole shop / General testimonial
                      </span>
                    )}

                    <span
                      className={`text-[10px] px-2 py-0.5 border rounded-ui font-light ${
                        rev.isOffline
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-bg text-ink border-line'
                      }`}
                    >
                      {rev.isOffline ? 'Owner-added testimonial' : 'Customer submission'}
                    </span>
                  </div>

                  <span className="text-[11px] text-muted font-light">{formattedDate}</span>
                </div>

                {/* Stars and Reviewer Name */}
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <StarRating rating={rev.rating} size="sm" />
                      <span className="text-xs font-medium text-ink">{rev.reviewerName}</span>
                    </div>
                    {rev.title && (
                      <h2 className="text-xs font-medium text-ink/90 pt-0.5">{rev.title}</h2>
                    )}
                  </div>

                  {/* Show on home page switch (enabled only for Shown/approved reviews) */}
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={`home-toggle-${rev.id}`}
                      className={`text-xs flex items-center gap-1.5 cursor-pointer select-none ${
                        rev.status !== 'approved' ? 'opacity-40 cursor-not-allowed text-muted' : 'text-ink'
                      }`}
                      title={
                        rev.status !== 'approved'
                          ? 'Review must be Shown (approved) to appear on the home page'
                          : 'Toggle testimonial on home page'
                      }
                    >
                      <HomeIcon className="w-3.5 h-3.5 text-muted" />
                      <span className="text-[11px] font-light hidden sm:inline">Show on home page</span>
                    </label>
                    <input
                      id={`home-toggle-${rev.id}`}
                      type="checkbox"
                      checked={rev.showOnHome}
                      disabled={rev.status !== 'approved' || toggleHomeMutation.isPending}
                      onChange={(e) =>
                        toggleHomeMutation.mutate({
                          id: rev.id,
                          showOnHome: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-ink focus:ring-accent cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Review Text strictly plain text */}
                <p className="text-xs text-muted font-light leading-relaxed whitespace-pre-line bg-bg/40 p-3 rounded-ui border border-line/40">
                  {rev.reviewText}
                </p>

                {/* Action Buttons row */}
                <div className="pt-1 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* Show button (if pending or hidden) */}
                    {rev.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => updateStatusMutation.mutate({ id: rev.id, status: 'approved' })}
                        disabled={updateStatusMutation.isPending}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-ink text-bg text-xs font-normal rounded-ui hover:bg-accent transition-colors disabled:opacity-50"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Show</span>
                      </button>
                    )}

                    {/* Hide button (if pending or approved) */}
                    {rev.status !== 'rejected' && (
                      <button
                        type="button"
                        onClick={() => updateStatusMutation.mutate({ id: rev.id, status: 'rejected' })}
                        disabled={updateStatusMutation.isPending}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-line bg-surface text-ink text-xs font-normal rounded-ui hover:bg-bg transition-colors disabled:opacity-50"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide</span>
                      </button>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(rev)}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 text-muted hover:text-red-600 transition-colors"
                    aria-label={`Delete review from ${rev.reviewerName}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-surface border border-line max-w-sm w-full p-6 space-y-4 rounded-ui text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1.5">
              <h2 className="text-base font-normal text-ink">Delete this review?</h2>
              <p className="text-xs text-muted font-light leading-relaxed">
                Are you sure you want to delete the review by{' '}
                <strong className="font-normal text-ink">{deleteTarget.reviewerName}</strong>?
                This action permanently removes the record and cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-line text-xs font-normal text-ink rounded-ui hover:bg-bg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white text-xs font-normal rounded-ui hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Offline Testimonial Modal */}
      {isAddModalOpen && (
        <AddTestimonialModal
          products={products}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
            queryClient.invalidateQueries({ queryKey: ['home-testimonials'] });
            queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
            queryClient.invalidateQueries({ queryKey: ['product-review-stats'] });
          }}
        />
      )}
    </div>
  );
};

interface AddTestimonialModalProps {
  products: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSuccess: () => void;
}

const AddTestimonialModal: React.FC<AddTestimonialModalProps> = ({
  products,
  onClose,
  onSuccess,
}) => {
  const [productId, setProductId] = useState<string>('');
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [showOnHome, setShowOnHome] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!reviewerName.trim()) {
      setErrorMsg('Please enter customer / reviewer name.');
      return;
    }

    if (!reviewText.trim()) {
      setErrorMsg('Please enter testimonial text.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createManualTestimonial({
        productId: productId ? productId : null,
        reviewerName: reviewerName.trim(),
        rating,
        title: title.trim() || null,
        reviewText: reviewText.trim(),
        showOnHome,
      });
      onSuccess();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to add testimonial.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-line max-w-lg w-full p-6 sm:p-8 space-y-5 rounded-ui text-left my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-light text-ink">Add Testimonial</h2>
            <p className="text-xs text-muted font-light mt-0.5">
              Record a verified WhatsApp or Instagram DM testimonial
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted hover:text-ink"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-ui flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Piece selection */}
          <div className="space-y-1">
            <label htmlFor="modal-product" className="block text-xs font-normal text-ink">
              Piece Linked <span className="text-muted text-[11px]">(optional)</span>
            </label>
            <select
              id="modal-product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-ui focus:outline-none focus:border-ink font-light"
            >
              <option value="">Whole Shop / General Testimonial</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div className="space-y-1.5">
            <label className="block text-xs font-normal text-ink">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`Select ${star} stars`}
                  className="p-1 text-accent focus:outline-none"
                >
                  <Star
                    className={`w-5 h-5 ${rating >= star ? 'fill-accent text-accent' : 'text-line'}`}
                  />
                </button>
              ))}
              <span className="text-xs font-medium text-ink ml-1">{rating} / 5</span>
            </div>
          </div>

          {/* Reviewer Name */}
          <div className="space-y-1">
            <label htmlFor="modal-reviewer" className="block text-xs font-normal text-ink">
              Customer / Reviewer Name <span className="text-red-500">*</span>
            </label>
            <input
              id="modal-reviewer"
              type="text"
              maxLength={80}
              placeholder="e.g. Sneha, Mumbai"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-ui focus:outline-none focus:border-ink font-light"
            />
          </div>

          {/* Headline */}
          <div className="space-y-1">
            <label htmlFor="modal-title" className="block text-xs font-normal text-ink">
              Headline <span className="text-muted text-[11px]">(optional)</span>
            </label>
            <input
              id="modal-title"
              type="text"
              maxLength={120}
              placeholder="e.g. Daily elegance"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-ui focus:outline-none focus:border-ink font-light"
            />
          </div>

          {/* Testimonial Text */}
          <div className="space-y-1">
            <label htmlFor="modal-text" className="block text-xs font-normal text-ink">
              Testimonial Text <span className="text-red-500">*</span>
            </label>
            <textarea
              id="modal-text"
              rows={4}
              maxLength={2000}
              placeholder="Quote from WhatsApp or Instagram chat..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-ui focus:outline-none focus:border-ink font-light resize-y"
            />
          </div>

          {/* Show on home page toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="modal-show-home"
              type="checkbox"
              checked={showOnHome}
              onChange={(e) => setShowOnHome(e.target.checked)}
              className="w-4 h-4 rounded text-ink focus:ring-accent cursor-pointer"
            />
            <label htmlFor="modal-show-home" className="text-xs text-ink cursor-pointer select-none">
              Show on home page testimonials
            </label>
          </div>

          {/* Submit & Cancel */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-line text-xs font-normal text-ink rounded-ui hover:bg-bg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-ink text-bg text-xs font-normal rounded-ui hover:bg-accent transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add Testimonial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminReviews;
