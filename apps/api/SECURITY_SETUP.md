# 🔒 API Security Setup Guide

## Critical Environment Variables

### JWT_SECRET (Required)

The `JWT_SECRET` is used to sign and verify authentication tokens. **This must be set before the API server will start.**

#### Generate a Secure JWT Secret

Run this command to generate a cryptographically secure 256-bit secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This will output something like:
```
a8f5f167f44f4964e6c998dee827110c056e92d5e95f7e9a8f5f167f44f4964e
```

#### Set in Environment

**For Local Development:**
1. Copy `.env.example` to `.env`
2. Replace the JWT_SECRET value with your generated secret:
   ```env
   JWT_SECRET=a8f5f167f44f4964e6c998dee827110c056e92d5e95f7e9a8f5f167f44f4964e
   ```

**For Production (Render/Railway/etc):**
1. Go to your hosting dashboard
2. Navigate to Environment Variables
3. Add `JWT_SECRET` with your generated value
4. **Never commit this to git!**

## Other Required Variables

### MONGODB_URI
Connection string for your MongoDB database.

**Local:**
```env
MONGODB_URI=mongodb://localhost:27017/discovergroup
```

**MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/discovergroup?retryWrites=true&w=majority
```

## Security Validation

The API server will validate environment variables on startup:

✅ **Passes if:**
- JWT_SECRET is set and >= 32 characters
- MONGODB_URI is set

❌ **Fails if:**
- JWT_SECRET is missing
- JWT_SECRET is too short (< 32 characters)
- MONGODB_URI is missing

## Authentication Flow

1. **User Registration** → Creates user account (requires email verification)
2. **Email Verification** → User clicks link → Account activated + JWT issued
3. **User Login** → Validates credentials → Issues JWT token
4. **Protected Routes** → Client sends `Authorization: Bearer <token>` header
5. **Token Verification** → Server validates JWT → Grants access

## Middleware Usage

### Protect Routes Requiring Authentication

```typescript
import { requireAuth } from '../middleware/auth';

router.get('/profile', requireAuth, async (req, res) => {
  // req.user is now available with authenticated user data
  res.json({ user: req.user });
});
```

### Protect Admin-Only Routes

```typescript
import { requireAuth, requireAdmin } from '../middleware/auth';

router.post('/admin/users', requireAuth, requireAdmin, async (req, res) => {
  // Only admins can access this route
});
```

### Protect Routes by Specific Role

```typescript
import { requireAuth, requireRole } from '../middleware/auth';

router.get('/booking-dept', requireAuth, requireRole('booking-dept', 'admin'), async (req, res) => {
  // Only booking department or admins can access
});
```

## Security Best Practices

### ✅ DO:
- Use strong, random JWT secrets (minimum 32 characters)
- Rotate JWT secrets periodically in production
- Use environment variables for all secrets
- Set token expiration (currently 7 days)
- Log suspicious authentication attempts
- Use HTTPS in production
- Validate user status (active, not archived) on each request

### ❌ DON'T:
- Commit secrets to git
- Use weak or predictable secrets
- Share JWT secrets between environments
- Store secrets in code
- Use same secret for dev and production
- Allow infinite token lifetimes

## Troubleshooting

### "CRITICAL: Missing required environment variables"
→ Set JWT_SECRET and MONGODB_URI in your `.env` file

### "JWT_SECRET must be at least 32 characters long"
→ Generate a new secret using the command above

### "Invalid token" errors
→ Ensure JWT_SECRET matches between token generation and verification
→ Check token hasn't expired (7 day default)

### "Authentication required" on valid requests
→ Verify Authorization header format: `Bearer <token>`
→ Check token is being sent from client
→ Verify JWT_SECRET is correctly set on server

## Token Expiration

Default token expiration: **7 days**

Users must login again after this period. Consider implementing refresh tokens for longer sessions in future updates.

## Support

For security issues or questions, contact the development team.
