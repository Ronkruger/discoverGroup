## Debugging Country Creation 500 Error

The image uploads are working ✅, but country creation is failing with a 500 error. Here's how to debug:

### Step 1: Check Render API Logs

1. Go to https://dashboard.render.com
2. Select your API service (discovergroup)
3. Click "Logs" tab
4. Look for the `[Country POST]` entries from your latest create attempt
5. **Take a screenshot** of the error logs and share them

The logs should show:
```
[Country POST] Creating country with data: {...}
[Country POST] MongoDB connection state: X
[Country POST] Country model available: true/false
```

### Step 2: What the Error Logs Will Tell Us

- **MongoDB connection state codes:**
  - `0` = disconnected ❌
  - `1` = connected ✅
  - `2` = connecting 🔄
  - `3` = disconnecting

- **Common Errors:**
  - `E11000` = Duplicate name or slug
  - `ValidationError` = Missing/invalid required field
  - `Unable to generate slug` = Country name has no alphanumeric characters

### Step 3: Verify Environment Variables

Make sure Render has these set:
1. Go to Render dashboard → API service → Environment
2. Verify:
   - `MONGODB_URI` is set and correct
   - `NODE_ENV=production`
   - `PORT=3001` or correct port

### Step 4: Test Country Name

When creating a country:
- ✅ Use simple names like "France", "Italy"
- ❌ Don't use names with only special characters like "!!!"
- ❌ Don't use names that already exist

### Step 5: Form Fields Required

Make sure you fill in **ALL** of these before saving:
- **Name** ✅ (e.g., "France")
- **Description** ✅ (paragraph of text)
- **Best Time to Visit** ✅ (e.g., "April to October")
- **Currency** ✅ (e.g., "Euro")
- **Language** ✅ (e.g., "French")
- Hero Image (optional, but you've uploaded one)

### Step 6: Reproduction Steps

1. Open Render logs in one browser tab
2. Go to https://admin-discoverg.netlify.app/countries
3. Click "Create Country"
4. Fill in **France** as name
5. Fill in all required fields
6. Click "Save"
7. Watch the logs in Render - you'll see the error

### Step 7: Share Logs

Once you see the error, come back with:
1. Full error message from Render logs
2. The entire `[Country POST]` log section
3. Your country name and all fields you entered

---

## Quick Test: Check Database Connection

Run this to verify MongoDB is working:

1. Go to API logs at https://dashboard.render.com → discovergroup service → Logs
2. Look for requests to `/api/countries/debug/status`
3. If you see a successful response with `"mongoConnected": true`, your database is fine

You can also:
1. Go to https://discovergroup.onrender.com/api/countries
2. You should see a list of existing countries (even if empty `[]`)
3. This confirms the GET endpoint works

---

## Most Likely Issues

1. **Wrong field names** - Form might be sending `heroImage` instead of `heroImageUrl`
2. **Missing validation** - One of the required fields (name, description, etc.) is empty
3. **Database connection** - Render's MongoDB connection might be down
4. **Duplicate name** - You might have already created a country with that name

---

## Next Steps

1. **Redeploy the API** on Render to pick up the improved error logging
2. **Try creating a country again** with the name "France"
3. **Check Render logs** for the detailed error message
4. **Come back with the error logs** and we'll fix the specific issue

The improved logging will tell us exactly what's failing!
