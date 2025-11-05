import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Shield,
  Globe,
  Mail,
  Bell,
  Database,
  Users,
  Palette,
  FileText,
  AlertCircle,
  CheckCircle,
  Monitor,
  Smartphone,
  Eye,
  EyeOff,
  UserPlus,
  UserMinus,
  Clock,
  Activity,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { getEmailSettings, updateEmailSettings } from '../services/settingsService';

interface SystemSettings {
  // General Settings
  siteName: string;
  siteDescription: string;
  adminEmail: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  language: string;
  
  // Security Settings
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireTwoFactor: boolean;
  allowPasswordReset: boolean;
  
  // Email Settings
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpSecure: boolean;
  emailFromName: string;
  emailFromAddress: string;
  bookingDepartmentEmail: string;
  
  // Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  notifyOnNewBooking: boolean;
  notifyOnCancellation: boolean;
  notifyOnPayment: boolean;
  
  // Business Settings
  bookingConfirmationTime: number;
  cancellationPolicyHours: number;
  refundProcessingDays: number;
  minimumBookingAdvance: number;
  maximumGroupSize: number;
  
  // System Settings
  maintenanceMode: boolean;
  allowRegistration: boolean;
  enableLogging: boolean;
  logRetentionDays: number;
  backupFrequency: string;
  
  // UI Settings
  theme: string;
  showWelcomeTour: boolean;
  enableDarkMode: boolean;
  compactSidebar: boolean;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    // General Settings
    siteName: 'DiscoverGroup Travel',
    siteDescription: 'Premium travel experiences and tour packages',
    adminEmail: 'admin@discovergroup.com',
    timezone: 'UTC+0',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    language: 'en',
    
    // Security Settings
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireTwoFactor: false,
    allowPasswordReset: true,
    
    // Email Settings
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    smtpSecure: true,
    emailFromName: 'DiscoverGroup',
    emailFromAddress: 'noreply@discovergroup.com',
    bookingDepartmentEmail: 'booking@discovergrp.com',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notifyOnNewBooking: true,
    notifyOnCancellation: true,
    notifyOnPayment: true,
    
    // Business Settings
    bookingConfirmationTime: 24,
    cancellationPolicyHours: 48,
    refundProcessingDays: 7,
    minimumBookingAdvance: 1,
    maximumGroupSize: 20,
    
    // System Settings
    maintenanceMode: false,
    allowRegistration: true,
    enableLogging: true,
    logRetentionDays: 30,
    backupFrequency: 'daily',
    
