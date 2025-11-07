// Stub file to replace Stripe functionality after removal
// This prevents import errors while Stripe integration is being removed

import React from 'react';

export const stripePromise = Promise.resolve(null);

export const isStripeAvailable = async (): Promise<boolean> => {
  return false;
};

export const processManualPayment = async (paymentData: {
  amount: number;
  currency: string;
  metadata: Record<string, string>;
}): Promise<{ success: boolean; paymentIntentId: string }> => {
  console.log('⚠️ Stripe integration has been removed. Payment processing not available.', paymentData);
  
  // Return a mock success for testing purposes
  const testPaymentIntentId = `pi_removed_${Date.now()}`;
  
  return {
    success: false,
    paymentIntentId: testPaymentIntentId
  };
};

// Stub React components to replace Stripe Elements
export const Elements: React.FC<{ children: React.ReactNode; stripe?: unknown; options?: unknown }> = ({ children }) => {
  return React.createElement('div', { className: 'stripe-removed-stub' }, children);
};

export const PaymentElement: React.FC<{ options?: unknown }> = () => {
  return React.createElement('div', { 
    className: 'p-4 bg-yellow-100 border border-yellow-400 rounded text-yellow-800' 
  }, '⚠️ Payment processing unavailable - Stripe integration removed');
};

// Stub hooks to replace Stripe hooks  
export const useStripe = () => ({
  confirmPayment: async (): Promise<{ error: { message: string }, paymentIntent?: { status: string, id: string } }> => ({
    error: { message: 'Stripe integration has been removed' },
    paymentIntent: undefined
  })
});

export const useElements = () => ({});

// Export types for compatibility
export type Stripe = null;
