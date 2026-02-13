# Server Downtime and CSRF Token Issues - Fix Guide

## Problem Description

The admin application was experiencing network errors when trying to fetch CSRF tokens:
- `Failed to fetch CSRF token: TypeError: NetworkError when attempting to fetch resource`
- `Failed to initialize CSRF protection: TypeError: NetworkError when attempting to fetch resource`

## Root Cause Analysis

1. **API Server Downtime**: The backend API at `https://discovergroup.onrender.com` was not responding
2. **Free Tier Hosting**: Render.com free tier services go to sleep after periods of inactivity
3. **No Graceful Error Handling**: The frontend didn't handle server downtime gracefully
4. **Blocking CSRF Initialization**: Failed CSRF token fetch blocked the entire application

## Implemented Solutions

### 1. Enhanced CSRF Token Management (`apps/admin/src/utils/csrf.ts`)

- **Timeout Protection**: Added 10-second timeout to prevent hanging requests
- **Retry Logic**: Exponential backoff retry mechanism (3 attempts)
- **Better Error Messages**: Clear user-facing error messages explaining server status
- **Graceful Degradation**: App continues to function even if CSRF initialization fails

### 2. Server Status Monitoring (`apps/admin/src/utils/serverStatus.ts`)

- **Health Checks**: Automated server availability monitoring
- **Wake-Up Functionality**: Multiple simultaneous requests to wake up sleeping servers
- **Status Caching**: Avoids excessive health checks with 30-second cache
- **User Feedback**: Clear messaging about server status and response times

### 3. Enhanced Authentication Fetch (`apps/admin/src/utils/tokenStorage.ts`)

- **Server Status Integration**: Checks server health before making requests
- **Automatic Wake-Up**: Attempts to wake up sleeping servers before failing
- **Better Error Handling**: Specific error messages for network failures
- **CSRF Error Recovery**: Graceful handling when CSRF tokens are unavailable

### 4. User Interface Improvements (`apps/admin/src/components/ServerStatusBanner.tsx`)

- **Status Banner**: Visual notification when server is down
- **Manual Wake-Up**: Users can manually trigger server wake-up
- **Periodic Monitoring**: Automatic status checks every 30 seconds
- **Dismissible Notifications**: Users can hide the banner when needed

## How to Handle Future Server Issues

### For Developers

1. **Check Server Status**: Visit `/health` endpoint to verify API server status
2. **Monitor Logs**: Check browser console for specific error messages
3. **Manual Wake-Up**: Use the "Wake Up Server" button in the admin interface
4. **Local Development**: Use local API server for development when possible

### For Users

1. **Wait for Auto-Recovery**: The system will automatically attempt to wake up the server
2. **Manual Wake-Up**: Click the "Wake Up Server" button when the yellow banner appears
3. **Retry Operations**: Failed operations can be retried after the server wakes up
4. **Contact Support**: If issues persist, report to the development team

## Environment Variables

Ensure these environment variables are properly configured:

### Admin App (`.env.production`)
```env
VITE_API_URL=https://discovergroup.onrender.com
VITE_ADMIN_API_URL=https://discovergroup.onrender.com
```

### API Server
```env
FRONTEND_URL=https://discovergroup.netlify.app
ADMIN_URL=https://admin-discoverg.netlify.app
NODE_ENV=production
```

## Server Hosting Recommendations

### For Production Deployment

1. **Paid Hosting**: Consider upgrading to paid hosting plans that don't sleep
2. **Keep-Alive Services**: Use services like UptimeRobot to ping the server periodically
3. **Multiple Regions**: Deploy to multiple regions for better availability
4. **Health Monitoring**: Implement comprehensive health monitoring and alerting

### Free Tier Considerations

- **Sleep Behavior**: Free tier services sleep after 15-30 minutes of inactivity
- **Wake-Up Time**: Can take 30-60 seconds for services to wake up
- **User Experience**: Implement loading states and retry mechanisms

## Testing Server Status

```bash
# Test health endpoint
curl https://discovergroup.onrender.com/health

# Test CSRF token endpoint
curl https://discovergroup.onrender.com/api/csrf-token
```

## Monitoring and Alerting

1. **Set up monitoring** for the API endpoints
2. **Configure alerts** when the server is down for more than 5 minutes
3. **Implement logging** for server wake-up attempts and success rates
4. **Track metrics** on server response times and availability

## Future Improvements

1. **Service Worker**: Implement offline functionality for critical features
2. **Caching Strategy**: Cache non-critical data to reduce server dependencies
3. **Progressive Enhancement**: Build features that work without server connectivity
4. **Alternative Hosting**: Consider more reliable hosting options for production

## Troubleshooting Checklist

- [ ] Check API server health endpoint
- [ ] Verify environment variables are correct
- [ ] Test CSRF token endpoint directly
- [ ] Check browser network tab for specific errors
- [ ] Try manual server wake-up
- [ ] Clear browser cache and session storage
- [ ] Check for CORS configuration issues

## Contact Information

For server-related issues:
- Development Team: [dev-team@example.com]
- Infrastructure: [infrastructure@example.com]
- Emergency: [emergency@example.com]