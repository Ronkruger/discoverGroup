import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import featured videos service
import { fetchFeaturedVideos, type FeaturedVideo } from '../lib/featured-videos-service';

export default function FeaturedVideos() {
  const [videos, setVideos] = useState<FeaturedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const data = await fetchFeaturedVideos();
      setVideos(data);
    } catch (error) {
      console.error('Failed to load featured videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (videos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, 8000); // Change video every 8 seconds

    return () => clearInterval(interval);
  }, [videos.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  if (loading) {
    return (
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 min-h-[600px] flex items-center justify-center">
        <div className="h-96 bg-white/5 rounded-2xl animate-pulse max-w-4xl w-full mx-auto" />
      </section>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  const currentVideo = videos[currentIndex];

  return (
    <section className="relative py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 min-h-[600px] overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentVideo.id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              poster={currentVideo.thumbnail_url}
              key={currentVideo.video_url}
            >
              <source src={currentVideo.video_url} type="video/mp4" />
            </video>
            
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/80" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 3,
            }}
            className="absolute w-1.5 h-1.5 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center justify-center min-h-[500px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
            Experience Our Tours
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto drop-shadow-lg">
            Watch immersive videos from our most popular destinations
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentVideo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl"
          >
            <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl">
              {currentVideo.title}
            </h3>
            {currentVideo.description && (
              <p className="text-lg md:text-xl text-gray-100 drop-shadow-xl leading-relaxed">
                {currentVideo.description}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        {videos.length > 1 && (
          <>
            <div className="flex items-center gap-4 mt-12">
              <button
                onClick={goToPrevious}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition-all duration-300 border border-white/20 hover:scale-110"
                aria-label="Previous video"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="flex gap-2">
                {videos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentIndex
                        ? 'w-12 h-3 bg-blue-500 shadow-lg shadow-blue-500/50'
                        : 'w-3 h-3 bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Go to video ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={goToNext}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition-all duration-300 border border-white/20 hover:scale-110"
                aria-label="Next video"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Auto-playing indicator */}
            <div className="mt-6 flex items-center gap-2 text-white/70 text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>Auto-playing • {currentIndex + 1} of {videos.length}</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
