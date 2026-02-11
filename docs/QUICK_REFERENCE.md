# 🚀 Quick Reference - New Features & Commands

## Testing

```bash
# Run all tests
npm test

# Watch mode (runs tests on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test -- Home.test.tsx
```

## Logging (API)

```typescript
import logger from './utils/logger';

// Info level (general information)
logger.info('User registered successfully');

// Warning level (potential issues)
logger.warn('API rate limit approaching');

// Error level (errors that need attention)
logger.error('Database connection failed');

// HTTP level (HTTP requests)
logger.http('GET /api/tours 200');

// Debug level (detailed debugging info)
logger.debug('Query params:', params);
```

**Log files location**:
- `apps/api/logs/error.log` - Errors only
- `apps/api/logs/combined.log` - All logs

## Error Handling (API)

```typescript
import { AppError, asyncHandler } from './middleware/errorHandler';

// Custom error with status code
throw new AppError('Tour not found', 404);
throw new AppError('Unauthorized', 401);
throw new AppError('Bad request', 400);

// Wrap async routes
router.get('/tours', asyncHandler(async (req, res) => {
  const tours = await Tour.find();
  res.json(tours);
}));
```

## Environment Validation

```typescript
import { validateEnv, apiEnvSchema, clientEnvSchema } from './.env.validation';

// Validate API environment
const env = validateEnv(apiEnvSchema, process.env);
// Will throw clear error if validation fails

// Validate client environment
const clientEnv = validateEnv(clientEnvSchema, import.meta.env);
```

## Rate Limiting

**Already applied to**:
- `/auth/register` - 5 requests per 15 minutes
- `/auth/login` - 5 requests per 15 minutes

**Available limiters**:
```typescript
import { 
  apiLimiter,      // 100 requests / 15 min
  authLimiter,     // 5 requests / 15 min
  emailLimiter,    // 3 emails / hour
  bookingLimiter   // 10 bookings / hour
} from './middleware/rateLimiter';

// Apply to route
router.post('/api/bookings', bookingLimiter, bookingHandler);
```

## Pre-commit Hooks

**Automatically runs on `git commit`**:
1. Runs all tests (`npm test`)
2. Lints staged files (`eslint --fix`)
3. Formats staged files (`prettier --write`)

**To skip hooks** (not recommended):
```bash
git commit --no-verify -m "Emergency fix"
```

## New Scripts

```bash
# Testing
npm test              # Run tests once
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report

# Development (unchanged)
npm run dev           # All apps
npm run dev:client    # Client only
npm run dev:admin     # Admin only
npm run dev:api       # API only

# Building (unchanged)
npm run build         # Client
npm run build:full    # Everything
```

## Security Headers (Helmet)

**Automatically applied** to all API routes:
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HSTS)
- And more...

No configuration needed - works out of the box!

## Writing Tests

### Component Test Example

```typescript
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(
      <BrowserRouter>
        <MyComponent />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### API Test Example

```typescript
import request from 'supertest';
import app from '../app';

describe('GET /api/tours', () => {
  it('returns list of tours', async () => {
    const response = await request(app)
      .get('/api/tours')
      .expect(200);
    
    expect(response.body).toBeInstanceOf(Array);
  });
});
```

## Debugging

### Check logs
```bash
# API logs
tail -f apps/api/logs/combined.log
tail -f apps/api/logs/error.log

# Client/Admin logs
# Check browser console
```

### Test environment validation
```bash
node -e "const { validateEnv, apiEnvSchema } = require('./.env.validation'); validateEnv(apiEnvSchema, process.env);"
```

## Common Issues & Fixes

### Issue: Tests failing
```bash
# Clear Jest cache
npx jest --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Rate limiter TypeScript errors
```bash
cd apps/api
npm dedupe
npm install express-rate-limit@latest
```

### Issue: Pre-commit hook failing
```bash
# Fix lint errors
npm run lint

# Run tests to see what's failing
npm test
```

### Issue: Logs not appearing
Check log level in `apps/api/src/utils/logger.ts`:
```typescript
level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn'
```

## Best Practices

### ✅ DO:
- Use `logger.info()` instead of `console.log()`
- Wrap async routes with `asyncHandler()`
- Write tests for new features
- Use `AppError` for operational errors
- Validate environment variables
- Apply rate limiting to sensitive endpoints

### ❌ DON'T:
- Don't commit without running tests
- Don't use `console.log()` in production code
- Don't expose stack traces in production
- Don't skip pre-commit hooks
- Don't hardcode secrets
- Don't forget to add tests

## Quick Checklist Before Commit

- [ ] Tests pass (`npm test`)
- [ ] No console.logs in code
- [ ] Environment variables validated
- [ ] Proper error handling
- [ ] Rate limiting on sensitive routes
- [ ] Logger used instead of console
- [ ] TypeScript errors fixed
- [ ] Documentation updated

## Need Help?

- Check `IMPROVEMENTS_SUMMARY.md` for detailed implementation info
- Check `README.md` for project documentation
- Check `ARCHITECTURE.txt` for system architecture
- Check individual files for inline documentation

## Quick Links

- [Testing Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Winston Logger](https://github.com/winstonjs/winston)
- [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)
- [Helmet Security](https://helmetjs.github.io/)
- [Zod Validation](https://zod.dev/)
- [Jest Testing](https://jestjs.io/)
- [Husky Git Hooks](https://typicode.github.io/husky/)

---

**Last Updated**: November 18, 2025  
**Version**: 1.0  
**Status**: Production Ready
