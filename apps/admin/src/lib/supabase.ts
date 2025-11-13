import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn('Supabase client not initialized. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
}

// Upload utilities
export interface UploadOptions {
  folder?: string;
  onProgress?: (progress: number) => void;
  upsert?: boolean;
}

export async function uploadFile(
  file: File,
  bucket: string,
  options: UploadOptions = {}
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  const { folder = '', onProgress, upsert = true } = options;

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Simulate progress for better UX
    if (onProgress) {
      onProgress(30);
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert,
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    if (onProgress) {
      onProgress(70);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    if (onProgress) {
      onProgress(100);
    }

    return {
      success: true,
      url: publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

// Helper: Upload logo image
export function uploadLogo(file: File, onProgress?: (progress: number) => void) {
  return uploadFile(file, 'homepage-media', { folder: 'logos', onProgress });
}

// Helper: Upload featured video
export function uploadFeaturedVideo(file: File, onProgress?: (progress: number) => void) {
  return uploadFile(file, 'homepage-media', { folder: 'videos', onProgress });
}

// Helper: Upload video thumbnail
export function uploadVideoThumbnail(file: File, onProgress?: (progress: number) => void) {
  return uploadFile(file, 'homepage-media', { folder: 'thumbnails', onProgress });
}

// Helper: Delete file from storage
export async function deleteFile(bucket: string, filePath: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if (error) {
    console.error('Delete error:', error);
    throw error;
  }
}

// Helper: Extract file path from Supabase URL
export function extractFilePathFromUrl(url: string, bucket: string): string | null {
  try {
    const match = url.match(new RegExp(`/storage/v1/object/public/${bucket}/(.+)$`));
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
