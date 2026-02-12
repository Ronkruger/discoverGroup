import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

// Validate required environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ CRITICAL: STRIPE_SECRET_KEY is required but not set.');
  console.error('Please set STRIPE_SECRET_KEY in your .env file.');
  process.exit(1);
}

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// CORS configuration for production and development
const allowedOrigins = [
  "http://localhost:5173",
  "https://discovergroup.netlify.app",
  "https://admin--discovergrp.netlify.app"
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

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
  } catch (err: unknown) {
    console.error("Stripe error:", err);
    const message = err instanceof Error ? err.message : String(err ?? "Stripe error");
    res.status(500).json({ error: message });
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});