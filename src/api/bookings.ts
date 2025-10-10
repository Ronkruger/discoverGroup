import type { Booking, Tour, BookingStatus, PaymentType } from "../types";

// Mock storage for bookings (in a real app, this would be a database)
let mockBookings: Booking[] = [];

// Helper function to generate a booking ID
function generateBookingId(): string {
  return `BK-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
}

// Initialize with some sample data for demonstration
function initializeSampleData() {
  if (mockBookings.length === 0) {
    const sampleTour1: Tour = {
      id: "route-a",
      slug: "route-a",
      title: "Route A Preferred - European Adventure",
      summary: "Experience the best of Europe in 14 unforgettable days",
      durationDays: 14,
      highlights: ["Paris", "Rome", "Barcelona", "Amsterdam"],
      images: ["/image.png"],
      guaranteedDeparture: true,
      basePricePerDay: 350,
      allowsDownpayment: true,
      travelWindow: {
        start: "2026-02-04",
        end: "2026-02-18"
      },
      additionalInfo: {
        countriesVisited: ["France", "Italy", "Spain", "Netherlands"],
        startingPoint: "Paris",
        endingPoint: "Amsterdam"
      }
    };

    const sampleTour2: Tour = {
      id: "route-b",
      slug: "route-b", 
      title: "Route B Premium - Asian Discovery",
      summary: "Discover the wonders of Asia in 12 amazing days",
      durationDays: 12,
      highlights: ["Tokyo", "Bangkok", "Singapore", "Seoul"],
      images: ["/image.png"],
      guaranteedDeparture: true,
      basePricePerDay: 280,
      allowsDownpayment: true,
      travelWindow: {
        start: "2026-03-15",
        end: "2026-03-27"
      },
      additionalInfo: {
        countriesVisited: ["Japan", "Thailand", "Singapore", "South Korea"],
        startingPoint: "Tokyo",
        endingPoint: "Seoul"
      }
    };

    // Create sample bookings
    const sampleBookings: Booking[] = [
      {
        id: "1",
        bookingId: "BK-ABC123",
        tour: sampleTour1,
        customerName: "John Doe",
        customerEmail: "john.doe@email.com",
        customerPhone: "+63 912 345 6789",
        customerPassport: "P123456789",
        selectedDate: "2026-02-04",
        passengers: 2,
        perPerson: 4900,
        totalAmount: 9800,
        paidAmount: 9800,
        paymentType: "full",
        status: "confirmed",
        bookingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        paymentIntentId: "pi_3SGXdk1jrkeQVBHGOaFzDxsq",
      },
      {
        id: "2", 
        bookingId: "BK-DEF456",
        tour: sampleTour2,
        customerName: "Jane Smith",
        customerEmail: "jane.smith@email.com",
        customerPhone: "+63 917 654 3210",
        selectedDate: "2026-03-15",
        passengers: 1,
        perPerson: 3360,
        totalAmount: 3360,
        paidAmount: 1008, // 30% downpayment
        paymentType: "downpayment",
        status: "pending",
        bookingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        paymentIntentId: "pi_3SGXef2krlfRWCIHPbGgExtr",
      },
      {
        id: "3",
        bookingId: "BK-GHI789", 
        tour: sampleTour1,
        customerName: "Mike Johnson",
        customerEmail: "mike.johnson@email.com",
        customerPhone: "+63 920 111 2222",
        selectedDate: "2026-02-04",
        passengers: 4,
        perPerson: 4900,
        totalAmount: 19600,
        paidAmount: 19600,
        paymentType: "full",
        status: "completed",
        bookingDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        paymentIntentId: "pi_3SGXfg3lsmgSXDJIOcHhFytu",
      }
    ];

    mockBookings = sampleBookings;
    localStorage.setItem('bookings', JSON.stringify(mockBookings));
  }
}

// Create a new booking
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

  const booking: Booking = {
    id: bookingId,
    bookingId,
    tour: bookingData.tour,
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
    bookingDate: new Date().toISOString(),
    paymentIntentId: bookingData.paymentIntentId,
  };

  mockBookings.push(booking);
  
  // Store in localStorage for persistence across sessions
  localStorage.setItem('bookings', JSON.stringify(mockBookings));
  
  return booking;
}

// Get all bookings
export async function fetchAllBookings(): Promise<Booking[]> {
  // Initialize sample data on first load
  initializeSampleData();
  
  // Load from localStorage if available
  const stored = localStorage.getItem('bookings');
  if (stored) {
    try {
      mockBookings = JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing stored bookings:', error);
      mockBookings = [];
    }
  }
  
  return mockBookings.sort((a, b) => 
    new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
  );
}

// Get booking by ID
export async function fetchBookingById(bookingId: string): Promise<Booking | null> {
  const bookings = await fetchAllBookings();
  return bookings.find(booking => booking.bookingId === bookingId) || null;
}

// Update booking status
export async function updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking | null> {
  const bookings = await fetchAllBookings();
  const bookingIndex = bookings.findIndex(booking => booking.bookingId === bookingId);
  
  if (bookingIndex === -1) {
    return null;
  }
  
  mockBookings[bookingIndex].status = status;
  localStorage.setItem('bookings', JSON.stringify(mockBookings));
  
  return mockBookings[bookingIndex];
}

// Delete booking
export async function deleteBooking(bookingId: string): Promise<boolean> {
  const bookings = await fetchAllBookings();
  const initialLength = bookings.length;
  mockBookings = bookings.filter(booking => booking.bookingId !== bookingId);
  
  localStorage.setItem('bookings', JSON.stringify(mockBookings));
  
  return mockBookings.length < initialLength;
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