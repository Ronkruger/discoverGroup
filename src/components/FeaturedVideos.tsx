import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Play, Pause } from 'lucide-react';
import { fetchFeaturedVideos, type FeaturedVideo } from '../lib/supabase-featured-videos';
import { motion } from 'framer-motion';

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
    <section className="py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Experience Our Tours
          </h2>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Watch immersive videos from our most popular destinations
          </p>
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
                <div className="relative group rounded-2xl overflow-hidden shadow-2xl bg-slate-800">
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
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-6 group-hover:scale-110 transition-transform">
                        {playingVideo === video.id ? (
                          <Pause className="w-12 h-12 text-blue-600" />
                        ) : (
                          <Play className="w-12 h-12 text-blue-600 ml-1" />
                        )}
                      </div>
                    </div>

                    {/* Gradient Overlay for Text */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className="text-sm text-gray-200 line-clamp-2">
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
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          width: 50px;
          height: 50px;
          border-radius: 50%;
        }

        .featured-videos-swiper .swiper-button-next:after,
        .featured-videos-swiper .swiper-button-prev:after {
          font-size: 20px;
        }

        .featured-videos-swiper .swiper-pagination-bullet {
          background: white;
          opacity: 0.5;
          width: 12px;
          height: 12px;
        }

        .featured-videos-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: #3b82f6;
        }
      `}</style>
    </section>
  );
}
