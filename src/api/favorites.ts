// Favorites API Client
// Handles adding/removing tours from user's favorites/wishlist

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Get user's favorite tours
 */
export async function getFavorites(): Promise<{ favorites: string[]; count: number }> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/favorites`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `Failed to get favorites: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Get favorites error:', error);
    throw error;
  }
}

/**
 * Add a tour to favorites
 */
export async function addToFavorites(tourSlug: string): Promise<{ 
  message: string; 
  favorites: string[]; 
  count: number 
}> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/favorites`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ tourSlug }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `Failed to add favorite: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Added to favorites:', tourSlug);
    return data;
  } catch (error) {
    console.error('❌ Add to favorites error:', error);
    throw error;
  }
}

/**
 * Remove a tour from favorites
 */
export async function removeFromFavorites(tourSlug: string): Promise<{ 
  message: string; 
  favorites: string[]; 
  count: number 
}> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/favorites/${encodeURIComponent(tourSlug)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `Failed to remove favorite: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Removed from favorites:', tourSlug);
    return data;
  } catch (error) {
    console.error('❌ Remove from favorites error:', error);
    throw error;
  }
}

/**
 * Toggle a tour in favorites (add if not present, remove if present)
 */
export async function toggleFavorite(tourSlug: string): Promise<{ 
  action: 'added' | 'removed';
  message: string; 
  favorites: string[]; 
  count: number;
  isFavorite: boolean;
}> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/favorites/toggle`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ tourSlug }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `Failed to toggle favorite: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ ${data.action === 'added' ? 'Added to' : 'Removed from'} favorites:`, tourSlug);
    return data;
  } catch (error) {
    console.error('❌ Toggle favorite error:', error);
    throw error;
  }
}

/**
 * Check if a tour is in favorites
 */
export async function isTourFavorited(tourSlug: string): Promise<boolean> {
  try {
    const { favorites } = await getFavorites();
    return favorites.includes(tourSlug);
  } catch (error) {
    console.warn('Could not check favorite status:', error);
    return false;
  }
}
