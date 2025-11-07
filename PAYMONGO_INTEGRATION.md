# Multi-Gateway Payment Integration Plan

## Overview
This project supports **multiple payment gateways** to provide customers with flexible payment options:
- **PayMongo** - Modern API, cards, e-wallets, online banking
- **Dragonpay** - Established provider, wide range of over-the-counter and online banking options

## Status
🚧 **Not Yet Implemented** - Multi-gateway payment integration planned for future development

## Why Multiple Gateways?

### Benefits:
- **More Payment Options** - Different customers prefer different methods
- **Redundancy** - If one gateway is down, the other can still process payments
- **Better Coverage** - Each gateway has different banking partnerships
- **Competitive Rates** - Use the most cost-effective gateway per transaction type
- **Customer Preference** - Some customers trust certain providers more

## Features to Implement

### Payment Methods
- **Credit/Debit Cards** - Visa, Mastercard, JCB, etc.
- **E-Wallets** - GCash, GrabPay, PayMaya
- **Online Banking** - BPI, BDO, UnionBank, etc.
- **Over-the-Counter** - 7-Eleven, Cebuana, etc.

### Integration Points
1. **Booking Flow** (`src/pages/Booking.tsx`)
   - Full payment option
   - Downpayment option
   - Payment confirmation

2. **API Routes** (`apps/api/src/routes/`)
   - Create payment intent
   - Process payment
   - Handle webhooks
   - Payment verification

3. **Admin Dashboard** (`apps/admin/`)
   - View payment history
   - Track payment status
   - Refund processing

## Required Environment Variables

### Frontend (.env)
```
VITE_PAYMONGO_PUBLIC_KEY=pk_test_...
VITE_API_URL=http://localhost:4000
```

### Backend (apps/api/.env)
```
PAYMONGO_SECRET_KEY=sk_test_...
PAYMONGO_WEBHOOK_SECRET=whsec_...
```

## PayMongo API Documentation
- Main Docs: https://developers.paymongo.com/docs
- API Reference: https://developers.paymongo.com/reference
- SDKs: https://github.com/paymongo

## Implementation Steps

### Phase 1: Setup
- [ ] Register PayMongo account
- [ ] Get test API keys
- [ ] Install PayMongo SDK or HTTP client
- [ ] Set up environment variables

### Phase 2: Backend Integration
- [ ] Create payment intent endpoint
- [ ] Implement webhook handler for payment events
- [ ] Add payment verification
- [ ] Store payment records in database

### Phase 3: Frontend Integration
- [ ] Create PayMongo payment form component
- [ ] Integrate payment flow in booking page
- [ ] Handle payment success/failure
- [ ] Display payment status to users

### Phase 4: Testing
- [ ] Test with PayMongo test cards
- [ ] Test webhook events
- [ ] Test error scenarios
- [ ] Test full booking + payment flow

### Phase 5: Production
- [ ] Switch to live API keys
- [ ] Configure production webhooks
- [ ] Monitor payment transactions
- [ ] Set up payment alerts

## Notes
- Stripe integration was removed on November 7, 2025
- Stub files created to maintain code compatibility:
  - `src/lib/stripe-stub.ts`
  - `src/api/payments-stub.ts`
- These stubs should be replaced with PayMongo implementations

## Currency
All payments will be in **PHP (Philippine Peso)**

## Security Considerations
- Never expose secret keys in frontend code
- Use HTTPS for all payment requests
- Validate webhook signatures
- Implement proper error handling
- Log all payment transactions securely

## Support
- PayMongo Support: support@paymongo.com
- Documentation: https://developers.paymongo.com
