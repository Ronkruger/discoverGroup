import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import RoutesPage from "./pages/RoutesPage";
import TourDetail from "./pages/TourDetail";
import TourBuilder from "./pages/TourBuilder";
import ContactPage from "./pages/ContactPage";
import DestinationCountry from "./pages/DestinationCountry";
import SearchResults from "./pages/SearchResults";
import Booking from "./pages/Booking";
import BookingConfirmation from "./pages/BookingConfirmation";
import ViewBookings from "./pages/ViewBookings";
import * as React from "react";
export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/routes" element={<RoutesPage />} />

        {/* Destinations listing + country */}
        <Route path="/destinations" element={<RoutesPage />} /> {/* placeholder for "all destinations" */}
        <Route path="/destinations/:country" element={<DestinationCountry />} />

        {/* Search results */}
        <Route path="/search" element={<SearchResults />} />

        {/* Tour pages */}
        <Route path="/tour/:slug" element={<TourDetail />} />
        <Route path="/tour/builder/:slug" element={<TourBuilder />} />

        {/* Booking flow */}
        <Route path="/booking/:slug" element={<Booking />} />
        <Route path="/booking/confirmation" element={<BookingConfirmation />} />
        <Route path="/bookings" element={<ViewBookings />} />

        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}