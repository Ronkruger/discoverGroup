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
  // TODO: Check actual configuration/API keys
  return [
    {
      gateway: PaymentGateway.PAYMONGO,
      enabled: false, // Will be true when implemented
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
      enabled: false, // Will be true when implemented
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
  
  return React.createElement('div', { className: 'payment-method-selector' },
    React.createElement('h3', { className: 'text-lg font-semibold mb-4' }, 
      'Choose Payment Method'
    ),
    
    // Group by gateway
    gateways.map(gateway =>
      React.createElement('div', { key: gateway.gateway, className: 'mb-6' },
        React.createElement('div', { className: 'text-sm font-medium text-gray-600 mb-2' },
          gateway.name,
          !gateway.enabled && React.createElement('span', { className: 'ml-2 text-xs text-yellow-600' }, '(Coming Soon)')
        ),
        
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-3' },
          getPaymentMethodsByGateway(gateway.gateway).map(method =>
            React.createElement('button', {
              key: method.id,
              onClick: () => gateway.enabled && onSelect(method),
              disabled: !gateway.enabled,
              className: `p-4 border-2 rounded-lg text-left transition-all ${
                selectedMethod?.id === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${!gateway.enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`
            },
              React.createElement('div', { className: 'flex items-start gap-3' },
                React.createElement('div', { className: 'text-2xl' }, method.icon),
                React.createElement('div', { className: 'flex-1' },
                  React.createElement('div', { className: 'font-medium' }, method.name),
                  React.createElement('div', { className: 'text-xs text-gray-600 mt-1' }, method.description),
                  method.processingTime && React.createElement('div', { className: 'text-xs text-gray-500 mt-1' }, 
                    `⏱️ ${method.processingTime}`
                  )
                )
              )
            )
          )
        )
      )
    ),
    
    !gateways.some(g => g.enabled) && 
      React.createElement('div', { className: 'mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded' },
        React.createElement('p', { className: 'text-sm text-yellow-800' },
          '⚠️ Payment gateways are not yet configured. Please contact support to complete your booking.'
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
