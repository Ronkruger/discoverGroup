import { useEffect, useState } from "react";
import { fetchTours } from "../api/tours";
import type { Tour } from "../types";
import TourCard from "../components/TourCard";

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
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Our Routes</h1>

      {/* Filter Controls */}
      <div className="mb-6 flex flex-wrap gap-3">
        {/* All Routes button */}
        <button
          onClick={() => setFilter("ALL")}
          className={`px-4 py-2 rounded-lg border ${
            filter === "ALL"
              ? "bg-gray-800 text-white border-gray-800"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
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
              className={`px-4 py-2 rounded-lg border ${
                filter === line
                  ? `bg-${color} text-white border-${color}`
                  : `bg-white text-gray-700 border-gray-300 hover:bg-${color}/20`
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
          <p className="col-span-full text-gray-500">No tours found.</p>
        )}
      </div>
    </main>
  );
}
