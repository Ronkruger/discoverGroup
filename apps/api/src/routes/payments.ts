import express, { Request, Response } from "express";
import Stripe from "stripe";

console.log("Payments route loaded");

const router = express.Router();

// Initialize Stripe with secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
console.log("Stripe secret key length:", stripeSecretKey?.length || 0);
console.log("Stripe secret key prefix:", stripeSecretKey?.substring(0, 20) || "Not found");

if (!stripeSecretKey || stripeSecretKey === "sk_test_..." || stripeSecretKey.length < 100) {
  console.error("⚠️  Invalid or incomplete Stripe secret key detected!");
  console.error("Please check your .env file and ensure you have the complete secret key from Stripe Dashboard");
}

const stripe = new Stripe(stripeSecretKey || "sk_test_...");

type CreatePaymentIntentRequest = {
  amount: number; // in the smallest currency unit (centavos for PHP)
  currency: string; // e.g., "php"
  metadata?: Record<string, string>;
};

router.post("/create-payment-intent", async (req: Request, res: Response) => {
  try {
    console.log("Payment intent request received:", req.body);
    console.log("Stripe secret key available:", process.env.STRIPE_SECRET_KEY ? "Yes" : "No");
    
    const { amount, currency, metadata }: CreatePaymentIntentRequest = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log("Payment intent created successfully");
    res.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    
    let errorMessage = "Failed to create payment intent";
    let details = "Unknown error";
    
    if (error instanceof Error) {
      details = error.message;
      
      // Provide specific guidance for common Stripe errors
      if (error.message.includes("Invalid API Key")) {
        errorMessage = "Invalid Stripe API Key";
        details = "Please check your Stripe secret key in the .env file. Get the correct key from https://dashboard.stripe.com/apikeys";
      }
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: details,
      hint: "Check server logs for more information"
    });
  }
});

export default router;