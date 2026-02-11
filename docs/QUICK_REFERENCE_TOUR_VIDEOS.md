# Quick Reference: Tour Video Upload & Display

## 🎬 For Admins - How to Add a Video to a Tour

### Step 1: Access Tour Form
1. Login to Admin Panel
2. Navigate to **Tours** section
3. Click **Edit** on existing tour OR **Create New Tour**

### Step 2: Upload Video
1. Scroll down to **"Tour Video"** section
2. Click the file input or drag-and-drop a video file
3. **Requirements:**
   - Format: MP4, WebM, or MOV
   - Size: Maximum 100MB
   - Quality: Recommended 1080p or lower

### Step 3: Verify Upload
1. Wait for upload progress to complete
2. Video preview will appear with controls
3. Test playback by clicking play button
4. If wrong video, click **"Remove Video"** and upload again

### Step 4: Save Tour
1. Fill in other required tour details
2. Click **"Save Tour"** button
3. Video URL automatically saved to database

### Step 5: View on Client Page
1. Navigate to the tour detail page on client site
2. Video section appears after the hero carousel
3. Verify video plays correctly

---

## 👁️ For Clients - Where to Find Tour Videos

### On Tour Detail Page:
1. Browse tours on the website
2. Click on any tour to view details
3. **Video location:** Below the main tour carousel
4. **Video section features:**
   - Large video player with controls
   - Play/pause, volume, fullscreen controls
   - Thumbnail preview (first tour image)
   - Three feature highlights below video

### Video Section Layout:
```
┌─────────────────────────────────────┐
│  🎬 Experience This Tour            │
│  Watch our exclusive video preview  │
├─────────────────────────────────────┤
│                                     │
│         VIDEO PLAYER                │
│         [▶️ PLAY]                    │
│                                     │
├─────────────────────────────────────┤
│ [👁️ Visual]  [✅ Real]  [⏰ Plan]   │
│  Preview     Experience   Ahead     │
└─────────────────────────────────────┘
```

---

## 🔧 For Developers - Quick Integration

### 1. Run SQL Setup (One-time)
```sql
-- In Supabase Dashboard → SQL Editor
-- Run: supabase-tour-videos-setup.sql
```

### 2. Environment Variables
```env
# apps/admin/.env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Access Video URL in Code
```typescript
// In tour object
tour.video_url // string | null | undefined

// Type-safe access
const videoUrl = (tour as unknown as { video_url?: string }).video_url;

// Check if video exists
if (tour && videoUrl) {
  // Display video
}
```

### 4. Display Video Component
```tsx
{tour?.video_url && (
  <video 
    src={tour.video_url}
    controls
    poster={tour.images?.[0]}
    className="w-full max-h-[600px]"
  />
)}
```

---

## 📱 User Experience Flow

### Admin Flow:
```
Login → Tours → Edit/Create → Upload Video → Save → Done
```

### Client Flow:
```
Homepage → Browse Tours → Select Tour → View Details → Watch Video
```

---

## ⚡ Quick Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| Upload fails | Check file size < 100MB |
| Video won't play | Try different browser |
| No video section | Check video_url in database |
| Slow upload | Compress video file |
| Wrong video uploaded | Click "Remove" and re-upload |

---

## 📊 Best Practices

### Video Quality:
- **Resolution:** 1080p (1920x1080)
- **Frame rate:** 24-30 fps
- **Codec:** H.264
- **File size:** 20-50MB optimal

### Content Guidelines:
- **Length:** 1-3 minutes
- **Focus:** Show tour highlights
- **Quality:** Professional or high-quality smartphone footage
- **Audio:** Clear narration or background music
- **Editing:** Smooth transitions, no shaky footage

### SEO & Accessibility:
- Use first tour image as poster
- Add descriptive title to tour
- Include captions (future enhancement)
- Optimize file size for fast loading

---

## 🎯 Key Features

### Video Upload:
✅ Drag-and-drop support
✅ File validation (size & type)
✅ Progress indicator
✅ Preview before saving
✅ Easy removal

### Video Display:
✅ Full-width responsive player
✅ Native browser controls
✅ Poster image (thumbnail)
✅ Feature highlights below
✅ Modern gradient design

### Modern UI:
✅ Gradient backgrounds
✅ Glass morphism effects
✅ Smooth animations
✅ Enhanced typography
✅ Better spacing & layout

---

## 📞 Need Help?

1. Check `TOUR_VIDEO_FEATURE_GUIDE.md` for detailed documentation
2. Review Supabase Dashboard → Storage → homepage-media
3. Test with smaller video file first
4. Check browser console for errors
5. Verify environment variables are set correctly

---

**Updated:** November 18, 2025
