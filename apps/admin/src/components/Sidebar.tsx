import React, { JSX } from "react";
import { NavLink } from "react-router-dom";
import { 
  Home, 
  MapPin, 
  Plus, 
  BookOpen, 
  Users, 
  Settings, 
  HeadphonesIcon,
  Plane,
  BarChart3,
  MessageSquare,
  Map,
  Globe
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: keyof import('../types/auth').RolePermissions;
  exact?: boolean;
}

const navigationItems: NavItem[] = [
  {
    to: "/",
    label: "Dashboard",
    icon: Home,
    exact: true,
  },
  {
    to: "/tours",
    label: "Tours",
    icon: MapPin,
    permission: "canAccessTours",
  },
  {
    to: "/tours/create",
    label: "Create Tour",
    icon: Plus,
    permission: "canAccessTours",
  },
  {
    to: "/bookings",
    label: "Manage Bookings",
    icon: BookOpen,
    permission: "canAccessBookings",
  },
  {
    to: "/visa-assistance",
    label: "Visa Assistance",
    icon: Plane,
    permission: "canAccessVisaAssistance",
  },
  {
    to: "/customer-service",
    label: "Customer Service",
    icon: HeadphonesIcon,
    permission: "canAccessCustomerService",
  },
  {
    to: "/sales",
    label: "Sales Department",
    icon: MessageSquare,
    permission: "canAccessSales",
  },
  {
    to: "/map-markers",
    label: "Map Markers",
    icon: Map,
    permission: "canAccessSettings",
  },
  {
    to: "/reports",
    label: "Reports",
    icon: BarChart3,
    permission: "canAccessReports",
  },
  {
    to: "/users",
    label: "User Management",
    icon: Users,
    permission: "canAccessUserManagement",
  },
  {
    to: "/homepage",
    label: "Homepage",
    icon: Globe,
    permission: "canAccessSettings",
  },
  {
    to: "/countries",
    label: "Countries",
    icon: MapPin,
    permission: "canAccessSettings",
  },
  {
    to: "/settings",
    label: "Settings",
    icon: Settings,
    permission: "canAccessSettings",
  },
];

export default function Sidebar(): JSX.Element {
  const { user } = useAuth();

  const hasPermission = (permission?: keyof import('../types/auth').RolePermissions): boolean => {
    if (!permission) return true; // No permission required
    if (!user) return false;
    return authService.hasPermission(permission, user);
  };

  const visibleItems = navigationItems.filter(item => hasPermission(item.permission));

  return (
    <aside className="sidebar" aria-label="Admin navigation">
      <div className="brand">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">DG</span>
          </div>
          <span className="font-semibold text-gray-900">Admin Panel</span>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-4 py-3 border-b border-gray-200 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100">
                  <span className="text-blue-600 font-semibold text-sm">
                    {user.fullName ? user.fullName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase() : ''}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.fullName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.department}
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Role Badge */}
      {user && (
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Role</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user.role === 'administrator' 
                ? 'bg-red-100 text-red-800'
                : user.role === 'booking_department'
                ? 'bg-blue-100 text-blue-800'
                : user.role === 'visa_department'
                ? 'bg-green-100 text-green-800'
                : 'bg-purple-100 text-purple-800'
            }`}>
              {user.department}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}