/// <reference lib="es2015" />
export async function createPaymentIntent(payload) {
    const base = import.meta.env.VITE_API_BASE_URL ?? "";
    const res = await fetch(`${base}/api/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Failed to create PaymentIntent (${res.status}): ${text || res.statusText}`);
    }
    return (await res.json());
}
