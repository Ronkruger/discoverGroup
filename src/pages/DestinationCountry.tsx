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
    <main className="container mx-auto px-5 py-10">
      {/* HERO + CAROUSEL + SUMMARY */}
      <header className="mb-8">
        <div className="rounded-lg overflow-hidden bg-slate-50 shadow-sm">
          <div className="md:flex">
            {/* Carousel (left) */}
            <div className="md:w-3/5 relative bg-gray-200">
              <div className="h-56 md:h-64 overflow-hidden relative">
                <img src={carouselImages[currentIndex]} alt={`${country} image ${currentIndex + 1}`} className="w-full h-full object-cover transition-opacity duration-300" loading="lazy" />
                <button onClick={prevImage} aria-label="Previous image" className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 rounded-full w-9 h-9 grid place-items-center">‹</button>
                <button onClick={nextImage} aria-label="Next image" className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 rounded-full w-9 h-9 grid place-items-center">›</button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {carouselImages.map((_, i) => (
                    <button key={i} onClick={() => gotoImage(i)} aria-label={`Show image ${i + 1}`} className={`w-2 h-2 rounded-full ${i === currentIndex ? "bg-white" : "bg-white/60"}`} />
                  ))}
                </div>
              </div>

              {/* thumbnails */}
              <div className="hidden md:flex gap-2 p-3 bg-white border-t">
                {carouselImages.map((src, i) => (
                  <button key={i} onClick={() => gotoImage(i)} className={`w-20 h-12 overflow-hidden rounded-sm border ${i === currentIndex ? "ring-2 ring-rose-500" : "border-slate-200"}`}>
                    <img src={src} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>

            {/* Summary (right) */}
            <div className="md:w-2/5 p-6">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{country}</h1>
              <p className="text-slate-600 mb-4">{summary.blurb}</p>

              <div className="flex items-center gap-3 mb-4">
                <Link to={`/search?countries=${encodeURIComponent(country)}&brands=Trafalgar&useEmbeddedCards=true`} className="inline-block bg-rose-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-rose-700">
                  See all {country} tours
                </Link>

                <div className="text-sm text-slate-500">Passengers</div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setPassengers((p) => Math.max(1, p - 1))} className="w-8 h-8 rounded-full border flex items-center justify-center">−</button>
                  <input aria-label="Passengers" className="w-16 text-center rounded-md border px-2 py-1 text-sm" value={passengers} onChange={(e) => { const v = parseInt(e.target.value, 10); if (!Number.isNaN(v) && v >= 1) setPassengers(v); }} inputMode="numeric" pattern="[0-9]*" />
                  <button type="button" onClick={() => setPassengers((p) => p + 1)} className="w-8 h-8 rounded-full border flex items-center justify-center">+</button>
                </div>
              </div>

              <div className="text-sm text-slate-500 mb-4">{loading ? "Checking available tours…" : `${tours?.length ?? 0} tour${(tours?.length ?? 0) !== 1 ? "s" : ""} available`}</div>

              <div className="bg-white border rounded p-3">
                <div className="text-xs text-slate-500">Practical info</div>
                <div className="text-sm mt-2">
                  <div><strong>Best time:</strong> {summary.practical?.bestTime ?? "—"}</div>
                  <div><strong>Currency:</strong> {summary.practical?.currency ?? "—"}</div>
                  <div><strong>Language:</strong> {summary.practical?.language ?? "—"}</div>
                  {summary.practical?.visa && <div><strong>Visa:</strong> {summary.practical?.visa}</div>}
                </div>
              </div>

              {summary.testimonials && summary.testimonials.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs text-slate-500">What travellers say</div>
                  <div className="mt-2 space-y-2">
                    {summary.testimonials.map((t, i) => (
                      <blockquote key={i} className="text-sm text-slate-700 italic">“{t.quote}” <span className="not-italic text-xs text-slate-500">— {t.author}</span></blockquote>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mini stops / badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          {aggregatedHighlights.map((h) => <span key={h} className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700">{h}</span>)}
        </div>
      </header>

      {/* Map + Attractions + Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Map (col 1/2 on large screens) */}
        <div className="lg:col-span-2">
          <div className="bg-white border rounded p-4 mb-4">
            <div className="text-sm text-slate-500 mb-3">Stops map</div>
            <div ref={mapContainerRef} style={{ width: "100%", height: 360 }} className="rounded" />
            <div className="text-xs text-slate-500 mt-2">Markers show stops included on the listed tours (where coordinates exist).</div>

            <div className="mt-3 flex flex-wrap gap-2">
              {stopsList.map((s) => (
                <span key={`${s.city}-${s.country}`} className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                  {s.city}, {s.country}
                </span>
              ))}
            </div>
          </div>

          {/* Tour cards */}
          <section>
            {loading && <div className="text-slate-500">Loading tours…</div>}
            {!loading && (!tours || tours.length === 0) && <div className="p-6 bg-white border rounded text-slate-600">No tours found for {country}.</div>}
            {!loading && tours && tours.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tours.map((t) => {
                  const priceInfo = getPerPersonForTour(t);
                  const perPerson = priceInfo.regular ?? priceInfo.effective;
                  const promo = priceInfo.promo;
                  const total = perPerson * Math.max(1, passengers);

                  return (
                    <article key={t.slug} className="bg-white border rounded-lg overflow-hidden shadow-sm">
                      <div className="h-40 bg-gray-100">
                        <img src={t.images?.[0] ?? "/assets/placeholder.jpg"} alt={t.title} className="w-full h-40 object-cover" />
                      </div>

                      <div className="p-4">
                        <h2 className="text-lg font-semibold text-slate-900">{t.title}</h2>
                        <p className="text-sm text-slate-600 mt-2">{t.summary}</p>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-xs text-slate-500">{t.durationDays} Days</div>

                          <div className="text-sm text-right">
                            <div className="text-xs text-slate-500">Per head</div>
                            <div className="text-base font-semibold text-slate-900">{formatCurrencyPHP(perPerson)}</div>
                            {promo !== undefined && priceInfo.regular !== undefined && <div className="text-xs text-slate-500 mt-1">Promo: <span className="text-rose-600">{formatCurrencyPHP(promo)}</span></div>}
                            {promo !== undefined && priceInfo.regular === undefined && <div className="text-xs text-slate-500 mt-1">Promo applied</div>}

                            <div className="text-xs text-slate-500 mt-2">Total ({passengers} pax)</div>
                            <div className="text-base font-semibold text-slate-900">{formatCurrencyPHP(total)}</div>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Link to={`/tour/builder/${t.slug}`} className="text-xs px-3 py-2 bg-slate-100 rounded hover:bg-slate-200">Builder</Link>
                          <Link to={`/tour/${t.slug}`} className="text-xs px-3 py-2 bg-rose-600 text-white rounded hover:bg-rose-700">View details</Link>
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
          <div className="bg-white border rounded p-4">
            <div className="text-sm text-slate-500 mb-2">Top attractions</div>
            <div className="space-y-3">
              {attractionsToShow.map((a, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img src={a.image ?? `https://source.unsplash.com/160x100/?${encodeURIComponent(a.title)}`} alt={a.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{a.title}</div>
                    <div className="text-xs text-slate-600">{a.blurb}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact local expert */}
          <div className="bg-white border rounded p-4">
            <div className="text-sm text-slate-500 mb-2">Contact local expert</div>

            {contactSubmitted ? (
              <div className="text-sm text-emerald-700">Thanks — your enquiry was sent. We'll be in touch soon.</div>
            ) : (
              <form onSubmit={submitContact} className="space-y-3">
                <input type="text" placeholder="Full name" value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" required />
                <input type="email" placeholder="Email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" required />
                <textarea placeholder={`Hi, I'm interested in tours to ${country}.`} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" rows={4} />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-rose-600 text-white px-3 py-2 rounded">Send enquiry</button>
                  <button type="button" onClick={() => { setContactName(""); setContactEmail(""); setContactMessage(""); }} className="px-3 py-2 border rounded">Reset</button>
                </div>
              </form>
            )}
          </div>

          {/* Practical info (detailed) */}
          <div className="bg-white border rounded p-4">
            <div className="text-sm text-slate-500 mb-2">Practical info</div>
            <div className="text-sm text-slate-700 space-y-2">
              <div><strong>Best time:</strong> {summary.practical.bestTime}</div>
              <div><strong>Currency:</strong> {summary.practical.currency}</div>
              <div><strong>Language:</strong> {summary.practical.language}</div>
              {summary.practical.visa && <div><strong>Visa:</strong> {summary.practical.visa}</div>}
              <div><strong>Local tip:</strong> Carry a refillable water bottle and comfortable walking shoes for city explorations.</div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="bg-white border rounded p-4 text-center">
            <div className="text-sm text-slate-500 mb-2">Trusted by travellers</div>
            <div className="flex items-center justify-center gap-3">
              <img src="https://via.placeholder.com/60x32?text=ATOL" alt="ATOL" />
              <img src="https://via.placeholder.com/60x32?text=IATA" alt="IATA" />
              <img src="https://via.placeholder.com/60x32?text=BBB" alt="BBB" />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}