/**
 * Secure Token Storage Utility
 * 
 * Provides secure token management with automatic expiration checking
 * and XSS mitigation strategies for localStorage usage.
 * 
 * NOTE: localStorage is vulnerable to XSS attacks. For maximum security,
 * consider moving to httpOnly cookies in production.
 */

import { addCsrfHeader, handleCsrfError, clearCsrfToken } from './csrf';
import { getServerStatus, wakeUpServer } from './serverStatus';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';
const SESSION_TIMEOUT_MS = 1 * 60 * 60 * 1000; // 1 hour (matches access token expiry)

/**
 * Store authentication tokens with expiration time
 * @param accessToken - Short-lived JWT access token
 * @param refreshToken - Long-lived refresh token (optional)
 */
export function setToken(accessToken: string, refreshToken?: string): void {
  try {
    const expiresAt = Date.now() + SESSION_TIMEOUT_MS;
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
    
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  } catch (error) {
    console.error('Failed to store token:', error);
  }
}

/**
 * Get authentication token if valid, null if expired or missing
 */
export function getToken(): string | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (!token) {
      return null;
    }
    
    // Check expiration
    if (expiryStr) {
      const expiresAt = parseInt(expiryStr, 10);
      if (Date.now() > expiresAt) {
        // Token expired, clear it
        clearToken();
        console.warn('Session expired. Please login again.');
        return null;
      }
    }
    
    return token;
  } catch (error) {
    console.error('Failed to retrieve token:', error);
    return null;
  }
}

/**
 * Check if user has a valid token
 */
export function hasValidToken(): boolean {
  return getToken() !== null;
}

/**
 * Get refresh token from storage
 */
export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to retrieve refresh token:', error);
    return null;
  }
}

/**
 * Clear stored authentication token and CSRF token
 */
export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    clearCsrfToken(); // Also clear CSRF token
  } catch (error) {
    console.error('Failed to clear token:', error);
  }
}

/**
 * Get remaining session time in milliseconds
 */
export function getRemainingSessionTime(): number {
  try {
    const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryStr) return 0;
    
    const expiresAt = parseInt(expiryStr, 10);
    const remaining = expiresAt - Date.now();
    
    return remaining > 0 ? remaining : 0;
  } catch (error) {
    console.error('Failed to get session time:', error);
    return 0;
  }
}

/**
 * Extend session by resetting expiration time
 * Call this on user activity to implement "remember me" functionality
 */
export function extendSession(): void {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    const expiresAt = Date.now() + SESSION_TIMEOUT_MS;
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
  }
}

/**
 * Parse JWT token payload (without verification - for display only)
 * DO NOT use for security decisions - always verify server-side
 */
export function parseTokenPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to parse token:', error);
    return null;
  }
}

/**
 * Get user ID from token (client-side only, not for security)
 */
export function getUserIdFromToken(): string | null {
  const token = getToken();
  if (!token) return null;
  
  const payload = parseTokenPayload(token);
  if (!payload || typeof payload.id !== 'string') return null;
  
  return payload.id;
}

/**
 * Get user role from token (client-side only, not for security)
 */
export function getUserRoleFromToken(): string | null {
  const token = getToken();
  if (!token) return null;
  
  const payload = parseTokenPayload(token);
  if (!payload || typeof payload.role !== 'string') return null;
  
  return payload.role;
}

/**
 * Add Authorization header to fetch options
 */
export function addAuthHeader(options: RequestInit = {}): RequestInit {
  const token = getToken();
  
  if (!token) {
    return options;
  }
  
  return {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  };
}

/**
 * Make authenticated fetch request with automatic token handling and CSRF protection
 * Includes both JWT authentication and CSRF tokens for state-changing requests
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token available. Please login.');
  }
  
  // Check server status and attempt to wake it up if needed
  const serverStatus = await getServerStatus();
  
  if (!serverStatus.isOnline) {
    console.log('🔄 Server appears to be down, attempting to wake it up...');
    const wakeUpSuccess = await wakeUpServer();
    
    if (!wakeUpSuccess) {
      throw new Error('The server is currently unavailable. This may be due to the free hosting tier going to sleep. Please try again in a moment.');
    }
  }
  
  // Start with base headers including authentication
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    'Authorization': `Bearer ${token}`,
  };
  
  // Add CSRF token for state-changing methods
  const stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  const method = (options.method || 'GET').toUpperCase();
  
  if (stateChangingMethods.includes(method)) {
    try {
      const headersWithCsrf = await addCsrfHeader(headers);
      Object.assign(headers, headersWithCsrf);
    } catch (error) {
      console.warn('Failed to add CSRF header:', error);
      // Continue without CSRF header - server will reject if needed
    }
  }
  
  const requestOptions = {
    ...options,
    headers,
    credentials: 'include' as RequestCredentials, // Include cookies for CSRF
  };
  
  try {
    const response = await fetch(url, requestOptions);
    
    // If 401, token is invalid - clear it
    if (response.status === 401) {
      clearToken();
      clearCsrfToken();
      throw new Error('Authentication failed. Please login again.');
    }
    
    // If 403 with CSRF error, retry with new token
    if (response.status === 403) {
      try {
        const errorData = await response.clone().json();
        if (errorData.code === 'CSRF_TOKEN_INVALID') {
          console.warn('CSRF token invalid, retrying with new token...');
          return await handleCsrfError(async () => {
            // Recursive call with new CSRF token
            return authFetch(url, options);
          });
        }
      } catch {
        // Not a JSON response or different error, return original response
      }
    }
    
    return response;
  } catch (error) {
    // Handle network errors (server down, timeout, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to reach the server. The server may be temporarily unavailable or sleeping.');
    }
    
    throw error;
  }
}
