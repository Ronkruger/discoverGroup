import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, Bell, Globe, Save, Camera, Shield, CreditCard, MapPin, Calendar, Moon, Sun } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/ThemeContext";

export default function UserSettings() {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    country: "",
    birthdate: "",
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    bookingUpdates: true,
    promotions: true,
    newsletter: true,
  });

  const [preferences, setPreferences] = useState({
    language: "en",
    currency: "PHP",
    timezone: "Asia/Manila",
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecurityData({ ...securityData, [e.target.name]: e.target.value });
  };

  const handleNotificationToggle = (key: string) => {
    setNotificationSettings({ ...notificationSettings, [key]: !notificationSettings[key as keyof typeof notificationSettings] });
  };

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPreferences({ ...preferences, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  return (
    <main className={`min-h-screen py-12 transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-b from-gray-50 via-gray-100 to-white'
    }`}>
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>User Settings</h1>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Manage your account settings and preferences</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="card-glass rounded-2xl p-6 sticky top-6">
              {/* User Avatar */}
              <div className={`text-center mb-6 pb-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-yellow-50 transition-colors">
                    <Camera className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
                <h3 className={`text-lg font-semibold mt-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.fullName || 'User'}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user?.email || 'user@example.com'}</p>
              </div>

              {/* Tab Navigation */}
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'profile' | 'security' | 'notifications' | 'preferences')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg'
                        : darkMode 
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-yellow-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <div className="card-glass rounded-2xl p-8">
              {/* Success Message */}
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                    darkMode 
                      ? 'bg-green-900/30 border border-green-700 text-green-300'
                      : 'bg-green-50 border border-green-200 text-green-700'
                  }`}
                >
                  <Save className="w-5 h-5" />
                  <span>Settings saved successfully!</span>
                </motion.div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Profile Information</h2>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className={`block font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <User className="w-4 h-4 inline mr-2" />
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={profileData.fullName}
                          onChange={handleProfileChange}
                          placeholder="John Doe"
                          className={`w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/50 transition-all ${
                            darkMode 
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <Mail className="w-4 h-4 inline mr-2" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          placeholder="john@example.com"
                          className={`w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/50 transition-all ${
                            darkMode 
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className={`block font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <Phone className="w-4 h-4 inline mr-2" />
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          placeholder="+63 912 345 6789"
                          className={`w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/50 transition-all ${
                            darkMode 
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Birth Date
                        </label>
                        <input
                          type="date"
                          name="birthdate"
                          value={profileData.birthdate}
                          onChange={handleProfileChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/50 transition-all ${
                            darkMode 
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={profileData.address}
                        onChange={handleProfileChange}
                        placeholder="Street Address"
                        className={`w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/50 transition-all ${
                          darkMode 
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className={`block font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>City</label>
                        <input
                          type="text"
                          name="city"
                          value={profileData.city}
                          onChange={handleProfileChange}
                          placeholder="Quezon City"
                          className={`w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/50 transition-all ${
                            darkMode 
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Country</label>
                        <input
                          type="text"
                          name="country"
                          value={profileData.country}
                          onChange={handleProfileChange}
                          placeholder="Philippines"
                          className={`w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/50 transition-all ${
                            darkMode 
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Security Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className={`block font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <Lock className="w-4 h-4 inline mr-2" />
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={securityData.currentPassword}
                        onChange={handleSecurityChange}
                        placeholder="Enter current password"
                        className={`w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/50 transition-all ${
                          darkMode 
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className={`block font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={securityData.newPassword}
                          onChange={handleSecurityChange}
                          placeholder="Enter new password"
                          className={`w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/50 transition-all ${
                            darkMode 
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirm Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={securityData.confirmPassword}
                          onChange={handleSecurityChange}
                          placeholder="Confirm new password"
                          className={`w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/50 transition-all ${
                            darkMode 
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className={`rounded-xl p-4 ${
                      darkMode 
                        ? 'bg-blue-900/30 border border-blue-700'
                        : 'bg-blue-50 border border-blue-200'
                    }`}>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <strong>Password requirements:</strong> At least 8 characters, including uppercase, lowercase, and numbers.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notification Preferences</h2>
                  <div className="space-y-4">
                    {Object.entries(notificationSettings).map(([key, value]) => (
                      <div key={key} className={`flex items-center justify-between p-4 border rounded-xl transition-colors ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-700 hover:border-yellow-500'
                          : 'bg-white border-gray-200 hover:border-yellow-300'
                      }`}>
                        <div>
                          <h3 className={`font-semibold capitalize ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {key === 'emailNotifications' && 'Receive notifications via email'}
                            {key === 'smsNotifications' && 'Receive notifications via SMS'}
                            {key === 'bookingUpdates' && 'Get updates about your bookings'}
                            {key === 'promotions' && 'Receive promotional offers and deals'}
                            {key === 'newsletter' && 'Subscribe to our monthly newsletter'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleNotificationToggle(key)}
                          className={`relative w-14 h-7 rounded-full transition-colors ${
                            value ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                              value ? 'translate-x-8' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Account Preferences</h2>
                  <div className="space-y-6">
                    {/* Dark Mode Toggle */}
                    <div className={`p-4 border rounded-xl transition-colors ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 hover:border-yellow-500'
                        : 'bg-white border-gray-200 hover:border-yellow-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-semibold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                            {darkMode ? 'Dark Mode' : 'Light Mode'}
                          </h3>
                          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Switch between light and dark theme
                          </p>
                        </div>
                        <button
                          onClick={toggleDarkMode}
                          className={`relative w-14 h-7 rounded-full transition-colors ${
                            darkMode ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                              darkMode ? 'translate-x-8' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={`block font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <Globe className="w-4 h-4 inline mr-2" />
                        Language
                      </label>
                      <select
                        name="language"
                        value={preferences.language}
                        onChange={handlePreferenceChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/50 transition-all ${
                          darkMode 
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="en">English</option>
                        <option value="tl">Filipino (Tagalog)</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <CreditCard className="w-4 h-4 inline mr-2" />
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={preferences.currency}
                        onChange={handlePreferenceChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/50 transition-all ${
                          darkMode 
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="PHP">Philippine Peso (₱)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="GBP">British Pound (£)</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <Globe className="w-4 h-4 inline mr-2" />
                        Timezone
                      </label>
                      <select
                        name="timezone"
                        value={preferences.timezone}
                        onChange={handlePreferenceChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/50 transition-all ${
                          darkMode 
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="Asia/Manila">Manila (GMT+8)</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">New York (EST)</option>
                        <option value="Europe/London">London (GMT)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className={`mt-8 pt-6 border-t flex justify-end gap-4 ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <button
                  onClick={() => window.history.back()}
                  className={`px-6 py-3 border-2 font-semibold rounded-xl transition-all ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-semibold rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

