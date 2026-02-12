import express from 'express';
import AuditLog from '../../models/AuditLog';
import { requireAuth, requireAdmin } from '../../middleware/auth';
import logger from '../../utils/logger';

const router = express.Router();

/**
 * GET /admin/audit-logs
 * Get audit logs with filtering and pagination
 */
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      page = '1',
      limit = '50',
      userId,
      action,
      resource,
      startDate,
      endDate,
      statusCode,
    } = req.query;

    // Build filter query
    const filter: Record<string, unknown> = {};

    if (userId) {
      filter.userId = userId;
    }

    if (action) {
      filter.action = action;
    }

    if (resource) {
      filter.resource = resource;
    }

    if (statusCode) {
      filter.statusCode = parseInt(statusCode as string, 10);
    }

    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {} as Record<string, Date>;
      if (startDate) {
        (filter.timestamp as Record<string, Date>).$gte = new Date(startDate as string);
      }
      if (endDate) {
        (filter.timestamp as Record<string, Date>).$lte = new Date(endDate as string);
      }
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('userId', 'email fullName role')
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Failed to fetch audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

/**
 * GET /admin/audit-logs/stats
 * Get audit log statistics
 */
router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter: Record<string, Date | Record<string, Date>> = {};
    if (startDate || endDate) {
      const timestampFilter: Record<string, Date> = {};
      if (startDate) {
        timestampFilter.$gte = new Date(startDate as string);
      }
      if (endDate) {
        timestampFilter.$lte = new Date(endDate as string);
      }
      dateFilter.timestamp = timestampFilter;
    }

    // Aggregate statistics
    const [
      totalLogs,
      actionBreakdown,
      resourceBreakdown,
      statusBreakdown,
      topUsers,
      recentErrors,
    ] = await Promise.all([
      // Total count
      AuditLog.countDocuments(dateFilter),

      // Actions breakdown
      AuditLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Resources breakdown
      AuditLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$resource', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Status codes breakdown
      AuditLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$statusCode', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // Top users by activity
      AuditLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$userId', count: { $sum: 1 }, userName: { $first: '$userName' } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Recent errors
      AuditLog.find({
        ...dateFilter,
        statusCode: { $gte: 400 },
      })
        .sort({ timestamp: -1 })
        .limit(10)
        .select('timestamp userName action resource statusCode errorMessage')
        .lean(),
    ]);

    res.json({
      totalLogs,
      breakdown: {
        byAction: actionBreakdown,
        byResource: resourceBreakdown,
        byStatus: statusBreakdown,
      },
      topUsers,
      recentErrors,
    });
  } catch (error) {
    logger.error('Failed to fetch audit log stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * GET /admin/audit-logs/user/:userId
 * Get audit logs for a specific user
 */
router.get('/user/:userId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find({ userId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AuditLog.countDocuments({ userId }),
    ]);

    res.json({
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Failed to fetch user audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch user audit logs' });
  }
});

/**
 * GET /admin/audit-logs/:id
 * Get a specific audit log entry
 */
router.get('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const log = await AuditLog.findById(id)
      .populate('userId', 'email fullName role')
      .lean();

    if (!log) {
      return res.status(404).json({ error: 'Audit log not found' });
    }

    res.json(log);
  } catch (error) {
    logger.error('Failed to fetch audit log:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

/**
 * DELETE /admin/audit-logs/cleanup
 * Clean up old audit logs (optional maintenance endpoint)
 */
router.delete('/cleanup', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { olderThanDays = '90' } = req.query;

    const days = parseInt(olderThanDays as string, 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await AuditLog.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    logger.info(`Cleaned up ${result.deletedCount} audit logs older than ${days} days`);

    res.json({
      message: `Cleaned up ${result.deletedCount} audit logs`,
      cutoffDate,
    });
  } catch (error) {
    logger.error('Failed to clean up audit logs:', error);
    res.status(500).json({ error: 'Failed to clean up audit logs' });
  }
});

export default router;
