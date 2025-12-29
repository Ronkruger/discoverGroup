import { useEffect, useState, type JSX } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Tour } from "../types";
import { fetchToursByCountry, fetchTours } from "../api/tours";
import React from "react";
import { Search, X, MapPin, Filter } from "lucide-react";

/**
 * SearchResults page
 * - Route: /search
 * - Reads query param `countries` and fetches tours for that country
 * - Adds passenger input and live total for each card
 * - Uses per-person pricing from the tour model (regularPricePerPerson preferred)
 */

export default function SearchResults(): JSX.Element {
  const [searchParams] = useSearchParams();
  const countryParam = searchParams.get("countries") ?? "";
  const searchQuery = searchParams.get("q") ?? "";
  const country = countryParam;
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filter states - initialize routeNameFilter with search query from URL
  const [routeNameFilter, setRouteNameFilter] = useState<string>(searchQuery);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(true);

  // passenger count for live totals on this page
  const [passengers, setPassengers] = useState<number>(1);

  // Update routeNameFilter when search query changes
  useEffect(() => {
    setRouteNameFilter(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        if (!country) {
          // If no country provided, show all tours
          const all = await fetchTours();
          if (!cancelled) setTours(all);
          return;
        }
        const res = await fetchToursByCountry(country);
        if (!cancelled) setTours(res);
      } catch (err) {
        console.error("fetchToursByCountry error", err);
        if (!cancelled) setTours([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [country]);

  // Pricing helpers: prefer regularPricePerPerson (PHP), then promoPricePerPerson, then basePricePerDay * days
  function getPerPersonForTour(t: Tour) {
    const anyT = t as unknown as {
      regularPricePerPerson?: number;
      promoPricePerPerson?: number;
      basePricePerDay?: number;
      durationDays?: number;
      itinerary?: unknown[];
    };

    const regular = typeof anyT.regularPricePerPerson === "number" ? anyT.regularPricePerPerson : undefined;
    const promo = typeof anyT.promoPricePerPerson === "number" ? anyT.promoPricePerPerson : undefined;

    if (regular !== undefined || promo !== undefined) {
      // regular is preferred for display/total
      const effective = regular ?? promo ?? 0;
      return { regular, promo, effective };
    }

    // fallback to basePricePerDay * days
    const days = t.durationDays ?? (t.itinerary?.length ?? 0);
    const computed = Math.round((anyT.basePricePerDay ?? 0) * days);
    return { regular: computed, promo: undefined, effective: computed };
  }

  function formatCurrencyPHP(amount: number) {
    return `PHP ${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Extract all unique countries from tours
  const allCountries = React.useMemo(() => {
    const countriesSet = new Set<string>();
    tours.forEach(tour => {
      // Try additionalInfo.countriesVisited
      if (tour.additionalInfo && Array.isArray(tour.additionalInfo.countriesVisited)) {
        tour.additionalInfo.countriesVisited.forEach(c => countriesSet.add(c));
      }
      // Try fullStops
      if (Array.isArray(tour.fullStops)) {
        tour.fullStops.forEach(stop => {
          if (typeof stop.country === 'string') {
            countriesSet.add(stop.country);
          }
        });
      }
    });
    return Array.from(countriesSet).sort();
  }, [tours]);

  // Apply filters
  const filteredTours = React.useMemo(() => {
    return tours.filter(tour => {
      // Filter by route name
      if (routeNameFilter.trim()) {
        const nameMatch = tour.title.toLowerCase().includes(routeNameFilter.toLowerCase());
        if (!nameMatch) return false;
      }

      // Filter by selected countries
      if (selectedCountries.length > 0) {
        const tourCountries = new Set<string>();
        
        if (tour.additionalInfo && Array.isArray(tour.additionalInfo.countriesVisited)) {
          tour.additionalInfo.countriesVisited.forEach(c => tourCountries.add(c));
        }
        
        if (Array.isArray(tour.fullStops)) {
          tour.fullStops.forEach(stop => {
            if (typeof stop.country === 'string') {
              tourCountries.add(stop.country);
            }
          });
        }

        // Check if tour includes ANY of the selected countries
        const hasSelectedCountry = selectedCountries.some(country => tourCountries.has(country));
        if (!hasSelectedCountry) return false;
      }

      return true;
    });
  }, [tours, routeNameFilter, selectedCountries]);

  const toggleCountry = (countryName: string) => {
    setSelectedCountries(prev => 
      prev.includes(countryName)
        ? prev.filter(c => c !== countryName)
        : [...prev, countryName]
    );
  };

  const clearFilters = () => {
    setRouteNameFilter("");
    setSelectedCountries([]);
  };

  return (
    <main className="min-h-[80vh] bg-gradient-to-br from-blue-50 via-white to-yellow-50/40 py-10">
      <div className="container mx-auto px-5">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-900 drop-shadow-sm">Search results</h1>
            <p className="text-slate-600 text-base">Showing {filteredTours.length} tours for <span className="font-semibold text-blue-700">{country || "all countries"}</span>.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
            
            <div className="flex items-center gap-3 bg-white/80 rounded-xl shadow px-4 py-2 border border-slate-200">
              <div className="text-sm text-slate-500 font-medium">Passengers</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                  className="w-11 h-11 rounded-full border border-slate-300 flex items-center justify-center text-lg font-bold bg-slate-100 hover:bg-blue-100 active:bg-blue-200 transition"
                  aria-label="Decrease passengers"
                >
                  −
                </button>
                <input
                  aria-label="Passengers"
                  className="w-14 text-center rounded-lg border border-slate-300 px-2 py-1 text-base font-semibold bg-white shadow-sm focus:ring-2 focus:ring-blue-300"
                  value={passengers}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!Number.isNaN(v) && v >= 1) setPassengers(v);
                  }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <button
                  type="button"
                  onClick={() => setPassengers((p) => p + 1)}
                  className="w-11 h-11 rounded-full border border-slate-300 flex items-center justify-center text-lg font-bold bg-slate-100 hover:bg-blue-100 active:bg-blue-200 transition"
                  aria-label="Increase passengers"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <aside className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </h2>
                {(routeNameFilter || selectedCountries.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>

              {/* Route Name Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Search by Route Name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={routeNameFilter}
                    onChange={(e) => setRouteNameFilter(e.target.value)}
                    placeholder="Enter route name..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Countries Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Filter by Countries
                </label>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {allCountries.length === 0 && (
                    <p className="text-sm text-slate-500 italic">No countries available</p>
                  )}
                  {allCountries.map((countryName) => (
                    <label
                      key={countryName}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 cursor-pointer transition group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCountries.includes(countryName)}
                        onChange={() => toggleCountry(countryName)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <MapPin className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                      <span className="text-sm text-slate-700 group-hover:text-blue-900 font-medium">
                        {countryName}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Active Filters Summary */}
              {selectedCountries.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="text-xs font-semibold text-slate-600 mb-2">ACTIVE FILTERS</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCountries.map((countryName) => (
                      <span
                        key={countryName}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                      >
                        {countryName}
                        <button
                          onClick={() => toggleCountry(countryName)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {loading && <div className="text-slate-500">Loading results…</div>}

            {!loading && filteredTours.length === 0 && (
              <div className="p-8 border rounded-2xl bg-white/80 text-slate-600 shadow-md text-center text-lg font-medium">
                No tours found matching your filters.
              </div>
            )}

            {!loading && filteredTours.length > 0 && (
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-2">{filteredTours.map((t) => {
            const priceInfo = getPerPersonForTour(t);
            const perPerson = priceInfo.regular ?? priceInfo.effective;
            const promo = priceInfo.promo;
            const total = perPerson * Math.max(1, passengers);

            return (
              <article key={t.slug} className="bg-white/90 border border-slate-200 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-200 flex flex-col">
                <div className="relative h-48 bg-gray-100">
                  <img src={t.images?.[0] ?? "/assets/placeholder.jpg"} alt={t.title} className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
                  <div className="absolute top-4 left-4 bg-yellow-400 text-blue-900 text-xs font-bold px-3 py-1 rounded-full shadow">{t.durationDays} Days</div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="text-xl font-bold text-blue-900 mb-1 drop-shadow-sm">{t.title}</h2>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{t.summary}</p>

                  {/* Departure dates info */}
                  {(() => {
                    // Normalize departureDates to objects with startDate/endDate so we can safely access startDate
                    const rawDepartures = Array.isArray(t.departureDates) ? t.departureDates : [];
                    const departureDates: { startDate: string; endDate?: string }[] = rawDepartures.map((d) => {
                      if (typeof d === "string") {
                        return { startDate: d };
                      }
                      // Type guard to ensure the object has required properties
                      type DepartureObj = { startDate?: string; endDate?: string; start?: string; end?: string };
                      const departure = d as DepartureObj;
                      return {
                        startDate: departure.startDate ?? departure.start ?? "",
                        endDate: departure.endDate ?? departure.end
                      };
                    });
                    const travelWindow = t.travelWindow;
                    
                    if (departureDates.length > 0) {
                      const now = new Date();
                      const upcomingDepartures = departureDates
                        .filter((dept) => {
                          const sd = new Date(dept.startDate);
                          return sd > now;
                        })
                        .sort(
                          (a, b) =>
                            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
                        );
                      
                      if (upcomingDepartures.length > 0) {
                        const nextDeparture = upcomingDepartures[0];
                        const startDate = new Date(nextDeparture.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                        const endSource = nextDeparture.endDate ?? nextDeparture.startDate;
                        const endDate = new Date(endSource).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                        return (
                          <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                            📅 Next: {startDate} - {endDate}
                            {departureDates.length > 1 && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-1">
                                +{departureDates.length - 1} more
                              </span>
                            )}
                          </div>
                        );
                      }
                    } else if (travelWindow) {
                      // travelWindow may use different property names; prefer startDate/endDate but fall back to start/end or other common names
                      const tw = travelWindow as {
                        startDate?: string;
                        endDate?: string;
                        start?: string;
                        end?: string;
                        startAt?: string;
                        endAt?: string;
                        from?: string;
                        to?: string;
                      };
                      const s = tw.startDate ?? tw.start ?? tw.startAt ?? tw.from;
                      const e = tw.endDate ?? tw.end ?? tw.endAt ?? tw.to;
                      if (s && e) {
                        const startDate = new Date(s).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                        const endDate = new Date(e).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                        return (
                          <div className="text-xs text-slate-500 mb-2">
                            📅 {startDate} - {endDate}
                          </div>
                        );
                      }
                    }
                    
                    return null;
                  })()}

                  <div className="mt-auto flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500">Per head</div>
                      <div className="text-base font-bold text-blue-900">{formatCurrencyPHP(perPerson)}</div>
                    </div>
                    {promo !== undefined && priceInfo.regular !== undefined && (
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500">Promo</div>
                        <div className="text-xs font-semibold text-rose-600 line-through">{formatCurrencyPHP(priceInfo.regular)}</div>
                        <div className="text-sm font-bold text-rose-600">{formatCurrencyPHP(promo)}</div>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-slate-500">Total ({passengers} pax)</div>
                      <div className="text-base font-bold text-blue-900">{formatCurrencyPHP(total)}</div>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <Link to={`/tour/builder/${t.slug}`} className="flex-1 flex items-center justify-center gap-2 text-xs px-4 py-2 bg-blue-50 text-blue-800 font-semibold rounded-full shadow hover:bg-blue-100 hover:scale-105 transition-all duration-150">
                      <span>🛠️</span> Builder
                    </Link>
                    <Link to={`/tour/${t.slug}`} className="flex-1 flex items-center justify-center gap-2 text-xs px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold rounded-full shadow hover:from-rose-400 hover:to-rose-500 hover:scale-105 transition-all duration-150">
                      <span>🔎</span> View
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}