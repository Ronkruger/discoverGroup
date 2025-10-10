import React, { useState } from 'react';
import { UserCheck, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { LoginCredentials } from '../types/auth';
import { authService } from '../services/authService';

interface AuthPageProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, isLoading, error }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(loginForm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4 shadow-lg">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DiscoverGroup Admin</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
              <p className="font-medium mb-2">Super Admin Credentials:</p>
              <div className="space-y-1 text-xs bg-white p-3 rounded border">
                <p className="font-medium text-blue-700">Email: superadmin@discovergroup.com</p>
                <p className="font-medium text-blue-700">Password: superadmin123</p>
              </div>
              <p className="mt-3 font-medium mb-1">Demo Accounts:</p>
              <div className="space-y-1 text-xs">
                <p>• admin@discovergroup.com (Administrator)</p>
                <p>• booking@discovergroup.com (Booking Dept.)</p>
                <p>• visa@discovergroup.com (Visa Dept.)</p>
                <p>• csr@discovergroup.com (Customer Service)</p>
                <p className="font-medium">Password: demo123</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Admin Note */}
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> Only administrators and web developers can create new user accounts. 
              Contact your system administrator or web developer for account creation.
            </p>
          </div>
        </div>

        {/* Development Reset Button */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                authService.resetUsersStorage();
                setLoginForm({ email: '', password: '' });
                alert('User storage reset! You can now login with super admin credentials.');
              }}
              className="w-full text-sm text-gray-500 hover:text-red-600 underline"
            >
              🔧 Reset User Storage (Dev Only)
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Secure admin access for DiscoverGroup team members
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;