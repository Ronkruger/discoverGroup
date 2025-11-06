import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";

import adminToursRouter from "./routes/admin/tours";
import publicToursRouter from "./routes/public/tours";
import paymentsRouter from "./routes/payments";
import emailRouter from "./routes/email";
import authRouter from "./routes/auth";
import { connectDB } from "./db";
import path from "path";
import uploadsRouter from "./routes/uploads";

console.log("Server starting, environment variables:");
console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? "Available" : "Missing");
console.log("PORT:", process.env.PORT || "4000 (default)");

const app = express();
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
];

// Add production URLs from environment variables
if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);
if (process.env.ADMIN_URL) allowedOrigins.push(process.env.ADMIN_URL);

console.log('CORS Configuration:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Allowed origins:', allowedOrigins);

if (process.env.NODE_ENV === 'production') {
  // Production: Only allow specific origins
  app.use(cors({
    origin: (origin, callback) => {
      console.log('CORS request from origin:', origin);
      
      // Allow requests with no origin (like mobile apps, Postman, server-to-server)
      if (!origin) {
        console.log('No origin - allowing');
        return callback(null, true);
      }
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        console.log('Origin allowed');
        callback(null, true);
      } else {
        console.log('CORS BLOCKED! Origin not in allowed list');
        console.log('Allowed origins:', allowedOrigins);
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
    endpoints: ["/admin/tours", "/public/tours", "/api/create-payment-intent", "/health"],
  })
);


import adminUsersRouter from "./routes/admin/users";
import adminBookingsRouter from "./routes/admin/bookings";
import adminReportsRouter from "./routes/admin/reports";
import adminCustomerServiceRouter from "./routes/admin/customer-service";
import adminSettingsRouter from "./routes/admin/settings";
import adminDashboardRouter from "./routes/admin/dashboard";
import apiBookingsRouter from "./routes/api/bookings";
app.use("/admin/tours", adminToursRouter);
app.use("/admin/users", adminUsersRouter);
app.use("/admin/bookings", adminBookingsRouter);
app.use("/admin/reports", adminReportsRouter);
app.use("/admin/customer-service", adminCustomerServiceRouter);
app.use("/admin/settings", adminSettingsRouter);
app.use("/admin/dashboard", adminDashboardRouter);
app.use("/public/tours", publicToursRouter);
app.use("/api/bookings", apiBookingsRouter);
app.use("/api", paymentsRouter);
app.use("/api", emailRouter);
app.use("/auth", authRouter);

app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});