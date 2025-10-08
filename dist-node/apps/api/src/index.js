"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const tours_1 = __importDefault(require("./routes/admin/tours"));
const tours_2 = __importDefault(require("./routes/public/tours"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Root route: provide a small JSON response so GET / is useful in the browser
app.get("/", (_req, res) => res.json({
    message: "API running",
    endpoints: ["/admin/tours", "/public/tours", "/health"],
}));
app.use("/admin/tours", tours_1.default);
app.use("/public/tours", tours_2.default);
app.get("/health", (_req, res) => res.json({ ok: true }));
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
});
