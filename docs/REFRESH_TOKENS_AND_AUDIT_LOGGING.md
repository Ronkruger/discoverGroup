# Refresh Tokens & Audit Logging Implementation

## Overview
Implemented refresh tokens for extended sessions and comprehensive audit logging for security monitoring. These are the final **Medium Priority** items from the security audit.

---

## 1. Refresh Tokens Implementation

### Purpose
- Extend user sessions without requiring re-login
- Reduce JWT exposure by using short-lived access tokens
- Enable token rotation for enhanced security
- Allow selective revocation of sessions

### Architecture

#### Token Types
1. **Access Token (JWT)**
   - Lifespan: **1 hour**
   - Stored in: localStorage
   - Used for: API authentication
   - Payload: `{ id, role }`

2. **Refresh Token**
   - Lifespan: **7 days**
   - Stored in: Database + localStorage
   - Used for: Generating new access tokens
   - Format: Secure random 40-byte hex string

### Backend Implementation

#### Database Model (`apps/api/src/models/RefreshToken.ts`)
```typescript
interface IRefreshToken {
  token: string;              // Unique secure random token
  userId: ObjectId;           // User reference
  expiresAt: Date;            // Expiration timestamp
  createdByIp: string;        // IP address for security tracking
  revokedAt?: Date;           // Revocation timestamp
  revokedByIp?: string;       // IP that revoked token
  revokedReason?: string;     // Reason for revocation
  replacedByToken?: string;   // Token that replaced this one
}
```

**Features**:
- Virtual properties: `isExpired`, `isRevoked`, `isActive`
- Automatic MongoDB TTL index for expired tokens cleanup
- Crypto-based secure token generation

#### Token Service (`apps/api/src/services/tokenService.ts`)
Centralized token management with:

**Core Functions**:
- `generateAccessToken()` - Create JWT with 1-hour expiry
- `generateRefreshToken()` - Create and store refresh token
- `generateTokenPair()` - Create both tokens together
- `refreshAccessToken()` - Rotate tokens (security best practice)
- `revokeRefreshToken()` - Revoke single token (logout)
- `revokeAllUserTokens()` - Revoke all user tokens (password change, security breach)
- `cleanupExpiredTokens()` - Maintenance function for old tokens

**Security Features**:
- **Token Rotation**: Old refresh token revoked when used, new one issued
- **IP Tracking**: Stores IP address for creation and revocation
- **Audit Trail**: Tracks token replacement chain
- **Automatic Cleanup**: MongoDB TTL index removes expired tokens

#### Auth Routes Updates (`apps/api/src/routes/auth.ts`)

**Modified Endpoints**:
- `POST /auth/login` - Returns both `accessToken` and `refreshToken`
- `GET /auth/verify-email` - Returns both tokens after verification
- `POST /auth/reset-password` - Revokes all refresh tokens for security

**New Endpoints**:
- `POST /auth/refresh-token` - Exchange refresh token for new token pair
  - Request: `{ refreshToken: string }`
  - Response: `{ accessToken: string, refreshToken: string }`
  - Rotates refresh token for security
  
- `POST /auth/logout` - Revoke refresh token
  - Request: `{ refreshToken: string }`
  - Response: `{ message: string }`
  - Gracefully handles errors (always returns 200)

### Frontend Implementation

#### Token Storage (`apps/admin/src/utils/tokenStorage.ts`)

**Updated Functions**:
- `setToken(accessToken, refreshToken?)` - Store both tokens with 1-hour expiry
- `getRefreshToken()` - Retrieve refresh token
- `clearToken()` - Clear both tokens

**Constants Updated**:
- `SESSION_TIMEOUT_MS`: Changed from 8 hours → **1 hour** (matches access token)
- Added `REFRESH_TOKEN_KEY` for refresh token storage

#### Auth Service (`apps/admin/src/services/authService.ts`)

**Updated Methods**:
- `login()` - Handles both tokens from login response
- `logout()` - Now async, revokes refresh token on server before clearing local storage

