// Shared types used across the app

export type ItineraryDay = {
  day: number;
  title: string;
  description?: string;
};

export type Stop = {
  city: string;
  country?: string;
  isStart?: boolean;
  isEnd?: boolean;
  days?: number; // optional number of nights/days spent at this stop
};

export type AdditionalInfo = {
  startingPoint?: string;
  endingPoint?: string;
  countriesVisited?: string[];
  mainCities?: Record<string, string[]>;
  [key: string]: unknown;
};

export type TravelWindow = {
  // inclusive ISO date strings: "YYYY-MM-DD"
  start: string;
  end: string;
};

export type Tour = {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  line?: string;
  durationDays: number;
  highlights?: string[];
  images?: string[];
  guaranteedDeparture?: boolean;
  bookingPdfUrl?: string;
  // Keep backward-compatible departureDates (optional) in case some components still use it.
  departureDates?: string[];
  // New: travelWindow describes the start/end of the scheduled travel (when the tour runs)
  travelWindow?: TravelWindow;
  itinerary?: ItineraryDay[];
  fullStops?: Stop[];
  basePricePerDay?: number;
  allowsDownpayment?: boolean;
  additionalInfo?: AdditionalInfo;
  regularPricePerPerson?: number;
  promoPricePerPerson?: number | null;
  // Sale fields
  isSaleEnabled?: boolean;
  saleEndDate?: string | null;
  [key: string]: unknown;
};

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export type PaymentType = 'full' | 'downpayment';

export type Booking = {
  id: string;
  bookingId: string;
  tour: Tour;
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
};