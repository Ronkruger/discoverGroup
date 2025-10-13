// Reports service for data aggregation and analytics
import { 
  fetchBookings
} from './bookingRepo';
import { customerServiceRepo } from './customerServiceRepo';
import { getAllTours } from './tourRepo';
import type { Booking } from '../types/booking';
import type {
  ReportMetrics,
  BookingTrend,
  PopularDestination,
  CustomerSegment,
  RevenueBreakdown,
  CustomerAcquisition,
  PerformanceMetric,
  TourPerformance,
  CustomerSatisfactionMetric,
  BookingStatusReport,
  ComprehensiveReport,
  ReportFilter
} from '../types/reports';

class ReportsService {
  
  async generateComprehensiveReport(filter: ReportFilter): Promise<ComprehensiveReport> {
    const [
      metrics,
      bookingTrends,
      popularDestinations,
      customerSegments,
      revenueBreakdown,
      customerAcquisition,
      performanceMetrics,
      tourPerformance,
      customerSatisfaction,
      bookingStatus
    ] = await Promise.all([
      this.getReportMetrics(filter),
      this.getBookingTrends(filter),
      this.getPopularDestinations(filter),
      this.getCustomerSegments(filter),
      this.getRevenueBreakdown(filter),
      this.getCustomerAcquisition(filter),
      this.getPerformanceMetrics(filter),
      this.getTourPerformance(filter),
      this.getCustomerSatisfaction(filter),
      this.getBookingStatus(filter)
    ]);

    return {
      metrics,
      bookingTrends,
      popularDestinations,
      customerSegments,
      revenueBreakdown,
      customerAcquisition,
      performanceMetrics,
      tourPerformance,
      customerSatisfaction,
      bookingStatus,
      generatedAt: new Date().toISOString()
    };
  }

  async getReportMetrics(_filter: ReportFilter): Promise<ReportMetrics> {
    void _filter;
    const bookings = await fetchBookings();
    const customers = customerServiceRepo.getAllCustomers();
    const inquiries = customerServiceRepo.getAllInquiries();
    const tasks = customerServiceRepo.getAllTasks();
    const tours = await getAllTours();

    const totalRevenue = bookings.reduce((sum: number, booking: Booking) => sum + (booking.totalAmount || 0), 0);
    const completedBookings = bookings.filter((b: { status: string }) => b.status === 'confirmed').length;
    const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
    const pendingInquiriesCount = inquiries.filter(i => i.status === 'open').length; // Use correct status

    // Calculate previous period for growth comparison
    const currentPeriodBookings = bookings.length;
    const previousPeriodBookings = Math.max(1, currentPeriodBookings - 5); // Mock calculation
    const monthlyGrowth = ((currentPeriodBookings - previousPeriodBookings) / previousPeriodBookings) * 100;

    return {
      totalBookings: bookings.length,
      totalRevenue,
      totalCustomers: customers.length,
      totalTours: tours.length,
      averageBookingValue: totalRevenue / Math.max(bookings.length, 1),
      conversionRate: (completedBookings / Math.max(bookings.length, 1)) * 100,
      customerSatisfaction: 4.2, // Mock data - would come from feedback
      pendingInquiries: pendingInquiriesCount,
      completedTasks: completedTasksCount,
      monthlyGrowth
    };
  }

  async getBookingTrends(_filter: ReportFilter): Promise<BookingTrend[]> {
    void _filter;
    // Mock data - in real implementation, would filter by actual dates
    const trends: BookingTrend[] = [
      { month: 'Jan', bookings: 42, revenue: 118000, growth: 8.5 },
      { month: 'Feb', bookings: 48, revenue: 135000, growth: 14.3 },
      { month: 'Mar', bookings: 45, revenue: 125000, growth: -6.2 },
      { month: 'Apr', bookings: 52, revenue: 148000, growth: 15.6 },
      { month: 'May', bookings: 58, revenue: 162000, growth: 11.5 },
      { month: 'Jun', bookings: 61, revenue: 171000, growth: 5.2 },
      { month: 'Jul', bookings: 67, revenue: 185000, growth: 9.8 },
      { month: 'Aug', bookings: 72, revenue: 198000, growth: 7.5 },
      { month: 'Sep', bookings: 69, revenue: 192000, growth: -4.2 },
      { month: 'Oct', bookings: 74, revenue: 205000, growth: 7.2 },
      { month: 'Nov', bookings: 78, revenue: 218000, growth: 5.4 },
      { month: 'Dec', bookings: 82, revenue: 235000, growth: 5.1 }
    ];

    return trends.slice(-6); // Return last 6 months
  }

