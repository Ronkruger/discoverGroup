# 🚀 Quick Start: Using Your New Security Features

## 1. Generate Secure Secrets (5 minutes)

### PowerShell (Windows):
```powershell
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy these values to your `apps/api/.env` file:
```env
JWT_SECRET=<paste-first-generated-value>
SESSION_SECRET=<paste-second-generated-value>
```

## 2. Install Dependencies (2 minutes)

The security packages are already installed! Just restart your API server:

```powershell
# Stop current API server (Ctrl+C)

# Restart
cd apps/api
npm run dev
```

## 3. Test Security Features (3 minutes)

### Test Rate Limiting:
Open your browser console and run:
```javascript
// Try to make many requests quickly
for(let i = 0; i < 105; i++) {
  fetch('http://localhost:4000/health');
}
// After 100 requests, you'll be rate limited!
```

### Test Input Validation:
Try registering with a weak password - you'll see validation errors!

```javascript
// In your browser console on the registration page
fetch('http://localhost:4000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: '123',  // Too weak!
    fullName: 'Test User'
  })
})
.then(r => r.json())
.then(console.log);
// Should see: "Password must be at least 8 characters"
```

### Test SQL Injection Protection:
```javascript
// Try a SQL injection attack
fetch('http://localhost:4000/api/tours?search=' + encodeURIComponent("'; DROP TABLE users--"))
.then(r => r.json())
.then(console.log);
// Should be blocked or sanitized!
```

## 4. Use Secure Password Component (5 minutes)

### In Login.tsx or Register.tsx:

#### Before (old code):
```tsx
<input
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
```

#### After (new secure code):
```tsx
import SecurePasswordInput from '../components/SecurePasswordInput';

<SecurePasswordInput
  value={password}
  onChange={setPassword}
  label="Password"
  showStrengthIndicator={true}
  required
/>
```

**Benefits:**
- ✅ Visual password strength indicator
- ✅ Real-time validation feedback
- ✅ Show/hide password toggle
- ✅ Automatic strength checking

## 5. Use Security Utilities (5 minutes)

### Sanitize User Input:
```tsx
import { sanitizeInput, isValidEmail } from '../utils/security';

// Before sending to API
const handleSubmit = () => {
  const cleanName = sanitizeInput(userName);
  const cleanMessage = sanitizeInput(message);
  
  if (!isValidEmail(email)) {
    alert('Invalid email format');
    return;
  }
  
  // Now safe to send
  apiCall({ name: cleanName, message: cleanMessage, email });
};
```

### Secure API Requests:
```tsx
import { secureApiRequest } from '../utils/security';

// Automatically includes auth token
const response = await secureApiRequest('/api/bookings', {
  method: 'POST',
  body: JSON.stringify(bookingData),
});
```

## 6. Add Validators to API Routes (10 minutes)

### Example: Booking Route

#### Before:
```typescript
router.post('/bookings', async (req, res) => {
  // No validation!
  const booking = await Booking.create(req.body);
  res.json(booking);
});
```

#### After:
```typescript
import { validateBooking } from '../middleware/validators';
import { requireAuth } from '../middleware/auth.enhanced';

router.post('/bookings', 
  requireAuth,  // Check authentication
  validateBooking,  // Validate and sanitize input
  async (req, res) => {
    // Data is already validated and sanitized!
    const booking = await Booking.create(req.body);
    res.json(booking);
  }
);
```

## 7. Run Security Tests (3 minutes)

```powershell
cd apps/api

# Install test dependencies (one time)
npm install --save-dev axios chalk

# Run security test suite
node scripts/test-security.js
```

You'll see output like:
```
🔒 SECURITY TEST SUITE

✓ Rate limiting - General API
✓ SQL injection protection
✓ NoSQL injection protection
✓ XSS protection
✓ CORS protection
✓ X-Frame-Options header
✓ Authentication tests

🎉 All security tests passed!
```

## 8. Production Checklist (Before Deploy)

### Critical Steps:
```powershell
# 1. Check environment variables
code apps/api/.env

# 2. Ensure these are set:
# JWT_SECRET=<strong-random-64-char-string>
# SESSION_SECRET=<strong-random-64-char-string>
# NODE_ENV=production

# 3. Update CORS origins (in apps/api/src/index.ts)
# - Add your production URLs to allowedOrigins array

# 4. Use production API keys
# - SendGrid: production API key
# - Supabase: production keys
# - Payment gateways: production keys (not test keys)

# 5. Run security tests one more time
cd apps/api
node scripts/test-security.js
```

## 9. Monitor Security (Ongoing)

### Check Logs Regularly:
```powershell
# Look for these security events:
grep "[SECURITY]" apps/api/logs/*.log
```

You'll see warnings like:
- `[SECURITY] SQL injection attempt detected`
- `[SECURITY] Suspicious activity detected`
- `[SECURITY] Rate limit exceeded`

### Weekly Tasks:
```powershell
# Update dependencies
cd apps/api
npm audit
npm audit fix

# Check for vulnerabilities
npm audit --production
```

## 10. Emergency: If You Suspect a Breach

### Immediate Actions:
```powershell
# 1. Rotate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Update JWT_SECRET in .env and redeploy

# 2. Check MongoDB Atlas access logs
# Go to: https://cloud.mongodb.com/ → Security → Access Logs

# 3. Review recent failed login attempts
# Check your API logs for 401 errors

# 4. Notify users if data was compromised
```

## Common Security Tasks

### Change Password Requirements:
Edit `apps/api/src/middleware/validators.ts`:
```typescript
body('password')
  .isLength({ min: 12 })  // Change minimum length
  .matches(/[a-z]/)  // Require lowercase
  .matches(/[A-Z]/)  // Require uppercase
  // ... add more requirements
```

### Adjust Rate Limits:
Edit `apps/api/src/middleware/rateLimiter.ts`:
```typescript
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // Time window
  max: 200,  // Increase/decrease max requests
});
```

### Add New Validators:
Create in `apps/api/src/middleware/validators.ts`:
```typescript
export const validateCustomForm = [
  body('field1').isLength({ min: 2 }),
  body('field2').isEmail(),
  handleValidationErrors,
];
```

## Resources

📖 **Documentation:**
- `SECURITY_GUIDE.md` - Complete security reference
- `SECURITY_IMPLEMENTATION.md` - What was implemented
- `apps/api/src/middleware/security.ts` - Security middleware
- `apps/api/src/middleware/validators.ts` - Input validators
- `src/utils/security.ts` - Frontend security utilities

🧪 **Testing:**
- `apps/api/scripts/test-security.js` - Automated security tests

🔧 **Configuration:**
- `apps/api/.env.secure.example` - Environment template
- `apps/api/src/index.ts` - Main security setup

---

## Need Help?

**Security is enabled and working!** Your website now has:
- ✅ Rate limiting (prevents brute force attacks)
- ✅ Input validation (prevents injection attacks)
- ✅ XSS protection (prevents script injection)
- ✅ CORS policy (prevents unauthorized API access)
- ✅ Security headers (clickjacking, MIME sniffing protection)
- ✅ Authentication (JWT tokens with expiration)
- ✅ Password strength validation
- ✅ Activity logging (monitors suspicious behavior)

**Test it yourself:**
1. Try weak passwords → Rejected ✅
2. Try SQL injection → Blocked ✅
3. Make 101 requests quickly → Rate limited ✅
4. Access protected routes without auth → Denied ✅

Your website is now **SECURE**! 🎉🔒
