import React, { useState, useEffect } from 'react';
import { Star, Filter, Eye, CheckCircle, XCircle, Trash2, TrendingUp, Users, MessageSquare } from 'lucide-react';

interface Review {
  _id: string;
  name: string;
  userEmail?: string;
  tourSlug?: string;
  tourTitle?: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  isVerifiedBooking: boolean;
  helpfulVotes: number;
  categories?: {
    tourGuide: number;
    cleanliness: number;
    communication: number;
    value: number;
    organization: number;
  };
  createdAt: string;
}

interface ReviewStats {
  totalReviews: number;
  approvedReviews: number;
  pendingReviews: number;
  verifiedReviews: number;
  averageRating: number;
}

interface ReviewAnalytics {
  ratingDistribution: { [key: number]: number };
  topTours: Array<{
    _id: string;
    tourTitle: string;
    count: number;
    averageRating: number;
    verifiedCount: number;
  }>;
  categoryAverages: {
    tourGuide: number;
    cleanliness: number;
    communication: number;
    value: number;
    organization: number;
  };
}

export default function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [analytics, setAnalytics] = useState<ReviewAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTour, setSelectedTour] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [selectedStatus, selectedTour, currentPage, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (showAnalytics) {
      fetchAnalytics();
    }
  }, [showAnalytics]);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        status: selectedStatus,
        page: currentPage.toString(),
        sortBy,
        limit: '20'
      });

      if (selectedTour) {
        params.append('tourSlug', selectedTour);
      }

      const response = await fetch(`/admin/reviews?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setStats(data.stats);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/admin/reviews/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/admin/reviews/${reviewId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error approving review:', error);
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/admin/reviews/${reviewId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <TrendingUp className="w-4 h-4" />
          {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
                <p className="text-sm text-gray-600">Total Reviews</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.approvedReviews}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Eye className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReviews}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.verifiedReviews}</p>
                <p className="text-sm text-gray-600">Verified</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Star className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Section */}
      {showAnalytics && analytics && (
        <div className="mb-8 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Analytics Overview</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Rating Distribution */}
              <div>
                <h4 className="font-medium mb-3">Rating Distribution</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = analytics.ratingDistribution[rating] || 0;
                    const total = Object.values(analytics.ratingDistribution).reduce((sum, val) => sum + val, 0);
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-2 text-sm">
                        <span className="w-6 text-right">{rating}</span>
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

              {/* Top Tours */}
              <div>
                <h4 className="font-medium mb-3">Most Reviewed Tours</h4>
                <div className="space-y-2">
                  {analytics.topTours.slice(0, 5).map((tour, index) => (
                    <div key={tour._id} className="flex justify-between items-center text-sm">
                      <div className="flex-1 truncate">
                        <span className="font-medium">#{index + 1}</span>
                        <span className="ml-2 truncate">{tour.tourTitle || tour._id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">({tour.count})</span>
                        {renderStarRating(tour.averageRating)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Averages */}
              <div>
                <h4 className="font-medium mb-3">Category Performance</h4>
                <div className="space-y-2">
                  {Object.entries({
                    tourGuide: 'Tour Guide',
                    cleanliness: 'Cleanliness',
                    communication: 'Communication',
                    value: 'Value',
                    organization: 'Organization'
                  }).map(([key, label]) => {
                    const rating = analytics.categoryAverages[key as keyof typeof analytics.categoryAverages] || 0;
                    return (
                      <div key={key} className="flex justify-between items-center text-sm">
                        <span>{label}</span>
                        {renderStarRating(rating)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Reviews</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>

          <input
            type="text"
            placeholder="Filter by tour slug"
            value={selectedTour}
            onChange={(e) => {
              setSelectedTour(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="createdAt">Newest First</option>
            <option value="rating">Highest Rated</option>
            <option value="helpfulVotes">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Review
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tour
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No reviews found</p>
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{review.name}</span>
                          {review.isVerifiedBooking && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 max-w-xs truncate">
                          {review.comment}
                        </p>
                        {review.userEmail && (
                          <p className="text-xs text-gray-500 mt-1">{review.userEmail}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 truncate max-w-xs">
                          {review.tourTitle || review.tourSlug || 'N/A'}
                        </div>
                        {review.tourSlug && (
                          <div className="text-gray-500 text-xs mt-1">{review.tourSlug}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {renderStarRating(review.rating)}
                      {review.helpfulVotes > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {review.helpfulVotes} helpful votes
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        review.isApproved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {review.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {!review.isApproved && (
                          <button
                            onClick={() => handleApprove(review._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {review.isApproved && (
                          <button
                            onClick={() => handleReject(review._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hide"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}