import React, { JSX } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthPage from "./components/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import Home from "./pages/RoleDashboard";
import ToursList from "./pages/tours";
import TourForm from "./pages/tours/TourForm";
import ManageBookings from "./pages/bookings";
import UserManagement from "./pages/UserManagement";
import CustomerService from "./pages/customer-service";
import { UserRole } from "./types/auth";

// Loading component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Main App Router Component
const AppRouter: React.FC = () => {
  const { isAuthenticated, isLoading, login, error } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <AuthPage
        onLogin={login}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  return (
    <div className="admin-shell">
      <Navbar />

      <div className="admin-main">
        <Sidebar />

        <div className="content">
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />
            
            {/* Tours Management - Booking Department & Administrator */}
            <Route
              path="/tours"
              element={
                <ProtectedRoute 
                  requiredPermission="canAccessTours"
                  allowedRoles={[UserRole.ADMINISTRATOR, UserRole.BOOKING_DEPARTMENT]}
                >
                  <ToursList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tours/create"
              element={
                <ProtectedRoute 
                  requiredPermission="canAccessTours"
                  allowedRoles={[UserRole.ADMINISTRATOR, UserRole.BOOKING_DEPARTMENT]}
                >
                  <TourForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tours/:id"
              element={
                <ProtectedRoute 
                  requiredPermission="canAccessTours"
                  allowedRoles={[UserRole.ADMINISTRATOR, UserRole.BOOKING_DEPARTMENT]}
                >
                  <TourForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tours/:id/edit"
              element={
                <ProtectedRoute 
                  requiredPermission="canAccessTours"
                  allowedRoles={[UserRole.ADMINISTRATOR, UserRole.BOOKING_DEPARTMENT]}
                >
                  <TourForm />
                </ProtectedRoute>
              }
            />

            {/* Bookings Management - Booking Department, CSR & Administrator */}
            <Route
              path="/bookings"
              element={
                <ProtectedRoute 
                  requiredPermission="canAccessBookings"
                  allowedRoles={[UserRole.ADMINISTRATOR, UserRole.BOOKING_DEPARTMENT, UserRole.CSR_DEPARTMENT]}
                >
                  <ManageBookings />
                </ProtectedRoute>
              }
            />

            {/* Visa Assistance - Visa Department & Administrator */}
            <Route
              path="/visa-assistance"
              element={
                <ProtectedRoute 
                  requiredPermission="canAccessVisaAssistance"
                  allowedRoles={[UserRole.ADMINISTRATOR, UserRole.VISA_DEPARTMENT]}
                >
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Visa Assistance</h1>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800">Visa assistance management will be implemented here.</p>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Customer Service - CSR Department & Administrator */}
            <Route
              path="/customer-service"
              element={
                <ProtectedRoute 
                  requiredPermission="canAccessCustomerService"
                  allowedRoles={[UserRole.ADMINISTRATOR, UserRole.CSR_DEPARTMENT, UserRole.VISA_DEPARTMENT]}
                >
                  <CustomerService />
                </ProtectedRoute>
              }
            />

            {/* Reports - All departments can access reports */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute requiredPermission="canAccessReports">
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Reports</h1>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <p className="text-purple-800">Reports and analytics will be implemented here.</p>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* User Management - Administrator & Web Developer */}
            <Route
              path="/users"
              element={
                <ProtectedRoute 
                  requiredPermission="canAccessUserManagement"
                  allowedRoles={[UserRole.ADMINISTRATOR, UserRole.WEB_DEVELOPER]}
                >
                  <UserManagement />
                </ProtectedRoute>
              }
            />

            {/* Settings - Administrator & Web Developer */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute 
                  requiredPermission="canAccessSettings"
                  allowedRoles={[UserRole.ADMINISTRATOR, UserRole.WEB_DEVELOPER]}
                >
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-800">System settings will be implemented here.</p>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Unauthorized access */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Redirect to login for auth routes */}
            <Route path="/auth" element={<Navigate to="/" replace />} />
            
            {/* 404 - Redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default function App(): JSX.Element {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}