import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchTourBySlug } from "../api/tours";
import type { Tour } from "../types";
import { 
  MapPin, Users, Clock, Heart, Share2, 
  ChevronRight, Check, Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import BackToTop from "../components/BackToTop";
import TourReviews from "../components/TourReviews";

export default function TourDetailNew() {
  const { slug } = useParams<{ slug: string }>();
  const [tour, setTour] = useState<Tour | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [passengers, setPassengers] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    
    const loadTour = async () => {
      try {
        const data = await fetchTourBySlug(slug);
        setTour(data);
      } catch (error) {
        console.error("Failed to load tour:", error);
      }
    };
    
    loadTour();
  }, [slug]);

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading tour details...</div>
      </div>
    );
  }

  const images: string[] = (tour.galleryImages || tour.images || []) as string[];
  const regularPrice = tour.regularPricePerPerson || 0;
  const promoPrice = tour.promoPricePerPerson;
  const displayPrice = promoPrice && promoPrice < regularPrice ? promoPrice : regularPrice;

  // Format departure dates
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    // If looks like a range, return as-is
    if (/[-–—]/.test(dateStr) && dateStr.split(/[-–—]/).length >= 2) {
      return dateStr;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return dateStr;
    }
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get departure dates
  const departureDates = tour.departureDates || [];
  const hasDepartureDates = departureDates.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white border-b"
      >
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/routes" className="hover:text-gray-900 transition-colors">Tours</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{tour.title}</span>
          </nav>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-col lg:flex-row items-start lg:justify-between gap-4 mb-4">
            <div className="flex-1 w-full">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{tour.title}</h1>
              <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{tour.line || "Multiple Destinations"}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 w-full lg:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 lg:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900"
              >
                <Heart className={`w-5 h-5 transition-all ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="text-sm font-medium">Save</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 lg:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-medium">Share</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Image Gallery Grid */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-2 h-[250px] lg:h-[400px] mb-8 rounded-xl overflow-hidden"
        >
          {/* Main large image */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="col-span-1 lg:col-span-2 lg:row-span-2 relative group cursor-pointer overflow-hidden"
          >
            <img
              src={images[0] || "/image.png"}
              alt={tour.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
          </motion.div>
          
          {/* Smaller images */}
          {images.slice(1, 5).map((img, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="hidden lg:block relative group cursor-pointer overflow-hidden"
            >
              <img
                src={img}
                alt={`${tour.title} ${idx + 2}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
              {idx === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <button className="text-white font-semibold hover:scale-110 transition-transform">
                    Show all {images.length} photos
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Content - 2 columns */}
          <div className="col-span-1 lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Host Info */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.01 }}
              className="border-b pb-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                    Tour hosted by Discover Group
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-2 text-sm lg:text-base text-gray-600">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="flex items-center gap-1"
                    >
                      <Users className="w-4 h-4" />
                      <span>2-15 guests</span>
                    </motion.div>
                    <span>•</span>
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="flex items-center gap-1"
                    >
                      <Clock className="w-4 h-4" />
                      <span>{tour.durationDays} days</span>
                    </motion.div>
                    <span>•</span>
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="flex items-center gap-1"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Multiple countries</span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* About */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.01 }}
              className="border-b pb-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">About this tour</h3>
              <p className="text-gray-700 leading-relaxed">{tour.summary}</p>
            </motion.div>

            {/* What this place offers */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="border-b pb-6"
            >
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">What this tour offers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                {tour.highlights?.slice(0, 6).map((highlight, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + idx * 0.1 }}
                    whileHover={{ x: 5, scale: 1.02 }}
                    className="flex items-center gap-3"
                  >
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">{highlight}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Itinerary */}
            {tour.itinerary && tour.itinerary.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="border-b pb-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Daily Itinerary</h3>
                <div className="space-y-4">
                  {tour.itinerary.map((day, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.9 + idx * 0.1 }}
                      whileHover={{ x: 5, scale: 1.01 }}
                      className="flex gap-4"
                    >
                      <motion.div 
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="flex-shrink-0 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-gray-900"
                      >
                        {day.day}
                      </motion.div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{day.title}</h4>
                        <p className="text-gray-600 text-sm">{day.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* House Rules / Tour Policies */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 1.0 }}
              whileHover={{ scale: 1.01 }}
              className="border-b pb-6"
            >
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">Things to know</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.1 }}
                  whileHover={{ y: -5 }}
                >
                  <h4 className="font-semibold text-gray-900 mb-3">Check-in / Departure</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <motion.div 
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Flexible departure dates</span>
                    </motion.div>
                    <motion.div 
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Group booking available</span>
                    </motion.div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.2 }}
                  whileHover={{ y: -5 }}
                >
                  <h4 className="font-semibold text-gray-900 mb-3">Cancellation Policy</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <motion.div 
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Free cancellation 30 days before</span>
                    </motion.div>
                    <motion.div 
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Flexible payment options</span>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar - Booking Card */}
          <div className="col-span-1 lg:order-last order-first">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
              className="lg:sticky lg:top-24 border border-gray-300 rounded-xl p-4 lg:p-6 shadow-xl bg-white"
            >
              {/* Price */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="mb-6"
              >
                <div className="flex items-baseline gap-2">
                  <motion.span 
                    whileHover={{ scale: 1.05 }}
                    className="text-3xl font-bold text-gray-900"
                  >
                    ₱{displayPrice.toLocaleString()}
                  </motion.span>
                  <span className="text-gray-600">/ person</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Total price for {tour.durationDays} day tour
                </p>
                {promoPrice && promoPrice < regularPrice && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    className="flex items-center gap-2 mt-1"
                  >
                    <span className="text-sm text-gray-500 line-through">
                      ₱{regularPrice.toLocaleString()}
                    </span>
                    <motion.span 
                      whileHover={{ scale: 1.1 }}
                      className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium"
                    >
                      Save ₱{(regularPrice - promoPrice).toLocaleString()}
                    </motion.span>
                  </motion.div>
                )}
              </motion.div>

              {/* Flipbook Link - Always visible with prominent styling */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mb-4 p-3 bg-blue-50 border-2 border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <a
                  href={tour.bookingPdfUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  onClick={(e) => {
                    if (!tour.bookingPdfUrl) {
                      e.preventDefault();
                      alert("Flipbook coming soon! Contact us for tour details.");
                    }
                  }}
                >
                  <motion.svg 
                    whileHover={{ rotate: 15 }}
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </motion.svg>
                  View Tour Flipbook
                </a>
              </motion.div>

              {/* Dates Selection */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                className="mb-4"
              >
                {hasDepartureDates ? (
                  <div className="border border-gray-300 rounded-lg p-4">
                    <label className="text-xs font-semibold text-gray-900 block mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Available Dates
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {departureDates.map((date, idx) => {
                        // Match the format used in Booking.tsx dropdown
                        const dateValue = typeof date === 'string' 
                          ? date 
                          : `${(date as { start: string; end: string }).start} - ${(date as { start: string; end: string }).end}`;
                        const displayDateStr = typeof date === 'string' 
                          ? formatDate(date)
                          : `${formatDate((date as { start: string; end: string }).start)} - ${formatDate((date as { start: string; end: string }).end)}`;
                        
                        return (
                          <motion.button
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.9 + (idx * 0.05) }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedDate(dateValue)}
                            className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
                              selectedDate === dateValue
                                ? 'border-gray-900 bg-gray-50 font-semibold'
                                : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            <div className="text-sm text-gray-900">{displayDateStr}</div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg p-4">
                    <label className="text-xs font-semibold text-gray-900 block mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Departure Date
                    </label>
                    <p className="text-sm text-gray-600">Contact us for available dates</p>
                  </div>
                )}
              </motion.div>

              {/* Guests */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.0 }}
                className="mb-6"
              >
                <div className="border border-gray-300 rounded-lg p-3">
                  <label className="text-xs font-semibold text-gray-900 block mb-1">
                    Guests
                  </label>
                  <div className="flex items-center justify-between">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setPassengers(Math.max(1, passengers - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors text-gray-900"
                    >
                      -
                    </motion.button>
                    <motion.span 
                      key={passengers}
                      initial={{ scale: 1.2, opacity: 0.5 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="text-gray-900 font-medium"
                    >
                      {passengers} guest{passengers > 1 ? 's' : ''}
                    </motion.span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setPassengers(Math.min(15, passengers + 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors text-gray-900"
                    >
                      +
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Reserve Button */}
              {hasDepartureDates ? (
                selectedDate ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={`/booking/${slug}`}
                      state={{ tour, passengers, perPerson: displayPrice, selectedDate }}
                      className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold py-3 rounded-lg transition-all block text-center mb-4"
                    >
                      Reserve
                    </Link>
                  </motion.div>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1.1 }}
                    disabled
                    className="w-full bg-gray-300 text-gray-500 font-semibold py-3 rounded-lg cursor-not-allowed block text-center mb-4 relative"
                    title="Please select a departure date first"
                  >
                    <span>Select a Date to Reserve</span>
                  </motion.button>
                )
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={`/booking/${slug}`}
                    state={{ tour, passengers, perPerson: displayPrice, selectedDate }}
                    className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold py-3 rounded-lg transition-all block text-center mb-4"
                  >
                    Reserve
                  </Link>
                </motion.div>
              )}

              {!selectedDate && hasDepartureDates && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.2 }}
                  className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2 text-sm text-yellow-800"
                >
                  <motion.svg 
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 1.5, repeat: 2 }}
                    className="w-5 h-5 flex-shrink-0 mt-0.5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </motion.svg>
                  <span>Please select a departure date from the available dates above to continue with your reservation.</span>
                </motion.div>
              )}

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 1.3 }}
                className="text-center text-sm text-gray-600 mb-4"
              >
                You won't be charged yet
              </motion.p>

              {/* Price Breakdown */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.4 }}
                className="space-y-3 pt-4 border-t"
              >
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1.5 }}
                  className="flex justify-between text-gray-700"
                >
                  <span>₱{displayPrice.toLocaleString()} x {passengers} guest{passengers > 1 ? 's' : ''}</span>
                  <motion.span
                    key={`price-${displayPrice * passengers}`}
                    initial={{ scale: 1.2, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    ₱{(displayPrice * passengers).toLocaleString()}
                  </motion.span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1.6 }}
                  className="flex justify-between text-gray-700"
                >
                  <span className="underline">Service fee</span>
                  <span>₱0</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.7 }}
                  className="flex justify-between font-semibold text-gray-900 pt-3 border-t"
                >
                  <span>Total</span>
                  <motion.span
                    key={`total-${displayPrice * passengers}`}
                    initial={{ scale: 1.3, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-lg"
                  >
                    ₱{(displayPrice * passengers).toLocaleString()}
                  </motion.span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Map Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 border-t pt-12"
        >
          <motion.h3 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 mb-4"
          >
            Where you'll be
          </motion.h3>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.01 }}
            className="w-full h-[400px] bg-gray-200 rounded-xl flex items-center justify-center"
          >
            <div className="text-gray-500">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <MapPin className="w-12 h-12 mx-auto mb-2" />
              </motion.div>
              <p>Map showing tour locations</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Reviews Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 border-t pt-12"
        >
          <TourReviews tourSlug={tour.slug} tourTitle={tour.title} />
        </motion.div>
      </div>

      <BackToTop />
    </div>
  );
}
