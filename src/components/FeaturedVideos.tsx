import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';

// Import featured videos service
import { fetchFeaturedVideos, type FeaturedVideo } from '../lib/featured-videos-service';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function FeaturedVideos() {
  const [videos, setVideos] = useState<FeaturedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

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

  const handlePlayPause = (videoId: string, videoElement: HTMLVideoElement) => {
    if (playingVideo === videoId) {
      videoElement.pause();
      setPlayingVideo(null);
    } else {
      // Pause all other videos
      document.querySelectorAll('video').forEach((v) => {
        if (v !== videoElement) v.pause();
      });
      videoElement.play();
      setPlayingVideo(videoId);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="container mx-auto px-4">
          <div className="h-96 bg-white/5 rounded-2xl animate-pulse" />
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <section className="relative py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-10 left-10 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-3xl"
        />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
            className="absolute w-1 h-1 bg-white/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl"
          >
            Experience Our Tours
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-blue-200 max-w-2xl mx-auto drop-shadow-lg"
          >
            Watch immersive videos from our most popular destinations
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 2,
              },
            }}
            className="featured-videos-swiper"
          >
            {videos.map((video) => (
              <SwiperSlide key={video.id}>
                <div className="relative group rounded-2xl overflow-hidden shadow-2xl bg-slate-800 hover:shadow-blue-500/20 transition-shadow duration-300">
                  <div className="relative aspect-video">
                    <video
                      id={`video-${video.id}`}
                      className="w-full h-full object-cover"
                      poster={video.thumbnail_url}
                      loop
                      playsInline
                      onClick={(e) => handlePlayPause(video.id, e.currentTarget)}
                    >
                      <source src={video.video_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>

                    {/* Play/Pause Overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity cursor-pointer"
                      style={{
                        opacity: playingVideo === video.id ? 0 : 1,
                      }}
                      onClick={() => {
                        const videoEl = document.getElementById(
                          `video-${video.id}`
                        ) as HTMLVideoElement;
                        if (videoEl) handlePlayPause(video.id, videoEl);
                      }}
                    >
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-6 group-hover:scale-110 transition-transform shadow-xl">
                        {playingVideo === video.id ? (
                          <Pause className="w-12 h-12 text-blue-600" />
                        ) : (
                          <Play className="w-12 h-12 text-blue-600 ml-1" />
                        )}
                      </div>
                    </div>

                    {/* Gradient Overlay for Text */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6">
                      <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className="text-sm text-gray-200 line-clamp-2 drop-shadow-md">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>

      <style>{`
        .featured-videos-swiper .swiper-button-next,
        .featured-videos-swiper .swiper-button-prev {
          color: white;
          background: rgba(59, 130, 246, 0.3);
          backdrop-filter: blur(10px);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .featured-videos-swiper .swiper-button-next:hover,
        .featured-videos-swiper .swiper-button-prev:hover {
          background: rgba(59, 130, 246, 0.5);
          border-color: rgba(255, 255, 255, 0.4);
          transform: scale(1.1);
        }

        .featured-videos-swiper .swiper-button-next:after,
        .featured-videos-swiper .swiper-button-prev:after {
          font-size: 20px;
        }

        .featured-videos-swiper .swiper-pagination-bullet {
          background: white;
          opacity: 0.4;
          width: 12px;
          height: 12px;
          transition: all 0.3s ease;
        }

        .featured-videos-swiper .swiper-pagination-bullet:hover {
          opacity: 0.7;
          transform: scale(1.2);
        }

        .featured-videos-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: #3b82f6;
          width: 14px;
          height: 14px;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
        }
      `}</style>
    </section>
  );
}
