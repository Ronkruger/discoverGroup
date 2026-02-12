/**
 * Upload Helper Utilities
 * Centralized upload functions for different resource types
 */

const API_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:4000';

interface UploadResponse {
  success: boolean;
  url: string;
  fileName: string;
  size: number;
  type: string;
}

interface UploadError {
  error: string;
  message: string;
}

/**
 * Generic upload function to R2 storage
 */
async function uploadToStorage(
  file: File,
  folder: string,
  label?: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  if (label) formData.append('label', label);

  const response = await fetch(`${API_URL}/api/upload/single`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error: UploadError = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  const data: UploadResponse = await response.json();
  return data.url;
}

/**
 * Upload multiple files to storage
 */
async function uploadMultipleToStorage(
  files: File[],
  folder: string,
  label?: string
): Promise<string[]> {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  formData.append('folder', folder);
  if (label) formData.append('label', label);

  const response = await fetch(`${API_URL}/api/upload/multiple`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error: UploadError = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  const data = await response.json();
  return data.files.map((f: UploadResponse) => f.url);
}

// ============================================================================
// TOUR UPLOADS
// ============================================================================

export const TourUploads = {
  /**
   * Upload main tour image
   */
  uploadMainImage: async (file: File, tourId: string): Promise<string> => {
    return uploadToStorage(file, `tours/${tourId}/main`, 'main');
  },

  /**
   * Upload tour gallery image
   */
  uploadGalleryImage: async (file: File, tourId: string): Promise<string> => {
    return uploadToStorage(file, `tours/${tourId}/gallery`, 'gallery');
  },

  /**
   * Upload multiple gallery images
   */
  uploadGalleryImages: async (files: File[], tourId: string): Promise<string[]> => {
    return uploadMultipleToStorage(files, `tours/${tourId}/gallery`, 'gallery');
  },

  /**
   * Upload itinerary day image
   */
  uploadItineraryImage: async (file: File, tourId: string, dayNumber: number): Promise<string> => {
    return uploadToStorage(file, `tours/${tourId}/itinerary/day-${dayNumber}`, `day-${dayNumber}`);
  },

  /**
   * Upload tour video
   */
  uploadVideo: async (file: File, tourId: string): Promise<string> => {
    return uploadToStorage(file, `tours/${tourId}/videos`, 'video');
  },

  /**
   * Upload related tour images
   */
  uploadRelatedImages: async (files: File[], tourId: string): Promise<string[]> => {
    return uploadMultipleToStorage(files, `tours/${tourId}/related`, 'related');
  },
};

// ============================================================================
// COUNTRY UPLOADS
// ============================================================================

export const CountryUploads = {
  /**
   * Upload country hero image
   */
  uploadHeroImage: async (file: File, countryId: string): Promise<string> => {
    return uploadToStorage(file, `countries/${countryId}/hero`, 'hero');
  },

  /**
   * Upload multiple hero images
   */
  uploadHeroImages: async (files: File[], countryId: string): Promise<string[]> => {
    return uploadMultipleToStorage(files, `countries/${countryId}/hero`, 'hero');
  },

  /**
   * Upload attraction image
   */
  uploadAttractionImage: async (file: File, countryId: string, attractionId?: string): Promise<string> => {
    const folder = attractionId 
      ? `countries/${countryId}/attractions/${attractionId}`
      : `countries/${countryId}/attractions`;
    return uploadToStorage(file, folder, 'attraction');
  },

  /**
   * Upload country flag
   */
  uploadFlag: async (file: File, countryId: string): Promise<string> => {
    return uploadToStorage(file, `countries/${countryId}/flag`, 'flag');
  },
};

// ============================================================================
// USER UPLOADS
// ============================================================================

export const UserUploads = {
  /**
   * Upload user profile image
   */
  uploadProfileImage: async (file: File, userId: string): Promise<string> => {
    return uploadToStorage(file, `users/${userId}/profile`, 'profile');
  },

  /**
   * Upload user avatar
   */
  uploadAvatar: async (file: File, userId: string): Promise<string> => {
    return uploadToStorage(file, `users/${userId}/avatar`, 'avatar');
  },
};

// ============================================================================
// DOCUMENT UPLOADS (Bookings, Visa, etc.)
// ============================================================================

export const DocumentUploads = {
  /**
   * Upload passport document
   */
  uploadPassport: async (file: File, bookingId: string, customerId: string): Promise<string> => {
    return uploadToStorage(file, `documents/passports/${customerId}`, bookingId);
  },

  /**
   * Upload visa document
   */
  uploadVisa: async (file: File, bookingId: string, customerId: string): Promise<string> => {
    return uploadToStorage(file, `documents/visas/${customerId}`, bookingId);
  },

  /**
   * Upload visa application document
   */
  uploadVisaApplication: async (file: File, applicationId: string, documentType: string): Promise<string> => {
    return uploadToStorage(file, `documents/visa-applications/${applicationId}`, documentType);
  },

  /**
   * Upload general booking document
   */
  uploadBookingDocument: async (file: File, bookingId: string, documentType: string): Promise<string> => {
    return uploadToStorage(file, `documents/bookings/${bookingId}`, documentType);
  },
};

// ============================================================================
// HOMEPAGE/SETTINGS UPLOADS
// ============================================================================

export const HomepageUploads = {
  /**
   * Upload homepage logo
   */
  uploadLogo: async (file: File): Promise<string> => {
    return uploadToStorage(file, 'homepage/logo', 'logo');
  },

  /**
   * Upload hero section image
   */
  uploadHeroImage: async (file: File): Promise<string> => {
    return uploadToStorage(file, 'homepage/hero', 'hero');
  },

  /**
   * Upload feature icon/image
   */
  uploadFeatureImage: async (file: File, featureId: string): Promise<string> => {
    return uploadToStorage(file, `homepage/features/${featureId}`, 'feature');
  },

  /**
   * Upload testimonial image
   */
  uploadTestimonialImage: async (file: File, testimonialId: string): Promise<string> => {
    return uploadToStorage(file, `homepage/testimonials/${testimonialId}`, 'testimonial');
  },

  /**
   * Upload promo banner image
   */
  uploadPromoBanner: async (file: File, bannerId: string): Promise<string> => {
    return uploadToStorage(file, `homepage/promo-banners/${bannerId}`, 'banner');
  },
};

// ============================================================================
// FOLDER STRUCTURE REFERENCE
// ============================================================================

/**
 * R2 Storage Folder Structure:
 * 
 * tours/
 *   ├── {tourId}/
 *   │   ├── main/              - Main tour image
 *   │   ├── gallery/           - Gallery images
 *   │   ├── itinerary/
 *   │   │   ├── day-1/         - Day 1 itinerary images
 *   │   │   ├── day-2/         - Day 2 itinerary images
 *   │   │   └── ...
 *   │   ├── videos/            - Tour videos
 *   │   └── related/           - Related tour images
 * 
 * countries/
 *   ├── {countryId}/
 *   │   ├── hero/              - Hero/banner images
 *   │   ├── flag/              - Country flag
 *   │   └── attractions/
 *   │       ├── {attractionId}/ - Specific attraction images
 *   │       └── ...
 * 
 * users/
 *   ├── {userId}/
 *   │   ├── profile/           - Profile images
 *   │   └── avatar/            - Avatar images
 * 
 * documents/
 *   ├── passports/
 *   │   └── {customerId}/      - Customer passport scans
 *   ├── visas/
 *   │   └── {customerId}/      - Customer visa documents
 *   ├── visa-applications/
 *   │   └── {applicationId}/   - Visa application documents
 *   └── bookings/
 *       └── {bookingId}/       - Booking-related documents
 * 
 * homepage/
 *   ├── logo/                  - Site logo
 *   ├── hero/                  - Hero section images
 *   ├── features/
 *   │   └── {featureId}/       - Feature icons/images
 *   ├── testimonials/
 *   │   └── {testimonialId}/   - Testimonial photos
 *   └── promo-banners/
 *       └── {bannerId}/        - Promotional banner images
 */

export default {
  TourUploads,
  CountryUploads,
  UserUploads,
  DocumentUploads,
  HomepageUploads,
};
