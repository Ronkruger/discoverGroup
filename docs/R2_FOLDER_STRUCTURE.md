# Cloudflare R2 Storage - Folder Structure

## Overview
This document outlines the complete folder structure for file uploads in the DiscoverGroup application using Cloudflare R2 object storage.

## Folder Organization

### 📁 `/tours/`
Tour-related images and videos

```
tours/
├── {tourId}/
│   ├── main/                    # Main tour cover image
│   │   └── main-{timestamp}-{random}.jpg
│   ├── gallery/                 # Tour gallery images
│   │   ├── gallery-1-{timestamp}-{random}.jpg
│   │   ├── gallery-2-{timestamp}-{random}.jpg
│   │   └── ...
│   ├── itinerary/              # Day-by-day itinerary images
│   │   ├── day-1/
│   │   │   └── day-1-{timestamp}-{random}.jpg
│   │   ├── day-2/
│   │   │   └── day-2-{timestamp}-{random}.jpg
│   │   └── ...
│   ├── videos/                 # Tour promotional videos
│   │   └── video-{timestamp}-{random}.mp4
│   └── related/                # Related tour images
│       └── related-{timestamp}-{random}.jpg
```

**Usage:**
- **Main Image**: Primary photo shown on tour cards and details page
- **Gallery**: Multiple photos showcasing tour highlights
- **Itinerary Images**: Photos for specific days in the itinerary
- **Videos**: MP4/WebM promotional videos
- **Related**: Images for similar/related tours

---

### 📁 `/countries/`
Country-specific images

```
countries/
├── {countryId}/
│   ├── hero/                   # Country hero/banner images
│   │   ├── hero-1-{timestamp}-{random}.jpg
│   │   ├── hero-2-{timestamp}-{random}.jpg
│   │   └── ...
│   ├── flag/                   # Country flag image
│   │   └── flag-{timestamp}-{random}.png
│   └── attractions/            # Tourist attractions
│       ├── {attractionId}/
│       │   └── attraction-{timestamp}-{random}.jpg
│       └── ...
```

**Usage:**
- **Hero**: Main banner images for country pages (supports multiple)
- **Flag**: Official country flag icon
- **Attractions**: Photos of individual tourist attractions

---

### 📁 `/users/`
User profile images

```
users/
├── {userId}/
│   ├── profile/                # Full profile images
│   │   └── profile-{timestamp}-{random}.jpg
│   └── avatar/                 # Avatar/thumbnail images
│       └── avatar-{timestamp}-{random}.jpg
```

**Usage:**
- **Profile**: Full-size user profile photo
- **Avatar**: Smaller avatar for listings/comments

---

### 📁 `/documents/`
Booking and visa-related documents

```
documents/
├── passports/
│   └── {customerId}/           # Customer passport scans
│       └── {bookingId}-{timestamp}-{random}.pdf
├── visas/
│   └── {customerId}/           # Customer visa documents
│       └── {bookingId}-{timestamp}-{random}.pdf
├── visa-applications/
│   └── {applicationId}/        # Visa application documents
│       ├── passport-{timestamp}-{random}.pdf
│       ├── bank-statement-{timestamp}-{random}.pdf
│       ├── employment-letter-{timestamp}-{random}.pdf
│       └── ...
└── bookings/
    └── {bookingId}/            # Booking-related documents
        ├── invoice-{timestamp}-{random}.pdf
        ├── itinerary-{timestamp}-{random}.pdf
        └── ...
```

**Usage:**
- **Passports**: Scanned passport documents from bookings
- **Visas**: Current visa documents uploaded by customers
- **Visa Applications**: All documents for visa assistance applications
- **Bookings**: Generated invoices, itineraries, confirmations

---

### 📁 `/homepage/`
Homepage and general site assets

```
homepage/
├── logo/                       # Site logo
│   └── logo-{timestamp}-{random}.png
├── hero/                       # Hero section images
│   └── hero-{timestamp}-{random}.jpg
├── features/
│   └── {featureId}/           # Feature icons/images
│       └── feature-{timestamp}-{random}.svg
├── testimonials/
│   └── {testimonialId}/       # Testimonial photos
│       └── testimonial-{timestamp}-{random}.jpg
└── promo-banners/
    └── {bannerId}/            # Promotional banner images
        └── banner-{timestamp}-{random}.jpg
```

**Usage:**
- **Logo**: Main site logo (header, favicon source)
- **Hero**: Hero section background images
- **Features**: Icons or images for feature highlights
- **Testimonials**: Customer photos in testimonials
- **Promo Banners**: Marketing/promotional banner images

---

## File Naming Convention

All uploaded files follow this pattern:
```
{label}-{timestamp}-{random}.{ext}
```

Where:
- `{label}`: Descriptive label (e.g., "main", "gallery-1", "day-3")
- `{timestamp}`: Unix timestamp in milliseconds
- `{random}`: 16-character random hex string
- `{ext}`: Original file extension

**Example:**
```
main-1707753600000-a1b2c3d4e5f6g7h8.jpg
```

---

