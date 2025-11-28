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
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import SalesDepartment from './pages/SalesDepartment';
import MapMarkersManagement from './pages/MapMarkersManagement';
import HomepageManagement from './pages/HomepageManagement';
import CountryManagement from './pages/CountryManagement';
import PromoBannerManagement from './pages/PromoBannerManagement';
import VisaAssistanceManagement from './pages/VisaAssistanceManagement';
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
                  allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.BOOKING_DEPARTMENT]}
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
                  allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.BOOKING_DEPARTMENT]}
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
                  allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.BOOKING_DEPARTMENT]}
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
                  allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.BOOKING_DEPARTMENT]}
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
                  allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.BOOKING_DEPARTMENT, UserRole.CSR_DEPARTMENT]}
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
                  allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.VISA_DEPARTMENT]}
                >
                  <VisaAssistanceManagement />
                </ProtectedRoute>
              }
            />

            {/* Customer Service - CSR Department & Administrator */}
            <Route
              path="/customer-service"
              element={
                <ProtectedRoute 
                  requiredPermission="canAccessCustomerService"
                  allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.CSR_DEPARTMENT, UserRole.VISA_DEPARTMENT]}
                >
                  <CustomerService />
                </ProtectedRoute>
              }
            />

            {/* Sales Department - Meta Business Suite Integration */}
            <Route
              path="/sales"
              element={
                <ProtectedRoute 
                  requiredPermission="canAccessSales"
                  allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.BOOKING_DEPARTMENT]}
                >
                  <SalesDepartment />
                </ProtectedRoute>
              }
            />

            {/* Map Markers Management - Administrator & Web Developer */}
            <Route
              path="/map-markers"
              element={
                <ProtectedRoute 
                  requiredPermission="canAccessSettings"
                  allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.WEB_DEVELOPER]}
                >
                  <MapMarkersManagement />
                </ProtectedRoute>
              }
            />

            {/* Reports - All departments can access reports */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute requiredPermission="canAccessReports">
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* User Management - Administrator & Web Developer */}
            <Route
              path="/users"
              element={
                <ProtectedRoute 
                  requiredPermission="canAccessUserManagement"
                  allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.WEB_DEVELOPER]}
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
                  allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.WEB_DEVELOPER]}
                >
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Homepage Management - Administrator & Web Developer */}
            <Route
              path="/homepage"
              element={
                <ProtectedRoute 
                  requiredPermission="canAccessSettings"
                  allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.WEB_DEVELOPER]}
                >
                  <HomepageManagement />
                </ProtectedRoute>
              }
            />

            {/* Country Management - Administrator & Web Developer */}
            <Route
              path="/countries"
              element={
                <ProtectedRoute 
                  requiredPermission="canAccessSettings"
                  allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.WEB_DEVELOPER]}
                >
                  <CountryManagement />
                </ProtectedRoute>
              }
            />

            {/* Promo Banner Management - Administrator & Web Developer */}
            <Route
              path="/promo-banners"
              element={
                <ProtectedRoute 
                  requiredPermission="canAccessSettings"
                  allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.WEB_DEVELOPER]}
                >
                  <PromoBannerManagement />
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