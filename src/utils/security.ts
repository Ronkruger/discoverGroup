// Frontend Security Utilities

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 20;
  }

  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  if (/[a-z]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Add lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Add uppercase letters');
  }

  if (/[0-9]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Add numbers');
  }

  if (/[!@#$%^&*()_+={}:;'"\\|,.<>/?-]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Add special characters (!@#$%^&*)');
  }

  // Check for common patterns
  const commonPatterns = ['123', 'password', 'qwerty', 'abc', '111', '000'];
  if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    score -= 20;
    feedback.push('Avoid common patterns');
  }

  return {
    isValid: score >= 60 && feedback.length === 0,
    score: Math.max(0, Math.min(100, score)),
    feedback,
  };
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score: number): {
  label: string;
  color: string;
} {
  if (score >= 80) return { label: 'Strong', color: 'text-green-600' };
  if (score >= 60) return { label: 'Good', color: 'text-blue-600' };
  if (score >= 40) return { label: 'Fair', color: 'text-yellow-600' };
  return { label: 'Weak', color: 'text-red-600' };
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  // Allow international formats
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Check if content contains suspicious patterns
 */
export function hasSuspiciousContent(content: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /<iframe/i,
    /<embed/i,
    /<object/i,
    /eval\(/i,
    /expression\(/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(content));
}

/**
 * Sanitize filename for upload
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/\.{2,}/g, '.') // Replace multiple dots with single dot
    .substring(0, 255); // Limit length
}

/**
 * Validate file type
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  const fileType = file.type.toLowerCase();
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  return allowedTypes.some(type => {
    if (type.includes('*')) {
      // Handle wildcards like 'image/*'
      const baseType = type.split('/')[0];
      return fileType.startsWith(baseType + '/');
    }
    return fileType === type || fileExtension === type.replace('.', '');
  });
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Store JWT token securely
 */
export function setAuthToken(token: string): void {
  // Use sessionStorage for sensitive tokens (cleared when browser closes)
  // Use localStorage only if "remember me" is checked
  sessionStorage.setItem('authToken', token);
}

/**
 * Get JWT token
 */
export function getAuthToken(): string | null {
  return sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
}

/**
 * Remove JWT token
 */
export function removeAuthToken(): void {
  sessionStorage.removeItem('authToken');
  localStorage.removeItem('authToken');
}

/**
 * Check if token is expired (client-side check only)
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch {
    return true;
  }
}

/**
 * Generate CSRF token (for forms)
 */
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Rate limit function calls (client-side)
 */
export function rateLimit<T extends (...args: never[]) => unknown>(
  func: T,
  limitMs: number
): T {
  let lastCall = 0;
  
  return ((...args: never[]) => {
    const now = Date.now();
    if (now - lastCall < limitMs) {
      console.warn('Rate limit exceeded');
      return;
    }
    lastCall = now;
    return func(...args);
  }) as T;
}

/**
 * Debounce function (prevent spam)
 */
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: number;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), waitMs) as unknown as number;
  };
}

/**
 * Secure API request with automatic token injection
 */
export async function secureApiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Detect potential clickjacking attempt
 */
export function detectClickjacking(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true; // If we can't check, assume we're in an iframe
  }
}

/**
 * Prevent clipboard injection attacks
 */
export function sanitizeClipboardData(data: string): string {
  // Remove potential script tags and event handlers
  return data
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
}
