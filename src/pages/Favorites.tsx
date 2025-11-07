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
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
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
        setError('Failed to load your favorite tours. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user, navigate]);

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
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
