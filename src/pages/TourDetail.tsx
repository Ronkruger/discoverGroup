// Gallery image with fallback and debug info
/**
 * TourForm Fields Reference (Admin Form)
 *
 * This list reflects all fields used in the admin TourForm for tour creation/editing.
 * Keep this in sync with the form and backend payloads for maintainability.
 *
 * Fields:
 * - title
 * - slug
 * - summary
 * - shortDescription
 * - line
 * - durationDays
 * - images
 * - galleryImages
 * - highlights
 * - itinerary
 * - departureDates
 * - travelWindow (start, end)
 * - basePricePerDay
 * - regularPricePerPerson
 * - promoPricePerPerson
 * - guaranteedDeparture
 * - bookingPdfUrl
 * - additionalInfo (countries, countriesVisited, ...)
 * - fullStops
 * - extensions
 */
import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchTourBySlug } from "../api/tours";
import type { Tour, ItineraryDay, Stop, DepartureDate } from "../types";
import { DepartureDateCalendar } from "../components/DepartureDateCalendar";
import BackToTop from "../components/BackToTop";
// Gallery image with fallback
function GalleryImageWithFallback({ src }: { src: string }) {
  const [error, setError] = useState(false);
  
  return (
    <div className="relative">
      {!error ? (
        <img
          src={src}
          alt="Gallery"
          className="w-full h-[70vh] object-contain bg-white rounded-lg"
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-[70vh] flex items-center justify-center bg-gray-100 rounded-lg">
          <img 
            src="/assets/placeholder.jpg" 
            alt="placeholder" 
            className="max-h-[60vh] max-w-[80vw] object-contain"
          />
        </div>
      )}
    </div>
  );
}

export default TourDetail;
export { GalleryImageWithFallback };

/**
 * Modernized TourDetail with a single BookingCard component to remove duplication.
 *
 * - Uses bookingPdfUrl (flipbook link) if present and additionalInfo.countries (name+image) for country previews.
 * - Falls back to legacy fields (additionalInfo.countriesVisited) when needed.
 *
 * - Improved "Available Dates" behavior:
 *   Clicking "Available Dates" now switches to the Availability tab and scrolls the departure dates
 *   into view on the page (works for both ISO-like dates and admin-entered date-range strings).
 *
 * - Departure dates are rendered in a vertical/two-column responsive grid (wraps to next line after two items),
 *   instead of a horizontal scroller.
 */

function TourDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [tour, setTour] = useState<Tour | null>(null);
  // selectedDate is always a string: either a legacy date string, or a JSON string for structured objects
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<
    "itinerary" | "availability" | "extensions" | "details"
  >("itinerary");

  // Interactive UI state
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [usePromoForTotals, setUsePromoForTotals] = useState(false);
  const [stopsMapOpen, setStopsMapOpen] = useState(false);

  // Use galleryImages if available, fallback to images
  const images: string[] = React.useMemo(() => {
    if (tour?.galleryImages && Array.isArray(tour.galleryImages) && tour.galleryImages.length > 0) {
      return tour.galleryImages;
    }
    if (Array.isArray(tour?.images)) {
      return tour.images;
    }
    return [];
  }, [tour?.galleryImages, tour?.images]);

  const carouselTimerRef = useRef<number | null>(null);
  // datesRef is the container for the date buttons (grid / vertical)
  const datesRef = useRef<HTMLDivElement | null>(null);

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
            t.travelWindow?.start ??
            (t.departureDates && t.departureDates.length
              ? typeof t.departureDates[0] === 'string'
                ? t.departureDates[0]
                : JSON.stringify(t.departureDates[0])
              : null);
          setSelectedDate(defaultDate);
        }
      } catch {
        if (!cancelled) setTour(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Autoplay for carousel
  useEffect(() => {
    if (images.length > 1) {
      carouselTimerRef.current = window.setInterval(() => {
        setCarouselIndex((i) => (images.length ? (i + 1) % images.length : 0));
      }, 4500);
      return () => {
        if (carouselTimerRef.current) {
          clearInterval(carouselTimerRef.current);
          carouselTimerRef.current = null;
        }
      };
    } else {
      if (carouselTimerRef.current) {
        clearInterval(carouselTimerRef.current);
        carouselTimerRef.current = null;
      }
    }
  }, [images]);

// scroll helper (used by keyboard navigation)
function scrollDateIntoView(date?: string) {
  if (!datesRef.current || !date) return;
  const btn = datesRef.current.querySelector(
    `[data-date="${date}"]`
  ) as HTMLElement | null;
  if (btn) {
    // center the button in the nearest scrollable ancestor (datesRef)
    try {
      btn.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      btn.focus();
    } catch {
      // fallback
      btn.scrollIntoView({ behavior: "smooth" });
    }
  } else {
    // fallback: scroll container into view
    try { datesRef.current.scrollIntoView({ behavior: "smooth", block: "center" }); } catch {
      // intentionally ignore scroll errors
    }
  }
}

// keyboard support for dates (supports grid navigation: left/right = prev/next, up/down = +/- cols)
useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    const departureDates = tour?.departureDates;
    if (!departureDates || departureDates.length === 0) return;
    if (!selectedDate) return;
    // Find index by matching string or JSON string
    const idx = departureDates.findIndex(d =>
      typeof d === 'string' ? d === selectedDate : JSON.stringify(d) === selectedDate
    );
    if (idx === -1) return;

    const cols = window.innerWidth >= 640 ? 2 : 1;

    function getDateValue(val: string | { start: string; end: string; _id?: string }) {
      return typeof val === 'string' ? val : JSON.stringify(val);
    }

    if (e.key === "ArrowLeft") {
      const prev = departureDates[Math.max(0, idx - 1)];
      const prevVal = getDateValue(prev);
      setSelectedDate(prevVal);
      scrollDateIntoView(prevVal);
    } else if (e.key === "ArrowRight") {
      const next = departureDates[Math.min(departureDates.length - 1, idx + 1)];
      const nextVal = getDateValue(next);
      setSelectedDate(nextVal);
      scrollDateIntoView(nextVal);
    } else if (e.key === "ArrowUp") {
      const upIdx = Math.max(0, idx - cols);
      const up = departureDates[upIdx];
      const upVal = getDateValue(up);
      setSelectedDate(upVal);
      scrollDateIntoView(upVal);
    } else if (e.key === "ArrowDown") {
      const downIdx = Math.min(departureDates.length - 1, idx + cols);
      const down = departureDates[downIdx];
      const downVal = getDateValue(down);
      setSelectedDate(downVal);
      scrollDateIntoView(downVal);
    }
  };
  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
}, [selectedDate, tour?.departureDates]);

  // Helpers
  // formatDate is tolerant of admin-entered human-friendly ranges (e.g. "May 27, 2026 - June 10, 2026")
  // If the string looks like a range or cannot be parsed as a Date, return it as-is.
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    // If looks like a range (contains a dash with words/dates around it) — return raw string
    if (/\d{4}|\d{1,2}\s?[A-Za-z]|-/g.test(dateStr) && /[-–—]/.test(dateStr) && dateStr.split(/[-–—]/).length >= 2) {
      return dateStr;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      // not a valid Date — return raw string
      return dateStr;
    }
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Pricing helpers: prefer regular per-person values from tour, fallback to promo then basePricePerDay * days
  function getPerPersonPrices(t: Tour) {
    const regular = (t as unknown as { regularPricePerPerson?: number }).regularPricePerPerson;
    const promo = (t as unknown as { promoPricePerPerson?: number }).promoPricePerPerson;
    const days = t.durationDays ?? (t.itinerary?.length ?? 0);
    const basePricePerDay = t.basePricePerDay ?? 0;
    const computed = Math.round(basePricePerDay * days);
    const effective = typeof regular === "number" ? regular : typeof promo === "number" ? promo : computed;
    return { regular, promo, computed, effective };
  }

  function formatCurrencyPHP(amount: number, hideCents = false) {
    if (hideCents) {
      return `PHP ${Math.round(amount).toLocaleString("en-PH")}`;
    }
    return `PHP ${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  const priceInfo: { regular?: number; promo?: number; computed: number; effective: number } = tour ? getPerPersonPrices(tour as Tour) : { regular: undefined, promo: undefined, computed: 0, effective: 0 };
  const perPersonPrimary = typeof priceInfo.regular === "number" ? priceInfo.regular : (priceInfo.effective ?? 0);
  const perPersonForTotals = usePromoForTotals && typeof priceInfo.promo === "number" ? priceInfo.promo : perPersonPrimary;
  const totalForPassengers = Math.max(1, passengers) * (perPersonForTotals ?? 0);

  const builderSlug = slug ?? (tour?.slug ?? "");

  // Safe accessors / fallbacks
  const itinerary = tour?.itinerary ?? [];
  const highlights = tour?.highlights ?? [];
  // Prefer per-country entries (with images) -> additionalInfo.countries; fall back to legacy countriesVisited strings.
  type CountryEntry = { name?: string; image?: string };
  type AdditionalInfo = {
    countries?: CountryEntry[];
    countriesVisited?: string[];
    [key: string]: unknown;
  };

  const additionalInfo: AdditionalInfo | undefined = tour?.additionalInfo as AdditionalInfo | undefined;

  const countriesFromEntries: string[] =
    additionalInfo && Array.isArray(additionalInfo.countries)
      ? additionalInfo.countries
          .map((c: CountryEntry) => c?.name)
          .filter((name: string | undefined): name is string => typeof name === "string" && !!name)
      : [];
  const countriesVisited = countriesFromEntries.length > 0
    ? countriesFromEntries
    : (additionalInfo?.countriesVisited ?? []);

  const hasTravelWindow = !!tour && !!(tour!.travelWindow?.start) && !!(tour!.travelWindow?.end);
  const hasDepartureDates = !!tour && Array.isArray(tour!.departureDates) && (tour!.departureDates?.length ?? 0) > 0;

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

  const stops: Stop[] = (tour?.fullStops ?? []) as Stop[];

  // UI handlers
  function prevImage() {
    if (!images || images.length === 0) return;
    setCarouselIndex((i) => {
      const len = images.length;
      return (i - 1 + len) % len;
    });
  }
  function nextImage() {
    if (!images || images.length === 0) return;
    setCarouselIndex((i) => (i + 1) % images.length);
  }

  function openGallery(index = 0) {
    setGalleryIndex(index);
    setGalleryOpen(true);
  }

  function togglePassenger(delta: number) {
    setPassengers((p) => Math.max(1, Math.min(10, p + delta)));
  }

  // Show available dates: switch to availability tab, scroll the departure date controls into view and focus
  function showAvailableDates() {
    setActiveTab("availability");
    setTimeout(() => {
      if (!datesRef.current) {
        const el = document.querySelector('[data-date]') as HTMLElement | null;
        if (el) el.scrollIntoView({ behavior: "smooth", inline: "center" });
        return;
      }
      const departureDates = tour?.departureDates;
      if (departureDates && departureDates.length > 0) {
        const first = departureDates[0];
        const firstVal = typeof first === 'string' ? first : JSON.stringify(first);
        setSelectedDate(firstVal);
        scrollDateIntoView(firstVal);
        const btn = datesRef.current.querySelector(`[data-date="${firstVal}"]`) as HTMLElement | null;
        if (btn) btn.focus();
        return;
      }
      datesRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  }

  // Inline styles + small CSS for theme variables and transitions
  const themeStyle: React.CSSProperties = {
    background: "linear-gradient(180deg, rgba(249,250,251,1) 0%, rgba(243,244,246,1) 35%, rgba(255,255,255,1) 100%)",
    ["--accent-yellow" as string]: "#FFD24D",
    ["--accent-yellow-600" as string]: "#FFC107",
    ["--muted-slate" as string]: "#94a3b8",
  };

  // Single BookingCard component used in hero column and compact under hero to avoid duplication
  function BookingCard({ compact = false }: { compact?: boolean }) {
    const compactWrapper = compact ? "p-3" : "p-4";
    const compactButtons = compact ? "text-sm px-2 py-1" : "px-3 py-2";
    return (
      <div className={`${compact ? "w-full" : "w-full"} ${compactWrapper} bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all`}>
        <div className="text-xs text-gray-600 uppercase tracking-wider">Launch Offer</div>

        <div className="mt-2 flex items-baseline gap-3">
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrencyPHP(perPersonPrimary ?? 0)}
          </div>
          <div className="text-xs text-gray-600">per person</div>
        </div>

        <div className="mt-2 flex items-center gap-2">
          {typeof priceInfo.promo === "number" && (
            <div className="text-xs text-gray-900 bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-1 rounded-full font-semibold shadow-md">Promo available</div>
          )}
          <div className="text-xs text-gray-600">· Flexible payment</div>
        </div>

        {/* If a flipbook is provided, show quick access */}
        {tour && tour.bookingPdfUrl && (
          <div className="mt-3">
            <a href={tour.bookingPdfUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 rounded-xl font-semibold smooth-transition hover:shadow-md">
              Open Flipbook
            </a>
          </div>
        )}

        {compact ? (
          <div className="mt-3 space-y-2">
            <div className="flex gap-2">
              <button onClick={showAvailableDates} className={`${compactButtons} bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-xl font-bold smooth-transition hover:shadow-lg hover:-translate-y-0.5`}>Available Dates</button>
              <Link to={`/tour/builder/${encodeURIComponent(builderSlug)}`} className={`${compactButtons} border border-gray-300 rounded-xl bg-white text-gray-900 hover:bg-gray-50 smooth-transition hover:shadow-md font-semibold`}>Customize</Link>
            </div>
            {hasDepartureDates ? (
              selectedDate ? (
                <Link
                  to={`/booking/${encodeURIComponent(builderSlug)}`}
                  state={{ tour, selectedDate, passengers, perPerson: perPersonForTotals }}
                  className="w-full text-center px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold block smooth-transition hover:shadow-lg hover:-translate-y-0.5"
                >
                  BOOK NOW
                </Link>
              ) : (
                <>
                  <button
                    disabled
                    className="w-full text-center px-3 py-2 bg-gray-300 text-gray-500 rounded-xl font-bold cursor-not-allowed"
                    title="Please select a departure date first"
                  >
                    Select a Date to Book
                  </button>
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2 text-xs text-yellow-800">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Click "Available Dates" and select a date first</span>
                  </div>
                </>
              )
            ) : (
              <Link
                to={`/booking/${encodeURIComponent(builderSlug)}`}
                state={{ tour, selectedDate, passengers, perPerson: perPersonForTotals }}
                className="w-full text-center px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold block smooth-transition hover:shadow-lg hover:-translate-y-0.5"
              >
                BOOK NOW
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="mt-3 flex gap-2">
              <button onClick={showAvailableDates} className={`${compactButtons} bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-xl font-bold smooth-transition hover:shadow-lg hover:-translate-y-0.5`}>Available Dates</button>
            </div>
          </>
        )}

        {!compact && (
          <>
            <div className="mt-4">
              <div className="text-xs text-gray-600 uppercase tracking-wider">PASSENGERS</div>
              <div className="mt-2 flex items-center gap-2">
                <button onClick={() => togglePassenger(-1)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 rounded-lg font-semibold transition-all">−</button>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={passengers}
                  onChange={(e) => setPassengers(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                  className="w-16 text-gray-900 px-2 py-2 rounded-lg border border-gray-300 text-center font-semibold focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  aria-label="Number of passengers"
                />
                <button onClick={() => togglePassenger(1)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 rounded-lg font-semibold transition-all">+</button>
                <div className="ml-auto text-xs text-gray-600">Max 10</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600 uppercase tracking-wider">PRICE</div>
                <div className="text-xs text-gray-600">Preview options</div>
              </div>

              <div className="mt-2">
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrencyPHP(perPersonPrimary ?? 0)} <span className="text-xs text-gray-600">per person</span>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  {typeof priceInfo.promo === "number" && (
                    <>
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={usePromoForTotals} onChange={(e) => setUsePromoForTotals(e.target.checked)} className="rounded border-gray-300" />
                        Use promo for totals
                      </label>
                      <div className="text-xs text-gray-700">Promo: <span className="font-semibold">{formatCurrencyPHP(typeof priceInfo.promo === "number" ? priceInfo.promo : 0)}</span></div>
                    </>
                  )}
                </div>

                {passengers > 1 && (
                  <div className="text-sm font-bold mt-3 text-gray-900">Total: {formatCurrencyPHP(totalForPassengers)}</div>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Link to={`/tour/builder/${encodeURIComponent(builderSlug)}`} className="flex-1 text-center px-3 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-xl font-bold smooth-transition hover:shadow-lg hover:-translate-y-0.5">CUSTOMIZE</Link>
              {hasDepartureDates ? (
                selectedDate ? (
                  <Link
                    to={`/booking/${encodeURIComponent(builderSlug)}`}
                    state={{ tour, selectedDate, passengers, perPerson: perPersonForTotals }}
                    className="px-3 py-2 border border-gray-300 rounded-xl text-sm inline-flex items-center gap-2 bg-white text-gray-900 font-bold shadow hover:shadow-md smooth-transition hover:-translate-y-0.5"
                  >
                    BOOK NOW
                  </Link>
                ) : (
                  <button
                    disabled
                    className="px-3 py-2 border border-gray-300 rounded-xl text-sm inline-flex items-center gap-2 bg-gray-300 text-gray-500 font-bold cursor-not-allowed"
                    title="Please select a departure date first"
                  >
                    Select Date
                  </button>
                )
              ) : (
                <Link
                  to={`/booking/${encodeURIComponent(builderSlug)}`}
                  state={{ tour, selectedDate, passengers, perPerson: perPersonForTotals }}
                  className="px-3 py-2 border border-gray-300 rounded-xl text-sm inline-flex items-center gap-2 bg-white text-gray-900 font-bold shadow hover:shadow-md smooth-transition hover:-translate-y-0.5"
                >
                  BOOK NOW
                </Link>
              )}
            </div>
            {!selectedDate && hasDepartureDates && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2 text-sm text-yellow-800">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Please click "Available Dates" and select a departure date to continue.</span>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  function isSafeImageUrl(arg0: string) {
  // Suppress unused variable warning
  return typeof arg0 === 'string' && arg0.length > 0;
  }

  return (
  <div className="min-h-screen" style={themeStyle}>
      <style>{`
        .accent-yellow { color: var(--accent-yellow); }
        .bg-accent-yellow { background-color: var(--accent-yellow); }
        .ring-accent-yellow { box-shadow: 0 0 0 3px rgba(255,210,77,0.12); }
        .tab-underline { transition: transform .25s cubic-bezier(.2,.9,.2,1), opacity .25s; }
        .fade-enter { opacity: 0; transform: translateY(6px); }
        .fade-enter-active { opacity: 1; transform: translateY(0); transition: all .28s ease; }
        .card-glass { background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); backdrop-filter: blur(12px); }
        .modal-backdrop { background: rgba(2,6,23,0.6); }
        .itinerary-day { transition: all .18s ease; }
        .itinerary-day:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(2,6,23,0.45); }

        /* Pill buttons */
        .date-pill {
          white-space: normal;
          user-select: none;
          border-radius: 10px;
          padding: 9px 14px;
          font-weight: 600;
          font-size: 13px;
          border: 1px solid rgba(255,255,255,0.08);
          color: #cbd5e1; /* slate-300 */
          background: rgba(255,255,255,0.03);
          box-shadow: none;
          text-align: center;
        }
        .date-pill:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.06);
        }
        .date-pill.selected {
          background: var(--accent-yellow);
          color: #06202a;
          border: 2px solid #1a1a1a;
          box-shadow: 0 4px 14px rgba(0,0,0,0.35), 0 0 0 3px rgba(0,0,0,0.06) inset;
        }

        /* Grid for dates: 1 column on very small screens, 2 columns on sm+ */
        .dates-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          max-height: 220px;
          overflow-y: auto;
        }
        @media (min-width: 640px) {
          .dates-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb with animation */}
        <nav className="text-sm text-gray-700 mb-6 flex items-center gap-2 animate-fade-in">
          <Link to="/" className="hover:text-blue-600 smooth-transition hover:underline">Home</Link>
          <span className="text-gray-500">/</span>
          <Link to="/tours" className="hover:text-blue-600 smooth-transition hover:underline">Tours</Link>
          <span className="text-gray-500">/</span>
          <span className="text-gray-900 font-semibold">{tour ? tour.title! : ""}</span>
        </nav>

        {/* Mobile-optimized layout: Hero -> Title -> Booking -> Content */}
        <div className="lg:hidden">
          {/* Mobile Hero - Reduced height with animation */}
          <div className="relative mb-4 animate-scale-in stagger-1">
            <div className="rounded-2xl overflow-hidden shadow-2xl gradient-border image-overlay">
              <div className="relative w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl">
                {tour && tour.images && tour.images.length > 0 && isSafeImageUrl(tour.images[carouselIndex!]) ? (
                  <img
                    src={tour.images![carouselIndex!]}
                    alt={`${tour.title!} image ${carouselIndex! + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out transform hover:scale-105"
                    loading="lazy"
                    onClick={() => openGallery(carouselIndex)}
                    style={{ cursor: "zoom-in" }}
                  />
                ) : (
                  <img src="/assets/placeholder.jpg" alt="placeholder" className="w-full h-full object-cover" />
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"></div>

                <button
                  aria-label="Previous image"
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-gray-900/80 hover:bg-gray-900 text-white rounded-full p-1.5"
                >
                  ‹
                </button>
                <button
                  aria-label="Next image"
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-900/80 hover:bg-gray-900 text-white rounded-full p-1.5"
                >
                  ›
                </button>

                {/* Mobile badges - simplified */}
                <div className="absolute left-4 bottom-4 text-left z-10">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-gray-900/80 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {(tour?.durationDays ?? itinerary.length)} days
                    </span>
                    {tour && tour.guaranteedDeparture && (
                      <span className="inline-flex items-center gap-1 bg-emerald-600/90 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Guaranteed
                      </span>
                    )}
                  </div>
                </div>

                <div className="absolute right-3 bottom-3 flex gap-1 z-10">
                  {tour && tour.images && tour.images.map((_, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCarouselIndex(idx)}
                      aria-label={`Go to image ${idx + 1}`}
                      className={`w-1.5 h-1.5 rounded-full ${idx === carouselIndex ? "bg-accent-yellow" : "bg-white/30"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Title Section with animations */}
          <div className="mb-4 animate-fade-in-up stagger-2">
            <div className="text-xs uppercase tracking-widest text-gray-600 animate-fade-in stagger-3">{tour?.line ?? "Line"}</div>
            <h1 className="font-serif font-extrabold text-2xl text-gray-900 mt-1 leading-tight animate-slide-in-left stagger-3">
              {tour?.title}
            </h1>
            <p className="text-gray-700 mt-2 text-sm animate-fade-in stagger-4">{tour?.summary}</p>

            <div className="mt-3 flex items-center gap-2 animate-fade-in stagger-5">
              <button onClick={() => openGallery(0)} className="px-3 py-1.5 bg-accent-yellow text-slate-900 rounded-lg font-semibold text-sm smooth-transition hover:shadow-lg hover:scale-105">
                View gallery
              </button>
              {highlights.length > 0 && (
                <span className="text-xs text-gray-600">• {highlights.slice(0, 2).join(", ")}</span>
              )}
            </div>
          </div>

          {/* Mobile Booking Card with animation */}
          <div className="mb-6 animate-scale-in stagger-4">
            <BookingCard compact />
          </div>
        </div>

  {/* Desktop layout: Hero + CTA column to the right on large screens */}
  <div className="mb-6 hidden lg:grid grid-cols-3 gap-6 items-start relative">
          {/* Hero image (left: spans 2 columns on lg) with animation */}
          <div className="lg:col-span-2 relative animate-scale-in stagger-1">
            <div className="rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/10 gradient-border image-overlay modern-card">
              {/* Carousel */}
              <div className="relative w-full h-80 md:h-[450px] bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl">
                {tour && tour.images && tour.images.length > 0 && isSafeImageUrl(tour.images![carouselIndex!]) ? (
                  <img
                    src={tour.images![carouselIndex!]}
                    alt={`${tour.title!} image ${carouselIndex! + 1}`}
                    className="w-full h-full object-cover transition-all duration-700 ease-out transform hover:scale-105"
                    loading="lazy"
                    onClick={() => openGallery(carouselIndex)}
                    style={{ cursor: "zoom-in" }}
                  />
                ) : (
                  <img src="/assets/placeholder.jpg" alt="placeholder" className="w-full h-full object-cover" />
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>

                <button
                  aria-label="Previous image"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-900/80 backdrop-blur-sm hover:bg-gray-900 text-white rounded-full p-3 transition-all duration-200 hover:scale-110 shadow-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  aria-label="Next image"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-900/80 backdrop-blur-sm hover:bg-gray-900 text-white rounded-full p-3 transition-all duration-200 hover:scale-110 shadow-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Desktop lower-left badges and gallery button */}
                <div className="absolute left-6 bottom-6 text-left max-w-2xl z-10">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <p className="text-gray-900 max-w-xl font-medium">{tour ? String(tour.shortDescription || tour.summary || "") : ""}</p>

                  <div className="mt-3 flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 bg-gray-900/80 text-white px-3 py-1 rounded-full text-sm font-medium">• {tour?.durationDays ?? itinerary.length} days</span>
                    {tour && tour.guaranteedDeparture && <span className="inline-flex items-center gap-2 bg-emerald-600/90 text-white px-3 py-1 rounded-full text-sm font-medium">Guaranteed</span>}
                    <button onClick={() => openGallery(0)} className="px-3 py-1.5 bg-accent-yellow text-gray-900 rounded font-semibold text-sm shadow-lg">View gallery</button>
                  </div>
                  </div>
                </div>

                <div className="absolute right-4 bottom-4 flex gap-2 z-10">
                  {tour && tour.images && tour.images.map((_, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCarouselIndex(idx)}
                      aria-label={`Go to image ${idx + 1}`}
                      className={`transition-all duration-300 rounded-full ${
                        idx === carouselIndex 
                          ? "w-8 h-2 bg-accent-yellow shadow-lg" 
                          : "w-2 h-2 bg-white/40 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop CTA column (right side of image on lg) with animation */}
          <div className="lg:col-span-1 items-start flex animate-slide-in-right-custom stagger-2">
            <div className="w-full">
              <BookingCard />
            </div>
          </div>
        </div>

        {/* Desktop Title block (below hero image) with animation */}
        <div className="mb-6 hidden lg:block animate-fade-in-up stagger-3">
          <div className="bg-transparent rounded-md">
            <div className="lg:flex lg:items-center lg:justify-between">
              <div className="lg:w-2/3">
                <div className="text-xs uppercase tracking-wider text-gray-600">{tour ? tour.line! ?? "Line" : "Line"}</div>
                <h1 className="font-serif font-extrabold text-3xl md:text-4xl text-gray-900 mt-2 leading-tight">
                  {tour ? tour.title! : ""}
                </h1>
                <p className="text-gray-700 mt-3 max-w-3xl">{tour ? tour.summary! : ""}</p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-900 px-3 py-1 rounded-full text-sm font-medium border-2 border-gray-200">• {tour ? (tour.durationDays! ?? itinerary.length) : itinerary.length} days</span>
                  {tour && tour.guaranteedDeparture && <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium border-2 border-emerald-200">Guaranteed departure</span>}
                  {highlights.length > 0 && <span className="text-sm text-gray-600">• {highlights.join(", ")}</span>}
                </div>
              </div>

              <div className="mt-4 lg:mt-0 lg:w-1/3 lg:text-right">
                {/* empty placeholder for alignment */}
              </div>
            </div>
          </div>
        </div>

        {/* Tour Video Section - Full Width with animation */}
        {tour && (tour as unknown as { video_url?: string }).video_url && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl bg-white border-2 border-gray-200 animate-scale-in stagger-4">
            <div className="p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-600 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Experience This Tour</h2>
                  <p className="text-gray-700 text-sm lg:text-base">Watch our exclusive video preview</p>
                </div>
              </div>
              
              <div className="relative rounded-xl overflow-hidden shadow-2xl bg-black w-full" style={{ aspectRatio: '16/9' }}>
                <video 
                  src={(tour as unknown as { video_url?: string }).video_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  Your browser does not support the video tag.
                </video>
                
                {/* Content overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Visual Preview</div>
                      <div className="text-sm font-semibold text-gray-900">See highlights</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Real Experience</div>
                      <div className="text-sm font-semibold text-gray-900">Authentic footage</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Plan Ahead</div>
                      <div className="text-sm font-semibold text-gray-900">Know what to expect</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs: full width under the hero/title with animation */}
        <div className="bg-white border-2 border-gray-200 rounded-xl mb-8 shadow-lg animate-fade-in stagger-5">
          <div className="px-6 py-2">
            <div className="flex gap-6 overflow-x-auto">
              <button 
                onClick={() => setActiveTab("itinerary")} 
                className={`px-4 py-4 whitespace-nowrap relative smooth-transition ${
                  activeTab === "itinerary" 
                    ? "text-blue-600 font-bold scale-105" 
                    : "text-gray-700 hover:text-gray-900 hover:scale-105"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Itinerary
                </span>
                {activeTab === "itinerary" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full animate-scale-in" />
                )}
              </button>
              
              <button 
                onClick={() => setActiveTab("availability")} 
                className={`px-4 py-4 whitespace-nowrap relative smooth-transition ${
                  activeTab === "availability" 
                    ? "text-blue-600 font-bold scale-105" 
                    : "text-gray-700 hover:text-gray-900 hover:scale-105"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Availability
                </span>
                {activeTab === "availability" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full animate-scale-in" />
                )}
              </button>
              
              <button 
                onClick={() => setActiveTab("extensions")} 
                className={`px-4 py-4 whitespace-nowrap relative smooth-transition ${
                  activeTab === "extensions" 
                    ? "text-blue-600 font-bold scale-105" 
                    : "text-gray-700 hover:text-gray-900 hover:scale-105"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Extensions
                </span>
                {activeTab === "extensions" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full animate-scale-in" />
                )}
              </button>
              
              <button 
                onClick={() => setActiveTab("details")} 
                className={`px-4 py-4 whitespace-nowrap relative smooth-transition ${
                  activeTab === "details" 
                    ? "text-blue-600 font-bold scale-105" 
                    : "text-gray-700 hover:text-gray-900 hover:scale-105"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Details
                </span>
                {activeTab === "details" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full animate-scale-in" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left: main panels */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab panels */}
            <div>
              {activeTab === "itinerary" && (
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 lg:p-8 shadow-lg animate-fade-in-up">
                  <h3 className="text-2xl lg:text-3xl font-bold mb-6 text-gray-900 flex items-center gap-3 animate-slide-in-left">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    Day-by-day itinerary
                  </h3>
                  <div className="space-y-6">
                    {itinerary.map((day: ItineraryDay & { image?: string }, index: number) => (
                      <div key={day.day} className={`p-6 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 hover:shadow-md smooth-transition animate-fade-in-up stagger-${Math.min(index + 1, 5)}`}>
                        <div className="flex items-start justify-between">
                          <div className="w-full">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="bg-accent-yellow text-gray-900 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                                {day.day}
                              </div>
                              <div>
                                <div className="text-xs text-gray-600 uppercase tracking-wider">Day {day.day}</div>
                                <div className="text-xl font-bold text-gray-900">{day.title}</div>
                              </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed pl-13">{day.description}</p>
                            {day.image && (
                              <div className="mt-4 pl-13">
                                <img 
                                  src={day.image} 
                                  alt={`Itinerary Day ${day.day}`} 
                                  className="w-full max-w-2xl h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md hover:scale-105 transition-transform duration-300" 
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {itinerary.length === 0 && <div className="text-gray-700">No itinerary available.</div>}
                  </div>
                </div>
              )}
              {activeTab === "availability" && (
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 animate-fade-in-up shadow-lg">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 animate-slide-in-left">Availability</h3>
                  <p className="text-gray-700">
                    {hasTravelWindow ? (
                      <>This tour runs from <strong className="text-gray-900">{formatDate(tour!.travelWindow!.start)}</strong> to <strong className="text-gray-900">{formatDate(tour!.travelWindow!.end)}</strong>.</>
                    ) : hasDepartureDates ? (
                      <>Multiple discrete departure dates are available. Choose one from the right.</>
                    ) : (
                      <>Availability details are not available.</>
                    )}
                  </p>
                </div>
              )}
              {activeTab === "extensions" && (
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 animate-fade-in-up shadow-lg">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 animate-slide-in-left">Extensions</h3>
                  <p className="text-gray-700">Optional extensions (e.g., pre/post stays) are available on some departures.</p>
                </div>
              )}
              {activeTab === "details" && (
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 animate-fade-in-up shadow-lg">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 animate-slide-in-left">Tour details</h3>
                  <p className="text-gray-700">Practical information, inclusion/exclusion, activity level and more.</p>

                  {/* If flipbook is available show it here too */}
                  {tour && tour.bookingPdfUrl && (
                    <div className="mt-4">
                      <h4 className="text-sm text-gray-900 mb-2 font-medium">Flipbook</h4>
                      <a href={tour.bookingPdfUrl!} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-2 bg-accent-yellow text-slate-900 rounded font-semibold">Open Flipbook</a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: booking summary + stops (BookingCard removed from aside to avoid duplication) */}
          <aside className="space-y-6">
            {/* Departure Dates Calendar with animation */}
            {hasDepartureDates && (
              <section ref={datesRef} className="animate-scale-in stagger-2">
                <DepartureDateCalendar
                  departureDates={(tour!.departureDates! as DepartureDate[]).map(dateObj => {
                    // Handle both legacy string and new object format
                    if (typeof dateObj === 'string') {
                      return { start: dateObj, end: dateObj };
                    }
                    return dateObj;
                  })}
                  selectedDate={selectedDate || undefined}
                  onSelectDate={(date: string) => setSelectedDate(date)}
                />
              </section>
            )}
            
            {/* Legacy Travel Window (if no departure dates) with animation */}
            {!hasDepartureDates && hasTravelWindow && (
              <section className="bg-white border-2 border-gray-200 rounded-lg p-5 shadow-md animate-scale-in stagger-2">
                <h4 className="text-sm text-gray-700 mb-3 font-medium">Travel Window</h4>
                <div className="text-sm text-gray-700">
                  <div className="font-semibold text-gray-900">{formatDate(tour!.travelWindow!.start)} – {formatDate(tour!.travelWindow!.end)}</div>
                  <div className="text-gray-600 text-xs mt-1">Tour runs during this period</div>
                </div>
              </section>
            )}
            
            {!hasDepartureDates && !hasTravelWindow && (
              <section className="bg-white border-2 border-gray-200 rounded-lg p-5 shadow-md animate-scale-in stagger-2">
                <h4 className="text-sm text-gray-700 mb-3 font-medium">Departure</h4>
                <div className="text-sm text-gray-600">No departure information available</div>
              </section>
            )}

            {/* Tour summary card with animation */}
            <section className="bg-white border-2 border-gray-200 rounded-lg p-5 shadow-md animate-scale-in stagger-3">
              <h4 className="text-sm text-gray-700 mb-2 font-medium">Tour overview</h4>
              <div className="text-sm text-gray-700">
                <p className="mb-2">{tour?.summary}</p>

                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong className="text-gray-900">Duration:</strong> {(tour?.durationDays ?? itinerary.length)} days</li>
                  <li><strong className="text-gray-900">Countries:</strong> {countriesVisited.join(", ") || "—"}</li>
                  <li><strong className="text-gray-900">Highlights:</strong> {highlights.join(", ") || "—"}</li>
                </ul>

                {/* Country image preview (first up to 3) */}
                {tour && tour.additionalInfo && Array.isArray((tour.additionalInfo as AdditionalInfo).countries) && ((tour.additionalInfo as AdditionalInfo).countries!.length > 0) && (
                  <div className="mt-3 flex gap-2">
                    {(tour.additionalInfo as AdditionalInfo).countries!.slice(0, 3).map((c: CountryEntry, i: number) => (
                      <div key={i} className="w-20 h-12 overflow-hidden rounded border bg-black/5">
                        {c.image && isSafeImageUrl(c.image) ? (
                          <img src={c.image} alt={c.name ?? "Country"} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-xs text-slate-300 p-2">{c.name ?? "—"}</div>
                        )}
                      </div>
                    ))}
                    {(tour.additionalInfo as AdditionalInfo).countries!.length > 3 && <div className="text-xs text-gray-600 self-end">+{(tour.additionalInfo as AdditionalInfo).countries!.length - 3}</div>}
                  </div>
                )}
              </div> {/* Close .text-sm .text-slate-200 */}
            </section> {/* Close Tour overview section */}

            {/* Chat with Agent Card with animation and glow */}
            <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-5 border-2 border-blue-300 shadow-lg animate-scale-in stagger-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">Have Questions?</h4>
                  <p className="text-xs text-gray-700 mb-3">Chat with our travel experts to learn more about this tour, customize your itinerary, or get personalized recommendations.</p>
                  <a 
                    href="https://m.me/YourFacebookPage" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.974 12-11.111C24 4.975 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
                    </svg>
                    Chat with Sales Agent
                  </a>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Usually replies within minutes</span>
                  </div>
                </div>
              </div>
            </section> {/* Close Chat with Agent section */}
          </aside> {/* Close aside */}
        </div> {/* Close grid-cols-1 lg:grid-cols-3 */}
      </div> {/* Close container mx-auto */}
      {/* Gallery modal */}
      {galleryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
          <div className="max-w-4xl w-full mx-4 bg-transparent">
            <div className="relative">
              <button onClick={() => setGalleryOpen(false)} className="absolute right-2 top-2 z-50 bg-white/10 text-white rounded-full p-2">✕</button>
              {/* Robust fallback and debug info for gallery image */}
              {images.length > 0 && (
                <GalleryImageWithFallback src={images[galleryIndex]} />
              )}
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <button
                  onClick={() => {
                    if (images.length > 0) {
                      setGalleryIndex((i) => (i - 1 + images.length) % images.length);
                    }
                  }}
                  className="bg-white/10 text-white rounded-full p-2"
                >‹</button>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <button
                  onClick={() => {
                    if (images.length > 0) {
                      setGalleryIndex((i) => (i + 1) % images.length);
                    }
                  }}
                  className="bg-white/10 text-white rounded-full p-2"
                >›</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Stops map modal (simple route preview) */}
      {stopsMapOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center modal-backdrop">
          <div className="max-w-2xl w-full mx-4 bg-white border-2 border-gray-200 rounded-lg p-4 shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-gray-900 font-semibold">Route preview</h3>
              <button onClick={() => setStopsMapOpen(false)} className="text-gray-700 hover:text-gray-900 font-medium">Close</button>
            </div>
            <div className="text-gray-700 text-sm">
              <ol className="space-y-2">
                {stops.length === 0 && <li>No stops to preview.</li>}
                {stops.map((s, i) => {
                  const iso = isoForCountry(s.country);
                  const flag = flagEmojiFromIso(iso);
                  return (
                    <li key={i} className="flex items-center gap-3">
                      <div className="text-2xl">{flag ?? "🏳️"}</div>
                      <div>
                        <div className="font-medium text-gray-900">{s.city}</div>
                        <div className="text-xs text-gray-600">{s.country}</div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      )}
      <BackToTop />
    </div>
  );
  }

