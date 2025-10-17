import express from "express";
import { requireAdmin } from "../../middleware/auth";
import Booking from "../../models/Booking";

const router = express.Router();


// Helper function to get date range
function getDateRange(range: string) {
  const now = new Date();
  let startDate: Date;
  
  switch (range) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  return { startDate, endDate: now };
}

// Tour data for mapping
const TOURS_MAP = {
  'route-a-preferred': {
    title: 'Route A Preferred - European Adventure',
    destination: 'Europe',
    countries: ['France', 'Switzerland', 'Italy', 'Vatican City']
  }
};

// POST /admin/reports/comprehensive - Real implementation with MongoDB data
router.post("/comprehensive", requireAdmin, async (req, res) => {
  try {
    const { dateRange = '30d' } = req.body;
    const { startDate, endDate } = getDateRange(dateRange);
    
    // Get all bookings in date range
    const bookings = await Booking.find({
      bookingDate: {
        $gte: startDate.toISOString(),
        $lte: endDate.toISOString()
      }
    }).sort({ bookingDate: -1 });
    
    // Calculate metrics
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    
    // Get previous period for comparison
    const prevStartDate = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
    const prevBookings = await Booking.find({
      bookingDate: {
        $gte: prevStartDate.toISOString(),
        $lt: startDate.toISOString()
      }
    });
    
    const prevTotalBookings = prevBookings.length;
    const prevTotalRevenue = prevBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    
    // Calculate growth rates
    const bookingGrowth = prevTotalBookings > 0 ? 
      ((totalBookings - prevTotalBookings) / prevTotalBookings) * 100 : 0;
    const revenueGrowth = prevTotalRevenue > 0 ? 
      ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 : 0;
    
    // Status breakdown
    const statusCounts = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Customer satisfaction (simplified - based on completion rate)
    const completedBookings = statusCounts.completed || 0;
    const satisfactionScore = totalBookings > 0 ? (completedBookings / totalBookings) * 5 : 0;
    
    // Booking trends by day
    const bookingTrends = generateBookingTrends(bookings);
    
    // Popular destinations
    const destinationCounts = bookings.reduce((acc, booking) => {
      const tourInfo = TOURS_MAP[booking.tourSlug as keyof typeof TOURS_MAP];
      if (tourInfo) {
        const destination = tourInfo.destination;
        acc[destination] = (acc[destination] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const popularDestinations = Object.entries(destinationCounts)
      .map(([name, count]) => ({
        country: name, // Frontend expects 'country' property
        bookings: count,
        revenue: bookings.filter(b => TOURS_MAP[b.tourSlug as keyof typeof TOURS_MAP]?.destination === name)
          .reduce((sum, b) => sum + b.totalAmount, 0),
        growth: 0, // Frontend expects 'growth' property
        tourCount: 1 // Add tourCount as expected by frontend
      }))
      .sort((a, b) => b.bookings - a.bookings);
    
    // Customer segments (simplified)
    const totalCustomers = new Set(bookings.map(b => b.customerEmail)).size;
    const customerSegments = [
      {
        segment: 'High Value',
        count: bookings.filter(b => b.totalAmount > 200000).length,
        totalRevenue: bookings.filter(b => b.totalAmount > 200000).reduce((sum, b) => sum + b.totalAmount, 0),
        percentage: 0,
        avgSpending: 0
      },
      {
        segment: 'Regular',
        count: bookings.filter(b => b.totalAmount >= 100000 && b.totalAmount <= 200000).length,
        totalRevenue: bookings.filter(b => b.totalAmount >= 100000 && b.totalAmount <= 200000).reduce((sum, b) => sum + b.totalAmount, 0),
        percentage: 0,
        avgSpending: 0
      },
      {
        segment: 'Budget',
        count: bookings.filter(b => b.totalAmount < 100000).length,
        totalRevenue: bookings.filter(b => b.totalAmount < 100000).reduce((sum, b) => sum + b.totalAmount, 0),
        percentage: 0,
        avgSpending: 0
      }
    ];
    
    // Calculate percentages and avg spending for segments
    customerSegments.forEach(segment => {
      segment.percentage = totalCustomers > 0 ? (segment.count / totalCustomers) * 100 : 0;
      segment.avgSpending = segment.count > 0 ? segment.totalRevenue / segment.count : 0;
    });
    
    const comprehensiveReport = {
      metrics: {
        totalBookings,
        totalRevenue,
        totalCustomers: new Set(bookings.map(b => b.customerEmail)).size,
        totalTours: Object.keys(TOURS_MAP).length, // Number of available tours
        averageBookingValue: avgBookingValue,
        conversionRate: 0, // Would need inquiry data
        customerSatisfaction: satisfactionScore,
        pendingInquiries: statusCounts.pending || 0,
        completedTasks: statusCounts.completed || 0,
        monthlyGrowth: revenueGrowth, // Use revenue growth as monthly growth
        bookingGrowth // Include booking growth rate to avoid unused variable
      },
      bookingTrends,
      popularDestinations,
      customerSegments
    };
    
    res.json(comprehensiveReport);
  } catch (error) {
    console.error('Error generating comprehensive report:', error);
    res.status(500).json({ error: "Failed to generate comprehensive report" });
  }
});

// Helper function to generate booking trends
interface BookingRecord {
  bookingDate: string | Date;
  totalAmount: number;
  customerEmail: string;
  tourSlug?: string;
  status?: string;
}

function generateBookingTrends(bookings: BookingRecord[]) {
  // Group bookings by month
  const monthlyData: Record<string, { bookings: number; revenue: number; customers: Set<string> }> = {};
  
  bookings.forEach((booking) => {
    const bookingDate = new Date(booking.bookingDate);
    const monthKey = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { bookings: 0, revenue: 0, customers: new Set() };
    }
    
    monthlyData[monthKey].bookings += 1;
    monthlyData[monthKey].revenue += booking.totalAmount;
    monthlyData[monthKey].customers.add(booking.customerEmail);
  });
  
  // Convert to trends array with growth calculation
  const trends = Object.entries(monthlyData)
    .map(([month, data], index, array) => {
      const prevData = index > 0 ? array[index - 1][1] : null;
      const growth = prevData && prevData.revenue > 0 ? 
        ((data.revenue - prevData.revenue) / prevData.revenue) * 100 : 0;
      
      return {
        month,
        bookings: data.bookings,
        revenue: data.revenue,
        growth,
        customers: data.customers.size
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));
  
  // If no monthly data, create at least current month with zeros
  if (trends.length === 0) {
    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    trends.push({
      month: currentMonth,
      bookings: 0,
      revenue: 0,
      growth: 0,
      customers: 0
    });
  }
  
  return trends;
}

// POST /admin/reports/metrics - Real metrics endpoint
router.post("/metrics", requireAdmin, async (req, res) => {
  try {
    const { dateRange = '30d' } = req.body;
    const { startDate, endDate } = getDateRange(dateRange);
    
    const bookings = await Booking.find({
      bookingDate: {
        $gte: startDate.toISOString(),
        $lte: endDate.toISOString()
      }
    });
    
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalBookings = bookings.length;
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    
    const metrics = {
      totalBookings,
      totalRevenue,
      totalCustomers: new Set(bookings.map(b => b.customerEmail)).size,
      totalTours: Object.keys(TOURS_MAP).length,
      averageBookingValue: avgBookingValue,
      conversionRate: 0,
      customerSatisfaction: bookings.filter(b => b.status === 'completed').length / Math.max(bookings.length, 1) * 5,
      pendingInquiries: bookings.filter(b => b.status === 'pending').length,
      completedTasks: bookings.filter(b => b.status === 'completed').length,
      monthlyGrowth: 0 // TODO: Calculate actual growth
    };
    
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

// POST /admin/reports/booking-trends - Booking trends endpoint
router.post("/booking-trends", requireAdmin, async (req, res) => {
  try {
    const { dateRange = '30d' } = req.body;
    const { startDate, endDate } = getDateRange(dateRange);
    
    const bookings = await Booking.find({
      bookingDate: {
        $gte: startDate.toISOString(),
        $lte: endDate.toISOString()
      }
    });
    
    const trends = generateBookingTrends(bookings);
    res.json(trends);
  } catch (error) {
    console.error('Error fetching booking trends:', error);
    res.status(500).json({ error: "Failed to fetch booking trends" });
  }
});

// POST /admin/reports/popular-destinations - Popular destinations endpoint
router.post("/popular-destinations", requireAdmin, async (req, res) => {
  try {
    const { dateRange = '30d' } = req.body;
    const { startDate, endDate } = getDateRange(dateRange);
    
    const bookings = await Booking.find({
      bookingDate: {
        $gte: startDate.toISOString(),
        $lte: endDate.toISOString()
      }
    });
    
    // Calculate popular destinations
    const destinationCounts = bookings.reduce((acc, booking) => {
      const tourInfo = TOURS_MAP[booking.tourSlug as keyof typeof TOURS_MAP];
      if (tourInfo) {
        const destination = tourInfo.destination;
        if (!acc[destination]) {
          acc[destination] = { count: 0, revenue: 0 };
        }
        acc[destination].count += 1;
        acc[destination].revenue += booking.totalAmount;
      }
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);
    
    const popularDestinations = Object.entries(destinationCounts)
      .map(([name, data]) => ({
        country: name, // Frontend expects 'country' property
        bookings: data.count,
        revenue: data.revenue,
        growth: 0, // Frontend expects 'growth' property
        tourCount: 1 // Add tourCount as expected by frontend
      }))
      .sort((a, b) => b.bookings - a.bookings);
    
    res.json(popularDestinations);
  } catch (error) {
    console.error('Error fetching popular destinations:', error);
    res.status(500).json({ error: "Failed to fetch popular destinations" });
  }
});

// POST /admin/reports/customer-segments - Customer segments endpoint
router.post("/customer-segments", requireAdmin, async (req, res) => {
  try {
    const { dateRange = '30d' } = req.body;
    const { startDate, endDate } = getDateRange(dateRange);
    
    const bookings = await Booking.find({
      bookingDate: {
        $gte: startDate.toISOString(),
        $lte: endDate.toISOString()
      }
    });
    
    // Calculate customer segments
    const totalCustomers = new Set(bookings.map(b => b.customerEmail)).size;
    const segments = [
      {
        segment: 'High Value',
        count: bookings.filter(b => b.totalAmount > 200000).length,
        totalRevenue: bookings.filter(b => b.totalAmount > 200000).reduce((sum, b) => sum + b.totalAmount, 0),
        percentage: 0,
        avgSpending: 0
      },
      {
        segment: 'Regular',
        count: bookings.filter(b => b.totalAmount >= 100000 && b.totalAmount <= 200000).length,
        totalRevenue: bookings.filter(b => b.totalAmount >= 100000 && b.totalAmount <= 200000).reduce((sum, b) => sum + b.totalAmount, 0),
        percentage: 0,
        avgSpending: 0
      },
      {
        segment: 'Budget',
        count: bookings.filter(b => b.totalAmount < 100000).length,
        totalRevenue: bookings.filter(b => b.totalAmount < 100000).reduce((sum, b) => sum + b.totalAmount, 0),
        percentage: 0,
        avgSpending: 0
      }
    ];
    
    // Calculate percentages and avg spending
    segments.forEach(segment => {
      segment.percentage = totalCustomers > 0 ? (segment.count / totalCustomers) * 100 : 0;
      segment.avgSpending = segment.count > 0 ? segment.totalRevenue / segment.count : 0;
    });
    
    res.json(segments);
  } catch (error) {
    console.error('Error fetching customer segments:', error);
    res.status(500).json({ error: "Failed to fetch customer segments" });
  }
});

// POST /admin/reports/revenue-breakdown - Revenue breakdown endpoint
router.post("/revenue-breakdown", requireAdmin, async (req, res) => {
  try {
    const { dateRange = '30d' } = req.body;
    const { startDate, endDate } = getDateRange(dateRange);
    
    const bookings = await Booking.find({
      bookingDate: {
        $gte: startDate.toISOString(),
        $lte: endDate.toISOString()
      }
    });
    
    // Group by tour/destination
    const revenueBreakdown = Object.entries(
      bookings.reduce((acc, booking) => {
        const tourInfo = TOURS_MAP[booking.tourSlug as keyof typeof TOURS_MAP];
        const key = tourInfo ? tourInfo.title : 'Unknown Tour';
        
        if (!acc[key]) {
          acc[key] = { category: key, revenue: 0, percentage: 0 };
        }
        acc[key].revenue += booking.totalAmount;
        return acc;
      }, {} as Record<string, { category: string; revenue: number; percentage: number }>)
    ).map(([, data]) => data);
    
    // Calculate percentages
    const totalRevenue = revenueBreakdown.reduce((sum, item) => sum + item.revenue, 0);
    revenueBreakdown.forEach(item => {
      item.percentage = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
    });
    
    res.json(revenueBreakdown);
  } catch (error) {
    console.error('Error fetching revenue breakdown:', error);
    res.status(500).json({ error: "Failed to fetch revenue breakdown" });
  }
});

// Add other endpoints with placeholder implementations
router.post("/customer-acquisition", requireAdmin, async (req, res) => {
  res.json([]);
});

router.post("/performance-metrics", requireAdmin, async (req, res) => {
  res.json([]);
});

export default router;
