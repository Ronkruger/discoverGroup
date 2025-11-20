import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
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

    (async () => {
      // initialize map entries to null to indicate loading for each country
      setCountryToursMap((prev) => {
        const copy = { ...prev };
        countries.forEach((c) => {
          if (!(c in copy)) copy[c] = null;
        });
        return copy;
      });

      for (const c of countries) {
        try {
          const tours = await fetchToursByCountry(c);
          if (cancelled) return;
          setCountryToursMap((prev) => ({ ...prev, [c]: tours }));
        } catch (err) {
          console.error("fetchToursByCountry error for", c, err);
          if (!cancelled) setCountryToursMap((prev) => ({ ...prev, [c]: [] }));
        }
      }
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
  <header className="w-full backdrop-blur-xl bg-white/95 shadow-xl sticky top-0 border-b border-slate-200/50 z-[100] relative">
      {/* Promo bar - Enhanced */}
      {promoVisible && (
        <div className="w-full bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white relative overflow-hidden">
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          <div className="container mx-auto px-4 py-3 text-sm font-semibold flex justify-center items-center relative z-10">
            <span className="flex items-center gap-2">
              <span className="text-xl animate-bounce">✈️</span>
              <span className="hidden sm:inline">Limited Time Offer:</span>
              <span>Up to 30% off on European Tours!</span>
              <a
                href="/deals"
                className="ml-2 px-4 py-1 bg-yellow-400 text-blue-900 rounded-full font-bold hover:bg-yellow-300 transition-all hover:scale-105 shadow-lg"
              >
                Book Now →
              </a>
            </span>
            <button
              aria-label="Dismiss promo"
              onClick={() => setPromoVisible(false)}
              className="absolute right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1 transition-all"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Utility bar - Enhanced */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-2.5 flex items-center justify-between text-xs text-gray-700">
          <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600 font-medium transition-all group">
            <span className="inline-flex items-center gap-1">
              🌍 TTC Portfolio of Brands 
              <svg className="w-3 h-3 group-hover:rotate-180 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="/faqs" className="hover:text-blue-600 transition-colors font-medium">❓ FAQs</a>
            <a href="/get-a-quote" className="hover:text-blue-600 transition-colors font-medium">💼 Get a Quote</a>
            <a href="/agents" className="hover:text-blue-600 transition-colors font-medium">🔐 Agents Login</a>

            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-blue-600 font-medium transition-colors">
                👤 My Account 
                <svg className="w-3 h-3 group-hover:rotate-180 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out transform group-hover:translate-y-0 translate-y-2">
                <div className="absolute -top-2 right-0 w-full h-2 bg-transparent"></div>
                <ul className="py-2 text-sm">
                  <li className="px-4 py-2.5 hover:bg-blue-50 transition-colors">
                    <a href="/profile" className="flex items-center gap-2 w-full h-full">
                      <span>👤</span> Profile
                    </a>
                  </li>
                  <li className="px-4 py-2.5 hover:bg-blue-50 transition-colors">
                    <a href="/bookings" className="flex items-center gap-2 w-full h-full">
                      <span>📋</span> My Bookings
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main header - Enhanced */}
      <div className="bg-gradient-to-b from-white to-gray-50/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-8">
          {/* Logo - Enhanced */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <img 
                src="../logo.jpg" 
                alt="Discover Group Logo" 
                className="h-16 w-auto drop-shadow-2xl rounded-xl border-2 border-white bg-white transform group-hover:scale-105 transition-transform duration-300 relative z-10" 
              />
            </div>
          </a>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-6" ref={containerRef}>
            {/* Destinations */}
            <div
              className="relative"
              onMouseEnter={() => setMegaOpen(true)}
              onFocus={() => setMegaOpen(true)}
            >
              <button
                className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-blue-900 hover:text-blue-600 transition-all duration-300 px-4 py-2.5 rounded-xl bg-white hover:bg-blue-50 shadow-md hover:shadow-lg border border-gray-200 hover:border-blue-300 group"
                aria-haspopup="dialog"
                aria-expanded={megaOpen}
              >
                <span>🗺️</span>
                Destinations 
                <svg className={`w-4 h-4 transition-transform duration-300 ${megaOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {megaOpen && (
                <div
                  className="absolute left-0 mt-3 w-[1000px] max-w-screen-xl z-50"
                  role="dialog"
                  aria-label="Destinations mega menu"
                >
                  <div className="bg-white border rounded-3xl shadow-2xl overflow-hidden grid grid-cols-[240px_1fr_320px]">
                    {/* continents */}
                    <div className="bg-gray-50 p-6 border-r border-gray-200">
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
                              >
                                <span>{c}</span>
                                <span className="text-sm text-gray-400">▸</span>
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>

                    {/* countries */}
                    <div className="p-6 border-r border-gray-200 bg-white/80">
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
                              className="flex items-center gap-2 text-left px-2 py-2 rounded-lg transition-all duration-150 hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-100 focus:text-blue-900"
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
                    <div className="w-80 relative bg-gradient-to-br from-blue-100/60 to-blue-200/60 flex flex-col justify-end rounded-tr-3xl rounded-br-3xl overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center scale-110 opacity-60"
                        style={{ backgroundImage: `url('/assets/paris.jpg')` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
                      <div className="relative z-10 h-full flex items-end p-8">
                        <Link
                          to={rightCtaSearchUrl}
                          className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-bold px-8 py-3 rounded-full shadow-xl hover:from-yellow-300 hover:to-yellow-400 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-lg"
                        >
                          See All Tours
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Other nav links - Enhanced */}

            <a
              href="#"
              className="text-sm font-bold uppercase tracking-wider text-blue-900 hover:text-blue-600 transition-all duration-200 relative px-3 py-2 rounded-lg hover:bg-blue-50 group"
            >
              <span className="flex items-center gap-2">
                🚶 Ways To Go
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a
              href="#"
              className="text-sm font-bold uppercase tracking-wider text-blue-900 hover:text-blue-600 transition-all duration-200 relative px-3 py-2 rounded-lg hover:bg-blue-50 group"
            >
              <span className="flex items-center gap-2">
                🎉 Deals
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">HOT</span>
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 group-hover:w-full transition-all duration-300"></span>
            </a>
            <Link
              to="/about-us"
              className="text-sm font-bold uppercase tracking-wider text-blue-900 hover:text-blue-600 transition-all duration-200 relative px-3 py-2 rounded-lg hover:bg-blue-50 group"
            >
              <span className="flex items-center gap-2">
                ℹ️ About Us
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/contact"
              className="text-sm font-bold uppercase tracking-wider text-blue-900 hover:text-blue-600 transition-all duration-200 relative px-3 py-2 rounded-lg hover:bg-blue-50 group"
            >
              <span className="flex items-center gap-2">
                📧 Contact
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-6">


            {/* contact - Enhanced */}
            <div className="hidden lg:flex flex-col text-sm text-gray-700 items-end leading-tight bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-2xl shadow-lg border border-blue-200/50 hover:shadow-xl transition-all duration-300 group">
              <div className="font-bold text-blue-900 mb-1 flex items-center gap-2">
                <span className="text-lg">📞</span> Contact Us
              </div>
              <div className="text-xs flex flex-col gap-1">
                <a href="tel:+6302852684 04" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                  <span className="font-semibold">PH:</span> +63 02 8526 8404
                </a>
                <a href="tel:+6581216065" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                  <span className="font-semibold">SG:</span> +65 8121 6065
                </a>
              </div>
              <div className="mt-1 text-[10px] text-blue-600 font-medium">24/7 Support Available</div>
            </div>


            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {/* User menu or Login button (desktop) - Enhanced */}
            {user ? (
              <div className="relative hidden md:inline-block">
                <button
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-bold hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-yellow-400 hover:scale-105 flex items-center gap-2"
                  onClick={() => setUserMenuOpen((s) => !s)}
                >
                  <span className="w-8 h-8 bg-blue-900 text-yellow-400 rounded-full flex items-center justify-center font-bold text-sm">
                    {(user.fullName || user.email).charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden lg:inline">{user.fullName || user.email}</span>
                  <svg className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-4">
                      <div className="font-bold text-lg">{user.fullName || 'User'}</div>
                      <div className="text-xs text-blue-100">{user.email}</div>
                    </div>
                    <ul className="py-2 text-sm">
                      <li>
                        <Link to="/bookings" className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50 transition-all group" onClick={() => setUserMenuOpen(false)}>
                          <span className="text-lg group-hover:scale-110 transition-transform">📋</span>
                          <span className="font-medium">My Bookings</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/favorites" className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50 transition-all group" onClick={() => setUserMenuOpen(false)}>
                          <span className="text-lg group-hover:scale-110 transition-transform">❤️</span>
                          <span className="font-medium">My Favorites</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/profile" className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50 transition-all group" onClick={() => setUserMenuOpen(false)}>
                          <span className="text-lg group-hover:scale-110 transition-transform">👤</span>
                          <span className="font-medium">Profile</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/settings" className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50 transition-all group" onClick={() => setUserMenuOpen(false)}>
                          <span className="text-lg group-hover:scale-110 transition-transform">⚙️</span>
                          <span className="font-medium">Settings</span>
                        </Link>
                      </li>
                      <li className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          className="flex items-center gap-3 w-full px-5 py-3 hover:bg-red-50 text-red-600 transition-all group font-medium"
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                            navigate("/");
                          }}
                        >
                          <span className="text-lg group-hover:scale-110 transition-transform">🚪</span>
                          <span>Logout</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-bold hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-yellow-400 hidden md:inline-flex items-center gap-2 hover:scale-105"
              >
                <span>🔐</span>
                Login
              </Link>
            )}

            {/* mobile toggle - Enhanced */}
            <button
              className="lg:hidden p-3 rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 shadow-md hover:shadow-lg"
              onClick={() => setMobileOpen((s) => !s)}
              aria-label="Toggle menu"
            >
              <svg
                width="24"
                height="16"
                viewBox="0 0 24 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`transition-transform duration-300 ${mobileOpen ? 'rotate-90' : ''}`}
              >
                <rect width="24" height="2.5" rx="1.25" fill="#1e40af" />
                <rect y="7" width="24" height="2.5" rx="1.25" fill="#1e40af" />
                <rect y="14" width="24" height="2.5" rx="1.25" fill="#1e40af" />
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

                {/* User menu or Login button (mobile) */}
                {user ? (
                  <div className="relative">
                    <button
                      className="w-full py-2 text-center rounded-md bg-yellow-400 text-blue-900 font-semibold"
                      onClick={() => setUserMenuOpen((s) => !s)}
                    >
                      {user.fullName || user.email}
                      <span className="ml-2">▼</span>
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg z-50">
                        <ul className="py-2 text-sm">
                          <li>
                            <Link to="/profile" className="block px-4 py-2 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                              See Profile
                            </Link>
                          </li>
                          <li>
                            <Link to="/settings" className="block px-4 py-2 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                              User Settings
                            </Link>
                          </li>
                          <li>
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
                              onClick={() => {
                                logout();
                                setUserMenuOpen(false);
                                navigate("/");
                              }}
                            >
                              Logout
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="py-2 text-center rounded-md bg-yellow-400 text-blue-900 font-semibold"
                  >
                    Login
                  </Link>
                )}

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