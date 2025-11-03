import * as React from "react";
import { fetchTours } from "../api/tours";
import type { Tour } from "../types";
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

import "swiper/css";
import "swiper/css/pagination";

export default function Home() {
  const [tours, setTours] = React.useState<Tour[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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

  return (
    <main>
      {/* Hero Section - Enhanced */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white py-20 overflow-hidden min-h-[75vh] flex items-center justify-center">
        {/* Animated Background with Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-blue-950/50 via-transparent to-blue-800/30"
            animate={{ 
              backgroundPosition: ["0% 0%", "100% 100%"],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Floating Geometric Shapes */}
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"
            animate={{ 
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-40 h-40 bg-yellow-300/10 rounded-full blur-3xl"
            animate={{ 
              x: [0, -80, 0],
              y: [0, -60, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-24 h-24 bg-blue-300/10 rounded-full blur-2xl"
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
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 md:p-12 flex flex-col items-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-lg text-center leading-tight"
            >
              Discover Europe with <br />
              <span className="text-yellow-300 inline-block mt-2">Discover Group</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-center text-white/90 leading-relaxed"
            >
              Explore iconic destinations with our guided tours — 
              guaranteed departures, flexible routes, and unforgettable experiences.
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
                <div className="text-2xl md:text-3xl font-bold text-yellow-300">25K+</div>
                <div className="text-xs md:text-sm text-white/80 mt-1">Happy Travelers</div>
              </div>
              <div className="text-center border-x border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-yellow-300">50+</div>
                <div className="text-xs md:text-sm text-white/80 mt-1">Destinations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-yellow-300">4.9★</div>
                <div className="text-xs md:text-sm text-white/80 mt-1">Average Rating</div>
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
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

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
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-6 bg-white border border-green-200 rounded-lg p-4 shadow-sm max-w-md mx-auto"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="text-sm">
                <span className="font-medium">Maria from Italy</span> just booked 
                <span className="font-medium"> Prague to Vienna Explorer</span> • 3 min ago
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-12 text-center">
          {[
            { label: "Happy Travelers", value: 25000 },
            { label: "Tours Completed", value: 1200 },
            { label: "Years of Experience", value: 20 },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="p-6"
            >
              <h3 className="text-4xl font-bold text-blue-600">
                <CountUp end={stat.value} duration={3} separator="," />
                {stat.label.includes("Years") ? "+" : ""}
              </h3>
              <p className="text-gray-600 mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-12"
          >
            Why Travel with Us?
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Map className="w-10 h-10 text-blue-600 mx-auto" />,
                title: "Flexible Routes",
                desc: "Multiple route options tailored for every traveler.",
              },
              {
                icon: <Users className="w-10 h-10 text-blue-600 mx-auto" />,
                title: "Expert Guides",
                desc: "Knowledgeable guides ensuring unforgettable experiences.",
              },
              {
                icon: <CheckCircle className="w-10 h-10 text-blue-600 mx-auto" />,
                title: "Trusted Service",
                desc: "20+ years of experience with thousands of happy travelers.",
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
                className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition"
              >
                {f.icon}
                <h3 className="font-semibold text-lg mt-4">{f.title}</h3>
                <p className="text-gray-600 mt-2">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Routes Carousel */}
      <section className="container mx-auto px-6 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12 relative inline-block"
        >
          Featured Routes
          <span className="block h-1 w-16 bg-blue-600 mx-auto mt-2 rounded"></span>
        </motion.h2>
        
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            spaceBetween={20}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {tours.slice(0, 6).map((tour) => (
              <SwiperSlide key={tour.id} data-slide-id={tour.id}>
                <motion.div whileHover={{ scale: 1.02 }} className="h-full">
                  <TourCard 
                    tour={tour} 
                    onWishlist={(tourId, isWishlisted) => {
                      console.log('Wishlist action:', tourId, isWishlisted);
                      // TODO: Implement wishlist functionality
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
          <div className="text-center mt-12">
            <Link
              to="/routes"
              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-2 transition"
            >
              Explore all routes →
            </Link>
          </div>
        )}
      </section>

      {/* Interactive Map Preview */}
      <section className="relative bg-gray-100 py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-12"
          >
            Explore Europe at a Glance
          </motion.h2>
          <div className="relative w-full max-w-4xl mx-auto">
            <img
              src="/europe-map.png"
              alt="Europe Map"
              className="w-full rounded-lg shadow-lg"
            />
            {[
              { city: "Paris", top: "40%", left: "35%" },
              { city: "Rome", top: "70%", left: "50%" },
              { city: "Lucerne", top: "55%", left: "42%" },
              { city: "Florence", top: "65%", left: "48%" },
            ].map((point, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 bg-blue-600 rounded-full cursor-pointer group"
                style={{ top: point.top, left: point.left }}
                whileHover={{ scale: 1.5 }}
              >
                <span className="absolute left-6 top-0 bg-white text-sm text-gray-800 px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition">
                  {point.city}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-12"
          >
            What Our Travelers Say
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "The Paris to Rome route was a dream come true. Everything was perfectly organized!",
                name: "Maria G.",
              },
              {
                quote:
                  "Our guide was amazing — so knowledgeable and friendly. Highly recommend Discover Group!",
                name: "John P.",
              },
              {
                quote:
                  "Loved the flexibility and the hotels. Can't wait to book my next trip!",
                name: "Sophia L.",
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="p-6 bg-gray-50 rounded-2xl shadow hover:shadow-md transition"
              >
                <p className="italic text-gray-700 mb-4">“{t.quote}”</p>
                <p className="font-semibold text-gray-900">{t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-gray-100 to-gray-200 py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-4 text-gray-900"
          >
            Ready to Start Your Journey?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-600 mb-8 max-w-xl mx-auto"
          >
            Book your European adventure today with guaranteed departures and
            flexible itineraries.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link
              to="/contact"
              className="px-8 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition"
            >
              Contact Us
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
