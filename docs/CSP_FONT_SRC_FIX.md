# Content Security Policy (CSP) Font-SRC Fix

## Problem
The browser is blocking Google Fonts from loading because the CSP policy is missing the `font-src` directive. This causes the app to not display fonts correctly.

### Error Messages:
```
Loading the font '<URL>' violates the following Content Security Policy directive: "default-src 'self'". 
Note that 'font-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.

Loading the stylesheet 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Newsreader:wght@400;500;600;700&display=swap' 
violates the following Content Security Policy directive: "style-src 'self' 'unsafe-inline' https://js.stripe.com". 
Note that 'style-src-elem' was not explicitly set, so 'style-src' is used as a fallback.
```

## Root Cause

**File:** `index.html` (Line 11-20)

The current CSP meta tag is **missing two directives**:
1. `font-src` - Explicitly allows font sources
2. `style-src-elem` - Explicitly allows stylesheet elements

When these directives are not set, the browser falls back to `default-src 'self'`, which only allows resources from the same origin, blocking:
- ❌ `fonts.googleapis.com` (Google Fonts CSS)
- ❌ `fonts.gstatic.com` (Google Fonts WOFF2 files)

## Current CSP (Problematic)

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://js.stripe.com 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://js.stripe.com;
  img-src 'self' data: blob: https://*.stripe.com https://*.stripecdn.com https://*.stripe.network https://js.stripe.com https://q.stripe.com https://b.stripecdn.com https://m.stripe.network https://m.stripe.com https://*.supabase.co;
  media-src 'self' https://*.supabase.co blob: data:;
  connect-src 'self' ws://localhost:5173 http://localhost:4000 https://discovergroup.onrender.com https://*.stripe.com https://*.stripecdn.com https://*.stripe.network https://*.supabase.co;
  frame-src 'self' https://*.stripe.com;
  worker-src 'self' blob:;
  child-src 'self' https://*.stripe.com;
">
```

### Problems:
- ❌ Missing `font-src` directive
- ❌ Missing `style-src-elem` directive
- ❌ Can't load external fonts
- ❌ Can't load external stylesheets

## Solution: Updated CSP

Add the two missing directives:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://js.stripe.com 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://js.stripe.com https://fonts.googleapis.com;
  style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob: https://*.stripe.com https://*.stripecdn.com https://*.stripe.network https://js.stripe.com https://q.stripe.com https://b.stripecdn.com https://m.stripe.network https://m.stripe.com https://*.supabase.co;
  media-src 'self' https://*.supabase.co blob: data:;
  connect-src 'self' ws://localhost:5173 http://localhost:4000 https://discovergroup.onrender.com https://*.stripe.com https://*.stripecdn.com https://*.stripe.network https://*.supabase.co;
  frame-src 'self' https://*.stripe.com;
  worker-src 'self' blob:;
  child-src 'self' https://*.stripe.com;
">
```

### What Changed:
1. **Added `style-src-elem`** directive (Line 4):
   - Allows stylesheets from `fonts.googleapis.com`
   - More specific than `style-src` for stylesheet elements

2. **Added `font-src`** directive (Line 5):
   - Allows fonts from `fonts.gstatic.com`
   - Loads actual font files (.woff2, .ttf, etc.)

3. **Updated `style-src`** directive (Line 3):
   - Added `https://fonts.googleapis.com` to the whitelist

## Why This Works

### Google Fonts Loading Process:
```
1. Browser loads: https://fonts.googleapis.com/css2?family=Inter...
   ✅ Allowed by: style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
   ✅ Allowed by: style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com

2. CSS file references font files from: https://fonts.gstatic.com/...
   ✅ Allowed by: font-src 'self' https://fonts.gstatic.com

3. Font files download and apply
   ✅ Fonts display correctly in browser
```

## Directive Breakdown

### `font-src 'self' https://fonts.gstatic.com;`
- `'self'` - Allow fonts from same origin (for custom fonts)
- `https://fonts.gstatic.com` - Allow Google Fonts CDN (fonts.gstatic.com)

### `style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com;`
- `'self'` - Allow stylesheets from same origin
- `'unsafe-inline'` - Allow inline styles (needed for tailwind, styled-components)
- `https://fonts.googleapis.com` - Allow Google Fonts CSS file

### `style-src 'self' 'unsafe-inline' https://js.stripe.com https://fonts.googleapis.com;`
- Updated to include `https://fonts.googleapis.com`

## Security Considerations

✅ **This is SECURE because:**
- Only whitelisting legitimate CDNs (Google Fonts, Stripe)
- Not using `unsafe-* ` for fonts (fonts are specific sources)
- Google Fonts is a trusted CDN (Google Inc.)
- `fonts.gstatic.com` is the official Google Fonts distribution network

⚠️ **CSP is still strict:**
- Only allows fonts from explicitly whitelisted origins
- No arbitrary font URLs
- No data: URIs for fonts (common attack vector)

## Implementation Steps

### Option 1: Manual Edit
1. Open `index.html`
2. Replace the meta http-equiv CSP tag (lines 11-20)
3. Paste the updated CSP from above
4. Save file

### Option 2: CLI Edit (if needed)
```bash
# The fix involves updating the index.html file
# Change the CSP meta tag as shown above
```

## Testing the Fix

After applying the fix:

1. **Restart dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser DevTools** (F12)
   - Go to **Console** tab
   - Look for CSP violation messages
   - Should now see: ✅ No CSP errors for fonts

3. **Verify fonts load:**
   - Fonts should display in the app
   - Check **Network** tab:
     - `fonts.googleapis.com/css2?...` - Status: **200** ✅
     - `fonts.gstatic.com/...` - Status: **200** ✅

4. **Visual check:**
   - Headers should use proper fonts (Inter, Newsreader)
   - No fallback to system fonts

### Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| Font loading | ❌ Blocked by CSP | ✅ Loads successfully |
| Google Fonts CSS | ❌ Error 403 (CSP) | ✅ 200 OK |
| Font files (.woff2) | ❌ Blocked by CSP | ✅ Load correctly |
| Console warnings | ❌ CSP violations | ✅ No warnings |
| Font display | ❌ Fallback fonts | ✅ Inter + Newsreader |

## Files to Update
- ✏️ `index.html` - Update CSP meta tag (lines 11-20)

## Additional Notes

- This is a **frontend fix only** (no backend changes needed)
- CSP is important for security - this change maintains strict security
- Google Fonts is a safe, widely-used CDN
- The fix applies to all pages since CSP is in the main HTML file

---

**Status:** Ready to implement - just update the CSP meta tag in `index.html`
