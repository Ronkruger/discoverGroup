import * as React from "react";
import { useEffect, useState } from "react";
import { getFavorites } from "../api/favorites";
import { fetchTourBySlug } from "../api/tours";
import { useAuth } from "../context/useAuth";
import type { Tour } from "../types";
import TourCard from "../components/TourCard";
import { toggleFavorite } from "../api/favorites";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Loader } from "lucide-react";

export default function Favorites() {
  const [favoriteTours, setFavoriteTours] = useState<Tour[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      // User is not logged in, redirect to login with return URL
      navigate('/login?redirect=/favorites', { replace: true });
      return;
    }

    // Load favorites and tour data
    const loadFavorites = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user's favorite tour slugs
        const { favorites: favSlugs } = await getFavorites();
        setFavorites(favSlugs);

        // Fetch tour details for each favorite
        const tourPromises = favSlugs.map(slug => fetchTourBySlug(slug));
        const tours = await Promise.all(tourPromises);
        
        // Filter out null tours (tours that couldn't be loaded)
        const validTours = tours.filter((tour): tour is Tour => tour !== null);
        setFavoriteTours(validTours);

        console.log('✅ Loaded', validTours.length, 'favorite tours');
      } catch (err) {
        console.error('❌ Failed to load favorites:', err);
        
        // If it's an authentication error, clear auth and redirect to login
        if (err instanceof Error && (err.message.includes('Invalid token') || err.message.includes('not authenticated') || err.message.includes('User not authenticated'))) {
          logout(); // Use logout from context to properly clear everything
          navigate('/login?redirect=/favorites&message=session-expired', { replace: true });
          return;
        }
        
        setError('Failed to load your favorite tours. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user, navigate, logout]);

  const handleToggleFavorite = async (tourSlug: string) => {
    try {
      const result = await toggleFavorite(tourSlug);
      setFavorites(result.favorites);
      
      // Remove tour from display if unfavorited
      if (result.action === 'removed') {
        setFavoriteTours(prev => prev.filter(tour => tour.slug !== tourSlug));
      }
      
      console.log(`${result.action === 'added' ? '❤️ Added to' : '💔 Removed from'} favorites:`, tourSlug);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      alert('Failed to update favorites. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <h1 className="text-4xl font-bold text-gray-900">My Favorites</h1>
          </div>
          <p className="text-gray-600">
            {favoriteTours.length > 0 
              ? `You have ${favoriteTours.length} saved ${favoriteTours.length === 1 ? 'tour' : 'tours'}`
              : 'You haven\'t saved any tours yet'
            }
          </p>
        </div>

        {/* Empty State */}
        {favoriteTours.length === 0 && (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              No favorites yet
            </h2>
            <p className="text-gray-600 mb-8">
              Start exploring tours and save your favorites by clicking the heart icon!
            </p>
            <Link 
              to="/routes" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 font-semibold"
            >
              Explore Tours
            </Link>
          </div>
        )}

        {/* Tours Grid */}
        {favoriteTours.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteTours.map((tour) => (
              <TourCard
                key={tour.slug}
                tour={tour}
                isWishlisted={favorites.includes(tour.slug)}
                onWishlist={() => handleToggleFavorite(tour.slug)}
                onShare={(tour) => {
                  console.log('Share tour:', tour.title);
                  // TODO: Implement share functionality
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
