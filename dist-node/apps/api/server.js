"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
const stripe_1 = __importDefault(require("stripe"));
dotenv.config();
const app = (0, express_1.default)();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express_1.default.json());
app.post("/api/create-payment-intent", async (req, res) => {
    const { amount, currency, metadata } = req.body;
    if (typeof amount !== "number" || !currency || amount < 1) {
        return res.status(400).json({ error: "Invalid amount or currency" });
    }
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            metadata: metadata || {},
            payment_method_types: ["card"],
        });
        res.json({
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id,
        });
    }
    catch (err) {
        console.error("Stripe error:", err);
        const message = err instanceof Error ? err.message : String(err ?? "Stripe error");
        res.status(500).json({ error: message });
    }
});
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
});
