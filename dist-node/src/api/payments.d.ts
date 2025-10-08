type CreatePaymentIntentRequest = {
    amount: number;
    currency: string;
    metadata?: Record<string, string>;
};
type CreatePaymentIntentResponse = {
    clientSecret: string;
    id: string;
};
export declare function createPaymentIntent(payload: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse>;
export {};
//# sourceMappingURL=payments.d.ts.map