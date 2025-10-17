import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Loading from "./components/Loading";
import React from "react";


import Booking from "./pages/Booking";
import ViewBookings from "./pages/ViewBookings";

import BookingConfirmation from "./pages/BookingConfirmation";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const RoutesPage = lazy(() => import("./pages/RoutesPage"));
const TourDetail = lazy(() => import("./pages/TourDetail"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const TourBuilder = lazy(() => import("./pages/TourBuilder"));
const DestinationCountry = lazy(() => import("./pages/DestinationCountry"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const UserSettings = lazy(() => import("./pages/UserSettings"));
const AboutUs = lazy(() => import("./pages/AboutUs"));

export default function AppRouter() {
  return (
    <Router>
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


          {/* Booking route */}
          <Route path="/booking/:slug" element={<Booking />} />

          {/* My Bookings (user bookings list) */}
          <Route path="/bookings" element={<ViewBookings />} />

          {/* Booking confirmation route */}
          <Route path="/booking/confirmation" element={<BookingConfirmation />} />
          <Route path="/booking/confirmation/:bookingId" element={<BookingConfirmation />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<UserSettings />} />

          {/* Redirect plural → singular for compatibility */}
          <Route path="/tours/:slug" element={<Navigate to="/tour/:slug" replace />} />
          <Route path="/tours/:slug/builder" element={<Navigate to="/tour/builder/:slug" replace />} />

          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact" element={<ContactPage />} />

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
    </Router>
  );
}