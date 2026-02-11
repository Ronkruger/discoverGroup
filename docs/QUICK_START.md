# 🚀 Quick Start: Separate Deployments

## TL;DR - The Answer to Your Question

**Problem:** "When I commit, it shows everything (src/, apps/admin/, apps/api/). I want to host them separately."

**Solution:** ✅ **This is CORRECT behavior!** Keep your monorepo, but deploy to separate hosting platforms.

```
One Git Repo → Three Separate Deployments
```

---

## 📦 What You Have (Monorepo Structure)

```
discoverGroup/ (ONE repository)
├── .git/                    ← Single Git repo
├── src/                     ← CLIENT: Customer-facing tour site
├── apps/
│   ├── admin/              ← ADMIN: Tour management panel
│   └── api/                ← API: Backend for both
```

---

## 🎯 What You Want (Separate Deployments)

### Deployment Architecture:

```
┌─────────────────────────────────────────┐
│         GitHub Repository               │
│           (monorepo)                    │
└──────┬────────────┬─────────────┬───────┘
       │            │             │
       ▼            ▼             ▼
   Netlify #1   Netlify #2    Railway
   (Client)     (Admin)       (API)
       │            │             │
       ▼            ▼             ▼
   discovergroup  admin-discover  API Server
   .netlify.app  group.netlify   .railway.app
                 .app
```

---

## ⚡ Quick Setup (5 Steps)

### Step 1: Create Netlify Site for Client

1. Go to https://app.netlify.com
2. "Add new site" → Import from GitHub
3. Select your `discoverGroup` repo
4. Configure:
   ```
   Base directory: (empty)
   Build command: npm run build
   Publish directory: src/build
   ```
5. Add environment variables (see NETLIFY_CONFIG.md)

### Step 2: Create Netlify Site for Admin

1. **Same Netlify account**, click "Add new site" again
2. Import the **SAME GitHub repo** (discoverGroup)
3. Configure:
   ```
   Base directory: apps/admin
   Build command: npm run build
   Publish directory: dist
   ```
4. Add environment variables (see NETLIFY_CONFIG.md)

### Step 3: Deploy API to Railway

1. Go to https://railway.app
2. "New Project" → Deploy from GitHub
3. Select your `discoverGroup` repo
4. Configure:
   ```
   Root directory: apps/api
   Build: npm install && npm run build
   Start: npm start
   ```
5. Add environment variables (see DEPLOYMENT_GUIDE.md)

### Step 4: Update Environment Variables

Get your Railway API URL (e.g., `https://your-app.railway.app`)

**In Netlify Client site:**
```
VITE_API_URL = https://your-app.railway.app
```

**In Netlify Admin site:**
```
VITE_API_URL = https://your-app.railway.app
```

**In Railway API:**
```
CORS_ORIGINS = https://your-client.netlify.app,https://your-admin.netlify.app
```

### Step 5: Test Everything

1. Visit your client site → Browse tours
2. Visit your admin site → Add a test tour
3. Refresh client site → See new tour
4. Make a test booking → Check admin bookings

✅ **Done!** All three apps are deployed separately but connected.

---

## 🔄 Daily Workflow

### Making Changes

When you make changes and commit:

```bash
# Edit client homepage
code src/pages/Home.tsx
git add src/pages/Home.tsx
git commit -m "feat: update homepage"
git push
# → Only CLIENT rebuilds on Netlify
```

```bash
# Edit admin tour management
code apps/admin/src/pages/Tours.tsx
git add apps/admin/src/pages/Tours.tsx
git commit -m "feat: add delete button"
git push
# → Only ADMIN rebuilds on Netlify
```

```bash
# Edit API endpoint
code apps/api/src/routes/tours.ts
git add apps/api/src/routes/tours.ts
git commit -m "feat: add filtering"
git push
# → Only API redeploys on Railway
```

**Key Point:** Even though Git shows all files when you commit, Netlify/Railway only rebuild the parts that changed!

---

## 🎓 Understanding Monorepo

### Why Git Shows Everything

This is **normal** and **correct**:
- You have ONE repository
- Git tracks ALL files in that repository
- When you run `git status`, it shows everything that changed
- This is a **monorepo** pattern (used by Google, Facebook, etc.)

### Why This Is Good

✅ **Advantages:**
- Share types between client/admin/api
- Make atomic changes across all apps
- Single source of truth
- Easy to keep versions in sync
- Simpler CI/CD

❌ **Disadvantages of splitting:**
- Harder to share code
- Need to sync versions manually
- More complex setup
- Overkill for this project

---

## 📚 Documentation Files

I've created these guides for you:

1. **DEPLOYMENT_GUIDE.md** - Complete deployment instructions
2. **NETLIFY_CONFIG.md** - Step-by-step Netlify setup
3. **GIT_WORKFLOW.md** - Understanding Git in monorepo
4. **THIS FILE** - Quick reference

---

## 🆘 Common Issues

### "My admin changes rebuild the client!"

**Fix:** Add ignore rules in Netlify (see NETLIFY_CONFIG.md)

### "CORS error when connecting to API"

**Fix:** Update `CORS_ORIGINS` in Railway with your Netlify URLs

### "Build fails on Netlify"

**Fix:** Check build logs, usually missing environment variables

### "I want separate Git repos"

**Answer:** You don't need them! This monorepo setup is the industry standard for related apps.

---

## ✅ Final Checklist

Before going live:

- [ ] Client deployed to Netlify
- [ ] Admin deployed to Netlify (separate site)
- [ ] API deployed to Railway
- [ ] All environment variables set
- [ ] CORS configured in API
- [ ] Test: Admin can create tours
- [ ] Test: Client can display tours
- [ ] Test: Bookings work end-to-end
- [ ] Custom domains configured (optional)

---

## 🎉 You're All Set!

**Remember:** 
- Keep your monorepo (it's the right choice)
- Deploy to separate platforms
- Each app builds independently
- They connect through your API

**Run this to test everything locally:**
```bash
npm run dev
```

This starts all three apps:
- Client: http://localhost:5173
- Admin: http://localhost:5174
- API: http://localhost:4000

---

## Need More Help?

- **Deployment:** Read DEPLOYMENT_GUIDE.md
- **Netlify Setup:** Read NETLIFY_CONFIG.md  
- **Git Questions:** Read GIT_WORKFLOW.md
- **Environment Variables:** Check `.env.example` files
