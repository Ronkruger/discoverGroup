import { useEffect, useState } from "react";
import { fetchTours } from "../api/tours";
import type { Tour } from "../types";
import TourCard from "../components/TourCard";
import { Link } from "react-router-dom";

export default function Home() {
  const [tours, setTours] = useState<Tour[]>([]);

  useEffect(() => {
    fetchTours().then(setTours);
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Discover Europe with Discover Group
          </h1>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Explore iconic European destinations with our guided tours —
            guaranteed departures, flexible routes, and unforgettable
            experiences.
          </p>
          <Link
            to="/routes"
            className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg shadow hover:bg-yellow-300 transition"
          >
            View All Routes
          </Link>
        </div>
      </section>

      {/* Featured Routes */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          Featured Routes
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {tours.slice(0, 3).map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            to="/routes"
            className="text-blue-600 hover:underline font-medium"
          >
            Explore all routes →
          </Link>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-600 mb-6">
            Book your European adventure today with guaranteed departures and
            flexible itineraries.
          </p>
          <Link
            to="/contact"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500 transition"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
