import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
  const response = await axios.post(`${API_URL}/api/reviews`, review);
  return response.data;
}

export async function fetchApprovedReviews() {
  const response = await axios.get(`${API_URL}/api/reviews/approved`);
  return response.data;
}

export async function fetchAllReviews() {
  const response = await axios.get(`${API_URL}/api/reviews`);
  return response.data;
}

export async function approveReview(reviewId: string) {
  const response = await axios.patch(`${API_URL}/api/reviews/${reviewId}/approve`);
  return response.data;
}

export async function deleteReview(reviewId: string) {
  const response = await axios.delete(`${API_URL}/api/reviews/${reviewId}`);
  return response.data;
}
