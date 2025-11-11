// Supabase Client for Map Markers
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials missing! Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

export interface MapMarker {
  id?: number;
  city: string;
  country?: string;
  top: string; // e.g., "40%"
  left: string; // e.g., "35%"
  description?: string;
  tour_slug?: string; // Link to a tour if applicable
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch all map markers from Supabase
 */
export async function fetchMapMarkers(): Promise<MapMarker[]> {
  try {
    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Supabase not configured, using fallback markers');
      return getFallbackMarkers();
    }

    const { data, error } = await supabase
      .from('map_markers')
      .select('*')
      .eq('is_active', true)
      .order('city', { ascending: true });

    if (error) {
      // If table doesn't exist (404), silently use fallback
      if (error.message?.includes('does not exist') || error.code === 'PGRST204' || error.code === '42P01') {
        console.warn('⚠️ Map markers table not found, using fallback markers');
        return getFallbackMarkers();
      }
      console.error('❌ Failed to fetch map markers:', error);
      return getFallbackMarkers();
    }

    console.log('✅ Loaded map markers from Supabase:', data?.length || 0);
    return data || getFallbackMarkers();
  } catch (error) {
    console.warn('⚠️ Error fetching map markers, using fallback:', error);
    return getFallbackMarkers();
  }
}

/**
 * Get fallback markers when Supabase is not available
 */
function getFallbackMarkers(): MapMarker[] {
  return [
    { id: 1, city: 'Paris', country: 'France', top: '40%', left: '35%', is_active: true },
    { id: 2, city: 'Rome', country: 'Italy', top: '70%', left: '50%', is_active: true },
    { id: 3, city: 'Lucerne', country: 'Switzerland', top: '55%', left: '42%', is_active: true },
    { id: 4, city: 'Florence', country: 'Italy', top: '65%', left: '48%', is_active: true },
  ];
}

/**
 * Create a new map marker in Supabase
 */
export async function createMapMarker(marker: Omit<MapMarker, 'id' | 'created_at' | 'updated_at'>): Promise<MapMarker | null> {
  try {
    const { data, error } = await supabase
      .from('map_markers')
      .insert([marker])
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to create map marker:', error);
      throw error;
    }

    console.log('✅ Map marker created:', data);
    return data;
  } catch (error) {
    console.error('❌ Error creating map marker:', error);
    return null;
  }
}

/**
 * Update an existing map marker in Supabase
 */
export async function updateMapMarker(id: number, updates: Partial<MapMarker>): Promise<MapMarker | null> {
  try {
    const { data, error } = await supabase
      .from('map_markers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to update map marker:', error);
      throw error;
    }

    console.log('✅ Map marker updated:', data);
    return data;
  } catch (error) {
    console.error('❌ Error updating map marker:', error);
    return null;
  }
}

/**
 * Delete a map marker from Supabase
 */
export async function deleteMapMarker(id: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('map_markers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Failed to delete map marker:', error);
      throw error;
    }

    console.log('✅ Map marker deleted:', id);
    return true;
  } catch (error) {
    console.error('❌ Error deleting map marker:', error);
    return false;
  }
}

/**
 * Toggle marker active status
 */
export async function toggleMapMarkerStatus(id: number, isActive: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('map_markers')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('❌ Failed to toggle map marker status:', error);
      throw error;
    }

    console.log('✅ Map marker status toggled:', id, isActive);
    return true;
  } catch (error) {
    console.error('❌ Error toggling map marker status:', error);
    return false;
  }
}
