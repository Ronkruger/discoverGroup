# Featured Videos & Logo Upload Setup Guide

## ✅ What Was Completed

### 1. **FileUpload Component** (Admin App)
- **Location**: `apps/admin/src/components/FileUpload.tsx`
- **Features**:
  - Drag-and-drop file upload
  - Real-time progress bar
  - File type validation (image/video/PDF)
  - Size limits (configurable per use case)
  - Preview for images and videos
  - Delete button with confirmation

### 2. **Supabase Integration** (Admin App)
- **Location**: `apps/admin/src/lib/supabase.ts`
- **Functions**:
  - `uploadLogo()` - Upload logo to `homepage-media/logos`
  - `uploadFeaturedVideo()` - Upload video to `homepage-media/videos` (max 100MB)
  - `uploadVideoThumbnail()` - Upload thumbnail to `homepage-media/thumbnails`
  - `deleteFile()` - Delete files from Supabase storage
  - `extractFilePathFromUrl()` - Extract storage path from URL

### 3. **Featured Videos Service** (Admin App)
- **Location**: `apps/admin/src/lib/featured-videos.ts`
- **Functions**:
  - `fetchAllFeaturedVideos()` - Get all videos (including inactive)
  - `fetchActiveFeaturedVideos()` - Get only active videos
  - `createFeaturedVideo()` - Add new video
  - `updateFeaturedVideo()` - Edit existing video
  - `deleteFeaturedVideo()` - Remove video
  - `reorderFeaturedVideos()` - Change display order

### 4. **Homepage Management Updates**
- **Location**: `apps/admin/src/pages/HomepageManagement.tsx`
- **Changes**:
  - ✅ **Logo Upload**: Replaced text input with FileUpload component
  - ✅ **Featured Videos Tab**: New section with:
    - Video upload (MP4/WebM, max 100MB)
    - Thumbnail upload (images, max 5MB)
    - Title and description fields
    - Active/Inactive toggle
    - Delete functionality
    - Visual list of all videos with thumbnails

### 5. **SQL Database Setup**
- **Location**: `COMPLETE_SUPABASE_SETUP.sql`
- **Tables Created**:
  - `featured_videos` - Stores video metadata
  - `tour_images` - For tour images (cover, gallery, thumbnails)
  - `tour_pdfs` - For tour booking forms and documents
  - `homepage_settings` - For dynamic homepage configuration
  - `map_markers` - For interactive map locations
- **Storage Buckets**:
  - `homepage-media` (100MB limit for videos)
  - `tour-media` (50MB limit)
  - `user-profiles` (5MB limit)

---

## 🚀 How to Use

### Step 1: Configure Environment Variables

Add these to `apps/admin/.env`:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Get these from: Supabase Dashboard → Project Settings → API

### Step 2: Upload Logo

1. Go to Admin Panel → **Homepage Management**
2. Click **Logo & Branding** tab
3. Click the upload area or drag-and-drop your logo file
4. Set the logo height (default: 64px)
5. Click **Save Changes**

### Step 3: Add Featured Videos

1. Go to **Homepage Management** → **Featured Videos** tab
2. Click **Add Video** button
3. Upload video file (max 100MB, MP4/WebM/MOV)
4. Upload thumbnail image (optional, recommended)
5. Enter video title (required)
6. Enter description (optional)
7. Toggle "Active" to show on homepage
8. Click **Save Video**

### Step 4: Manage Existing Videos

- **Toggle Active/Inactive**: Click the eye icon
- **Delete Video**: Click the trash icon (will delete files from storage)
- **View Order**: Videos display in order shown in list

---

## 📁 File Structure

```
apps/admin/src/
├── components/
│   └── FileUpload.tsx           # Reusable upload component
├── lib/
│   ├── supabase.ts              # Supabase client & upload utilities
│   └── featured-videos.ts       # Video CRUD operations
└── pages/
    └── HomepageManagement.tsx   # Homepage settings & video management

COMPLETE_SUPABASE_SETUP.sql      # Full database setup (run once)
```

---

## 🔧 Technical Details

### Upload Flow

1. **User selects file** → FileUpload component validates size/type
2. **Upload starts** → Progress bar shows 0-100%
3. **File uploaded to Supabase Storage** → Returns public URL
4. **URL saved to database** → Video appears in admin list
5. **Client fetches active videos** → Shows in homepage carousel

### Database Schema

```sql
featured_videos (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Storage Buckets

- **homepage-media**: Videos, thumbnails, logos
  - `homepage-media/videos/` - Video files
  - `homepage-media/thumbnails/` - Video thumbnails
  - `homepage-media/logos/` - Site logos

---

## 🎯 Next Steps

1. **Add Environment Variables** to admin `.env` file
2. **Restart Admin Dev Server**: `cd apps/admin && npm run dev`
3. **Test Logo Upload**: Upload a logo and verify it appears in navbar
4. **Test Video Upload**: Add a featured video
5. **Verify Client Display**: Check if video appears in homepage carousel

---

## 🐛 Troubleshooting

### "Supabase client not initialized"
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are in `.env`
- Restart the dev server after adding env variables

### "Upload failed"
- Check file size limits (videos: 100MB, images: 5-10MB)
- Verify file types (videos: MP4/WebM/MOV, images: JPG/PNG/GIF)
- Check Supabase storage bucket permissions in SQL setup

### "Video not showing on homepage"
- Make sure video is marked as "Active" (green badge)
- Check that `FeaturedVideos` component is in `src/pages/Home.tsx`
- Verify client app has Supabase env variables

### Logo upload works but not showing
- Check logo height setting (default: 64px)
- Verify logo URL is saved in settings
- Clear browser cache and refresh

---

## 📝 Additional Features

### Future Enhancements
- Drag-and-drop reordering of videos
- Bulk upload multiple videos
- Video preview modal in admin
- Analytics: video view counts
- Scheduled publishing (activate on specific date)

---

## ✨ Summary

You can now:
- ✅ Upload logo via drag-and-drop (no more text input!)
- ✅ Add featured videos with thumbnails
- ✅ Manage video active/inactive status
- ✅ Delete videos (removes from storage + database)
- ✅ All media stored in Supabase Storage
- ✅ Videos appear on client homepage carousel

**Location to Upload:**  
Admin Panel → Homepage Management → Featured Videos tab
