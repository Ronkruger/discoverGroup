import React from 'react';
import { authService } from '../services/authService';
import { ROLE_DISPLAY_NAMES, UserRole, User } from '../types/auth';

interface PermissionsTestProps {
  user: User | null;
}

const PermissionsTest: React.FC<PermissionsTestProps> = ({ user }) => {
  if (!user) return null;

  const permissions = authService.getNavigationItems(user);
  const canManageBookings = authService.canManageBookings(user);
  const canManageTours = authService.canManageTours(user);
  const canProcessVisa = authService.canProcessVisa(user);
  const canAccessCS = authService.canAccessCustomerService(user);

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMINISTRATOR:
        return 'bg-red-100 text-red-800';
      case UserRole.WEB_DEVELOPER:
        return 'bg-orange-100 text-orange-800';
      case UserRole.BOOKING_DEPARTMENT:
        return 'bg-blue-100 text-blue-800';
      case UserRole.VISA_DEPARTMENT:
        return 'bg-green-100 text-green-800';
      case UserRole.CSR_DEPARTMENT:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold">Current User Permissions</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
          {ROLE_DISPLAY_NAMES[user.role]}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Available Navigation Items</h4>
          <div className="space-y-2">
            {permissions.length > 0 ? (
              permissions.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-gray-700 capitalize">
                    {item.replace('-', ' ')}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-sm text-gray-500">No navigation items available</span>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Department Capabilities</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Manage Bookings</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                canManageBookings ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {canManageBookings ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Manage Tours</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                canManageTours ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {canManageTours ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Process Visas</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                canProcessVisa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {canProcessVisa ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Customer Service</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                canAccessCS ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {canAccessCS ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">
          <strong>Department Access Pattern:</strong> {' '}
          {user.role === UserRole.BOOKING_DEPARTMENT && 
            "Full booking and tour management capabilities"}
          {user.role === UserRole.VISA_DEPARTMENT && 
            "Visa processing and limited booking visibility"}
          {user.role === UserRole.CSR_DEPARTMENT && 
            "Customer service and booking status management"}
          {(user.role === UserRole.ADMINISTRATOR || user.role === UserRole.WEB_DEVELOPER) && 
            "Full system access and management"}
        </p>
      </div>
    </div>
  );
};

export default PermissionsTest;