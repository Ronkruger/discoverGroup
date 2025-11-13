import { supabase } from './supabase-map-markers';

// Storage bucket names
export const STORAGE_BUCKETS = {
  TOUR_MEDIA: 'tour-media',
  HOMEPAGE_MEDIA: 'homepage-media',
  USER_PROFILES: 'user-profiles',
} as const;

// File upload result type
export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

// Upload progress callback type
export type UploadProgressCallback = (progress: number) => void;

/**
 * Validate file size and type
 */
export function validateFile(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSizeMB = 50, allowedTypes } = options;

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }

  // Check file type if specified
  if (allowedTypes && allowedTypes.length > 0) {
    const isAllowed = allowedTypes.some((type) => {
      if (type.endsWith('/*')) {
        const prefix = type.split('/')[0];
        return file.type.startsWith(`${prefix}/`);
      }
      return file.type === type;
    });

    if (!isAllowed) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Generate unique file path
 */
export function generateFilePath(file: File, folder?: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${timestamp}_${randomStr}_${sanitizedName}`;
  
  return folder ? `${folder}/${fileName}` : fileName;
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  bucket: string,
  options: {
    folder?: string;
    onProgress?: UploadProgressCallback;
    upsert?: boolean;
  } = {}
): Promise<UploadResult> {
  try {
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase client not initialized',
      };
    }

    const { folder, onProgress, upsert = false } = options;
    
    // Generate file path
    const filePath = generateFilePath(file, folder);

    // Simulate progress for better UX (Supabase doesn't provide upload progress)
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      if (progress <= 90 && onProgress) {
        onProgress(progress);
      }
    }, 100);

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert,
      });

    clearInterval(progressInterval);

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    if (onProgress) {
      onProgress(100);
    }

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Upload exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(
  bucket: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase client not initialized',
      };
    }

    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

/**
 * Upload tour image
 */
export async function uploadTourImage(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  const validation = validateFile(file, {
    maxSizeMB: 10,
    allowedTypes: ['image/*'],
  });

  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    };
  }

  return uploadFile(file, STORAGE_BUCKETS.TOUR_MEDIA, {
    folder: 'tours',
    onProgress,
  });
}

/**
 * Upload tour PDF
 */
export async function uploadTourPDF(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  const validation = validateFile(file, {
    maxSizeMB: 50,
    allowedTypes: ['application/pdf'],
  });

  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    };
  }

  return uploadFile(file, STORAGE_BUCKETS.TOUR_MEDIA, {
    folder: 'pdfs',
    onProgress,
  });
}

/**
 * Upload homepage video
 */
export async function uploadHomepageVideo(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  const validation = validateFile(file, {
    maxSizeMB: 100,
    allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
  });

  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    };
  }

  return uploadFile(file, STORAGE_BUCKETS.HOMEPAGE_MEDIA, {
    folder: 'videos',
    onProgress,
  });
}

/**
 * Upload homepage image (logo, hero, etc)
 */
export async function uploadHomepageImage(
  file: File,
  folder: 'logos' | 'heroes' | 'features' | 'general' = 'general',
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  const validation = validateFile(file, {
    maxSizeMB: 10,
    allowedTypes: ['image/*'],
  });

  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    };
  }

  return uploadFile(file, STORAGE_BUCKETS.HOMEPAGE_MEDIA, {
    folder,
    onProgress,
  });
}

/**
 * Upload user profile image
 */
export async function uploadProfileImage(
  file: File,
  userId: string,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  const validation = validateFile(file, {
    maxSizeMB: 5,
    allowedTypes: ['image/*'],
  });

  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    };
  }

  return uploadFile(file, STORAGE_BUCKETS.USER_PROFILES, {
    folder: userId,
    onProgress,
    upsert: true, // Replace existing profile image
  });
}

/**
 * Extract file path from Supabase URL
 */
export function extractFilePathFromUrl(url: string, bucket: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    const bucketIndex = pathSegments.indexOf(bucket);
    
    if (bucketIndex === -1) return null;
    
    return pathSegments.slice(bucketIndex + 1).join('/');
  } catch {
    return null;
  }
}

/**
 * Delete file by URL
 */
export async function deleteFileByUrl(
  url: string,
  bucket: string
): Promise<{ success: boolean; error?: string }> {
  const filePath = extractFilePathFromUrl(url, bucket);
  
  if (!filePath) {
    return {
      success: false,
      error: 'Invalid file URL',
    };
  }

  return deleteFile(bucket, filePath);
}
