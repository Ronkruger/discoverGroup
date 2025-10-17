import { loadStripe } from "@stripe/stripe-js";
import type { StripeConstructor } from '@stripe/stripe-js';

// Get the publishable key from environment
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;

// Create a more aggressive loading strategy for Stripe.js
export const stripePromise = (async () => {
  console.log('🚀 Initializing Stripe.js with enhanced loading...');
  
  // Try multiple approaches to load Stripe
  const loadingStrategies = [
    // Strategy 1: Default loading
    () => loadStripe(stripePublishableKey),
    
    // Strategy 2: Load with explicit locale and options
    () => loadStripe(stripePublishableKey, {
      locale: 'en',
      stripeAccount: undefined,
    }),
    
    // Strategy 3: Direct script injection (last resort)
    () => new Promise((resolve, reject) => {
      // Check if Stripe is already available globally
      if (window.Stripe) {
        console.log('✅ Found existing Stripe global object');
        resolve(window.Stripe(stripePublishableKey));
        return;
      }
      
      // Create script element
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => {
        if (window.Stripe) {
          console.log('✅ Stripe.js loaded via direct script injection');
          resolve(window.Stripe(stripePublishableKey));
        } else {
          reject(new Error('Stripe global not available after script load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load Stripe script'));
      document.head.appendChild(script);
      
      // Add timeout
      setTimeout(() => reject(new Error('Script loading timeout')), 20000);
    })
  ];
  
  let lastError: Error | null = null;
  
  for (let i = 0; i < loadingStrategies.length; i++) {
    try {
      console.log(`🔄 Trying Stripe loading strategy ${i + 1}/${loadingStrategies.length}...`);
      
      const stripe = await Promise.race([
        loadingStrategies[i](),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Strategy timeout')), 15000)
        )
      ]);
      
      if (stripe) {
        console.log(`✅ Stripe.js loaded successfully with strategy ${i + 1}`);
        return stripe;
      }
    } catch (error) {
      lastError = error as Error;
      console.warn(`❌ Strategy ${i + 1} failed:`, error);
      
      if (i < loadingStrategies.length - 1) {
        console.log('⏳ Waiting 3 seconds before next strategy...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
  
  console.error('❌ All Stripe loading strategies failed. Last error:', lastError);
  throw new Error(`Failed to load Stripe.js: ${lastError?.message || 'All strategies exhausted'}`);
})();
// Add global Stripe interface for TypeScript
declare global {
  interface Window {
    Stripe?: StripeConstructor;
  }
}

// Export a utility function to check if Stripe is available
export const isStripeAvailable = async (): Promise<boolean> => {
  try {
    const stripe = await stripePromise;
    return stripe !== null && stripe !== undefined;
  } catch (error) {
    console.error('Stripe availability check failed:', error);
    return false; // Return false so test mode UI can be shown
  }
};

// Create a manual payment processing function as fallback
export const processManualPayment = async (paymentData: {
  amount: number;
  currency: string;
  metadata: Record<string, string>;
}): Promise<{ success: boolean; paymentIntentId: string }> => {
  try {
    // Log the incoming payment data so the parameter is used and helpful for debugging
    console.log('🔄 Processing manual payment (test mode)...', paymentData);
    
    const { amount, currency, metadata } = paymentData;
    const metaSummary = metadata && Object.keys(metadata).length ? JSON.stringify(metadata) : 'none';
    
    // Always simulate a successful payment since this is a fallback
    const testPaymentIntentId = `pi_test_${Date.now()}_${Math.random().toString(36).slice(2, 9)}_${amount}_${currency}`;
    console.log('🧪 TEST MODE: Simulating successful payment with ID:', testPaymentIntentId, 'metadata:', metaSummary);
    
    // Add a small delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      paymentIntentId: testPaymentIntentId
    };
  } catch (error) {
    console.error('❌ Manual payment failed:', error);
    throw error;
  }
};