# Multiple Hero Images Feature

## Overview
Enhanced the country management system to support multiple hero images per country instead of a single image. Users can now upload, manage, and display multiple hero images with carousel functionality.

## Changes Made

### 1. TypeScript Interface Updates
**File:** `src/api/countries.ts`
- Added `heroImages?: string[]` field to Country interface
- Kept `heroImageUrl?: string` for backward compatibility (serves as primary image)

### 2. MongoDB Schema Updates
**File:** `apps/api/src/models/Country.ts`
- Added `heroImages: [{ type: String }]` field to support array of image URLs
- Maintained `heroImageUrl` field for backward compatibility

### 3. Admin Panel Enhancements
**File:** `apps/admin/src/pages/CountryManagement.tsx`

#### New Features:
- **Multiple Image Upload**: Click "Add Hero Image" button multiple times to upload multiple images
- **Image Gallery View**: Displays all uploaded images in a grid with thumbnails
- **Primary Image Selection**: Click "Set Primary" button on any image to make it the primary hero image
- **Image Deletion**: Delete individual images with the X button on hover
- **Visual Indicators**: Primary image is marked with a green "Primary" badge
- **Image Counter**: Shows count of uploaded images (e.g., "3 image(s) uploaded")

#### New Functions:
```typescript
handleHeroImageUpload() // Adds new image to heroImages array
removeHeroImage(index) // Removes image at specific index
setPrimaryHeroImage(index) // Sets image as primary (heroImageUrl)
```

### 4. Client-Side Display
**File:** `src/pages/DestinationCountry.tsx`

#### New Features:
- **Image Carousel**: Automatic carousel for multiple hero images
- **Navigation Controls**: Left/Right arrow buttons to navigate images
- **Dot Indicators**: Shows current image position with clickable dots
- **Smooth Transitions**: 700ms fade transition between images
- **Fallback Support**: Falls back to single heroImageUrl or Unsplash if no heroImages array

#### New State:
```typescript
const [currentImageIndex, setCurrentImageIndex] = useState(0);
```

### 5. Supabase Migration
**File:** `supabase-hero-images-migration.sql`
- SQL script to add `hero_images TEXT[]` column to Supabase countries table
- Includes optional migration to move existing single images to array format
- Maintains backward compatibility with existing hero_image_url column

## Usage

### Admin Panel - Uploading Multiple Images:
1. Navigate to Country Management
2. Create or edit a country
3. Click "Add Hero Image" button
4. Select and upload an image (repeats to Supabase storage)
5. Repeat steps 3-4 to add more images
6. Click "Set Primary" on any image to make it the main hero image
7. Click X button on any image to remove it
8. Save the country

### Client Display:
- First image (or primary image) displays initially
- If multiple images exist, carousel navigation appears
- Users can click left/right arrows or dots to navigate
- Images auto-transition with smooth fade effect

## Backward Compatibility

The system maintains backward compatibility:
- **heroImageUrl** (singular) still works for countries with single images
- **heroImages** (array) is optional
- Display logic prioritizes heroImages array, falls back to heroImageUrl
- Both MongoDB and Supabase schemas support both fields

## Technical Details

### Data Flow:
1. Admin uploads image → Supabase Storage (country-images bucket, hero-images folder)
2. Upload returns URL → Added to heroImages array in formData
3. First image in array automatically set as heroImageUrl (primary)
4. Save sends both heroImages array and heroImageUrl to MongoDB
5. Client fetches country data → Displays carousel if heroImages exists

### Image Storage:
- **Bucket**: `country-images`
- **Folder**: `hero-images/`
- **Function**: `uploadFile(file, 'country-images', { folder: 'hero-images' })`

### Primary Image Logic:
- First image in heroImages array is automatically set as heroImageUrl
- User can manually change primary by clicking "Set Primary" button
- Primary image used for backwards compatibility and as default display

## Files Modified
1. `src/api/countries.ts` - Interface definition
2. `apps/api/src/models/Country.ts` - MongoDB schema
3. `apps/admin/src/pages/CountryManagement.tsx` - Admin UI and upload logic
4. `src/pages/DestinationCountry.tsx` - Client display with carousel
5. `supabase-hero-images-migration.sql` - Database migration script (new file)

## Testing Checklist
- [ ] Upload single hero image for a country
- [ ] Upload multiple (3+) hero images for a country
- [ ] Set different images as primary
- [ ] Delete individual images
- [ ] View country page with single image
- [ ] View country page with multiple images (test carousel)
- [ ] Test left/right arrow navigation
- [ ] Test dot indicator navigation
- [ ] Verify image transitions are smooth
- [ ] Test backward compatibility with existing countries

## Next Steps (Optional Enhancements)
- [ ] Add drag-and-drop reordering for hero images
- [ ] Add captions/descriptions for each hero image
- [ ] Implement image compression before upload
- [ ] Add bulk image upload (select multiple files at once)
- [ ] Add auto-carousel with timer on client display
- [ ] Add image alt text field for accessibility
