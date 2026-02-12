# Upload Helpers Utility

## Overview
Centralized upload functions for all file uploads in the admin panel. This utility provides type-safe, organized upload methods for different resource types.

## Quick Start

### Basic Usage

```typescript
import { TourUploads, CountryUploads, DocumentUploads } from '@/utils/uploadHelpers';

// Upload a tour image
const url = await TourUploads.uploadMainImage(file, tourId);

// Upload multiple gallery images
const urls = await TourUploads.uploadGalleryImages(files, tourId);

// Upload country hero image
const heroUrl = await CountryUploads.uploadHeroImage(file, countryId);

// Upload passport document
const passportUrl = await DocumentUploads.uploadPassport(file, bookingId, customerId);
```

## Available Modules

### TourUploads
```typescript
TourUploads.uploadMainImage(file, tourId)           // Main tour image
TourUploads.uploadGalleryImage(file, tourId)        // Single gallery image
TourUploads.uploadGalleryImages(files, tourId)      // Multiple gallery images
TourUploads.uploadItineraryImage(file, tourId, dayNumber)  // Day itinerary image
TourUploads.uploadVideo(file, tourId)               // Tour video
TourUploads.uploadRelatedImages(files, tourId)      // Related tour images
```

### CountryUploads
```typescript
CountryUploads.uploadHeroImage(file, countryId)           // Single hero image
CountryUploads.uploadHeroImages(files, countryId)         // Multiple hero images
CountryUploads.uploadAttractionImage(file, countryId, attractionId?)  // Attraction image
CountryUploads.uploadFlag(file, countryId)                // Country flag
```

### UserUploads
```typescript
UserUploads.uploadProfileImage(file, userId)        // User profile photo
UserUploads.uploadAvatar(file, userId)              // User avatar
```

### DocumentUploads
```typescript
DocumentUploads.uploadPassport(file, bookingId, customerId)        // Passport scan
DocumentUploads.uploadVisa(file, bookingId, customerId)            // Visa document
DocumentUploads.uploadVisaApplication(file, applicationId, docType) // Visa app doc
DocumentUploads.uploadBookingDocument(file, bookingId, docType)    // Booking doc
```

### HomepageUploads
```typescript
HomepageUploads.uploadLogo(file)                              // Site logo
HomepageUploads.uploadHeroImage(file)                         // Hero section
HomepageUploads.uploadFeatureImage(file, featureId)           // Feature image
HomepageUploads.uploadTestimonialImage(file, testimonialId)   // Testimonial photo
HomepageUploads.uploadPromoBanner(file, bannerId)             // Promo banner
```

## Implementation Examples

### Tour Form
```typescript
// Upload main tour image
const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  try {
    setUploading(true);
    const tourId = id || formData.slug || `new-tour-${Date.now()}`;
    const url = await TourUploads.uploadMainImage(file, tourId);
    setFormData({ ...formData, mainImage: url });
  } catch (error) {
    console.error('Upload failed:', error);
    alert('Upload failed');
  } finally {
    setUploading(false);
  }
};

// Upload multiple gallery images
const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;
  
  try {
    setUploading(true);
    const tourId = id || formData.slug || `new-tour-${Date.now()}`;
    const urls = await TourUploads.uploadGalleryImages(files, tourId);
    setFormData({ ...formData, galleryImages: [...formData.galleryImages, ...urls] });
  } catch (error) {
    console.error('Upload failed:', error);
    alert('Upload failed');
  } finally {
    setUploading(false);
  }
};
```

### Country Management
```typescript
// Upload country hero image
const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  try {
    setUploading(true);
    const countryId = editingCountry?._id || `new-${Date.now()}`;
    const url = await CountryUploads.uploadHeroImage(file, countryId);
    setFormData({ ...formData, heroImageUrl: url });
  } catch (error) {
    console.error('Upload failed:', error);
    alert('Upload failed');
  } finally {
    setUploading(false);
  }
};
```

