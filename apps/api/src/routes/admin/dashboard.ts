import express from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth';
import Booking from '../../models/Booking';
import Tour from '../../models/Tour';
import User from '../../models/User';

const router = express.Router();

/**
 * GET /admin/dashboard/stats
 * Fetch comprehensive dashboard statistics for Super Admin
 */
router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Get current date ranges
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch booking statistics
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      todayBookings,
      weekBookings,
      monthBookings
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.find({ createdAt: { $gte: startOfToday } }),
      Booking.find({ createdAt: { $gte: startOfWeek } }),
      Booking.find({ createdAt: { $gte: startOfMonth } })
    ]);

    // Calculate revenue
    interface BookingWithAmount {
      totalAmount?: number;
    }
    const calculateRevenue = (bookings: BookingWithAmount[]) => 
      bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

    const revenueToday = calculateRevenue(todayBookings);
    const revenueWeek = calculateRevenue(weekBookings);
    const revenueMonth = calculateRevenue(monthBookings);
    const allBookings = await Booking.find();
    const revenueTotal = calculateRevenue(allBookings);

    // Fetch tour statistics
    const [totalTours, activeTours] = await Promise.all([
      Tour.countDocuments(),
      Tour.countDocuments({ guaranteedDeparture: true })
    ]);

    // Count upcoming tours (tours with future departure dates)
    const toursWithDates = await Tour.find({ departureDates: { $exists: true, $ne: [] } });
    const upcomingTours = toursWithDates.filter(tour => {
      if (!tour.departureDates || tour.departureDates.length === 0) return false;
      return tour.departureDates.some((date: { start?: string } | string) => {
        const departureDate = new Date(typeof date === 'string' ? date : (date.start || ''));
        return departureDate > now;
      });
    }).length;

    // Fetch user statistics
    const [totalUsers, activeUsers, newUsersThisMonth] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } })
    ]);

    // Visa statistics (dummy data for now as there's no Visa model yet)
    const visas = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };

    // Customer Service statistics (dummy data for now as there's no Ticket model yet)
    const customerService = {
      openTickets: 0,
      resolvedToday: 0,
      avgResponseTime: "N/A"
    };

    // Sales statistics (dummy data - Meta Messenger integration)
    const sales = {
      messagesReceived: 34,
      leadsConverted: 8,
      activeConversations: 12
    };

    const stats = {
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings
      },
      tours: {
        total: totalTours,
        active: activeTours,
        upcoming: upcomingTours
      },
      visas,
      customerService,
      sales, // Keep sales as dummy data for Meta Messenger
      revenue: {
        today: revenueToday,
        thisWeek: revenueWeek,
        thisMonth: revenueMonth,
        total: revenueTotal
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        newThisMonth: newUsersThisMonth
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
});

/**
 * GET /admin/dashboard/stats/:department
 * Fetch department-specific statistics
 */
router.get('/stats/:department', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { department } = req.params;
    let departmentStats = {};

    switch (department) {
      case 'booking': {
        const [totalBookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, totalTours, activeTours] = await Promise.all([
          Booking.countDocuments(),
          Booking.countDocuments({ status: 'pending' }),
          Booking.countDocuments({ status: 'confirmed' }),
          Booking.countDocuments({ status: 'completed' }),
          Booking.countDocuments({ status: 'cancelled' }),
          Tour.countDocuments(),
          Tour.countDocuments({ guaranteedDeparture: true })
        ]);

        const now = new Date();
        const toursWithDates = await Tour.find({ departureDates: { $exists: true, $ne: [] } });
        const upcomingTours = toursWithDates.filter(tour => {
          if (!tour.departureDates || tour.departureDates.length === 0) return false;
          return tour.departureDates.some((date: { start?: string } | string) => {
            const departureDate = new Date(typeof date === 'string' ? date : (date.start || ''));
            return departureDate > now;
          });
        }).length;

        departmentStats = {
          bookings: {
            total: totalBookings,
            pending: pendingBookings,
            confirmed: confirmedBookings,
            completed: completedBookings,
            cancelled: cancelledBookings
          },
          tours: {
            total: totalTours,
            active: activeTours,
            upcoming: upcomingTours
          }
        };
        break;
      }
      
      case 'visa':
        // Dummy data for visa department (no Visa model yet)
        departmentStats = {
          visas: {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0
          }
        };
        break;
      
      case 'customer-service':
        // Dummy data for customer service (no Ticket model yet)
        departmentStats = {
          customerService: {
            openTickets: 0,
            resolvedToday: 0,
            avgResponseTime: "N/A"
          }
        };
        break;
      
      case 'sales':
        // Dummy data for sales department (Meta Messenger integration)
        departmentStats = {
          sales: {
            messagesReceived: 34,
            leadsConverted: 8,
            activeConversations: 12
          }
        };
        break;
      
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid department'
        });
    }

    res.json(departmentStats);
  } catch (error) {
    console.error(`Error fetching ${req.params.department} stats:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch department statistics'
    });
  }
});

export default router;
