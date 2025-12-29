import React, { useState, useRef, useEffect } from 'react';
import { MapPin, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchSuggestion {
  type: 'destination' | 'tour' | 'country';
  title: string;
  subtitle?: string;
  url: string;
  icon?: React.ReactNode;
}


import type { Tour } from "../types";

interface EnhancedSearchProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  tours?: Tour[];
}

export const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  placeholder = "Where do you want to go?",
  className = "",
  onSearch,
  tours = []
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Build suggestions from real tours data
  const popularDestinations: SearchSuggestion[] = tours.map(tour => {
    // Try to get countries from additionalInfo or fullStops
    let countries: string[] = [];
    if (tour.additionalInfo && Array.isArray(tour.additionalInfo.countriesVisited)) {
      countries = tour.additionalInfo.countriesVisited;
    } else if (Array.isArray(tour.fullStops)) {
      const stopsWithCountry = tour.fullStops.filter(stop => typeof stop.country === 'string');
      countries = Array.from(new Set(stopsWithCountry.map(stop => stop.country as string)));
    }
    return {
      type: 'tour',
      title: tour.title,
      subtitle: countries.length > 0 ? countries.join(', ') : undefined,
      url: `/tour/${tour.slug || tour.id}`,
      icon: <MapPin className="w-4 h-4" />
    };
  });

  const recentSearches: SearchSuggestion[] = [
    {
      type: 'country',
      title: 'France',
      subtitle: 'Recent search',
      url: '/search?countries=France',
      icon: <TrendingUp className="w-4 h-4" />
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length > 0) {
      // Filter suggestions based on query from real tours
      const filtered = popularDestinations.filter(
        suggestion =>
          suggestion.title.toLowerCase().includes(value.toLowerCase()) ||
          (suggestion.subtitle && suggestion.subtitle.toLowerCase().includes(value.toLowerCase()))
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      onSearch?.(query);
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    setIsOpen(false);
    navigate(suggestion.url);
  };

  const handleFocus = () => {
    setIsOpen(true);
    if (query.length === 0) {
      setSuggestions(popularDestinations);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex items-stretch bg-white rounded-full shadow-2xl overflow-hidden">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="w-full h-full px-6 py-4 placeholder-gray-400 bg-white focus:outline-none text-lg text-gray-900 font-medium"
            aria-label="Search destinations"
            autoComplete="off"
          />
          
          {/* Dropdown with suggestions - positioned relative to input */}
          {isOpen && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-lg mt-2 z-50 max-h-96 overflow-y-auto"
            >
              {query.length === 0 && (
                <>
                  <div className="p-4 border-b">
                    <h4 className="font-semibold text-gray-900 mb-3">Popular Destinations</h4>
                    <div className="space-y-2">
                      {popularDestinations.map((destination, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(destination)}
                          className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-50 text-left transition"
                        >
                          <div className="text-gray-400">{destination.icon}</div>
                          <div>
                            <div className="font-medium text-gray-900">{destination.title}</div>
                            {destination.subtitle && (
                              <div className="text-sm text-gray-500">{destination.subtitle}</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {recentSearches.length > 0 && (
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Recent Searches</h4>
                      <div className="space-y-2">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(search)}
                            className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-50 text-left transition"
                          >
                            <div className="text-gray-400">{search.icon}</div>
                            <div>
                              <div className="font-medium text-gray-900">{search.title}</div>
                              <div className="text-sm text-gray-500">{search.subtitle}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {query.length > 0 && suggestions.length > 0 && (
                <div className="p-4">
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-50 text-left transition"
                      >
                        <div className="text-gray-400">{suggestion.icon}</div>
                        <div>
                          <div className="font-medium text-gray-900">{suggestion.title}</div>
                          {suggestion.subtitle && (
                            <div className="text-sm text-gray-500">{suggestion.subtitle}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query.length > 0 && suggestions.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  No suggestions found. Press Enter to search for "{query}"
                </div>
              )}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 focus:outline-none flex items-center gap-2 whitespace-nowrap"
          aria-label="Search"
        >
          Explore
        </button>
      </form>
    </div>
  );
};