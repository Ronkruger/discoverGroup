import express from 'express';
import { requireAdmin } from '../../middleware/auth';

const router = express.Router();

/**
 * GET /admin/dashboard/stats
 * Fetch comprehensive dashboard statistics for Super Admin
 */
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    // TODO: Replace with actual database queries
    // For now, returning mock data

    const stats = {
      bookings: {
        total: 186,
        pending: 12,
        confirmed: 45,
        completed: 120,
        cancelled: 9
      },
      tours: {
        total: 15,
        active: 12,
        upcoming: 8
      },
      visas: {
        total: 23,
        pending: 5,
        approved: 18,
        rejected: 0
      },
      customerService: {
        openTickets: 7,
        resolvedToday: 12,
        avgResponseTime: "15 min"
      },
      sales: {
        messagesReceived: 34,
        leadsConverted: 8,
        activeConversations: 12
      },
      revenue: {
        today: 3250,
        thisWeek: 18750,
        thisMonth: 65400,
        total: 245000
      },
      users: {
        total: 24,
        active: 18,
        newThisMonth: 3
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
router.get('/stats/:department', requireAdmin, async (req, res) => {
  try {
    const { department } = req.params;

    // TODO: Replace with actual database queries based on department
    let departmentStats = {};

    switch (department) {
      case 'booking':
        departmentStats = {
          bookings: {
            total: 186,
            pending: 12,
            confirmed: 45,
            completed: 120,
            cancelled: 9
          },
          tours: {
            total: 15,
            active: 12,
            upcoming: 8
          }
        };
        break;
      
      case 'visa':
        departmentStats = {
          visas: {
            total: 23,
            pending: 5,
            approved: 18,
            rejected: 0
          }
        };
        break;
      
      case 'customer-service':
        departmentStats = {
          customerService: {
            openTickets: 7,
            resolvedToday: 12,
            avgResponseTime: "15 min"
          }
        };
        break;
      
      case 'sales':
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
