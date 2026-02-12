import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
import { Suspense, lazy } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Loading from "./components/Loading";
import ScrollToTop from "./components/ScrollToTop";
import React from "react";
import { useTheme } from "./context/ThemeContext";
import BookingErrorBoundary from "./components/BookingErrorBoundary";

// Redirect component for slug-based routes
function RedirectWithSlug({ to }: { to: string }) {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={to.replace(':slug', slug || '')} replace />;
}


import Booking from "./pages/Booking";
import ViewBookings from "./pages/ViewBookings";

import BookingConfirmation from "./pages/BookingConfirmation";
import VisaAssistance from "./pages/VisaAssistance";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const RoutesPage = lazy(() => import("./pages/RoutesPage"));
const TourDetail = lazy(() => import("./pages/TourDetailNew"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const TourBuilder = lazy(() => import("./pages/TourBuilder"));
const DestinationCountry = lazy(() => import("./pages/DestinationCountry"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Profile = lazy(() => import("./pages/Profile"));
const UserSettings = lazy(() => import("./pages/UserSettings"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Favorites = lazy(() => import("./pages/Favorites"));
const WaysToGo = lazy(() => import("./pages/WaysToGo"));
const Deals = lazy(() => import("./pages/Deals"));

function AppContent() {
  const { darkMode } = useTheme();

  return (
    <div className={`${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'} min-h-screen transition-colors duration-300`}>
      <ScrollToTop />
      <Header />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/routes" element={<RoutesPage />} />

          {/* Destinations listing + country */}
          <Route path="/destinations" element={<RoutesPage />} /> {/* placeholder for "all destinations" */}
          <Route path="/destinations/:country" element={<DestinationCountry />} />

          {/* Search results */}
          <Route path="/search" element={<SearchResults />} />

          {/* Canonical singular routes */}
          <Route path="/tour/:slug" element={<TourDetail />} />
          <Route path="/tour/builder/:slug" element={<TourBuilder />} />
          <Route path="/tour/builder" element={<TourBuilder />} />


          {/* Booking route - wrapped in error boundary */}
          <Route path="/booking/:slug" element={
            <BookingErrorBoundary>
              <Booking />
            </BookingErrorBoundary>
          } />

          {/* My Bookings (user bookings list) */}
          <Route path="/bookings" element={<ViewBookings />} />

          {/* Booking confirmation route */}
          <Route path="/booking/confirmation" element={<BookingConfirmation />} />
          <Route path="/booking/confirmation/:bookingId" element={<BookingConfirmation />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="/favorites" element={<Favorites />} />

          {/* Redirect plural → singular for compatibility */}
          <Route path="/tours/:slug" element={<RedirectWithSlug to="/tour/:slug" />} />
          <Route path="/tours/:slug/builder" element={<RedirectWithSlug to="/tour/builder/:slug" />} />

          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/ways-to-go" element={<WaysToGo />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/visa-assistance" element={<VisaAssistance />} />

          {/* Helpful fallback route to display when no route matches (avoids silent console-only warnings) */}
          <Route
            path="*"
            element={
              <main className="container mx-auto px-5 py-10">
                <h1 className="text-2xl font-bold text-slate-900 mb-3">Page not found</h1>
                <p className="text-slate-600 mb-6">
                  We couldn't find the page you're looking for. Try going back to{" "}
                  <a href="/" className="text-rose-600 underline">Home</a>.
                </p>
              </main>
            }
          />
        </Routes>
      </Suspense>
      <Footer />
    </div>
  );
}

export default function AppRouter() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}