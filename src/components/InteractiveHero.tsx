import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Globe, Plane, Camera, MapPin, Stars, Play } from 'lucide-react';

interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  description: string;
  coordinates: { x: number; y: number };
}

const destinations: Destination[] = [
  { id: '1', name: 'Paris', country: 'France', image: '/api/placeholder/300/200', description: 'City of Light', coordinates: { x: 25, y: 30 } },
  { id: '2', name: 'Rome', country: 'Italy', image: '/api/placeholder/300/200', description: 'Eternal City', coordinates: { x: 45, y: 45 } },
  { id: '3', name: 'Barcelona', country: 'Spain', image: '/api/placeholder/300/200', description: 'Artistic Wonder', coordinates: { x: 15, y: 55 } },
  { id: '4', name: 'Amsterdam', country: 'Netherlands', image: '/api/placeholder/300/200', description: 'Venice of North', coordinates: { x: 35, y: 20 } },
  { id: '5', name: 'Prague', country: 'Czech Republic', image: '/api/placeholder/300/200', description: 'Golden City', coordinates: { x: 55, y: 25 } },
];

const InteractiveHero: React.FC = () => {
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { scrollY } = useScroll();
  
  const heroImages = [
    '/api/placeholder/1920/1080',
    '/api/placeholder/1920/1081',
    '/api/placeholder/1920/1082',
  ];

  // Parallax effects
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const FloatingElement = ({ children, delay = 0, duration = 4 }: { children: React.ReactNode; delay?: number; duration?: number }) => (
    <motion.div
      animate={{
        y: [0, -20, 0],
        rotate: [0, 5, 0, -5, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Dynamic Background with Image Slideshow */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1.5 }}
            style={{ y: y1 }}
          >
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${heroImages[currentImageIndex]})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Geometric Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingElement delay={0}>
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full backdrop-blur-sm"
            whileHover={{ scale: 1.2, backgroundColor: "rgba(59, 130, 246, 0.3)" }}
          />
        </FloatingElement>
        
        <FloatingElement delay={1}>
          <motion.div
            className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-orange-400/20"
            style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
          />
        </FloatingElement>

        <FloatingElement delay={2} duration={6}>
          <motion.div
            className="absolute bottom-40 left-20 w-40 h-20 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full"
            style={{ transform: 'skew(-20deg)' }}
          />
        </FloatingElement>
      </div>

      {/* Interactive World Map Overlay */}
      <motion.div 
        className="absolute right-10 top-1/2 transform -translate-y-1/2 w-96 h-96 opacity-30 hover:opacity-60 transition-opacity duration-500"
        style={{ y: y2 }}
      >
        <div className="relative w-full h-full">
          <Globe className="w-full h-full text-white/40" />
          
          {/* Interactive Destination Pins */}
          {destinations.map((dest, index) => (
            <motion.div
              key={dest.id}
              className="absolute cursor-pointer group"
              style={{ 
                left: `${dest.coordinates.x}%`, 
                top: `${dest.coordinates.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              whileHover={{ scale: 1.5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedDestination(dest)}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2 }}
            >
              <motion.div
                className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-white shadow-lg"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(251, 191, 36, 0.7)",
                    "0 0 0 10px rgba(251, 191, 36, 0)",
                    "0 0 0 0 rgba(251, 191, 36, 0)"
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              
              {/* Tooltip */}
              <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ y: 10 }}
                whileHover={{ y: 0 }}
              >
                {dest.name}, {dest.country}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Hero Content */}
      <motion.div 
        className="relative z-10 flex items-center justify-center min-h-screen px-6"
        style={{ opacity }}
      >
        <div className="max-w-6xl mx-auto text-center">
          {/* Animated Title */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mb-8"
          >
            <motion.h1 
              className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 leading-none"
              style={{
                background: 'linear-gradient(45deg, #fff, #fbbf24, #f59e0b, #fff)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              DISCOVER
            </motion.h1>
            
            <motion.div
              className="flex items-center justify-center gap-4 text-2xl md:text-4xl text-white/90"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <span>THE WORLD</span>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Globe className="w-8 h-8 md:w-12 md:h-12 text-yellow-400" />
              </motion.div>
              <span>WITH US</span>
            </motion.div>
          </motion.div>

          {/* Interactive Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Embark on extraordinary journeys that transform perspectives, 
            <motion.span
              className="inline-block text-yellow-400 font-semibold mx-2"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              create memories,
            </motion.span>
            and connect you with the world's most incredible destinations
          </motion.p>

          {/* Interactive CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.button
              className="group px-12 py-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg rounded-2xl shadow-2xl overflow-hidden relative"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 25px 50px -12px rgba(251, 191, 36, 0.5)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                layoutId="button-bg"
              />
              <span className="relative z-10 flex items-center gap-3">
                Start Your Adventure
                <Plane className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>

            <motion.button
              className="group px-12 py-6 bg-transparent border-2 border-white/50 text-white font-bold text-lg rounded-2xl backdrop-blur-sm overflow-hidden relative"
              whileHover={{ 
                scale: 1.05,
                borderColor: "rgba(255, 255, 255, 0.8)",
                backgroundColor: "rgba(255, 255, 255, 0.1)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <span className="relative z-10 flex items-center gap-3">
                Watch Our Story
                <motion.div
                  animate={{ rotate: isPlaying ? 0 : 360 }}
                  transition={{ duration: 0.3 }}
                >
                  <Play className="w-6 h-6" fill={isPlaying ? "currentColor" : "none"} />
                </motion.div>
              </span>
            </motion.button>
          </motion.div>

          {/* Floating Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {[
              { icon: MapPin, number: "150+", label: "Destinations" },
              { icon: Camera, number: "50K+", label: "Happy Travelers" },
              { icon: Stars, number: "4.9", label: "Average Rating" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center group cursor-pointer"
                whileHover={{ scale: 1.1, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="inline-flex p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4"
                  whileHover={{ backgroundColor: "rgba(251, 191, 36, 0.2)" }}
                >
                  <stat.icon className="w-8 h-8 text-yellow-400" />
                </motion.div>
                <motion.div
                  className="text-3xl font-bold text-white mb-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-white/70 text-sm uppercase tracking-wide">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/60"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm uppercase tracking-wider">Scroll to Explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent" />
        </div>
      </motion.div>

      {/* Destination Modal */}
      <AnimatePresence>
        {selectedDestination && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedDestination(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedDestination.image} 
                alt={selectedDestination.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedDestination.name}
                </h3>
                <p className="text-gray-600 mb-4">{selectedDestination.country}</p>
                <p className="text-gray-700 mb-6">{selectedDestination.description}</p>
                <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 rounded-xl font-semibold hover:from-orange-500 hover:to-yellow-400 transition-all duration-300">
                  Explore Tours
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default InteractiveHero;