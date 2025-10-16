
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, ROLE_PERMISSIONS } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: keyof typeof ROLE_PERMISSIONS[UserRole.ADMINISTRATOR];
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission,
  allowedRoles 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />;
  }

  // Debug log for role check
  if (allowedRoles) {
    // Print both as arrays of strings for clarity
    console.log('[ProtectedRoute] user.role:', user.role, 'allowedRoles:', allowedRoles);
    if (!allowedRoles.includes(user.role)) {
      console.warn('[ProtectedRoute] Access denied for role:', user.role, 'allowedRoles:', allowedRoles);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check permission-based access if requiredPermission is specified
  if (requiredPermission) {
    // ROLE_PERMISSIONS is expected to be a map of role -> { [permissionName]: boolean } or similar
    // Cast via unknown first to satisfy TypeScript when converting between incompatible types.
    const rolePermissions = (ROLE_PERMISSIONS[user.role as UserRole] as unknown) as Record<string, boolean> | undefined;
    const hasPermission = !!(rolePermissions && rolePermissions[requiredPermission as string]);
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;