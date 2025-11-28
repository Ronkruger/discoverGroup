import express from 'express';
import Review from '../../models/Review';
import Booking from '../../models/Booking';
import { requireAuth, AuthenticatedRequest } from '../../middleware/auth';

const router = express.Router();

// GET /api/reviews/tour/:tourSlug - get reviews for a specific tour
router.get('/tour/:tourSlug', async (req, res) => {
  try {
    const { tourSlug } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt' } = req.query;
    
    const reviews = await Review.find({ 
      tourSlug, 
      isApproved: true 
    })
    .sort({ [sortBy as string]: -1 })
    .limit(Number(limit) * Number(page))
    .skip((Number(page) - 1) * Number(limit))
    .populate('userId', 'name email');

    // Calculate tour statistics
    const allTourReviews = await Review.find({ tourSlug, isApproved: true });
    const totalReviews = allTourReviews.length;
    
    if (totalReviews === 0) {
      return res.json({
        reviews: [],
        stats: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          categoryAverages: {
            tourGuide: 0,
            cleanliness: 0,
            communication: 0,
            value: 0,
            organization: 0
          }
        },
        pagination: {
          currentPage: Number(page),
          totalPages: 0,
          totalReviews: 0
        }
      });
    }

    // Calculate statistics
    const totalRating = allTourReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / totalReviews;

    // Rating distribution
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allTourReviews.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    // Category averages
    const categoryTotals = {
      tourGuide: 0,
      cleanliness: 0,
      communication: 0,
      value: 0,
      organization: 0
    };

    allTourReviews.forEach(review => {
      if (review.categories) {
        categoryTotals.tourGuide += review.categories.tourGuide || 0;
        categoryTotals.cleanliness += review.categories.cleanliness || 0;
        categoryTotals.communication += review.categories.communication || 0;
        categoryTotals.value += review.categories.value || 0;
        categoryTotals.organization += review.categories.organization || 0;
      }
    });

    const categoryAverages = {
      tourGuide: categoryTotals.tourGuide / totalReviews,
      cleanliness: categoryTotals.cleanliness / totalReviews,
      communication: categoryTotals.communication / totalReviews,
      value: categoryTotals.value / totalReviews,
      organization: categoryTotals.organization / totalReviews
    };

    const totalPages = Math.ceil(totalReviews / Number(limit));

    res.json({
      reviews,
      stats: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingDistribution,
        categoryAverages: Object.keys(categoryAverages).reduce((acc, key) => {
          acc[key] = Math.round(categoryAverages[key as keyof typeof categoryAverages] * 10) / 10;
          return acc;
        }, {} as Record<string, number>)
      },
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalReviews
      }
    });
  } catch (error) {
    console.error('Error fetching tour reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /api/reviews - create a new review (requires authentication)
router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      tourSlug,
      tourTitle,
      rating,
      comment,
      categories,
      photos,
      bookingId
    } = req.body;

    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const userName = req.user?.name || req.user?.fullName;

    // Verify user has a completed booking for this tour
    let isVerifiedBooking = false;
    if (bookingId) {
      const booking = await Booking.findOne({
        bookingId,
        customerEmail: userEmail,
        tourSlug,
        status: 'completed'
      });
      isVerifiedBooking = !!booking;
    }

    // Check if user already reviewed this tour
    const existingReview = await Review.findOne({
      tourSlug,
      $or: [
        { userId },
        { userEmail }
      ]
    });

    if (existingReview) {
      return res.status(400).json({ 
        error: 'You have already reviewed this tour. You can only submit one review per tour.' 
      });
    }

    const review = await Review.create({
      name: userName,
      userEmail,
      userId,
      bookingId,
      tourSlug,
      tourTitle,
      rating,
      comment,
      categories: categories || {
        tourGuide: rating,
        cleanliness: rating,
        communication: rating,
        value: rating,
        organization: rating
      },
      photos: photos || [],
      isVerifiedBooking,
      isApproved: isVerifiedBooking // Auto-approve verified bookings
    });

    console.log(`📝 New review created for ${tourSlug} by ${userName} (${isVerifiedBooking ? 'verified' : 'unverified'})`);

    res.status(201).json({
      success: true,
      review,
      message: isVerifiedBooking 
        ? 'Thank you for your review! It has been published.'
        : 'Thank you for your review! It will be published after moderation.'
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// PUT /api/reviews/:reviewId/helpful - mark review as helpful
router.put('/:reviewId/helpful', async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { helpfulVotes: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ success: true, helpfulVotes: review.helpfulVotes });
  } catch (error) {
    console.error('Error updating helpful votes:', error);
    res.status(500).json({ error: 'Failed to update helpful votes' });
  }
});

// GET /api/reviews/user/eligibility/:tourSlug - check if user can review this tour
router.get('/user/eligibility/:tourSlug', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { tourSlug } = req.params;
    const userEmail = req.user?.email;
    const userId = req.user?.id;

    // Check if user already reviewed this tour
    const existingReview = await Review.findOne({
      tourSlug,
      $or: [
        { userId },
        { userEmail }
      ]
    });

    if (existingReview) {
      return res.json({
        canReview: false,
        reason: 'already_reviewed',
        message: 'You have already reviewed this tour'
      });
    }

    // Check if user has completed booking for this tour
    const completedBooking = await Booking.findOne({
      customerEmail: userEmail,
      tourSlug,
      status: 'completed'
    });

    if (completedBooking) {
      return res.json({
        canReview: true,
        isVerified: true,
        bookingId: completedBooking.bookingId,
        message: 'You can write a verified review for this tour'
      });
    }

    // Check if user has any booking for this tour
    const anyBooking = await Booking.findOne({
      customerEmail: userEmail,
      tourSlug
    });

    if (anyBooking) {
      return res.json({
        canReview: true,
        isVerified: false,
        bookingId: anyBooking.bookingId,
        message: 'You can write a review for this tour (pending verification)'
      });
    }

    res.json({
      canReview: true,
      isVerified: false,
      message: 'You can write a review for this tour'
    });
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    res.status(500).json({ error: 'Failed to check review eligibility' });
  }
});

// GET /api/reviews/user/my-reviews - get current user's reviews
router.get('/user/my-reviews', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    const reviews = await Review.find({
      $or: [
        { userId },
        { userEmail }
      ]
    }).sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: 'Failed to fetch user reviews' });
  }
});

export default router;