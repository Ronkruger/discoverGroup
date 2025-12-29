import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Camera, 
  Shield, 
  Users, 
  ArrowRight
} from 'lucide-react';

interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  stats: string;
  image: string;
}

const features: Feature[] = [
  {
    id: 'expert-guides',
    icon: <Users className="w-8 h-8" />,
    title: 'Expert Local Guides',
    description: 'Connect with passionate locals who bring destinations to life through authentic stories and hidden gems.',
    color: 'from-blue-500 to-cyan-500',
    stats: '500+ Certified Guides',
    image: '/api/placeholder/400/300'
  },
  {
    id: 'instant-booking',
    icon: <Zap className="w-8 h-8" />,
    title: 'Instant Confirmation',
    description: 'Book your dream trip in seconds with our advanced booking system and get instant confirmation.',
    color: 'from-purple-500 to-pink-500',
    stats: '< 30 Second Booking',
    image: '/api/placeholder/400/301'
  },
  {
    id: 'safety-first',
    icon: <Shield className="w-8 h-8" />,
    title: 'Safety Guarantee',
    description: 'Travel with confidence knowing we prioritize your safety with 24/7 support and comprehensive insurance.',
    color: 'from-green-500 to-emerald-500',
    stats: '99.9% Safety Record',
    image: '/api/placeholder/400/302'
  },
  {
    id: 'photo-memories',
    icon: <Camera className="w-8 h-8" />,
    title: 'Memory Capture',
    description: 'Professional photographers document your journey, ensuring every magical moment is preserved forever.',
    color: 'from-orange-500 to-red-500',
    stats: '10,000+ Photos Taken',
    image: '/api/placeholder/400/303'
  }
];



const InteractiveFeatures: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<string>(features[0].id);
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const activeFeatureData = features.find(f => f.id === activeFeature) || features[0];

  return (
    <section ref={ref} className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), 
                             radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%), 
                             radial-gradient(circle at 40% 80%, #06b6d4 0%, transparent 50%)`
          }}
          animate={{
            background: [
              `radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), 
               radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%), 
               radial-gradient(circle at 40% 80%, #06b6d4 0%, transparent 50%)`,
              `radial-gradient(circle at 80% 30%, #3b82f6 0%, transparent 50%), 
               radial-gradient(circle at 20% 70%, #8b5cf6 0%, transparent 50%), 
               radial-gradient(circle at 60% 20%, #06b6d4 0%, transparent 50%)`,
              `radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), 
               radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%), 
               radial-gradient(circle at 40% 80%, #06b6d4 0%, transparent 50%)`
            ]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={controls}
        className="max-w-7xl mx-auto px-6 relative z-10"
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-center mb-20">
          <motion.div
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white mb-6"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
          >
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-medium uppercase tracking-wider">Why Choose Us</span>
          </motion.div>

          <motion.h2
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            variants={itemVariants}
          >
            Experience The
            <motion.span
              className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ backgroundSize: '200% 200%' }}
            >
              Difference
            </motion.span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed"
          >
            Discover what makes our tours extraordinary through innovative features 
            designed to create unforgettable travel experiences
          </motion.p>
        </motion.div>

        {/* Interactive Features Grid */}
        <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Feature Cards */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                className={`group cursor-pointer p-6 rounded-2xl border transition-all duration-500 ${
                  activeFeature === feature.id
                    ? 'bg-white/10 backdrop-blur-sm border-white/30 shadow-2xl'
                    : 'bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20'
                }`}
                onClick={() => setActiveFeature(feature.id)}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    className={`p-3 rounded-xl bg-gradient-to-br ${feature.color}`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {feature.icon}
                  </motion.div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                        {feature.title}
                      </h3>
                      <motion.div
                        animate={{ x: activeFeature === feature.id ? 5 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ArrowRight className="w-5 h-5 text-white/60" />
                      </motion.div>
                    </div>
                    
                    <p className="text-white/70 text-sm leading-relaxed mb-3">
                      {feature.description}
                    </p>
                    
                    <motion.div
                      className={`inline-block text-sm font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${feature.color} text-white`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {feature.stats}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Active Feature Display */}
          <motion.div
            className="relative rounded-3xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10"
            layout
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="relative h-80 lg:h-96"
              >
                <img
                  src={activeFeatureData.image}
                  alt={activeFeatureData.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <motion.div
                  className="absolute bottom-6 left-6 right-6"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div
                    className={`inline-block p-2 rounded-xl bg-gradient-to-br ${activeFeatureData.color} mb-4`}
                    animate={{ rotate: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {activeFeatureData.icon}
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {activeFeatureData.title}
                  </h3>
                  
                  <p className="text-white/80 text-sm">
                    {activeFeatureData.description}
                  </p>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default InteractiveFeatures;