import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchTours } from '../api/tours';
import type { Tour } from '../types';
import { Tag, Clock, Calendar, Star, TrendingDown, Zap, Gift } from 'lucide-react';
import TourCard from '../components/TourCard';

export default function Deals() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDealType, setSelectedDealType] = useState<string>('all');

  useEffect(() => {
    const loadTours = async () => {
      try {
        setLoading(true);
        const allTours = await fetchTours();
        setTours(allTours);
      } catch (error) {
        console.error('Failed to load tours:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTours();
  }, []);

  // Filter tours that have deals (promo price different from regular price)
  const toursWithDeals = tours.filter(
    (tour) => 
      tour.promoPricePerPerson && 
      tour.regularPricePerPerson &&
      tour.promoPricePerPerson < tour.regularPricePerPerson
  );

  // Calculate savings
  const toursWithSavings = toursWithDeals.map((tour) => ({
    ...tour,
    savings: (tour.regularPricePerPerson || 0) - (tour.promoPricePerPerson || 0),
    savingsPercent: Math.round(
      (((tour.regularPricePerPerson || 0) - (tour.promoPricePerPerson || 0)) / (tour.regularPricePerPerson || 1)) * 100
    ),
  }));

  // Sort by biggest savings
  const sortedDeals = [...toursWithSavings].sort((a, b) => b.savingsPercent - a.savingsPercent);

  // Featured deals (top 3)
  const featuredDeals = sortedDeals.slice(0, 3);

  // Early bird deals (tours with departure dates far in advance)
  const earlyBirdDeals = toursWithSavings.filter((tour) => {
    if (!tour.departureDates || tour.departureDates.length === 0) return false;
    const firstDep = tour.departureDates[0];
    const firstDate = typeof firstDep === 'string' 
      ? new Date(firstDep.split('-')[0].trim())
      : new Date(firstDep.start);
    const monthsAway = (firstDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
    return monthsAway > 3;
  });

  // Last minute deals (tours departing soon)
  const lastMinuteDeals = toursWithSavings.filter((tour) => {
    if (!tour.departureDates || tour.departureDates.length === 0) return false;
    const firstDep = tour.departureDates[0];
    const firstDate = typeof firstDep === 'string'
      ? new Date(firstDep.split('-')[0].trim())
      : new Date(firstDep.start);
    const daysAway = (firstDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysAway > 0 && daysAway <= 60;
  });

  const dealTypes = [
    { id: 'all', label: 'All Deals', icon: <Tag className="w-4 h-4" /> },
    { id: 'featured', label: 'Featured', icon: <Star className="w-4 h-4" /> },
    { id: 'early-bird', label: 'Early Bird', icon: <Calendar className="w-4 h-4" /> },
    { id: 'last-minute', label: 'Last Minute', icon: <Clock className="w-4 h-4" /> },
  ];

  const getFilteredDeals = () => {
    switch (selectedDealType) {
      case 'featured':
        return featuredDeals;
      case 'early-bird':
        return earlyBirdDeals;
      case 'last-minute':
        return lastMinuteDeals;
      default:
        return sortedDeals;
    }
  };

  const filteredDeals = getFilteredDeals();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-5 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <div className="inline-block mb-6">
              <span className="bg-white text-red-600 px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider animate-bounce flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Hot Deals
                <Zap className="w-4 h-4" />
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              🎉 Exclusive Travel Deals
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 mb-8">
              Save up to 30% on our most popular European tours. Limited time offers!
            </p>
            {toursWithDeals.length > 0 && (
              <div className="flex flex-wrap justify-center gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold">{toursWithDeals.length}</div>
                  <div className="text-orange-100">Tours on Sale</div>
                </div>
                <div>
                  <div className="text-4xl font-bold">
                    {Math.max(...toursWithSavings.map((t) => t.savingsPercent))}%
                  </div>
                  <div className="text-orange-100">Max Discount</div>
                </div>
                <div>
                  <div className="text-4xl font-bold">
                    PHP {Math.max(...toursWithSavings.map((t) => t.savings)).toLocaleString()}
                  </div>
                  <div className="text-orange-100">Max Savings</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Deal Type Filter */}
      <section className="bg-white border-b border-gray-200 sticky top-20 z-40 shadow-sm">
        <div className="container mx-auto px-5 py-4">
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            {dealTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedDealType(type.id)}
                className={`px-4 py-2.5 sm:px-6 sm:py-3 rounded-full font-semibold transition-all flex items-center gap-2 text-sm sm:text-base min-h-[44px] ${
                  selectedDealType === type.id
                    ? 'bg-red-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.icon}
                <span className="hidden sm:inline">{type.label}</span>
                <span className="sm:hidden">{type.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Deals Grid */}
      <section className="container mx-auto px-5 py-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading amazing deals...</p>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="text-center py-20">
            <Gift className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {selectedDealType === 'all' ? 'No Deals Available' : `No ${dealTypes.find(t => t.id === selectedDealType)?.label} Deals`}
            </h2>
            <p className="text-gray-600 mb-8">
              Check back soon for new exciting offers, or browse all our tours
            </p>
            <Link
              to="/routes"
              className="inline-block px-8 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg"
            >
              Browse All Tours
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {selectedDealType === 'all'
                  ? `${filteredDeals.length} Amazing Deals Waiting for You`
                  : dealTypes.find((t) => t.id === selectedDealType)?.label + ' Deals'}
              </h2>
              <p className="text-xl text-gray-600">
                Book now and save big on your European adventure
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDeals.map((tour, index) => (
                <div
                  key={tour.id}
                  className="relative group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Discount Badge */}
                  <div className="absolute top-4 left-4 z-20 bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Save {tour.savingsPercent}%
                  </div>

                  {/* Savings Badge */}
                  <div className="absolute top-4 right-4 z-20 bg-green-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                    -PHP {tour.savings.toLocaleString()}
                  </div>

                  <TourCard tour={tour} />
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Why Book Now Section */}
      <section className="bg-gradient-to-r from-orange-50 to-red-50 py-16">
        <div className="container mx-auto px-5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Why Book These Deals Now?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="text-5xl mb-4">⏰</div>
                <h3 className="text-2xl font-bold mb-3">Limited Time Only</h3>
                <p className="text-gray-600 leading-relaxed">
                  These special prices won't last forever. Book now to lock in your savings before prices go back up.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold mb-3">Best Price Guarantee</h3>
                <p className="text-gray-600 leading-relaxed">
                  We guarantee you're getting the best price available. Find it cheaper elsewhere? We'll match it.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-2xl font-bold mb-3">Flexible Booking</h3>
                <p className="text-gray-600 leading-relaxed">
                  Book with confidence. Flexible cancellation and rescheduling options available on all tours.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="text-5xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold mb-3">Same Great Quality</h3>
                <p className="text-gray-600 leading-relaxed">
                  Lower price doesn't mean lower quality. Enjoy the same premium experience at a fraction of the cost.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-16">
        <div className="container mx-auto px-5 text-center">
          <h2 className="text-4xl font-bold mb-6">Never Miss a Deal!</h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about exclusive offers and flash sales
          </p>
          <div className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/50"
            />
            <button className="px-8 py-4 bg-white text-red-600 rounded-xl font-bold hover:bg-orange-50 transition-all shadow-lg">
              Subscribe
            </button>
          </div>
          <p className="text-sm text-orange-200 mt-4">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </main>
  );
}
