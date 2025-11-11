// Multi-Gateway Payment Manager
// Supports both PayMongo and Dragonpay

import React from 'react';

/**
 * Supported payment gateways
 */
export enum PaymentGateway {
  PAYMONGO = 'paymongo',
  DRAGONPAY = 'dragonpay'
}

/**
 * Payment method types across both gateways
 */
export enum PaymentMethodType {
  // PayMongo methods
  CARD = 'card',
  GCASH = 'gcash',
  GRAB_PAY = 'grab_pay',
  PAYMAYA = 'paymaya',
  
  // Dragonpay methods
  ONLINE_BANKING = 'online_banking',
  OVER_THE_COUNTER = 'otc',
  DRAGONPAY_WALLET = 'dragonpay_wallet'
}

/**
 * Payment method configuration
 */
export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  gateway: PaymentGateway;
  icon?: string;
  description?: string;
  processingTime?: string;
  fees?: string;
}

/**
 * Available payment methods grouped by gateway
 */
export const PAYMENT_METHODS: PaymentMethod[] = [
  // PayMongo Methods
  {
    id: 'pm_card',
    name: 'Credit/Debit Card',
    type: PaymentMethodType.CARD,
    gateway: PaymentGateway.PAYMONGO,
    icon: '💳',
    description: 'Visa, Mastercard, JCB',
    processingTime: 'Instant',
    fees: 'Standard processing fees apply'
  },
  {
    id: 'pm_gcash',
    name: 'GCash',
    type: PaymentMethodType.GCASH,
    gateway: PaymentGateway.PAYMONGO,
    icon: '📱',
    description: 'Pay with your GCash wallet',
    processingTime: 'Instant',
    fees: 'No additional fees'
  },
  {
    id: 'pm_grabpay',
    name: 'GrabPay',
    type: PaymentMethodType.GRAB_PAY,
    gateway: PaymentGateway.PAYMONGO,
    icon: '🚗',
    description: 'Pay with your GrabPay wallet',
    processingTime: 'Instant',
    fees: 'No additional fees'
  },
  
  // Dragonpay Methods
  {
    id: 'dp_banking',
    name: 'Online Banking',
    type: PaymentMethodType.ONLINE_BANKING,
    gateway: PaymentGateway.DRAGONPAY,
    icon: '🏦',
    description: 'BDO, BPI, UnionBank, Metrobank, etc.',
    processingTime: 'Instant',
    fees: 'PHP 15-25 per transaction'
  },
  {
    id: 'dp_otc',
    name: 'Over-the-Counter',
    type: PaymentMethodType.OVER_THE_COUNTER,
    gateway: PaymentGateway.DRAGONPAY,
    icon: '🏪',
    description: '7-Eleven, Cebuana, M.Lhuillier, SM',
    processingTime: '1-2 hours after payment',
    fees: 'PHP 15-25 per transaction'
  },
  {
    id: 'dp_wallet',
    name: 'E-Wallet (Dragonpay)',
    type: PaymentMethodType.DRAGONPAY_WALLET,
    gateway: PaymentGateway.DRAGONPAY,
    icon: '💰',
    description: 'Various e-wallet options via Dragonpay',
    processingTime: 'Instant',
    fees: 'Varies by processor'
  }
];

/**
 * Payment gateway configuration
 */
export interface GatewayConfig {
  gateway: PaymentGateway;
  enabled: boolean;
  name: string;
  description: string;
  supportedMethods: PaymentMethodType[];
}

/**
 * Check which gateways are available
 */
export const getAvailableGateways = (): GatewayConfig[] => {
  // Demo mode - all gateways enabled for testing
  return [
    {
      gateway: PaymentGateway.PAYMONGO,
      enabled: true, // Demo mode - all methods available
      name: 'PayMongo',
      description: 'Modern payment gateway for cards and e-wallets',
      supportedMethods: [
        PaymentMethodType.CARD,
        PaymentMethodType.GCASH,
        PaymentMethodType.GRAB_PAY,
        PaymentMethodType.PAYMAYA
      ]
    },
    {
      gateway: PaymentGateway.DRAGONPAY,
      enabled: true, // Demo mode - all methods available
      name: 'Dragonpay',
      description: 'Wide range of payment options including OTC',
      supportedMethods: [
        PaymentMethodType.ONLINE_BANKING,
        PaymentMethodType.OVER_THE_COUNTER,
        PaymentMethodType.DRAGONPAY_WALLET
      ]
    }
  ];
};

/**
 * Get payment methods for a specific gateway
 */