**New Method**:
- `refreshAccessToken()` - Automatically refreshes access token using refresh token
  - Returns `true` on success
  - Returns `false` and clears tokens on failure
  - Used by automatic refresh mechanism

#### Auth Context (`apps/admin/src/contexts/AuthContext.tsx`)

**Automatic Token Refresh**:
```typescript
useEffect(() => {
  if (!authState.isAuthenticated) return;

  const refreshInterval = setInterval(async () => {
    const success = await authService.refreshAccessToken();
    if (!success) {
      logout(); // Force logout if refresh fails
    }
  }, 50 * 60 * 1000); // Every 50 minutes (before 1-hour expiry)

  return () => clearInterval(refreshInterval);
}, [authState.isAuthenticated]);
```

**Benefits**:
- Tokens refresh automatically **every 50 minutes**
- User stays logged in as long as they have valid refresh token (7 days)
- Seamless experience - no interruptions
- Automatic logout if refresh fails (expired refresh token)

### Token Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ LOGIN                                                        │
├─────────────────────────────────────────────────────────────┤
│ 1. User enters credentials                                   │
│ 2. Server validates → generates tokens                       │
│    - Access Token (1h)                                       │
│    - Refresh Token (7d, stored in DB)                        │
│ 3. Frontend stores both tokens                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ AUTOMATIC REFRESH (every 50 minutes)                        │
├─────────────────────────────────────────────────────────────┤
│ 1. Frontend timer triggers refresh                          │
│ 2. Send refresh token to /auth/refresh-token                │
│ 3. Server validates refresh token:                          │
│    - Check if exists in DB                                  │
│    - Check not expired                                      │
│    - Check not revoked                                       │
│ 4. Server rotates tokens (security):                        │
│    - Revoke old refresh token                               │
│    - Generate new access token (1h)                          │
│    - Generate new refresh token (7d)                         │
│    - Save new refresh token in DB                            │
│ 5. Frontend stores new tokens                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ LOGOUT                                                       │
├─────────────────────────────────────────────────────────────┤
│ 1. User clicks logout                                        │
│ 2. Frontend sends refresh token to /auth/logout              │
│ 3. Server revokes token in database                          │
│ 4. Frontend clears all local tokens                          │
└─────────────────────────────────────────────────────────────┘
```

### Security Benefits

1. **Reduced Access Token Exposure**
   - Access tokens live only 1 hour (down from 7 days)
   - Shorter window for token theft exploitation

2. **Token Rotation**
   - Each refresh generates new refresh token
   - Old tokens immediately revoked
   - Prevents replay attacks

3. **Selective Revocation**
   - Can revoke individual sessions (logout)
   - Can revoke all user sessions (password change, security breach)
   - Database-backed revocation is immediate

4. **Audit Trail**
   - IP address tracking for token creation/revocation
   - Token replacement chain tracking
   - Revocation reasons logged

5. **Automatic Cleanup**
   - Expired tokens automatically deleted from database
   - Revoked tokens cleaned after 30 days
   - Maintains database performance

---

## 2. Audit Logging Implementation

### Purpose
- Track all admin actions for security monitoring
- Maintain compliance audit trail
- Detect suspicious activity patterns
- Debug and troubleshoot issues

### Database Model (`apps/api/src/models/AuditLog.ts`)

```typescript
interface IAuditLog {
  userId: ObjectId;           // Admin who performed action
  userEmail: string;          // Email for easy filtering
  userName: string;           // Display name
  action: string;             // CREATE | READ | UPDATE | DELETE | LOGIN | LOGOUT | ACCESS_DENIED
  resource: string;           // tours, users, bookings, etc.
  resourceId?: string;        // Specific resource ID
  method: string;             // GET | POST | PUT | PATCH | DELETE
  path: string;               // Full request path
  statusCode: number;         // HTTP status code
  ipAddress?: string;         // Client IP address
  userAgent?: string;         // Browser/client info
  changes?: {                 // For UPDATE/DELETE actions
    before?: object;
    after?: object;
  };
  errorMessage?: string;      // For failed requests
  duration?: number;          // Request processing time (ms)
  timestamp: Date;            // Action timestamp
}
```

**Features**:
- Compound indexes for fast queries
- Auto-expire after **90 days** (configurable)
- Captures full context of each action

### Audit Middleware (`apps/api/src/middleware/auditLog.ts`)

**Main Middleware**: `auditLog()`
- Automatically logs all admin actions
- Captures request/response data
- Measures request duration
- Handles errors gracefully (doesn't break requests)

**Key Functions**:
- `getActionFromMethod()` - Maps HTTP method to action type
- `extractResource()` - Parses resource name from path
- `extractResourceId()` - Extracts MongoDB ObjectId from path
- `logSecurityEvent()` - Log authentication events (login, logout, access denied)

**Integration** (`apps/api/src/index.ts`):
```typescript
// Applied to all admin routes
app.use('/admin/', auditLog);
```

**What Gets Logged**:
- ✅ All admin route requests (GET, POST, PUT, PATCH, DELETE)
- ✅ User identification (ID, email, name)
- ✅ Resource and action performed
- ✅ Success/failure status
- ✅ Error messages for failures
- ✅ IP address and user agent
- ✅ Request processing time

### Admin Endpoints (`apps/api/src/routes/admin/audit-logs.ts`)

#### 1. Get Audit Logs (with filtering & pagination)
```
GET /admin/audit-logs?page=1&limit=50&userId=xxx&action=UPDATE&resource=tours&startDate=2026-01-01&endDate=2026-02-12&statusCode=200
```

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50)
- `userId` - Filter by user
- `action` - Filter by action type
- `resource` - Filter by resource
- `startDate` - Filter by date range start
- `endDate` - Filter by date range end
- `statusCode` - Filter by HTTP status

**Response**:
```json
{
  "logs": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1234,
    "totalPages": 25
  }
}
```

#### 2. Get Audit Statistics
```
GET /admin/audit-logs/stats?startDate=2026-01-01&endDate=2026-02-12
```

**Response**:
```json
{
  "totalLogs": 5432,
  "breakdown": {
    "byAction": [
      { "_id": "READ", "count": 3000 },
      { "_id": "UPDATE", "count": 1500 },
      ...
    ],
    "byResource": [...],
    "byStatus": [...]
  },
  "topUsers": [
    { "_id": "userId", "count": 500, "userName": "Admin" }
  ],
  "recentErrors": [...]
}
```

#### 3. Get User-Specific Logs
```
GET /admin/audit-logs/user/:userId?page=1&limit=50
```

Shows all actions by a specific admin user.

#### 4. Get Single Audit Log
```
GET /admin/audit-logs/:id
```

Full details of a specific audit log entry.

#### 5. Cleanup Old Logs
```
DELETE /admin/audit-logs/cleanup?olderThanDays=90
```

Manually trigger cleanup of old audit logs (admin maintenance).

### Use Cases

#### Security Monitoring
```
// Find all failed authentication attempts
GET /admin/audit-logs?action=ACCESS_DENIED&limit=100

