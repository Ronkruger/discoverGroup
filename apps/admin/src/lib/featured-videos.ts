import { supabase } from './supabase';

export interface FeaturedVideo {
  id: string;
  title: string;
  description?: string | null;
  video_url: string;
  thumbnail_url?: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateFeaturedVideoData {
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateFeaturedVideoData {
  title?: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  display_order?: number;
  is_active?: boolean;
}

/**
 * Fetch all featured videos (including inactive ones for admin)
 */
export async function fetchAllFeaturedVideos(): Promise<FeaturedVideo[]> {
  if (!supabase) {
    console.warn('Supabase client not initialized');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('featured_videos')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching featured videos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching featured videos:', error);
    return [];
  }
}

/**
 * Fetch active featured videos (for client display)
 */
export async function fetchActiveFeaturedVideos(): Promise<FeaturedVideo[]> {
  if (!supabase) {
    console.warn('Supabase client not initialized');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('featured_videos')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active featured videos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching active featured videos:', error);
    return [];
  }
}

/**
 * Create a new featured video
 */
export async function createFeaturedVideo(
  videoData: CreateFeaturedVideoData
): Promise<{ success: boolean; video?: FeaturedVideo; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { data, error } = await supabase
      .from('featured_videos')
      .insert([{
        ...videoData,
        display_order: videoData.display_order ?? 0,
        is_active: videoData.is_active ?? true,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating featured video:', error);
      return { success: false, error: error.message };
    }

    return { success: true, video: data };
  } catch (error) {
    console.error('Error creating featured video:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create video',
    };
  }
}

/**
 * Update a featured video
 */
export async function updateFeaturedVideo(
  id: string,
  updates: UpdateFeaturedVideoData
): Promise<{ success: boolean; video?: FeaturedVideo; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { data, error } = await supabase
      .from('featured_videos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating featured video:', error);
      return { success: false, error: error.message };
    }

    return { success: true, video: data };
  } catch (error) {
    console.error('Error updating featured video:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update video',
    };
  }
}

/**
 * Delete a featured video
 */
export async function deleteFeaturedVideo(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { error } = await supabase
      .from('featured_videos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting featured video:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting featured video:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete video',
    };
  }
}

/**
 * Reorder featured videos
 */
export async function reorderFeaturedVideos(
  videos: { id: string; display_order: number }[]
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    // Update each video's display_order
    const updates = videos.map((video) =>
      supabase
        .from('featured_videos')
        .update({ display_order: video.display_order })
        .eq('id', video.id)
    );

    const results = await Promise.all(updates);

    const hasError = results.some((result) => result.error);
    if (hasError) {
      return { success: false, error: 'Failed to reorder some videos' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error reordering featured videos:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reorder videos',
    };
  }
}
