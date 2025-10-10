import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="relative rounded-2xl overflow-hidden shadow-lg h-80 flex flex-col animate-pulse">
    <div className="absolute inset-0 bg-gray-300" />
    <div className="relative z-10 p-5 flex flex-col justify-between h-full">
      <div className="bg-gray-400 h-6 w-16 rounded-full" />
      <div className="flex flex-col gap-2 mt-auto">
        <div className="bg-gray-400 h-6 w-3/4 rounded" />
        <div className="bg-gray-400 h-4 w-full rounded" />
        <div className="bg-gray-400 h-4 w-2/3 rounded" />
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="bg-gray-400 h-4 w-20 rounded" />
        <div className="bg-gray-400 h-8 w-24 rounded-full" />
      </div>
    </div>
  </div>
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = "" 
}) => (
  <div className={`space-y-2 animate-pulse ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div 
        key={i} 
        className={`bg-gray-300 h-4 rounded ${
          i === lines - 1 ? 'w-2/3' : 'w-full'
        }`} 
      />
    ))}
  </div>
);

export const SkeletonImage: React.FC<{ className?: string }> = ({ className = "w-full h-48" }) => (
  <div className={`bg-gray-300 animate-pulse rounded ${className}`} />
);

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className = "" 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`inline-block animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`} />
  );
};

export const LoadingPage: React.FC<{ message?: string }> = ({ 
  message = "Loading amazing tours..." 
}) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <LoadingSpinner size="lg" />
    <p className="text-gray-600 text-lg">{message}</p>
  </div>
);