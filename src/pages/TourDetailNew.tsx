import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchTourBySlug } from "../api/tours";
import type { Tour } from "../types";
import { 
  MapPin, Users, Clock, Heart, Share2, 
  Star, ChevronRight, Check, Calendar
} from "lucide-react";
import BackToTop from "../components/BackToTop";

export default function TourDetailNew() {
  const { slug } = useParams<{ slug: string }>();
  const [tour, setTour] = useState<Tour | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [passengers, setPassengers] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    
    const loadTour = async () => {
      try {
        const data = await fetchTourBySlug(slug);
        setTour(data);
      } catch (error) {
        console.error("Failed to load tour:", error);
      }
    };
    
    loadTour();
  }, [slug]);

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading tour details...</div>
      </div>
    );
  }

  const images = tour.galleryImages || tour.images || [];
  const regularPrice = tour.regularPricePerPerson || 0;
  const promoPrice = tour.promoPricePerPerson;
  const displayPrice = promoPrice && promoPrice < regularPrice ? promoPrice : regularPrice;

  // Format departure dates
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    // If looks like a range, return as-is
    if (/[-–—]/.test(dateStr) && dateStr.split(/[-–—]/).length >= 2) {
      return dateStr;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return dateStr;
    }
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get departure dates
  const departureDates = tour.departureDates || [];
  const hasDepartureDates = departureDates.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/tours" className="hover:text-gray-900">Tours</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{tour.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{tour.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{tour.line || "Multiple Destinations"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">4.8</span>
                  <span>(120 reviews)</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="text-sm font-medium">Save</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Image Gallery Grid */}
        <div className="grid grid-cols-4 gap-2 h-[500px] mb-8 rounded-xl overflow-hidden">
          {/* Main large image */}
          <div className="col-span-2 row-span-2 relative group cursor-pointer">
            <img
              src={images[0] || "/image.png"}
              alt={tour.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
          
          {/* Smaller images */}
          {images.slice(1, 5).map((img, idx) => (
            <div key={idx} className="relative group cursor-pointer">
              <img
                src={img}
                alt={`${tour.title} ${idx + 2}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              {idx === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <button className="text-white font-semibold">
                    Show all {images.length} photos
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-8">
          {/* Left Content - 2 columns */}
          <div className="col-span-2 space-y-8">
            {/* Host Info */}
            <div className="border-b pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Tour hosted by Discover Group
                  </h2>
                  <div className="flex items-center gap-4 mt-2 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>2-15 guests</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{tour.durationDays} days</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>Multiple countries</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="border-b pb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About this tour</h3>
              <p className="text-gray-700 leading-relaxed">{tour.summary}</p>
            </div>

            {/* What this place offers */}
            <div className="border-b pb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">What this tour offers</h3>
              <div className="grid grid-cols-2 gap-4">
                {tour.highlights?.slice(0, 6).map((highlight, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Itinerary */}
            {tour.itinerary && tour.itinerary.length > 0 && (
              <div className="border-b pb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Daily Itinerary</h3>
                <div className="space-y-4">
                  {tour.itinerary.map((day, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-gray-900">
                        {day.day}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{day.title}</h4>
                        <p className="text-gray-600 text-sm">{day.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* House Rules / Tour Policies */}
            <div className="border-b pb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Things to know</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Check-in / Departure</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Flexible departure dates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Group booking available</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Cancellation Policy</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Free cancellation 30 days before</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Flexible payment options</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                <h3 className="text-xl font-bold text-gray-900">4.8 · 120 reviews</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Cleanliness</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-900" style={{ width: '95%' }} />
                    </div>
                    <span className="text-sm font-medium">4.9</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Communication</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-900" style={{ width: '92%' }} />
                    </div>
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Booking Card */}
          <div className="col-span-1">
            <div className="sticky top-24 border border-gray-300 rounded-xl p-6 shadow-xl bg-white">
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ₱{displayPrice.toLocaleString()}
                  </span>
                  <span className="text-gray-600">/ person</span>
                </div>
                {promoPrice && promoPrice < regularPrice && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500 line-through">
                      ₱{regularPrice.toLocaleString()}
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      Save ₱{(regularPrice - promoPrice).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Dates Selection */}
              <div className="mb-4">
                {hasDepartureDates ? (
                  <div className="border border-gray-300 rounded-lg p-4">
                    <label className="text-xs font-semibold text-gray-900 block mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Available Dates
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {departureDates.map((date, idx) => {
                        const dateValue = typeof date === 'string' ? date : JSON.stringify(date);
                        const displayDateStr = typeof date === 'string' 
                          ? formatDate(date)
                          : `${formatDate((date as { start: string; end: string }).start)} - ${formatDate((date as { start: string; end: string }).end)}`;
                        
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedDate(dateValue)}
                            className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
                              selectedDate === dateValue
                                ? 'border-gray-900 bg-gray-50 font-semibold'
                                : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            <div className="text-sm text-gray-900">{displayDateStr}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg p-4">
                    <label className="text-xs font-semibold text-gray-900 block mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Departure Date
                    </label>
                    <p className="text-sm text-gray-600">Contact us for available dates</p>
                  </div>
                )}
              </div>

              {/* Guests */}
              <div className="mb-6">
                <div className="border border-gray-300 rounded-lg p-3">
                  <label className="text-xs font-semibold text-gray-900 block mb-1">
                    Guests
                  </label>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setPassengers(Math.max(1, passengers - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-gray-900 font-medium">{passengers} guest{passengers > 1 ? 's' : ''}</span>
                    <button
                      onClick={() => setPassengers(Math.min(15, passengers + 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Reserve Button */}
              <Link
                to={`/booking/${slug}`}
                state={{ tour, passengers, perPerson: displayPrice, selectedDate }}
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold py-3 rounded-lg transition-all block text-center mb-4"
              >
                Reserve
              </Link>

              <p className="text-center text-sm text-gray-600 mb-4">
                You won't be charged yet
              </p>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between text-gray-700">
                  <span className="underline">₱{displayPrice.toLocaleString()} x {passengers} guest{passengers > 1 ? 's' : ''}</span>
                  <span>₱{(displayPrice * passengers).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="underline">Service fee</span>
                  <span>₱0</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 pt-3 border-t">
                  <span>Total</span>
                  <span>₱{(displayPrice * passengers).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 border-t pt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Where you'll be</h3>
          <div className="w-full h-[400px] bg-gray-200 rounded-xl flex items-center justify-center">
            <div className="text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2" />
              <p>Map showing tour locations</p>
            </div>
          </div>
        </div>
      </div>

      <BackToTop />
    </div>
  );
}
