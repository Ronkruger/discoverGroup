/**
 * Server Status Utility
 * 
 * Monitors API server status and provides fallback handling
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface ServerStatus {
  isOnline: boolean;
  lastChecked: number;
  responseTime?: number;
}

let serverStatus: ServerStatus = {
  isOnline: true,
  lastChecked: 0,
};

/**
 * Check if the API server is responding
 */
export async function checkServerStatus(): Promise<ServerStatus> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const responseTime = Date.now() - startTime;
    
    serverStatus = {
      isOnline: response.ok,
      lastChecked: Date.now(),
      responseTime,
    };
    
    if (response.ok) {
      console.log(`✅ Server is online (${responseTime}ms)`);
    } else {
      console.warn(`⚠️ Server responded with status ${response.status}`);
    }
    
  } catch (error) {
    serverStatus = {
      isOnline: false,
      lastChecked: Date.now(),
    };
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('⏰ Server health check timed out (likely sleeping)');
    } else {
      console.warn('❌ Server is not responding:', error instanceof Error ? error.message : String(error));
    }
  }
  
  return serverStatus;
}

/**
 * Get cached server status (with optional fresh check)
 */
export async function getServerStatus(forceCheck: boolean = false): Promise<ServerStatus> {
  // Use cached status if it's recent (less than 30 seconds old)
  const cacheAge = Date.now() - serverStatus.lastChecked;
  const maxCacheAge = 30 * 1000; // 30 seconds
  
  if (!forceCheck && cacheAge < maxCacheAge) {
    return serverStatus;
  }
  
  return await checkServerStatus();
}

/**
 * Wait for server to wake up (useful for sleeping servers on free hosting)
 */
export async function waitForServer(maxWaitTime: number = 30000): Promise<boolean> {
  const startTime = Date.now();
  console.log('🔄 Waiting for server to wake up...');
  
  while (Date.now() - startTime < maxWaitTime) {
    const status = await checkServerStatus();
    
    if (status.isOnline) {
      console.log('✅ Server is now online!');
      return true;
    }
    
    // Wait 2 seconds before next check
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.warn('⏰ Timed out waiting for server to wake up');
  return false;
}

/**
 * Display user-friendly server status message
 */
export function getServerStatusMessage(status: ServerStatus): string {
  if (status.isOnline) {
    return status.responseTime 
      ? `Server is online (${status.responseTime}ms response time)`
      : 'Server is online';
  }
  
  const timeSinceCheck = Date.now() - status.lastChecked;
  const secondsAgo = Math.floor(timeSinceCheck / 1000);
  
  return `Server is not responding (checked ${secondsAgo}s ago). This may be due to free tier hosting going to sleep after inactivity.`;
}

/**
 * Create a function to wake up the server with multiple attempts
 */
export async function wakeUpServer(): Promise<boolean> {
  console.log('🚀 Attempting to wake up server...');
  
  // Try multiple wake-up requests
  const wakeUpPromises = [
    fetch(`${API_BASE_URL}/health`).catch(() => null),
    fetch(`${API_BASE_URL}/`).catch(() => null),
    fetch(`${API_BASE_URL}/api/csrf-token`).catch(() => null),
  ];
  
  // Send all requests simultaneously
  await Promise.allSettled(wakeUpPromises);
  
  // Wait for server to respond
  return await waitForServer(30000);
}