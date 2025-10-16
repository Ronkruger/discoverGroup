import type { Booking, Tour, BookingStatus, PaymentType } from "../types";

// Removed mockBookings and all localStorage fallback. All booking operations use backend only.

// Helper function to generate a booking ID
function generateBookingId(): string {
  return `BK-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
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
  };

  const res = await fetch('http://localhost:4000/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create booking');
  const saved = await res.json();
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
    const res = await fetch('http://localhost:4000/api/bookings');
    if (!res.ok) throw new Error('Failed to fetch bookings');
    const data = await res.json();
    // If backend returns bookings, map them to Booking type
    return (data as Array<Record<string, unknown>>).map((b) => {
      const booking: Booking = {
        id: typeof b._id === 'string' ? b._id : (typeof b.bookingId === 'string' ? b.bookingId : ''),
        bookingId: typeof b.bookingId === 'string' ? b.bookingId : '',
        tour: typeof b.tour === 'object' && b.tour !== null ? (b.tour as Tour) : {} as Tour,
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
  const res = await fetch(`http://localhost:4000/api/bookings/${encodeURIComponent(bookingId)}/status`, {
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
  const res = await fetch(`http://localhost:4000/api/bookings/${encodeURIComponent(bookingId)}`, {
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