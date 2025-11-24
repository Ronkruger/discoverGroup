import React, { useState } from "react";
import { useAuth } from "../context/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { searchBookingsByEmail } from "../api/bookings";
import { getFavorites } from "../api/favorites";
import type { Booking } from "../types";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "settings">("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Fetch user's bookings and favorites
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch bookings by email
        const userBookings = await searchBookingsByEmail(user.email);
        setBookings(userBookings);

        // Fetch favorites count
        const favoritesData = await getFavorites();
        setFavoritesCount(favoritesData.count);

        console.log('✅ Loaded user data:', {
          bookings: userBookings.length,
          favorites: favoritesData.count
        });
      } catch (error) {
        console.error('❌ Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="container mx-auto px-5">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-gray-300">Manage your account and view your bookings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-6 sticky top-24">
              {/* User Avatar & Info */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <h2 className="text-xl font-bold text-white mb-1">{user.name || "User"}</h2>
                <p className="text-sm text-gray-300">{user.email}</p>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                    activeTab === "overview"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Overview
                </button>

                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                    activeTab === "bookings"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  My Bookings
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                    activeTab === "settings"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>

                <hr className="border-white/10 my-4" />

                <Link
                  to="/favorites"
                  className="w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 text-gray-300 hover:bg-white/5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Favorites
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 text-red-400 hover:bg-red-500/10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-fade-in">
                {/* Welcome Card */}
                <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-2xl p-8 text-white">
                  <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name?.split(" ")[0] || "Traveler"}! ✈️</h2>
                  <p className="text-blue-100 mb-6">Ready to explore new destinations? Check out our latest tour packages.</p>
                  <Link
                    to="/routes"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg"
                  >
                    Browse Tours
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm text-gray-300">Total Bookings</h3>
                      <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-white">{loading ? '...' : bookings.length}</p>
                    <p className="text-xs text-gray-400 mt-1">All time</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm text-gray-300">Confirmed Trips</h3>
                      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-white">{loading ? '...' : bookings.filter(b => b.status === 'confirmed').length}</p>
                    <p className="text-xs text-gray-400 mt-1">Scheduled</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm text-gray-300">Favorites</h3>
                      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-white">{loading ? '...' : favoritesCount}</p>
                    <p className="text-xs text-gray-400 mt-1">Saved tours</p>
                  </div>
                </div>

                {/* Account Info */}
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Account Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-400">Full Name</p>
                        <p className="text-white font-medium">{user.name || "Not provided"}</p>
                      </div>
                      <button className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                    </div>
                    <div className="flex items-start justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-400">Email Address</p>
                        <p className="text-white font-medium">{user.email}</p>
                      </div>
                      <button className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                    </div>
                    <div className="flex items-start justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-400">Phone Number</p>
                        <p className="text-white font-medium">Not provided</p>
                      </div>
                      <button className="text-blue-400 hover:text-blue-300 text-sm">Add</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <div className="animate-fade-in">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">My Bookings</h2>
                    <Link
                      to="/routes"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                    >
                      Book a Tour
                    </Link>
                  </div>

                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-gray-300">Loading your bookings...</p>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="w-24 h-24 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <h3 className="text-xl font-semibold text-white mb-2">No bookings yet</h3>
                      <p className="text-gray-400 mb-6">Start planning your next adventure by browsing our tour packages</p>
                      <Link
                        to="/routes"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                      >
                        Explore Tours
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div 
                          key={booking.id} 
                          className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-white mb-1">{booking.tour.title}</h3>
                              <p className="text-gray-400 text-sm">Booking ID: {booking.bookingId}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              booking.status === 'confirmed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                              booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                              booking.status === 'completed' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                              'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-gray-400">Travel Date</p>
                              <p className="text-white font-medium">{new Date(booking.selectedDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Passengers</p>
                              <p className="text-white font-medium">{booking.passengers}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Total Amount</p>
                              <p className="text-white font-medium">PHP {booking.totalAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Payment</p>
                              <p className="text-white font-medium">{booking.paymentType === 'full' ? 'Full' : 'Downpayment'}</p>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-white/10">
                            <Link 
                              to={`/tour/${booking.tour.slug}`}
                              className="text-blue-400 hover:text-blue-300 text-sm font-medium inline-flex items-center gap-1"
                            >
                              View Tour Details
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="animate-fade-in">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>

                  {/* Email Notifications */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                        <span className="text-gray-300">Booking confirmations</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                        <span className="text-gray-300">Special offers and promotions</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                        <span className="text-gray-300">Travel tips and updates</span>
                        <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                      </label>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Password</h3>
                    <button className="px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all border border-white/10">
                      Change Password
                    </button>
                  </div>

                  {/* Danger Zone */}
                  <div className="pt-6 border-t border-white/10">
                    <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
                    <button className="px-6 py-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all border border-red-500/30">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
