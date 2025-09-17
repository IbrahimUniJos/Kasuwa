import React, { useState, useEffect } from 'react';
import { 
  StarIcon, 
  HandThumbUpIcon, 
  HandThumbDownIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { reviewService } from '../../services/reviews';
import { useAuth } from '../../contexts/AuthContext';
import type { ReviewDto, CreateReviewDto } from '../../types/api';

interface ProductReviewsProps {
  productId: number;
  productName: string;
  onReviewSubmitted?: () => void;
}

export default function ProductReviews({ productId, onReviewSubmitted }: ProductReviewsProps) {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Review form state
  const [reviewForm, setReviewForm] = useState<CreateReviewDto>({
    productId,
    rating: 5,
    title: '',
    content: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
    if (isAuthenticated) {
      checkCanReview();
    }
  }, [productId, currentPage, isAuthenticated]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getProductReviews(productId, currentPage);
      setReviews(response.data);
      setTotalPages(response.totalPages);
      setAverageRating(response.totalCount || 0);
      setTotalReviews(response.totalCount);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCanReview = async () => {
    try {
      const canUserReview = await reviewService.canReviewProduct(productId);
      setCanReview(canUserReview);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.rating || !reviewForm.content.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await reviewService.createReview(reviewForm);
      setShowReviewForm(false);
      setReviewForm({
        productId,
        rating: 5,
        title: '',
        content: ''
      });
      await loadReviews();
      await checkCanReview();
      onReviewSubmitted?.();
    } catch (error: any) {
      setError(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const markReviewHelpful = async (reviewId: number, isHelpful: boolean) => {
    try {
      await reviewService.markReviewHelpful({ reviewId, isHelpful });
      await loadReviews(); // Reload to get updated helpful counts
    } catch (error) {
      console.error('Error marking review helpful:', error);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarSolidIcon
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingStars = (rating: number, onChange: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <StarSolidIcon
              className={`h-8 w-8 ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          {isAuthenticated && canReview && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-kasuwa-primary-600 text-white px-4 py-2 rounded-lg hover:bg-kasuwa-primary-700 transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(Math.round(averageRating), 'lg')}
            </div>
            <p className="text-gray-600">
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter(r => Math.round(r.rating) === rating).length;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center space-x-3">
                  <span className="text-sm font-medium w-8">{rating}</span>
                  <StarSolidIcon className="h-4 w-4 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Write a Review</h3>
            <button
              onClick={() => setShowReviewForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={submitReview} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              {renderRatingStars(reviewForm.rating, (rating) =>
                setReviewForm({ ...reviewForm, rating })
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title
              </label>
              <input
                type="text"
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                placeholder="Summarize your experience"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                value={reviewForm.content}
                onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                placeholder="Tell others about your experience with this product"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !reviewForm.content.trim()}
                className="px-4 py-2 bg-kasuwa-primary-600 text-white rounded-lg hover:bg-kasuwa-primary-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <StarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {review.user?.profileImageUrl ? (
                    <img
                      src={review.user.profileImageUrl}
                      alt={`${review.user.firstName} ${review.user.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {review.user?.firstName} {review.user?.lastName}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-600">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {review.title && (
                    <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                  )}

                  <p className="text-gray-700 mb-4">{review.content}</p>

                  {/* Helpful Actions */}
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">Was this helpful?</span>
                    <button
                      onClick={() => markReviewHelpful(review.id, true)}
                      className="flex items-center space-x-1 text-gray-600 hover:text-green-600"
                    >
                      <HandThumbUpIcon className="h-4 w-4" />
                      <span>Yes ({review.helpfulCount || 0})</span>
                    </button>
                    <button
                      onClick={() => markReviewHelpful(review.id, false)}
                      className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                    >
                      <HandThumbDownIcon className="h-4 w-4" />
                      <span>No</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 border rounded-lg ${
                page === currentPage
                  ? 'bg-kasuwa-primary-600 text-white border-kasuwa-primary-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}