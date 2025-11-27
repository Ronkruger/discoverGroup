import { useLocation, Link, useParams } from "react-router-dom";
import type { JSX } from "react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Users, 
  Download, 
  Share2, 
  Mail,
  Phone,
  Clock,
  Camera,
  Utensils,
  Car,
  Star,
  MessageCircle,
  ExternalLink,
  Plus
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// Import CustomRoute type
import type { CustomRoute } from "../types";

/**
 * Booking confirmation page
 * - Route: /booking/confirmation
 * - Expects location.state with booking summary:
 *   { bookingId, tourTitle, country, date, passengers, perPerson, total, customRoutes }
 */

// Sample itinerary data - in a real app this would come from an API
const sampleItinerary = [
  {
    time: "08:00",
    title: "Hotel Pick-up",
    description: "Our guide will pick you up from your hotel lobby",
    icon: Car,
    duration: "30 mins"
  },
  {
    time: "09:00",
    title: "First Destination",
    description: "Visit the historic landmark with guided tour",
    icon: MapPin,
    duration: "2 hours"
  },
  {
    time: "11:30",
    title: "Photo Stop",
    description: "Professional photos at scenic viewpoint",
    icon: Camera,
    duration: "30 mins"
  },
  {
    time: "12:30",
    title: "Lunch Break",
    description: "Traditional local cuisine at recommended restaurant",
    icon: Utensils,
    duration: "1 hour"
  },
  {
    time: "14:00",
    title: "Cultural Experience",
    description: "Interactive cultural demonstration and workshop",
    icon: Users,
    duration: "2 hours"
  },
  {
    time: "16:30",
    title: "Return Journey",
    description: "Drop-off at your hotel or preferred location",
    icon: Car,
    duration: "1 hour"
  }
];

const nextSteps = [
  {
    icon: Mail,
    title: "Check Your Email",
    description: "Detailed booking confirmation with voucher will arrive within 15 minutes",
    action: "View Email"
  },
  {
    icon: Download,
    title: "Download Mobile Ticket",
    description: "Save your e-ticket to your phone for easy access",
    action: "Download"
  },
  {
    icon: Calendar,
    title: "Add to Calendar",
    description: "Save your tour date and pickup time to your calendar",
    action: "Add Event"
  },
  {
    icon: Phone,
    title: "Contact Information",
    description: "Save our 24/7 support number: +1 (555) 123-4567",
    action: "Save Contact"
  }
];

const recommendations = [
  {
    title: "What to Bring",
    items: ["Comfortable walking shoes", "Camera", "Sunscreen", "Light jacket", "Small backpack"]
  },
  {
    title: "Weather Forecast",
    items: ["Sunny, 28°C", "Light breeze", "Perfect for outdoor activities", "No rain expected"]
  },
  {
    title: "Nearby Attractions",
    items: ["Museum District (10 min)", "Shopping Center (15 min)", "Local Market (5 min)", "Beach Area (20 min)"]
  }
];

