# Cloudflare R2 Setup Guide

## Overview
Your application is now configured to use Cloudflare R2 for object storage (images, videos, etc.). This guide will help you complete the setup.

## What's Been Configured

### ✅ Backend API (Complete)
- **Installed packages**: `@aws-sdk/client-s3`, `multer`
- **Created upload endpoint**: [apps/api/src/routes/upload.ts](apps/api/src/routes/upload.ts)
  - `POST /api/upload/single` - Upload single file
  - `POST /api/upload/multiple` - Upload multiple files (max 10)
  - `GET /api/upload/health` - Check configuration status
- **Mounted route**: Added to [apps/api/src/index.ts](apps/api/src/index.ts)
- **Security**: Requires authentication + admin/super-admin role

### ✅ Admin Panel (Complete)
- **CountryManagement**: [apps/admin/src/pages/CountryManagement.tsx](apps/admin/src/pages/CountryManagement.tsx) - Updated upload function
- **TourForm**: [apps/admin/src/pages/tours/TourForm.tsx](apps/admin/src/pages/tours/TourForm.tsx) - Updated upload function
- Both now call the R2 upload API endpoint

### ✅ Environment Templates (Complete)
- Updated [apps/api/.env.example](apps/api/.env.example)
- Updated [apps/api/.env.secure.example](apps/api/.env.secure.example)

## Your Next Steps

### 1. Create R2 Bucket (In Progress - You're doing this now!)

In Cloudflare R2 dashboard:
1. Click "Create bucket"
2. Choose a name (e.g., `discovergroup-images`)
3. Select location (automatic is fine)
4. Click "Create bucket"

### 2. Get R2 Credentials

