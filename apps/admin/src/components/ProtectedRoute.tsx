import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';
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
  const user = authService.getCurrentUser();

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permission-based access if requiredPermission is specified
  if (requiredPermission && !authService.hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;