  async getPopularDestinations(_filter: ReportFilter): Promise<PopularDestination[]> {
    void _filter;
    const destinations: PopularDestination[] = [
      { country: 'Japan', bookings: 28, revenue: 98000, growth: 15.2, tourCount: 8 },
      { country: 'Italy', bookings: 24, revenue: 84000, growth: 8.7, tourCount: 6 },
      { country: 'Thailand', bookings: 22, revenue: 66000, growth: 22.1, tourCount: 5 },
      { country: 'France', bookings: 19, revenue: 76000, growth: 5.3, tourCount: 7 },
      { country: 'Spain', bookings: 17, revenue: 68000, growth: 12.8, tourCount: 4 },
      { country: 'Greece', bookings: 15, revenue: 58000, growth: 18.5, tourCount: 3 },
      { country: 'Portugal', bookings: 13, revenue: 52000, growth: 25.4, tourCount: 3 },
      { country: 'Turkey', bookings: 12, revenue: 48000, growth: 16.7, tourCount: 2 }
    ];

    return destinations.sort((a, b) => b.bookings - a.bookings);
  }

  async getCustomerSegments(_filter: ReportFilter): Promise<CustomerSegment[]> {
    void _filter;
    const segments: CustomerSegment[] = [
      { segment: 'Premium Travelers', count: 45, percentage: 32, avgSpending: 4200, totalRevenue: 189000 },
      { segment: 'Budget Conscious', count: 38, percentage: 27, avgSpending: 1800, totalRevenue: 68400 },
      { segment: 'Adventure Seekers', count: 35, percentage: 25, avgSpending: 3200, totalRevenue: 112000 },
      { segment: 'Cultural Enthusiasts', count: 22, percentage: 16, avgSpending: 2800, totalRevenue: 61600 }
    ];

    return segments;
  }

  async getRevenueBreakdown(_filter: ReportFilter): Promise<RevenueBreakdown[]> {
    void _filter;
    const breakdown: RevenueBreakdown[] = [
      { category: 'Tour Packages', amount: 425000, percentage: 68.5 },
      { category: 'Additional Services', amount: 89000, percentage: 14.3 },
      { category: 'Visa Assistance', amount: 56000, percentage: 9.0 },
      { category: 'Travel Insurance', amount: 34000, percentage: 5.5 },
      { category: 'Equipment Rental', amount: 17000, percentage: 2.7 }
    ];

    return breakdown;
  }

  async getCustomerAcquisition(_filter: ReportFilter): Promise<CustomerAcquisition[]> {
    void _filter;
    const acquisition: CustomerAcquisition[] = [
      { source: 'Social Media', customers: 45, conversion: 3.2, cost: 1200 },
      { source: 'Search Engine', customers: 38, conversion: 5.8, cost: 2100 },
      { source: 'Referrals', customers: 32, conversion: 12.5, cost: 800 },
      { source: 'Email Campaign', customers: 24, conversion: 2.1, cost: 450 },
      { source: 'Travel Blogs', customers: 18, conversion: 4.3, cost: 650 },
      { source: 'Direct Website', customers: 15, conversion: 8.7, cost: 0 }
    ];

    return acquisition;
  }

  async getPerformanceMetrics(_filter: ReportFilter): Promise<PerformanceMetric[]> {
    void _filter;
    const metrics: PerformanceMetric[] = [
      { metric: 'Conversion Rate', value: 15.2, target: 12.0, status: 'above', trend: 2.1 },
      { metric: 'Customer Retention', value: 68.5, target: 70.0, status: 'below', trend: -1.5 },
      { metric: 'Average Response Time (hrs)', value: 2.4, target: 3.0, status: 'above', trend: -0.3 },
      { metric: 'Customer Satisfaction', value: 4.2, target: 4.0, status: 'above', trend: 0.1 },
      { metric: 'Revenue per Customer', value: 2850, target: 2500, status: 'above', trend: 150 },
      { metric: 'Booking Completion Rate', value: 89.3, target: 85.0, status: 'above', trend: 3.2 }
    ];

    return metrics;
  }

