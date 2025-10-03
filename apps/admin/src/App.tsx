import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ToursList from "./pages/tours";
import CreateTour from "./pages/tours/create";
import EditTour from "./pages/tours/[id]";

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
        <Navbar />

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/tours"
              element={
                <div style={{ maxWidth: 1100, margin: "20px auto", padding: "0 20px" }}>
                  <ToursList />
                </div>
              }
            />
            <Route
              path="/tours/create"
              element={
                <div style={{ maxWidth: 1100, margin: "20px auto", padding: "0 20px" }}>
                  <CreateTour />
                </div>
              }
            />
            <Route
              path="/tours/:id"
              element={
                <div style={{ maxWidth: 1100, margin: "20px auto", padding: "0 20px" }}>
                  <EditTour />
                </div>
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}