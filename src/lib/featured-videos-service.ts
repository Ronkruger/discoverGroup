const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export interface FeaturedVideo {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  display_order?: number;
  is_active?: boolean;
}

export async function fetchFeaturedVideos(): Promise<FeaturedVideo[]> {
  try {
    const response = await fetch(`${API_URL}/api/featured-videos`);
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data as FeaturedVideo[];
    }

    if (Array.isArray(data?.videos)) {
      return data.videos as FeaturedVideo[];
    }

    return [];
  } catch (error) {
    console.error('Failed to fetch featured videos:', error);
    return [];
  }
}
