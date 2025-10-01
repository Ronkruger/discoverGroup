import { useEffect, useState, type JSX } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Tour } from "../types";
import { fetchToursByCountry, fetchTours } from "../api/tours";

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
  const country = countryParam;
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // passenger count for live totals on this page
  const [passengers, setPassengers] = useState<number>(1);

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

  return (
    <main className="container mx-auto px-5 py-10">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Search results</h1>
          <p className="text-slate-600">Showing tours for {country || "all countries"}.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-500">Passengers</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPassengers((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-full border flex items-center justify-center"
            >
              −
            </button>
            <input
              aria-label="Passengers"
              className="w-16 text-center rounded-md border px-2 py-1 text-sm"
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
              className="w-8 h-8 rounded-full border flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </header>

      {loading && <div className="text-slate-500">Loading results…</div>}

      {!loading && tours.length === 0 && (
        <div className="p-6 border rounded bg-white text-slate-600">No tours found.</div>
      )}

      {!loading && tours.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tours.map((t) => {
            const priceInfo = getPerPersonForTour(t);
            const perPerson = priceInfo.regular ?? priceInfo.effective;
            const promo = priceInfo.promo;
            const total = perPerson * Math.max(1, passengers);

            return (
              <article key={t.slug} className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <div className="h-44 bg-gray-100">
                  <img src={t.images?.[0] ?? "/assets/placeholder.jpg"} alt={t.title} className="w-full h-44 object-cover" />
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-slate-900">{t.title}</h2>
                  <p className="text-sm text-slate-600 mt-2">{t.summary}</p>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-slate-500">{t.durationDays} Days</div>

                    <div className="text-sm text-right">
                      <div className="text-xs text-slate-500">Per head</div>
                      <div className="text-base font-semibold text-slate-900">{formatCurrencyPHP(perPerson)}</div>
                      {promo !== undefined && priceInfo.regular !== undefined && (
                        <div className="text-xs text-slate-500 mt-1">Promo: <span className="text-rose-600">{formatCurrencyPHP(promo)}</span></div>
                      )}
                      {promo !== undefined && priceInfo.regular === undefined && (
                        <div className="text-xs text-slate-500 mt-1">Promo applied</div>
                      )}

                      <div className="text-xs text-slate-500 mt-2">Total ({passengers} pax)</div>
                      <div className="text-base font-semibold text-slate-900">{formatCurrencyPHP(total)}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link to={`/tour/builder/${t.slug}`} className="text-xs px-3 py-2 bg-slate-100 rounded hover:bg-slate-200">Builder</Link>
                    <Link to={`/tour/${t.slug}`} className="text-xs px-3 py-2 bg-rose-600 text-white rounded hover:bg-rose-700">View</Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}