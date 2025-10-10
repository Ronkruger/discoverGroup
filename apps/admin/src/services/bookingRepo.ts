// Booking repository service for admin panel
import type { Booking, BookingFilters, BookingReportData, DashboardStats, BookingStatus, BookingTour } from '../types/booking';

// Initialize with some sample data for demonstration
function initializeSampleData(): Booking[] {
  const sampleTour1: BookingTour = {
    id: "route-a",
    slug: "route-a",
    title: "Route A Preferred - European Adventure",
    summary: "Experience the best of Europe in 14 unforgettable days",
    durationDays: 14,
    highlights: ["Paris", "Rome", "Barcelona", "Amsterdam"],
    images: ["/image.png"],
    guaranteedDeparture: true,
    allowsDownpayment: true,
    additionalInfo: {
      countriesVisited: ["France", "Italy", "Spain", "Netherlands"],
      startingPoint: "Paris",
      endingPoint: "Amsterdam"
    }
  };

  const sampleTour2: BookingTour = {
    id: "route-b",
    slug: "route-b", 
    title: "Route B Premium - Asian Discovery",
    summary: "Discover the wonders of Asia in 12 amazing days",
    durationDays: 12,
    highlights: ["Tokyo", "Bangkok", "Singapore", "Seoul"],
    images: ["/image.png"],
    guaranteedDeparture: true,
    allowsDownpayment: true,
    additionalInfo: {
      countriesVisited: ["Japan", "Thailand", "Singapore", "South Korea"],
      startingPoint: "Tokyo",
      endingPoint: "Seoul"
    }
  };

  // Create sample bookings
  return [
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
}

// Helper function to get bookings from localStorage (simulating API)
function getBookingsFromStorage(): Booking[] {
  try {
    const stored = localStorage.getItem('bookings');
    if (stored) {
      return JSON.parse(stored);
    } else {
      // Initialize with sample data if no bookings exist
      const sampleBookings = initializeSampleData();
      localStorage.setItem('bookings', JSON.stringify(sampleBookings));
      return sampleBookings;
    }
  } catch (error) {
    console.error('Error parsing bookings from storage:', error);
    return initializeSampleData();
  }
}

// Helper function to save bookings to localStorage (simulating API)
function saveBookingsToStorage(bookings: Booking[]): void {
  try {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  } catch (error) {
    console.error('Error saving bookings to storage:', error);
  }
}

// Fetch all bookings with optional filters
export async function fetchBookings(filters?: BookingFilters): Promise<Booking[]> {
  // In a real app, this would be an API call
  // For demo, we'll use localStorage data
  let bookings = getBookingsFromStorage();

  if (filters) {
    if (filters.startDate) {
      bookings = bookings.filter(booking => 
        new Date(booking.bookingDate) >= new Date(filters.startDate!)
      );
    }

    if (filters.endDate) {
      bookings = bookings.filter(booking => 
        new Date(booking.bookingDate) <= new Date(filters.endDate!)
      );
    }

    if (filters.status && filters.status !== 'all') {
      bookings = bookings.filter(booking => booking.status === filters.status);
    }

    if (filters.tourId) {
      bookings = bookings.filter(booking => booking.tour.id === filters.tourId);
    }

    if (filters.customerId) {
      bookings = bookings.filter(booking => 
        booking.customerEmail.toLowerCase().includes(filters.customerId!.toLowerCase()) ||
        booking.customerName.toLowerCase().includes(filters.customerId!.toLowerCase())
      );
    }
  }

  return bookings.sort((a, b) => 
    new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
  );
}

// Get booking by ID
export async function fetchBookingById(bookingId: string): Promise<Booking | null> {
  const bookings = getBookingsFromStorage();
  return bookings.find(booking => booking.bookingId === bookingId) || null;
}

// Update booking status
export async function updateBookingStatus(bookingId: string, status: BookingStatus, notes?: string): Promise<Booking | null> {
  const bookings = getBookingsFromStorage();
  const bookingIndex = bookings.findIndex(booking => booking.bookingId === bookingId);
  
  if (bookingIndex === -1) {
    return null;
  }
  
  bookings[bookingIndex].status = status;
  if (notes) {
    bookings[bookingIndex].notes = notes;
  }
  
  saveBookingsToStorage(bookings);
  
  return bookings[bookingIndex];
}

// Delete booking
export async function deleteBooking(bookingId: string): Promise<boolean> {
  const bookings = getBookingsFromStorage();
  const initialLength = bookings.length;
  const filteredBookings = bookings.filter(booking => booking.bookingId !== bookingId);
  
  saveBookingsToStorage(filteredBookings);
  
  return filteredBookings.length < initialLength;
}

// Generate booking reports
export async function generateBookingReport(
  period: 'day' | 'week' | 'month' | 'year',
  startDate?: string,
  endDate?: string
): Promise<BookingReportData[]> {
  const bookings = await fetchBookings({ startDate, endDate });
  
  // Group bookings by period
  const groupedData: Record<string, Booking[]> = {};
  
  bookings.forEach(booking => {
    const date = new Date(booking.bookingDate);
    let key: string;
    
    switch (period) {
      case 'day': {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
        break;
      }
      case 'week': {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      }
      case 'month': {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      }
      case 'year': {
        key = String(date.getFullYear());
        break;
      }
      default: {
        key = date.toISOString().split('T')[0];
      }
    }
    
    if (!groupedData[key]) {
      groupedData[key] = [];
    }
    groupedData[key].push(booking);
  });
  
  // Generate report data for each period
  return Object.entries(groupedData).map(([period, periodBookings]) => {
    const totalBookings = periodBookings.length;
    const totalRevenue = periodBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const confirmedBookings = periodBookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = periodBookings.filter(b => b.status === 'pending').length;
    const cancelledBookings = periodBookings.filter(b => b.status === 'cancelled').length;
    
    // Get top tours for this period
    const tourStats: Record<string, { bookings: number; revenue: number; title: string }> = {};
    periodBookings.forEach(booking => {
      if (!tourStats[booking.tour.id]) {
        tourStats[booking.tour.id] = {
          bookings: 0,
          revenue: 0,
          title: booking.tour.title
        };
      }
      tourStats[booking.tour.id].bookings++;
      tourStats[booking.tour.id].revenue += booking.totalAmount;
    });
    
    const topTours = Object.entries(tourStats)
      .map(([tourId, stats]) => ({
        tourId,
        tourTitle: stats.title,
        bookings: stats.bookings,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    return {
      period,
      totalBookings,
      totalRevenue,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      averageBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0,
      topTours
    };
  }).sort((a, b) => a.period.localeCompare(b.period));
}

// Get dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  const allBookings = getBookingsFromStorage();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  
  const monthAgo = new Date(today);
  monthAgo.setMonth(today.getMonth() - 1);
  
  const todayBookings = allBookings.filter(booking => 
    booking.bookingDate.startsWith(todayStr)
  );
  
  const thisWeekBookings = allBookings.filter(booking => 
    new Date(booking.bookingDate) >= weekAgo
  );
  
  const lastWeekBookings = allBookings.filter(booking => {
    const bookingDate = new Date(booking.bookingDate);
    const twoWeeksAgo = new Date(weekAgo);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
    return bookingDate >= twoWeeksAgo && bookingDate < weekAgo;
  });
  
  const thisMonthBookings = allBookings.filter(booking => 
    new Date(booking.bookingDate) >= monthAgo
  );
  
  const lastMonthBookings = allBookings.filter(booking => {
    const bookingDate = new Date(booking.bookingDate);
    const twoMonthsAgo = new Date(monthAgo);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 1);
    return bookingDate >= twoMonthsAgo && bookingDate < monthAgo;
  });
  
  const totalRevenue = allBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const todayRevenue = todayBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  
  const weeklyGrowth = lastWeekBookings.length > 0 
    ? ((thisWeekBookings.length - lastWeekBookings.length) / lastWeekBookings.length) * 100
    : thisWeekBookings.length > 0 ? 100 : 0;
    
  const monthlyGrowth = lastMonthBookings.length > 0
    ? ((thisMonthBookings.length - lastMonthBookings.length) / lastMonthBookings.length) * 100
    : thisMonthBookings.length > 0 ? 100 : 0;
  
  const statusBreakdown = allBookings.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {} as Record<BookingStatus, number>);
  
  const revenueByPaymentType = allBookings.reduce((acc, booking) => {
    acc[booking.paymentType] += booking.totalAmount;
    return acc;
  }, { full: 0, downpayment: 0 });
  
  return {
    totalBookings: allBookings.length,
    totalRevenue,
    todayBookings: todayBookings.length,
    todayRevenue,
    weeklyGrowth,
    monthlyGrowth,
    statusBreakdown: {
      confirmed: statusBreakdown.confirmed || 0,
      pending: statusBreakdown.pending || 0,
      cancelled: statusBreakdown.cancelled || 0,
      completed: statusBreakdown.completed || 0
    },
    revenueByPaymentType
  };
}