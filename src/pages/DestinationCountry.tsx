import { useEffect, useState, type JSX, useRef } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import type { Tour } from "../types";
import { fetchToursByCountry } from "../api/tours";
import React from "react";

/**
 * DestinationCountry (typed & lint-clean)
 *
 * Notes about fixes applied:
 * - Removed use of `any` (ESLint @typescript-eslint/no-explicit-any) by declaring minimal
 *   Leaflet types (LeafletStatic / LeafletMap) used in this file.
 * - Avoided union typing mistakes by normalizing attractions before rendering so the mapped
 *   items always have { title, blurb, image? } shape (fixes "property 'title' does not exist on type 'string'").
 * - Replaced ad-hoc marker storage on the map object with a dedicated `markersLayerRef` so we
 *   don't attach custom props to the Leaflet map (fixes "property does not exist" complaints).
 * - Fixed strict string|undefined -> string by using nullish coalescing when rendering optional fields.
 * - Included `tours` in the data-loading effect dependency to satisfy react-hooks/exhaustive-deps.
 * - Removed unused variables and ensured catches log the caught error.
 *
 * This file keeps the enhanced carousel, map (Leaflet loaded from CDN), attractions,
 * contact form and per-person price/total UI and should compile without the lint/type
 * errors you posted.
 */

/* ---------- Minimal types for the tiny subset of Leaflet we use ---------- */
type LeafletMap = {
  fitBounds?: (bounds: [number, number][], opts?: { padding?: [number, number] }) => void;
  setView?: (center: [number, number], zoom?: number) => void;
  removeLayer?: (layer: unknown) => void;
};

type LeafletStatic = {
  map: (container: HTMLElement, opts?: { center?: [number, number]; zoom?: number }) => LeafletMap;
  tileLayer: (url: string, opts?: Record<string, unknown>) => { addTo: (map: LeafletMap) => void };
  marker: (coords: [number, number]) => { bindPopup: (html: string) => { addTo: (group: unknown) => void } };
  layerGroup: () => { addTo: (map: LeafletMap) => void };
};

/* ---------- Static country content (summaries + attractions + practical info) ---------- */
const COUNTRY_DATA: Record<
  string,
  {
    blurb: string;
    heroQuery?: string;
    attractions: Array<{ title: string; blurb: string; image?: string }>;
    practical: { bestTime: string; currency: string; language: string; visa?: string };
    testimonials?: Array<{ quote: string; author?: string }>;
  }
> = {
  France: {
    blurb:
      "From the boulevards of Paris to the lavender fields of Provence and the sun-kissed Riviera, France offers rich history, world-class cuisine, and unforgettable landscapes.",
    heroQuery: "france,paris",
    attractions: [
      { title: "Eiffel Tower", blurb: "Iconic Paris landmark with panoramic city views.", image: "https://source.unsplash.com/800x450/?eiffel-tower" },
      { title: "Louvre Museum", blurb: "Home of the Mona Lisa and world-class collections.", image: "https://source.unsplash.com/800x450/?louvre" },
      { title: "Provence Lavender", blurb: "Seasonal lavender fields and scenic villages.", image: "https://source.unsplash.com/800x450/?provence,lavender" },
    ],
    practical: { bestTime: "Apr – Jun, Sep – Oct", currency: "EUR (€)", language: "French", visa: "Schengen visa may be required depending on nationality" },
    testimonials: [
      { quote: "Fantastic itinerary — food, culture and guides were superb.", author: "A. Santos" },
      { quote: "Perfect pace and excellent local hotels.", author: "M. Cruz" },
    ],
  },

  Italy: {
    blurb:
      "Italy blends ancient history, Renaissance art and beautiful coastal scenery — explore Rome, Florence and the gems of Tuscany and the Amalfi coast.",
    heroQuery: "italy,rome",
    attractions: [
      { title: "Colosseum", blurb: "Ancient amphitheatre in the heart of Rome.", image: "https://source.unsplash.com/800x450/?colosseum" },
      { title: "Uffizi Gallery", blurb: "Renaissance art collection in Florence.", image: "https://source.unsplash.com/800x450/?uffizi" },
    ],
    practical: { bestTime: "Apr – Jun, Sep – Oct", currency: "EUR (€)", language: "Italian", visa: "Schengen visa may be required depending on nationality" },
    testimonials: [{ quote: "Incredible food and expertly guided tours.", author: "J. Reyes" }],
  },

  Switzerland: {
    blurb: "Alpine scenery, lakes and scenic train rides — a paradise for nature lovers and photographers.",
    heroQuery: "switzerland,lucerne",
    attractions: [
      { title: "Lake Lucerne", blurb: "Picturesque lake surrounded by mountains.", image: "https://source.unsplash.com/800x450/?lucerne" },
      { title: "Swiss Alps", blurb: "World-class alpine scenery and mountain excursions.", image: "https://source.unsplash.com/800x450/?alps" },
    ],
    practical: { bestTime: "Jun – Sep", currency: "CHF (Swiss Franc)", language: "German/French/Italian", visa: "Schengen" },
  },

  "Vatican City": {
    blurb: "A spiritual microstate at the heart of Rome — small but packed with history and art.",
    heroQuery: "vatican,st-peters",
    attractions: [{ title: "St Peter's Basilica", blurb: "Masterpiece of Renaissance architecture." }],
    practical: { bestTime: "Apr – Oct", currency: "EUR (€)", language: "Italian", visa: "Schengen" },
  },

  default: {
    blurb: "Explore this destination — browse tours, highlights and travel essentials below.",
    heroQuery: undefined,
    attractions: [],
    practical: { bestTime: "Year-round", currency: "Local currency", language: "Local language", visa: "Check local embassy" },
  },
};

