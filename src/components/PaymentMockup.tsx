// Payment Mockup Components for PayMongo and Dragonpay
import React from 'react';
import type { PaymentMethod } from '../lib/payment-gateway';

interface PaymentMockupProps {
  paymentMethod: PaymentMethod;
  amount: number;
  onComplete: () => void;
  onBack: () => void;
}

export const PayMongoMockup: React.FC<PaymentMockupProps> = ({ 
  paymentMethod, 
  amount, 
  onComplete, 
  onBack 
}) => {
  const [processing, setProcessing] = React.useState(false);

  const handlePay = () => {
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      onComplete();
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* PayMongo Branding */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="text-xl font-bold">PayMongo</h3>
            <p className="text-sm opacity-90">Secure Payment Gateway</p>
          </div>
          <div className="text-4xl">💳</div>
        </div>
      </div>

      {/* Payment Method Info */}
      <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{paymentMethod.icon}</span>
          <div>
            <h4 className="font-semibold text-gray-900">{paymentMethod.name}</h4>
            <p className="text-sm text-gray-600">{paymentMethod.description}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amount to Pay:</span>
            <span className="text-2xl font-bold text-blue-600">
              PHP {(amount / 100).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Mockup Payment Form */}
      <div className="mb-6 p-6 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
        <h4 className="text-lg font-semibold mb-4 text-gray-900">Payment Details</h4>
        
        {paymentMethod.type === 'card' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
              <input 
                type="text" 
                placeholder="4120 0000 0000 0000" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                <input 
                  type="text" 
                  placeholder="MM/YY" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                <input 
                  type="text" 
                  placeholder="123" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
              </div>
            </div>
          </>
        )}

        {(paymentMethod.type === 'gcash' || paymentMethod.type === 'grab_pay' || paymentMethod.type === 'paymaya') && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">{paymentMethod.icon}</div>
            <p className="text-gray-900 font-medium mb-4">You will be redirected to {paymentMethod.name} to complete your payment</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-sm text-green-800 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Ready to proceed
            </div>
          </div>
        )}

        {/* Mockup Notice */}
        <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
          <div className="flex gap-3">
            <span className="text-yellow-600 text-xl">⚠️</span>
            <div className="flex-1">
              <h5 className="font-semibold text-yellow-900 mb-1">Mockup Mode</h5>
              <p className="text-sm text-yellow-900 font-medium">
                This is a visual mockup of PayMongo integration. 
                The actual payment gateway will be integrated later.
                Clicking "Complete Payment" will simulate a successful transaction.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          disabled={processing}
        >
          ← Back
        </button>
        <button
          onClick={handlePay}
          disabled={processing}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {processing ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Processing...
            </>
          ) : (
            <>Complete Payment</>
          )}
        </button>
      </div>

      {/* Security Badges */}
      <div className="mt-6 flex justify-center items-center gap-4 text-xs text-gray-700 font-medium">
        <span className="flex items-center gap-1">
          <span>🔒</span> Secure Payment
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <span>✓</span> PCI DSS Compliant
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <span>🛡️</span> Encrypted
        </span>
      </div>
    </div>
  );
};

