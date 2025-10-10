import * as React from "react";
import type { Tour } from "../types";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Share2, MapPin, Calendar, Users, Star, CheckCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface TourCardProps {
  tour: Tour;
  onWishlist?: (tourId: string, isWishlisted: boolean) => void;
  onShare?: (tour: Tour) => void;
  isWishlisted?: boolean;
}

// Type guards for unknown properties
const isNumber = (value: unknown): value is number => typeof value === 'number';
const isString = (value: unknown): value is string => typeof value === 'string';
const isStringArray = (value: unknown): value is string[] => 
  Array.isArray(value) && value.every(item => typeof item === 'string');

export default function TourCard({ 
  tour, 
  onWishlist, 
  onShare, 
  isWishlisted = false
}: TourCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [wishlistState, setWishlistState] = useState(isWishlisted);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-rotate images on hover
  useEffect(() => {
    if (!isHovered || !tour.images || tour.images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % tour.images!.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [isHovered, tour.images]);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = !wishlistState;
    setWishlistState(newState);
    onWishlist?.(tour.slug, newState);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(tour);
  };

  // Type-safe property access
  const regularPrice = isNumber(tour.regularPricePerPerson) ? tour.regularPricePerPerson : undefined;
  const promoPrice = isNumber(tour.promoPricePerPerson) ? tour.promoPricePerPerson : undefined;
  const price = isNumber(tour.price) ? tour.price : undefined;
  const rating = isNumber(tour.rating) ? tour.rating : undefined;
  const travelDate = isString(tour.travelDate) ? tour.travelDate : undefined;
  const countries = isStringArray(tour.countries) ? tour.countries : undefined;

  // Calculate pricing display
  const hasPromoPrice = promoPrice && regularPrice && promoPrice < regularPrice;
  const displayPrice = hasPromoPrice ? promoPrice : (regularPrice || price);
  const originalPrice = hasPromoPrice ? regularPrice : undefined;

  // Calculate savings percentage
  const savingsPercent = originalPrice && displayPrice 
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  const currentImage = tour.images?.[currentImageIndex] ?? "/image.png";

  return (
    <article 
      className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-80 flex flex-col cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
      role="article"
      aria-labelledby={`tour-title-${tour.slug}`}
    >
      {/* Background image with overlay */}
      <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105">
        <img
          src={currentImage}
          alt={tour.title}
          className="w-full h-full object-cover transition-opacity duration-500"
          loading="lazy"
        />
        {/* Enhanced gradient for better readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        
        {/* Hover overlay with additional info */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center transform scale-95 group-hover:scale-100 transition-transform">
              <h4 className="font-semibold text-gray-900 mb-2">Quick Preview</h4>
              <div className="flex gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{countries?.[0] || 'Europe'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>Small Group</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="absolute top-3 right-3 flex gap-2 z-20">
        {tour.images && tour.images.length > 1 && (
          <div className="bg-black/50 text-white px-2 py-1 rounded-full text-xs">
            📷 {tour.images.length}
          </div>
        )}
        <button
          onClick={handleWishlistClick}
          className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
            wishlistState 
              ? 'bg-red-500/90 text-white' 
              : 'bg-white/80 text-gray-700 hover:bg-white'
          }`}
          aria-label={wishlistState ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${wishlistState ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={handleShareClick}
          className="p-2 bg-white/80 text-gray-700 rounded-full backdrop-blur-sm hover:bg-white transition-all duration-200 hover:scale-110"
          aria-label="Share tour"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Top badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
        <span className="bg-yellow-400 text-blue-900 text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
          <Clock className="w-3 h-3 inline mr-1" />
          {tour.durationDays} days
        </span>
        {hasPromoPrice && savingsPercent > 0 && (
          <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
            Save {savingsPercent}%
          </span>
        )}
      </div>

      {/* Bottom highlights */}
      <div className="absolute bottom-20 left-3 flex flex-wrap gap-2 z-10">
        <span className="bg-green-600/90 text-white px-2 py-1 rounded text-xs flex items-center gap-1 backdrop-blur-sm">
          <CheckCircle className="w-3 h-3" />
          Guaranteed Departure
        </span>
        <span className="bg-blue-600/90 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
          🗣️ English Guide
        </span>
        {rating && (
          <span className="bg-yellow-500/90 text-white px-2 py-1 rounded text-xs flex items-center gap-1 backdrop-blur-sm">
            <Star className="w-3 h-3 fill-current" />
            {rating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Content overlay */}
      <div className="relative z-10 p-5 flex flex-col justify-end h-full text-white">
        {/* Tour content */}
        <div className="flex flex-col gap-2">
          <h3 
            id={`tour-title-${tour.slug}`}
            className="text-lg font-bold leading-snug drop-shadow-md line-clamp-2"
          >
            {tour.title}
          </h3>
          <p className="text-sm text-gray-200 drop-shadow line-clamp-2">
            {tour.summary}
          </p>
          
          {/* Travel info */}
          <div className="flex items-center gap-4 text-xs text-gray-300 mt-1">
            {travelDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{travelDate}</span>
              </div>
            )}
            {countries && countries.length > 0 && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{countries.slice(0, 2).join(', ')}</span>
                {countries.length > 2 && <span>+{countries.length - 2}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Footer: Enhanced Price + CTA */}
        <div className="flex justify-between items-end mt-4">
          <div className="flex flex-col">
            <div className="text-xs text-gray-300">Starting from</div>
            <div className="flex items-center gap-2">
              {originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  PHP {originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-lg font-bold text-yellow-400">
                PHP {displayPrice?.toLocaleString() || 'N/A'}
              </span>
            </div>
            <div className="text-xs text-gray-300">/person</div>
          </div>

          <Link
            to={`/tour/${tour.slug}`}
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`View details for ${tour.title}`}
          >
            More Info <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Image indicators for multiple images */}
      {tour.images && tour.images.length > 1 && isHovered && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-20">
          {tour.images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentImageIndex(index);
              }}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </article>
  );
}
