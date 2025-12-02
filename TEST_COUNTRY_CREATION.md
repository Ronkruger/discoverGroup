# Country Creation Debugging Guide

## Quick Test: Check API Status

After redeploying, test the API with these commands:

### 1. Check MongoDB Connection Health
```bash
curl https://discovergroup.onrender.com/api/countries/debug/status
```

Expected response:
```json
{
  "mongoState": "connected",
  "mongoStateCode": 1,
  "mongoConnected": true,
  "mongoDBName": "discovergroup",
  "mongoHost": "cluster.mongodb.net",
  "dbPingSuccess": true,
  "countryModelExists": true,
  "timestamp": "2025-12-02T..."
}
```

### 2. Try Creating a Country (Minimal)
```bash
curl -X POST https://discovergroup.onrender.com/api/countries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TestCountry",
    "description": "Test description",
    "bestTime": "April - October",
    "currency": "USD",
    "language": "English"
  }'
```

Expected response on success (201):
```json
{
  "_id": "...",
  "name": "TestCountry",
  "slug": "testcountry",
  "description": "Test description",
  "bestTime": "April - October",
  "currency": "USD",
  "language": "English",
  "isActive": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

On error (500), the response will now include:
```json
{
  "error": "Failed to create country: <actual error message>",
  "errorName": "<error type>",
  "mongoConnected": true/false,
  "details": {
    "errorMessage": "...",
    "errorName": "...",
    "stack": "..."
  }
}
```

## Possible Issues & Solutions

### Issue 1: MongoDB Not Connected
**Error**: `mongoConnected: false` in debug/status response
**Solution**: 
- Check MONGODB_URI environment variable is set in Render
- Verify MongoDB Atlas connection string is correct
- Check MongoDB Atlas IP whitelist (should allow 0.0.0.0 or Render's IP)

### Issue 2: Duplicate Country Name
**Error**: `E11000` duplicate key error
**Solution**: 
- The country name already exists
- Check MongoDB for existing countries collection
- Try with a unique country name

### Issue 3: Pre-save Hook Failure
**Error**: "Unable to generate slug from country name" or "Country name cannot be empty"
**Solution**:
- Ensure country name contains at least one letter/number
- Check that name field is not empty

### Issue 4: Mongoose Model Not Found
**Error**: Error includes model-related message
**Solution**:
- Ensure Country model is properly exported
- Check import paths in countries.ts route

## Render Deployment

After fixing any issues:

1. Go to Render Dashboard
2. Select the API service
3. Redeploy or wait for automatic deploy from GitHub push
4. Check Logs to verify deployment

## Admin Panel Testing

Once API is working:

1. Go to `https://admin-discoverg.netlify.app/countries`
2. Click "Add Country"
3. Fill in the form:
   - Name: `France`
   - Description: `A beautiful European country...`
   - Best Time: `April - October`
   - Currency: `EUR`
   - Language: `French`
4. Click "Save Country" (skip image upload for now)

## If Still Having Issues

1. Run the debug/status endpoint check
2. Capture the actual error message from the response
3. Check Render logs: Look for `[Country POST]` messages
4. Share the error details for more specific debugging
