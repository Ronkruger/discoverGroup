import { useEffect, useState } from "react";
import { fetchTours } from "../api/tours";
import type { Tour } from "../types";
import TourCard from "../components/TourCard";
import React from "react";

export default function RoutesPage() {
  const [tours, setTours] = useState<Tour[]>([]);

  useEffect(() => {
    fetchTours().then(setTours);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Our Routes</h1>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {tours.length > 0 ? (
            tours.map((tour) => <TourCard key={tour.id} tour={tour} />)
          ) : (
            <p className="col-span-full text-gray-700 text-center py-12 text-lg">No tours found.</p>
          )}
        </div>
      </div>
    </main>
  );
}
