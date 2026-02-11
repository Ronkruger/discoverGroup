# Payment Gateway Mockup Integration Guide

## Summary

The Stripe payment integration has been removed and replaced with mockup designs for **PayMongo** and **Dragonpay**. These are visual mockups that simulate the payment flow without actual payment processing.

## Files Created

### 1. Payment Gateway Manager
**File**: `src/lib/payment-gateway.ts`
- Manages multiple payment gateways (PayMongo & Dragonpay)
- Defines payment methods and their properties
- Provides payment method selector component
- Routes payments to appropriate gateway

### 2. Payment Mockup Components
**File**: `src/components/PaymentMockup.tsx`
- `PayMongoMockup` - Visual mockup of PayMongo payment form
- `DragonpayMockup` - Visual mockup of Dragonpay payment selection

### 3. Stub Implementations
**Files**:
- `src/lib/paymongo-stub.ts` - PayMongo utility functions (stub)
- `src/api/paymongo-stub.ts` - PayMongo API client (stub)
- `src/lib/stripe-stub.ts` - Legacy Stripe stub (can be removed later)
- `src/api/payments-stub.ts` - Legacy payment stub (can be removed later)

## Payment Flow (Mockup)

### Step 1: Customer selects booking details
- Tour, date, passengers, payment type (full/downpayment/cash)

### Step 2: Customer information
- Name, email, phone, passport

### Step 3: Payment method selection (NEW)
```
┌──────────────────────────────────────┐
│   Choose Your Payment Method         │
├──────────────────────────────────────┤
│  PayMongo (Modern Payment)           │
│  ├─ 💳 Credit/Debit Card             │
│  ├─ 📱 GCash                          │
│  ├─ 🚗 GrabPay                        │
│  └─ 💰 PayMaya                        │
│                                       │
│  Dragonpay (Wide Coverage)           │
│  ├─ 🏦 Online Banking (30+ banks)    │
│  ├─ 🏪 Over-the-Counter (7-11, etc)  │
│  └─ 💵 E-Wallets                      │
└──────────────────────────────────────┘
```

### Step 4: Payment processing (mockup)
- If PayMongo: Shows card form or e-wallet redirect mockup
- If Dragonpay: Shows processor selection (BDO, BPI, 7-11, etc)
- Simulates 2-second processing delay
- Shows success confirmation

## Payment Methods Available

### PayMongo
- **Credit/Debit Cards** - Instant processing
- **GCash** - E-wallet, instant
- **GrabPay** - E-wallet, instant  
- **PayMaya** - E-wallet, instant

### Dragonpay
- **Online Banking** - BDO, BPI, UnionBank, Metrobank, RCBC, etc (30+ banks)
- **Over-the-Counter** - 7-Eleven, Cebuana, M.Lhuillier, SM, Bayad Center
- **E-Wallets** - GCash, GrabPay, PayMaya via Dragonpay

## Code Snippet for Booking.tsx Step 3

Replace the current Step 3 (Payment) section with:

```typescript
{step === 3 && paymentType !== "cash-appointment" && (
  <section aria-labelledby="payment-method-heading">
    <h2 id="payment-method-heading" className="text-lg font-semibold mb-3 text-slate-100">
      Select Payment Method
    </h2>
    
    {!selectedPaymentMethod ? (
      <div className="bg-white/10 rounded-lg p-6">
        <PaymentMethodSelector
          onSelect={(method) => {
            setSelectedPaymentMethod(method);
            setSelectedGateway(method.gateway);
            setPaymentReady(true);
          }}
          selectedMethod={selectedPaymentMethod}
        />
      </div>
    ) : (
      <div>
        {/* Show appropriate mockup based on selected gateway */}
        {selectedGateway === PaymentGateway.PAYMONGO && (
          <PayMongoMockup
            paymentMethod={selectedPaymentMethod}
            amount={Math.round(paymentAmount * 100)}
            onComplete={() => {
              // Simulate successful payment
              const paymentId = `${selectedGateway}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
              handlePaymentSuccess(paymentId);
            }}
            onBack={() => {
              setSelectedPaymentMethod(null);
              setSelectedGateway(null);
              setPaymentReady(false);
            }}
          />
        )}
        
        {selectedGateway === PaymentGateway.DRAGONPAY && (
          <DragonpayMockup
            paymentMethod={selectedPaymentMethod}
            amount={Math.round(paymentAmount * 100)}
            onComplete={() => {
              // Simulate successful payment
              const paymentId = `${selectedGateway}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
              handlePaymentSuccess(paymentId);
            }}
            onBack={() => {
              setSelectedPaymentMethod(null);
              setSelectedGateway(null);
              setPaymentReady(false);
            }}
          />
        )}
      </div>
    )}
  </section>
)}
```

## What Users Will See

### PayMongo Mockup
- **Card Payment**: Shows mockup card input fields (disabled)
- **E-Wallets**: Shows redirect message with wallet icon
- **"Complete Payment" button**: Simulates 2-second processing
- **Warning**: Yellow box indicating this is a mockup

### Dragonpay Mockup
- **Processor Selection**: List of banks/OTC locations to choose
- **OTC Instructions**: Step-by-step guide for paying at stores
- **"Proceed to Payment" or "Generate Payment Code" button**
- **Warning**: Yellow box indicating this is a mockup

## Testing the Mockups

1. Navigate to booking page
2. Select a tour and fill booking details
3. Proceed to Step 3 (Payment)
4. Choose any payment method
5. Click Complete/Proceed button
6. Wait 2 seconds
7. See booking confirmation

## Next Steps for Real Integration

### For PayMongo:
1. Register at https://dashboard.paymongo.com
2. Get API keys
3. Replace stub functions in `src/lib/paymongo-stub.ts`
4. Update mockup component to use real PayMongo Elements
5. Test with PayMongo test cards

### For Dragonpay:
1. Register merchant account
2. Get merchant ID and credentials  
3. Replace stub functions
4. Implement redirect flow
5. Set up postback webhook handler
6. Test with Dragonpay test processors

## Environment Variables Needed (Later)

```bash
# .env (Frontend)
VITE_PAYMONGO_PUBLIC_KEY=pk_test_...
VITE_API_URL=http://localhost:4000

# apps/api/.env (Backend)
PAYMONGO_SECRET_KEY=sk_test_...
PAYMONGO_WEBHOOK_SECRET=whsec_...
DRAGONPAY_MERCHANT_ID=your_merchant_id
DRAGONPAY_PASSWORD=your_password
DRAGONPAY_API_KEY=your_api_key
```

## Documentation

- **PAYMENT_ARCHITECTURE.md** - Complete system overview
- **PAYMONGO_INTEGRATION.md** - PayMongo setup guide
- **DRAGONPAY_INTEGRATION.md** - Dragonpay setup guide
- **PAYMENT_MOCKUP_GUIDE.md** - This file

## Note

All payment processing is currently **simulated**. No real transactions occur. The mockups provide a visual preview of what the actual payment integrations will look like once PayMongo and Dragonpay are properly configured.

The booking data IS still saved to your database - only the payment gateway integration is mocked.
