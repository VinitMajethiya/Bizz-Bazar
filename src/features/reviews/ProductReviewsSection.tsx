import React, { useState, useEffect } from 'react';
import { Check, MessageSquarePlus, ChevronDown } from 'lucide-react';
import { StarRating } from '../../components/ui/StarRating';
import { useProductReviewStats } from '../../lib/hooks/useReviews';
import { fetchProductReviews } from '../../lib/api/reviews';
import { WriteReviewModal } from './WriteReviewModal';
import type { Review } from '../../lib/types';

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productId,
  productName,
}) => {
  const { data: stats, isLoading: statsLoading } = useProductReviewStats(productId);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Load initial page of reviews
  useEffect(() => {
    let isMounted = true;
    async function loadInitialReviews() {
      if (!productId) return;
      setLoadingReviews(true);
      try {
        const res = await fetchProductReviews(productId, 0, 5);
        if (isMounted) {
          setReviews(res.reviews);
          setHasMore(res.hasMore);
          setPage(0);
        }
      } catch {
        if (isMounted) {
          setReviews([]);
          setHasMore(false);
        }
      } finally {
        if (isMounted) setLoadingReviews(false);
      }
    }

    loadInitialReviews();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Load next page of reviews
  const handleLoadMore = async () => {
    if (loadingReviews || !hasMore) return;
    setLoadingReviews(true);
    const nextPage = page + 1;
    try {
      const res = await fetchProductReviews(productId, nextPage, 5);
      setReviews((prev) => [...prev, ...res.reviews]);
      setHasMore(res.hasMore);
      setPage(nextPage);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingReviews(false);
    }
  };

  const totalReviews = stats?.totalReviews ?? 0;
  const avgRating = stats?.averageRating ?? 0;

  return (
    <section className="py-12 border-b border-line">
      {/* Header with Summary and Write Review trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-lg font-normal text-ink">Customer Reviews</h2>
          {statsLoading ? (
            <p className="text-xs text-muted mt-1">Loading reviews...</p>
          ) : totalReviews > 0 ? (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={avgRating} size="base" />
              <span className="text-xs font-medium text-ink">
                {avgRating.toFixed(1)} out of 5
              </span>
              <span className="text-xs text-muted">
                ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          ) : (
            <p className="text-xs text-muted mt-1 font-light">
              No reviews yet. Be the first to share your thoughts.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsWriteModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-ink text-ink text-xs font-normal rounded-ui hover:bg-ink hover:text-bg transition-colors self-start sm:self-auto"
        >
          <MessageSquarePlus className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Write a review</span>
        </button>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => {
              const formattedDate = new Date(rev.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div key={rev.id} className="p-5 bg-surface border border-line/60 space-y-2 rounded-ui">
                  <div className="flex items-center justify-between">
                    <StarRating rating={rev.rating} size="sm" />
                    <span className="text-[11px] text-muted font-light">{formattedDate}</span>
                  </div>

                  <div className="text-xs font-medium text-ink">
                    {rev.reviewerName}
                  </div>

                  {rev.title && (
                    <h3 className="text-xs font-medium text-ink">{rev.title}</h3>
                  )}

                  {/* Render review text strictly as plain text */}
                  <p className="text-xs text-muted font-light leading-relaxed whitespace-pre-line">
                    {rev.reviewText}
                  </p>

                  {rev.isOffline && (
                    <div className="flex items-center gap-1 text-[10px] text-muted/80 pt-1">
                      <Check className="w-3 h-3 text-accent" />
                      <span>Verified purchase review</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Show more reviews button (5 at a time) */}
          {hasMore && (
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingReviews}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface border border-line text-xs font-normal text-ink rounded-ui hover:bg-bg transition-colors disabled:opacity-50"
              >
                <span>{loadingReviews ? 'Loading...' : 'Show more reviews'}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : !statsLoading ? (
        <div className="p-8 bg-surface border border-line/60 text-center space-y-2 rounded-ui">
          <p className="text-xs text-muted font-light">
            There are no approved customer reviews for this piece yet.
          </p>
          <button
            type="button"
            onClick={() => setIsWriteModalOpen(true)}
            className="text-xs text-accent hover:underline font-medium"
          >
            Leave the first review &rarr;
          </button>
        </div>
      ) : null}

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        productId={productId}
        productName={productName}
      />
    </section>
  );
};