export const getPaymentMethodsByGateway = (gateway: PaymentGateway): PaymentMethod[] => {
  return PAYMENT_METHODS.filter(method => method.gateway === gateway);
};

/**
 * Create a payment intent (routes to appropriate gateway)
 */
export const createPaymentIntent = async (params: {
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  paymentMethod: PaymentMethodType;
  metadata?: Record<string, string>;
}): Promise<{
  success: boolean;
  gateway: PaymentGateway;
  paymentId: string;
  redirectUrl?: string;
  clientSecret?: string;
}> => {
  console.log('💳 Creating payment intent:', params);
  
  // TODO: Implement actual routing logic
  switch (params.gateway) {
    case PaymentGateway.PAYMONGO:
      // TODO: Call PayMongo API
      console.log('→ Routing to PayMongo');
      throw new Error('PayMongo integration not yet implemented');
      
    case PaymentGateway.DRAGONPAY:
      // TODO: Call Dragonpay API
      console.log('→ Routing to Dragonpay');
      throw new Error('Dragonpay integration not yet implemented');
      
    default:
      throw new Error(`Unsupported gateway: ${params.gateway}`);
  }
};

/**
 * Verify a payment (works for both gateways)
 */
export const verifyPayment = async (params: {
  gateway: PaymentGateway;
  paymentId: string;
  transactionId: string;
}): Promise<{
  verified: boolean;
  status: string;
  amount?: number;
}> => {
  console.log('🔍 Verifying payment:', params);
  
  // TODO: Implement actual verification
  throw new Error('Payment verification not yet implemented');
};

/**
 * Payment method selector component
 */
export const PaymentMethodSelector: React.FC<{
  onSelect: (method: PaymentMethod) => void;
  selectedMethod?: PaymentMethod;
}> = ({ onSelect, selectedMethod }) => {
  const gateways = getAvailableGateways();
  
  return React.createElement('div', { className: 'payment-method-selector space-y-6' },
    
    // Group by gateway
    gateways.map(gateway =>
      React.createElement('div', { key: gateway.gateway, className: 'space-y-3' },
        React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
          React.createElement('h3', { className: 'text-lg font-bold text-white' },
            gateway.name
          ),
          gateway.enabled && React.createElement('span', { 
            className: 'px-2 py-1 text-xs font-semibold bg-green-500/20 text-green-300 rounded-full border border-green-500/30' 
          }, '✓ Available')
        ),
        
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
          getPaymentMethodsByGateway(gateway.gateway).map(method =>
            React.createElement('button', {
              key: method.id,
              onClick: () => gateway.enabled && onSelect(method),
              disabled: !gateway.enabled,
              className: `p-4 border-2 rounded-xl text-left transition-all transform hover:scale-[1.02] ${
                selectedMethod?.id === method.id
                  ? 'border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/30'
                  : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
              } ${!gateway.enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`
            },
              React.createElement('div', { className: 'flex items-start gap-3' },
                React.createElement('div', { className: 'text-3xl flex-shrink-0' }, method.icon),
                React.createElement('div', { className: 'flex-1 min-w-0' },
                  React.createElement('div', { className: 'font-semibold text-white text-lg mb-1' }, method.name),
                  React.createElement('div', { className: 'text-sm text-white/70 break-words' }, method.description),
                  method.processingTime && React.createElement('div', { className: 'text-xs text-white/60 mt-2 flex items-center gap-1' }, 
                    React.createElement('span', {}, '⏱️'),
                    React.createElement('span', {}, method.processingTime)
                  )
                ),
                selectedMethod?.id === method.id && React.createElement('div', { className: 'flex-shrink-0' },
                  React.createElement('svg', { 
                    className: 'w-6 h-6 text-blue-400',
                    fill: 'currentColor',
                    viewBox: '0 0 20 20'
                  },
                    React.createElement('path', {
                      fillRule: 'evenodd',
                      d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
                      clipRule: 'evenodd'
                    })
                  )
                )
              )
            )
          )
        )
      )
    )
  );
};

/**
 * Recommended gateway based on payment method preference
 */
export const getRecommendedGateway = (preference: string): PaymentGateway => {
  const lower = preference.toLowerCase();
  
  if (lower.includes('card') || lower.includes('gcash') || lower.includes('grab')) {
    return PaymentGateway.PAYMONGO;
  }
  
  if (lower.includes('bank') || lower.includes('otc') || lower.includes('counter')) {
    return PaymentGateway.DRAGONPAY;
  }
  
  // Default to PayMongo for modern experience
  return PaymentGateway.PAYMONGO;
};
