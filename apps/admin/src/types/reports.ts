// Report types for analytics and business intelligence
export interface ReportMetrics {
  totalBookings: number;
  totalRevenue: number;
  totalCustomers: number;
  totalTours: number;
  averageBookingValue: number;
  conversionRate: number;
  customerSatisfaction: number;
  pendingInquiries: number;
  completedTasks: number;
  monthlyGrowth: number;
}

export interface BookingTrend {
  month: string;
  bookings: number;
  revenue: number;
  growth: number;
}

export interface PopularDestination {
  country: string;
  bookings: number;
  revenue: number;
  growth: number;
  tourCount: number;
}

export interface CustomerSegment {
  segment: string;
  count: number;
  percentage: number;
  avgSpending: number;
  totalRevenue: number;
}

export interface RevenueBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface CustomerAcquisition {
  source: string;
  customers: number;
  conversion: number;
  cost: number;
}

export interface PerformanceMetric {
  metric: string;
  value: number;
  target: number;
  status: 'above' | 'below' | 'meeting';
  trend: number;
}

export interface TourPerformance {
  tourId: string;
  tourName: string;
  bookings: number;
  revenue: number;
  rating: number;
  capacity: number;
  occupancyRate: number;
}

export interface CustomerSatisfactionMetric {
  category: string;
  rating: number;
  responses: number;
  trend: number;
}

export interface BookingStatusReport {
  status: string;
  count: number;
  percentage: number;
  revenue: number;
}

export interface ReportFilter {
  dateRange: '7d' | '30d' | '90d' | '1y' | 'custom';
  startDate?: string;
  endDate?: string;
  department?: string;
  tourType?: string;
  customerSegment?: string;
}

export interface ComprehensiveReport {
  metrics: ReportMetrics;
  bookingTrends: BookingTrend[];
  popularDestinations: PopularDestination[];
  customerSegments: CustomerSegment[];
  revenueBreakdown: RevenueBreakdown[];
  customerAcquisition: CustomerAcquisition[];
  performanceMetrics: PerformanceMetric[];
  tourPerformance: TourPerformance[];
  customerSatisfaction: CustomerSatisfactionMetric[];
  bookingStatus: BookingStatusReport[];
  generatedAt: string;
}