import React from 'react';
import { Shield, Lock, Headphones, Award, Clock, RefreshCw } from 'lucide-react';

export const TrustSignals: React.FC<{ className?: string }> = ({ className = "" }) => {
  const signals = [
    {
      icon: <Shield className="w-5 h-5 text-green-400" />,
      title: "Secure Payment",
      description: "256-bit SSL encryption"
    },
    {
      icon: <Lock className="w-5 h-5 text-blue-400" />,
      title: "Data Protection",
      description: "GDPR compliant"
    },
    {
      icon: <Headphones className="w-5 h-5 text-purple-400" />,
      title: "24/7 Support",
      description: "Expert assistance"
    },
    {
      icon: <Award className="w-5 h-5 text-yellow-400" />,
      title: "Best Price",
      description: "Guaranteed"
    }
  ];

  return (
    <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {signals.map((signal, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className="mb-2">{signal.icon}</div>
            <div className="text-sm font-medium text-white">{signal.title}</div>
            <div className="text-xs text-slate-300">{signal.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const UrgencyIndicators: React.FC<{ 
  spotsRemaining?: number;
  viewersCount?: number;
  priceIncrease?: boolean;
  className?: string;
}> = ({ 
  spotsRemaining = 3, 
  viewersCount = 8, 
  priceIncrease = false,
  className = ""
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Spots Remaining */}
      {spotsRemaining <= 5 && (
        <div className="flex items-center gap-2 text-sm bg-red-500/20 border border-red-500/30 rounded-lg p-3">
          <Clock className="w-4 h-4 text-red-400" />
          <span className="text-red-200">
            <span className="font-semibold">Only {spotsRemaining} spots remaining</span> for this departure
          </span>
        </div>
      )}

      {/* Other Viewers */}
      {viewersCount > 0 && (
        <div className="flex items-center gap-2 text-sm bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <span className="text-blue-200">
            <span className="font-semibold">{viewersCount} other travelers</span> are viewing this tour
          </span>
        </div>
      )}

      {/* Price Increase Warning */}
      {priceIncrease && (
        <div className="flex items-center gap-2 text-sm bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
          <RefreshCw className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-200">
            Prices may increase soon. <span className="font-semibold">Book now to secure current rate</span>
          </span>
        </div>
      )}
    </div>
  );
};

export const BookingProtection: React.FC<{ className?: string }> = ({ className = "" }) => {
  const protections = [
    "Free cancellation up to 48 hours",
    "100% guaranteed departures",
    "24/7 emergency support",
    "Travel insurance included"
  ];

  return (
    <div className={`bg-green-500/20 border border-green-500/30 rounded-lg p-4 ${className}`}>
      <h4 className="font-semibold text-green-200 mb-3 flex items-center gap-2">
        <Shield className="w-5 h-5" />
        Your Booking is Protected
      </h4>
      <ul className="space-y-2">
        {protections.map((protection, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-green-100">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            {protection}
          </li>
        ))}
      </ul>
    </div>
  );
};