import express from "express";
import cors from "cors";
// Replace the import below with the actual path to the module that exports your admin routes.
// Example: import adminRoutes from "./routes/admin";
// define a minimal admin router inline to avoid missing-module errors
import { Router } from "express";
const adminRoutes = Router();

// Example admin route; replace with your actual routes or restore the original import when the module exists
adminRoutes.get("/", (_req, res) => {
  res.json({ message: "Admin root - replace with your routes" });
});

const app = express();

// allow Vite dev server and local clients
app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json());

// mount your existing admin router
app.use("/admin", adminRoutes);

const PORT = Number(process.env.PORT ?? 4000);
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});