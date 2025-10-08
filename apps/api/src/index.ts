import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import adminToursRouter from "./routes/admin/tours";
import publicToursRouter from "./routes/public/tours";
import paymentsRouter from "./routes/payments";

console.log("Server starting, environment variables:");
console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? "Available" : "Missing");
console.log("PORT:", process.env.PORT || "4000 (default)");

const app = express();
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
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

app.use("/admin/tours", adminToursRouter);
app.use("/public/tours", publicToursRouter);
app.use("/api", paymentsRouter);

app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});