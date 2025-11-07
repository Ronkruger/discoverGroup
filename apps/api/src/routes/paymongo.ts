import express, { Request, Response } from "express";
import fetch from "node-fetch";

const router = express.Router();

// PayMongo API Configuration
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY || '';
const PAYMONGO_API_BASE = 'https://api.paymongo.com/v1';

// Helper to create Basic Auth header
function getPayMongoAuthHeader(): string {
  return `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`;
}

/**
 * POST /api/paymongo/payment-intent
 * Create a PayMongo payment intent
 */
router.post('/payment-intent', async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'PHP', description, metadata } = req.body;

    if (!amount || amount < 10000) {
      return res.status(400).json({ error: 'Amount must be at least PHP 100.00 (10000 centavos)' });
    }

    if (!PAYMONGO_SECRET_KEY) {
      console.error('❌ PAYMONGO_SECRET_KEY not configured');
      return res.status(500).json({ error: 'PayMongo not configured on server' });
    }

    console.log('💳 Creating PayMongo payment intent:', { amount, currency, description });

    const response = await fetch(`${PAYMONGO_API_BASE}/payment_intents`, {
      method: 'POST',
      headers: {
        'Authorization': getPayMongoAuthHeader(),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount,
            currency: currency.toUpperCase(),
            payment_method_allowed: ['card', 'paymaya'],
            description: description || 'Tour Booking Payment',
            statement_descriptor: 'DISCOVERGRP',
            metadata: metadata || {},
          }
        }
      })
    });

    const data = await response.json() as {
      data?: { id: string; attributes: Record<string, unknown> };
      errors?: Array<{ detail: string }>;
    };

    if (!response.ok) {
      console.error('❌ PayMongo API error:', data);
      return res.status(response.status).json({ 
        error: data.errors?.[0]?.detail || 'Failed to create payment intent' 
      });
    }

    console.log('✅ Payment intent created:', data.data?.id);

    // Return formatted response
    return res.json({
      id: data.data?.id,
      clientKey: data.data?.attributes.client_key,
      status: data.data?.attributes.status,
      amount: data.data?.attributes.amount,
      currency: data.data?.attributes.currency,
    });

  } catch (error: unknown) {
    console.error('❌ Payment intent creation error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
});

/**
 * POST /api/paymongo/payment-method
 * Create a PayMongo payment method
 */
