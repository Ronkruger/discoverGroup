# Netlify Deployment Configuration Quick Reference

## 📋 Setup Checklist

### Step 1: Create Netlify Sites

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to your GitHub repo: `discoverGroup`
4. **DO THIS TWICE** to create two separate sites

---

## Site 1: Client App

### Basic Settings
```
Site name: discovergroup (or your-custom-name)
Branch: main
Base directory: (leave empty)
Build command: npm run build
Publish directory: src/build
```

### Environment Variables
Go to: Site settings → Build & deploy → Environment → Environment variables

```
VITE_API_URL = https://your-api-url.railway.app
VITE_STRIPE_PUBLIC_KEY = pk_live_or_test_key
VITE_EMAILJS_SERVICE_ID = your_service_id
VITE_EMAILJS_TEMPLATE_ID = your_template_id
VITE_EMAILJS_PUBLIC_KEY = your_public_key
VITE_SUPABASE_URL = https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY = your_anon_key
```

### Build Optimization (Optional)
Go to: Site settings → Build & deploy → Build settings → Edit settings

**Ignore builds:**
```bash
git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF -- apps/
```

This prevents rebuilding when only admin/api changes.

---

## Site 2: Admin Panel

### Basic Settings
```
Site name: admin-discovergroup (or your-custom-name)
Branch: main
Base directory: apps/admin
Build command: npm run build
Publish directory: dist
```

### Environment Variables
Go to: Site settings → Build & deploy → Environment → Environment variables

```
VITE_API_URL = https://your-api-url.railway.app
VITE_ADMIN_API_URL = https://your-api-url.railway.app
VITE_SUPABASE_URL = https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY = your_anon_key
```

### Build Optimization (Optional)
Go to: Site settings → Build & deploy → Build settings → Edit settings

**Ignore builds:**
```bash
git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF -- src/ apps/api/
```

This prevents rebuilding when only client/api changes.

---

## Troubleshooting

### Build fails with "command not found: npm"
✅ **Fix:** Add environment variable:
```
NODE_VERSION = 18
```

### Build fails with "Cannot find module"
✅ **Fix:** Check if dependencies are in the right package.json
- Client deps should be in root `package.json`
- Admin deps should be in `apps/admin/package.json`

### Admin site shows "API connection failed"
✅ **Fix:** Check environment variables:
1. Verify `VITE_API_URL` is set correctly
2. Make sure API is deployed and running
3. Check API logs for CORS errors

### Client/Admin can't connect to API (CORS error)
✅ **Fix:** Update API environment variable:
```
CORS_ORIGINS = https://discovergroup.netlify.app,https://admin-discovergroup.netlify.app
```

### Changes to client trigger admin rebuild (or vice versa)
✅ **Fix:** Set up ignore rules (see above)

### Netlify shows "No netlify.toml found"
ℹ️ **Info:** This is fine! You're using Netlify UI configuration instead.

The `netlify.toml` files in your repo are backups. The UI settings override them.

---

## Post-Deployment Checklist

After both sites are deployed:

- [ ] Client site is accessible
- [ ] Admin site is accessible
- [ ] Both can connect to API
- [ ] Test creating a tour in admin
- [ ] Verify tour appears on client site
- [ ] Test booking flow on client
- [ ] Check admin bookings page shows new booking
- [ ] Update API `CORS_ORIGINS` with both URLs
- [ ] Set up custom domains (optional)

---

## Railway API Deployment

### Settings
```
Environment: Node
Build command: npm install && npm run build
Start command: npm start
Root directory: apps/api
```

### Environment Variables
```
NODE_ENV = production
PORT = (Railway provides this automatically)
DATABASE_URL = your_mongodb_or_postgres_url
JWT_SECRET = generate_a_secure_random_string
STRIPE_SECRET_KEY = sk_live_or_test_key
SENDGRID_API_KEY = SG.xxx
CORS_ORIGINS = https://discovergroup.netlify.app,https://admin-discovergroup.netlify.app
AWS_ACCESS_KEY_ID = (if using S3)
AWS_SECRET_ACCESS_KEY = (if using S3)
AWS_REGION = us-east-1
AWS_S3_BUCKET_NAME = your-bucket
```

---

## Quick Verification

After deployment, test these URLs:

### Client
```
https://discovergroup.netlify.app
https://discovergroup.netlify.app/tours
https://discovergroup.netlify.app/booking/tour-id-123
```

### Admin
```
https://admin-discovergroup.netlify.app
https://admin-discovergroup.netlify.app/login
https://admin-discovergroup.netlify.app/tours
```

### API
```
https://your-api.railway.app/health
https://your-api.railway.app/public/tours
```

---

## Need Help?

1. Check Netlify deploy logs: Site → Deploys → Click failed deploy
2. Check Railway logs: Service → Logs
3. Check browser console for client/admin errors
4. Verify all environment variables are set correctly
