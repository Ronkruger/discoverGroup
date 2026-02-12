# CSRF Protection Implementation

## Overview
Implemented comprehensive Cross-Site Request Forgery (CSRF) protection using double-submit cookie pattern for the admin panel.

## Implementation Details

### Backend (API Server)

#### 1. CSRF Middleware (`apps/api/src/middleware/csrf.ts`)
- **Pattern**: Double-submit cookie with `csurf` package
- **Cookie Configuration**:
  - `httpOnly: true` - Prevents JavaScript access
  - `sameSite: 'strict'` - Blocks cross-site requests
  - `secure: true` (production) - HTTPS only
  - `maxAge: 3600000` - 1 hour expiration

**Key Functions**:
- `csrfProtection()` - Main middleware using csurf
- `conditionalCsrfProtection()` - Applies CSRF to `/admin/` and `/api/` routes, excludes GET/HEAD/OPTIONS
- `attachCsrfToken()` - Attaches token to res.locals (deprecated approach, not used)
- `csrfErrorHandler()` - Custom error handler for CSRF failures
- `getCsrfToken()` - Utility to extract token from res.locals

**Integration** (`apps/api/src/index.ts`):
```javascript
// Order matters for security middleware:
app.use(cookieParser()); // Parse cookies first
app.get('/api/csrf-token', attachCsrfToken, (req, res) => { /* token endpoint */ });
app.use(conditionalCsrfProtection); // Apply CSRF protection
// ... other routes
app.use(csrfErrorHandler); // Handle CSRF errors before general error handler
```

#### 2. CSRF Token Endpoint
- **Endpoint**: `GET /api/csrf-token`
- **Purpose**: Provides CSRF token to frontend
- **Response**: `{ csrfToken: string }`
- **Authentication**: Not required (needed for initial page load)

#### 3. Type Definitions (`apps/api/src/types/express.d.ts`)
Added TypeScript definition for `req.csrfToken()` method.

### Frontend (Admin Panel)

#### 1. CSRF Token Management (`apps/admin/src/utils/csrf.ts`)
Centralized CSRF token handling with:

**Key Functions**:
- `fetchCsrfToken()` - Fetches new token from server
- `getCsrfToken()` - Returns cached token or fetches new one
- `addCsrfHeader()` - Adds `X-CSRF-Token` header to requests
- `handleCsrfError()` - Handles 403 CSRF errors with automatic retry
- `clearCsrfToken()` - Removes cached token
- `initializeCsrf()` - Pre-fetches token on app startup with auto-refresh

**Features**:
- Session storage for persistence across page reloads
- Automatic token refresh every 50 minutes (before 1-hour expiration)
- Error handling with retry logic
- Concurrent request deduplication

#### 2. Token Storage Integration (`apps/admin/src/utils/tokenStorage.ts`)
Updated `authFetch()` to automatically include CSRF tokens:

```typescript
// Automatically adds CSRF token for POST/PUT/PATCH/DELETE requests
const response = await authFetch('/api/admin/countries', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

**Features**:
- Automatic CSRF header injection for state-changing methods
- Handles 403 CSRF errors with auto-retry
- Clears CSRF token on authentication failure
- Includes cookies for CSRF validation

#### 3. Auth Context Integration (`apps/admin/src/contexts/AuthContext.tsx`)
- Calls `initializeCsrf()` on app startup
- Ensures CSRF token is available before any admin operations

## Security Benefits

1. **CSRF Attack Prevention**: Validates that requests originate from legitimate admin users
2. **Double-Submit Pattern**: Cookie + header validation ensures authenticity
3. **SameSite Cookies**: Blocks cross-site request forgery attempts
4. **HTTPOnly Cookies**: Prevents XSS token theft
5. **Automatic Token Rotation**: Tokens expire after 1 hour
6. **Conditional Protection**: Only applied to state-changing requests (POST/PUT/PATCH/DELETE)

## Usage

### Frontend (Automatic)
All authenticated requests through `authFetch()` automatically include CSRF tokens:

```typescript
// No changes needed - CSRF handled automatically
const response = await authFetch('/api/admin/tours', {
  method: 'POST',
  body: JSON.stringify(tourData)
});
```

### Backend (Automatic)
CSRF protection is automatically applied to:
- All `/admin/*` routes
- All `/api/*` routes (except public authentication endpoints)

## Testing

### Valid Request Flow:
1. Admin panel initializes → Fetches CSRF token
2. User creates/updates data → authFetch includes CSRF header
3. Server validates cookie + header → Request succeeds

### Invalid Request Flow:
1. Attacker sends forged request → Missing/invalid CSRF token
2. Server rejects with 403 → Error response
3. Admin panel catches 403 → Fetches new token → Retries request

## Error Codes

- **CSRF_TOKEN_INVALID**: Token mismatch or missing
- **CSRF_TOKEN_MISSING**: No token provided
- **CSRF_TOKEN_EXPIRED**: Token older than 1 hour

## Maintenance

### Token Refresh Schedule:
- **Server-side**: Tokens expire after 1 hour
- **Client-side**: Auto-refresh every 50 minutes
- **On Error**: Immediate refresh and retry

### Monitoring:
Check for CSRF errors in logs:
```
CSRF token validation failed for user: [userId]
```

## Related Security Features

This CSRF protection works alongside:
- JWT authentication (7-day expiration)
- Session management (8-hour timeout with activity extension)
- Admin role-based access control (RBAC)
- Rate limiting (100 requests per 15 minutes)
- Input sanitization and validation

## Files Modified

### Backend:
- `apps/api/src/middleware/csrf.ts` (NEW)
- `apps/api/src/types/express.d.ts` (NEW)
- `apps/api/src/index.ts` (UPDATED)

### Frontend:
- `apps/admin/src/utils/csrf.ts` (NEW)
- `apps/admin/src/utils/tokenStorage.ts` (UPDATED)
- `apps/admin/src/contexts/AuthContext.tsx` (UPDATED)

## Implementation Status

✅ **Completed**:
- Backend CSRF middleware
- Token endpoint
- Frontend token management
- Automatic header injection
- Error handling & retry logic
- Type definitions
- Token auto-refresh
- Integration with existing auth system

## Next Steps (From Security Audit)

Following the priority order from the audit:

1. ✅ **Critical Priority** - Completed
   - ✅ JWT secret enforcement
   - ✅ Real authentication implementation
   - ✅ Admin RBAC
   - ✅ Remove hardcoded API keys

2. ✅ **High Priority** - Completed
   - ✅ MongoDB logging protection
   - ✅ Environment validation
   - ✅ Session management

3. ✅ **Medium Priority (CSRF)** - Completed
   - ✅ CSRF protection implementation

4. **Medium Priority (Remaining)**:
   - Implement refresh tokens for longer sessions
   - Add admin activity audit logging
   - Review CSP headers

5. **Low Priority**:
   - Enhance rate limiting configuration
   - Add more comprehensive input validation
   - Implement request signing
