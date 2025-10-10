import React, { JSX } from "react";
import { useAuth } from "../contexts/AuthContext";
import { UserRole, ROLE_DISPLAY_NAMES } from "../types/auth";
import PermissionsTest from "../components/PermissionsTest";
import { 
  Users, 
  MapPin, 
  BookOpen, 
  Plane, 
  HeadphonesIcon, 
  BarChart3, 
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Role-specific dashboard components
const AdministratorDashboard: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center">
          <Users className="w-8 h-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-blue-600">Total Users</p>
            <p className="text-2xl font-bold text-blue-900">24</p>
          </div>
        </div>
      </div>
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center">
          <MapPin className="w-8 h-8 text-green-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-green-600">Active Tours</p>
            <p className="text-2xl font-bold text-green-900">15</p>
          </div>
        </div>
      </div>
      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
        <div className="flex items-center">
          <BookOpen className="w-8 h-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-purple-600">Total Bookings</p>
            <p className="text-2xl font-bold text-purple-900">186</p>
          </div>
        </div>
      </div>
      <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
        <div className="flex items-center">
          <BarChart3 className="w-8 h-8 text-orange-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-orange-600">Revenue</p>
            <p className="text-2xl font-bold text-orange-900">$24.5K</p>
          </div>
        </div>
      </div>
    </div>
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
      <p className="text-gray-600">Welcome, Administrator! You have full access to all system functions.</p>
    </div>
  </div>
);

const BookingDepartmentDashboard: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center">
          <Clock className="w-8 h-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-blue-600">Pending Bookings</p>
            <p className="text-2xl font-bold text-blue-900">12</p>
          </div>
        </div>
      </div>
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-green-600">Confirmed Today</p>
            <p className="text-2xl font-bold text-green-900">8</p>
          </div>
        </div>
      </div>
      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
        <div className="flex items-center">
          <MapPin className="w-8 h-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-purple-600">Available Tours</p>
            <p className="text-2xl font-bold text-purple-900">15</p>
          </div>
        </div>
      </div>
    </div>
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Department Dashboard</h3>
      <p className="text-gray-600">Manage tour bookings and inventory. You have access to booking management and tour creation.</p>
    </div>
  </div>
);

const VisaDepartmentDashboard: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <div className="flex items-center">
          <Plane className="w-8 h-8 text-yellow-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-yellow-600">Visa Applications</p>
            <p className="text-2xl font-bold text-yellow-900">23</p>
          </div>
        </div>
      </div>
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-green-600">Approved</p>
            <p className="text-2xl font-bold text-green-900">18</p>
          </div>
        </div>
      </div>
      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <div className="flex items-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-red-600">Pending Review</p>
            <p className="text-2xl font-bold text-red-900">5</p>
          </div>
        </div>
      </div>
    </div>
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Visa Department Dashboard</h3>
      <p className="text-gray-600">Process visa applications and provide travel documentation assistance.</p>
    </div>
  </div>
);

const CSRDepartmentDashboard: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center">
          <HeadphonesIcon className="w-8 h-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-blue-600">Open Tickets</p>
            <p className="text-2xl font-bold text-blue-900">7</p>
          </div>
        </div>
      </div>
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-green-600">Resolved Today</p>
            <p className="text-2xl font-bold text-green-900">12</p>
          </div>
        </div>
      </div>
      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
        <div className="flex items-center">
          <BookOpen className="w-8 h-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-purple-600">Active Bookings</p>
            <p className="text-2xl font-bold text-purple-900">45</p>
          </div>
        </div>
      </div>
    </div>
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Service Dashboard</h3>
      <p className="text-gray-600">Handle customer inquiries and provide support for bookings and travel issues.</p>
    </div>
  </div>
);

export default function Home(): JSX.Element {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Loading user information...</p>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case UserRole.ADMINISTRATOR:
        return <AdministratorDashboard />;
      case UserRole.BOOKING_DEPARTMENT:
        return <BookingDepartmentDashboard />;
      case UserRole.VISA_DEPARTMENT:
        return <VisaDepartmentDashboard />;
      case UserRole.CSR_DEPARTMENT:
        return <CSRDepartmentDashboard />;
      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Welcome</h3>
            <p className="text-gray-600">Welcome to the admin dashboard!</p>
          </div>
        );
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.fullName}!
        </h1>
        <p className="text-gray-600">
          {ROLE_DISPLAY_NAMES[user.role]} Dashboard
        </p>
      </div>

      {/* Permissions Test Component */}
      <PermissionsTest user={user} />

      {/* Role-specific dashboard */}
      {renderDashboard()}
    </div>
  );
}