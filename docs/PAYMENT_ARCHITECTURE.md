# Multi-Gateway Payment Architecture

## Overview
The DiscoverGroup booking system supports multiple payment gateways to provide customers with maximum flexibility and payment options.

## Supported Gateways

### 1. PayMongo (Modern, API-First)
- **Best For**: Cards, GCash, GrabPay, PayMaya
- **Processing**: Real-time
- **User Experience**: Seamless, modern checkout
- **Target Audience**: Young, tech-savvy, urban customers

### 2. Dragonpay (Established, Wide Coverage)
- **Best For**: Online banking, OTC payments, wide bank coverage
- **Processing**: Real-time (banking) or 1-2 hours (OTC)
- **User Experience**: Redirect-based, familiar to Filipino customers
- **Target Audience**: All demographics, especially those preferring traditional methods

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Booking Page                             │
│                   (src/pages/Booking.tsx)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Payment Method Selector                         │
│              (src/lib/payment-gateway.ts)                        │
│                                                                  │
│  [💳 Card]  [📱 GCash]  [🏦 Banking]  [🏪 OTC]  [💰 Wallet]    │
└────────────┬────────────────────────────────┬───────────────────┘
             │                                 │
             ↓                                 ↓
    ┌────────────────┐              ┌────────────────────┐
    │   PayMongo     │              │    Dragonpay       │
    │   Integration  │              │    Integration     │
    │                │              │                    │
    │ • Cards        │              │ • Online Banking   │
    │ • GCash        │              │ • OTC Payments     │
    │ • GrabPay      │              │ • E-Wallets        │
    │ • PayMaya      │              │ • 30+ Banks        │
    └────────┬───────┘              └──────────┬─────────┘
             │                                  │
             └──────────┬───────────────────────┘
                        ↓
        ┌───────────────────────────────┐
        │      Backend API               │
        │  (apps/api/src/routes/)        │
        │                                │
        │  • Process Payment             │
        │  • Verify Transaction          │
        │  • Handle Webhooks             │
        │  • Update Booking Status       │
        └────────────┬──────────────────┘
                     ↓
        ┌───────────────────────────────┐
        │      MongoDB Database          │
        │                                │
        │  • Store Payment Record        │
        │  • Update Booking              │
        │  • Track Transaction History   │
        └───────────────────────────────┘
```

## Payment Flow

### PayMongo Flow (Direct Integration)
1. Customer selects payment method (card, GCash, etc.)
2. Frontend collects payment details via PayMongo Elements
3. Backend creates PayMongo payment intent
4. Customer completes payment (instant)
5. PayMongo webhook notifies backend
6. Backend updates booking status
7. Customer sees confirmation

### Dragonpay Flow (Redirect-Based)
1. Customer selects payment method (banking, OTC, etc.)
2. Backend creates Dragonpay payment request
3. Customer redirected to Dragonpay/processor site
4. Customer completes payment (instant or at store)
5. Dragonpay postback notifies backend
6. Backend updates booking status
7. Customer redirected to success page

## File Structure

```
src/
├── lib/
│   ├── payment-gateway.ts        # Multi-gateway manager (main file)
│   ├── paymongo-stub.ts          # PayMongo implementation
│   └── dragonpay-stub.ts         # Dragonpay implementation (to be created)
│
├── api/
│   ├── paymongo-stub.ts          # PayMongo API client
│   └── dragonpay-stub.ts         # Dragonpay API client (to be created)
│
└── pages/
    └── Booking.tsx                # Booking page with payment selector

apps/api/src/routes/
├── paymongo.ts                    # PayMongo backend routes (to be created)
├── dragonpay.ts                   # Dragonpay backend routes (to be created)
└── webhooks.ts                    # Handle payment webhooks (to be created)

Documentation/
├── PAYMONGO_INTEGRATION.md        # PayMongo setup guide
├── DRAGONPAY_INTEGRATION.md       # Dragonpay setup guide
└── PAYMENT_ARCHITECTURE.md        # This file
```

## Gateway Selection Strategy

### Automatic Routing (Recommended)
```typescript
// Based on payment method, automatically select best gateway
if (paymentMethod === 'card' || paymentMethod === 'gcash') {
  gateway = PaymentGateway.PAYMONGO;  // Better UX, instant
} else if (paymentMethod === 'banking' || paymentMethod === 'otc') {
  gateway = PaymentGateway.DRAGONPAY; // More options, wider coverage
}
```

### Manual Selection (Alternative)
Let customers choose their preferred gateway explicitly.

### Smart Fallback
If one gateway is down, automatically try the other for compatible payment methods.

## Environment Variables

```bash
# Frontend .env
VITE_API_URL=http://localhost:4000
VITE_PAYMENT_MODE=test  # or 'production'

