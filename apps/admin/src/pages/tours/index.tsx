import { Tour } from "@discovergroup/types";
import { JSX, useEffect, useState } from "react";
import { fetchTours, deleteTour } from "../../services/apiClient";
import { Link } from "react-router-dom";
import { Plus, Edit2, Trash2, Calendar, DollarSign, MapPin, Loader } from "lucide-react";

export default function ToursList(): JSX.Element {
  const [tours, setTours] = useState<Tour[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchTours()
      .then((data) => {
        if (!mounted) return;
        setTours(data);
        setError(null);
      })
      .catch((err) => {
        console.error("fetchTours error", err);
        if (!mounted) return;
        setError(err?.message ?? "Failed to load tours");
        setTours([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function handleDelete(id: string | number) {
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
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-blue-600" size={40} />
          <p className="text-gray-600 text-lg">Loading tours…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <h2 className="font-bold mb-2">Error Loading Tours</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!tours || tours.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg p-12 text-center">
          <MapPin className="mx-auto mb-4 text-gray-400" size={48} />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No tours yet</h2>
          <p className="text-gray-600 mb-6">Create your first tour to get started</p>
          <Link to="/tours/create">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200">
              <Plus size={20} />
              Create First Tour
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tours</h1>
          <p className="text-gray-600 mt-1">{tours.length} tour{tours.length !== 1 ? 's' : ''} available</p>
        </div>
        <Link to="/tours/create">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200">
            <Plus size={20} />
            Create Tour
          </button>
        </Link>
      </div>

      {/* Tours Grid */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {tours.map((tour) => (
          <div
            key={tour.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 truncate">{tour.title}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{tour.summary || "No description"}</p>
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-3">
              {/* Tour Line */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {tour.line || "No Line"}
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {/* Duration */}
                <div className="flex items-start gap-2">
                  <Calendar size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs">Duration</p>
                    <p className="font-semibold text-gray-900">{tour.durationDays ?? "-"} days</p>
                  </div>
                </div>

                {/* Regular Price */}
                <div className="flex items-start gap-2">
                  <DollarSign size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs">Regular</p>
                    <p className="font-semibold text-gray-900">
                      {tour.regularPricePerPerson ? `₱${(tour.regularPricePerPerson as unknown as number).toLocaleString()}` : "--"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Promo Price */}
              {tour.promoPricePerPerson && (
                <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs">
                  <p className="text-amber-700">
                    <span className="font-semibold">Promo: </span>
                    ₱{(tour.promoPricePerPerson as unknown as number).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Slug */}
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Slug</p>
                <code className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded block truncate">
                  {tour.slug}
                </code>
              </div>
            </div>

            {/* Card Footer - Actions */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex gap-2">
              <Link to={`/tours/${tour.id}`} className="flex-1">
                <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 text-sm">
                  <Edit2 size={16} />
                  Edit
                </button>
              </Link>
              <button
                onClick={() => handleDelete(tour.id)}
                disabled={deletingId === tour.id}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                aria-label={`Delete tour ${tour.title}`}
              >
                {deletingId === tour.id ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}