#### Create API Token:
1. In R2 dashboard, go to "Manage R2 API Tokens"
2. Click "Create API Token"
3. Name: `discovergroup-api`
4. Permissions: **Object Read & Write**
5. Apply to specific buckets: Select your bucket
6. Click "Create API Token"
7. **SAVE THESE VALUES** (you'll only see them once):
   - Access Key ID
   - Secret Access Key
   - Endpoint URL (should be like: `https://<account-id>.r2.cloudflarestorage.com`)

### 3. Configure Public Access

To make uploaded images accessible publicly:

#### Option A: Custom Domain (Recommended for Production)
1. In your bucket settings, click "Settings" tab
2. Under "Public Access", click "Connect Domain"
3. Add your subdomain (e.g., `cdn.discovergroup.com` or `images.discovergroup.com`)
4. Follow DNS verification steps
5. Once verified, your `R2_PUBLIC_URL` will be: `https://cdn.discovergroup.com`

#### Option B: R2.dev Subdomain (Quick Start)
1. In your bucket settings, click "Settings" tab
2. Under "Public Access", enable "Allow Access"
3. You'll get a public URL like: `https://pub-xxxxxxxxxxxx.r2.dev`
4. Use this as your `R2_PUBLIC_URL`

### 4. Add Environment Variables

Create/update `apps/api/.env` with your R2 credentials:

```env
# Cloudflare R2 Object Storage
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key_from_step_2
R2_SECRET_ACCESS_KEY=your_secret_key_from_step_2
R2_BUCKET_NAME=discovergroup-images
R2_PUBLIC_URL=https://pub-xxxxxxxxxxxx.r2.dev
```

**Replace with your actual values from steps 2 and 3!**

### 5. Restart API Server

```powershell
cd apps/api
npm run dev
```

### 6. Test the Upload

#### Check Health Endpoint:
```powershell
curl http://localhost:4000/api/upload/health
```

Should return:
```json
{
  "status": "ready",
  "bucket": "discovergroup-images",
  "endpoint": "configured"
}
```

#### Test Upload (from Admin Panel):
1. Start admin panel: `cd apps/admin && npm run dev`
2. Log in as admin
3. Go to Countries or Tours
4. Try uploading an image
5. Should see image URL returned and image displayed

## Folder Structure

Uploaded files will be organized as:

```
your-bucket/
├── tours/
│   ├── tour-slug/
│   │   ├── main-{timestamp}-{random}.jpg
│   │   ├── gallery-1-{timestamp}-{random}.jpg
│   │   └── tour-video-{timestamp}-{random}.mp4
├── hero-images/
│   └── {timestamp}-{random}.jpg
├── attraction-images/
│   └── {timestamp}-{random}.jpg
└── uploads/
    └── {timestamp}-{random}.jpg
```

## API Documentation

### Upload Single File

**Endpoint**: `POST /api/upload/single`

**Headers**:
```
Authorization: Bearer {your-jwt-token}
Content-Type: multipart/form-data
```

**Body** (FormData):
- `file` (required): The file to upload
- `folder` (optional): Folder name (e.g., "tours", "hero-images")
- `label` (optional): Label for the file (e.g., "main", "gallery")

**Response**:
```json
{
  "success": true,
  "url": "https://pub-xxxxxxxxxxxx.r2.dev/tours/main-1234567890-abc123.jpg",
  "fileName": "tours/main-1234567890-abc123.jpg",
  "size": 245678,
  "type": "image/jpeg"
}
```

### Upload Multiple Files

**Endpoint**: `POST /api/upload/multiple`

**Headers**:
```
Authorization: Bearer {your-jwt-token}
Content-Type: multipart/form-data
```

**Body** (FormData):
- `files` (required): Array of files (max 10)
- `folder` (optional): Folder name
- `label` (optional): Label prefix for files

**Response**:
```json
{
  "success": true,
  "files": [
    {
      "url": "https://pub-xxxxxxxxxxxx.r2.dev/tours/image1.jpg",
      "fileName": "tours/image1.jpg",
      "size": 123456,
      "type": "image/jpeg"
    }
  ],
  "count": 1
}
```

## Security Features

### ✅ Authentication Required
- All upload endpoints require valid JWT token
- Only authenticated users can upload

### ✅ Role-Based Access
- Only `admin` and `super-admin` roles can upload
- Regular users cannot access upload endpoints

### ✅ File Validation
- **Allowed types**:
  - Images: JPEG, JPG, PNG, GIF, WebP
  - Videos: MP4, WebM, QuickTime
- **Size limit**: 10MB per file
- Invalid files are rejected before upload

### ✅ Unique Filenames
- Random 16-byte hex names prevent collisions
- Timestamp included for sorting
- Original extension preserved

## Cost Estimates (Cloudflare R2)

### Pricing (as of 2025)
- **Storage**: $0.015/GB/month
- **Class A Operations** (writes): $4.50 per million
- **Class B Operations** (reads): $0.36 per million
- **Egress**: **$0** (FREE - no bandwidth charges!)

### Example Monthly Costs
| Usage | Storage | Operations | Total |
|-------|---------|------------|-------|
| Small (10GB, 10K uploads, 100K views) | $0.15 | $0.08 | **$0.23/mo** |
| Medium (50GB, 50K uploads, 500K views) | $0.75 | $0.40 | **$1.15/mo** |
| Large (200GB, 200K uploads, 2M views) | $3.00 | $1.62 | **$4.62/mo** |

**Note**: No egress fees means serving images to millions of users costs the same!

## Troubleshooting

### "Upload failed" Error
**Problem**: R2 credentials not configured or incorrect

**Solution**:
1. Check `apps/api/.env` has all R2 variables
2. Verify endpoint format: `https://<account-id>.r2.cloudflarestorage.com`
3. Check bucket name matches exactly
4. Restart API server after updating .env

### "Authentication required" Error
**Problem**: Not logged in or token expired

**Solution**:
1. Log in to admin panel
2. Check localStorage has `token` value
3. If expired, log out and log in again

### Image URL Returns 404
**Problem**: Bucket not publicly accessible

**Solution**:
1. Go to R2 bucket settings
2. Enable public access (see Step 3 above)
3. If using custom domain, verify DNS is configured
4. Wait 5-10 minutes for DNS propagation

### "File type not allowed" Error
**Problem**: Uploading unsupported file type

**Solution**:
- Only upload: JPG, PNG, GIF, WebP, MP4, WebM, MOV
- Check file extension matches content type
- Maximum 10MB per file

### Health Check Shows "not-configured"
**Problem**: Missing environment variables

**Solution**:
```powershell
# Check if all variables are set
cd apps/api
Get-Content .env | Select-String "R2_"
```

Should show all 5 R2 variables. If any are missing, add them.

## Migration from Supabase

All Supabase functionality has been removed and replaced with R2:
- ✅ Tour images (main, gallery, itinerary)
- ✅ Country images (hero, attractions)
- ✅ Video uploads
- ❌ Featured videos (feature removed)
- ❌ Map markers (feature removed)

Existing Supabase URLs in your database will continue to work until:
1. Images are re-uploaded through admin panel
2. New R2 URLs saved to database
3. Old Supabase storage can be deleted

## Optional: Batch Migration Script

If you have many existing images to migrate, create this script:

```javascript
// scripts/migrate-to-r2.js
const mongoose = require('mongoose');
const Tour = require('../apps/api/src/models/Tour');
const Country = require('../apps/api/src/models/Country');

async function migrateImages() {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Get all tours with Supabase URLs
  const tours = await Tour.find({
    mainImage: /supabase/
  });
  
  console.log(`Found ${tours.length} tours to migrate`);
  
  // For each tour:
  // 1. Download image from Supabase
  // 2. Upload to R2
  // 3. Update database with new URL
  
  // TODO: Implement migration logic
}

migrateImages();
```

## Next Steps After Setup

1. ✅ Complete R2 bucket creation
2. ✅ Get API credentials
3. ✅ Configure public access
4. ✅ Add environment variables
5. ✅ Test uploads
6. 🔄 Upload new images through admin panel
7. 🔄 Update existing records with new URLs (optional)
8. 🔄 [Optional] Delete Supabase storage to stop charges

## Support

- **Cloudflare R2 Docs**: https://developers.cloudflare.com/r2/
- **API Issues**: Check [apps/api/src/routes/upload.ts](apps/api/src/routes/upload.ts)
- **Admin Issues**: Check browser console for errors

---

**Status**: ⏳ Awaiting R2 bucket creation and credentials
**Next**: Complete steps 1-4 above, then test!
