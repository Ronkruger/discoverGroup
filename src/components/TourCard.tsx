import * as React from "react";
import type { Tour } from "../types";
import { Link } from "react-router-dom";
import { Heart, MapPin, Users, Clock, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface TourCardProps {
  tour: Tour;
  onWishlist?: (tourId: string, isWishlisted: boolean) => void;
  onShare?: (tour: Tour) => void;
  isWishlisted?: boolean;
}

// Type guards for unknown properties
const isNumber = (value: unknown): value is number => typeof value === 'number';
const isStringArray = (value: unknown): value is string[] => 
  Array.isArray(value) && value.every(item => typeof item === 'string');

export default function TourCard({ 
  tour, 
  onWishlist,
  isWishlisted = false
}: TourCardProps) {
  const [wishlistState, setWishlistState] = useState(isWishlisted);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = !wishlistState;
    setWishlistState(newState);
    onWishlist?.(tour.slug, newState);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % (tour.images?.length || 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? (tour.images?.length || 1) - 1 : prev - 1
    );
  };

  // Type-safe property access
  const regularPrice = isNumber(tour.regularPricePerPerson) ? tour.regularPricePerPerson : undefined;
  const promoPrice = isNumber(tour.promoPricePerPerson) ? tour.promoPricePerPerson : undefined;
  const price = isNumber(tour.price) ? tour.price : undefined;
  const rating = isNumber(tour.rating) ? tour.rating : undefined;
  const countries = isStringArray(tour.countries) ? tour.countries : undefined;

  // Sale logic
  const now = new Date();
  const saleIsActive = tour.isSaleEnabled && tour.saleEndDate && new Date(tour.saleEndDate) > now;

  // Only show promo price if sale is active
  const hasPromoPrice = saleIsActive && promoPrice && regularPrice && promoPrice < regularPrice;
  const displayPrice = hasPromoPrice ? promoPrice : (regularPrice || price);
  const originalPrice = hasPromoPrice ? regularPrice : undefined;

  const currentImage = tour.images?.[currentImageIndex] ?? "/image.png";

  // Get tour category or type
  const tourCategory = tour.line || "Tour Package";

  // Count number of countries
  const countryCount = countries?.length || 1;

  return (
    <Link 
      to={`/tour/${tour.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 w-full h-[520px] flex flex-col"
      role="article"
      aria-labelledby={`tour-title-${tour.slug}`}
    >
      {/* Image Section with Carousel */}
      <div className="relative h-64 overflow-hidden bg-gray-100">
        <img
          src={currentImage}
          alt={tour.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Category Badge - Top Left */}
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-white px-3 py-1 rounded-md text-xs font-medium text-gray-800 shadow-md">
            {tourCategory}
          </span>
        </div>

        {/* Wishlist Heart - Top Right */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-all duration-200 hover:scale-110 ${
            wishlistState 
              ? 'bg-red-500 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
          aria-label={wishlistState ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-5 h-5 ${wishlistState ? 'fill-current' : ''}`} />
        </button>

        {/* Image Navigation Arrows */}
        {tour.images && tour.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>

            {/* Image Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {tour.images.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentImageIndex 
                      ? 'w-6 bg-white' 
                      : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Logo/Brand (if applicable) */}
        {tour.images && tour.images.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center shadow-sm">
              <Globe className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        {/* Title */}
        <h3 
          id={`tour-title-${tour.slug}`}
          className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors"
        >
          {tour.title}
        </h3>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="text-sm">
            {countries && countries.length > 0 
              ? countries.slice(0, 2).join(', ') + (countries.length > 2 ? '...' : '')
              : 'Multiple Destinations'}
          </span>
        </div>

        {/* Property-style Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
          {/* Participants */}
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{tour.durationDays ? '2-15' : '2'}</span>
          </div>

          {/* Duration/Days */}
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{tour.durationDays || 'N/A'}</span>
          </div>

          {/* Countries */}
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{countryCount}</span>
          </div>

          {/* Square meters equivalent - use rating or score */}
          {rating && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="mt-auto">
          <div className="text-xs text-gray-500 mb-1">From</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              ₱{displayPrice?.toLocaleString() || 'N/A'}
            </span>
            <span className="text-sm text-gray-500">/person</span>
          </div>
          {originalPrice && (
            <div className="text-xs text-gray-400 line-through mt-1">
              ₱{originalPrice.toLocaleString()}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            {tour.durationDays} day tour
          </div>
        </div>
      </div>
    </Link>
  );
}