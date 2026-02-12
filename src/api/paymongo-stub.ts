// PayMongo API Client
// Full implementation for PayMongo payment integration
// API Documentation: https://developers.paymongo.com/reference

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

type CreatePayMongoPaymentIntentRequest = {
  amount: number; // Amount in centavos (e.g., 100000 = PHP 1,000.00)
  currency: string; // Should be 'PHP'
  description?: string;
  metadata?: Record<string, string>;
};

type CreatePayMongoPaymentIntentResponse = {
  clientKey: string;
  id: string;
  status: string;
  amount: number;
  currency: string;
  nextAction?: {
    type: string;
    redirect?: {
      url: string;
      returnUrl: string;
    };
  };
};

type PayMongoPaymentMethod = 'card' | 'gcash' | 'grab_pay' | 'paymaya';

/**
 * Create a PayMongo payment intent via your backend API
 */
export async function createPayMongoPaymentIntent(
  payload: CreatePayMongoPaymentIntentRequest
): Promise<CreatePayMongoPaymentIntentResponse> {
  console.log('💳 Creating PayMongo payment intent...', {
    amount: payload.amount / 100,
    currency: payload.currency,
  });
  
  try {
    const endpoint = `${API_BASE_URL}/api/paymongo/payment-intent`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `PayMongo API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ PayMongo payment intent created:', data.id);
    return data;
    
  } catch (error) {
    console.error('❌ PayMongo payment intent creation failed:', error);
    throw error;
  }
}

/**
 * Create a PayMongo payment method (for card/e-wallet)
 */
export async function createPayMongoPaymentMethod(
  type: PayMongoPaymentMethod,
  details: {
    cardNumber?: string;
    expMonth?: number;
    expYear?: number;
    cvc?: string;
    billingName?: string;
    billingEmail?: string;
    billingPhone?: string;
  }
): Promise<{ id: string; type: string; status: string }> {
  console.log('💳 Creating PayMongo payment method...', { type });
  
  try {
    const endpoint = `${API_BASE_URL}/api/paymongo/payment-method`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ type, details }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `Failed to create payment method: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ PayMongo payment method created:', data.id);
    return data;
    
  } catch (error) {
    console.error('❌ PayMongo payment method creation failed:', error);
    throw error;
  }
}

/**
 * Attach payment method to payment intent
 */
export async function attachPaymentMethod(
  paymentIntentId: string,
  paymentMethodId: string
): Promise<{ status: string; nextAction?: { type: string; redirect?: { url: string } } }> {
  console.log('🔗 Attaching payment method to intent...', { paymentIntentId, paymentMethodId });
  
  try {
    const endpoint = `${API_BASE_URL}/api/paymongo/attach`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        paymentIntentId, 
        paymentMethodId,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `Failed to attach payment method: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Payment method attached:', data.status);
    return data;
    
  } catch (error) {
    console.error('❌ Payment method attachment failed:', error);
    throw error;
  }
}

/**
 * Verify a PayMongo payment status
 */
export async function verifyPayMongoPayment(
  paymentIntentId: string
): Promise<{ status: string; paid: boolean; amount?: number; currency?: string }> {
  console.log('🔍 Verifying PayMongo payment...', paymentIntentId);
  
  try {
    const endpoint = `${API_BASE_URL}/api/paymongo/verify/${encodeURIComponent(paymentIntentId)}`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `Verification failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Payment verified:', data.status, data.paid ? '(paid)' : '(unpaid)');
    return data;
    
  } catch (error) {
    console.error('❌ PayMongo verification failed:', error);
    throw error;
  }
}

/**
 * Get available payment methods from PayMongo
 */
export async function getPayMongoPaymentMethods(): Promise<PayMongoPaymentMethod[]> {
  console.log('📋 Fetching PayMongo payment methods...');
  
  try {
    const endpoint = `${API_BASE_URL}/api/paymongo/payment-methods`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      // Fallback to default methods if API fails
      console.warn('⚠️ Failed to fetch payment methods, using defaults');
      return ['card', 'gcash', 'grab_pay', 'paymaya'];
    }

    const data = await response.json();
    console.log('✅ Payment methods loaded:', data);
    return data.methods || ['card', 'gcash', 'grab_pay', 'paymaya'];
    
  } catch (error) {
    console.warn('⚠️ Payment methods fetch error, using defaults:', error);
    return ['card', 'gcash', 'grab_pay', 'paymaya'];
  }
}

/**
 * Create a PayMongo source (for e-wallet payments)
 */
export async function createPayMongoSource(
  type: 'gcash' | 'grab_pay',
  amount: number,
  redirectUrl: {
    success: string;
    failed: string;
  }
): Promise<{ id: string; checkoutUrl: string; status: string }> {
  console.log('🔗 Creating PayMongo source...', { type, amount: amount / 100 });
  
  try {
    const endpoint = `${API_BASE_URL}/api/paymongo/source`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        type,
        amount,
        currency: 'PHP',
        redirect: redirectUrl,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `Source creation failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ PayMongo source created:', data.id);
    return data;
    
  } catch (error) {
    console.error('❌ PayMongo source creation failed:', error);
    throw error;
  }
}
