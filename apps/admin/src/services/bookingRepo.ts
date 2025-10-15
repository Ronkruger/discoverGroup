import type { Booking, BookingFilters, BookingReportData, DashboardStats, BookingStatus } from '../types/booking';

const API_BASE_URL =
  (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL)
    ? process.env.VITE_API_URL
    : ((globalThis as unknown as { VITE_API_URL?: string })?.VITE_API_URL ?? 'http://localhost:4000');

function getToken() {
  return localStorage.getItem('token');
}
// Fetch all bookings with optional filters
export async function fetchBookings(filters?: BookingFilters): Promise<Booking[]> {
  const params = new URLSearchParams();
  if (filters) {
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.tourId) params.append('tourId', filters.tourId);
    if (filters.customerId) params.append('customerId', filters.customerId);
  }
  const res = await fetch(`${API_BASE_URL}/admin/bookings?${params.toString()}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return await res.json();
}

// Get booking by ID
export async function fetchBookingById(bookingId: string): Promise<Booking | null> {
  const res = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!res.ok) return null;
  return await res.json();
}

// Update booking status
export async function updateBookingStatus(bookingId: string, status: BookingStatus, notes?: string): Promise<Booking | null> {
  const res = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
    body: JSON.stringify({ status, notes }),
  });
  if (!res.ok) return null;
  return await res.json();
}

// Delete booking
export async function deleteBooking(bookingId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  return res.ok;
}

// Generate booking reports
export async function generateBookingReport(
  period: 'day' | 'week' | 'month' | 'year',
  startDate?: string,
  endDate?: string
): Promise<BookingReportData[]> {
  const params = new URLSearchParams({ period });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const res = await fetch(`${API_BASE_URL}/admin/bookings/report?${params.toString()}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Failed to generate report');
  return await res.json();
}

// Get dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE_URL}/admin/bookings/dashboard-stats`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return await res.json();
}