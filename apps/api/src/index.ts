import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import logger from "./utils/logger";
import { errorHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";
import {
  sanitizeData,
  preventParameterPollution,
  speedLimiter,
  additionalSecurityHeaders,
  sqlInjectionProtection,
  suspiciousActivityLogger,
  requestSizeLimiter,
} from "./middleware/security";
import {
  csrfProtection,
  csrfErrorHandler,
  getCsrfToken,
  conditionalCsrfProtection,
} from "./middleware/csrf";
import auditLog from "./middleware/auditLog";

import adminToursRouter from "./routes/admin/tours";
import publicToursRouter from "./routes/public/tours";
import emailRouter from "./routes/email";
import authRouter from "./routes/auth";
import { connectDB } from "./db";
import path from "path";
import uploadsRouter from "./routes/uploads";
import uploadRouter from "./routes/upload";
import healthRouter from "./routes/health";

// CRITICAL: Validate required environment variables at startup
function validateEnvironment() {
  const required = ['JWT_SECRET', 'MONGODB_URI'];
  const recommended = ['SENDGRID_API_KEY', 'STRIPE_SECRET_KEY', 'FRONTEND_URL', 'CLIENT_URL'];
  
  const missing = required.filter(key => !process.env[key]);
  const missingRecommended = recommended.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    logger.error('❌ CRITICAL: Missing required environment variables:');
    missing.forEach(key => logger.error(`   - ${key}`));
    logger.error('Server cannot start without these variables. Please check your .env file.');
    process.exit(1);
  }
  
  // Validate JWT_SECRET strength (at least 32 characters)
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    logger.error('❌ CRITICAL: JWT_SECRET must be at least 32 characters long for security.');
    logger.error('Generate a strong secret: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    process.exit(1);
  }
  
  // Warn about missing recommended variables
  if (missingRecommended.length > 0 && process.env.NODE_ENV === 'production') {
    logger.warn('⚠️  WARNING: Missing recommended environment variables for production:');
    missingRecommended.forEach(key => logger.warn(`   - ${key}`));
    logger.warn('Some features may not work properly without these.');
  }
  
  // Additional validation
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.FRONTEND_URL?.startsWith('https://')) {
      logger.warn('⚠️  WARNING: FRONTEND_URL should use HTTPS in production');
    }
    if (!process.env.CLIENT_URL?.startsWith('https://')) {
      logger.warn('⚠️  WARNING: CLIENT_URL should use HTTPS in production');
    }
  }
  
  logger.info('✅ Environment validation passed');
}

// Validate environment before starting
validateEnvironment();

logger.info("Server starting, environment variables:");
logger.info(`PORT: ${process.env.PORT || "4000 (default)"}`);
if (process.env.NODE_ENV === 'production') {
  logger.info('MONGODB_URI: [REDACTED FOR SECURITY]');
} else {
  logger.info(`MONGODB_URI: ${process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 30) + '...' : 'NOT SET'}`);
}

const app = express();

// Trust proxy - important for rate limiting behind reverse proxies (Netlify, Railway, etc.)
app.set('trust proxy', 1);

// Security middleware - Applied in order of importance
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow images from different origins
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
}));

// Additional security headers
app.use(additionalSecurityHeaders);

// Request size limiter (prevent large payloads)
app.use(requestSizeLimiter);

// Suspicious activity logger
app.use(suspiciousActivityLogger);

// SQL injection protection
app.use(sqlInjectionProtection);

// NoSQL injection protection (sanitize MongoDB queries)
app.use(sanitizeData);

// Prevent HTTP Parameter Pollution
app.use(preventParameterPollution);

// Speed limiter (progressive delay)
app.use(speedLimiter);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',  // Client dev
  'http://localhost:5174',  // Admin dev
  'http://localhost:5175',  // API dev
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'https://discovergroup.netlify.app',  // Client production (main)
  'https://discoverg.netlify.app',  // Client production (alternate)
  'https://discovergrp.netlify.app',  // Client production (alternate)
  'https://discover-grp.netlify.app',  // Client production (new repo)
  'https://admin--discovergrp.netlify.app',  // Admin production
  'https://admin-discoverg.netlify.app',  // Admin production (new repo)
  'https://admindiscovergrp.netlify.app',  // Admin production (alternate)
  'https://lambent-dodol-2486cc.netlify.app',  // Admin preview
];

// Add production URLs from environment variables
if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);
if (process.env.ADMIN_URL) allowedOrigins.push(process.env.ADMIN_URL);

