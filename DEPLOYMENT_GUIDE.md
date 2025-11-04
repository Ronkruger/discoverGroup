# Deployment Guide

## 🏗️ Project Structure

```
discoverGroup/
├── src/                    # Client App (Customer-facing)
├── apps/
│   ├── admin/             # Admin Panel (Tour Management)
│   └── api/               # Backend API
```

## 🚀 Deployment Setup

### 1. Client App (Root)
**Netlify Site:** `https://discovergroup.netlify.app`

**Settings:**
- Base directory: `/`
- Build command: `npm run build`
- Publish directory: `src/build`

**Environment Variables:**
```
VITE_API_URL=https://your-api-url.railway.app
VITE_STRIPE_PUBLIC_KEY=pk_xxx
```

---

### 2. Admin Panel
**Netlify Site:** `https://admin-discovergroup.netlify.app`

**Settings:**
- Base directory: `apps/admin`
- Build command: `npm run build`
- Publish directory: `apps/admin/dist`

**Environment Variables:**
```
VITE_API_URL=https://your-api-url.railway.app
VITE_ADMIN_API_URL=https://your-api-url.railway.app
```

---

### 3. API Backend
**Railway/Render Deployment**

**Settings:**
- Root directory: `apps/api`
- Build command: `npm install && npm run build`
- Start command: `npm start`

**Environment Variables:**
```
DATABASE_URL=mongodb://...
JWT_SECRET=your-secret
STRIPE_SECRET_KEY=sk_xxx
SENDGRID_API_KEY=SG.xxx
CORS_ORIGINS=https://discovergroup.netlify.app,https://admin-discovergroup.netlify.app
```

---

## 📝 Netlify Configuration

### Create Two Netlify Sites:

#### Site 1: Client (discovergroup)
```toml
# netlify.toml (root)
[build]
  base = ""
  command = "npm run build"
  publish = "src/build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Site 2: Admin (admin-discovergroup)
```toml
# apps/admin/netlify.toml
[build]
  base = "apps/admin"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🔄 Git Workflow

### Commit Strategy:

When you commit, Git tracks the **entire repository**. This is normal for a monorepo.

**To deploy separately on Netlify:**

1. **Link the same GitHub repo to both Netlify sites**
2. **Configure different base directories** for each site
3. Netlify will automatically detect changes in respective folders

### Example Workflow:

```bash
# Make changes to client
git add src/
git commit -m "feat: update client homepage"
git push
# → Only client site rebuilds (if configured correctly)

# Make changes to admin
git add apps/admin/
git commit -m "feat: add tour delete button"
git push
# → Only admin site rebuilds (if configured correctly)
```

---

## ⚙️ Netlify Deploy Configuration

### For Client Site:
In Netlify dashboard → Site settings → Build & deploy:
- **Ignore builds:** `git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF apps/admin/ apps/api/`

### For Admin Site:
In Netlify dashboard → Site settings → Build & deploy:
- **Ignore builds:** `git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF src/ apps/api/ && exit 0 || exit 1`

This prevents unnecessary rebuilds when only the other app changes.

---

## 🔗 Connecting the Apps

All three apps communicate through the **shared API**:

```
Client (src/) ──────┐
                     ├──→ API (Railway)
Admin (apps/admin/)─┘
```

**Client** fetches tours, creates bookings
**Admin** creates/updates/deletes tours, manages bookings
**Both** hit the same API endpoints

---

## 📦 Package Management

Since this is a monorepo, when you run `npm install` at root:
- It installs dependencies for root
- You still need to install in subdirectories

**Best Practice:**
```bash
# Install all dependencies
npm install
cd apps/admin && npm install
cd ../api && npm install
```

Or use a workspace manager like **npm workspaces** or **pnpm**.

---

## ✅ Checklist

- [ ] Create 2 Netlify sites (client + admin)
- [ ] Deploy API to Railway/Render
- [ ] Set environment variables on all platforms
- [ ] Update CORS settings in API to allow both frontend URLs
- [ ] Test admin → API → client data flow
- [ ] Configure build ignore rules (optional, for efficiency)

---

## 🆘 Troubleshooting

### "Changes to admin rebuild client site"
→ Set up build ignore rules in Netlify

### "Admin can't connect to API"
→ Check CORS settings in API, verify VITE_API_URL

### "Shared dependencies between apps"
→ Consider moving to npm workspaces or pnpm

