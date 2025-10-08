"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Replace the import below with the actual path to the module that exports your admin routes.
// Example: import adminRoutes from "./routes/admin";
// define a minimal admin router inline to avoid missing-module errors
const express_2 = require("express");
const adminRoutes = (0, express_2.Router)();
// Example admin route; replace with your actual routes or restore the original import when the module exists
adminRoutes.get("/", (_req, res) => {
    res.json({ message: "Admin root - replace with your routes" });
});
const app = (0, express_1.default)();
// allow Vite dev server and local clients
app.use((0, cors_1.default)({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express_1.default.json());
// mount your existing admin router
app.use("/admin", adminRoutes);
const PORT = Number(process.env.PORT ?? 4000);
app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
});
