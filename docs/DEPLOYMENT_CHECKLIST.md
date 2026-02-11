# 🚀 Deployment Checklist

## Step 1: Deploy API to Railway ⏳

### A. Create Railway Account & Project
- [ ] Go to https://railway.app
- [ ] Sign up/Login with GitHub
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose: `Ronkruger/discoverGroup`

### B. Configure Railway Project
- [ ] Root Directory: `apps/api`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`

### C. Add Environment Variables in Railway

Copy these from `apps/api/.env`:

```
NODE_ENV=production
MONGODB_URI=[YOUR_MONGODB_ATLAS_CONNECTION_STRING]
STRIPE_SECRET_KEY=[YOUR_STRIPE_SECRET_KEY]
JWT_SECRET=[YOUR_JWT_SECRET]
SENDGRID_API_KEY=[YOUR_SENDGRID_API_KEY]
SENDGRID_TEMPLATE_ID=[YOUR_SENDGRID_TEMPLATE_ID]
SENDGRID_FROM_EMAIL=[YOUR_SENDGRID_FROM_EMAIL]
SENDGRID_FROM_NAME=Discover Group Bookings
EMAIL_USER=[YOUR_EMAIL]
EMAIL_PASS=[YOUR_EMAIL_APP_PASSWORD]
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175,https://discovergrp.netlify.app,https://admin--discovergrp.netlify.app
```

### D. Get Railway URL
- [ ] After deployment, copy your Railway URL
- [ ] Format: `https://your-app-name.railway.app`
- [ ] Save it for next steps: __________________

---

## Step 2: Deploy Client to Netlify ⏳

### A. Create Netlify Account & Site
- [ ] Go to https://app.netlify.com
- [ ] Sign up/Login with GitHub
- [ ] Click "Add new site" → "Import an existing project"
- [ ] Choose GitHub → Select `Ronkruger/discoverGroup`

### B. Configure Client Site
```
Site name: discovergrp
Branch: main
Base directory: (leave empty)
Build command: npm run build
Publish directory: src/build
```

### C. Add Environment Variables in Netlify

```
VITE_STRIPE_PUBLISHABLE_KEY=[YOUR_STRIPE_PUBLISHABLE_KEY]
VITE_API_BASE_URL=[YOUR_RAILWAY_URL_HERE]
VITE_ADMIN_URL=https://admin--discovergrp.netlify.app
VITE_EMAILJS_SERVICE_ID=[YOUR_EMAILJS_SERVICE_ID]
VITE_EMAILJS_TEMPLATE_ID=[YOUR_EMAILJS_TEMPLATE_ID]
VITE_EMAILJS_PUBLIC_KEY=[YOUR_EMAILJS_PUBLIC_KEY]
VITE_EMAILJS_PRIVATE_KEY=[YOUR_EMAILJS_PRIVATE_KEY]
VITE_SENDGRID_API_KEY=[YOUR_SENDGRID_API_KEY]
VITE_SENDGRID_TEMPLATE_ID=[YOUR_SENDGRID_TEMPLATE_ID]
VITE_SENDGRID_FROM_EMAIL=[YOUR_SENDGRID_FROM_EMAIL]
VITE_SENDGRID_FROM_NAME=Discover Group Bookings
VITE_SUPABASE_URL=[YOUR_SUPABASE_URL]
VITE_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
```

### D. Deploy Client
- [ ] Click "Deploy site"
- [ ] Wait for build to complete
- [ ] Client URL: __________________

---

## Step 3: Deploy Admin to Netlify ⏳

### A. Create Second Netlify Site
- [ ] In Netlify, click "Add new site" again
- [ ] Import SAME GitHub repo: `Ronkruger/discoverGroup`

### B. Configure Admin Site
```
Site name: admin--discovergrp
Branch: main
Base directory: apps/admin
Build command: npm run build
Publish directory: dist
```

### C. Add Environment Variables in Netlify

```
VITE_API_URL=[YOUR_RAILWAY_URL_HERE]
VITE_ADMIN_API_URL=[YOUR_RAILWAY_URL_HERE]
VITE_SUPABASE_URL=[YOUR_SUPABASE_URL]
VITE_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
```

### D. Deploy Admin
- [ ] Click "Deploy site"
- [ ] Wait for build to complete
- [ ] Admin URL: __________________

---

## Step 4: Update CORS in Railway ⏳

### A. Update Railway Environment Variable
- [ ] Go back to Railway dashboard
- [ ] Navigate to your API project
- [ ] Find `CORS_ORIGINS` variable
- [ ] Update with your actual Netlify URLs:
```
CORS_ORIGINS=https://discovergrp.netlify.app,https://admin--discovergrp.netlify.app
```
- [ ] Redeploy API

---

## Step 5: Final Testing 🧪

### A. Test API
- [ ] Visit: `[YOUR_RAILWAY_URL]/health`
- [ ] Should show: `{"ok":true}`

### B. Test Client
- [ ] Visit your client Netlify URL
- [ ] Browse tours
- [ ] Check if tours load from API
- [ ] Test booking flow

### C. Test Admin
- [ ] Visit your admin Netlify URL
- [ ] Login with: `superadmin@discovergroup.com` / `superadmin123`
- [ ] Try to add a tour
- [ ] Check if it appears on client

### D. Test Integration
- [ ] Add tour in admin
- [ ] Verify it shows on client
- [ ] Make test booking on client
- [ ] Check booking appears in admin

---

## 🎉 Deployment Complete!

Once all checkboxes are checked, your app is live!

### Your Live URLs:
- **Client:** https://discovergrp.netlify.app
- **Admin:** https://admin--discovergrp.netlify.app
- **API:** [Your Railway URL]

---

## 🆘 Troubleshooting

### Build Failed on Netlify
- Check build logs
- Verify all environment variables are set
- Make sure base directory is correct

### API Not Responding
- Check Railway logs
- Verify MongoDB connection
- Check environment variables

### CORS Errors
- Update CORS_ORIGINS in Railway
- Make sure it includes both Netlify URLs
- Redeploy API after updating

### Client Can't Connect to API
- Verify VITE_API_BASE_URL in Netlify
- Make sure Railway URL is correct
- Check API is actually running

---

## 📝 Notes

**Important:**
- Railway URL format: `https://[your-project].railway.app`
- Netlify auto-generates URLs or you can customize
- All environment variables must be set BEFORE deploying
- Changes to env vars require redeploy

**MongoDB:**
- If using local MongoDB, you need to switch to MongoDB Atlas (cloud)
- Create free cluster at https://mongodb.com/cloud/atlas
- Replace MONGODB_URI with Atlas connection string
