# Netlify + Supabase Environment Setup

## Required Environment Variables

After deploying to Netlify, add these environment variables in **Site Settings → Environment Variables**:

### For Client Site (discoverg.netlify.app)

```env
VITE_SUPABASE_URL=https://awcwijvsncfmdvmobiey.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3Y3dpanZzbmNmbWR2bW9iaWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NTI4NDQsImV4cCI6MjA3ODMyODg0NH0.3IMur0Fal2TaiMqx5gpDjBjsKTzKSMAvAqxuqCESgrs
```

### For Admin Site (admindiscovergrp.netlify.app)

```env
VITE_SUPABASE_URL=https://awcwijvsncfmdvmobiey.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3Y3dpanZzbmNmbWR2bW9iaWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NTI4NDQsImV4cCI6MjA3ODMyODg0NH0.3IMur0Fal2TaiMqx5gpDjBjsKTzKSMAvAqxuqCESgrs
VITE_ADMIN_API_URL=https://discovergroup.onrender.com
```

## Setup Steps

1. **Run SQL Setup in Supabase**
   - Go to: https://supabase.com/dashboard/project/awcwijvsncfmdvmobiey/sql/new
   - Copy contents of `COMPLETE_SUPABASE_SETUP.sql`
   - Paste and click "Run"
   - Verify tables and buckets are created

2. **Add Environment Variables to Netlify**
   - Client site: https://app.netlify.com/sites/discoverg/settings/deploys#environment
   - Admin site: https://app.netlify.com/sites/admindiscovergrp/settings/deploys#environment
   - Add the variables listed above
   - Save changes

3. **Trigger Redeploy**
   - Netlify will auto-redeploy on next git push
   - Or manually trigger: Site Settings → Deploys → Trigger deploy

4. **Test Featured Videos**
   - Login to admin panel
   - Navigate to Homepage → Featured Videos
   - Upload a test video with thumbnail
   - Check client homepage to verify video appears

## Features Enabled

- ✅ Featured videos carousel on homepage
- ✅ File upload with drag-drop
- ✅ Video/image storage in Supabase
- ✅ Map markers management
- ✅ Homepage settings management

## Troubleshooting

**Videos not showing?**
- Check Supabase credentials in Netlify env vars
- Verify SQL script was run successfully
- Check browser console for errors
- Ensure videos are marked as "Active" in admin

**Upload failing?**
- Verify storage buckets exist in Supabase
- Check RLS policies are enabled
- Confirm file size limits (100MB for videos)
- Test with smaller file first

**Need to switch Supabase projects?**
- Update env vars in Netlify
- Trigger redeploy
- Run SQL setup in new project
