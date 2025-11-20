import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import logger from "./utils/logger";
import { errorHandler } from "./middleware/errorHandler";

import adminToursRouter from "./routes/admin/tours";
import publicToursRouter from "./routes/public/tours";
import emailRouter from "./routes/email";
import authRouter from "./routes/auth";
import { connectDB } from "./db";
import path from "path";
import uploadsRouter from "./routes/uploads";

logger.info("Server starting, environment variables:");
logger.info(`PORT: ${process.env.PORT || "4000 (default)"}`);

const app = express();

// Security middleware
app.use(helmet());

connectDB();
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use("/api/uploads", uploadsRouter);

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
  'https://admin--discovergrp.netlify.app',  // Admin production
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
app.use(express.json());

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
import apiBookingsRouter from "./routes/api/bookings";
import favoritesRouter from "./routes/favorites";
import reviewsRouter from "./routes/reviews";
import homepageSettingsRouter from "./routes/homepage-settings";
import countriesRouter from "./routes/countries";
app.use("/admin/tours", adminToursRouter);
app.use("/admin/users", adminUsersRouter);
app.use("/admin/bookings", adminBookingsRouter);
app.use("/admin/reports", adminReportsRouter);
app.use("/admin/customer-service", adminCustomerServiceRouter);
app.use("/admin/settings", adminSettingsRouter);
app.use("/admin/dashboard", adminDashboardRouter);
app.use("/public/tours", publicToursRouter);
app.use("/api/bookings", apiBookingsRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/homepage-settings", homepageSettingsRouter);
app.use("/api/countries", countriesRouter);
app.use("/api", emailRouter);
app.use("/auth", authRouter);

app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`✅ API server listening on http://localhost:${PORT}`);
});