# Backend apps/api/.env
# PayMongo
PAYMONGO_SECRET_KEY=sk_test_...
PAYMONGO_PUBLIC_KEY=pk_test_...
PAYMONGO_WEBHOOK_SECRET=whsec_...

# Dragonpay
DRAGONPAY_MERCHANT_ID=your_merchant_id
DRAGONPAY_PASSWORD=your_password
DRAGONPAY_API_KEY=your_api_key

# General
PAYMENT_MODE=test  # or 'production'
FRONTEND_URL=http://localhost:5173
```

## Database Schema

### Payment Record
```typescript
interface PaymentRecord {
  _id: string;
  bookingId: string;
  
  // Gateway info
  gateway: 'paymongo' | 'dragonpay';
  gatewayPaymentId: string;      // Payment ID from gateway
  gatewayTransactionId?: string; // Transaction ID (Dragonpay)
  
  // Payment details
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'paid' | 'failed' | 'expired';
  
  // Metadata
  customerEmail: string;
  customerName: string;
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  paidAt?: Date;
  expiresAt?: Date;
  
  // Webhook data
  webhookReceived: boolean;
  webhookData?: any;
}
```

## Webhook Handling

Both gateways send webhooks for payment events:

### PayMongo Webhook Events
- `payment.paid` - Payment successful
- `payment.failed` - Payment failed
- `source.chargeable` - Ready to charge (for some methods)

### Dragonpay Postback
- Sent when payment is completed
- Must verify digest signature
- Update booking status accordingly

## Security Considerations

1. **API Keys**: Store in environment variables, never commit to git
2. **Webhook Verification**: Always verify signatures/digests
3. **HTTPS**: Required for production (both gateways)
4. **CORS**: Configure allowed origins properly
5. **Rate Limiting**: Prevent payment spam/abuse
6. **Logging**: Log all payment attempts (success and failure)
7. **PCI Compliance**: Never store raw card data (handled by gateways)

## Testing

### Test Credentials

**PayMongo Test Cards:**
```
Success: 4120 0000 0000 0007
3D Secure: 4120 0000 0000 0015
Insufficient funds: 4120 0000 0000 0056
```

**Dragonpay Test Environment:**
- Use test.dragonpay.ph URLs
- Test processors available in test mode
- No real money processed

### Test Scenarios
- [ ] Card payment via PayMongo
- [ ] GCash via PayMongo
- [ ] Online banking via Dragonpay
- [ ] OTC payment via Dragonpay
- [ ] Payment timeout
- [ ] Payment failure
- [ ] Duplicate transactions
- [ ] Webhook retry
- [ ] Gateway failover

## Cost Analysis

### Transaction Fees Comparison

| Payment Method | PayMongo | Dragonpay | Winner |
|---------------|----------|-----------|--------|
| Credit Card | ~3.5% + P15 | ~3.5% + P15 | Tie |
| GCash | ~2.5% | ~2.5% | Tie |
| Online Banking | Not available | ~P15-25 | Dragonpay |
| OTC (7-11, etc) | Not available | ~P15-25 | Dragonpay |

*Use the most cost-effective gateway for each method*

## Monitoring & Analytics

Track these metrics:
- Payment success rate per gateway
- Average processing time per gateway
- Most popular payment methods
- Gateway availability/uptime
- Failed payment reasons
- Revenue per gateway

## Customer Support

Provide clear documentation for customers:
- How to pay via each method
- Expected processing times
- What to do if payment fails
- Contact information for payment issues
- Refund policy and process

## Future Enhancements

- [ ] Add more gateways (Maya Bank, Xendit, etc.)
- [ ] Implement installment payments
- [ ] Add cryptocurrency support
- [ ] Recurring payments for packages
- [ ] Payment method recommendations based on customer history
- [ ] Dynamic gateway selection based on success rates
- [ ] Automatic failover if primary gateway is down

## Support Contacts

**PayMongo:**
- Email: support@paymongo.com
- Docs: https://developers.paymongo.com

**Dragonpay:**
- Email: support@dragonpay.ph
- Phone: +63 (2) 8-434-0080
- Docs: https://www.dragonpay.ph/wp-content/uploads/2014/05/Dragonpay-PS-API.pdf
