import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import ToursList from "./pages/tours";
import CreateTour from "./pages/tours/create";
import EditTour from "./pages/tours/[id]";

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <div className="admin-shell">
        <Navbar />

        <div className="admin-main">
          <Sidebar />

          <div className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/tours"
                element={
                  <div>
                    <ToursList />
                  </div>
                }
              />
              <Route
                path="/tours/create"
                element={
                  <div>
                    <CreateTour />
                  </div>
                }
              />
              <Route
                path="/tours/:id"
                element={
                  <div>
                    <EditTour />
                  </div>
                }
              />
            </Routes>
          </div>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}