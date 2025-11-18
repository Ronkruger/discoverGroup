import { useEffect, useState } from "react";
import { fetchTours } from "../api/tours";
import type { Tour } from "../types";
import TourCard from "../components/TourCard";
import React from "react";

// Color map per line
const lineColors: Record<string, string> = {
  RED: "red-600",
  BLUE: "blue-600",
  GREEN: "green-600",
  YELLOW: "yellow-500",
};

export default function RoutesPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchTours().then(setTours);
  }, []);

  const filteredTours =
    filter === "ALL" ? tours : tours.filter((t) => t.line === filter);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-white">Our Routes</h1>

        {/* Filter Controls */}
        <div className="mb-8 flex flex-wrap gap-3">
          {/* All Routes button */}
          <button
            onClick={() => setFilter("ALL")}
            className={`px-6 py-3 rounded-xl border transition-all font-semibold ${
              filter === "ALL"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg"
                : "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30"
            }`}
          >
            All Routes
          </button>

          {/* Line buttons */}
          {Object.keys(lineColors).map((line) => {
            const color = lineColors[line];
            return (
              <button
                key={line}
                onClick={() => setFilter(line)}
                className={`px-6 py-3 rounded-xl border transition-all font-semibold ${
                  filter === line
                    ? `bg-${color} text-white border-${color} shadow-lg`
                    : `bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30`
                }`}
              >
                {line} Line
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {filteredTours.length > 0 ? (
            filteredTours.map((tour) => <TourCard key={tour.id} tour={tour} />)
          ) : (
            <p className="col-span-full text-slate-300 text-center py-12 text-lg">No tours found.</p>
          )}
        </div>
      </div>
    </main>
  );
}