  async getTourPerformance(_filter: ReportFilter): Promise<TourPerformance[]> {
    void _filter;
    const performance: TourPerformance[] = [
      { tourId: '1', tourName: 'European Adventure', bookings: 28, revenue: 98000, rating: 4.5, capacity: 120, occupancyRate: 85.2 },
      { tourId: '2', tourName: 'Asian Discovery', bookings: 24, revenue: 84000, rating: 4.3, capacity: 100, occupancyRate: 78.5 },
      { tourId: '3', tourName: 'Mediterranean Explorer', bookings: 22, revenue: 76000, rating: 4.4, capacity: 90, occupancyRate: 82.1 },
      { tourId: '4', tourName: 'Nordic Wonders', bookings: 19, revenue: 68000, rating: 4.6, capacity: 80, occupancyRate: 76.3 },
      { tourId: '5', tourName: 'Tropical Paradise', bookings: 17, revenue: 58000, rating: 4.2, capacity: 70, occupancyRate: 71.8 }
    ];

    return performance.sort((a, b) => b.revenue - a.revenue);
  }

  async getCustomerSatisfaction(_filter: ReportFilter): Promise<CustomerSatisfactionMetric[]> {
    void _filter;
    const satisfaction: CustomerSatisfactionMetric[] = [
      { category: 'Tour Guide Quality', rating: 4.3, responses: 156, trend: 0.2 },
      { category: 'Accommodation', rating: 4.1, responses: 142, trend: -0.1 },
      { category: 'Transportation', rating: 4.2, responses: 138, trend: 0.1 },
      { category: 'Itinerary Planning', rating: 4.4, responses: 149, trend: 0.3 },
      { category: 'Customer Service', rating: 4.5, responses: 162, trend: 0.2 },
      { category: 'Value for Money', rating: 4.0, responses: 134, trend: 0.1 }
    ];

    return satisfaction;
  }

  async getBookingStatus(_filter: ReportFilter): Promise<BookingStatusReport[]> {
    void _filter;
    const bookings = await fetchBookings();
    const statusCounts = bookings.reduce((acc: Record<string, number>, booking: { status: string }) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalBookings = bookings.length;
    const statusReport: BookingStatusReport[] = Object.entries(statusCounts).map(([status, count]) => {
      const revenue: number = bookings
        .filter((b: Booking) => b.status === status)
        .reduce((sum: number, b: Booking) => sum + (b.totalAmount || 0), 0);
      
      return {
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count: count as number,
        percentage: (count / totalBookings) * 100,
        revenue
      };
    });

    return statusReport.sort((a, b) => b.count - a.count);
  }

  // Export functionality
  async exportReport(format: 'csv' | 'pdf' | 'xlsx', reportData: ComprehensiveReport): Promise<Blob> {
    // Mock implementation - in real app would generate actual files
    const data = JSON.stringify(reportData, null, 2);
    return new Blob([data], { type: 'application/json' });
  }

  // Real-time data refresh
  subscribeToUpdates(callback: (data: Partial<ComprehensiveReport>) => void): () => void {
    // Mock implementation - in real app would use WebSocket or polling
    const interval = setInterval(() => {
      callback({
        metrics: {
          totalBookings: Math.floor(Math.random() * 100) + 50,
          totalRevenue: Math.floor(Math.random() * 100000) + 500000,
          totalCustomers: Math.floor(Math.random() * 50) + 100,
          totalTours: 25,
          averageBookingValue: 2850,
          conversionRate: 15.2,
          customerSatisfaction: 4.2,
          pendingInquiries: Math.floor(Math.random() * 10) + 5,
          completedTasks: Math.floor(Math.random() * 20) + 40,
          monthlyGrowth: 12.5
        }
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }
}

export const reportsService = new ReportsService();