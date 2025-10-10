import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchSuggestion {
  type: 'destination' | 'tour' | 'country';
  title: string;
  subtitle?: string;
  url: string;
  icon?: React.ReactNode;
}

interface EnhancedSearchProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  placeholder = "Where do you want to go?",
  className = "",
  onSearch
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Popular destinations and suggestions
  const popularDestinations: SearchSuggestion[] = [
    {
      type: 'destination',
      title: 'Prague',
      subtitle: 'Czech Republic',
      url: '/search?countries=Czech Republic',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      type: 'destination',
      title: 'Vienna',
      subtitle: 'Austria',
      url: '/search?countries=Austria',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      type: 'destination',
      title: 'Budapest',
      subtitle: 'Hungary',
      url: '/search?countries=Hungary',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      type: 'tour',
      title: 'European Highlights',
      subtitle: '14 days • Multiple countries',
      url: '/tour/europe-highlights',
      icon: <Clock className="w-4 h-4" />
    }
  ];

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
      // Filter suggestions based on query
      const filtered = popularDestinations.filter(
        suggestion =>
          suggestion.title.toLowerCase().includes(value.toLowerCase()) ||
          suggestion.subtitle?.toLowerCase().includes(value.toLowerCase())
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
      <form onSubmit={handleSubmit} className="flex">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="w-full px-6 py-3 pl-12 rounded-l-full shadow-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search destinations"
            autoComplete="off"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-r-full shadow-md hover:bg-yellow-300 transition focus:outline-none focus:ring-2 focus:ring-yellow-500"
          aria-label="Search"
        >
          Explore
        </button>
      </form>

      {/* Dropdown with suggestions */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-12 bg-white shadow-lg rounded-lg mt-2 z-50 max-h-96 overflow-y-auto"
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
  );
};