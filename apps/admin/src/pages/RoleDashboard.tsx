import React, { JSX, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { UserRole, ROLE_DISPLAY_NAMES } from "../types/auth";
import PermissionsTest from "../components/PermissionsTest";
import { fetchDashboardStats } from "../services/dashboardService";
import { 
  Users, 
  MapPin, 
  BookOpen, 
  Plane, 
  HeadphonesIcon, 
  BarChart3, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  MessageSquare,
  Calendar
} from "lucide-react";

interface DashboardStats {
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  tours: {
    total: number;
    active: number;
    upcoming: number;
  };
  visas: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  customerService: {
    openTickets: number;
    resolvedToday: number;
    avgResponseTime: string;
  };
  sales: {
    messagesReceived: number;
    leadsConverted: number;
    activeConversations: number;
  };
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
}

// Super Admin Dashboard - Shows all department data
const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    bookings: {
      total: 186,
      pending: 12,
      confirmed: 45,
      completed: 120,
      cancelled: 9
    },
    tours: {
      total: 15,
      active: 12,
      upcoming: 8
    },
    visas: {
      total: 23,
      pending: 5,
      approved: 18,
      rejected: 0
    },
    customerService: {
      openTickets: 7,
      resolvedToday: 12,
      avgResponseTime: "15 min"
    },
    sales: {
      messagesReceived: 34,
      leadsConverted: 8,
      activeConversations: 12
    },
    revenue: {
      today: 3250,
      thisWeek: 18750,
      thisMonth: 65400,
      total: 245000
    },
    users: {
      total: 24,
      active: 18,
      newThisMonth: 3
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats from API
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(stats.revenue.total)}</p>
              <p className="text-blue-100 text-xs mt-2">
                <span className="text-green-300">↑ {formatCurrency(stats.revenue.thisMonth)}</span> this month
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Bookings</p>
              <p className="text-3xl font-bold mt-1">{stats.bookings.total}</p>
              <p className="text-green-100 text-xs mt-2">
                <span className="text-green-200">{stats.bookings.pending} pending</span>
              </p>
            </div>
            <BookOpen className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Active Tours</p>
              <p className="text-3xl font-bold mt-1">{stats.tours.active}</p>
              <p className="text-purple-100 text-xs mt-2">
                {stats.tours.total} total tours
              </p>
            </div>
            <MapPin className="w-12 h-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Active Users</p>
              <p className="text-3xl font-bold mt-1">{stats.users.active}</p>
              <p className="text-orange-100 text-xs mt-2">
                {stats.users.total} total users
              </p>
            </div>
            <Users className="w-12 h-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Department Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Department */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
              Booking Department
            </h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Active</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-blue-600">{stats.bookings.pending}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{stats.bookings.confirmed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-purple-600">{stats.bookings.completed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.bookings.cancelled}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Next departure: Jan 15, 2025</span>
            </div>
          </div>
        </div>

        {/* Visa Department */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Plane className="w-5 h-5 mr-2 text-yellow-600" />
              Visa Department
            </h3>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Active</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.visas.pending}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.visas.approved}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.visas.rejected}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-sm font-bold text-green-600">
                {Math.round((stats.visas.approved / stats.visas.total) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Customer Service Department */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <HeadphonesIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Customer Service
            </h3>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">Active</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Open Tickets</p>
              <p className="text-2xl font-bold text-orange-600">{stats.customerService.openTickets}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Resolved Today</p>
              <p className="text-2xl font-bold text-green-600">{stats.customerService.resolvedToday}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg. Response Time</span>
              <span className="text-sm font-bold text-blue-600">{stats.customerService.avgResponseTime}</span>
            </div>
          </div>
        </div>

        {/* Sales Department */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-pink-600" />
              Sales Department
            </h3>
            <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">Active</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Messages Today</p>
              <p className="text-2xl font-bold text-blue-600">{stats.sales.messagesReceived}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Leads Converted</p>
              <p className="text-2xl font-bold text-green-600">{stats.sales.leadsConverted}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Conversations</span>
              <span className="text-sm font-bold text-purple-600">{stats.sales.activeConversations}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Revenue Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Today</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue.today)}</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">This Week</p>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(stats.revenue.thisWeek)}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">This Month</p>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(stats.revenue.thisMonth)}</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">All Time</p>
            <p className="text-2xl font-bold text-purple-700">{formatCurrency(stats.revenue.total)}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg text-white shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-lg text-sm font-medium transition-colors">
            View All Bookings
          </button>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-lg text-sm font-medium transition-colors">
            Manage Tours
          </button>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-lg text-sm font-medium transition-colors">
            View Reports
          </button>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-lg text-sm font-medium transition-colors">
            User Management
          </button>
        </div>
      </div>
    </div>
  );
};

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
      case UserRole.SUPER_ADMIN:
        return <SuperAdminDashboard />;
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