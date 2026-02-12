// Security and Version Configuration
export const SECURITY_CONFIG = {
  VERSION: '1.2.0',
  LAST_UPDATED: '2026-02-12',
  FEATURES: [
    'CSRF Protection',
    'XSS Prevention',
    'SQL Injection Protection',
    'NoSQL Injection Protection',
    'Rate Limiting',
    'Helmet Security Headers',
    'Input Sanitization',
    'HTTPS Enforcement',
    'Cookie Security',
    'CORS Protection',
    'Request Size Limiting',
    'Suspicious Activity Monitoring',
  ],
} as const;

export const APP_VERSION = '1.0.0';

export default {
  APP_VERSION,
  SECURITY_CONFIG,
};
