import * as React from "react";
import { fetchTours } from "../api/tours";
import { toggleFavorite, getFavorites } from "../api/favorites";
import { fetchRecentBookingNotification } from "../api/bookings";
import { submitReview, fetchApprovedReviews } from "../api/reviews";
import { useAuth } from "../context/useAuth";
import type { Tour } from "../types";
import type { Review } from "../api/reviews";
import TourCard from "../components/TourCard";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Map, Users, CheckCircle, Shield, Award, HeadphonesIcon, Star } from "lucide-react";
import CountUp from "react-countup";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { EnhancedSearch } from "../components/EnhancedSearch";
import { SkeletonCard } from "../components/LoadingComponents";
import { NetworkError } from "../components/ErrorComponents";
import { getHomepageSettings, getHomepageSettingsSync } from "../services/homepageSettings";
import BackToTop from "../components/BackToTop";
import FeaturedVideos from "../components/FeaturedVideos";

import "swiper/css";
import "swiper/css/pagination";

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
  const [tours, setTours] = React.useState<Tour[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [homepageSettings, setHomepageSettings] = React.useState(getHomepageSettingsSync());
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
  const { user } = useAuth();

  // Load homepage settings from API
  React.useEffect(() => {
    getHomepageSettings().then(settings => {
      setHomepageSettings(settings);
    }).catch(err => {
      console.error('Failed to load homepage settings:', err);
    });
  }, []);

  // Load user's favorites when component mounts
  React.useEffect(() => {
    if (user) {
      getFavorites()
        .then(data => setFavorites(data.favorites))
        .catch(err => console.warn('Could not load favorites:', err));
    }
  }, [user]);

  // Load recent booking notification
  React.useEffect(() => {
    const loadRecentBooking = async () => {
      try {
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

  React.useEffect(() => {
    let cancelled = false;
    
    const loadTours = async () => {
      try {
        setLoading(true);
        setError(null);
        const toursData = await fetchTours();
        if (!cancelled) {
          setTours(toursData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load tours');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadTours();
    
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRetryTours = () => {
    setTours([]);
    setError(null);
    fetchTours().then(setTours).catch(() => setError('Failed to load tours'));
  };

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
      {/* Hero Section - Enhanced */}
      <section className="relative bg-gradient-to-br from-blue-50 via-blue-100 to-purple-50 text-gray-900 py-20 overflow-hidden min-h-[75vh] flex items-center justify-center">
        {/* Animated Background with Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-blue-100/50 via-transparent to-purple-100/30"
            animate={{ 
              backgroundPosition: ["0% 0%", "100% 100%"],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Floating Geometric Shapes */}
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-yellow-300/10 rounded-full blur-3xl"
            animate={{ 
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-40 h-40 bg-blue-300/15 rounded-full blur-3xl"
            animate={{ 
              x: [0, -80, 0],
              y: [0, -60, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-24 h-24 bg-purple-300/15 rounded-full blur-2xl"
            animate={{ 
              x: [0, 60, 0],
              y: [0, -40, 0]
            }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="backdrop-blur-xl bg-white/95 border border-gray-200 rounded-3xl shadow-2xl p-8 md:p-12 flex flex-col items-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-lg text-center leading-tight text-gray-900"
            >
              Experience the Magic of <br />
              <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent inline-block mt-2">European Adventures</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-center text-gray-700 leading-relaxed"
            >
              Join thousands of travelers exploring Europe's most stunning destinations — 
              expert guides, guaranteed departures, and memories that last a lifetime.
            </motion.p>
            
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-full max-w-2xl mx-auto"
            >
              <EnhancedSearch 
                placeholder="Where do you want to go?"
                className="w-full rounded-full bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-yellow-300/50 shadow-2xl px-6 py-4 text-lg"
                tours={tours}
              />
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-10 grid grid-cols-3 gap-6 md:gap-12 w-full max-w-2xl"
            >
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">30K+</div>
                <div className="text-xs md:text-sm text-gray-700 mt-1">Happy Travelers</div>
              </div>
              <div className="text-center border-x border-gray-300">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">75+</div>
                <div className="text-xs md:text-sm text-gray-700 mt-1">Tour Packages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">4.9★</div>
                <div className="text-xs md:text-sm text-gray-700 mt-1">Customer Rating</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-gray-600 rounded-full"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Featured Videos Section */}
      <FeaturedVideos />

      {/* Trust Signals & Social Proof */}
      <section className="bg-blue-50 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-2"
            >
              <Shield className="w-8 h-8 text-green-600" />
              <div className="text-sm font-medium text-gray-900">100% Secure</div>
              <div className="text-xs text-gray-600">Guaranteed Departures</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-2"
            >
              <Award className="w-8 h-8 text-yellow-600" />
              <div className="text-sm font-medium text-gray-900">Award Winning</div>
              <div className="text-xs text-gray-600">Best Tour Operator 2024</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-2"
            >
              <HeadphonesIcon className="w-8 h-8 text-blue-600" />
              <div className="text-sm font-medium text-gray-900">24/7 Support</div>
              <div className="text-xs text-gray-600">Expert Travel Assistance</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-2"
            >
              <Star className="w-8 h-8 text-yellow-500" />
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
              className="mt-6 bg-white border-2 border-green-300 rounded-lg p-4 shadow-sm max-w-md mx-auto"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="text-sm text-gray-900 font-medium">
                  <span className="font-semibold text-gray-900">{hashName(recentBooking.customerName)}</span> just booked 
                  <span className="font-semibold text-blue-600"> {getTourTitle(recentBooking.tourSlug)}</span> • <span className="text-gray-600">{recentBooking.timeAgo}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-12 text-center">
          {[
            { label: "Happy Travelers", value: homepageSettings.statistics.travelers, suffix: "+" },
            { label: "Tour Packages", value: homepageSettings.statistics.packages, suffix: "+" },
            { label: "Average Rating", value: homepageSettings.statistics.rating, suffix: "★" },
            { label: "Destinations", value: homepageSettings.statistics.destinations, suffix: "+" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="p-6"
            >
              <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                <CountUp end={stat.value} duration={3} separator="," decimals={stat.label === "Average Rating" ? 1 : 0} />
                {stat.suffix}
              </h3>
              <p className="text-gray-700 mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-12 text-gray-900"
          >
            Why Travel with Us?
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Map className="w-10 h-10 text-blue-600 mx-auto" />,
                title: "Customizable Itineraries",
                desc: "Tailor-made routes designed to match your travel style and preferences.",
              },
              {
                icon: <Users className="w-10 h-10 text-purple-600 mx-auto" />,
                title: "Professional Guides",
                desc: "Passionate local experts bringing history and culture to life.",
              },
              {
                icon: <CheckCircle className="w-10 h-10 text-green-600 mx-auto" />,
                title: "Guaranteed Excellence",
                desc: "25+ years delivering exceptional European travel experiences.",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03, rotate: 1 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:border-gray-300 transition-all"
              >
                {f.icon}
                <h3 className="font-semibold text-lg mt-4 text-gray-900">{f.title}</h3>
                <p className="text-gray-700 mt-2">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Routes Carousel */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Routes
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto rounded-full mb-4"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our most popular European adventures, handpicked for unforgettable experiences
            </p>
          </motion.div>
          
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          )}

          {error && (
            <NetworkError onRetry={handleRetryTours} />
          )}

          {!loading && !error && tours.length > 0 && (
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              pagination={{ 
                clickable: true,
                dynamicBullets: true,
              }}
              autoplay={{ 
                delay: 5000, 
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              breakpoints={{
                640: { slidesPerView: 1, spaceBetween: 20 },
                768: { slidesPerView: 2, spaceBetween: 24 },
                1024: { slidesPerView: 3, spaceBetween: 30 },
              }}
              className="featured-routes-swiper !pb-16"
            >
              {tours.slice(0, 6).map((tour, index) => (
                <SwiperSlide key={tour.id} data-slide-id={tour.id}>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8 }}
                    className="h-full"
                  >
                    <TourCard 
                      tour={tour} 
                      isWishlisted={favorites.includes(tour.slug)}
                      onWishlist={async (tourSlug) => {
                        if (!user) {
                          alert('Please log in to add favorites');
                          return;
                        }
                        try {
                          const result = await toggleFavorite(tourSlug);
                          setFavorites(result.favorites);
                          console.log(`${result.action === 'added' ? '❤️ Added to' : '💔 Removed from'} favorites:`, tourSlug);
                        } catch (error) {
                          console.error('Failed to toggle favorite:', error);
                          alert('Failed to update favorites. Please try again.');
                        }
                      }}
                      onShare={(tour) => {
                        console.log('Share tour:', tour.title);
                        // TODO: Implement share functionality
                      }}
                    />
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
          
          {!loading && !error && (
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center mt-16"
            >
              <Link
                to="/routes"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Explore All Routes
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          )}
        </div>

        <style>{`
          .featured-routes-swiper .swiper-pagination {
            bottom: 0 !important;
          }
          
          .featured-routes-swiper .swiper-pagination-bullet {
            width: 12px;
            height: 12px;
            background: #3b82f6;
            opacity: 0.3;
            transition: all 0.3s ease;
          }
          
          .featured-routes-swiper .swiper-pagination-bullet-active {
            opacity: 1;
            width: 32px;
            border-radius: 6px;
            background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
          }
          
          .featured-routes-swiper .swiper-pagination-bullet:hover {
            opacity: 0.7;
            transform: scale(1.2);
          }
        `}</style>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
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
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= reviewForm.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-500'
                          }`}
                        />
                      </button>
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
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-br from-blue-900 to-purple-900 py-20">
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
          >
            <Link
              to="/contact"
              className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold rounded-full shadow-lg hover:from-yellow-500 hover:to-yellow-600 hover:shadow-xl transition"
            >
              Contact Us
            </Link>
          </motion.div>
        </div>
      </section>
      <BackToTop />
    </main>
  );
}
