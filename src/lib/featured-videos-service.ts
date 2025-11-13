// Supabase Featured Videos Service
import { supabase } from './supabase-map-markers';

export interface FeaturedVideo {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeaturedVideoInput {
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  display_order?: number;
  is_active?: boolean;
}

/**
 * Fetch all active featured videos for homepage display
 * Returns empty array if Supabase is not configured
 */
export async function fetchFeaturedVideos(): Promise<FeaturedVideo[]> {
  if (!supabase) {
    console.warn('⚠️ Supabase client not initialized - featured videos disabled');
    return [];
  }

  const { data, error } = await supabase
    .from('featured_videos')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching featured videos:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch all featured videos (including inactive) - for admin
 */
export async function fetchAllFeaturedVideos(): Promise<FeaturedVideo[]> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }

  const { data, error } = await supabase
    .from('featured_videos')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all featured videos:', error);
    throw error;
  }

  return data || [];
}

/**
 * Create a new featured video
 */
export async function createFeaturedVideo(
  video: FeaturedVideoInput
): Promise<FeaturedVideo> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('featured_videos')
    // @ts-expect-error - Supabase type inference issue with optional table
    .insert([video])
    .select()
    .single();

  if (error) {
    console.error('Error creating featured video:', error);
    throw error;
  }

  return data;
}

/**
 * Update a featured video
 */
export async function updateFeaturedVideo(
  id: string,
  updates: Partial<FeaturedVideoInput>
): Promise<FeaturedVideo> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('featured_videos')
    // @ts-expect-error - Supabase type inference issue with optional table
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating featured video:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a featured video
 */
export async function deleteFeaturedVideo(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { error } = await supabase
    .from('featured_videos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting featured video:', error);
    throw error;
  }
}

/**
 * Reorder featured videos
 */
export async function reorderFeaturedVideos(
  videos: { id: string; display_order: number }[]
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const promises = videos.map((video) =>
    supabase!
      .from('featured_videos')
      // @ts-expect-error - Supabase type inference issue with optional table
      .update({ display_order: video.display_order })
      .eq('id', video.id)
  );

  const results = await Promise.all(promises);
  const errors = results.filter((r) => r.error);

  if (errors.length > 0) {
    console.error('Error reordering videos:', errors);
    throw new Error('Failed to reorder videos');
  }
}
