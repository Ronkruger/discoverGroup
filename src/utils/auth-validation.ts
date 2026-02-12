/**
 * Authentication validation utilities
 * Handles token validation, expiration checks, and token refresh
 */

interface DecodedToken {
  exp: number;
  iat: number;
  userId: string;
  email: string;
}

/**
 * Decode JWT token without verification (client-side only)
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 * @param token JWT token
 * @param bufferMinutes Minutes before actual expiration to consider token expired (default: 5)
 */
export function isTokenExpired(token: string, bufferMinutes: number = 5): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const bufferTime = bufferMinutes * 60 * 1000;
  const now = Date.now();
  
  return now >= (expirationTime - bufferTime);
}

/**
 * Get token expiration date
 */
export function getTokenExpiration(token: string): Date | null {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  
  return new Date(decoded.exp * 1000);
}

/**
 * Validate token and return user data if valid
 */
export function validateStoredAuth(): { token: string; user: Record<string, unknown> } | null {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return null;
  }
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    console.log('Token expired, clearing auth data');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
  
  try {
    const user = JSON.parse(userStr) as Record<string, unknown>;
    return { token, user };
  } catch (error) {
    console.error('Failed to parse user data:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
}

/**
 * Refresh token before expiration
 */
export async function refreshAuthToken(): Promise<boolean> {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    
    const data = await response.json();
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return false;
  }
}

/**
 * Setup automatic token refresh
 * Returns cleanup function
 */
export function setupTokenRefresh(onExpired: () => void): () => void {
  const checkInterval = setInterval(async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      onExpired();
      return;
    }
    
    // If token expires in less than 10 minutes, try to refresh
    if (isTokenExpired(token, 10)) {
      const refreshed = await refreshAuthToken();
      
      if (!refreshed) {
        // Refresh failed, token is expired
        onExpired();
      }
    }
  }, 60000); // Check every minute
  
  // Return cleanup function
  return () => clearInterval(checkInterval);
}