router.post('/payment-method', async (req: Request, res: Response) => {
  try {
    const { type, details } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'Payment method type is required' });
    }

    if (!PAYMONGO_SECRET_KEY) {
      return res.status(500).json({ error: 'PayMongo not configured on server' });
    }

    console.log('💳 Creating PayMongo payment method:', type);

    const payload: {
      data: {
        attributes: {
          type: string;
          details: Record<string, unknown>;
          billing?: Record<string, unknown>;
        };
      };
    } = {
      data: {
        attributes: {
          type,
          details: {},
        }
      }
    };

    // Card payment method
    if (type === 'card' && details) {
      payload.data.attributes.details = {
        card_number: details.cardNumber?.replace(/\s/g, ''),
        exp_month: details.expMonth,
        exp_year: details.expYear,
        cvc: details.cvc,
      };
      
      if (details.billingName || details.billingEmail || details.billingPhone) {
        payload.data.attributes.billing = {
          name: details.billingName,
          email: details.billingEmail,
          phone: details.billingPhone,
        };
      }
    }

    const response = await fetch(`${PAYMONGO_API_BASE}/payment_methods`, {
      method: 'POST',
      headers: {
        'Authorization': getPayMongoAuthHeader(),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json() as {
      data?: { id: string; attributes: Record<string, unknown> };
      errors?: Array<{ detail: string }>;
    };

    if (!response.ok) {
      console.error('❌ PayMongo payment method error:', data);
      return res.status(response.status).json({ 
        error: data.errors?.[0]?.detail || 'Failed to create payment method' 
      });
    }

    console.log('✅ Payment method created:', data.data?.id);

    return res.json({
      id: data.data?.id,
      type: data.data?.attributes.type,
      status: 'active',
    });

  } catch (error: unknown) {
    console.error('❌ Payment method creation error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
});

/**
 * POST /api/paymongo/attach
 * Attach payment method to payment intent
 */
router.post('/attach', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;

    if (!paymentIntentId || !paymentMethodId) {
      return res.status(400).json({ error: 'Payment intent ID and payment method ID are required' });
    }

    if (!PAYMONGO_SECRET_KEY) {
      return res.status(500).json({ error: 'PayMongo not configured on server' });
    }

    console.log('🔗 Attaching payment method to intent:', { paymentIntentId, paymentMethodId });

    const response = await fetch(
      `${PAYMONGO_API_BASE}/payment_intents/${paymentIntentId}/attach`,
      {
        method: 'POST',
        headers: {
          'Authorization': getPayMongoAuthHeader(),
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          data: {
            attributes: {
              payment_method: paymentMethodId,
              return_url: process.env.CLIENT_URL || 'https://discovergrp.netlify.app',
            }
          }
        })
      }
    );

    const data = await response.json() as {
      data?: { id: string; attributes: Record<string, unknown> };
      errors?: Array<{ detail: string }>;
    };

    if (!response.ok) {
      console.error('❌ PayMongo attach error:', data);
      return res.status(response.status).json({ 
        error: data.errors?.[0]?.detail || 'Failed to attach payment method' 
      });
    }

    console.log('✅ Payment method attached:', data.data?.attributes.status);

    const result: {
      status: unknown;
      nextAction?: {
        type: unknown;
        redirect: unknown;
      };
    } = {
      status: data.data?.attributes.status,
    };

    // Check if there's a next action (e.g., redirect for 3D Secure)
    const nextAction = data.data?.attributes.next_action as { type?: unknown; redirect?: unknown } | undefined;
    if (nextAction) {
      result.nextAction = {
        type: nextAction.type,
        redirect: nextAction.redirect,
      };
    }

    return res.json(result);

  } catch (error: unknown) {
    console.error('❌ Payment attachment error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
});

/**
 * GET /api/paymongo/verify/:paymentIntentId
 * Verify payment status
 */
router.get('/verify/:paymentIntentId', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.params;

    if (!PAYMONGO_SECRET_KEY) {
      return res.status(500).json({ error: 'PayMongo not configured on server' });
    }

    console.log('🔍 Verifying payment:', paymentIntentId);

    const response = await fetch(
      `${PAYMONGO_API_BASE}/payment_intents/${paymentIntentId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': getPayMongoAuthHeader(),
          'Accept': 'application/json',
        },
      }
    );

    const data = await response.json() as {
      data?: { id: string; attributes: Record<string, unknown> };
      errors?: Array<{ detail: string }>;
    };

    if (!response.ok) {
      console.error('❌ PayMongo verification error:', data);
      return res.status(response.status).json({ 
        error: data.errors?.[0]?.detail || 'Verification failed' 
      });
    }

    const status = data.data?.attributes.status;
    const paid = status === 'succeeded' || status === 'awaiting_payment_method';

    console.log('✅ Payment verified:', status, paid ? '(paid)' : '(unpaid)');

    return res.json({
      status,
      paid,
      amount: data.data?.attributes.amount,
      currency: data.data?.attributes.currency,
    });

  } catch (error: unknown) {
    console.error('❌ Verification error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
});

/**
 * GET /api/paymongo/payment-methods
 * Get available payment methods
 */
router.get('/payment-methods', async (_req: Request, res: Response) => {
  try {
    // Return available payment methods
    // In production, you might want to check which methods are enabled in your PayMongo account
    return res.json({
      methods: ['card', 'gcash', 'grab_pay', 'paymaya']
    });
  } catch (error: unknown) {
    console.error('❌ Payment methods fetch error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
});

/**
 * POST /api/paymongo/source
 * Create a PayMongo source for e-wallet payments (GCash, GrabPay)
 */
router.post('/source', async (req: Request, res: Response) => {
  try {
    const { type, amount, currency = 'PHP', redirect: redirectUrls } = req.body;

    if (!type || !amount) {
      return res.status(400).json({ error: 'Type and amount are required' });
    }

    if (!['gcash', 'grab_pay'].includes(type)) {
      return res.status(400).json({ error: 'Invalid source type. Must be gcash or grab_pay' });
    }

    if (!PAYMONGO_SECRET_KEY) {
      return res.status(500).json({ error: 'PayMongo not configured on server' });
    }

    console.log('🔗 Creating PayMongo source:', { type, amount, currency });

    const response = await fetch(`${PAYMONGO_API_BASE}/sources`, {
      method: 'POST',
      headers: {
        'Authorization': getPayMongoAuthHeader(),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        data: {
          attributes: {
            type,
            amount,
            currency: currency.toUpperCase(),
            redirect: {
              success: redirectUrls?.success || `${process.env.CLIENT_URL}/booking/success`,
              failed: redirectUrls?.failed || `${process.env.CLIENT_URL}/booking/failed`,
            },
          }
        }
      })
    });

    const data = await response.json() as {
      data?: { id: string; attributes: Record<string, unknown> };
      errors?: Array<{ detail: string }>;
    };

    if (!response.ok) {
      console.error('❌ PayMongo source error:', data);
      return res.status(response.status).json({ 
        error: data.errors?.[0]?.detail || 'Failed to create source' 
      });
    }

    console.log('✅ Source created:', data.data?.id);

    const redirectData = data.data?.attributes.redirect as { checkout_url?: string } | undefined;

    return res.json({
      id: data.data?.id,
      checkoutUrl: redirectData?.checkout_url,
      status: data.data?.attributes.status,
    });

  } catch (error: unknown) {
    console.error('❌ Source creation error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
});

/**
 * POST /api/paymongo/webhook
 * Handle PayMongo webhooks
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const event = req.body;

    console.log('📨 PayMongo webhook received:', event.data?.attributes?.type);

    // Handle different event types
    switch (event.data?.attributes?.type) {
      case 'payment.paid':
        console.log('✅ Payment confirmed:', event.data.attributes.data.id);
        // TODO: Update booking status in database
        break;
      
      case 'payment.failed':
        console.log('❌ Payment failed:', event.data.attributes.data.id);
        // TODO: Update booking status in database
        break;
      
      case 'source.chargeable':
        console.log('⚡ Source chargeable:', event.data.attributes.data.id);
        // TODO: Create charge for the source
        break;
      
      default:
        console.log('ℹ️ Unhandled webhook type:', event.data?.attributes?.type);
    }

    // Always return 200 to acknowledge receipt
    return res.status(200).json({ received: true });

  } catch (error: unknown) {
    console.error('❌ Webhook processing error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
});

export default router;
