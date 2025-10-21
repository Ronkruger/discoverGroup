import React, { useEffect, useState } from "react";
import { fetchTours, type Tour } from "../../services/apiClient";
import { Link } from "react-router-dom";

// Extended Tour type to include pricing and sale fields
interface ExtendedTour extends Tour {
  regularPricePerPerson?: number;
  promoPricePerPerson?: number;
  isSaleEnabled?: boolean;
  saleEndDate?: string | null;
}

export default function ManageTours(): React.ReactElement {
  const [tours, setTours] = useState<ExtendedTour[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    try {
      setLoading(true);
      const data = await fetchTours() as ExtendedTour[];
      setTours(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load tours";
      setError(errorMessage);
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col">
      {/* Top nav bar */}
      <header className="w-full px-8 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="font-bold text-lg">Admin UI</div>
        <nav className="flex gap-6 items-center text-sm">
          <Link to="/" className="hover:text-pink-500">Home</Link>
          <Link to="/tours" className="font-semibold text-pink-600">Tours</Link>
          <Link to="/tours/create" className="hover:text-pink-500">Create</Link>
        </nav>
        <div className="text-xs text-gray-500">You're signed in</div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:block w-48 bg-[#fafafa] border-r border-gray-100 pt-8 min-h-screen">
          <nav className="flex flex-col gap-2 px-4">
            <Link
              to="/"
              className="block py-2 px-4 rounded bg-white text-gray-700 hover:bg-pink-50 transition"
            >
              Home
            </Link>
            <Link
              to="/tours"
              className="block py-2 px-4 rounded bg-pink-100 text-pink-600 font-medium"
            >
              Tours
            </Link>
            <Link
              to="/tours/create"
              className="block py-2 px-4 rounded bg-pink-50 text-pink-500 font-medium"
            >
              Create
            </Link>
            <button
              className="block text-left py-2 px-4 rounded bg-white text-gray-700 hover:bg-pink-50 transition"
              disabled
            >
              Settings
            </button>
            <button
              className="block text-left py-2 px-4 rounded bg-white text-gray-700 hover:bg-pink-50 transition"
              disabled
            >
              Integrations
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center px-2 md:px-0 pt-10 pb-20">
          <div className="w-full max-w-3xl">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mx-auto p-6 md:p-8 mt-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-xl">Tours</h2>
                <Link
                  to="/tours/create"
                  className="px-4 py-2 rounded bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold text-sm shadow hover:from-pink-500 hover:to-pink-600 transition"
                >
                  + Create Tour
                </Link>
              </div>
              {loading ? (
                <div className="text-center text-gray-400 py-12">Loading...</div>
              ) : error ? (
                <div className="text-red-600 py-6">{error}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Title</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Slug</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Line</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Duration</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Regular Price</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Promo Price</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Sale Enabled</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Sale Ends</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!tours || tours.length === 0) ? (
                        <tr>
                          <td className="text-center text-gray-400 py-6" colSpan={9}>
                            No tours found.
                          </td>
                        </tr>
                      ) : (
                        tours.map((tour) => (
                          <tr key={tour.id} className="border-t last:border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{tour.title}</td>
                            <td className="py-3 px-4">{tour.slug}</td>
                            <td className="py-3 px-4">{tour.line}</td>
                            <td className="py-3 px-4">{tour.durationDays}</td>
                            <td className="py-3 px-4">{tour.regularPricePerPerson ? `₱${tour.regularPricePerPerson.toLocaleString()}` : "--"}</td>
                            <td className="py-3 px-4">{tour.promoPricePerPerson ? `₱${tour.promoPricePerPerson.toLocaleString()}` : "--"}</td>
                            <td className="py-3 px-4">{tour.isSaleEnabled ? "Yes" : "No"}</td>
                            <td className="py-3 px-4">
                              {tour.saleEndDate
                                ? new Date(tour.saleEndDate).toLocaleDateString()
                                : "--"}
                            </td>
                            <td className="py-3 px-4">
                              <Link
                                to={`/tours/${tour.id}/edit`}
                                className="px-4 py-1 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded font-medium text-xs shadow hover:from-pink-500 hover:to-pink-600 transition"
                              >
                                Edit
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}