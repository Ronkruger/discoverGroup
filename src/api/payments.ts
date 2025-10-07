/// <reference lib="es2015" />

type CreatePaymentIntentRequest = {
  amount: number; // in the smallest currency unit (centavos for PHP)
  currency: string; // e.g., "php"
  metadata?: Record<string, string>;
};

type CreatePaymentIntentResponse = {
  clientSecret: string;
  id: string;
};

export async function createPaymentIntent(
  payload: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> {
  const base = import.meta.env.VITE_API_BASE_URL ?? "";
  const res = await fetch(`${base}/api/create-payment-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Failed to create PaymentIntent (${res.status}): ${text || res.statusText}`
    );
  }
  return (await res.json()) as CreatePaymentIntentResponse;
}