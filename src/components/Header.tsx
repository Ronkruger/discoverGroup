import { Link } from "react-router-dom";
import { useEffect, useRef, useState, type JSX } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  fetchContinents,
  fetchCountriesByContinent,
  fetchToursByCountry,
} from "../api/tours";
import type { Tour } from "../types";

/**
 * Header with megamenu.
 *
 * Changes made:
 * - Prefetch tours for each country when countries list loads and store in `countryToursMap`.
 * - Render each country as a <Link to=... state={{ tours, country }}> so DestinationCountry
 *   receives tours via navigation state (fast UX). If a country's tours aren't yet fetched
 *   we show a small "loading" indicator next to the country text.
 *
 * This keeps the behaviour declarative (Link + state) while still providing the fast
 * preview experience by prefetching tours when country list is available.
 */

export default function Header(): JSX.Element {
  const [promoVisible, setPromoVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Mega menu state
  const [megaOpen, setMegaOpen] = useState(false);
  const [continents, setContinents] = useState<string[]>([]);
  const [loadingContinents, setLoadingContinents] = useState(false);

  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [countries, setCountries] = useState<string[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  // Prefetched tours per country: map countryName -> Tour[] | null (null = loading)
  const [countryToursMap, setCountryToursMap] = useState<Record<string, Tour[] | null>>({});

  // local ref to close menus when clicking outside
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // load available continents once
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

  useEffect(() => {
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

  // Prefetch tours for every country in `countries` when the countries array changes.
  useEffect(() => {
    if (!countries || countries.length === 0) return;
    let cancelled = false;

    // initialize entries as null to indicate loading
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

  // If a continent is selected, the right CTA will link to a sensible "search" for that continent's first country.
  const rightCtaSearchUrl = (() => {
    if (selectedContinent && countries.length > 0) {
      const first = countries[0];
      return `/search?countries=${encodeURIComponent(first)}&brands=Trafalgar&useEmbeddedCards=true`;
    }
    // fallback: list all destinations page
    return "/destinations";
  })();

  return (
    <header className="w-full bg-white">
      {/* Promo */}
      {promoVisible && (
        <div className="w-full bg-slate-900 text-white">
          <div className="container mx-auto px-4 py-2 text-center text-sm relative">
            <span>
              Check out today's best deals for year-end departures &nbsp;
              <a href="/deals" className="underline text-sky-300">
                &gt;&gt;
              </a>
            </span>
            <button
              aria-label="Dismiss promo"
              onClick={() => setPromoVisible(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Utility */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-6">
            <div className="cursor-pointer">TTC Portfolio of Brands ▾</div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a href="/faqs" className="hover:text-slate-900">FAQs</a>
            <a href="/get-a-quote" className="hover:text-slate-900">Get a Quote</a>
            <a href="/agents" className="hover:text-slate-900">Agents Login</a>
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-slate-900">My Account ▾</button>
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                <ul className="py-2">
                  <li className="px-4 py-2 hover:bg-slate-50"><a href="/profile">Profile</a></li>
                  <li className="px-4 py-2 hover:bg-slate-50"><a href="/bookings">Bookings</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-3">
              <div className="w-32 h-10  text-white flex items-center justify-center font-semibold tracking-wider rounded-md">
                <img src="../logo.jpg" alt="Logo" width={60} height={60} />
              </div>
            </a>

            <nav className="hidden lg:flex items-center gap-6" ref={containerRef}>
              {/* Destinations - opens mega menu */}
              <div
                className="relative"
                onMouseEnter={() => setMegaOpen(true)}
                onFocus={() => setMegaOpen(true)}
              >
                <button className="text-sm font-medium flex items-center gap-2 hover:text-slate-900" aria-haspopup="dialog" aria-expanded={megaOpen}>
                  Destinations <span className="text-slate-400">▾</span>
                </button>

                {/* Mega menu panel */}
                {megaOpen && (
                  <div
                    className="absolute left-0 mt-3 w-[1000px] max-w-screen-xl z-50"
                    role="dialog"
                    aria-label="Destinations mega menu"
                  >
                    <div className="bg-white border rounded-lg shadow-xl overflow-hidden grid grid-cols-[240px_1fr_320px]">
                      {/* left column: continent list */}
                      <div className="bg-slate-50 p-6 border-r">
                        <div className="text-sm text-slate-500 mb-4">All regions</div>
                        <ul className="space-y-3">
                          {loadingContinents ? (
                            <li className="text-sm text-slate-500">Loading…</li>
                          ) : (
                            continents.map((c) => (
                              <li key={c}>
                                <button
                                  onClick={() => handleSelectContinent(c)}
                                  className={`w-full text-left px-2 py-2 rounded flex items-center justify-between hover:bg-white ${
                                    selectedContinent === c ? "bg-white shadow-sm font-semibold text-rose-600" : "text-slate-700"
                                  }`}
                                  type="button"
                                >
                                  <span>{c}</span>
                                  <span className="text-slate-300">›</span>
                                </button>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>

                      {/* center column: countries for selected continent */}
                      <div className="p-6 border-r">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-slate-900">
                            {selectedContinent ? `${selectedContinent} Destinations` : "Choose a region"}
                          </h4>
                          <div className="text-sm text-slate-500">
                            {loadingCountries ? "Loading countries…" : `${countries.length} countries`}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm text-slate-700">
                          {selectedContinent && !loadingCountries && countries.length === 0 && (
                            <div className="text-slate-500">No countries available</div>
                          )}
                          {countries.map((country) => {
                            const toursForCountry = countryToursMap[country];
                            const isLoadingTours = toursForCountry === null;
                            // Link passes the prefetched tours in state; DestinationCountry will use them if present.
                            return (
                              <Link
                                key={country}
                                to={`/destinations/${encodeURIComponent(country)}`}
                                state={{ tours: toursForCountry ?? [], country }}
                                className="flex items-center gap-2 text-left hover:underline"
                              >
                                <span>{country}</span>
                                {isLoadingTours && <span className="text-xs text-slate-400"> (loading)</span>}
                              </Link>
                            );
                          })}
                        </div>
                      </div>

                      {/* right column: image CTA */}
                      <div className="w-80 relative">
                        <div
                          className="h-full bg-cover bg-center"
                          style={{ backgroundImage: `url('/assets/paris.jpg')` }}
                        >
                          <div className="h-full flex items-end p-6">
                            <Link
                              to={rightCtaSearchUrl}
                              className="bg-rose-600 text-white px-4 py-2 rounded"
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

              {/* Other top-level nav items */}
              <div className="text-sm font-medium flex items-center gap-6">
                <div className="relative group">
                  <a href="#" className="text-sm hover:text-slate-900">Ways To Go <span className="text-slate-400">▾</span></a>
                </div>
                <div className="relative group">
                  <a href="#" className="text-sm hover:text-slate-900">Deals <span className="text-slate-400">▾</span></a>
                </div>
                <div className="relative group">
                  <a href="#" className="text-sm hover:text-slate-900">About Us <span className="text-slate-400">▾</span></a>
                </div>
                <div className="relative group">
                  <a href="#" className="text-sm hover:text-slate-900">River Cruises <span className="text-slate-400">▾</span></a>
                </div>
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* search */}
            <div className="hidden md:flex items-center border rounded overflow-hidden">
              <input type="search" placeholder="Where to or what trip?" className="px-4 py-2 w-64 focus:outline-none" />
              <button className="px-3 bg-slate-100 hover:bg-slate-200">🔍</button>
            </div>

            {/* contact */}
            <div className="hidden lg:flex flex-col text-sm text-slate-700 items-end leading-tight">
              <div className="font-medium">Customers</div>
              <div className="text-[13px]">
                <span className="mr-3">📞 +63 02 8526 8404</span>
                <span>📟 65 8121 6065</span>
              </div>
            </div>

            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            <button className="lg:hidden p-2 rounded border" onClick={() => setMobileOpen((s) => !s)} aria-label="Toggle menu">
              <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                <a href="/routes" className="py-2 border-b">Our Routes</a>
                <a href="/joining-points" className="py-2 border-b">Joining Points</a>
                <a href="/contact" className="py-2 border-b">Contact</a>
                <div className="py-2 border-b"><LanguageSwitcher /></div>
                <div className="py-2">
                  <input type="search" placeholder="Search trips" className="w-full border rounded px-3 py-2" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}