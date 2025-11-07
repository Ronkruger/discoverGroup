// PayMongo API Client Stub
// TODO: Implement actual PayMongo API integration
// API Documentation: https://developers.paymongo.com/reference

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

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
  nextAction?: {
    type: string;
    redirect?: {
      url: string;
      returnUrl: string;
    };
  };
};

/**
 * Create a PayMongo payment intent via your backend API
 */
export async function createPayMongoPaymentIntent(
  payload: CreatePayMongoPaymentIntentRequest
): Promise<CreatePayMongoPaymentIntentResponse> {
  console.log('💳 PayMongo payment intent creation (not yet implemented)', payload);
  
  try {
    // TODO: Implement actual API call to your backend
    const endpoint = `${API_BASE_URL}/api/paymongo/payment-intent`;
    
    console.log('💳 Would call PayMongo endpoint:', endpoint);
    
    // const response = await fetch(endpoint, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload),
    //   credentials: 'include',
    // });
    //
    // if (!response.ok) {
    //   throw new Error(`PayMongo API error: ${response.statusText}`);
    // }
    //
    // return await response.json();
    
    throw new Error('PayMongo integration not yet implemented');
    
  } catch (error) {
    console.error('❌ PayMongo payment intent creation failed:', error);
    throw error;
  }
}

/**
 * Verify a PayMongo payment status
 */
export async function verifyPayMongoPayment(
  paymentIntentId: string
): Promise<{ status: string; paid: boolean }> {
  console.log('🔍 PayMongo payment verification (not yet implemented)', paymentIntentId);
  
  try {
    // TODO: Implement actual verification
    const endpoint = `${API_BASE_URL}/api/paymongo/verify/${paymentIntentId}`;
    
    console.log('🔍 Would verify at:', endpoint);
    
    throw new Error('PayMongo integration not yet implemented');
    
  } catch (error) {
    console.error('❌ PayMongo verification failed:', error);
    throw error;
  }
}

/**
 * Get available payment methods from PayMongo
 */
export async function getPayMongoPaymentMethods(): Promise<string[]> {
  console.log('📋 PayMongo payment methods fetch (not yet implemented)');
  
  // TODO: Implement actual API call
  // Return mock data for now
  return [
    'card',
    'gcash',
    'grab_pay',
    'paymaya'
  ];
}