logger.info('CORS Configuration:');
logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);
logger.info(`Allowed origins: ${allowedOrigins.join(', ')}`);

if (process.env.NODE_ENV === 'production') {
  // Production: Only allow specific origins
  app.use(cors({
    origin: (origin, callback) => {
      logger.http(`CORS request from origin: ${origin}`);
      
      // Allow requests with no origin (like mobile apps, Postman, server-to-server)
      if (!origin) {
        logger.http('No origin - allowing');
        return callback(null, true);
      }
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        logger.http('Origin allowed');
        callback(null, true);
      } else {
        logger.warn(`CORS BLOCKED! Origin not in allowed list: ${origin}`);
        logger.warn(`Allowed origins: ${allowedOrigins.join(', ')}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
} else {
  // Development: Allow any localhost origin
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman)
      if (!origin) return callback(null, true);
      try {
        const u = new URL(origin);
        if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return callback(null, true);
      } catch {
        // fallthrough
      }
      // fallback to deny
      callback(null, false);
    },
    credentials: true
  }));
}

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser (required for CSRF protection)
app.use(cookieParser());

// Apply general rate limiter to all API routes
app.use('/api/', apiLimiter);
app.use('/admin/', apiLimiter);

// CSRF token generation endpoint (must be before CSRF protection)
app.get('/api/csrf-token', csrfProtection, getCsrfToken);

// Apply CSRF protection to admin routes (state-changing operations)
// Note: Conditionally applied - GET requests don't need CSRF
app.use('/admin/', conditionalCsrfProtection);
app.use('/api/', conditionalCsrfProtection);

// Apply audit logging to all admin routes
app.use('/admin/', auditLog);

app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use("/api/uploads", uploadsRouter);
app.use("/api/upload", uploadRouter);

// Root route: provide a small JSON response so GET / is useful in the browser
app.get("/", (_req: Request, res: Response) =>
  res.json({
    message: "API running",
    endpoints: ["/admin/tours", "/public/tours", "/health"],
  })
);

import adminUsersRouter from "./routes/admin/users";
import adminBookingsRouter from "./routes/admin/bookings";
import adminReportsRouter from "./routes/admin/reports";
import adminCustomerServiceRouter from "./routes/admin/customer-service";
import adminSettingsRouter from "./routes/admin/settings";
import adminDashboardRouter from "./routes/admin/dashboard";
import adminReviewsRouter from "./routes/admin/reviews";
import adminAuditLogsRouter from "./routes/admin/audit-logs";
import adminFeaturedVideosRouter from "./routes/admin/featured-videos";
import apiBookingsRouter from "./routes/api/bookings";
import apiReviewsRouter from "./routes/api/reviews";
import favoritesRouter from "./routes/favorites";
// Reviews are now handled by api/reviews and admin/reviews routes
import homepageSettingsRouter from "./routes/homepage-settings";
import countriesRouter from "./routes/countries";
import promoBannerRouter from "./routes/promoBanner";
import featuredVideosRouter from "./routes/featured-videos";

app.use("/admin/tours", adminToursRouter);
app.use("/admin/users", adminUsersRouter);
app.use("/admin/bookings", adminBookingsRouter);
app.use("/admin/reports", adminReportsRouter);
app.use("/admin/customer-service", adminCustomerServiceRouter);
app.use("/admin/settings", adminSettingsRouter);
app.use("/admin/dashboard", adminDashboardRouter);
app.use("/admin/reviews", adminReviewsRouter);
app.use("/admin/audit-logs", adminAuditLogsRouter);
app.use("/admin/featured-videos", adminFeaturedVideosRouter);
app.use("/public/tours", publicToursRouter);
app.use("/api/bookings", apiBookingsRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/reviews", apiReviewsRouter);
app.use("/api/homepage-settings", homepageSettingsRouter);
app.use("/api/countries", countriesRouter);
app.use("/api/promo-banners", promoBannerRouter);
app.use("/api/featured-videos", featuredVideosRouter);
app.use("/api", emailRouter);
app.use("/auth", authRouter);

// Health check routes
app.use("/health", healthRouter);
app.get("/health-simple", (_req: Request, res: Response) => res.json({ ok: true }));

// CSRF error handler (before general error handler)
app.use(csrfErrorHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize server with async database connection
async function initializeServer() {
  try {
    // Connect to database before starting server
    await connectDB();
    logger.info("✅ Database connection successful");
    
    const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`✅ API server listening on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`❌ Failed to initialize server: ${errorMessage}`);
    process.exit(1);
  }
}

initializeServer();