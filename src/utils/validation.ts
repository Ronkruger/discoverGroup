/**
 * Form validation utilities
 */

export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  phone: (phone: string): boolean => {
    // Philippine phone number: +639xxxxxxxxx or 09xxxxxxxxx
    const phoneRegex = /^(\+639|09)\d{9}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  },

  passport: (passport: string): boolean => {
    // Basic passport validation (alphanumeric, 6-9 characters)
    const passportRegex = /^[A-Z0-9]{6,9}$/i;
    return passportRegex.test(passport);
  },

  required: (value: string): boolean => {
    return value.trim().length > 0;
  },

  minLength: (value: string, min: number): boolean => {
    return value.trim().length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.trim().length <= max;
  }
};

export function validateEmail(email: string): string | null {
  if (!validators.required(email)) {
    return 'Email is required';
  }
  if (!validators.email(email)) {
    return 'Please enter a valid email address';
  }
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!validators.required(phone)) {
    return 'Phone number is required';
  }
  if (!validators.phone(phone)) {
    return 'Please enter a valid Philippine phone number';
  }
  return null;
}

export function validatePassport(passport: string): string | null {
  if (!validators.required(passport)) {
    return 'Passport number is required';
  }
  if (!validators.passport(passport)) {
    return 'Please enter a valid passport number';
  }
  return null;
}
