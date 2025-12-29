import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  Award, 
  Heart, 
  Globe, 
  Star, 
  Plane,
  TrendingUp,
  Shield
} from 'lucide-react';

interface StatItem {
  id: string;
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
  description: string;
  color: string;
  accent: string;
}

const statsData: StatItem[] = [
  {
    id: 'travelers',
    icon: <Users className="w-8 h-8" />,
    value: 50000,
    suffix: '+',
    label: 'Happy Travelers',
    description: 'Customers who chose us for their dream vacation',
    color: 'from-blue-500 to-cyan-500',
    accent: 'text-blue-400'
  },
  {
    id: 'destinations',
    icon: <MapPin className="w-8 h-8" />,
    value: 150,
    suffix: '+',
    label: 'Destinations',
    description: 'Countries and cities we explore together',
    color: 'from-green-500 to-emerald-500',
    accent: 'text-green-400'
  },
  {
    id: 'rating',
    icon: <Star className="w-8 h-8" />,
    value: 4.9,
    suffix: '/5',
    label: 'Average Rating',
    description: 'Based on thousands of verified reviews',
    color: 'from-yellow-500 to-orange-500',
    accent: 'text-yellow-400'
  },
  {
    id: 'awards',
    icon: <Award className="w-8 h-8" />,
    value: 25,
    suffix: '+',
    label: 'Industry Awards',
    description: 'Recognition for outstanding service',
    color: 'from-purple-500 to-pink-500',
    accent: 'text-purple-400'
  },
  {
    id: 'experience',
    icon: <Globe className="w-8 h-8" />,
    value: 15,
    suffix: ' Years',
    label: 'Experience',
    description: 'Crafting unforgettable travel experiences',
    color: 'from-indigo-500 to-blue-500',
    accent: 'text-indigo-400'
  },
  {
    id: 'satisfaction',
    icon: <Heart className="w-8 h-8" />,
    value: 99,
    suffix: '%',
    label: 'Satisfaction Rate',
    description: 'Customer satisfaction and return rate',
    color: 'from-red-500 to-pink-500',
    accent: 'text-red-400'
  }
];

const AnimatedCounter: React.FC<{ 
  value: number; 
  suffix: string; 
  duration?: number;
  delay?: number;
}> = ({ value, suffix, duration = 2, delay = 0 }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const startTime = Date.now() + (delay * 1000);

      const updateValue = () => {
        const now = Date.now();
        if (now < startTime) {
          requestAnimationFrame(updateValue);
          return;
        }

        const progress = Math.min((now - startTime) / (duration * 1000), 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        
        const currentValue = value * easedProgress;
        
        // Handle decimal values differently
        if (value < 10) {
          setDisplayValue(Math.round(currentValue * 10) / 10);
        } else {
          setDisplayValue(Math.round(currentValue));
        }

        if (progress < 1) {
          requestAnimationFrame(updateValue);
        }
      };

      requestAnimationFrame(updateValue);
    }
  }, [isInView, value, duration, delay]);

  return (
    <span ref={ref} className="font-bold">
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
};

const StatCard: React.FC<{ 
  stat: StatItem; 
  index: number; 
  isHovered: boolean;
  onHover: (id: string | null) => void;
}> = ({ stat, index, isHovered, onHover }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60, rotateX: 45 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.15,
        ease: "easeOut"
      }}
      onMouseEnter={() => onHover(stat.id)}
      onMouseLeave={() => onHover(null)}
      className="group cursor-pointer"
    >
      <motion.div
        className="relative p-8 rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
        whileHover={{ 
          scale: 1.05, 
          y: -10,
          rotateY: 5,
          background: 'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))',
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        {/* Background Glow Effect */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-3xl`}
          initial={{ scale: 0 }}
          whileHover={{ scale: 1 }}
        />

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 bg-gradient-to-r ${stat.color} rounded-full`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Icon */}
        <motion.div
          className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${stat.color} mb-6 relative z-10`}
          whileHover={{ 
            rotate: 10, 
            scale: 1.1,
            boxShadow: "0 20px 40px -12px rgba(0,0,0,0.3)"
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={isHovered ? { 
              rotate: [0, 15, -15, 0],
              scale: [1, 1.2, 1.2, 1]
            } : {}}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            {stat.icon}
          </motion.div>
        </motion.div>

        {/* Counter */}
        <motion.div
          className="relative z-10 mb-4"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
            <AnimatedCounter 
              value={stat.value} 
              suffix={stat.suffix}
              delay={index * 0.2}
            />
          </div>
          
          <motion.h3
            className={`text-xl font-semibold mb-3 ${stat.accent}`}
            whileHover={{ color: "#ffffff" }}
            transition={{ duration: 0.3 }}
          >
            {stat.label}
          </motion.h3>
        </motion.div>

        {/* Description */}
        <motion.p
          className="text-white/70 text-sm leading-relaxed relative z-10"
          whileHover={{ color: "rgba(255,255,255,0.9)" }}
          transition={{ duration: 0.3 }}
        >
          {stat.description}
        </motion.p>

        {/* Hover Overlay Effect */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
    </motion.div>
  );
};

const InteractiveStats: React.FC = () => {
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);
  const controls = useAnimation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  const backgroundVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-black"
    >
      {/* Dynamic Background */}
      <motion.div
        className="absolute inset-0"
        variants={backgroundVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Animated Background Shapes */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className={`absolute rounded-full opacity-10 bg-gradient-to-br ${statsData[i % statsData.length].color}`}
            style={{
              width: `${100 + Math.random() * 200}px`,
              height: `${100 + Math.random() * 200}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(40px)',
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: -50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white mb-6"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium uppercase tracking-wider">Our Impact</span>
          </motion.div>

          <motion.h2
            className="text-5xl md:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-white">Numbers That</span>
            <br />
            <motion.span
              className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent"
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
              Tell Our Story
            </motion.span>
          </motion.h2>

          <motion.p
            className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Every number represents a memory created, a dream fulfilled, and a life enriched through travel
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {statsData.map((stat, index) => (
            <StatCard
              key={stat.id}
              stat={stat}
              index={index}
              isHovered={hoveredStat === stat.id}
              onHover={setHoveredStat}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <motion.p
            className="text-white/70 text-lg mb-8"
            whileHover={{ color: "rgba(255,255,255,0.9)" }}
          >
            Ready to become part of our story?
          </motion.p>
          
          <motion.button
            className="group px-12 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg rounded-2xl relative overflow-hidden"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 25px 50px -12px rgba(251, 191, 36, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              layoutId="cta-bg"
            />
            <span className="relative z-10 flex items-center gap-3">
              Join Our Adventure
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Plane className="w-5 h-5" />
              </motion.div>
            </span>
          </motion.button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="flex justify-center items-center gap-12 mt-16 opacity-60"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 0.6, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {[Shield, Award, Heart].map((Icon, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-3"
              whileHover={{ scale: 1.1, opacity: 1 }}
            >
              <Icon className="w-6 h-6 text-white" />
              <span className="text-white text-sm font-medium">
                {index === 0 ? 'Secure' : index === 1 ? 'Awarded' : 'Trusted'}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default InteractiveStats;