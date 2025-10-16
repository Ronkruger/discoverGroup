import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";

import adminToursRouter from "./routes/admin/tours";
import publicToursRouter from "./routes/public/tours";
import paymentsRouter from "./routes/payments";
import emailRouter from "./routes/email";
import authRouter from "./routes/auth";
import { connectDB } from "./db";

console.log("Server starting, environment variables:");
console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? "Available" : "Missing");
console.log("PORT:", process.env.PORT || "4000 (default)");

const app = express();
connectDB();
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
  credentials: true
}));
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
import apiBookingsRouter from "./routes/api/bookings";
app.use("/admin/tours", adminToursRouter);
app.use("/admin/users", adminUsersRouter);
app.use("/admin/bookings", adminBookingsRouter);
app.use("/admin/reports", adminReportsRouter);
app.use("/admin/customer-service", adminCustomerServiceRouter);
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