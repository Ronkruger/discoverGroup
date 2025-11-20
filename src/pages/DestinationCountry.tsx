import { useEffect, useState, useRef } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import type { Tour } from "../types";
import { fetchToursByCountry } from "../api/tours";
import { fetchCountryBySlug, type Country } from "../api/countries";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

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

declare global {
  interface Window {
    L?: LeafletStatic;
  }
}

export default function DestinationCountry() {
  const { country: countryParam } = useParams<{ country: string }>();
  const location = useLocation();
  
  const [country, setCountry] = useState<Country | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const mapRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<unknown | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  // Load country data
  useEffect(() => {
    if (!countryParam) return;
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch country data from API
        const countryData = await fetchCountryBySlug(countryParam);
        setCountry(countryData);
        
        // Fetch tours
        const toursData = location.state?.tours || await fetchToursByCountry(countryParam);
        setTours(Array.isArray(toursData) ? toursData : []);
      } catch (err) {
        console.error('Error loading destination:', err);
        setError('Failed to load destination information');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [countryParam, location.state]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!tours.length || !mapContainerRef.current || mapRef.current) return;
    
    const loadLeaflet = async () => {
      if (window.L) {
        initializeMap();
        return;
      }
      
      // Load Leaflet from CDN
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initializeMap;
      document.head.appendChild(script);
    };
    
    const initializeMap = () => {
      if (!window.L || !mapContainerRef.current) return;
      
      const L = window.L;
      const map = L.map(mapContainerRef.current, { center: [48.8566, 2.3522], zoom: 6 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);
      
      const markersLayer = L.layerGroup();
      markersLayer.addTo(map);
      
      const bounds: [number, number][] = [];
      tours.forEach(tour => {
        if (tour.mapMarkers && Array.isArray(tour.mapMarkers)) {
          tour.mapMarkers.forEach((marker: { lat?: number; lng?: number; label?: string }) => {
            if (marker.lat && marker.lng) {
              L.marker([marker.lat, marker.lng])
                .bindPopup(`<b>${marker.label || 'Location'}</b>`)
                .addTo(markersLayer);
              bounds.push([marker.lat, marker.lng]);
            }
          });
        }
      });
      
      if (bounds.length > 0 && map.fitBounds) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
      
      mapRef.current = map;
      markersLayerRef.current = markersLayer;
    };
    
    loadLeaflet();
  }, [tours]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading destination...</div>
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            {error || 'Destination Not Found'}
          </h1>
          <Link to="/routes" className="text-blue-400 hover:text-blue-300">
            ← Back to All Destinations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Hero Section with Image Carousel */}
      <section className="relative h-[60vh] overflow-hidden">
        {/* Hero Images */}
        {country.heroImages && country.heroImages.length > 0 ? (
          <>
            {country.heroImages.map((imageUrl, index) => (
              <div
                key={index}
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
            ))}
            
            {/* Carousel Navigation */}
            {country.heroImages.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => 
                    prev === 0 ? country.heroImages!.length - 1 : prev - 1
                  )}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => 
                    prev === country.heroImages!.length - 1 ? 0 : prev + 1
                  )}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight size={32} />
                </button>
                
                {/* Dots Indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {country.heroImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-white w-8' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: country.heroImageUrl 
                ? `url(${country.heroImageUrl})`
                : `url(https://source.unsplash.com/1600x900/?${country.heroQuery || country.slug})`,
            }}
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900" />
        <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center">
          <h1 className="text-6xl font-bold text-white mb-4">{country.name}</h1>
          <p className="text-xl text-blue-100 max-w-3xl">{country.description}</p>
        </div>
      </section>

      {/* Practical Info Cards */}
      <section className="py-12 -mt-16 relative z-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="card-glass rounded-2xl p-6">
              <div className="text-yellow-400 text-sm font-semibold mb-2">BEST TIME</div>
              <div className="text-white text-lg">{country.bestTime}</div>
            </div>
            <div className="card-glass rounded-2xl p-6">
              <div className="text-yellow-400 text-sm font-semibold mb-2">CURRENCY</div>
              <div className="text-white text-lg">{country.currency}</div>
            </div>
            <div className="card-glass rounded-2xl p-6">
              <div className="text-yellow-400 text-sm font-semibold mb-2">LANGUAGE</div>
              <div className="text-white text-lg">{country.language}</div>
            </div>
            <div className="card-glass rounded-2xl p-6">
              <div className="text-yellow-400 text-sm font-semibold mb-2">VISA</div>
              <div className="text-white text-lg">{country.visaInfo || 'Check requirements'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Attractions */}
      {country.attractions && country.attractions.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-white mb-10">Top Attractions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {country.attractions
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((attraction, index) => (
                  <div key={attraction._id || index} className="card-glass rounded-2xl overflow-hidden hover:shadow-2xl transition-all">
                    {attraction.imageUrl && (
                      <div
                        className="h-48 bg-cover bg-center"
                        style={{ backgroundImage: `url(${attraction.imageUrl})` }}
                      />
                    )}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-white mb-3">{attraction.title}</h3>
                      <p className="text-slate-300">{attraction.description}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Tours Available */}
      {tours.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-gray-800 to-gray-900">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-white mb-10">Available Tours</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tours.map((tour) => (
                <Link
                  key={tour.id}
                  to={`/tour/${tour.slug}`}
                  className="card-glass rounded-2xl overflow-hidden hover:shadow-2xl transition-all group"
                >
                  <div
                    className="h-56 bg-cover bg-center group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundImage: `url(${tour.images?.[0] || '/placeholder-tour.jpg'})` }}
                  />
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                      {tour.title}
                    </h3>
                    <p className="text-slate-300 text-sm mb-4">
                      {tour.durationDays ? `${tour.durationDays} days` : 'Duration TBA'}
                      {' • '}
                      {tour.additionalInfo?.countriesVisited?.join(', ') || 'Multiple destinations'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-400 font-bold text-xl">
                        ${tour.regularPricePerPerson?.toLocaleString() || 'TBA'}
                      </span>
                      <span className="text-blue-400">View Details →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Map */}
      {tours.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-white mb-10">Tour Locations</h2>
            <div ref={mapContainerRef} className="w-full h-96 rounded-2xl overflow-hidden shadow-2xl" />
          </div>
        </section>
      )}

      {/* Testimonials */}
      {country.testimonials && country.testimonials.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-blue-900/50 to-purple-900/50">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-white mb-10 text-center">What Travelers Say</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {country.testimonials
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((testimonial, index) => (
                  <div key={testimonial._id || index} className="card-glass rounded-2xl p-8">
                    <p className="text-lg text-slate-200 italic mb-4">"{testimonial.quote}"</p>
                    {testimonial.author && (
                      <p className="text-yellow-400 font-semibold">— {testimonial.author}</p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Explore {country.name}?</h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Contact us to customize your perfect {country.name} adventure
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/contact"
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg rounded-full hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:scale-105"
            >
              Contact Us
            </Link>
            <Link
              to="/routes"
              className="px-10 py-4 bg-white/10 text-white font-bold text-lg rounded-full hover:bg-white/20 transition-all border-2 border-white/30"
            >
              View All Destinations
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
