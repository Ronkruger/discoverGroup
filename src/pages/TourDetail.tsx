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
// Gallery image with fallback and debug info
function GalleryImageWithFallback({ src }: { src: string }) {
  const [error, setError] = useState(false);
  return (
    <div style={{position:'relative'}}>
      {!error ? (
        <img
          src={src}
          alt="Gallery"
          className="w-full h-[70vh] object-contain border-2 border-yellow-400 bg-white"
          onLoad={e => {
            const img = e.currentTarget;
            console.log('Gallery image loaded:', img.src, 'naturalWidth:', img.naturalWidth, 'naturalHeight:', img.naturalHeight);
          }}
          onError={() => {
            setError(true);
            console.error('Gallery image failed to load:', src);
          }}
        />
      ) : (
        <div style={{width:'100%',height:'70vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#fff',border:'2px solid #FFD24D'}}>
          <img src="/assets/placeholder.jpg" alt="placeholder" style={{maxHeight:'60vh',maxWidth:'80vw'}} />
          <div style={{position:'absolute',top:10,left:10,zIndex:1000,color:'yellow',background:'rgba(0,0,0,0.7)',padding:'6px',fontSize:'12px',maxWidth:'80vw',wordBreak:'break-all'}}>
            <b>DEBUG src:</b> {src}<br />
            <span style={{color:'red'}}>Image failed to load. Check Supabase permissions or URL.</span>
          </div>
        </div>
      )}
      {!error && (
        <div style={{position:'absolute',top:10,left:10,zIndex:1000,color:'yellow',background:'rgba(0,0,0,0.7)',padding:'6px',fontSize:'12px',maxWidth:'80vw',wordBreak:'break-all'}}>
          <b>DEBUG src:</b> {src}
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
    // Debug: log images array used for gallery
    console.log("images for gallery", images);

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
          // Debug: log galleryImages and full tour object
          if (t) {
            console.log("tour.galleryImages", t.galleryImages);
            console.log("tour", t);
          }
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
      } catch (err) {
        console.error("fetchTourBySlug error", err);
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
    background:
      "linear-gradient(180deg, rgba(2,18,51,1) 0%, rgba(8,42,102,1) 35%, rgba(4,18,55,1) 100%)",
    ["--accent-yellow" as string]: "#FFD24D",
    ["--accent-yellow-600" as string]: "#FFC107",
    ["--muted-slate" as string]: "#94a3b8",
  };

  // Single BookingCard component used in hero column and compact under hero to avoid duplication
  function BookingCard({ compact = false }: { compact?: boolean }) {
    const compactWrapper = compact ? "p-3" : "p-4";
    const compactButtons = compact ? "text-sm px-2 py-1" : "px-3 py-2";
    return (
      <div className={`${compact ? "w-full" : "w-full"} ${compactWrapper} bg-white card-glass border border-white/8 rounded-lg shadow-lg`}>
        <div className="text-xs text-slate-500">Launch Offer</div>

        <div className="mt-2 flex items-baseline gap-3">
          <div className="text-2xl font-bold" style={{ color: "var(--accent-yellow)" }}>
            {formatCurrencyPHP(perPersonPrimary ?? 0)}
          </div>
          <div className="text-xs text-slate-500">per person</div>
        </div>

        <div className="mt-2 flex items-center gap-2">
          {typeof priceInfo.promo === "number" && (
            <div className="text-xs text-slate-900 bg-accent-yellow px-2 py-1 rounded">Promo available</div>
          )}
          <div className="text-xs text-slate-400">· Flexible payment</div>
        </div>

        {/* If a flipbook is provided, show quick access */}
        {tour && tour.bookingPdfUrl && (
          <div className="mt-3">
            <a href={tour.bookingPdfUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-sm px-3 py-1 bg-white/90 rounded font-semibold">
              Open Flipbook
            </a>
          </div>
        )}

        {compact ? (
          <div className="mt-3 space-y-2">
            <div className="flex gap-2">
              <button onClick={showAvailableDates} className={`${compactButtons} bg-rose-600 text-white rounded`}>Available Dates</button>
              <Link to={`/tour/builder/${encodeURIComponent(builderSlug)}`} className={`${compactButtons} border rounded bg-white hover:bg-slate-50`}>Customize</Link>
            </div>
            <Link
              to={`/booking/${encodeURIComponent(builderSlug)}`}
              state={{ tour, selectedDate, passengers, perPerson: perPersonForTotals }}
              className="w-full text-center px-3 py-2 bg-accent-yellow text-slate-900 rounded font-semibold block"
            >
              BOOK NOW
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-3 flex gap-2">
              <button onClick={showAvailableDates} className={`${compactButtons} bg-rose-600 text-white rounded`}>Available Dates</button>
            </div>
          </>
        )}

        {!compact && (
          <>
            <div className="mt-4">
              <div className="text-xs text-slate-400">PASSENGERS</div>
              <div className="mt-2 flex items-center gap-2">
                <button onClick={() => togglePassenger(-1)} className="px-2 py-1 bg-white/6 rounded">−</button>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={passengers}
                  onChange={(e) => setPassengers(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                  className="w-16 text-black px-2 py-1 rounded border"
                  aria-label="Number of passengers"
                />
                <button onClick={() => togglePassenger(1)} className="px-2 py-1 bg-white/6 rounded">+</button>
                <div className="ml-auto text-xs text-slate-400">Max 10</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-300">PRICE</div>
                <div className="text-xs text-slate-400">Preview options</div>
              </div>

              <div className="mt-2">
                <div className="text-lg font-semibold" style={{ color: "var(--accent-yellow)" }}>
                  {formatCurrencyPHP(perPersonPrimary ?? 0)} <span className="text-xs text-slate-300">per person</span>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  {typeof priceInfo.promo === "number" && (
                    <>
                      <label className="inline-flex items-center gap-2 text-sm text-slate-200">
                        <input type="checkbox" checked={usePromoForTotals} onChange={(e) => setUsePromoForTotals(e.target.checked)} />
                        Use promo for totals
                      </label>
                      <div className="text-xs text-slate-300">Promo: <span className="font-semibold">{formatCurrencyPHP(typeof priceInfo.promo === "number" ? priceInfo.promo : 0)}</span></div>
                    </>
                  )}
                </div>

                {passengers > 1 && (
                  <div className="text-sm font-bold mt-3 text-white">Total: {formatCurrencyPHP(totalForPassengers)}</div>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Link to={`/tour/builder/${encodeURIComponent(builderSlug)}`} className="flex-1 text-center px-3 py-2 bg-accent-yellow text-slate-900 rounded font-semibold">CUSTOMIZE</Link>
              <Link
                to={`/booking/${encodeURIComponent(builderSlug)}`}
                state={{ tour, selectedDate, passengers, perPerson: perPersonForTotals }}
                className="px-3 py-2 border rounded text-sm inline-flex items-center gap-2 bg-white text-slate-900 font-semibold shadow hover:shadow-md"
              >
                BOOK NOW
              </Link>
            </div>
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
        .card-glass { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); backdrop-filter: blur(6px); }
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
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-200/80 mb-4 flex items-center gap-2">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="text-slate-400">/</span>
          <Link to="/tours" className="hover:underline">Tours</Link>
          <span className="text-slate-400">/</span>
          <span className="text-white font-medium">{tour ? tour.title! : ""}</span>
        </nav>

        {/* Mobile-optimized layout: Hero -> Title -> Booking -> Content */}
        <div className="lg:hidden">
          {/* Mobile Hero - Reduced height */}
          <div className="relative mb-4">
            <div className="rounded-lg overflow-hidden shadow-xl">
              <div className="relative w-full h-48 bg-slate-800 rounded">
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5"
                >
                  ‹
                </button>
                <button
                  aria-label="Next image"
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5"
                >
                  ›
                </button>

                {/* Mobile badges - simplified */}
                <div className="absolute left-4 bottom-4 text-left text-white z-10">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-white/20 text-white px-2 py-1 rounded-full text-xs">
                      {(tour?.durationDays ?? itinerary.length)} days
                    </span>
                    {tour && tour.guaranteedDeparture && (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-200 px-2 py-1 rounded-full text-xs">
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

          {/* Mobile Title Section */}
          <div className="mb-4">
            <div className="text-xs uppercase tracking-wider text-slate-200/80">{tour?.line ?? "Line"}</div>
            <h1 className="font-serif font-extrabold text-2xl text-white mt-1 leading-tight">
              {tour?.title}
            </h1>
            <p className="text-slate-300 mt-2 text-sm">{tour?.summary}</p>

            <div className="mt-3 flex items-center gap-2">
              <button onClick={() => openGallery(0)} className="px-3 py-1.5 bg-accent-yellow text-slate-900 rounded font-semibold text-sm">
                View gallery
              </button>
              {highlights.length > 0 && (
                <span className="text-xs text-slate-300">• {highlights.slice(0, 2).join(", ")}</span>
              )}
            </div>
          </div>

          {/* Mobile Booking Card */}
          <div className="mb-6">
            <BookingCard compact />
          </div>
        </div>

  {/* Desktop layout: Hero + CTA column to the right on large screens */}
  <div className="mb-6 hidden lg:grid grid-cols-3 gap-6 items-start relative">
          {/* Hero image (left: spans 2 columns on lg) */}
          <div className="lg:col-span-2 relative">
            <div className="rounded-lg overflow-hidden shadow-xl">
              {/* Carousel */}
              <div className="relative w-full h-80 md:h-[380px] bg-slate-800 rounded">
                {tour && tour.images && tour.images.length > 0 && isSafeImageUrl(tour.images![carouselIndex!]) ? (
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

                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>

                <button
                  aria-label="Previous image"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
                >
                  ‹
                </button>
                <button
                  aria-label="Next image"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
                >
                  ›
                </button>

                {/* Desktop lower-left badges and gallery button */}
                <div className="absolute left-6 bottom-6 text-left text-white max-w-2xl z-10">
                  <div className="mt-0">
                    <p className="text-slate-200/90 max-w-xl">{tour ? String(tour.shortDescription || tour.summary || "") : ""}</p>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 bg-white/6 text-white px-3 py-1 rounded-full text-sm">• {tour?.durationDays ?? itinerary.length} days</span>
                    {tour && tour.guaranteedDeparture && <span className="inline-flex items-center gap-2 bg-emerald-50/6 text-emerald-200 px-3 py-1 rounded-full text-sm">Guaranteed</span>}
                    <button onClick={() => openGallery(0)} className="px-3 py-1.5 bg-accent-yellow text-slate-900 rounded font-semibold text-sm">View gallery</button>
                  </div>
                </div>

                <div className="absolute right-4 bottom-4 flex gap-2 z-10">
                  {tour && tour.images && tour.images.map((_, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCarouselIndex(idx)}
                      aria-label={`Go to image ${idx + 1}`}
                      className={`w-2 h-2 rounded-full ${idx === carouselIndex ? "bg-accent-yellow" : "bg-white/30"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop CTA column (right side of image on lg) */}
          <div className="lg:col-span-1 items-start flex">
            <div className="w-full">
              <BookingCard />
            </div>
          </div>
        </div>

        {/* Desktop Title block (below hero image) */}
        <div className="mb-6 hidden lg:block">
          <div className="bg-transparent rounded-md">
            <div className="lg:flex lg:items-center lg:justify-between">
              <div className="lg:w-2/3">
                <div className="text-xs uppercase tracking-wider text-slate-200/80">{tour ? tour.line! ?? "Line" : "Line"}</div>
                <h1 className="font-serif font-extrabold text-3xl md:text-4xl text-white mt-2 leading-tight">
                  {tour ? tour.title! : ""}
                </h1>
                <p className="text-slate-300 mt-3 max-w-3xl">{tour ? tour.summary! : ""}</p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 bg-white/6 text-white px-3 py-1 rounded-full text-sm">• {tour ? (tour.durationDays! ?? itinerary.length) : itinerary.length} days</span>
                  {tour && tour.guaranteedDeparture && <span className="inline-flex items-center gap-2 bg-emerald-50/6 text-emerald-200 px-3 py-1 rounded-full text-sm">Guaranteed departure</span>}
                  {highlights.length > 0 && <span className="text-sm text-slate-300">• {highlights.join(", ")}</span>}
                </div>
              </div>

              <div className="mt-4 lg:mt-0 lg:w-1/3 lg:text-right">
                {/* empty placeholder for alignment */}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: full width under the hero/title */}
        <div className="bg-white/6 card-glass rounded-t-lg border-b border-white/6 mb-6">
          <div className="px-4">
            <div className="flex gap-4 overflow-x-auto">
              <button onClick={() => setActiveTab("itinerary")} className={`px-3 py-3 whitespace-nowrap -mb-px ${activeTab === "itinerary" ? "border-b-2 border-accent-yellow text-accent-yellow font-semibold" : "text-slate-200"}`}>Itinerary</button>
              <button onClick={() => setActiveTab("availability")} className={`px-3 py-3 whitespace-nowrap -mb-px ${activeTab === "availability" ? "border-b-2 border-accent-yellow text-accent-yellow font-semibold" : "text-slate-200"}`}>Availability</button>
              <button onClick={() => setActiveTab("extensions")} className={`px-3 py-3 whitespace-nowrap -mb-px ${activeTab === "extensions" ? "border-b-2 border-accent-yellow text-accent-yellow font-semibold" : "text-slate-200"}`}>Extensions</button>
              <button onClick={() => setActiveTab("details")} className={`px-3 py-3 whitespace-nowrap -mb-px ${activeTab === "details" ? "border-b-2 border-accent-yellow text-accent-yellow font-semibold" : "text-slate-200"}`}>Details</button>
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
                <div className="bg-white/6 card-glass rounded-lg p-4 lg:p-6 border border-white/6">
                  <h3 className="text-lg lg:text-xl font-semibold mb-4 text-white">Day-by-day itinerary</h3>
                  <div className="space-y-6">
                    {itinerary.map((day: ItineraryDay & { image?: string }) => (
                      <div key={day.day} className="p-4 border rounded-lg bg-white/4">
                        <div className="flex items-start justify-between">
                          <div className="w-full">
                            <div className="text-sm text-slate-300">Day {day.day}</div>
                            <div className="text-lg font-semibold text-white">{day.title}</div>
                            <p className="text-slate-300 mt-2">{day.description}</p>
                            {day.image && (
                              <div className="mt-3">
                                <img src={day.image} alt={`Itinerary Day ${day.day}`} className="w-full max-w-md h-40 object-cover rounded border" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {itinerary.length === 0 && <div className="text-slate-300">No itinerary available.</div>}
                  </div>
                </div>
              )}
              {activeTab === "availability" && (
                <div className="bg-white/6 card-glass rounded-lg p-6 border border-white/6">
                  <h3 className="text-xl font-semibold mb-4 text-white">Availability</h3>
                  <p className="text-slate-300">
                    {hasTravelWindow ? (
                      <>This tour runs from <strong className="text-white">{formatDate(tour!.travelWindow!.start)}</strong> to <strong className="text-white">{formatDate(tour!.travelWindow!.end)}</strong>.</>
                    ) : hasDepartureDates ? (
                      <>Multiple discrete departure dates are available. Choose one from the right.</>
                    ) : (
                      <>Availability details are not available.</>
                    )}
                  </p>
                </div>
              )}
              {activeTab === "extensions" && (
                <div className="bg-white/6 card-glass rounded-lg p-6 border border-white/6">
                  <h3 className="text-xl font-semibold mb-4 text-white">Extensions</h3>
                  <p className="text-slate-300">Optional extensions (e.g., pre/post stays) are available on some departures.</p>
                </div>
              )}
              {activeTab === "details" && (
                <div className="bg-white/6 card-glass rounded-lg p-6 border border-white/6">
                  <h3 className="text-xl font-semibold mb-4 text-white">Tour details</h3>
                  <p className="text-slate-300">Practical information, inclusion/exclusion, activity level and more.</p>

                  {/* If flipbook is available show it here too */}
                  {tour && tour.bookingPdfUrl && (
                    <div className="mt-4">
                      <h4 className="text-sm text-white mb-2">Flipbook</h4>
                      <a href={tour.bookingPdfUrl!} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-2 bg-accent-yellow text-slate-900 rounded font-semibold">Open Flipbook</a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: booking summary + stops (BookingCard removed from aside to avoid duplication) */}
          <aside className="space-y-6">
            {/* Departure Dates Calendar */}
            {hasDepartureDates && (
              <section ref={datesRef}>
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
            
            {/* Legacy Travel Window (if no departure dates) */}
            {!hasDepartureDates && hasTravelWindow && (
              <section className="bg-white/6 card-glass rounded-lg p-5 border border-white/6 shadow-sm">
                <h4 className="text-sm text-slate-200 mb-3">Travel Window</h4>
                <div className="text-sm text-slate-200">
                  <div className="font-semibold text-white">{formatDate(tour!.travelWindow!.start)} – {formatDate(tour!.travelWindow!.end)}</div>
                  <div className="text-slate-400 text-xs mt-1">Tour runs during this period</div>
                </div>
              </section>
            )}
            
            {!hasDepartureDates && !hasTravelWindow && (
              <section className="bg-white/6 card-glass rounded-lg p-5 border border-white/6 shadow-sm">
                <h4 className="text-sm text-slate-200 mb-3">Departure</h4>
                <div className="text-sm text-slate-400">No departure information available</div>
              </section>
            )}

            {/* Tour summary card */}
            <section className="bg-white/6 card-glass rounded-lg p-5 border border-white/6 shadow-sm">
              <h4 className="text-sm text-slate-200 mb-2">Tour overview</h4>
              <div className="text-sm text-slate-200">
                <p className="mb-2">{tour?.summary}</p>

                <ul className="text-sm text-slate-300 space-y-2">
                  <li><strong className="text-white">Duration:</strong> {(tour?.durationDays ?? itinerary.length)} days</li>
                  <li><strong className="text-white">Countries:</strong> {countriesVisited.join(", ") || "—"}</li>
                  <li><strong className="text-white">Highlights:</strong> {highlights.join(", ") || "—"}</li>
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
                    {(tour.additionalInfo as AdditionalInfo).countries!.length > 3 && <div className="text-xs text-slate-300 self-end">+{(tour.additionalInfo as AdditionalInfo).countries!.length - 3}</div>}
                  </div>
                )}
              </div> {/* Close .text-sm .text-slate-200 */}
            </section> {/* Close Tour overview section */}

            {/* Chat with Agent Card */}
            <section className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 card-glass rounded-lg p-5 border-2 border-blue-400/30 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-white mb-1">Have Questions?</h4>
                  <p className="text-xs text-slate-200 mb-3">Chat with our travel experts to learn more about this tour, customize your itinerary, or get personalized recommendations.</p>
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
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
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
          <div className="max-w-2xl w-full mx-4 bg-white/6 card-glass rounded-lg p-4 border border-white/8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-semibold">Route preview</h3>
              <button onClick={() => setStopsMapOpen(false)} className="text-white/80">Close</button>
            </div>
            <div className="text-slate-200 text-sm">
              <ol className="space-y-2">
                {stops.length === 0 && <li>No stops to preview.</li>}
                {stops.map((s, i) => {
                  const iso = isoForCountry(s.country);
                  const flag = flagEmojiFromIso(iso);
                  return (
                    <li key={i} className="flex items-center gap-3">
                      <div className="text-2xl">{flag ?? "🏳️"}</div>
                      <div>
                        <div className="font-medium">{s.city}</div>
                        <div className="text-xs text-slate-300">{s.country}</div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  }

