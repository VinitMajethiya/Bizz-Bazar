import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { reviewFormSchema, type ReviewFormInput } from '../../lib/validation/schemas';
import { useSubmitReview } from '../../lib/hooks/useReviews';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
}) => {
  const mountTime = useRef<number>(Date.now());
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [spamError, setSpamError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const { mutateAsync: submitReviewMutation, isPending } = useSubmitReview();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormInput>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 5,
      reviewer_name: '',
      title: '',
      review_text: '',
      product_id: productId,
      website_trap: '',
    },
  });

  const selectedRating = watch('rating');

  useEffect(() => {
    if (isOpen) {
      mountTime.current = Date.now();
      setSpamError(null);
      setIsSuccess(false);
      reset({
        rating: 5,
        reviewer_name: '',
        title: '',
        review_text: '',
        product_id: productId,
        website_trap: '',
      });
    }
  }, [isOpen, productId, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: ReviewFormInput) => {
    setSpamError(null);

    // 1. Honeypot check: If the hidden honeypot trap has any value, simulate success but don't insert
    if (data.website_trap && data.website_trap.trim() !== '') {
      setIsSuccess(true);
      return;
    }

    // 2. Minimum 3 seconds delay check
    const elapsedMs = Date.now() - mountTime.current;
    if (elapsedMs < 3000) {
      setSpamError('Please take a moment before submitting.');
      return;
    }

    // 3. 24-hour duplicate submission guard per product in localStorage
    const storageKey = `byraya_reviewed_${productId}`;
    try {
      const lastSubmitted = localStorage.getItem(storageKey);
      if (lastSubmitted) {
        const lastTime = Number(lastSubmitted);
        const dayInMs = 24 * 60 * 60 * 1000;
        if (Date.now() - lastTime < dayInMs) {
          setSpamError('You have already submitted a review for this piece in the last 24 hours.');
          return;
        }
      }
    } catch {
      // Ignore localStorage read errors in restricted contexts
    }

    try {
      await submitReviewMutation({
        productId,
        reviewerName: data.reviewer_name,
        rating: data.rating,
        title: data.title || null,
        reviewText: data.review_text,
      });

      // Record successful submission in localStorage
      try {
        localStorage.setItem(storageKey, Date.now().toString());
      } catch {
        // Ignore localStorage write errors
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit review. Please try again.';
      setSpamError(message);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="write-review-title"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-surface border border-line w-full max-w-lg p-6 sm:p-8 space-y-5 rounded-ui text-left my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-2 text-muted hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-ui"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-normal text-ink">Thank you for your review!</h2>
              <p className="text-xs text-muted font-light max-w-sm mx-auto leading-relaxed">
                Your feedback has been submitted and will appear on the catalogue once approved by our team.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-ink text-bg text-xs font-normal rounded-ui hover:bg-accent transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <h2 id="write-review-title" className="text-lg font-light text-ink">
                Review this piece
              </h2>
              <p className="text-xs text-muted font-light mt-0.5 truncate">
                {productName}
              </p>
            </div>

            {spamError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 rounded-ui">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{spamError}</span>
              </div>
            )}

            {/* Hidden honeypot field for bot prevention */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website_trap">Do not fill this</label>
              <input
                id="website_trap"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                {...register('website_trap')}
              />
            </div>

            {/* Rating Stars */}
            <div className="space-y-1.5">
              <label className="block text-xs font-normal text-ink">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1.5" role="group" aria-label="Select star rating">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || selectedRating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setValue('rating', star, { shouldValidate: true })}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      className="p-1 text-accent hover:scale-110 transition-transform focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
                    >
                      <Star
                        className={`w-6 h-6 ${isFilled ? 'fill-accent text-accent' : 'text-line stroke-[1.5]'}`}
                      />
                    </button>
                  );
                })}
                <span className="text-xs font-medium text-ink ml-2">
                  {selectedRating} / 5
                </span>
              </div>
              {errors.rating && (
                <p className="text-[11px] text-red-600 font-light">{errors.rating.message}</p>
              )}
            </div>

            {/* Reviewer Name */}
            <div className="space-y-1">
              <label htmlFor="reviewer_name" className="block text-xs font-normal text-ink">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                id="reviewer_name"
                type="text"
                maxLength={80}
                placeholder="e.g. Priya M."
                {...register('reviewer_name')}
                className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink rounded-ui font-light"
              />
              {errors.reviewer_name && (
                <p className="text-[11px] text-red-600 font-light">{errors.reviewer_name.message}</p>
              )}
            </div>

            {/* Headline / Title */}
            <div className="space-y-1">
              <label htmlFor="review_title" className="block text-xs font-normal text-ink">
                Headline <span className="text-muted text-[11px] font-light">(optional)</span>
              </label>
              <input
                id="review_title"
                type="text"
                maxLength={120}
                placeholder="e.g. Beautiful everyday shine"
                {...register('title')}
                className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink rounded-ui font-light"
              />
              {errors.title && (
                <p className="text-[11px] text-red-600 font-light">{errors.title.message}</p>
              )}
            </div>

            {/* Review Text */}
            <div className="space-y-1">
              <label htmlFor="review_text" className="block text-xs font-normal text-ink">
                Review <span className="text-red-500">*</span>
              </label>
              <textarea
                id="review_text"
                rows={4}
                maxLength={2000}
                placeholder="Tell us what you loved about this piece, the finish, or gifting experience..."
                {...register('review_text')}
                className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink rounded-ui font-light resize-y"
              />
              {errors.review_text && (
                <p className="text-[11px] text-red-600 font-light">{errors.review_text.message}</p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-line text-ink text-xs font-normal rounded-ui hover:bg-bg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 bg-ink text-bg text-xs font-normal rounded-ui hover:bg-accent transition-colors disabled:opacity-50"
              >
                {isPending ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
