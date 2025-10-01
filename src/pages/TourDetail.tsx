import { useParams, Link } from "react-router-dom";
import { useEffect, useState, type JSX } from "react";
import { fetchTourBySlug } from "../api/tours";
import type { Tour, ItineraryDay, Stop } from "../types";

/**
 * TourDetail
 * - Shows pricing using the regular per-person price by default.
 * - If regularPricePerPerson is present it will be used for the per-head and total calculations.
 * - If regularPricePerPerson is missing we fall back to promoPricePerPerson, then to basePricePerDay * days.
 * - Promo price (if present) is still shown as "Promo (available)" but it is NOT used for totals unless regular is absent.
 * - All right-side panels are non-sticky (normal flow).
 */

export default function TourDetail(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const [tour, setTour] = useState<Tour | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"itinerary" | "availability" | "extensions" | "details">(
    "itinerary"
  );

  useEffect(() => {
    let cancelled = false;
    if (!slug) return;
    (async () => {
      try {
        const t = await fetchTourBySlug(slug);
        if (cancelled) return;
        setTour(t);
        if (t) {
          const defaultDate =
            t.travelWindow?.start ?? (t.departureDates && t.departureDates.length ? t.departureDates[0] : null);
          setSelectedDate(defaultDate);
        }
      } catch (err) {
        console.error("fetchTourBySlug error", err);
        if (!cancelled) setTour(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!tour) return <p className="p-6 text-slate-600">Loading tour details...</p>;

  // Helpers
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  // Pricing helpers: prefer regular per-person values from tour, fallback to promo then basePricePerDay * days
  function getPerPersonPrices(t: Tour) {
    // typed access to optional fields that exist in mock data
    const regular = (t as unknown as { regularPricePerPerson?: number }).regularPricePerPerson;
    const promo = (t as unknown as { promoPricePerPerson?: number }).promoPricePerPerson;

    // compute fallback from basePricePerDay
    const days = t.durationDays ?? (t.itinerary?.length ?? 0);
    const basePricePerDay = t.basePricePerDay ?? 0;
    const computed = Math.round(basePricePerDay * days);

    // We will use the regular price as primary if present.
    // If regular is absent, fall back to promo, then to computed.
    const effective = typeof regular === "number" ? regular : typeof promo === "number" ? promo : computed;

    return { regular, promo, computed, effective };
  }

  function formatCurrencyPHP(amount: number, hideCents = false) {
    if (hideCents) {
      return `PHP ${Math.round(amount).toLocaleString("en-PH")}`;
    }
    return `PHP ${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  const priceInfo = getPerPersonPrices(tour);
  // Use regular as primary per-user request; effectiveForDisplay will be regular if available, otherwise promo/computed.
  const perPersonPrimary = typeof priceInfo.regular === "number" ? priceInfo.regular : priceInfo.effective;
  const totalForPassengers = Math.max(1, passengers) * (perPersonPrimary ?? 0);

  const builderSlug = slug ?? tour.slug;

  // Safe accessors / fallbacks
  const itinerary = tour.itinerary ?? [];
  const highlights = tour.highlights ?? [];
  const countriesVisited = tour.additionalInfo?.countriesVisited ?? [];

  const hasTravelWindow = !!tour.travelWindow?.start && !!tour.travelWindow?.end;
  const hasDepartureDates = Array.isArray(tour.departureDates) && tour.departureDates.length > 0;

  // --- Stops helpers (country name -> ISO -> flag emoji)
  const countryNameToIso: Record<string, string> = {
    "france": "fr",
    "switzerland": "ch",
    "italy": "it",
    "vatican city": "va",
    "vatican": "va",
    "austria": "at",
    "germany": "de",
    "spain": "es",
    "portugal": "pt",
    "netherlands": "nl",
    "the netherlands": "nl",
    "belgium": "be",
    "denmark": "dk",
    "sweden": "se",
    "norway": "no",
    "finland": "fi",
    "ireland": "ie",
    "croatia": "hr",
    "greece": "gr",
    "hungary": "hu",
    "poland": "pl",
    "czech republic": "cz",
    "czechia": "cz",
    "slovakia": "sk",
    "slovenia": "si",
    "romania": "ro",
    "bulgaria": "bg",
    "russia": "ru",
    "turkey": "tr",
    "philippines": "ph",
    "china": "cn",
    "japan": "jp",
    "south korea": "kr",
    "korea": "kr",
    "india": "in",
    "thailand": "th",
    "vietnam": "vn",
    "indonesia": "id",
    "malaysia": "my",
    "singapore": "sg",
    "australia": "au",
    "new zealand": "nz",
    "nz": "nz",
    "usa": "us",
    "united states": "us",
    "united states of america": "us",
    "canada": "ca",
    "mexico": "mx",
    "brazil": "br",
    "argentina": "ar",
    "united kingdom": "gb",
    "uk": "gb",
    "england": "gb",
    "scotland": "gb",
    "wales": "gb",
    "northern ireland": "gb",
  };

  function isoForCountry(country?: string): string | undefined {
    if (!country) return undefined;
    const key = country.trim().toLowerCase();
    if (countryNameToIso[key]) return countryNameToIso[key];
    const first = key.split(/[,(]/)[0].trim();
    if (countryNameToIso[first]) return countryNameToIso[first];
    return undefined;
  }

  function flagEmojiFromIso(iso?: string): string | undefined {
    if (!iso) return undefined;
    const code = iso.toUpperCase();
    if (code.length !== 2) return undefined;
    const first = 0x1f1e6 + (code.charCodeAt(0) - 65);
    const second = 0x1f1e6 + (code.charCodeAt(1) - 65);
    return String.fromCodePoint(first, second);
  }

  const stops: Stop[] = (tour.fullStops ?? []) as Stop[];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-5 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-4">
          <Link to="/" className="hover:underline">Home</Link>{" "}
          <span className="mx-2">/</span>{" "}
          <Link to="/tours" className="hover:underline">Tours</Link>{" "}
          <span className="mx-2">/</span> <span className="text-slate-700">{tour.title}</span>
        </nav>

        {/* Title row */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <h1 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 leading-tight">{tour.title}</h1>
            <p className="mt-2 text-slate-600">{tour.summary}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm">{tour.line ?? "Line"}</span>
              {tour.guaranteedDeparture && <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm">Guaranteed Departure</span>}
              <span className="text-sm text-slate-500">• {tour.durationDays ?? itinerary.length} days</span>
            </div>
          </div>

          {/* Price / CTAs */}
          <div className="flex flex-col items-start sm:items-end gap-3">
            <div className="bg-white border rounded-lg p-4 shadow-sm w-full max-w-xs">
              <div className="text-xs text-slate-500">Launch Offer</div>

              <div className="mt-2 flex items-baseline gap-3">
                {/* Primary display uses the regular price when available */}
                <div className="text-2xl font-bold text-rose-600">{formatCurrencyPHP(perPersonPrimary)}</div>
                <div className="text-xs text-slate-500">per person</div>
              </div>

              {/* If a promo exists, show it as available but do NOT use it for totals since user requested regular */}
              {priceInfo.promo !== undefined && priceInfo.regular !== undefined && (
                <div className="mt-2 text-xs text-slate-500">
                  Promo available: <span className="font-semibold text-rose-600">{formatCurrencyPHP(priceInfo.promo)}</span>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <Link to={`/search?countries=${encodeURIComponent(countriesVisited[0] ?? "")}&brands=Trafalgar&useEmbeddedCards=true`} className="px-3 py-2 bg-rose-600 text-white rounded text-sm">Available Dates</Link>
                <Link to={`/tour/builder/${encodeURIComponent(builderSlug)}`} className="px-3 py-2 border rounded text-sm bg-white hover:bg-slate-50">CUSTOMIZE THIS ROUTE</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-lg border-b">
          <div className="container mx-auto px-0">
            <div className="flex gap-6">
              <button onClick={() => setActiveTab("itinerary")} className={`px-4 py-3 -mb-px ${activeTab === "itinerary" ? "border-b-2 border-rose-600 text-rose-600 font-semibold" : "text-slate-600"}`}>Itinerary</button>
              <button onClick={() => setActiveTab("availability")} className={`px-4 py-3 -mb-px ${activeTab === "availability" ? "border-b-2 border-rose-600 text-rose-600 font-semibold" : "text-slate-600"}`}>Availability</button>
              <button onClick={() => setActiveTab("extensions")} className={`px-4 py-3 -mb-px ${activeTab === "extensions" ? "border-b-2 border-rose-600 text-rose-600 font-semibold" : "text-slate-600"}`}>Extensions</button>
              <button onClick={() => setActiveTab("details")} className={`px-4 py-3 -mb-px ${activeTab === "details" ? "border-b-2 border-rose-600 text-rose-600 font-semibold" : "text-slate-600"}`}>Details</button>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Left: large image + main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg overflow-hidden shadow-sm">
              <img src={tour.images?.[0] ?? "/assets/placeholder.jpg"} alt={tour.title} className="w-full h-80 md:h-96 object-cover" />
            </div>

            {/* Tab panels */}
            <div className="mt-6">
              {activeTab === "itinerary" && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Day-by-day itinerary</h3>
                  <div className="space-y-6">
                    {itinerary.map((day: ItineraryDay) => (
                      <div key={day.day} className="p-4 border rounded-lg bg-white">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm text-slate-500">Day {day.day}</div>
                            <div className="text-lg font-semibold text-slate-900">{day.title}</div>
                            <p className="text-slate-600 mt-2">{day.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "availability" && (
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-xl font-semibold mb-4">Availability</h3>
                  <p className="text-slate-600">
                    {hasTravelWindow ? (
                      <>This tour runs from <strong>{formatDate(tour.travelWindow!.start)}</strong> to <strong>{formatDate(tour.travelWindow!.end)}</strong>.</>
                    ) : hasDepartureDates ? (
                      <>Multiple discrete departure dates are available. Choose one from the right.</>
                    ) : (
                      <>Availability details are not available.</>
                    )}
                  </p>
                </div>
              )}
              {activeTab === "extensions" && (
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-xl font-semibold mb-4">Extensions</h3>
                  <p className="text-slate-600">Optional extensions (e.g., pre/post stays) are available on some departures.</p>
                </div>
              )}
              {activeTab === "details" && (
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-xl font-semibold mb-4">Tour details</h3>
                  <p className="text-slate-600">Practical information, inclusion/exclusion, activity level and more.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: booking / summary + stops (non-sticky) */}
          <aside className="space-y-6">
            {/* Stops (right sidebar, non-sticky) */}
            {stops.length > 0 && (
              <section className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-slate-800">Stops</div>
                  <div className="text-xs text-slate-500">On-tour cities</div>
                </div>

                <div className="max-h-64 overflow-auto pr-2">
                  <ul className="space-y-2">
                    {stops.map((s, i) => {
                      const iso = isoForCountry(s.country);
                      const flag = flagEmojiFromIso(iso);
                      return (
                        <li key={`${s.city}-${i}`} className="flex items-center gap-3">
                          <div className="text-lg leading-none">{flag ?? "🏳️"}</div>
                          <div className="text-sm text-slate-700">{s.city}</div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </section>
            )}

            {/* Departure Dates / Travel Window */}
            <section className="bg-white border rounded-lg p-5 shadow-sm">
              <h4 className="text-sm text-slate-500 mb-3">Departure</h4>

              {hasTravelWindow ? (
                <div className="text-sm text-slate-700">
                  <div className="font-semibold">{formatDate(tour.travelWindow!.start)} – {formatDate(tour.travelWindow!.end)}</div>
                  <div className="text-slate-500 text-xs mt-1">Travel window (inclusive)</div>
                </div>
              ) : hasDepartureDates ? (
                <div className="flex flex-wrap gap-3">
                  {tour.departureDates!.map((date) => (
                    <button key={date} onClick={() => setSelectedDate(date)} className={`px-3 py-2 text-sm rounded-lg border ${selectedDate === date ? "bg-rose-600 text-white border-rose-600" : "bg-white text-slate-700"}`}>{formatDate(date)}</button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">No departure information available</div>
              )}
            </section>

            {/* Tour summary card */}
            <section className="bg-white border rounded-lg p-5 shadow-sm">
              <h4 className="text-sm text-slate-500 mb-2">Tour overview</h4>
              <div className="text-sm text-slate-700">
                <p className="mb-2">{tour.summary}</p>

                <ul className="text-sm text-slate-600 space-y-2">
                  <li><strong className="text-slate-800">Duration:</strong> {tour.durationDays ?? itinerary.length} days</li>
                  <li><strong className="text-slate-800">Countries:</strong> {countriesVisited.join(", ") || "—"}</li>
                  <li><strong className="text-slate-800">Highlights:</strong> {highlights.join(", ") || "—"}</li>
                </ul>
              </div>
            </section>

            {/* Booking Card (visible when travelWindow exists or a discrete date is picked), non-sticky */}
            {(hasTravelWindow || selectedDate) && (
              <section className="bg-white border rounded-lg p-5 shadow-md">
                <div className="mb-3 text-xs text-slate-500">YOUR TOUR</div>

                <div className="mb-3">
                  <div className="text-sm text-slate-700">{tour.title}</div>
                  <div className="text-xs text-slate-500 mt-1">{tour.line ?? ""} • {tour.durationDays ?? itinerary.length} days</div>
                </div>

                <div className="mb-3">
                  <div className="text-xs text-slate-500">DATES</div>
                  <div className="font-semibold">{hasTravelWindow ? formatDate(tour.travelWindow!.start) : formatDate(selectedDate!)}</div>
                  <div className="text-sm text-slate-500">to{" "}
                    {formatDate(new Date(new Date(hasTravelWindow ? tour.travelWindow!.start : selectedDate!).getTime() + ((tour.durationDays ?? itinerary.length) - 1) * 24 * 60 * 60 * 1000).toISOString())}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-xs text-slate-500">PASSENGERS</div>
                  <input type="number" min={1} value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} className="w-20 text-black px-2 py-1 rounded border mt-1" />
                </div>

                <div className="mb-4">
                  <div className="text-xs text-slate-500">PRICE</div>
                  <div className="text-lg font-semibold">{formatCurrencyPHP(perPersonPrimary)} per person</div>
                  {passengers > 1 && (
                    <div className="text-sm font-bold mt-1">Total: {formatCurrencyPHP(totalForPassengers)}</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link to={`/tour/builder/${encodeURIComponent(builderSlug)}`} className="flex-1 text-center px-3 py-2 bg-rose-600 text-white rounded font-semibold">CUSTOMIZE THIS ROUTE</Link>
                  <Link
                    to={`/booking/${encodeURIComponent(builderSlug)}`}
                    state={{ tour, selectedDate, passengers, perPerson: perPersonPrimary }}
                    className="px-3 py-2 border rounded text-sm inline-flex items-center gap-2"
                  >
                    BOOK NOW
                  </Link>
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}