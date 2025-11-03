// Booking-related types for admin panel

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export type PaymentType = 'full' | 'downpayment';

// Tour interface for bookings (simplified to avoid import issues)
export interface BookingTour {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  durationDays: number;
  highlights?: string[];
  images?: string[];
  guaranteedDeparture?: boolean;
  allowsDownpayment?: boolean;
  additionalInfo?: {
    countriesVisited?: string[];
    startingPoint?: string;
    endingPoint?: string;
  };
}

export interface Booking {
  id: string;
  bookingId: string;
  tour: BookingTour;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerPassport?: string;
  selectedDate: string;
  passengers: number;
  perPerson: number;
  totalAmount: number;
  paidAmount: number;
  paymentType: PaymentType;
  status: BookingStatus;
  bookingDate: string; // ISO date string
  paymentIntentId?: string;
  notes?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentPurpose?: string;
}

export interface BookingFilters {
  startDate?: string;
  endDate?: string;
  status?: BookingStatus | 'all';
  tourId?: string;
  period?: 'day' | 'week' | 'month' | 'year';
  customerId?: string;
}

export interface BookingReportData {
  period: string;
  totalBookings: number;
  totalRevenue: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  averageBookingValue: number;
  topTours: Array<{
    tourId: string;
    tourTitle: string;
    bookings: number;
    revenue: number;
  }>;
}

export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  todayBookings: number;
  todayRevenue: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  statusBreakdown: Record<BookingStatus, number>;
  revenueByPaymentType: {
    full: number;
    downpayment: number;
  };
}