import * as React from "react";
import { submitReview, fetchApprovedReviews } from "../api/reviews";
import type { Review } from "../api/reviews";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Award, HeadphonesIcon, Star } from "lucide-react";
import BackToTop from "../components/BackToTop";
import FeaturedVideos from "../components/FeaturedVideos";
import InteractiveHero from "../components/InteractiveHero";
import InteractiveFeatures from "../components/InteractiveFeatures";
import TourCarousel3D from "../components/TourCarousel3D";
import InteractiveStats from "../components/InteractiveStats";

// Hash name function: e.g., "Ron" -> "R*n", "Sarah" -> "S***h"
function hashName(name: string): string {
  if (!name || name.length <= 2) return name;
  const firstChar = name[0];
  const lastChar = name[name.length - 1];
  const middleStars = '*'.repeat(name.length - 2);
  return `${firstChar}${middleStars}${lastChar}`;
}

// Get tour title from slug
function getTourTitle(slug: string): string {
  const tourMap: Record<string, string> = {
    'route-a-preferred': 'Route A Preferred',
    'route-b-classic': 'Route B Classic',
    'route-c-premium': 'Route C Premium',
    'mediterranean-grand-tour': 'Mediterranean Grand Tour',
  };
  return tourMap[slug] || slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

export default function Home() {
  const [recentBooking, setRecentBooking] = React.useState<{
    customerName: string;
    tourSlug: string;
    timeAgo: string;
  } | null>(null);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = React.useState(false);
  const [reviewForm, setReviewForm] = React.useState({
    name: '',
    rating: 5,
    comment: '',
  });
  const [reviewSubmitting, setReviewSubmitting] = React.useState(false);
  const [reviewSuccess, setReviewSuccess] = React.useState(false);

  // Load recent booking notification
  React.useEffect(() => {
    const loadRecentBooking = async () => {
      try {
        const { fetchRecentBookingNotification } = await import("../api/bookings");
        const booking = await fetchRecentBookingNotification();
        if (booking) {
          setRecentBooking(booking);
        }
      } catch (err) {
        console.warn('Could not load recent booking:', err);
      }
    };
    loadRecentBooking();
    
    // Refresh every 2 minutes
    const interval = setInterval(loadRecentBooking, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Load approved reviews
  React.useEffect(() => {
    const loadReviews = async () => {
      try {
        const reviewsData = await fetchApprovedReviews();
        setReviews(reviewsData);
      } catch (err) {
        console.warn('Could not load reviews:', err);
      }
    };
    loadReviews();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewSuccess(false);

    try {
      await submitReview({
        name: reviewForm.name,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      
      setReviewSuccess(true);
      setReviewForm({ name: '', rating: 5, comment: '' });
      setShowReviewForm(false);
      
      // Show success message
      setTimeout(() => setReviewSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <main>
      {/* Interactive Hero Section */}
      <InteractiveHero />

      {/* Modern 3D Tour Carousel */}
      <TourCarousel3D />

      {/* Interactive Features Section */}
      <InteractiveFeatures />

      {/* Interactive Statistics Section */}
      <InteractiveStats />

      {/* Featured Videos Section */}
      <FeaturedVideos />

      {/* Trust Signals & Social Proof */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="bg-blue-50 py-12"
      >
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2"
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Shield className="w-8 h-8 text-green-600" />
              </motion.div>
              <div className="text-sm font-medium text-gray-900">100% Secure</div>
              <div className="text-xs text-gray-600">Guaranteed Departures</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2"
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Award className="w-8 h-8 text-yellow-600" />
              </motion.div>
              <div className="text-sm font-medium text-gray-900">Award Winning</div>
              <div className="text-xs text-gray-600">Best Tour Operator 2024</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2"
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <HeadphonesIcon className="w-8 h-8 text-blue-600" />
              </motion.div>
              <div className="text-sm font-medium text-gray-900">24/7 Support</div>
              <div className="text-xs text-gray-600">Expert Travel Assistance</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2"
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Star className="w-8 h-8 text-yellow-500" />
              </motion.div>
              <div className="text-sm font-medium text-gray-900">4.9/5 Rating</div>
              <div className="text-xs text-gray-600">From 2,500+ Reviews</div>
            </motion.div>
          </div>
          
          {/* Recently Booked Notification */}
          {recentBooking && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(34, 197, 94, 0.2)" }}
              className="mt-6 bg-white border-2 border-green-300 rounded-lg p-4 shadow-sm max-w-md mx-auto"
            >
              <div className="flex items-center gap-3">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 h-3 bg-green-500 rounded-full"
                ></motion.div>
                <div className="text-sm text-gray-900 font-medium">
                  <span className="font-semibold text-gray-900">{hashName(recentBooking.customerName)}</span> just booked 
                  <span className="font-semibold text-blue-600"> {getTourTitle(recentBooking.tourSlug)}</span> • <span className="text-gray-600">{recentBooking.timeAgo}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.7 }}
        className="py-20 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-4 text-gray-900"
            >
              What Our Travelers Say
            </motion.h2>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl"
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </motion.button>

            {reviewSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200"
              >
                Thank you! Your review has been submitted and will appear after approval.
              </motion.div>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-2xl mx-auto mb-12"
            >
              <form onSubmit={handleReviewSubmit} className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg border border-gray-200 rounded-2xl p-8 shadow-2xl">
                <div className="mb-6">
                  <label className="block text-gray-900 font-semibold mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-900 font-semibold mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                        whileTap={{ scale: 0.9 }}
                        className="transition-transform"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= reviewForm.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-500'
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-900 font-semibold mb-2">Your Review</label>
                  <textarea
                    required
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
                    placeholder="Share your experience with us..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </motion.div>
          )}

          {/* Reviews Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.length > 0 ? (
              reviews.slice(0, 6).map((review, i) => (
                <motion.div
                  key={review._id || i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:border-gray-300 transition-all"
                >
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${
                          idx < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="italic text-gray-700 mb-4">"{review.comment}"</p>
                  <p className="font-semibold text-gray-900">{review.name}</p>
                  {review.tourTitle && (
                    <p className="text-xs text-slate-400 mt-1">{review.tourTitle}</p>
                  )}
                </motion.div>
              ))
            ) : (
              // Fallback to static testimonials if no reviews yet
              [
                {
                  quote: "An absolutely incredible journey through Europe! Every detail was perfectly planned and executed.",
                  name: "Emma Thompson",
                  rating: 5,
                },
                {
                  quote: "Our guide was phenomenal — truly passionate and knowledgeable. This trip exceeded all expectations!",
                  name: "Michael Chen",
                  rating: 5,
                },
                {
                  quote: "The accommodations were stunning and the itinerary was perfectly paced. Already planning our next adventure!",
                  name: "Isabella Rodriguez",
                  rating: 5,
                },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:border-gray-300 transition-all"
                >
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="italic text-gray-700 mb-4">"{t.quote}"</p>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="bg-gradient-to-br from-blue-900 to-purple-900 py-20"
      >
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-4 text-white"
          >
            Ready for Your European Adventure?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-blue-100 mb-8 max-w-xl mx-auto"
          >
            Start planning your dream European journey today. Expert guidance, 
            guaranteed departures, and unforgettable experiences await.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/contact"
              className="inline-block px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold rounded-full shadow-lg hover:from-yellow-500 hover:to-yellow-600 hover:shadow-xl transition"
            >
              Contact Us
            </Link>
          </motion.div>
        </div>
      </motion.section>
      <BackToTop />
    </main>
  );
}
