// Stub file to replace payment API functionality after Stripe removal

type CreatePaymentIntentRequest = {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
};

type CreatePaymentIntentResponse = {
  clientSecret: string;
  id: string;
};

export async function createPaymentIntent(
  payload: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> {
  console.log('⚠️ Payment intent creation not available - Stripe integration removed', payload);
  
  // Return a mock response to prevent crashes
  return {
    clientSecret: "payment_removed",
    id: "pi_removed"
  };
}
