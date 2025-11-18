import React, { useEffect, useState } from "react";
import { fetchTours, deleteTour, type Tour } from "../../services/apiClient";
import { Link } from "react-router-dom";
import { Plus, Edit2, Trash2, ExternalLink, Loader2 } from "lucide-react";

// Extended Tour type to include pricing and sale fields and bookingPdfUrl
interface ExtendedTour extends Tour {
  regularPricePerPerson?: number;
  promoPricePerPerson?: number;
  isSaleEnabled?: boolean;
  saleEndDate?: string | null;
  bookingPdfUrl?: string | null;
}

export default function ManageTours(): React.ReactElement {
  const [tours, setTours] = useState<ExtendedTour[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

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

  const handleDelete = async (id: string | number) => {
    const ok = window.confirm("Are you sure you want to delete this tour? This action cannot be undone.");
    if (!ok) return;

    try {
      setDeletingId(id);
      await deleteTour(id);
      setTours(prev => (prev ? prev.filter(t => `${t.id}` !== `${id}`) : prev));
    } catch (err) {
      console.error("Delete failed", err);
      alert(err instanceof Error ? err.message : "Failed to delete tour");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tours</h1>
              <p className="text-gray-600">Manage your tour packages and itineraries</p>
            </div>
            <Link
              to="/tours/create"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 hover:from-pink-600 hover:to-rose-600 transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Create Tour
            </Link>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Loading tours...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="bg-red-50 text-red-600 px-6 py-4 rounded-lg border border-red-200">
                <p className="font-medium">{error}</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Slug</th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Line</th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                    <th className="py-4 px-6 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Regular Price</th>
                    <th className="py-4 px-6 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Promo Price</th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(!tours || tours.length === 0) ? (
                    <tr>
                      <td className="text-center py-16" colSpan={7}>
                        <div className="flex flex-col items-center">
                          <div className="bg-gray-100 rounded-full p-4 mb-4">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <p className="text-gray-500 font-medium mb-1">No tours found</p>
                          <p className="text-gray-400 text-sm">Create your first tour to get started</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    tours.map((tour, index) => (
                      <tr 
                        key={tour.id} 
                        className="hover:bg-gray-50 transition-colors duration-150"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 mb-1">{tour.title}</span>
                            {tour.summary && (
                              <span className="text-xs text-gray-500 line-clamp-1">{tour.summary}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">
                            {tour.slug}
                          </code>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            tour.line === 'ROUTE_A' ? 'bg-rose-100 text-rose-700' :
                            tour.line === 'ROUTE_B' ? 'bg-blue-100 text-blue-700' :
                            tour.line === 'RED' ? 'bg-red-100 text-red-700' :
                            tour.line === 'YELLOW' ? 'bg-yellow-100 text-yellow-700' :
                            tour.line === 'GREEN' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {tour.line}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                            <span className="text-lg font-bold text-gray-900">{tour.durationDays}</span>
                            <span className="text-xs text-gray-500">days</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="font-semibold text-gray-900">
                            {tour.regularPricePerPerson ? `₱${tour.regularPricePerPerson.toLocaleString()}` : "—"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {tour.promoPricePerPerson && tour.isSaleEnabled ? (
                            <div className="flex flex-col items-end">
                              <span className="font-semibold text-pink-600">
                                ₱{tour.promoPricePerPerson.toLocaleString()}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700 mt-1">
                                Sale Active
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            {/* Flipbook Button */}
                            {tour.bookingPdfUrl && (
                              <a
                                href={tour.bookingPdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150 group"
                                title="Open Flipbook"
                              >
                                <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              </a>
                            )}
                            
                            {/* Edit Button */}
                            <Link
                              to={`/tours/${tour.id}/edit`}
                              className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors duration-150 group"
                              title="Edit Tour"
                            >
                              <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </Link>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(tour.id)}
                              disabled={deletingId === tour.id}
                              className={`p-2 rounded-lg transition-colors duration-150 group ${
                                deletingId === tour.id 
                                  ? "text-red-400 cursor-not-allowed" 
                                  : "text-red-600 hover:bg-red-50"
                              }`}
                              title="Delete Tour"
                            >
                              {deletingId === tour.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {tours && tours.length > 0 && (
          <div className="mt-6 flex items-center justify-between px-6 py-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{tours.length}</span> {tours.length === 1 ? 'tour' : 'tours'}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Active Tours: <span className="font-semibold text-gray-700">{tours.length}</span>
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}