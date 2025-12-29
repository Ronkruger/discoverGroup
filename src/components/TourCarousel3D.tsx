import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, Clock, Star, Heart } from 'lucide-react';
import { fetchFeaturedTours } from '../api/tours';
import { fetchTourReviewStats } from '../api/reviews';
import { Link } from 'react-router-dom';
import type { Tour } from '../types';

interface TourCard {
  id: string;
  slug: string;
  title: string;
  destination: string;
  duration: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
  highlights: string[];
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  category: string;
}

// Helper to convert Tour to TourCard
const convertToTourCard = async (tour: Tour): Promise<TourCard> => {
  const countriesArray = tour.additionalInfo?.countriesVisited;
  let countries = 'Multiple Destinations';
  
  if (Array.isArray(countriesArray) && countriesArray.length > 0) {
    countries = countriesArray.join(' & ');
  }
  
  const price = tour.regularPricePerPerson 
    ? `₱${Math.round(tour.regularPricePerPerson).toLocaleString()}`
    : tour.promoPricePerPerson 
      ? `₱${Math.round(tour.promoPricePerPerson).toLocaleString()}`
      : 'Contact for pricing';
  
  // Fetch actual review stats for this tour
  const reviewStats = await fetchTourReviewStats(tour.slug);
  
  return {
    id: tour.id,
    slug: tour.slug,
    title: tour.title,
    destination: countries,
    duration: `${tour.durationDays} Days`,
    price,
    rating: reviewStats.averageRating || 0,
    reviews: reviewStats.totalReviews || 0,
    image: tour.images?.[0] || '/api/placeholder/400/500',
    highlights: (tour.highlights || []).slice(0, 3),
    difficulty: tour.durationDays > 12 ? 'Challenging' : tour.durationDays > 7 ? 'Moderate' : 'Easy',
    category: tour.category || tour.line || 'Tour'
  };
};


const TourCard3D: React.FC<{ 
  tour: TourCard; 
  onFavorite: (id: string) => void; 
  favorites: string[] 
}> = ({ tour, onFavorite, favorites }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'from-green-400 to-emerald-500';
      case 'Moderate': return 'from-yellow-400 to-orange-500';
      case 'Challenging': return 'from-red-400 to-pink-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-300 w-full max-w-sm mx-auto"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
    >
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={tour.image}
          alt={tour.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFavorite(tour.id);
          }}
          className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-sm rounded-full border border-white/20 hover:bg-black/60 transition-colors z-10"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              favorites.includes(tour.id) ? 'fill-red-500 text-red-500' : 'text-white'
            }`}
          />
        </button>

        {/* Category Badge */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-xs font-medium">
          {tour.category}
        </div>

        {/* Difficulty Badge */}
        <div
          className={`absolute bottom-4 left-4 px-3 py-1 bg-gradient-to-r ${getDifficultyColor(tour.difficulty)} rounded-full text-white text-xs font-bold shadow-lg`}
        >
          {tour.difficulty}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
            {tour.title}
          </h3>
          
          <div className="flex flex-col gap-2 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">{tour.destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>{tour.duration}</span>
            </div>
          </div>

          {tour.rating > 0 && tour.reviews > 0 ? (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-white font-medium">{tour.rating.toFixed(1)}</span>
              </div>
              <span className="text-white/60 text-sm">({tour.reviews} {tour.reviews === 1 ? 'review' : 'reviews'})</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-white/60 text-sm">No reviews yet</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <span className="text-2xl font-bold text-yellow-400">
            {tour.price}
          </span>
          
          <Link
            to={`/tour/${tour.slug}`}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const TourCarousel3D: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [tours, setTours] = useState<TourCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch actual tours from API
  useEffect(() => {
    const loadTours = async () => {
      try {
        setLoading(true);
        const featuredTours = await fetchFeaturedTours(5);
        const convertedTours = await Promise.all(featuredTours.map(tour => convertToTourCard(tour)));
        setTours(convertedTours);
      } catch (error) {
        console.error('Failed to load featured tours:', error);
        // Keep empty array if fetch fails
        setTours([]);
      } finally {
        setLoading(false);
      }
    };
    loadTours();
  }, []);

  useEffect(() => {
    if (!autoPlay || tours.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tours.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay, tours.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + tours.length) % tours.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % tours.length);
  };

  const handleFavorite = (tourId: string) => {
    setFavorites(prev => 
      prev.includes(tourId) 
        ? prev.filter(id => id !== tourId)
        : [...prev, tourId]
    );
  };

  if (loading) {
    return (
      <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"
          />
          <p className="text-white text-xl">Loading Featured Tours...</p>
        </div>
      </section>
    );
  }

  if (tours.length === 0) {
    return (
      <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-4">No Featured Tours Available</h2>
          <p className="text-white/70">Check back soon for exciting destinations!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-slate-900 to-black">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1, 1.4, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-5xl md:text-7xl font-bold text-white mb-6"
            animate={{
              backgroundImage: [
                'linear-gradient(45deg, #fff, #fbbf24)',
                'linear-gradient(45deg, #fbbf24, #f59e0b)',
                'linear-gradient(45deg, #f59e0b, #fff)',
              ],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Featured Tours
          </motion.h2>
          
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Immerse yourself in our handpicked collection of extraordinary journeys
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative px-12">
          {/* Visible Tours Grid */}
          <div className="overflow-hidden">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              animate={{ x: -currentIndex * (100 / tours.length) + '%' }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {tours.map((tour) => (
                <TourCard3D
                  key={tour.id}
                  tour={tour}
                  onFavorite={handleFavorite}
                  favorites={favorites}
                />
              ))}
            </motion.div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex >= tours.length - 3}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <motion.div
          className="flex items-center justify-center gap-6 mt-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* Indicators */}
          <div className="flex gap-3">
            {tours.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-yellow-400 w-8' : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Auto-play Toggle */}
        <motion.div
          className="flex justify-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={`px-6 py-3 backdrop-blur-sm border rounded-full text-sm font-medium transition-all duration-300 ${
              autoPlay 
                ? 'bg-yellow-400/20 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/30' 
                : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
            }`}
          >
            {autoPlay ? 'Pause Auto-Play' : 'Start Auto-Play'}
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default TourCarousel3D;