// Find all DELETE operations in last 7 days
GET /admin/audit-logs?action=DELETE&startDate=2026-02-05

// Check suspicious activity from specific user
GET /admin/audit-logs/user/userId123
```

#### Compliance & Auditing
```
// Generate monthly activity report
GET /admin/audit-logs/stats?startDate=2026-01-01&endDate=2026-01-31

// Track changes to critical resources
GET /admin/audit-logs?resource=users&action=UPDATE

// View all actions by resource
GET /admin/audit-logs?resource=bookings
```

#### Troubleshooting
```
// Find recent errors
GET /admin/audit-logs?statusCode=500&limit=20

// Check specific operation
GET /admin/audit-logs/:logId

// View all operations on a specific resource
GET /admin/audit-logs?resourceId=tourId123
```

### Auto-Cleanup

**Strategy**: MongoDB TTL Index
- Automatically deletes logs older than **90 days**
- Runs periodically in background
- No manual intervention needed
- Configurable retention period

**Manual Cleanup**:
```bash
# Keep only last 30 days
DELETE /admin/audit-logs/cleanup?olderThanDays=30
```

---

## Complete Security Stack Summary

### ✅ Critical Priority (Completed)
1. JWT secret enforcement with startup validation
2. Real JWT authentication with database verification
3. Admin role-based access control (RBAC)
4. Removed hardcoded API keys

### ✅ High Priority (Completed)
5. MongoDB connection string protection
6. Enhanced environment validation
7. Admin panel session management (8-hour timeout)

### ✅ Medium Priority (Completed)
8. CSRF protection with double-submit cookies
9. **Refresh tokens for extended sessions (NEW)**
10. **Admin activity audit logging (NEW)**

### Security Middleware Stack (Order)
```
1. Helmet (security headers)
2. CORS (cross-origin policy)
3. Rate limiting (100 req/15min)
4. Cookie parser
5. CSRF protection (conditional)
6. SQL injection protection
7. MongoDB sanitization
8. Parameter pollution prevention
9. Speed limiter (progressive delay)
10. Request size limiter (10MB max)
11. Suspicious activity logger
12. Audit logging (/admin/ routes)
13. Authentication (requireAuth)
14. Authorization (requireAdmin)
```

## Files Created/Modified

### Refresh Tokens:
- `apps/api/src/models/RefreshToken.ts` (NEW)
- `apps/api/src/services/tokenService.ts` (NEW)
- `apps/api/src/routes/auth.ts` (UPDATED - 4 endpoints modified)
- `apps/admin/src/utils/tokenStorage.ts` (UPDATED)
- `apps/admin/src/services/authService.ts` (UPDATED)
- `apps/admin/src/contexts/AuthContext.tsx` (UPDATED)

### Audit Logging:
- `apps/api/src/models/AuditLog.ts` (NEW)
- `apps/api/src/middleware/auditLog.ts` (NEW)
- `apps/api/src/routes/admin/audit-logs.ts` (NEW)
- `apps/api/src/index.ts` (UPDATED)

## Testing Checklist

### Refresh Tokens
- [ ] Login creates both tokens
- [ ] Access token expires after 1 hour
- [ ] Refresh token works before expiry
- [ ] Automatic refresh triggers every 50 minutes
- [ ] Logout revokes refresh token
- [ ] Password reset revokes all tokens
- [ ] Expired refresh token forces logout
- [ ] Token rotation creates new tokens

### Audit Logging
- [ ] All admin GET requests logged
- [ ] All admin POST/PUT/PATCH/DELETE requests logged
- [ ] User information captured correctly
- [ ] Resource and action identified properly
- [ ] Error messages logged for failures
- [ ] Filtering by user/action/resource works
- [ ] Statistics endpoint returns accurate data
- [ ] Auto-cleanup after 90 days
- [ ] Manual cleanup works

## Monitoring Recommendations

### Database Indexes
Monitor query performance on:
- `RefreshToken`: `{ token: 1 }`, `{ userId: 1 }`, `{ expiresAt: 1 }`
- `AuditLog`: `{ userId: 1, timestamp: -1 }`, `{ resource: 1, action: 1 }`

### Metrics to Track
- **Refresh Token Usage**:
  - Active tokens per user
  - Token rotation frequency
  - Failed refresh attempts
  - Revocation reasons distribution

- **Audit Logs**:
  - Actions per admin per day
  - Error rate by endpoint
  - Most modified resources
  - Failed authentication attempts

### Alerts to Configure
- Multiple failed refresh token attempts (possible attack)
- High rate of ACCESS_DENIED actions
- Unusual DELETE operations
- Admin actions outside business hours
- Sudden spike in error rates

## Next Steps (Optional Enhancements)

### Low Priority Items from Audit:
- Enhanced rate limiting (per-user limits)
- More comprehensive input validation
- Request signing for critical operations
- CSP header refinements

### Future Improvements:
- Audit log dashboard UI in admin panel
- Real-time security alerts
- Export audit logs to external SIEM
- Refresh token device tracking (multi-device sessions)
- Suspicious activity auto-blocking
