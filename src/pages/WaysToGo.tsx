import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plane, Ship, Train, Bus, Car, Users, Calendar, MapPin, ArrowRight } from 'lucide-react';

export default function WaysToGo() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const travelOptions = [
    {
      id: 'guided-tours',
      icon: <Users className="w-12 h-12" />,
      title: 'Guided Tours',
      description: 'Travel with expert local guides and enjoy hassle-free experiences with planned itineraries.',
      features: ['Expert Guides', 'All-Inclusive', 'Group Travel', 'Cultural Insights'],
      gradient: 'from-blue-500 to-blue-700',
      category: 'guided'
    },
    {
      id: 'independent-travel',
      icon: <MapPin className="w-12 h-12" />,
      title: 'Independent Travel',
      description: 'Explore at your own pace with self-guided itineraries and flexible schedules.',
      features: ['Full Flexibility', 'Self-Paced', 'Custom Routes', 'Budget Friendly'],
      gradient: 'from-purple-500 to-purple-700',
      category: 'independent'
    },
    {
      id: 'small-group',
      icon: <Users className="w-12 h-12" />,
      title: 'Small Group Tours',
      description: 'Intimate experiences with small groups of 12-20 travelers for personalized attention.',
      features: ['Max 20 People', 'Personal Touch', 'Quality Time', 'Social Experience'],
      gradient: 'from-green-500 to-green-700',
      category: 'guided'
    },
    {
      id: 'family-tours',
      icon: <Users className="w-12 h-12" />,
      title: 'Family Adventures',
      description: 'Kid-friendly itineraries designed for families with activities for all ages.',
      features: ['Kid-Friendly', 'Family Bonding', 'Educational', 'Safe & Fun'],
      gradient: 'from-orange-500 to-orange-700',
      category: 'guided'
    },
    {
      id: 'luxury-travel',
      icon: <Plane className="w-12 h-12" />,
      title: 'Luxury Experiences',
      description: 'Premium accommodations, first-class transportation, and exclusive experiences.',
      features: ['5-Star Hotels', 'VIP Treatment', 'Private Tours', 'Gourmet Dining'],
      gradient: 'from-yellow-500 to-yellow-700',
      category: 'luxury'
    },
    {
      id: 'adventure-tours',
      icon: <MapPin className="w-12 h-12" />,
      title: 'Adventure Tours',
      description: 'Active travel with hiking, biking, and outdoor activities for thrill-seekers.',
      features: ['Active Travel', 'Outdoor Activities', 'Physical Challenge', 'Nature Immersion'],
      gradient: 'from-red-500 to-red-700',
      category: 'adventure'
    },
    {
      id: 'rail-journeys',
      icon: <Train className="w-12 h-12" />,
      title: 'Rail Journeys',
      description: 'Scenic train routes across Europe with comfortable travel and breathtaking views.',
      features: ['Scenic Routes', 'Comfortable Travel', 'City Connections', 'Eco-Friendly'],
      gradient: 'from-indigo-500 to-indigo-700',
      category: 'transport'
    },
    {
      id: 'cruise-tours',
      icon: <Ship className="w-12 h-12" />,
      title: 'River Cruises',
      description: 'Explore European rivers with luxurious cruise ships and port excursions.',
      features: ['River Views', 'All-Inclusive', 'Multiple Destinations', 'Relaxing'],
      gradient: 'from-cyan-500 to-cyan-700',
      category: 'transport'
    },
    {
      id: 'coach-tours',
      icon: <Bus className="w-12 h-12" />,
      title: 'Coach Tours',
      description: 'Comfortable bus travel with multiple destinations and professional drivers.',
      features: ['Multiple Stops', 'Comfortable Seats', 'Group Discounts', 'Luggage Storage'],
      gradient: 'from-teal-500 to-teal-700',
      category: 'transport'
    },
    {
      id: 'self-drive',
      icon: <Car className="w-12 h-12" />,
      title: 'Self-Drive Tours',
      description: 'Rent a car and explore Europe on your terms with suggested routes.',
      features: ['Total Freedom', 'Your Own Pace', 'Hidden Gems', 'Flexible Stops'],
      gradient: 'from-pink-500 to-pink-700',
      category: 'independent'
    },
    {
      id: 'seasonal-tours',
      icon: <Calendar className="w-12 h-12" />,
      title: 'Seasonal Tours',
      description: 'Experience Europe in different seasons with special holiday and festival tours.',
      features: ['Christmas Markets', 'Spring Blooms', 'Summer Festivals', 'Autumn Colors'],
      gradient: 'from-rose-500 to-rose-700',
      category: 'special'
    },
    {
      id: 'custom-tours',
      icon: <MapPin className="w-12 h-12" />,
      title: 'Custom Itineraries',
      description: 'Build your dream vacation with our tour builder and personalized planning.',
      features: ['Your Choice', 'Personalized', 'Unique Experience', 'Dream Vacation'],
      gradient: 'from-violet-500 to-violet-700',
      category: 'special'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Options' },
    { id: 'guided', label: 'Guided Tours' },
    { id: 'independent', label: 'Independent' },
    { id: 'transport', label: 'By Transport' },
    { id: 'luxury', label: 'Luxury' },
    { id: 'adventure', label: 'Adventure' },
    { id: 'special', label: 'Special' }
  ];

  const filteredOptions = selectedCategory === 'all' 
    ? travelOptions 
    : travelOptions.filter(option => option.category === selectedCategory);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-5 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Choose Your Way to Explore 🚶
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              From guided tours to independent adventures, discover the perfect travel style for your journey
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/routes" 
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
              >
                Browse All Tours
              </Link>
              <Link 
                to="/tour/builder" 
                className="px-8 py-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-400 transition-all shadow-lg hover:shadow-xl border-2 border-white"
              >
                Build Custom Tour
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white border-b border-gray-200 sticky top-20 z-40 shadow-sm">
        <div className="container mx-auto px-5 py-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Options Grid */}
      <section className="container mx-auto px-5 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOptions.map((option, index) => (
            <div
              key={option.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Card Header with Gradient */}
              <div className={`bg-gradient-to-r ${option.gradient} text-white p-8 relative`}>
                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
                  {option.icon}
                </div>
                <div className="relative z-10">
                  <div className="mb-4">{React.cloneElement(option.icon, { className: 'w-12 h-12 sm:w-16 sm:h-16' })}</div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">{option.title}</h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {option.description}
                </p>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {option.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  to="/routes"
                  className="flex items-center justify-between w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg group"
                >
                  <span>Explore Tours</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16">
        <div className="container mx-auto px-5">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why Travel With Us?
            </h2>
            <p className="text-xl text-gray-700 mb-12">
              No matter which way you choose to explore, we ensure an unforgettable experience
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-bold mb-2">Expert Planning</h3>
                <p className="text-gray-600">
                  Over 20 years of crafting perfect European itineraries
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-bold mb-2">Best Value</h3>
                <p className="text-gray-600">
                  Competitive prices with no hidden fees or surprises
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-4xl mb-4">🛡️</div>
                <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
                <p className="text-gray-600">
                  Round-the-clock assistance throughout your journey
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-5 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Adventure?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Browse our carefully curated tours or build your own custom itinerary
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/routes"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
            >
              View All Tours
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 bg-transparent text-white rounded-xl font-bold hover:bg-white/10 transition-all shadow-lg border-2 border-white"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