## Access Patterns

### Public Access
These folders should be publicly readable via R2 public URL:
- ✅ `/tours/` - Public tour images
- ✅ `/countries/` - Public country images
- ✅ `/homepage/` - Public site assets
- ✅ `/users/{userId}/avatar/` - Public avatars

### Private Access
These folders require authentication:
- 🔒 `/users/{userId}/profile/` - Private profile images
- 🔒 `/documents/` - All documents (sensitive)

---

## Storage Quotas & Limits

### File Size Limits
- **Images**: 10 MB per file
- **Videos**: 50 MB per file (configurable)
- **Documents**: 10 MB per file

### File Type Restrictions
- **Images**: JPEG, PNG, GIF, WebP
- **Videos**: MP4, WebM, QuickTime
- **Documents**: PDF, DOC, DOCX (for visa applications)

---

## Implementation Reference

### Helper Functions Location
**File:** `apps/admin/src/utils/uploadHelpers.ts`

### Available Upload Functions

#### Tours
```typescript
import { TourUploads } from '@/utils/uploadHelpers';

// Main image
await TourUploads.uploadMainImage(file, tourId);

// Gallery
await TourUploads.uploadGalleryImages(files, tourId);

// Itinerary
await TourUploads.uploadItineraryImage(file, tourId, dayNumber);

// Video
await TourUploads.uploadVideo(file, tourId);
```

#### Countries
```typescript
import { CountryUploads } from '@/utils/uploadHelpers';

// Hero image
await CountryUploads.uploadHeroImage(file, countryId);

// Attraction
await CountryUploads.uploadAttractionImage(file, countryId, attractionId);
```

#### Documents
```typescript
import { DocumentUploads } from '@/utils/uploadHelpers';

// Passport
await DocumentUploads.uploadPassport(file, bookingId, customerId);

// Visa application
await DocumentUploads.uploadVisaApplication(file, applicationId, 'passport');
```

#### Homepage
```typescript
import { HomepageUploads } from '@/utils/uploadHelpers';

// Logo
await HomepageUploads.uploadLogo(file);

// Promo banner
await HomepageUploads.uploadPromoBanner(file, bannerId);
```

---

## Migration Notes

### From Supabase
When migrating existing Supabase URLs:

1. **Download** existing files from Supabase
2. **Re-upload** using appropriate folder structure
3. **Update** database records with new R2 URLs
4. **Verify** all images load correctly
5. **Delete** old Supabase files

### Example Migration Script
```javascript
// Migrate tour images
const tours = await Tour.find({ mainImage: /supabase/ });

for (const tour of tours) {
  const file = await downloadFromSupabase(tour.mainImage);
  const newUrl = await TourUploads.uploadMainImage(file, tour._id);
  tour.mainImage = newUrl;
  await tour.save();
}
```

---

## Cleanup & Maintenance

### Orphaned Files
Files may become orphaned when:
- Records are deleted but files aren't
- Upload succeeds but database save fails
- User cancels upload mid-process

**Recommendation:** Implement periodic cleanup job to remove files not referenced in database.

### Backup Strategy
- Daily automated backups of R2 bucket
- Keep backups for 30 days
- Store backup metadata in MongoDB

---

## Security Considerations

### Access Control
- All uploads require authentication (JWT token)
- Only admin/super-admin roles can upload
- File type validation on server-side
- Size limits enforced

### File Validation
1. Check file extension
2. Verify MIME type
3. Scan for malware (future enhancement)
4. Generate unique filenames (prevent overwrites)

### Privacy
- Document uploads logged in audit trail
- Customer documents require customer_id verification
- PII documents encrypted at rest (R2 default)

---

## Cost Optimization

### Best Practices
1. **Compress images** before upload (client-side)
2. **Use WebP** format for better compression
3. **Delete old files** when replacing images
4. **Implement CDN caching** for frequently accessed files
5. **Monitor storage usage** via Cloudflare dashboard

### Expected Costs
Based on Cloudflare R2 pricing (as of 2025):
- Storage: $0.015/GB/month
- Class A operations (writes): $4.50/million
- Class B operations (reads): $0.36/million
- Egress: **FREE** 🎉

**Estimated monthly cost for medium traffic:**
- 50 GB storage: $0.75
- 50K uploads: $0.225
- 500K reads: $0.18
- **Total: ~$1.15/month**

---

## Monitoring & Analytics

### Metrics to Track
- Upload success rate
- Average upload time
- Storage usage by folder
- Most accessed files
- Failed upload reasons

### Logging
All uploads logged with:
- User ID
- File path
- File size
- Timestamp
- IP address (audit)

---

## Future Enhancements

### Planned Features
- [ ] Image optimization pipeline
- [ ] Automatic thumbnail generation
- [ ] Video transcoding
- [ ] CDN integration
- [ ] Duplicate file detection
- [ ] Bulk upload UI
- [ ] Direct upload from mobile app
- [ ] Drag-and-drop file manager

---

**Last Updated:** February 12, 2026  
**Maintained By:** Development Team  
**Version:** 1.0
