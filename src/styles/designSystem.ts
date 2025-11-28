/**
 * Centralized Design System
 * Consistent colors, spacing, and component styles across the application
 */

export const colors = {
  // Primary - Yellow/Gold (Brand Color)
  primary: {
    DEFAULT: 'from-yellow-400 to-yellow-500',
    hover: 'from-yellow-500 to-yellow-600',
    light: 'bg-yellow-50',
    text: 'text-yellow-600',
  },
  
  // Secondary - Blue
  secondary: {
    DEFAULT: 'from-blue-500 to-blue-600',
    hover: 'from-blue-600 to-blue-700',
    light: 'bg-blue-50',
    text: 'text-blue-600',
  },
  
  // Accent - Pink/Red (CTAs)
  accent: {
    DEFAULT: 'from-pink-500 to-red-500',
    hover: 'from-pink-600 to-red-600',
    light: 'bg-pink-50',
    text: 'text-pink-600',
  },
  
  // Neutral
  neutral: {
    background: 'bg-gray-50',
    card: 'bg-white',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textMuted: 'text-gray-600',
  },
} as const;

export const spacing = {
  section: 'py-12 lg:py-20',
  container: 'container mx-auto px-4 lg:px-6',
  card: 'p-4 lg:p-6',
  cardGap: 'gap-4 lg:gap-6',
} as const;

export const typography = {
  h1: 'text-3xl lg:text-4xl xl:text-5xl font-bold',
  h2: 'text-2xl lg:text-3xl xl:text-4xl font-bold',
  h3: 'text-xl lg:text-2xl font-bold',
  h4: 'text-lg lg:text-xl font-semibold',
  body: 'text-base lg:text-lg',
  small: 'text-sm lg:text-base',
} as const;

export const buttons = {
  primary: 'px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5',
  secondary: 'px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5',
  accent: 'px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5',
  outline: 'px-6 py-3 border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl transition-all shadow-md hover:shadow-lg',
  ghost: 'px-6 py-3 hover:bg-gray-100 text-gray-900 font-semibold rounded-xl transition-all',
} as const;

export const cards = {
  default: 'bg-white border-2 border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all',
  elevated: 'bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1',
  glass: 'bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg border border-gray-200 rounded-xl shadow-xl',
} as const;

export const inputs = {
  default: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all',
  error: 'w-full px-4 py-3 border-2 border-red-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all',
} as const;

export const badges = {
  yellow: 'inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 border-2 border-yellow-200 rounded-full text-xs font-semibold',
  blue: 'inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 border-2 border-blue-200 rounded-full text-xs font-semibold',
  green: 'inline-flex items-center px-3 py-1 bg-green-100 text-green-800 border-2 border-green-200 rounded-full text-xs font-semibold',
  red: 'inline-flex items-center px-3 py-1 bg-red-100 text-red-800 border-2 border-red-200 rounded-full text-xs font-semibold',
  gray: 'inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 border-2 border-gray-200 rounded-full text-xs font-semibold',
} as const;

export const layouts = {
  page: 'min-h-screen bg-gray-50',
  section: 'py-12 lg:py-20',
  container: 'container mx-auto px-4 lg:px-6',
  grid2: 'grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6',
  grid3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6',
  grid4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6',
} as const;

export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  scaleIn: 'animate-scale-in',
} as const;

// Helper function to combine classes
export const cn = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(' ');
};