    // UI Settings
    theme: 'light',
    showWelcomeTour: true,
    enableDarkMode: false,
    compactSidebar: false,
  });

  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(true); // Start as saved
  const [showPassword, setShowPassword] = useState(false);

  // Load settings from localStorage and API on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('discovergroup-admin-settings');
    
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        setSaved(true); // Mark as saved since we just loaded from storage
        
        // Apply the saved theme
        if (parsedSettings.theme) {
          applyTheme(parsedSettings.theme);
        }
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    } else {
      setSaved(false); // No saved settings, mark as unsaved
    }

    // Load email settings from API
    getEmailSettings()
      .then(emailSettings => {
        setSettings(prev => ({
          ...prev,
          bookingDepartmentEmail: emailSettings.bookingDepartmentEmail,
          emailFromAddress: emailSettings.emailFromAddress,
          emailFromName: emailSettings.emailFromName,
        }));
        console.log('✅ Loaded email settings from API:', emailSettings);
      })
      .catch(error => {
        console.error('Failed to load email settings from API:', error);
      });
  }, []);

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'business', name: 'Business', icon: FileText },
    { id: 'system', name: 'System', icon: Database },
    { id: 'appearance', name: 'Appearance', icon: Palette },
  ];

  const timezones = [
    'UTC-12', 'UTC-11', 'UTC-10', 'UTC-9', 'UTC-8', 'UTC-7', 'UTC-6',
    'UTC-5', 'UTC-4', 'UTC-3', 'UTC-2', 'UTC-1', 'UTC+0', 'UTC+1',
    'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5', 'UTC+6', 'UTC+7', 'UTC+8',
    'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12'
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY'];
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save email settings to API
      await updateEmailSettings({
        bookingDepartmentEmail: settings.bookingDepartmentEmail,
        emailFromAddress: settings.emailFromAddress,
        emailFromName: settings.emailFromName,
      });
      console.log('✅ Email settings saved to API');
      
      // Store all settings in localStorage for persistence
      localStorage.setItem('discovergroup-admin-settings', JSON.stringify(settings));
      
      setSaved(true);
      
      // Reset to show "Save Settings" after 3 seconds, but keep settings saved
      setTimeout(() => {
        // Don't set saved to false, just clear the success message
        // Settings are still saved, but button should be available for new changes
      }, 3000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof SystemSettings, value: string | number | boolean) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      return newSettings;
    });
    setSaved(false);
    
    // Apply theme immediately if theme is being changed
    if (key === 'theme') {
      applyTheme(value as string);
    }
  };

  const applyTheme = (theme: string) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (theme === 'auto') {
      // Check system preference
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">General Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Name
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => updateSetting('siteName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              value={settings.adminEmail}
              onChange={(e) => updateSetting('adminEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Description
            </label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => updateSetting('siteDescription', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => updateSetting('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Format
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) => updateSetting('dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={settings.currency}
              onChange={(e) => updateSetting('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currencies.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Login Attempts
            </label>
            <input
              type="number"
              value={settings.maxLoginAttempts}
              onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Password Length
            </label>
            <input
              type="number"
              value={settings.passwordMinLength}
              onChange={(e) => updateSetting('passwordMinLength', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireTwoFactor"
                checked={settings.requireTwoFactor}
                onChange={(e) => updateSetting('requireTwoFactor', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requireTwoFactor" className="ml-2 block text-sm text-gray-900">
                Require Two-Factor Authentication
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowPasswordReset"
                checked={settings.allowPasswordReset}
                onChange={(e) => updateSetting('allowPasswordReset', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowPasswordReset" className="ml-2 block text-sm text-gray-900">
                Allow Password Reset via Email
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Host
            </label>
            <input
              type="text"
              value={settings.smtpHost}
              onChange={(e) => updateSetting('smtpHost', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Port
            </label>
            <input
              type="number"
              value={settings.smtpPort}
              onChange={(e) => updateSetting('smtpPort', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Username
            </label>
            <input
              type="text"
              value={settings.smtpUsername}
              onChange={(e) => updateSetting('smtpUsername', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={settings.smtpPassword}
                onChange={(e) => updateSetting('smtpPassword', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Name
            </label>
            <input
              type="text"
              value={settings.emailFromName}
              onChange={(e) => updateSetting('emailFromName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Email Address
            </label>
            <input
              type="email"
              value={settings.emailFromAddress}
              onChange={(e) => updateSetting('emailFromAddress', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Booking Department Email
            </label>
            <input
              type="email"
              value={settings.bookingDepartmentEmail}
              onChange={(e) => updateSetting('bookingDepartmentEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="booking@discovergrp.com"
            />
            <p className="text-xs text-gray-500 mt-1">Email address that receives booking notifications</p>
          </div>
          
          <div className="md:col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="smtpSecure"
                checked={settings.smtpSecure}
                onChange={(e) => updateSetting('smtpSecure', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="smtpSecure" className="ml-2 block text-sm text-gray-900">
                Use Secure Connection (TLS/SSL)
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">General Notifications</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                  Email Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="smsNotifications"
                  checked={settings.smsNotifications}
                  onChange={(e) => updateSetting('smsNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-900">
                  SMS Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="pushNotifications"
                  checked={settings.pushNotifications}
                  onChange={(e) => updateSetting('pushNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-900">
                  Push Notifications
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Business Event Notifications</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifyOnNewBooking"
                  checked={settings.notifyOnNewBooking}
                  onChange={(e) => updateSetting('notifyOnNewBooking', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notifyOnNewBooking" className="ml-2 block text-sm text-gray-900">
                  New Booking Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifyOnCancellation"
                  checked={settings.notifyOnCancellation}
                  onChange={(e) => updateSetting('notifyOnCancellation', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notifyOnCancellation" className="ml-2 block text-sm text-gray-900">
                  Cancellation Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifyOnPayment"
                  checked={settings.notifyOnPayment}
                  onChange={(e) => updateSetting('notifyOnPayment', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notifyOnPayment" className="ml-2 block text-sm text-gray-900">
                  Payment Notifications
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBusinessSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Booking Confirmation Time (hours)
            </label>
            <input
              type="number"
              value={settings.bookingConfirmationTime}
              onChange={(e) => updateSetting('bookingConfirmationTime', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Time to confirm booking before auto-cancellation</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Policy (hours)
            </label>
            <input
              type="number"
              value={settings.cancellationPolicyHours}
              onChange={(e) => updateSetting('cancellationPolicyHours', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum hours before tour start for cancellation</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Processing (days)
            </label>
            <input
              type="number"
              value={settings.refundProcessingDays}
              onChange={(e) => updateSetting('refundProcessingDays', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Days to process refunds</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Booking Advance (days)
            </label>
            <input
              type="number"
              value={settings.minimumBookingAdvance}
              onChange={(e) => updateSetting('minimumBookingAdvance', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum days in advance to book tours</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Group Size
            </label>
            <input
              type="number"
              value={settings.maximumGroupSize}
              onChange={(e) => updateSetting('maximumGroupSize', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum people per tour group</p>
          </div>
        </div>
        
        <div className="mt-8">
          <h4 className="text-md font-medium text-gray-900 mb-4">Payment Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accepted Payment Methods
              </label>
              <div className="space-y-2">
                {['Credit Card', 'PayPal', 'Bank Transfer', 'Apple Pay', 'Google Pay'].map((method) => (
                  <div key={method} className="flex items-center">
                    <input
                      type="checkbox"
                      id={method}
                      defaultChecked={method === 'Credit Card' || method === 'PayPal'}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={method} className="ml-2 block text-sm text-gray-900">
                      {method}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deposit Requirement (%)
              </label>
              <input
                type="number"
                defaultValue={25}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Percentage required as deposit</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h4 className="text-md font-medium text-gray-900 mb-4">Commission & Pricing</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent Commission (%)
              </label>
              <input
                type="number"
                defaultValue={10}
                min="0"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Fee (%)
              </label>
              <input
                type="number"
                defaultValue={5}
                min="0"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                defaultValue={8.5}
                min="0"
                max="30"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Configuration</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Log Retention (days)
              </label>
              <input
                type="number"
                value={settings.logRetentionDays}
                onChange={(e) => updateSetting('logRetentionDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Frequency
              </label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => updateSetting('backupFrequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <h4 className="font-medium text-red-900">Maintenance Mode</h4>
                  <p className="text-sm text-red-700">Temporarily disable public access to the system</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <h4 className="font-medium text-blue-900">Allow Registration</h4>
                  <p className="text-sm text-blue-700">Allow new users to register accounts</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.allowRegistration}
                onChange={(e) => updateSetting('allowRegistration', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <h4 className="font-medium text-green-900">Enable Logging</h4>
                  <p className="text-sm text-green-700">Log system activities and errors</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableLogging}
                onChange={(e) => updateSetting('enableLogging', e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
            </div>
          </div>
          
          <div className="border-t pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Settings Backup & Restore</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  const dataStr = JSON.stringify(settings, null, 2);
                  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                  const exportFileDefaultName = `discovergroup-settings-${new Date().toISOString().split('T')[0]}.json`;
                  
                  const linkElement = document.createElement('a');
                  linkElement.setAttribute('href', dataUri);
                  linkElement.setAttribute('download', exportFileDefaultName);
                  linkElement.click();
                }}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export Settings</span>
              </button>
              
              <label className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>Import Settings</span>
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const importedSettings = JSON.parse(event.target?.result as string);
                          setSettings(importedSettings);
                          setSaved(false);
                        } catch (error) {
                          console.error('Error importing settings:', error);
                          alert('Invalid settings file format');
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Export your current configuration or import previously saved settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagementSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Management</h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Registration & Access Control</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <UserPlus className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <h4 className="font-medium text-blue-900">Auto-approve New Users</h4>
                    <p className="text-sm text-blue-700">Automatically approve new user registrations</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowRegistration}
                  onChange={(e) => updateSetting('allowRegistration', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default User Role
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="customer">Customer</option>
                    <option value="agent">Travel Agent</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Verification Method
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="email">Email Verification</option>
                    <option value="manual">Manual Approval</option>
                    <option value="automatic">Automatic</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Account Management</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-green-500 mr-3" />
                  <div>
                    <h4 className="font-medium text-green-900">Track User Activity</h4>
                    <p className="text-sm text-green-700">Log user actions and sessions</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-500 mr-3" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Auto-deactivate Inactive</h4>
                    <p className="text-sm text-yellow-700">Deactivate after 90 days</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={false}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <Trash2 className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <h4 className="font-medium text-red-900">Allow Account Deletion</h4>
                    <p className="text-sm text-red-700">Users can delete accounts</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Data Management</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export User Data</span>
              </button>
              
              <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                <Upload className="h-4 w-4" />
                <span>Import Users</span>
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Bulk Actions</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                <UserMinus className="h-4 w-4" />
                <span>Bulk Deactivate</span>
              </button>
              
              <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors">
                <Mail className="h-4 w-4" />
                <span>Send Notifications</span>
              </button>

              <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                <Shield className="h-4 w-4" />
                <span>Reset Passwords</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Interface Preferences</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['light', 'dark', 'auto'].map((themeOption) => (
                <div
                  key={themeOption}
                  className={`relative cursor-pointer rounded-lg p-4 border-2 transition-colors ${
                    settings.theme === themeOption ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateSetting('theme', themeOption)}
                >
                  <div className="flex items-center justify-center mb-2">
                    {themeOption === 'light' && <Monitor className="h-8 w-8 text-gray-600" />}
                    {themeOption === 'dark' && <Monitor className="h-8 w-8 text-gray-900" />}
                    {themeOption === 'auto' && <Smartphone className="h-8 w-8 text-blue-600" />}
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-medium capitalize ${
                      settings.theme === themeOption ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {themeOption}
                    </p>
                  </div>
                  {settings.theme === themeOption && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Show Welcome Tour</h4>
                <p className="text-sm text-gray-600">Display guided tour for new users</p>
              </div>
              <input
                type="checkbox"
                checked={settings.showWelcomeTour}
                onChange={(e) => updateSetting('showWelcomeTour', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Enable Dark Mode</h4>
                <p className="text-sm text-gray-600">Use dark theme for better low-light viewing</p>
              </div>
              <input
                type="checkbox"
                checked={settings.enableDarkMode}
                onChange={(e) => updateSetting('enableDarkMode', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Compact Sidebar</h4>
                <p className="text-sm text-gray-600">Use smaller sidebar for more content space</p>
              </div>
              <input
                type="checkbox"
                checked={settings.compactSidebar}
                onChange={(e) => updateSetting('compactSidebar', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'security': return renderSecuritySettings();
      case 'users': return renderUserManagementSettings();
      case 'email': return renderEmailSettings();
      case 'notifications': return renderNotificationSettings();
      case 'business': return renderBusinessSettings();
      case 'system': return renderSystemSettings();
      case 'appearance': return renderAppearanceSettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="h-8 w-8 text-gray-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="text-sm text-gray-600">Configure your admin panel and business rules</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {saved ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Settings saved successfully</span>
            </div>
          ) : (
            <div className="flex items-center text-orange-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Unsaved changes - click Save to apply</span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              loading 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : saved
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{loading ? 'Saving...' : saved ? 'Saved' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;