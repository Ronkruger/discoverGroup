const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export interface Review {
  _id?: string;
  name: string;
  tourSlug?: string;
  tourTitle?: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt?: string;
}

export async function submitReview(review: Omit<Review, '_id' | 'isApproved' | 'createdAt'>) {
  const response = await fetch(`${API_URL}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  });
  if (!response.ok) throw new Error('Failed to submit review');
  return response.json();
}

export async function fetchApprovedReviews() {
  const response = await fetch(`${API_URL}/api/reviews/approved`);
  if (!response.ok) throw new Error('Failed to fetch approved reviews');
  return response.json();
}

export async function fetchAllReviews() {
  const response = await fetch(`${API_URL}/api/reviews`);
  if (!response.ok) throw new Error('Failed to fetch reviews');
  return response.json();
}

export async function approveReview(reviewId: string) {
  const response = await fetch(`${API_URL}/api/reviews/${reviewId}/approve`, {
    method: 'PATCH',
  });
  if (!response.ok) throw new Error('Failed to approve review');
  return response.json();
}

export async function deleteReview(reviewId: string) {
  const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete review');
  return response.json();
}

export async function fetchTourReviewStats(tourSlug: string) {
  try {
    const response = await fetch(`${API_URL}/api/reviews/tour/${tourSlug}`);
    if (!response.ok) {
      console.warn(`Failed to fetch review stats for ${tourSlug}: ${response.status}`);
      return { averageRating: 0, totalReviews: 0 };
    }
    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.warn(`Failed to fetch review stats for ${tourSlug}:`, error);
    return { averageRating: 0, totalReviews: 0 };
  }
}