export const DragonpayMockup: React.FC<PaymentMockupProps> = ({ 
  paymentMethod, 
  amount, 
  onComplete, 
  onBack 
}) => {
  const [processing, setProcessing] = React.useState(false);
  const [selectedProcessor, setSelectedProcessor] = React.useState<string>('');

  const handlePay = () => {
    if (!selectedProcessor) {
      alert('Please select a payment processor');
      return;
    }
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      onComplete();
    }, 2000);
  };

  // Mock processor options based on payment type
  const getProcessors = () => {
    if (paymentMethod.type === 'online_banking') {
      return [
        { code: 'BDO', name: 'BDO Online Banking', icon: '🏦' },
        { code: 'BPI', name: 'BPI Online', icon: '🏦' },
        { code: 'UBP', name: 'UnionBank Online', icon: '🏦' },
        { code: 'MBTC', name: 'Metrobank Direct', icon: '🏦' },
        { code: 'RCBC', name: 'RCBC Online Banking', icon: '🏦' },
      ];
    } else if (paymentMethod.type === 'otc') {
      return [
        { code: '711', name: '7-Eleven', icon: '🏪' },
        { code: 'CEBL', name: 'Cebuana Lhuillier', icon: '🏪' },
        { code: 'MLH', name: 'M.Lhuillier', icon: '🏪' },
        { code: 'SMR', name: 'SM Payment Center', icon: '🏪' },
        { code: 'BAYD', name: 'Bayad Center', icon: '🏪' },
      ];
    } else {
      return [
        { code: 'GCASH', name: 'GCash', icon: '📱' },
        { code: 'GRABPAY', name: 'GrabPay', icon: '🚗' },
        { code: 'PYMY', name: 'PayMaya', icon: '💰' },
      ];
    }
  };

  const processors = getProcessors();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Dragonpay Branding */}
      <div className="mb-6 p-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg">
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="text-xl font-bold">Dragonpay</h3>
            <p className="text-sm opacity-90">Payment Gateway Philippines</p>
          </div>
          <div className="text-4xl">🐉</div>
        </div>
      </div>

      {/* Payment Method Info */}
      <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{paymentMethod.icon}</span>
          <div>
            <h4 className="font-semibold text-gray-900">{paymentMethod.name}</h4>
            <p className="text-sm text-gray-600">{paymentMethod.description}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-orange-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amount to Pay:</span>
            <span className="text-2xl font-bold text-orange-600">
              PHP {(amount / 100).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
          </div>
          {paymentMethod.fees && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">Processing Fee:</span>
              <span className="text-sm text-gray-600">{paymentMethod.fees}</span>
            </div>
          )}
        </div>
      </div>

      {/* Processor Selection */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-900">Select Payment Channel</h4>
        <div className="grid grid-cols-1 gap-3">
          {processors.map((processor) => (
            <button
              key={processor.code}
              onClick={() => setSelectedProcessor(processor.code)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedProcessor === processor.code
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{processor.icon}</span>
                <span className="font-semibold text-gray-900">{processor.name}</span>
                {selectedProcessor === processor.code && (
                  <span className="ml-auto text-orange-500 font-bold text-lg">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Processing Info for OTC */}
      {paymentMethod.type === 'otc' && selectedProcessor && (
        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
          <h5 className="font-semibold text-blue-900 mb-2">Payment Instructions:</h5>
          <ol className="text-sm text-blue-900 font-medium space-y-1 list-decimal list-inside">
            <li>Click "Generate Payment Code" below</li>
            <li>Save or print your payment reference number</li>
            <li>Visit any {processors.find(p => p.code === selectedProcessor)?.name} branch</li>
            <li>Present reference number and pay the amount</li>
            <li>Your booking will be confirmed within 1-2 hours</li>
          </ol>
        </div>
      )}

      {/* Mockup Notice */}
      <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
        <div className="flex gap-3">
          <span className="text-yellow-600 text-xl">⚠️</span>
          <div className="flex-1">
            <h5 className="font-semibold text-yellow-900 mb-1">Mockup Mode</h5>
            <p className="text-sm text-yellow-900 font-medium">
              This is a visual mockup of Dragonpay integration. 
              The actual payment gateway will be integrated later.
              Clicking the button will simulate the payment flow.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          disabled={processing}
        >
          ← Back
        </button>
        <button
          onClick={handlePay}
          disabled={processing || !selectedProcessor}
          className="px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {processing ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {paymentMethod.type === 'otc' ? 'Generating...' : 'Processing...'}
            </>
          ) : (
            <>{paymentMethod.type === 'otc' ? 'Generate Payment Code' : 'Proceed to Payment'}</>
          )}
        </button>
      </div>

      {/* Security Badges */}
      <div className="mt-6 flex justify-center items-center gap-4 text-xs text-gray-700 font-medium">
        <span className="flex items-center gap-1">
          <span>🔒</span> Secure
        </span>
        <span>•</span>
        <span>Trusted since 2005</span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <span>🛡️</span> Verified Merchant
        </span>
      </div>
    </div>
  );
};
