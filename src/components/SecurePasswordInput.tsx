import React, { useEffect, useState } from 'react';
import { Shield, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { validatePasswordStrength, getPasswordStrengthLabel } from '../utils/security';

interface SecurePasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  showStrengthIndicator?: boolean;
  className?: string;
}

export default function SecurePasswordInput({
  value,
  onChange,
  label = 'Password',
  placeholder = 'Enter password',
  required = false,
  showStrengthIndicator = true,
  className = '',
}: SecurePasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState({ isValid: false, score: 0, feedback: [] as string[] });
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (value) {
      setStrength(validatePasswordStrength(value));
    } else {
      setStrength({ isValid: false, score: 0, feedback: [] });
    }
  }, [value]);

  const strengthLabel = getPasswordStrengthLabel(strength.score);
  const showFeedback = touched && value.length > 0 && !strength.isValid;

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Shield className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          required={required}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoComplete="new-password"
        />
        
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      </div>

      {showStrengthIndicator && value.length > 0 && (
        <div className="space-y-2">
          {/* Strength bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  strength.score >= 80
                    ? 'bg-green-500'
                    : strength.score >= 60
                    ? 'bg-blue-500'
                    : strength.score >= 40
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${strength.score}%` }}
              />
            </div>
            <span className={`text-sm font-medium ${strengthLabel.color}`}>
              {strengthLabel.label}
            </span>
          </div>

          {/* Feedback */}
          {showFeedback && strength.feedback.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm font-medium text-yellow-800 mb-1">
                Password requirements:
              </p>
              <ul className="space-y-1">
                {strength.feedback.map((feedback, index) => (
                  <li key={index} className="text-sm text-yellow-700 flex items-center gap-2">
                    <XCircle className="h-4 w-4 flex-shrink-0" />
                    {feedback}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Success message */}
          {strength.isValid && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Strong password!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
