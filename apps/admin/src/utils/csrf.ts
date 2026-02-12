/**
 * CSRF Token Management Utility
 * 
 * Handles fetching and including CSRF tokens in API requests
 * to protect against Cross-Site Request Forgery attacks
 */

const CSRF_TOKEN_KEY = 'csrf_token';
const CSRF_EXPIRY_KEY = 'csrf_expiry';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface CsrfTokenResponse {
  csrfToken: string;
  expiresIn: number; // seconds
}

let csrfToken: string | null = null;
let csrfExpiry: number = 0;

/**
 * Fetch a new CSRF token from the server
 */
export async function fetchCsrfToken(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/csrf-token`, {
      method: 'GET',
      credentials: 'include', // Important: include cookies
    });

    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }

    const data: CsrfTokenResponse = await response.json();
    
    // Store token and expiry
    csrfToken = data.csrfToken;
    csrfExpiry = Date.now() + (data.expiresIn * 1000);
    
    // Also store in sessionStorage for persistence across components
    sessionStorage.setItem(CSRF_TOKEN_KEY, csrfToken);
    sessionStorage.setItem(CSRF_EXPIRY_KEY, csrfExpiry.toString());
    
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    throw error;
  }
}

/**
 * Get current CSRF token, fetching a new one if needed
 */
export async function getCsrfToken(): Promise<string> {
  // Check memory cache first
  if (csrfToken && Date.now() < csrfExpiry) {
    return csrfToken;
  }

  // Check sessionStorage
  const storedToken = sessionStorage.getItem(CSRF_TOKEN_KEY);
  const storedExpiry = sessionStorage.getItem(CSRF_EXPIRY_KEY);

  if (storedToken && storedExpiry) {
    const expiry = parseInt(storedExpiry, 10);
    if (Date.now() < expiry) {
      csrfToken = storedToken;
      csrfExpiry = expiry;
      return csrfToken;
    }
  }

  // Token expired or not available, fetch new one
  return await fetchCsrfToken();
}

/**
 * Clear stored CSRF token
 * Call this on logout or when token becomes invalid
 */
export function clearCsrfToken(): void {
  csrfToken = null;
  csrfExpiry = 0;
  sessionStorage.removeItem(CSRF_TOKEN_KEY);
  sessionStorage.removeItem(CSRF_EXPIRY_KEY);
}

/**
 * Check if we need to refresh the CSRF token
 * Returns true if token is missing or will expire soon (within 5 minutes)
 */
export function shouldRefreshCsrfToken(): boolean {
  if (!csrfToken) return true;
  
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() > (csrfExpiry - fiveMinutes);
}

/**
 * Add CSRF token to request headers
 * Should be called for all state-changing operations (POST, PUT, PATCH, DELETE)
 */
export async function addCsrfHeader(headers: HeadersInit = {}): Promise<HeadersInit> {
  // Only add CSRF token for state-changing methods
  // The server will check the X-CSRF-Token header
  try {
    const token = await getCsrfToken();
    return {
      ...headers,
      'X-CSRF-Token': token,
    };
  } catch (error) {
    console.error('Failed to add CSRF token to headers:', error);
    // Return headers without CSRF token - server will reject the request
    return headers;
  }
}

/**
 * Handle CSRF token errors (typically 403 with CSRF_TOKEN_INVALID code)
 * Automatically refetches token and retries the request once
 */
export async function handleCsrfError(
  originalFetch: () => Promise<Response>
): Promise<Response> {
  try {
    // Clear old token and fetch new one
    clearCsrfToken();
    await fetchCsrfToken();
    
    // Retry the original request
    return await originalFetch();
  } catch (error) {
    console.error('Failed to retry request after CSRF error:', error);
    throw error;
  }
}

/**
 * Initialize CSRF protection
 * Call this when the app starts to pre-fetch a CSRF token
 */
export async function initializeCsrf(): Promise<void> {
  try {
    await fetchCsrfToken();
    console.log('✅ CSRF protection initialized');
  } catch (error) {
    console.warn('⚠️  Failed to initialize CSRF protection:', error);
    // Don't throw - app can still work, token will be fetched when needed
  }
}
