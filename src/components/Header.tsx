import * as React from "react";
import { Link } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  fetchContinents,
  fetchCountriesByContinent,
  fetchToursByCountry,
} from "../api/tours";
import type { Tour } from "../types";

// admin URL: prefer env var from Vite, fallback to explicit dev admin port
// Read from a runtime-supplied global to avoid using `import.meta` which
// requires a specific TS `--module` setting; you can set `window.__VITE_ADMIN_URL`
// (or adjust your build) to override the default.
declare global {
  interface Window {
    __VITE_ADMIN_URL?: string;
  }
}

// Use environment variable for admin URL, with fallback logic for different environments
const getAdminUrl = () => {
  // Check for environment variable first
  if (import.meta.env.VITE_ADMIN_URL) {
    return import.meta.env.VITE_ADMIN_URL;
  }
  
  // Check for window variable (for runtime configuration)
  if (window.__VITE_ADMIN_URL) {
    return window.__VITE_ADMIN_URL;
  }
  
  // Development fallback
  if (window.location.hostname === 'localhost') {
    return "http://localhost:5174";
  }
  
  // Production fallback with new Netlify admin panel URL
  return 'https://lambent-dodol-2486cc.netlify.app/';
};

const ADMIN_URL = getAdminUrl();

export default function Header(): React.ReactElement {
  const [promoVisible, setPromoVisible] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const [megaOpen, setMegaOpen] = React.useState(false);
  const [continents, setContinents] = React.useState<string[]>([]);
  const [loadingContinents, setLoadingContinents] = React.useState(false);

  const [selectedContinent, setSelectedContinent] = React.useState<string | null>(null);
  const [countries, setCountries] = React.useState<string[]>([]);
  const [loadingCountries, setLoadingCountries] = React.useState(false);

  const [countryToursMap, setCountryToursMap] = React.useState<Record<string, Tour[] | null>>({});
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingContinents(true);
      try {
        const list = await fetchContinents();
        if (!cancelled) setContinents(list);
      } catch (err) {
        console.error("fetchContinents error", err);
      } finally {
        if (!cancelled) setLoadingContinents(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
        setSelectedContinent(null);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  async function handleSelectContinent(cont: string) {
    setSelectedContinent(cont);
    setCountries([]);
    setLoadingCountries(true);
    try {
      const list = await fetchCountriesByContinent(cont);
      setCountries(list);
    } catch (err) {
      console.error("fetchCountriesByContinent error", err);
      setCountries([]);
    } finally {
      setLoadingCountries(false);
    }
  }

  React.useEffect(() => {
    if (!countries || countries.length === 0) return;
    let cancelled = false;

    setCountryToursMap((prev) => {
      const copy = { ...prev };
      countries.forEach((c) => {
        if (!(c in copy)) copy[c] = null;
      });
      return copy;
    });

    (async () => {
      await Promise.all(
        countries.map(async (c) => {
          try {
            const fetched = await fetchToursByCountry(c);
            if (cancelled) return;
            setCountryToursMap((prev) => ({ ...prev, [c]: fetched }));
          } catch (err) {
            console.error("fetchToursByCountry error for", c, err);
            if (!cancelled) setCountryToursMap((prev) => ({ ...prev, [c]: [] }));
          }
        })
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [countries]);

  const rightCtaSearchUrl = (() => {
    if (selectedContinent && countries.length > 0) {
      const first = countries[0];
      return `/search?countries=${encodeURIComponent(first)}&brands=Trafalgar&useEmbeddedCards=true`;
    }
    return "/destinations";
  })();

  return (
    <header className="w-full bg-white shadow">
      {/* Promo bar */}
      {promoVisible && (
        <div className="w-full bg-gradient-to-r from-blue-900 to-blue-700 text-white relative">
          <div className="container mx-auto px-4 py-2 text-sm font-semibold flex justify-center items-center">
            <span>
              ✈️ Check out today&apos;s best deals for year-end departures{" "}
              <a
                href="/deals"
                className="text-yellow-400 underline ml-1 hover:text-yellow-300 transition"
              >
                Explore &gt;&gt;
              </a>
            </span>
            <button
              aria-label="Dismiss promo"
              onClick={() => setPromoVisible(false)}
              className="absolute right-4 text-slate-300 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Utility bar */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between text-xs text-gray-600">
          <div className="cursor-pointer hover:text-blue-600 font-medium">
            TTC Portfolio of Brands ▾
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="/faqs" className="hover:text-blue-600">FAQs</a>
            <a href="/get-a-quote" className="hover:text-blue-600">Get a Quote</a>
            <a href="/agents" className="hover:text-blue-600">Agents Login</a>

            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-blue-600 font-medium">
                My Account ▾
              </button>
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 ease-in-out">
                <div className="absolute -top-2 right-0 w-full h-2 bg-transparent"></div>
                <ul className="py-2 text-sm">
                  <li className="px-4 py-2 hover:bg-gray-50">
                    <a href="/profile" className="block w-full h-full">Profile</a>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-50">
                    <a href="/bookings" className="block w-full h-full">Bookings</a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Admin panel button (desktop) */}
            {ADMIN_URL && (
              <a
                href={ADMIN_URL}
                target="_blank"
                rel="noopener noreferrser"
                className="ml-2 px-3 py-1 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
              >
                Admin panel
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between gap-8">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <img src="../logo.jpg" alt="Logo" className="h-14 w-auto drop-shadow" />
          </a>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-8" ref={containerRef}>
            {/* Destinations */}
            <div
              className="relative"
              onMouseEnter={() => setMegaOpen(true)}
              onFocus={() => setMegaOpen(true)}
            >
              <button
                className="text-sm font-semibold uppercase tracking-wide flex items-center gap-2 text-blue-900 hover:text-yellow-400 transition relative after:content-[''] after:absolute after:left-0 after:bottom-[-6px] after:w-0 after:h-[2px] after:bg-yellow-400 hover:after:w-full after:transition-all"
                aria-haspopup="dialog"
                aria-expanded={megaOpen}
              >
                Destinations <span className="text-slate-400">▾</span>
              </button>

              {megaOpen && (
                <div
                  className="absolute left-0 mt-3 w-[1000px] max-w-screen-xl z-50"
                  role="dialog"
                  aria-label="Destinations mega menu"
                >
                  <div className="bg-white border rounded-2xl shadow-2xl overflow-hidden grid grid-cols-[240px_1fr_320px]">
                    {/* continents */}
                    <div className="bg-gray-50 p-6 border-r">
                      <div className="text-sm text-gray-500 mb-4">All regions</div>
                      <ul className="space-y-2">
                        {loadingContinents ? (
                          <li className="text-sm text-gray-500">Loading…</li>
                        ) : (
                          continents.map((c) => (
                            <li key={c}>
                              <button
                                onClick={() => handleSelectContinent(c)}
                                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-gray-100 ${
                                  selectedContinent === c
                                    ? "bg-white shadow font-semibold text-blue-600"
                                    : "text-gray-700"
                                }`}
                                type="button"
                              >
                                <span>{c}</span>
                                <span className="text-gray-400">›</span>
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>

                    {/* countries */}
                    <div className="p-6 border-r">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-blue-900">
                          {selectedContinent ? `${selectedContinent} Destinations` : "Choose a region"}
                        </h4>
                        <div className="text-sm text-gray-500">
                          {loadingCountries ? "Loading…" : `${countries.length} countries`}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-700">
                        {selectedContinent && !loadingCountries && countries.length === 0 && (
                          <div className="text-gray-500">No countries available</div>
                        )}
                        {countries.map((country) => {
                          const toursForCountry = countryToursMap[country];
                          const isLoadingTours = toursForCountry === null;
                          return (
                            <Link
                              key={country}
                              to={`/destinations/${encodeURIComponent(country)}`}
                              state={{ tours: toursForCountry ?? [], country }}
                              className="flex items-center gap-2 text-left hover:underline hover:text-blue-600"
                            >
                              <span>{country}</span>
                              {isLoadingTours && (
                                <span className="text-xs text-gray-400"> (loading)</span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="w-80 relative">
                      <div
                        className="h-full bg-cover bg-center"
                        style={{ backgroundImage: `url('/assets/paris.jpg')` }}
                      >
                        <div className="h-full flex items-end p-6 bg-black/30">
                          <Link
                            to={rightCtaSearchUrl}
                            className="bg-yellow-400 text-blue-900 font-semibold px-6 py-2 rounded-full shadow hover:bg-yellow-300 transition"
                          >
                            See All Tours
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Other nav links */}
            {["Ways To Go", "Deals", "About Us"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm font-semibold uppercase tracking-wide text-blue-900 hover:text-yellow-400 transition relative after:content-[''] after:absolute after:left-0 after:bottom-[-6px] after:w-0 after:h-[2px] after:bg-yellow-400 hover:after:w-full after:transition-all"
              >
                {item}
              </a>
            ))}
            
            {/* My Bookings link */}
            <a
              href="/bookings"
              className="text-sm font-semibold uppercase tracking-wide text-blue-900 hover:text-yellow-400 transition relative after:content-[''] after:absolute after:left-0 after:bottom-[-6px] after:w-0 after:h-[2px] after:bg-yellow-400 hover:after:w-full after:transition-all"
            >
              My Bookings
            </a>
            
            {/* River Cruises */}
            <a
              href="#"
              className="text-sm font-semibold uppercase tracking-wide text-blue-900 hover:text-yellow-400 transition relative after:content-[''] after:absolute after:left-0 after:bottom-[-6px] after:w-0 after:h-[2px] after:bg-yellow-400 hover:after:w-full after:transition-all"
            >
              River Cruises
            </a>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* search */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-full shadow px-2">
              <input
                type="search"
                placeholder="Where to or what trip?"
                className="px-4 py-2 w-64 bg-transparent focus:outline-none text-sm"
              />
              <button className="p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition">
                🔍
              </button>
            </div>

            {/* contact */}
            <div className="hidden lg:flex flex-col text-sm text-gray-700 items-end leading-tight bg-gray-50 p-3 rounded-xl shadow-md">
              <div className="font-semibold text-blue-900">Customers</div>
              <div className="text-[13px] flex flex-col">
                <span>📞 +63 02 8526 8404</span>
                <span>💬 65 8121 6065</span>
              </div>
            </div>

            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {/* mobile toggle */}
            <button
              className="lg:hidden p-2 rounded-lg border hover:bg-gray-100 transition"
              onClick={() => setMobileOpen((s) => !s)}
              aria-label="Toggle menu"
            >
              <svg
                width="22"
                height="14"
                viewBox="0 0 22 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="22" height="2" rx="1" fill="#111827" />
                <rect y="6" width="22" height="2" rx="1" fill="#111827" />
                <rect y="12" width="22" height="2" rx="1" fill="#111827" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        {mobileOpen && (
          <div className="lg:hidden border-t bg-white">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col gap-4">
                <a href="/routes" className="py-2 border-b hover:text-blue-600">Our Routes</a>
                <a href="/joining-points" className="py-2 border-b hover:text-blue-600">Joining Points</a>
                <a href="/bookings" className="py-2 border-b hover:text-blue-600">My Bookings</a>
                <a href="/contact" className="py-2 border-b hover:text-blue-600">Contact</a>
                <div className="py-2 border-b"><LanguageSwitcher /></div>
                <div className="py-2">
                  <input
                    type="search"
                    placeholder="Search trips"
                    className="w-full border rounded-full px-3 py-2"
                  />
                </div>

                {/* Admin panel button (mobile) */}
                {ADMIN_URL && (
                  <a
                    href={ADMIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 text-center rounded-md bg-blue-600 text-white font-semibold"
                  >
                    Admin panel
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}