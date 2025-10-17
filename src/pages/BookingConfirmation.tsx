import { useLocation, Link, useParams } from "react-router-dom";
import type { JSX } from "react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { testEmailJS, testEmailJSSimple } from "../api/emailJS";
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

/**
 * Booking confirmation page
 * - Route: /booking/confirmation
 * - Expects location.state with booking summary:
 *   { bookingId, tourTitle, country, date, passengers, perPerson, total }
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
  const [testingEmail, setTestingEmail] = useState(false);
  
  const state = (location.state ?? {}) as {
    bookingId?: string;
    tourTitle?: string;
    country?: string;
    date?: string;
    passengers?: number;
    perPerson?: number;
    total?: number;
    customerEmail?: string;
  };

  // Get booking ID from URL parameter or location state
  const bookingId = urlBookingId || state.bookingId;

  // Debug logging
  console.log('🔍 BookingConfirmation Debug Info:', {
    urlBookingId,
    stateBookingId: state.bookingId,
    finalBookingId: bookingId,
    hasLocationState: !!location.state,
    locationState: location.state,
    tourTitle: state.tourTitle,
    allStateKeys: Object.keys(state)
  });

  // Test email function
  const handleTestEmail = async () => {
    const testEmail = prompt('Enter your email address to test:');
    if (!testEmail) return;
    
    setTestingEmail(true);
    try {
      console.log('🧪 Starting EmailJS test...');
      
      // Try simple test first
      const result = await testEmailJSSimple(testEmail);
      if (result.success) {
        alert('✅ Test email sent successfully! Check your inbox.');
      } else {
        alert('❌ Test email failed: ' + result.error);
        console.error('Test failed, trying full test...');
        
        // If simple test fails, try full test for more details
        const fullResult = await testEmailJS(testEmail);
        if (fullResult.success) {
          alert('✅ Full test email sent successfully!');
        } else {
          alert('❌ Both tests failed: ' + fullResult.error);
        }
      }
    } catch (error) {
      alert('❌ Test email error: ' + error);
      console.error('Test email catch error:', error);
    }
    setTestingEmail(false);
  };

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
          title: 'My Tour Booking Confirmed!',
          text: `I just booked ${state.tourTitle} in ${state.country}!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 text-center max-w-lg"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Booking Found</h2>
          <p className="text-slate-300 mb-4">
            No booking data available. If you just completed a booking please check your email.
          </p>
          
          {/* Debug Information */}
          <div className="text-left bg-slate-800/50 p-4 rounded-lg mb-4 text-sm">
            <div className="text-yellow-400 mb-2">Debug Info:</div>
            <div className="text-slate-300">
              <div>Has Location State: {location.state ? '✅ Yes' : '❌ No'}</div>
              <div>URL Booking ID: {urlBookingId || '❌ Missing'}</div>
              <div>State Booking ID: {state.bookingId || '❌ Missing'}</div>
              <div>Final Booking ID: {bookingId || '❌ Missing'}</div>
              <div>Tour Title: {state.tourTitle || '❌ Missing'}</div>
              <div>Available Keys: {Object.keys(state).length > 0 ? Object.keys(state).join(', ') : 'None'}</div>
              <div className="mt-2 text-xs text-slate-400">
                Raw State: {JSON.stringify(location.state, null, 2)}
              </div>
            </div>
          </div>
          
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Return Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Booking Confirmed!
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-300 max-w-2xl mx-auto mb-4"
          >
            Get ready for an amazing adventure! Your booking is confirmed and we're excited to host you.
          </motion.p>

          {/* Email confirmation notice */}
          {state.customerEmail && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex items-center justify-center gap-2 text-green-400 mb-6"
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
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Ticket
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
            <button
              onClick={handleAddToCalendar}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Calendar className="w-5 h-5" />
              Add to Calendar
            </button>
            <button
              onClick={handleTestEmail}
              disabled={testingEmail}
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Mail className="w-5 h-5" />
              {testingEmail ? 'Testing...' : 'Test Email'}
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
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 mb-8"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Booking Details</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-slate-400 text-sm mb-1">Booking Reference</div>
                  <div className="text-white text-xl font-mono bg-white/5 px-3 py-2 rounded">{bookingId}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm mb-1">Tour</div>
                  <div className="text-white text-lg font-semibold">{state.tourTitle}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm mb-1">Destination</div>
                  <div className="text-white font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    {state.country}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Trip Information</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-slate-400 text-sm mb-1">Travel Date</div>
                  <div className="text-white font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-400" />
                    {state.date ? new Date(state.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm mb-1">Passengers</div>
                  <div className="text-white font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    {state.passengers} {state.passengers === 1 ? 'person' : 'people'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm mb-1">Total Paid</div>
                  <div className="text-white text-2xl font-bold">
                    PHP {(state.total ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </div>
                </div>
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
          <div className="flex flex-wrap gap-2 bg-white/5 backdrop-blur-sm rounded-lg p-2">
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
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
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
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors group cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                  <p className="text-slate-300 text-sm mb-4">{step.description}</p>
                  <button className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">
                    {step.action} →
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'itinerary' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Your Day Schedule</h3>
              <div className="space-y-6">
                {sampleItinerary.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex gap-4 items-start"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-blue-400 font-mono font-semibold">{item.time}</span>
                        <span className="bg-white/10 text-slate-300 text-xs px-2 py-1 rounded">{item.duration}</span>
                      </div>
                      <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                      <p className="text-slate-300 text-sm">{item.description}</p>
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
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6"
                >
                  <h3 className="text-white font-semibold mb-4">{rec.title}</h3>
                  <ul className="space-y-2">
                    {rec.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-slate-300 text-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
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
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8">
            <MessageCircle className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">Need Help or Have Questions?</h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Our support team is available 24/7 to assist you. Contact us anytime for help with your booking or travel questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-white">
                <Phone className="w-5 h-5 text-green-400" />
                <span className="font-medium">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Mail className="w-5 h-5 text-blue-400" />
                <span className="font-medium">support@discovertours.com</span>
              </div>
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Return Home
              </Link>
              <Link 
                to="/routes" 
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Book Another Tour
              </Link>
              <Link 
                to="/contact" 
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors"
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