export default function BookingConfirmation(): JSX.Element {
  const location = useLocation();
  const { bookingId: urlBookingId } = useParams<{ bookingId?: string }>();
  const [activeTab, setActiveTab] = useState("details");
  const { darkMode } = useTheme();
  
  const state = (location.state ?? {}) as {
    bookingId?: string;
    tourTitle?: string;
    country?: string;
    date?: string;
    passengers?: number;
    perPerson?: number;
    total?: number;
    customerEmail?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    appointmentPurpose?: string;
    customRoutes?: CustomRoute[];
  };

  // Get booking ID from URL parameter or location state
  const bookingId = urlBookingId || state.bookingId;

  // Confetti burst on mount!
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      zIndex: 9999,
    });
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Tour Booking Reservation Confirmed!',
          text: `I just booked ${state.tourTitle} in ${state.country}!`,
          url: window.location.href,
        });
      } catch {
        // Silently fail - sharing is optional
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      // Note: In production, use a toast notification instead of alert
    }
  };

  const handleDownloadTicket = () => {
    // In a real app, this would generate and download a PDF ticket
    const element = document.createElement('a');
    const file = new Blob([`
Booking Confirmation
-------------------
Booking ID: ${bookingId}
Tour: ${state.tourTitle}
Country: ${state.country}
Date: ${state.date}
Passengers: ${state.passengers}
Total: PHP ${(state.total ?? 0).toLocaleString()}
    `], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `booking-${bookingId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleAddToCalendar = () => {
    if (state.date && state.tourTitle) {
      const startDate = new Date(state.date);
      const endDate = new Date(startDate.getTime() + 8 * 60 * 60 * 1000); // 8 hours later
      
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(state.tourTitle)}&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent(`Booking ID: ${bookingId}\nLocation: ${state.country}`)}`;
      
      window.open(googleCalendarUrl, '_blank');
    }
  };

  if (!bookingId) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-6 ${
        darkMode 
          ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
          : 'bg-gradient-to-b from-gray-50 via-gray-100 to-white'
      }`}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`backdrop-blur-md rounded-2xl p-8 text-center max-w-lg shadow-2xl ${
            darkMode
              ? 'bg-gradient-to-br from-white/10 to-white/5 border border-white/15'
              : 'bg-white/80 border border-gray-200'
          }`}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            darkMode ? 'bg-red-500/20' : 'bg-red-100'
          }`}>
            <CheckCircle2 className={`w-8 h-8 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
          </div>
          <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            No Booking Found
          </h2>
          <p className={`mb-6 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
            No booking data available. If you just completed a booking please check your email.
          </p>
          
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 px-6 py-3 rounded-lg font-medium transition-all shadow-lg shadow-yellow-500/30"
          >
            Return Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      darkMode 
        ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
        : 'bg-gradient-to-b from-gray-50 via-gray-100 to-white'
    }`}>
      {/* Header Section */}
      <div className={`backdrop-blur-sm border-b ${
        darkMode
          ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-white/10'
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="container mx-auto px-6 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
              darkMode ? 'bg-green-500/20' : 'bg-green-100'
            }`}
          >
            <CheckCircle2 className={`w-10 h-10 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Booking Reservation Confirmed!
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-xl max-w-2xl mx-auto mb-4 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}
          >
            Get ready for an amazing adventure! Your booking is confirmed and we're excited to host you.
          </motion.p>

          {/* Email confirmation notice */}
          {state.customerEmail && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className={`flex items-center justify-center gap-2 mb-6 ${
                darkMode ? 'text-green-400' : 'text-green-600'
              }`}
            >
              <Mail size={20} />
              <span>Confirmation email sent to {state.customerEmail}</span>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button
              onClick={handleDownloadTicket}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                darkMode
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              <Download className="w-5 h-5" />
              Download Ticket
            </button>
            <button
              onClick={handleShare}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                darkMode
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
            <button
              onClick={handleAddToCalendar}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 px-6 py-3 rounded-lg font-medium transition-all shadow-lg shadow-yellow-500/30"
            >
              <Calendar className="w-5 h-5" />
              Add to Calendar
            </button>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Booking Summary Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`backdrop-blur-md rounded-2xl p-8 mb-8 shadow-2xl ${
            darkMode
              ? 'bg-gradient-to-br from-white/8 to-white/3 border border-white/10'
              : 'bg-white/80 border border-gray-200'
          }`}
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Reservation Details
              </h2>
              <div className="space-y-4">
                <div>
                  <div className={`text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Booking Reference
                  </div>
                  <div className={`text-xl font-mono px-3 py-2 rounded ${
                    darkMode
                      ? 'text-white bg-white/5'
                      : 'text-gray-900 bg-gray-100'
                  }`}>
                    {bookingId}
                  </div>
                </div>
                <div>
                  <div className={`text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Tour
                  </div>
                  <div className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {state.tourTitle}
                  </div>
                </div>
                
                {/* Custom Routes Display */}
                {state.customRoutes && state.customRoutes.length > 0 && (
                  <div>
                    <div className={`text-sm mb-2 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      Combined Tour Package
                    </div>
                    <div className="space-y-2">
                      {state.customRoutes.map((route, index) => (
                        <div 
                          key={index}
                          className={`rounded-lg p-3 ${
                            darkMode
                              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30'
                              : 'bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <Plus className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                              darkMode ? 'text-purple-300' : 'text-purple-600'
                            }`} />
                            <div className="flex-1">
                              <div className={`font-semibold text-sm ${
                                darkMode ? 'text-purple-100' : 'text-purple-900'
                              }`}>
                                {route.tourTitle}
                              </div>
                              <div className={`text-xs mt-1 ${
                                darkMode ? 'text-purple-200/80' : 'text-purple-700'
                              }`}>
                                {route.durationDays} days • {route.tourLine} • PHP {route.pricePerPerson.toLocaleString()}/person
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className={`text-xs mt-2 flex items-center gap-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}>
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span>Combined package includes all routes above</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <div className={`text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Destination
                  </div>
                  <div className={`font-medium flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <MapPin className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    {state.country}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Trip Information
              </h2>
              <div className="space-y-4">
                <div>
                  <div className={`text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Travel Date
                  </div>
                  <div className={`font-medium flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Calendar className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                    {(() => {
                      if (!state.date) return "Date not specified";
                      
                      // Handle date ranges (e.g., "2025-05-13 - 2025-05-27")
                      if (state.date.includes(' - ')) {
                        const [startDate, endDate] = state.date.split(' - ').map(d => d.trim());
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        
                        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                          return "Date not specified";
                        }
                        
                        return `${start.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })} - ${end.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}`;
                      }
                      
                      // Handle single dates
                      const date = new Date(state.date);
                      if (isNaN(date.getTime())) return "Date not specified";
                      
                      return date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      });
                    })()}
                  </div>
                </div>
                <div>
                  <div className={`text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Passengers
                  </div>
                  <div className={`font-medium flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Users className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    {state.passengers} {state.passengers === 1 ? 'person' : 'people'}
                  </div>
                </div>
                <div>
                  <div className={`text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Total Paid
                  </div>
                  <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    PHP {(state.total ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                {state.appointmentDate && state.appointmentTime && !isNaN(new Date(state.appointmentDate).getTime()) && (
                  <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-white/20' : 'border-gray-300'}`}>
                    <div className={`text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      Office Appointment Scheduled
                    </div>
                    <div className={`font-medium flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Calendar className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      {new Date(state.appointmentDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} at {state.appointmentTime}
                    </div>
                    {state.appointmentPurpose && (
                      <div className={`text-sm mt-2 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                        Purpose: {state.appointmentPurpose.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                    )}
                    <div className={`mt-3 p-3 rounded-lg ${
                      darkMode
                        ? 'bg-blue-900/30 border border-blue-700/50'
                        : 'bg-blue-50 border border-blue-200'
                    }`}>
                      <div className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                        <strong>📍 Location:</strong> 123 Travel Avenue, Makati City, Metro Manila
                      </div>
                      <div className={`text-sm mt-1 ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                        <strong>📞 Contact:</strong> +63 02 8526 8404
                      </div>
                      <div className={`text-xs mt-2 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                        Please arrive 10 minutes early. A confirmation email has been sent with directions.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className={`flex flex-wrap gap-2 backdrop-blur-md rounded-xl p-2 ${
            darkMode
              ? 'bg-gradient-to-br from-white/8 to-white/3 border border-white/10'
              : 'bg-white/80 border border-gray-200'
          }`}>
            {[
              { id: 'details', label: 'Next Steps', icon: CheckCircle2 },
              { id: 'itinerary', label: 'Itinerary', icon: Clock },
              { id: 'recommendations', label: 'Recommendations', icon: Star }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/30'
                    : darkMode
                      ? 'text-slate-300 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'details' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {nextSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`backdrop-blur-md rounded-xl p-6 transition-all group cursor-pointer shadow-lg ${
                    darkMode
                      ? 'bg-gradient-to-br from-white/8 to-white/3 border border-white/10 hover:from-white/12 hover:to-white/5'
                      : 'bg-white/80 border border-gray-200 hover:bg-white hover:shadow-xl'
                  }`}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-yellow-500/30">
                    <step.icon className="w-6 h-6 text-gray-900" />
                  </div>
                  <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    {step.description}
                  </p>
                  <button className={`text-sm font-medium transition-colors ${
                    darkMode
                      ? 'text-blue-400 hover:text-blue-300'
                      : 'text-blue-600 hover:text-blue-700'
                  }`}>
                    {step.action} →
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'itinerary' && (
            <div className={`backdrop-blur-md rounded-2xl p-8 shadow-2xl ${
              darkMode
                ? 'bg-gradient-to-br from-white/8 to-white/3 border border-white/10'
                : 'bg-white/80 border border-gray-200'
            }`}>
              <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Your Day Schedule
              </h3>
              <div className="space-y-6">
                {sampleItinerary.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex gap-4 items-start"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/30">
                      <item.icon className="w-6 h-6 text-gray-900" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`font-mono font-semibold ${
                          darkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                          {item.time}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          darkMode
                            ? 'bg-white/10 text-slate-300'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {item.duration}
                        </span>
                      </div>
                      <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.title}
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="grid md:grid-cols-3 gap-6">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`backdrop-blur-md rounded-xl p-6 shadow-lg ${
                    darkMode
                      ? 'bg-gradient-to-br from-white/8 to-white/3 border border-white/10'
                      : 'bg-white/80 border border-gray-200'
                  }`}
                >
                  <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {rec.title}
                  </h3>
                  <ul className="space-y-2">
                    {rec.items.map((item, itemIndex) => (
                      <li key={itemIndex} className={`text-sm flex items-center gap-2 ${
                        darkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          darkMode ? 'bg-blue-400' : 'bg-blue-600'
                        }`}></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Support Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className={`backdrop-blur-sm rounded-lg p-8 ${
            darkMode
              ? 'bg-white/5 border border-white/10'
              : 'bg-white/80 border border-gray-200'
          }`}>
            <MessageCircle className={`w-12 h-12 mx-auto mb-4 ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Need Help or Have Questions?
            </h3>
            <p className={`mb-6 max-w-2xl mx-auto ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              Our support team is available 24/7 to assist you. Contact us anytime for help with your booking or travel questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Phone className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                <span className="font-medium">+1 (555) 123-4567</span>
              </div>
              <div className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Mail className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className="font-medium">support@discovertours.com</span>
              </div>
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 px-6 py-3 rounded-lg font-medium transition-all shadow-lg shadow-yellow-500/30"
              >
                Return Home
              </Link>
              <Link 
                to="/routes" 
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  darkMode
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                <Plus className="w-5 h-5" />
                Book Another Tour
              </Link>
              <Link 
                to="/contact" 
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  darkMode
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                <ExternalLink className="w-5 h-5" />
                Get Support
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}