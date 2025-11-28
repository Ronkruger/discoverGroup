import express from 'express';
import Review from '../../models/Review';
import { requireAdmin } from '../../middleware/auth';

const router = express.Router();

// GET /admin/reviews - get all reviews with filtering
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { 
      status = 'all', 
      tourSlug,
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter: Record<string, unknown> = {};
    
    if (status === 'pending') {
      filter.isApproved = false;
    } else if (status === 'approved') {
      filter.isApproved = true;
    }
    
    if (tourSlug) {
      filter.tourSlug = tourSlug;
    }

    const reviews = await Review.find(filter)
      .sort({ [sortBy as string]: sortOrder === 'desc' ? -1 : 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('userId', 'name email');

    const total = await Review.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

    // Get statistics
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          approvedReviews: { 
            $sum: { $cond: ['$isApproved', 1, 0] } 
          },
          pendingReviews: { 
            $sum: { $cond: ['$isApproved', 0, 1] } 
          },
          verifiedReviews: { 
            $sum: { $cond: ['$isVerifiedBooking', 1, 0] } 
          },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    res.json({
      reviews,
      pagination: {
        currentPage: Number(page),
        totalPages,
        total,
        limit: Number(limit)
      },
      stats: stats[0] || {
        totalReviews: 0,
        approvedReviews: 0,
        pendingReviews: 0,
        verifiedReviews: 0,
        averageRating: 0
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// PATCH /admin/reviews/:reviewId/approve - approve a review
router.patch('/:reviewId/approve', requireAdmin, async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { isApproved: true },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    console.log(`✅ Review approved: ${reviewId} for tour ${review.tourSlug}`);
    res.json({ success: true, review });
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({ error: 'Failed to approve review' });
  }
});

// PATCH /admin/reviews/:reviewId/reject - reject/hide a review
router.patch('/:reviewId/reject', requireAdmin, async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { isApproved: false },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    console.log(`❌ Review rejected: ${reviewId} for tour ${review.tourSlug}`);
    res.json({ success: true, review });
  } catch (error) {
    console.error('Error rejecting review:', error);
    res.status(500).json({ error: 'Failed to reject review' });
  }
});

// DELETE /admin/reviews/:reviewId - delete a review
router.delete('/:reviewId', requireAdmin, async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findByIdAndDelete(reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    console.log(`🗑️ Review deleted: ${reviewId} for tour ${review.tourSlug}`);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// GET /admin/reviews/analytics - get review analytics
router.get('/analytics', requireAdmin, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get review analytics
    const analytics = await Review.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $facet: {
          // Rating distribution
          ratingDistribution: [
            {
              $group: {
                _id: '$rating',
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: -1 } }
          ],
          // Reviews by tour
          tourReviews: [
            {
              $group: {
                _id: '$tourSlug',
                tourTitle: { $first: '$tourTitle' },
                count: { $sum: 1 },
                averageRating: { $avg: '$rating' },
                verifiedCount: { 
                  $sum: { $cond: ['$isVerifiedBooking', 1, 0] } 
                }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ],
          // Reviews over time
          timelineData: [
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' },
                  day: { $dayOfMonth: '$createdAt' }
                },
                count: { $sum: 1 },
                averageRating: { $avg: '$rating' }
              }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
          ],
          // Category averages
          categoryAverages: [
            {
              $group: {
                _id: null,
                tourGuide: { $avg: '$categories.tourGuide' },
                cleanliness: { $avg: '$categories.cleanliness' },
                communication: { $avg: '$categories.communication' },
                value: { $avg: '$categories.value' },
                organization: { $avg: '$categories.organization' }
              }
            }
          ]
        }
      }
    ]);

    // Format rating distribution
    const ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    analytics[0].ratingDistribution.forEach((item: { _id: number; count: number }) => {
      ratingDist[item._id as keyof typeof ratingDist] = item.count;
    });

    res.json({
      ratingDistribution: ratingDist,
      topTours: analytics[0].tourReviews,
      timeline: analytics[0].timelineData,
      categoryAverages: analytics[0].categoryAverages[0] || {
        tourGuide: 0,
        cleanliness: 0,
        communication: 0,
        value: 0,
        organization: 0
      }
    });
  } catch (error) {
    console.error('Error fetching review analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;