### Booking Form (User-facing)
```typescript
// Upload passport
const handlePassportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  try {
    setUploading(true);
    // Note: Need to create booking first to get bookingId
    const bookingId = tempBookingId || `temp-${Date.now()}`;
    const customerId = user?.id || `guest-${Date.now()}`;
    const url = await DocumentUploads.uploadPassport(file, bookingId, customerId);
    setPassportUrl(url);
  } catch (error) {
    console.error('Upload failed:', error);
    alert('Passport upload failed');
  } finally {
    setUploading(false);
  }
};
```

## Error Handling

All upload functions throw errors on failure. Always wrap in try-catch:

```typescript
try {
  const url = await TourUploads.uploadMainImage(file, tourId);
  // Success
} catch (error) {
  if (error instanceof Error) {
    console.error('Upload error:', error.message);
    // Show user-friendly error
    alert('Failed to upload: ' + error.message);
  }
}
```

## Response Format

### Single Upload Response
```typescript
{
  success: true,
  url: "https://pub-xxx.r2.dev/tours/tour-123/main/main-1707753600000-a1b2c3d4.jpg",
  fileName: "main-1707753600000-a1b2c3d4.jpg",
  size: 1024567,
  type: "image/jpeg"
}
```

### Multiple Upload Response
```typescript
{
  success: true,
  files: [
    {
      url: "https://pub-xxx.r2.dev/tours/tour-123/gallery/gallery-1-1707753600000-a1b2c3d4.jpg",
      fileName: "gallery-1-1707753600000-a1b2c3d4.jpg",
      size: 1024567,
      type: "image/jpeg"
    },
    // ... more files
  ]
}
```

## Prerequisites

### Environment Variables
Required in `apps/api/.env`:
```bash
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

### Authentication
All uploads require a valid JWT token stored in localStorage:
```typescript
localStorage.getItem('token')  // Must be set
```

Without a token, uploads will fail with 401 Unauthorized.

## File Restrictions

### Size Limits
- Images: 10 MB
- Videos: 50 MB (configurable)
- Documents: 10 MB

### Allowed Types
- **Images**: JPEG, PNG, GIF, WebP
- **Videos**: MP4, WebM, QuickTime
- **Documents**: PDF, DOC, DOCX

## Folder Structure

See `docs/R2_FOLDER_STRUCTURE.md` for complete folder organization details.

Quick reference:
- `tours/{tourId}/main/` - Main tour images
- `tours/{tourId}/gallery/` - Gallery images
- `tours/{tourId}/itinerary/day-{N}/` - Day itinerary images
- `countries/{countryId}/hero/` - Country hero images
- `documents/passports/{customerId}/` - Passport scans
- `homepage/logo/` - Site logo

## Testing

### Test Upload Function
```typescript
// In your component
const testUpload = async () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    try {
      const url = await TourUploads.uploadMainImage(file, 'test-tour-123');
      console.log('Upload success:', url);
      alert('Success! URL: ' + url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed: ' + error.message);
    }
  };
  
  input.click();
};
```

## Migration from Old System

### Before (Local Storage)
```typescript
const formData = new FormData();
formData.append('image', file);
const res = await fetch('/api/uploads', { method: 'POST', body: formData });
```

### After (R2 with Helper)
```typescript
import { TourUploads } from '@/utils/uploadHelpers';
const url = await TourUploads.uploadMainImage(file, tourId);
```

## Troubleshooting

### Upload Fails with 401
- Check if token exists: `localStorage.getItem('token')`
- Verify token hasn't expired
- Re-login if needed

### Upload Fails with 403
- Check user role (must be admin or super-admin)
- Verify requireRole middleware is working

### Upload Fails with 413
- File exceeds size limit (10 MB for images)
- Compress file before upload

### Upload Succeeds But URL Doesn't Work
- Check R2_PUBLIC_URL environment variable
- Verify bucket has public read access
- Check CORS settings in R2 bucket

## Performance Tips

1. **Compress before upload**: Use client-side compression libraries
2. **Show progress**: Implement upload progress indicators
3. **Parallel uploads**: Use Promise.all for multiple files
4. **Retry logic**: Implement automatic retry on failure
5. **Cancel uploads**: Provide cancel button for large files

## Security Notes

- All uploads are authenticated
- File types are validated server-side
- Files are scanned for malware (future)
- Unique filenames prevent overwrites
- User actions are audit-logged

---

**Last Updated:** February 12, 2026  
**Version:** 1.0
