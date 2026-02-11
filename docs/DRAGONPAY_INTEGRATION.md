# Dragonpay Integration Plan

## Overview
**Dragonpay** is a well-established Philippine payment gateway that aggregates multiple payment channels including banks, e-wallets, over-the-counter, and online payment centers.

## Status
🚧 **Not Yet Implemented** - Integration planned alongside PayMongo

## Features

### Payment Channels Supported
- **Online Banking** - BDO, BPI, Metrobank, UnionBank, Security Bank, RCBC, Chinabank, etc.
- **Over-the-Counter** - 7-Eleven, M.Lhuillier, Cebuana Lhuillier, SM Payment Centers, Bayad Center
- **Mobile Wallets** - GCash, GrabPay, PayMaya, Coins.ph
- **Credit/Debit Cards** - Via partner processors
- **PayPal** - International payments
- **International Remittance** - Western Union, MoneyGram

## Dragonpay vs PayMongo Comparison

| Feature | Dragonpay | PayMongo |
|---------|-----------|----------|
| **Age/Maturity** | Est. 2005, very established | Newer, modern API |
| **OTC Locations** | Very extensive (7-11, Cebuana, etc.) | Limited |
| **Online Banking** | 30+ banks | Growing list |
| **API Design** | Traditional/Legacy | Modern REST API |
| **Setup Complexity** | Moderate | Easy |
| **Transaction Fees** | Varies by channel | Generally transparent |
| **Best For** | OTC, wide bank coverage | Cards, e-wallets, modern UX |

## When to Use Each Gateway

### Use Dragonpay For:
- 💵 Over-the-counter payments (cash payments at stores)
- 🏦 Customers who prefer traditional banking methods
- 👴 Older demographic more familiar with Dragonpay
- 🌍 Remote areas with limited card/e-wallet adoption

### Use PayMongo For:
- 💳 Credit/debit card payments
- 📱 Young, tech-savvy customers
- ⚡ Fast, modern checkout experience
- 🔄 Subscription/recurring payments (future feature)

## Integration Architecture

```
Customer → Select Payment Method → Route to Appropriate Gateway
                 ↓
        ┌────────┴────────┐
        ↓                 ↓
    PayMongo          Dragonpay
    (Modern)          (Traditional)
        ↓                 ↓
        └────────┬────────┘
                 ↓
         Your Backend API
                 ↓
         Database Record
                 ↓
         Booking Confirmed
```

## Required Environment Variables

### Backend (apps/api/.env)
```bash
# Dragonpay Configuration
DRAGONPAY_MERCHANT_ID=your_merchant_id
DRAGONPAY_PASSWORD=your_password
DRAGONPAY_API_KEY=your_api_key
DRAGONPAY_MODE=test  # or 'production'

# PayMongo Configuration (for comparison)
PAYMONGO_SECRET_KEY=sk_test_...
PAYMONGO_WEBHOOK_SECRET=whsec_...
```

### Frontend (.env)
```bash
# Frontend doesn't need Dragonpay keys
# Dragonpay uses server-to-server + redirect flow
VITE_API_URL=http://localhost:4000
```

## Dragonpay API Documentation
- Main Site: https://www.dragonpay.ph/
- Developer Docs: https://www.dragonpay.ph/wp-content/uploads/2014/05/Dragonpay-PS-API.pdf
- Test Environment: https://test.dragonpay.ph/
- Processor Codes: https://www.dragonpay.ph/processors

## Implementation Steps

### Phase 1: Setup
- [ ] Register Dragonpay merchant account
- [ ] Get test credentials (Merchant ID, Password)
- [ ] Review processor codes and fees
- [ ] Set up environment variables

### Phase 2: Backend Integration
- [ ] Create Dragonpay payment endpoint
- [ ] Implement payment request generation
- [ ] Set up postback/callback handler
- [ ] Add payment verification
- [ ] Store payment records in database

### Phase 3: Frontend Integration
- [ ] Create payment method selector UI
- [ ] Show Dragonpay processor options
- [ ] Handle redirect flow to Dragonpay
- [ ] Handle return from Dragonpay
- [ ] Display payment status

### Phase 4: Testing
- [ ] Test with Dragonpay test processors
- [ ] Test postback callbacks
- [ ] Test all payment channels
- [ ] Test timeout scenarios
- [ ] Test full booking flow

### Phase 5: Production
- [ ] Switch to live credentials
- [ ] Configure production URLs
- [ ] Monitor transactions
- [ ] Set up payment alerts

## Dragonpay Payment Flow

1. **Customer selects Dragonpay** on booking page
2. **Customer chooses processor** (e.g., BPI Online, GCash, 7-Eleven)
3. **Backend generates payment request** with digital signature
4. **Customer redirected to Dragonpay** payment page
5. **Customer completes payment** at Dragonpay/processor
6. **Dragonpay sends postback** to your server (webhook)
7. **Backend verifies payment** and updates booking
8. **Customer redirected back** to your success page

## Payment Request Parameters

```typescript
interface DragonpayPaymentRequest {
  merchantid: string;      // Your merchant ID
  txnid: string;          // Unique transaction ID (from your system)
  amount: number;         // Payment amount
  ccy: string;            // Currency (PHP)
  description: string;    // Payment description
  email: string;          // Customer email
  param1?: string;        // Optional custom parameter
  param2?: string;        // Optional custom parameter
  digest: string;         // SHA1 hash for security
}
```

## Processor Codes (Examples)

Common processors your customers can use:

```typescript
export const DRAGONPAY_PROCESSORS = {
  // Online Banking
  BDO: 'BDO',
  BPI: 'BPI',
  UNION_BANK: 'UBP',
  METROBANK: 'MBTC',
  RCBC: 'RCBC',
  
  // E-Wallets
  GCASH: 'GCASH',
  GRAB_PAY: 'GRABPAY',
  PAYMAYA: 'PYMY',
  
  // Over-the-Counter
  SEVEN_ELEVEN: '711',
  CEBUANA: 'CEBL',
  MLHUILLIER: 'MLH',
  SM_PAYMENT: 'SMR',
  BAYAD_CENTER: 'BAYD',
  
  // Credit Cards (via partners)
  CREDIT_CARD: 'CC',
  
  // PayPal
  PAYPAL: 'PYPL'
} as const;
```

## Security Notes
- Always verify the postback digest/signature
- Use HTTPS for all callbacks
- Validate transaction IDs against your database
- Set reasonable timeout periods
- Log all transaction attempts

## Transaction Fees

Fees vary by processor:
- **Online Banking**: ~PHP 15-25 per transaction
- **Credit Cards**: ~3.5% + PHP 15
- **E-Wallets**: ~2.5% + PHP 15  
- **OTC**: ~PHP 15-25 per transaction

(Check current rates with Dragonpay)

## Support
- Dragonpay Support: support@dragonpay.ph
- Technical Support: developers@dragonpay.ph
- Phone: +63 (2) 8-434-0080
