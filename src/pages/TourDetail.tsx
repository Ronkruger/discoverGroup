import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef, type JSX } from "react";
import { fetchTourBySlug } from "../api/tours";
import type { Tour, ItineraryDay, Stop } from "../types";

/**
 * Modernized TourDetail with CTA card placed to the right of the hero image
 *
 * Changes:
 * - Removed the absolute overlay CTA that sat on top of the hero image.
 * - Render the primary CTA card as a separate column to the right of the hero image
 *   on large screens (side-by-side layout).
 * - On small screens the CTA appears stacked below the hero (mobile-friendly).
 *
 * All original behavior preserved: carousel autoplay, gallery modal, pricing fallbacks,
 * keyboard date navigation, booking payload, modals, etc.
 */

export default function TourDetail(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const [tour, setTour] = useState<Tour | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"itinerary" | "availability" | "extensions" | "details">(
    "itinerary"
  );

  // Interactive UI state
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [usePromoForTotals, setUsePromoForTotals] = useState(false);
  const [stopsMapOpen, setStopsMapOpen] = useState(false);

  const carouselTimerRef = useRef<number | null>(null);
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

  // Autoplay for carousel
  useEffect(() => {
    if (tour?.images && tour.images.length > 1) {
      carouselTimerRef.current = window.setInterval(() => {
        setCarouselIndex((i) => (tour.images ? (i + 1) % tour.images.length : 0));
      }, 4500);
      return () => {
        if (carouselTimerRef.current) {
          clearInterval(carouselTimerRef.current);
          carouselTimerRef.current = null;
        }
      };
    } else {
      // If there are not enough images, clear any existing interval
      if (carouselTimerRef.current) {
        clearInterval(carouselTimerRef.current);
        carouselTimerRef.current = null;
      }
    }
  }, [tour]);

  // scroll helper (used by keyboard navigation)
  function scrollDateIntoView(date?: string) {
    if (!datesRef.current || !date) return;
    const btn = datesRef.current.querySelector(`[data-date="${date}"]`) as HTMLElement | null;
    if (btn) btn.scrollIntoView({ behavior: "smooth", inline: "center" });
  }

  // keyboard support for dates (left/right) — placed before early return so hooks are called consistently
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const departureDates = tour?.departureDates;
      if (!departureDates || departureDates.length === 0) return;
      if (!selectedDate) return;
      const idx = departureDates.indexOf(selectedDate);
      if (idx === -1) return;
      if (e.key === "ArrowLeft") {
        const prev = departureDates[Math.max(0, idx - 1)];
        setSelectedDate(prev);
        scrollDateIntoView(prev);
      } else if (e.key === "ArrowRight") {
        const next = departureDates[Math.min(departureDates.length - 1, idx + 1)];
        setSelectedDate(next);
        scrollDateIntoView(next);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedDate, tour?.departureDates]);

  if (!tour) return <p className="p-6 text-slate-200">Loading tour details...</p>;

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
  const perPersonForTotals = usePromoForTotals && typeof priceInfo.promo === "number" ? priceInfo.promo : perPersonPrimary;
  const totalForPassengers = Math.max(1, passengers) * (perPersonForTotals ?? 0);

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

  // UI handlers
  function prevImage() {
    if (!tour || !tour.images || tour.images.length === 0) return;
    setCarouselIndex((i) => {
      const len = tour.images?.length ?? 1;
      return (i - 1 + len) % len;
    });
  }
  function nextImage() {
    if (!tour || !tour.images || tour.images.length === 0) return;
    setCarouselIndex((i) => (i + 1) % ((tour.images?.length ?? 1)));
  }

  function openGallery(index = 0) {
    setGalleryIndex(index);
    setGalleryOpen(true);
  }

  function togglePassenger(delta: number) {
    setPassengers((p) => Math.max(1, Math.min(10, p + delta)));
  }

  // Inline styles + small CSS for theme variables and transitions
  const themeStyle: React.CSSProperties = {
    background:
      "linear-gradient(180deg, rgba(2,18,51,1) 0%, rgba(8,42,102,1) 35%, rgba(4,18,55,1) 100%)",
    ["--accent-yellow" as string]: "#FFD24D",
    ["--accent-yellow-600" as string]: "#FFC107",
    ["--muted-slate" as string]: "#94a3b8",
  };

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
      `}</style>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-200/80 mb-4 flex items-center gap-2">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="text-slate-400">/</span>
          <Link to="/tours" className="hover:underline">Tours</Link>
          <span className="text-slate-400">/</span>
          <span className="text-white font-medium">{tour.title}</span>
        </nav>

        {/* Hero + CTA column to the right on large screens */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start relative">
          {/* Hero image (left: spans 2 columns on lg) */}
          <div className="lg:col-span-2 relative">
            <div className="rounded-lg overflow-hidden shadow-xl">
              {/* Carousel */}
              <div className="relative w-full h-80 md:h-[380px] bg-slate-800 rounded">
                {tour.images && tour.images.length > 0 ? (
                  <img
                    src={tour.images[carouselIndex]}
                    alt={`${tour.title} image ${carouselIndex + 1}`}
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

                {/* small lower-left badges and gallery button left on the image */}
                <div className="absolute left-6 bottom-6 text-left text-white max-w-2xl z-10">
                  <div className="mt-0">
                    <p className="text-slate-200/90 max-w-xl">{String(tour.shortDescription || tour.summary || "")}</p>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 bg-white/6 text-white px-3 py-1 rounded-full text-sm">• {tour.durationDays ?? itinerary.length} days</span>
                    {tour.guaranteedDeparture && <span className="inline-flex items-center gap-2 bg-emerald-50/6 text-emerald-200 px-3 py-1 rounded-full text-sm">Guaranteed</span>}
                    <button onClick={() => openGallery(0)} className="px-3 py-1.5 bg-accent-yellow text-slate-900 rounded font-semibold text-sm">View gallery</button>
                  </div>
                </div>

                <div className="absolute right-4 bottom-4 flex gap-2 z-10">
                  {tour.images?.map((_, idx) => (
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

            {/* mobile/stacked fallback: show a compact inline CTA under the hero on small screens */}
            <div className="block lg:hidden mt-3">
              <div className="w-full bg-white/6 card-glass border border-white/6 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-300">Launch Offer</div>
                    <div className="text-lg font-bold" style={{ color: "var(--accent-yellow)" }}>{formatCurrencyPHP(perPersonPrimary)}</div>
                    <div className="text-xs text-slate-400">per person</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link to={`/tour/builder/${encodeURIComponent(builderSlug)}`} className="px-3 py-2 bg-accent-yellow text-slate-900 rounded text-sm">Customize</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA column (right side of image on lg) */}
          <div className="lg:col-span-1 flex items-start">
            <div className="w-full">
              <div className="hidden lg:block">
                <div className="w-full bg-white card-glass border border-white/8 rounded-lg p-4 shadow-lg">
                  <div className="text-xs text-slate-500">Launch Offer</div>

                  <div className="mt-2 flex items-baseline gap-3">
                    <div className="text-2xl font-bold" style={{ color: "var(--accent-yellow)" }}>
                      {formatCurrencyPHP(perPersonPrimary)}
                    </div>
                    <div className="text-xs text-slate-500">per person</div>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    {priceInfo.promo !== undefined && (
                      <div className="text-xs text-slate-900 bg-accent-yellow px-2 py-1 rounded">Promo available</div>
                    )}
                    <div className="text-xs text-slate-400">· Flexible payment</div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Link to={`/search?countries=${encodeURIComponent(countriesVisited[0] ?? "")}&brands=Trafalgar&useEmbeddedCards=true`} className="px-3 py-2 bg-rose-600 text-white rounded text-sm">Available Dates</Link>
                    <Link to={`/tour/builder/${encodeURIComponent(builderSlug)}`} className="px-3 py-2 border rounded text-sm bg-white hover:bg-slate-50">Customize</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Title block (below hero image) */}
        <div className="mb-6">
          <div className="bg-transparent rounded-md">
            <div className="lg:flex lg:items-center lg:justify-between">
              <div className="lg:w-2/3">
                <div className="text-xs uppercase tracking-wider text-slate-200/80">{tour.line ?? "Line"}</div>
                <h1 className="font-serif font-extrabold text-3xl md:text-4xl text-white mt-2 leading-tight">
                  {tour.title}
                </h1>
                <p className="text-slate-300 mt-3 max-w-3xl">{tour.summary}</p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 bg-white/6 text-white px-3 py-1 rounded-full text-sm">• {tour.durationDays ?? itinerary.length} days</span>
                  {tour.guaranteedDeparture && <span className="inline-flex items-center gap-2 bg-emerald-50/6 text-emerald-200 px-3 py-1 rounded-full text-sm">Guaranteed departure</span>}
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
          <div className="container mx-auto px-0">
            <div className="flex gap-6 px-2">
              <button onClick={() => setActiveTab("itinerary")} className={`px-4 py-3 -mb-px ${activeTab === "itinerary" ? "border-b-2 border-accent-yellow text-accent-yellow font-semibold" : "text-slate-200"}`}>Itinerary</button>
              <button onClick={() => setActiveTab("availability")} className={`px-4 py-3 -mb-px ${activeTab === "availability" ? "border-b-2 border-accent-yellow text-accent-yellow font-semibold" : "text-slate-200"}`}>Availability</button>
              <button onClick={() => setActiveTab("extensions")} className={`px-4 py-3 -mb-px ${activeTab === "extensions" ? "border-b-2 border-accent-yellow text-accent-yellow font-semibold" : "text-slate-200"}`}>Extensions</button>
              <button onClick={() => setActiveTab("details")} className={`px-4 py-3 -mb-px ${activeTab === "details" ? "border-b-2 border-accent-yellow text-accent-yellow font-semibold" : "text-slate-200"}`}>Details</button>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Left: main panels */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab panels */}
            <div className="mt-0">
              {activeTab === "itinerary" && (
                <div className="bg-white/6 card-glass rounded-lg p-6 border border-white/6">
                  <h3 className="text-xl font-semibold mb-4 text-white">Day-by-day itinerary</h3>
                  <div className="space-y-6">
                    {itinerary.map((day: ItineraryDay) => (
                      <div key={day.day} className="p-4 border rounded-lg bg-white/4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm text-slate-300">Day {day.day}</div>
                            <div className="text-lg font-semibold text-white">{day.title}</div>
                            <p className="text-slate-300 mt-2">{day.description}</p>
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
                      <>This tour runs from <strong className="text-white">{formatDate(tour.travelWindow!.start)}</strong> to <strong className="text-white">{formatDate(tour.travelWindow!.end)}</strong>.</>
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
                  <p className="text-slate-300">Practical information, inclusions/exclusions, activity level and more.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: booking / summary + stops (sticky booking card below) */}
          <aside className="space-y-6">
            {/* Departure Dates / Travel Window */}
            <section className="bg-white/6 card-glass rounded-lg p-5 border border-white/6 shadow-sm">
              <h4 className="text-sm text-slate-200 mb-3">Departure</h4>

              {hasTravelWindow ? (
                <div className="text-sm text-slate-200">
                  <div className="font-semibold text-white">{formatDate(tour.travelWindow!.start)} – {formatDate(tour.travelWindow!.end)}</div>
                  <div className="text-slate-400 text-xs mt-1">Travel window (inclusive)</div>
                </div>
              ) : hasDepartureDates ? (
                <div ref={datesRef} className="flex gap-2 overflow-x-auto pb-1">
                  {tour.departureDates!.map((date) => (
                    <button
                      key={date}
                      data-date={date}
                      onClick={() => setSelectedDate(date)}
                      className={`px-3 py-2 text-sm rounded-lg border whitespace-nowrap ${selectedDate === date ? "bg-accent-yellow text-slate-900 border-accent-yellow" : "bg-white/6 text-slate-200 border-white/10"}`}
                      aria-pressed={selectedDate === date}
                    >
                      {formatDate(date)}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-400">No departure information available</div>
              )}
            </section>

            {/* Tour summary card */}
            <section className="bg-white/6 card-glass rounded-lg p-5 border border-white/6 shadow-sm">
              <h4 className="text-sm text-slate-200 mb-2">Tour overview</h4>
              <div className="text-sm text-slate-200">
                <p className="mb-2">{tour.summary}</p>

                <ul className="text-sm text-slate-300 space-y-2">
                  <li><strong className="text-white">Duration:</strong> {tour.durationDays ?? itinerary.length} days</li>
                  <li><strong className="text-white">Countries:</strong> {countriesVisited.join(", ") || "—"}</li>
                  <li><strong className="text-white">Highlights:</strong> {highlights.join(", ") || "—"}</li>
                </ul>
              </div>
            </section>

            {/* Booking Card (visible when travelWindow exists or a discrete date is picked) */}
            {(hasTravelWindow || selectedDate) && (
              <section className="bg-white card-glass border border-white/6 rounded-lg p-5 shadow-lg lg:sticky lg:top-24">
                <div className="mb-3 text-xs text-slate-300">YOUR TOUR</div>

                <div className="mb-3">
                  <div className="text-sm text-white font-medium">{tour.title}</div>
                  <div className="text-xs text-slate-300 mt-1">{tour.line ?? ""} • {tour.durationDays ?? itinerary.length} days</div>
                </div>

                <div className="mb-3">
                  <div className="text-xs text-slate-300">DATES</div>
                  <div className="font-semibold text-white">{hasTravelWindow ? formatDate(tour.travelWindow!.start) : formatDate(selectedDate!)}</div>
                  <div className="text-slate-400 text-sm mt-1">
                    to{" "}
                    {formatDate(
                      new Date(
                        new Date(hasTravelWindow ? tour.travelWindow!.start : selectedDate!).getTime() +
                          ((tour.durationDays ?? itinerary.length) - 1) * 24 * 60 * 60 * 1000
                      ).toISOString()
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-xs text-slate-300">PASSENGERS</div>
                  <div className="mt-1 flex items-center gap-2">
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

                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-300">PRICE</div>
                    <div className="text-xs text-slate-400">Preview options</div>
                  </div>

                  <div className="mt-2">
                    <div className="text-lg font-semibold" style={{ color: "var(--accent-yellow)" }}>
                      {formatCurrencyPHP(perPersonPrimary)} <span className="text-xs text-slate-300">per person</span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      {priceInfo.promo !== undefined && (
                        <>
                          <label className="inline-flex items-center gap-2 text-sm text-slate-200">
                            <input type="checkbox" checked={usePromoForTotals} onChange={(e) => setUsePromoForTotals(e.target.checked)} />
                            Use promo for totals
                          </label>
                          <div className="text-xs text-slate-300">Promo: <span className="font-semibold">{formatCurrencyPHP(priceInfo.promo ?? 0)}</span></div>
                        </>
                      )}
                    </div>

                    {passengers > 1 && (
                      <div className="text-sm font-bold mt-3 text-white">Total: {formatCurrencyPHP(totalForPassengers)}</div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Link to={`/tour/builder/${encodeURIComponent(builderSlug)}`} className="flex-1 text-center px-3 py-2 bg-accent-yellow text-slate-900 rounded font-semibold">CUSTOMIZE</Link>
                  <Link
                    to={`/booking/${encodeURIComponent(builderSlug)}`}
                    state={{ tour, selectedDate, passengers, perPerson: perPersonForTotals }}
                    className="px-3 py-2 border rounded text-sm inline-flex items-center gap-2 bg-white/6"
                  >
                    BOOK NOW
                  </Link>
                </div>
              </section>
            )}

            {/* Stops quick list */}
            <div className="bg-white/6 card-glass rounded-lg p-4 border border-white/6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-white">Stops</div>
                <div className="text-xs text-slate-300">On-tour cities</div>
              </div>

              <div className="max-h-48 overflow-auto pr-2">
                <ul className="space-y-2">
                  {stops.length === 0 && <li className="text-slate-300">No stops provided.</li>}
                  {stops.map((s, i) => {
                    const iso = isoForCountry(s.country);
                    const flag = flagEmojiFromIso(iso);
                    return (
                      <li key={`${s.city}-${i}`} className="flex items-center gap-3 text-slate-200">
                        <div className="text-2xl leading-none">{flag ?? "🏳️"}</div>
                        <div>
                          <div className="text-sm font-medium">{s.city}</div>
                          <div className="text-xs text-slate-300">{s.country}</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-3">
                <button onClick={() => setStopsMapOpen(true)} className="text-sm px-3 py-2 bg-accent-yellow text-slate-900 rounded">Open route map</button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Gallery modal */}
      {galleryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
          <div className="max-w-4xl w-full mx-4 bg-transparent">
            <div className="relative">
              <button onClick={() => setGalleryOpen(false)} className="absolute right-2 top-2 z-50 bg-white/10 text-white rounded-full p-2">✕</button>
              {tour.images && tour.images.length > 0 && (
                <img src={tour.images[galleryIndex]} alt={`Gallery ${galleryIndex + 1}`} className="w-full h-[70vh] object-contain" />
              )}
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <button onClick={() => setGalleryIndex((i) => (i - 1 + (tour.images?.length ?? 1)) % (tour.images?.length ?? 1))} className="bg-white/10 text-white rounded-full p-2">‹</button>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <button onClick={() => setGalleryIndex((i) => (i + 1) % (tour.images?.length ?? 1))} className="bg-white/10 text-white rounded-full p-2">›</button>
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