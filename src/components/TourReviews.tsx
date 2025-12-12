import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Verified } from 'lucide-react';
import { useAuth } from '../context/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface ReviewCategory {
  tourGuide: number;
  cleanliness: number;
  communication: number;
  value: number;
  organization: number;
}

interface Review {
  _id: string;
  name: string;
  userEmail?: string;
  bookingId?: string;
  rating: number;
  comment: string;
  isVerifiedBooking: boolean;
  helpfulVotes: number;
  categories: ReviewCategory;
  photos?: string[];
  createdAt: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  categoryAverages: ReviewCategory;
}

interface TourReviewsProps {
  tourSlug: string;
  tourTitle: string;
}

export default function TourReviews({ tourSlug, tourTitle }: TourReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewEligibility, setReviewEligibility] = useState<{
    canReview: boolean;
    isVerified: boolean;
    bookingId?: string;
    reason?: string;
    message?: string;
  } | null>(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    categories: {
      tourGuide: 5,
      cleanliness: 5,
      communication: 5,
      value: 5,
      organization: 5
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchReviews();
    if (user) {
      checkReviewEligibility();
    }
  }, [tourSlug, sortBy, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reviews/tour/${tourSlug}?sortBy=${sortBy}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkReviewEligibility = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/reviews/user/eligibility/${tourSlug}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setReviewEligibility(data);
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  const submitReview = async () => {
    if (!user) return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tourSlug,
          tourTitle,
          ...reviewForm,
          bookingId: reviewEligibility?.bookingId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setShowReviewForm(false);
        setShowReviewForm(false);
        fetchReviews(); // Refresh reviews
        alert(data.message);
        const errorData = await response.json();
        alert(errorData.error);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const markHelpful = async (reviewId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/reviews/${reviewId}/helpful`, {
        method: 'PUT'
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(prev => prev.map(review => 
          review._id === reviewId 
            ? { ...review, helpfulVotes: data.helpfulVotes }
            : review
        ));
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const renderStarRating = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onChange?.(star)}
            className={`${interactive ? 'hover:scale-110 cursor-pointer' : ''} transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderCategoryRatings = (categories: ReviewCategory) => {
    const categoryLabels = {
      tourGuide: 'Tour Guide',
      cleanliness: 'Cleanliness',
      communication: 'Communication',
      value: 'Value for Money',
      organization: 'Organization'
    };

    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <div key={key} className="text-center">
            <div className="text-xs text-gray-600 mb-1">{label}</div>
            <div className="flex justify-center">
              {renderStarRating(categories[key as keyof ReviewCategory])}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {categories[key as keyof ReviewCategory].toFixed(1)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border-b pb-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Reviews & Ratings
          </h3>
          {stats && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {renderStarRating(Math.round(stats.averageRating))}
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {stats.averageRating.toFixed(1)}
                </span>
                <span className="text-gray-600">
                  ({stats.totalReviews} reviews)
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {user ? (
            !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Write Review
              </button>
            )
          ) : (
            <button
              onClick={() => alert('Please log in to write a review')}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Write Review
            </button>
          )}
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="createdAt">Most Recent</option>
            <option value="rating">Highest Rated</option>
            <option value="helpfulVotes">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Overall Statistics */}
      {stats && stats.totalReviews > 0 && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          {/* Rating Distribution */}
          <div className="grid md:grid-cols-2 gap-8 mb-6">
            <div>
              <h4 className="font-semibold mb-4">Rating Breakdown</h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = stats.ratingDistribution[rating] || 0;
                  const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-2 text-sm">
                      <span className="w-8 text-right">{rating}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-gray-600">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Averages */}
            <div>
              <h4 className="font-semibold mb-4">Category Ratings</h4>
              {renderCategoryRatings(stats.categoryAverages)}
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-8 p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-lg text-gray-900">
              Write Your Review
              {reviewEligibility?.isVerified && (
                <span className="ml-2 inline-flex items-center gap-1 text-sm text-green-600">
                  <Verified className="w-4 h-4" />
                  Verified Booking
                </span>
              )}
            </h4>
            <button
              onClick={() => setShowReviewForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Eligibility Info */}
          {reviewEligibility && !reviewEligibility.isVerified && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              <p>
                {reviewEligibility.message || 
                  "Your review will be published after moderation. Reviews from verified bookings are auto-approved!"}
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">Overall Rating</label>
              {renderStarRating(reviewForm.rating, true, (rating) => 
                setReviewForm(prev => ({ ...prev, rating }))
              )}
            </div>

            {/* Category Ratings */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-900">Category Ratings</label>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries({
                  tourGuide: 'Tour Guide Quality',
                  cleanliness: 'Cleanliness',
                  communication: 'Communication',
                  value: 'Value for Money',
                  organization: 'Organization'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{label}</span>
                    {renderStarRating(
                      reviewForm.categories[key as keyof ReviewCategory], 
                      true, 
                      (rating) => setReviewForm(prev => ({
                        ...prev,
                        categories: { ...prev.categories, [key]: rating }
                      }))
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">Your Review</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                placeholder="Share your experience with this tour..."
                required
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={submitReview}
                disabled={submitting || !reviewForm.comment.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                onClick={() => setShowReviewForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium mb-2">No reviews yet</h4>
            <p>Be the first to share your experience with this tour!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
              {/* Review Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-semibold text-gray-900">{review.name}</h5>
                    {review.isVerifiedBooking && (
                      <span className="inline-flex items-center gap-1 text-sm text-green-600">
                        <Verified className="w-4 h-4" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {renderStarRating(review.rating)}
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <p className="text-gray-700 mb-4">{review.comment}</p>
                
                {/* Category Ratings */}
                {review.categories && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h6 className="text-sm font-medium mb-3">Detailed Ratings</h6>
                    {renderCategoryRatings(review.categories)}
                  </div>
                )}
              </div>

              {/* Review Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => markHelpful(review._id)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpfulVotes})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}