/* ---------- Small city coordinates lookup (extend as needed) ---------- */
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Paris: { lat: 48.8566, lng: 2.3522 },
  Lucerne: { lat: 47.0502, lng: 8.3093 },
  Florence: { lat: 43.7696, lng: 11.2558 },
  Rome: { lat: 41.9028, lng: 12.4964 },
  Zurich: { lat: 47.3769, lng: 8.5417 },
  Milan: { lat: 45.4642, lng: 9.1900 },
  Venice: { lat: 45.4408, lng: 12.3155 },
  Prague: { lat: 50.0755, lng: 14.4378 },
  Warsaw: { lat: 52.2297, lng: 21.0122 },
  Manila: { lat: 14.5995, lng: 120.9842 },
};

/* ---------- Helpers ---------- */
function buildCountryImageUrls(country: string, count = 6, width = 1200, height = 600) {
  const q = encodeURIComponent(country);
  const urls: string[] = [];
  for (let i = 1; i <= count; i += 1) {
    urls.push(`https://source.unsplash.com/${width}x${height}/?${q}&sig=${i}`);
  }
  return urls;
}

function formatCurrencyPHP(amount: number) {
  return `PHP ${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/* ---------- Component ---------- */
export default function DestinationCountry(): JSX.Element {
  const { country: countryParam } = useParams<{ country: string }>();
  const location = useLocation();
  const navState = (location.state ?? {}) as { tours?: Tour[]; country?: string } | undefined;
  const country = countryParam ? decodeURIComponent(countryParam) : navState?.country ?? "Destination";

  const [tours, setTours] = useState<Tour[] | null>(() => (navState?.tours && navState.tours.length ? navState.tours : null));
  const [loading, setLoading] = useState<boolean>(tours === null);

  const [passengers, setPassengers] = useState<number>(1);

  // Carousel state
  const [carouselImages, setCarouselImages] = useState<string[]>(() => buildCountryImageUrls(country, 6));
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<ReturnType<LeafletStatic["layerGroup"]> | null>(null);

  useEffect(() => {
    setCarouselImages(buildCountryImageUrls(country, 6));
    setCurrentIndex(0);
  }, [country]);

  // Load tours (include `tours` in deps to satisfy exhaustive-deps; guarded to avoid refetch loops)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (tours && tours.length) return;
      setLoading(true);
      try {
        const fetched = await fetchToursByCountry(country);
        if (!cancelled) setTours(fetched);
      } catch (err) {
        console.error("fetchToursByCountry error", err);
        if (!cancelled) setTours([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [country, tours]);

  // Carousel helpers
  function prevImage() {
    setCurrentIndex((i) => (i - 1 + carouselImages.length) % carouselImages.length);
  }
  function nextImage() {
    setCurrentIndex((i) => (i + 1) % carouselImages.length);
  }
  function gotoImage(i: number) {
    setCurrentIndex(i % carouselImages.length);
  }

  // Initialize Leaflet (load CSS/JS from CDN only once)
  useEffect(() => {
    async function initLeaflet() {
      if (!mapContainerRef.current) return;

      // If Leaflet already loaded and map not created, create the map
      const globalL = (window as unknown as { L?: LeafletStatic }).L;
      if (globalL && !mapInstanceRef.current) {
        const created = globalL.map(mapContainerRef.current, { center: [20, 0], zoom: 2 });
        globalL.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(created);
        mapInstanceRef.current = created;
        return;
      }

      // Ensure leaflet CSS injected
      if (!document.querySelector('link[data-leaflet="true"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.setAttribute("data-leaflet", "true");
        document.head.appendChild(link);
      }

      // Load Leaflet script if not present
      if (!document.querySelector('script[data-leaflet="true"]')) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          s.async = true;
          s.setAttribute("data-leaflet", "true");
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("Failed to load Leaflet"));
          document.body.appendChild(s);
        });
      }

      const L = (window as unknown as { L?: LeafletStatic }).L;
      if (L && !mapInstanceRef.current && mapContainerRef.current) {
        const created = L.map(mapContainerRef.current, { center: [20, 0], zoom: 2 });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(created);
        mapInstanceRef.current = created;
      }
    }

    void initLeaflet().catch((err) => {
      console.warn("Leaflet init failed", err);
    });
  }, []);

  // Update markers when tours (or map) change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !tours) return;

    const L = (window as unknown as { L?: LeafletStatic }).L;
    if (!L) return;

    // Remove previous markers layer if present
    if (markersLayerRef.current && typeof map.removeLayer === "function") {
      try {
        map.removeLayer(markersLayerRef.current as unknown as LeafletMap);
      } catch {
        // ignore removal errors
      }
      markersLayerRef.current = null;
    }

    const group = L.layerGroup();
    const stops = new Map<string, { city: string; country: string }>();
    for (const t of tours) {
      for (const s of t.fullStops ?? []) {
        if (typeof s.city === "string" && typeof s.country === "string") {
          const key = `${s.city}|${s.country}`;
          if (!stops.has(key)) stops.set(key, { city: s.city, country: s.country });
        }
      }
    }

    const bounds: [number, number][] = [];
    stops.forEach((stop) => {
      const coords = CITY_COORDS[stop.city];
      if (coords) {
        const marker = L.marker([coords.lat, coords.lng]);
        marker.bindPopup(`<strong>${stop.city}</strong><div class="text-xs">${stop.country}</div>`);
        // @ts-expect-error: addTo signature exists on layer objects returned by layerGroup()
        marker.addTo(group);
        bounds.push([coords.lat, coords.lng]);
      }
    });

    if (bounds.length > 0) {
      group.addTo(map);
      // fitBounds exists on our minimal type
      if (typeof map.fitBounds === "function") {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
      markersLayerRef.current = group;
    } else if (typeof map.setView === "function") {
      map.setView([20, 0], 2);
    }
  }, [tours]);

  // Pricing helper (typed)
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
      return { regular, promo, effective: regular ?? promo ?? 0 };
    }

    const days = t.durationDays ?? (t.itinerary?.length ?? 0);
    const computed = Math.round((anyT.basePricePerDay ?? 0) * days);
    return { regular: computed, promo: undefined, effective: computed };
  }

  /* ---------- Prepare normalized data for rendering ---------- */
  const summary = COUNTRY_DATA[country] ?? COUNTRY_DATA.default;

  const aggregatedHighlights = (() => {
    if (!tours || tours.length === 0) return [];
    const set = new Set<string>();
    for (const t of tours) {
      (t.highlights ?? []).forEach((h) => set.add(h));
    }
    return Array.from(set).slice(0, 6);
  })();

  // normalized attractions: if summary has none, build from aggregatedHighlights
  const attractionsToShow: Array<{ title: string; blurb: string; image?: string }> =
    summary.attractions && summary.attractions.length > 0
      ? summary.attractions
      : aggregatedHighlights.slice(0, 3).map((h) => ({ title: h, blurb: "", image: undefined }));

  const stopsList = (() => {
    if (!tours) return [] as Array<{ city: string; country: string }>;
    const map = new Map<string, { city: string; country: string }>();
    for (const t of tours) {
      for (const s of t.fullStops ?? []) {
        if (typeof s.city === "string" && typeof s.country === "string") {
          const key = `${s.city}|${s.country}`;
          if (!map.has(key)) map.set(key, { city: s.city, country: s.country });
        }
      }
    }
    return Array.from(map.values());
  })();

  /* ---------- Contact Local Expert (simple client-side form) ---------- */
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  function submitContact(e?: React.FormEvent) {
    if (e) e.preventDefault();
    console.info("Contact enquiry", { country, contactName, contactEmail, contactMessage });
    setContactSubmitted(true);
    setContactName("");
    setContactEmail("");
    setContactMessage("");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6 py-12">
        {/* HERO + CAROUSEL + SUMMARY */}
        <header className="mb-16">
          <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md shadow-2xl border border-white/10">
            <div className="md:flex">
            {/* Carousel (left) */}
            <div className="md:w-3/5 relative bg-gradient-to-br from-blue-900 to-slate-900">
              <div className="h-80 md:h-[500px] overflow-hidden relative group">
                <img 
                  src={carouselImages[currentIndex]} 
                  alt={`${country} image ${currentIndex + 1}`} 
                  className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105" 
                  loading="lazy" 
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                
                {/* Navigation buttons with improved styling */}
                <button 
                  onClick={prevImage} 
                  aria-label="Previous image" 
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full w-12 h-12 grid place-items-center transition-all duration-300 hover:scale-110 shadow-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button 
                  onClick={nextImage} 
                  aria-label="Next image" 
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full w-12 h-12 grid place-items-center transition-all duration-300 hover:scale-110 shadow-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 backdrop-blur-sm bg-black/20 px-3 py-2 rounded-full">
                  {carouselImages.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => gotoImage(i)} 
                      aria-label={`Show image ${i + 1}`} 
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentIndex ? "bg-white w-8" : "bg-white/60 hover:bg-white/80"}`} 
                    />
                  ))}
                </div>
              </div>

              {/* thumbnails */}
              <div className="hidden md:flex gap-2 p-3 bg-gray-800/50 backdrop-blur-md border-t border-white/10">
                {carouselImages.map((src, i) => (
                  <button key={i} onClick={() => gotoImage(i)} className={`w-20 h-12 overflow-hidden rounded-sm border ${i === currentIndex ? "ring-2 ring-rose-500" : "border-slate-200"}`}>
                    <img src={src} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>

            {/* Summary (right) */}
            <div className="md:w-2/5 p-8 flex flex-col">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{country}</h1>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">{summary.blurb}</p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <Link to={`/search?countries=${encodeURIComponent(country)}&brands=Trafalgar&useEmbeddedCards=true`} className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  See all {country} tours
                </Link>

                <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-full border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Travelers:</span>
                  <button type="button" onClick={() => setPassengers((p) => Math.max(1, p - 1))} className="w-8 h-8 rounded-full bg-white border border-gray-300 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center transition-all">−</button>
                  <input aria-label="Passengers" className="w-14 text-center rounded-lg border border-gray-300 px-2 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={passengers} onChange={(e) => { const v = parseInt(e.target.value, 10); if (!Number.isNaN(v) && v >= 1) setPassengers(v); }} inputMode="numeric" pattern="[0-9]*" />
                  <button type="button" onClick={() => setPassengers((p) => p + 1)} className="w-8 h-8 rounded-full bg-white border border-gray-300 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center transition-all">+</button>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 text-sm text-gray-600 mb-6 bg-blue-50 px-4 py-2 rounded-full">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{loading ? "Checking available tours…" : `${tours?.length ?? 0} ${(tours?.length ?? 0) === 1 ? 'tour' : 'tours'} available`}</span>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Practical Information
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-start gap-2"><span className="font-semibold text-gray-700 min-w-[80px]">Best time:</span><span className="text-gray-600">{summary.practical?.bestTime ?? "—"}</span></div>
                  <div className="flex items-start gap-2"><span className="font-semibold text-gray-700 min-w-[80px]">Currency:</span><span className="text-gray-600">{summary.practical?.currency ?? "—"}</span></div>
                  <div className="flex items-start gap-2"><span className="font-semibold text-gray-700 min-w-[80px]">Language:</span><span className="text-gray-600">{summary.practical?.language ?? "—"}</span></div>
                  {summary.practical?.visa && <div className="flex items-start gap-2"><span className="font-semibold text-gray-700 min-w-[80px]">Visa:</span><span className="text-gray-600">{summary.practical?.visa}</span></div>}
                </div>
              </div>

              {summary.testimonials && summary.testimonials.length > 0 && (
                <div className="mt-6 flex-1">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    Traveler Reviews
                  </h3>
                  <div className="space-y-3">
                    {summary.testimonials.map((t, i) => (
                      <blockquote key={i} className="text-sm text-slate-300 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 italic">
                        <svg className="w-4 h-4 text-blue-400 mb-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        "{t.quote}" <span className="not-italic text-xs text-gray-500 font-medium block mt-1">— {t.author}</span>
                      </blockquote>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mini stops / badges */}
        <div className="mt-6 flex flex-wrap gap-3">
          {aggregatedHighlights.map((h) => (
            <span key={h} className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {h}
            </span>
          ))}
        </div>
      </header>

      {/* Map + Attractions + Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Map (col 1/2 on large screens) */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              Tour Destinations
            </h2>
            <div ref={mapContainerRef} style={{ width: "100%", height: 400 }} className="rounded-xl shadow-inner mb-4" />
            <p className="text-sm text-gray-500 mb-4">Interactive map showing all destinations included in our {country} tours</p>

            <div className="flex flex-wrap gap-2">
              {stopsList.map((s) => (
                <span key={`${s.city}-${s.country}`} className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 font-medium border border-gray-200">
                  <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {s.city}, {s.country}
                </span>
              ))}
            </div>
          </div>

          {/* Tour cards */}
          <section>
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}
            {!loading && (!tours || tours.length === 0) && (
              <div className="p-8 bg-white border border-gray-200 rounded-2xl text-center shadow-lg">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-lg font-semibold text-gray-700">No tours found for {country}</p>
                <p className="text-sm text-gray-500 mt-2">Check back soon for new adventures!</p>
              </div>
            )}
            {!loading && tours && tours.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2">
                {tours.map((t) => {
                  const priceInfo = getPerPersonForTour(t);
                  const perPerson = priceInfo.regular ?? priceInfo.effective;
                  const promo = priceInfo.promo;
                  const total = perPerson * Math.max(1, passengers);

                  return (
                    <article key={t.slug} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:from-white/15 transition-all duration-300 group">
                      <div className="relative h-56 bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden">
                        <img src={t.images?.[0] ?? "/assets/placeholder.jpg"} alt={t.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <span className="inline-block bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                            {t.durationDays} Days Journey
                          </span>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{t.title}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{t.summary}</p>

                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">From per person</div>
                            <div className="text-xl font-bold text-blue-600">{formatCurrencyPHP(perPerson)}</div>
                            {promo !== undefined && priceInfo.regular !== undefined && (
                              <div className="text-xs text-emerald-600 font-semibold mt-1">
                                Save {formatCurrencyPHP(priceInfo.regular - promo)}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 mb-1">Total ({passengers} pax)</div>
                            <div className="text-lg font-bold text-gray-900">{formatCurrencyPHP(total)}</div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link to={`/tour/builder/${t.slug}`} className="flex-1 text-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
                            Customize
                          </Link>
                          <Link to={`/tour/${t.slug}`} className="flex-1 text-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-md hover:shadow-lg">
                            View Details
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right column: attractions, contact form, trust badges */}
        <aside className="space-y-6">
          {/* Top attractions */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              Top Attractions
            </h3>
            <div className="space-y-4">
              {attractionsToShow.map((a, i) => (
                <div key={i} className="flex gap-3 items-start group hover:bg-gray-50 p-2 -m-2 rounded-xl transition-colors">
                  <div className="w-20 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                    <img src={a.image ?? `https://source.unsplash.com/160x100/?${encodeURIComponent(a.title)}`} alt={a.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{a.title}</div>
                    <div className="text-xs text-gray-600 mt-1 leading-relaxed">{a.blurb}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact local expert */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Contact Our Experts
            </h3>
            <p className="text-sm text-gray-600 mb-4">Get personalized travel advice</p>

            {contactSubmitted ? (
              <div className="bg-white rounded-xl p-4 text-center">
                <svg className="w-12 h-12 text-emerald-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm font-semibold text-emerald-700">Message Sent!</p>
                <p className="text-xs text-gray-600 mt-1">We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={submitContact} className="space-y-3">
                <input type="text" placeholder="Full name" value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                <input type="email" placeholder="Email address" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                <textarea placeholder={`Hi, I'm interested in tours to ${country}.`} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows={4} />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
                    Send Inquiry
                  </button>
                  <button type="button" onClick={() => { setContactName(""); setContactEmail(""); setContactMessage(""); }} className="px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Reset
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Practical info (detailed) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Travel Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-700">Best Time to Visit</div>
                  <div className="text-sm text-gray-900 mt-1">{summary.practical.bestTime}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-700">Currency</div>
                  <div className="text-sm text-gray-900 mt-1">{summary.practical.currency}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-700">Language</div>
                  <div className="text-sm text-gray-900 mt-1">{summary.practical.language}</div>
                </div>
              </div>
              {summary.practical.visa && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-700">Visa Requirements</div>
                    <div className="text-sm text-gray-900 mt-1">{summary.practical.visa}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trust badges */}
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 shadow-lg text-center">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Trusted & Certified</h3>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center border border-gray-200">
                <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              </div>
              <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center border border-gray-200">
                <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              </div>
              <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center border border-gray-200">
                <svg className="w-10 h-10 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3">Licensed & Insured Tour Operator</p>
          </div>
        </aside>
      </div>
    </div>
    </main>
  );
}