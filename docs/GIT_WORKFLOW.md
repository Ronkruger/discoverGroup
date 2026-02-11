# Git Workflow for Monorepo

## Understanding Your Commits

When you commit in this monorepo, **Git tracks the entire repository**. This is normal and correct behavior.

```
✅ Normal: Git shows changes from src/, apps/admin/, apps/api/
❌ Wrong: Trying to commit only one folder separately
```

## Why You See Everything

Your commit includes all changed files because this is a **monorepo** (one repository, multiple apps).

```
discoverGroup/ (ONE git repo)
├── .git/
├── src/              ← Client app
├── apps/
│   ├── admin/        ← Admin app  
│   └── api/          ← Backend API
```

## Solution: Separate Deployments, Same Repo

You DON'T need separate Git repos. Instead:

1. **Keep ONE Git repository** (what you have now)
2. **Deploy to SEPARATE hosting platforms** using different base directories

### Deployment Strategy

```
GitHub Repo (monorepo)
    │
    ├─→ Netlify Site 1 (Client)   → reads from src/
    ├─→ Netlify Site 2 (Admin)    → reads from apps/admin/
    └─→ Railway (API)              → reads from apps/api/
```

## Netlify Configuration

### Site 1: Client (discovergroup.netlify.app)

**Settings in Netlify Dashboard:**
- Repository: `YourGitHub/discoverGroup`
- Base directory: *(leave empty)*
- Build command: `npm run build`
- Publish directory: `src/build`

**Build Settings → Ignore builds:**
```bash
git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF -- apps/
```
This prevents rebuilding the client when only admin/api changes.

---

### Site 2: Admin (admin-discovergroup.netlify.app)

**Settings in Netlify Dashboard:**
- Repository: `YourGitHub/discoverGroup` *(same repo!)*
- Base directory: `apps/admin`
- Build command: `npm run build`
- Publish directory: `dist`

**Build Settings → Ignore builds:**
```bash
git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF -- src/ apps/api/
```
This prevents rebuilding admin when only client/api changes.

---

## Git Workflow Examples

### Example 1: Update Client Homepage

```bash
# Edit files in src/
git add src/pages/Home.tsx
git commit -m "feat: update homepage hero section"
git push

# Result:
# ✅ Client site rebuilds (Netlify detects changes in src/)
# ⏭️  Admin site skips rebuild (no changes in apps/admin/)
```

### Example 2: Add Tour Delete Feature to Admin

```bash
# Edit files in apps/admin/
git add apps/admin/src/pages/TourManagement.tsx
git commit -m "feat: add delete tour button in admin"
git push

# Result:
# ⏭️  Client site skips rebuild (no changes in src/)
# ✅ Admin site rebuilds (Netlify detects changes in apps/admin/)
```

### Example 3: Update API Endpoint

```bash
# Edit files in apps/api/
git add apps/api/src/routes/tours.ts
git commit -m "feat(api): add tour filtering endpoint"
git push

# Result:
# ⏭️  Client site skips rebuild (no changes in src/)
# ⏭️  Admin site skips rebuild (no changes in apps/admin/)
# ✅ API redeploys on Railway
```

### Example 4: Update Multiple Apps

```bash
# Edit files across multiple apps
git add src/pages/Tours.tsx apps/admin/src/pages/TourEdit.tsx apps/api/src/routes/tours.ts
git commit -m "feat: add promo pricing across all apps"
git push

# Result:
# ✅ Client site rebuilds
# ✅ Admin site rebuilds
# ✅ API redeploys
```

---

## Common Git Commands

### See What Will Be Committed
```bash
git status
```

### Commit Only Specific Files
```bash
# Client only
git add src/
git commit -m "feat: update client"

# Admin only
git add apps/admin/
git commit -m "feat: update admin"

# API only
git add apps/api/
git commit -m "feat: update API"
```

### View Commit History
```bash
# See all commits
git log --oneline

# See commits affecting client only
git log --oneline -- src/

# See commits affecting admin only
git log --oneline -- apps/admin/
```

### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

---

## Alternative: Use Git Submodules (NOT Recommended)

If you REALLY want separate repos, you could use submodules:

```bash
# Create separate repos
git init discovergroup-client
git init discovergroup-admin
git init discovergroup-api

# Add as submodules (DON'T DO THIS unless you know why)
git submodule add <url> src
git submodule add <url> apps/admin
git submodule add <url> apps/api
```

**❌ Why NOT to do this:**
- More complex workflow
- Harder to maintain
- Difficult to share code/types
- Overkill for this use case

**✅ Why monorepo is better:**
- Single source of truth
- Easy to share types/utilities
- Atomic commits across apps
- Simpler CI/CD

---

## FAQ

### Q: Why do I see all apps when I commit?
**A:** Because they're in the same Git repository. This is normal and correct.

### Q: How do I deploy them separately?
**A:** Configure Netlify/Railway to read from different base directories (see above).

### Q: Will changing the client trigger admin rebuild?
**A:** Only if you don't set up build ignore rules in Netlify (see configs above).

### Q: Can I split into separate repos later?
**A:** Yes, but it's more work. The monorepo approach is cleaner for related apps.

### Q: How do I share types between client/admin/api?
**A:** Currently in `packages/types/`. Monorepo makes this easy!

---

## Summary

✅ **Keep**: One Git repo (monorepo)  
✅ **Deploy**: Three separate sites (Netlify × 2, Railway × 1)  
✅ **Configure**: Base directories + ignore rules  
✅ **Result**: Each app deploys independently despite being in the same repo

**You don't need separate Git repos. You need separate deployments with proper configuration.**
