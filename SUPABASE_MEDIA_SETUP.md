# Supabase Storage & Featured Videos Setup Guide

## Quick Setup Instructions

### Step 1: Run SQL Setup in Supabase

1. Go to your Supabase Dashboard → **SQL Editor**
2. Create a new query
3. Copy and paste the entire content of `supabase-storage-setup.sql`
4. Click "Run" to execute the script

This will create:
- ✅ 3 storage buckets (tour-media, homepage-media, user-profiles)
- ✅ Public access policies for all buckets
- ✅ `featured_videos` table for video carousel
- ✅ Proper RLS (Row Level Security) policies

### Step 2: Verify Storage Buckets

Go to Supabase Dashboard → **Storage**

You should see 3 buckets created:
1. **tour-media** (public) - For tour images, gallery photos, PDFs
2. **homepage-media** (public) - For videos, logos, hero images  
3. **user-profiles** (public) - For profile images

### Step 3: Configure Environment Variables

Make sure your `.env` file has the Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 4: Test Upload Functionality

#### Admin Panel - Homepage Management:
1. Login to admin panel
2. Go to **Homepage** section
3. You'll see "Featured Videos" tab
4. Click "Add Video" to upload:
   - Video file (MP4, WebM, up to 100MB)
   - Thumbnail image (optional)
   - Title and description

#### Admin Panel - Tour Management:
1. Go to **Tours** → Edit any tour
2. Image fields now have upload buttons instead of text inputs:
   - **Tour Cover Image** → Upload button
   - **Gallery Images** → Multiple upload with previews
   - **Booking PDF** → PDF upload button

### Step 5: Frontend Display

The featured videos carousel will automatically appear on the homepage between the hero section and trust signals.

##Features Implemented

### 🎥 Featured Videos Carousel
- Swiper-based video carousel
- Autoplay with pause on hover
- Video thumbnails with play/pause controls
- Responsive design (1 on mobile, 2 on desktop)
- Gradient overlay with title & description

### 📁 File Upload Component
- Drag & drop support
- Upload progress indicator
- File type & size validation
- Image/Video/PDF previews
- Delete functionality with confirmation

### 🗄️ Supabase Storage Integration
- **Tour Media**: Images (10MB), PDFs (50MB)
- **Homepage Media**: Videos (100MB), Images (10MB)
- **User Profiles**: Profile images (5MB)
- Automatic file path generation with timestamps
- Public URL generation after upload
- File deletion support

### 🔐 Security
- RLS policies ensure authenticated uploads only
- Public read access for all media
- File size and type validation
- Secure deletion with path extraction

## File Structure

```
src/
├── lib/
│   ├── supabase-storage.ts          # Upload/delete utilities
│   └── supabase-featured-videos.ts  # Featured videos CRUD
├── components/
│   ├── FileUpload.tsx               # Reusable upload component
│   └── FeaturedVideos.tsx           # Homepage video carousel
└── pages/
    └── Home.tsx                     # Homepage with videos

apps/admin/src/
└── pages/
    └── Homepage.tsx                 # Admin panel for video management
```

## API Functions

### Storage Operations
```typescript
// Upload files
uploadTourImage(file, onProgress)
uploadTourPDF(file, onProgress)
uploadHomepageVideo(file, onProgress)
uploadHomepageImage(file, folder, onProgress)
uploadProfileImage(file, userId, onProgress)

// Delete files
deleteFile(bucket, filePath)
deleteFileByUrl(url, bucket)

// Validation
validateFile(file, { maxSizeMB, allowedTypes })
```

### Featured Videos Operations
```typescript
// CRUD operations
fetchFeaturedVideos()           // Get active videos for homepage
fetchAllFeaturedVideos()        // Get all videos (admin)
createFeaturedVideo(video)      // Create new video
updateFeaturedVideo(id, updates) // Update video
deleteFeaturedVideo(id)         // Delete video
reorderFeaturedVideos(videos)   // Change display order
```

## Troubleshooting

### Uploads Failing?
1. Check Supabase connection in browser console
2. Verify storage buckets exist in Supabase Dashboard
3. Confirm RLS policies are created (check SQL execution logs)
4. Make sure you're logged in as admin user

### Videos Not Showing?
1. Check browser console for errors
2. Verify videos are marked as `is_active = true` in database
3. Confirm video URLs are accessible (public buckets)
4. Check network tab for failed requests

### Storage Quota Issues?
1. Check your Supabase plan limits
2. Free tier: 1GB storage
3. Consider upgrading for production use

## Next Steps

1. ✅ Run SQL setup in Supabase
2. ✅ Test upload in admin panel
3. ✅ Upload a test video
4. ✅ Verify it appears on homepage
5. ✅ Convert remaining admin forms to use FileUpload component

## Support

If you encounter issues:
1. Check Supabase Dashboard logs
2. Review browser console for errors
3. Verify environment variables are correct
4. Ensure you're using latest Supabase client library
