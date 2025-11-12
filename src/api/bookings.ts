import type { Booking, Tour, BookingStatus, PaymentType, CustomRoute } from "../types";

// Use VITE_API_BASE_URL (consistent with .env files) or VITE_API_URL as fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Helper function to generate a booking ID
function generateBookingId(): string {
  return `BK-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
}

// Helper function to get tour title from slug (since tours aren't in MongoDB)
function getTourTitleFromSlug(slug: string): string {
  const tourTitles: Record<string, string> = {
    'route-a-preferred': 'Route A Preferred - European Adventure',
    'route-b-classic': 'Route B Classic - Mediterranean Journey',
    'route-c-premium': 'Route C Premium - Nordic Explorer',
    // Add more tour mappings as needed
  };
  return tourTitles[slug] || `Tour ${slug}`;
}

// Removed initializeSampleData to prevent dummy bookings from being created

// Create a new booking (POST to backend)
export async function createBooking(bookingData: {
  tour: Tour;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerPassport?: string;
  selectedDate: string;
  passengers: number;
  perPerson: number;
  paymentType: PaymentType;
  paymentIntentId?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentPurpose?: string;
  customRoutes?: CustomRoute[];
}): Promise<Booking> {
  const bookingId = generateBookingId();
  const totalAmount = bookingData.perPerson * bookingData.passengers;
  const paidAmount = bookingData.paymentType === 'full' 
    ? totalAmount 
    : Math.round(totalAmount * 0.3); // 30% downpayment

  const payload = {
    tourSlug: bookingData.tour.slug,
    customerName: bookingData.customerName,
    customerEmail: bookingData.customerEmail,
    customerPhone: bookingData.customerPhone,
    customerPassport: bookingData.customerPassport,
    selectedDate: bookingData.selectedDate,
    passengers: bookingData.passengers,
    perPerson: bookingData.perPerson,
    totalAmount,
    paidAmount,
    paymentType: bookingData.paymentType,
    status: 'confirmed',
    bookingId,
    bookingDate: new Date().toISOString(),
    paymentIntentId: bookingData.paymentIntentId,
    notes: '',
    appointmentDate: bookingData.appointmentDate,
    appointmentTime: bookingData.appointmentTime,
    appointmentPurpose: bookingData.appointmentPurpose,
    customRoutes: bookingData.customRoutes || [],
  };

  const res = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    console.error('❌ Backend booking save failed:', {
      status: res.status,
      statusText: res.statusText,
      error: errorText
    });
    throw new Error(`Failed to create booking: ${res.status} ${errorText}`);
  }
  
  const saved = await res.json();
  console.log('🎯 Backend response:', saved);
  
  // Return a Booking object matching frontend type
  return {
    ...saved,
    tour: bookingData.tour,
    id: saved._id || bookingId,
  };
}

// Get all bookings
export async function fetchAllBookings(): Promise<Booking[]> {
  // Try to fetch from backend
  try {
    const res = await fetch(`${API_BASE_URL}/api/bookings`);
    if (!res.ok) throw new Error('Failed to fetch bookings');
    const data = await res.json();
    // If backend returns bookings, map them to Booking type
    return (data as Array<Record<string, unknown>>).map((b) => {
      // Create a minimal tour object from tourSlug since full tour data isn't stored in MongoDB
      const tour: Tour = {
        id: typeof b.tourSlug === 'string' ? b.tourSlug : '',
        slug: typeof b.tourSlug === 'string' ? b.tourSlug : '',
        title: getTourTitleFromSlug(typeof b.tourSlug === 'string' ? b.tourSlug : ''),
        summary: '',
        line: 'ROUTE_A',
        durationDays: 14,
        highlights: [],
        images: [],
        guaranteedDeparture: true,
        regularPricePerPerson: typeof b.perPerson === 'number' ? b.perPerson : 0,
        promoPricePerPerson: typeof b.perPerson === 'number' ? b.perPerson : 0,
        allowsDownpayment: true,
        additionalInfo: {
          countriesVisited: [],
          startingPoint: 'Manila, Philippines',
          endingPoint: 'Manila, Philippines'
        },
        itinerary: [],
        fullStops: [],
        departureDates: [],
        travelWindow: { start: '', end: '' }
      };
      
      const booking: Booking = {
        id: typeof b._id === 'string' ? b._id : (typeof b.bookingId === 'string' ? b.bookingId : ''),
        bookingId: typeof b.bookingId === 'string' ? b.bookingId : '',
        tour,
        customerName: typeof b.customerName === 'string' ? b.customerName : '',
        customerEmail: typeof b.customerEmail === 'string' ? b.customerEmail : '',
        customerPhone: typeof b.customerPhone === 'string' ? b.customerPhone : '',
        customerPassport: typeof b.customerPassport === 'string' ? b.customerPassport : undefined,
        selectedDate: typeof b.selectedDate === 'string' ? b.selectedDate : '',
        passengers: typeof b.passengers === 'number' ? b.passengers : 0,
        perPerson: typeof b.perPerson === 'number' ? b.perPerson : 0,
        totalAmount: typeof b.totalAmount === 'number' ? b.totalAmount : 0,
        paidAmount: typeof b.paidAmount === 'number' ? b.paidAmount : 0,
        paymentType: (typeof b.paymentType === 'string' ? b.paymentType : 'full') as PaymentType,
        status: (typeof b.status === 'string' ? b.status : 'confirmed') as BookingStatus,
        bookingDate: typeof b.bookingDate === 'string' ? b.bookingDate : '',
        paymentIntentId: typeof b.paymentIntentId === 'string' ? b.paymentIntentId : undefined,
        notes: typeof b.notes === 'string' ? b.notes : undefined,
        appointmentDate: typeof b.appointmentDate === 'string' ? b.appointmentDate : undefined,
        appointmentTime: typeof b.appointmentTime === 'string' ? b.appointmentTime : undefined,
        appointmentPurpose: typeof b.appointmentPurpose === 'string' ? b.appointmentPurpose : undefined,
      };
      return booking;
    }).sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
  } catch {
    throw new Error('Failed to fetch bookings from backend');
  }
}

// Get booking by ID
export async function fetchBookingById(bookingId: string): Promise<Booking | null> {
  const bookings = await fetchAllBookings();
  return bookings.find(booking => booking.bookingId === bookingId) || null;
}

// Update booking status (must be implemented via backend API)
export async function updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking | null> {
  // Call backend to update status for the given bookingId
  const res = await fetch(`${API_BASE_URL}/api/bookings/${encodeURIComponent(bookingId)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to update booking status');
  }

  // Return the updated booking from backend (refresh via fetchBookingById)
  return fetchBookingById(bookingId);
}

// Delete booking (must be implemented via backend API)
export async function deleteBooking(bookingId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/api/bookings/${encodeURIComponent(bookingId)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (res.status === 404) return false;
  if (!res.ok) throw new Error('Failed to delete booking');
  return true;
}

// Search bookings by customer email
export async function searchBookingsByEmail(email: string): Promise<Booking[]> {
  const bookings = await fetchAllBookings();
  return bookings.filter(booking => 
    booking.customerEmail.toLowerCase().includes(email.toLowerCase())
  );
}

// Get bookings by status
export async function fetchBookingsByStatus(status: BookingStatus): Promise<Booking[]> {
  const bookings = await fetchAllBookings();
  return bookings.filter(booking => booking.status === status);
}

// Get recent booking for notification
export async function fetchRecentBookingNotification(): Promise<{
  customerName: string;
  tourSlug: string;
  timeAgo: string;
} | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/bookings/recent/notification`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn('Could not fetch recent booking notification:', error);
    return null;
  }
}

