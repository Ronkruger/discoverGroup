# Country Creation Fix - November 2025

## Problem
Creating countries in the admin panel was failing with a generic "Failed to create country: 500" error. The error message didn't provide enough detail about what was actually failing.

## Root Causes Identified & Fixed

### 1. **Slug Generation Error Handling**
**Issue**: The pre-save hook in the Country model wasn't wrapping slug generation in try-catch, so errors weren't being properly caught.

**Fix** (apps/api/src/models/Country.ts):
- Added try-catch block around slug generation
- Added validation to ensure country name is not empty
- Added explicit error if slug cannot be generated (no alphanumeric characters)
- These errors are now properly caught and returned to the user

### 2. **Insufficient Error Logging**
**Issue**: Error messages returned to the admin frontend were generic, making debugging impossible.

**Fix** (apps/api/src/routes/countries.ts):
- Added detailed request logging with `[Country POST]` prefix for easy tracking
- Added specific error handling for different error types:
  - `ValidationError`: Returns 400 with validation details
  - `E11000` (duplicate key): Returns 409 with field info
  - Slug generation errors: Returns 400 with helpful message
  - Unknown errors: Returns 500 with actual error message
- Logs include: request body, error message, and stack trace
- Better separation of concerns with async/await pattern

### 3. **Admin API Client Consistency**
**Status**: Already refactored to use the same pattern as working tour creation.

The `createCountryAdmin` function in `apps/admin/src/services/apiClient.ts` now:
- Uses proper JSON headers
- Throws meaningful errors with HTTP status codes
- Logs to console for debugging

## Key Changes

### apps/api/src/models/Country.ts
```typescript
// Enhanced pre-save hook with error handling
countrySchema.pre('save', function(next) {
  try {
    if (this.isModified('name') && !this.slug) {
      if (!this.name || this.name.trim().length === 0) {
        return next(new Error('Country name cannot be empty'));
      }
      this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (!this.slug || this.slug.length === 0) {
        return next(new Error('Unable to generate slug from country name'));
      }
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});
```

### apps/api/src/routes/countries.ts
```typescript
// Enhanced error handling with specific response codes
if (error instanceof Error && error.name === 'ValidationError') {
  const validationError = error as Record<string, unknown> & Error;
  console.error('[Country POST] Validation error details:', validationError.errors);
  res.status(400).json({ error: `Validation error: ${errorMessage}` });
} else if (error instanceof Error && error.message.includes('E11000')) {
  const field = error.message.includes('name') ? 'name' : 'slug';
  res.status(409).json({ error: `Country ${field} already exists` });
} else if (error instanceof Error && error.message.includes('Unable to generate slug')) {
  res.status(400).json({ error: 'Country name is invalid or contains no alphanumeric characters' });
}
```

## How to Test

### Local Testing (if running locally)
1. Start the API: `npm run dev:api`
2. Open admin UI: `npm run dev:admin`
3. Try creating a country with all required fields
4. Check terminal logs for detailed error messages if it fails

### Render Testing
1. Deploy changes to Render
2. Call `/health/db` endpoint to verify MongoDB connection
3. Try creating a country in admin UI
4. Check Render logs for detailed error information using:
   ```
   render logs <service-id>
   ```

## Debugging Checklist

If country creation still fails after deployment:

1. ✅ Check MongoDB connection: `GET /health/db`
2. ✅ Verify API is running: `GET /health`
3. ✅ Check for duplicate country names (409 error)
4. ✅ Verify all required fields present: name, description, bestTime, currency, language
5. ✅ Check Render logs for actual error message with `[Country POST]` prefix
6. ✅ Test with curl to bypass admin UI issues:
   ```bash
   curl -X POST https://discovergroup.onrender.com/api/countries \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Country",
       "description": "Test description",
       "bestTime": "April-October",
       "currency": "USD",
       "language": "English"
     }'
   ```

## Comparison with Working Tour Creation

The country creation endpoint now follows the same robust pattern as tour creation:
- ✅ Proper async/await
- ✅ Detailed error logging
- ✅ Specific error codes (400, 409, 500)
- ✅ Helpful error messages
- ✅ Database connection verified before server start

## Next Steps

1. Deploy to Render
2. Test country creation in admin UI
3. Monitor Render logs for any issues
4. If still failing, capture the full error message from logs for further debugging

---
**Status**: Ready for Render deployment
**Build Status**: ✅ Both API and Admin compile successfully
