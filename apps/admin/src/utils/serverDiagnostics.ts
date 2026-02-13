/**
 * Server Diagnostics Utility
 * 
 * Provides comprehensive server testing and diagnostic functions
 * for troubleshooting connectivity issues
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface DiagnosticResult {
  test: string;
  success: boolean;
  responseTime?: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface DiagnosticReport {
  timestamp: string;
  baseUrl: string;
  overallHealth: 'healthy' | 'degraded' | 'unhealthy';
  results: DiagnosticResult[];
  suggestions: string[];
}

/**
 * Test server connectivity with basic health check
 */
export async function testServerConnectivity(): Promise<DiagnosticResult> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      return {
        test: 'Health Check',
        success: true,
        responseTime,
        details: data,
      };
    } else {
      return {
        test: 'Health Check',
        success: false,
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error) {
    return {
      test: 'Health Check',
      success: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test CSRF token endpoint
 */
export async function testCsrfEndpoint(): Promise<DiagnosticResult> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${API_BASE_URL}/api/csrf-token`, {
      method: 'GET',
      credentials: 'include',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      return {
        test: 'CSRF Token',
        success: true,
        responseTime,
        details: {
          tokenLength: data.csrfToken?.length,
          expiresIn: data.expiresIn,
        },
      };
    } else {
      return {
        test: 'CSRF Token',
        success: false,
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error) {
    return {
      test: 'CSRF Token',
      success: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test CORS configuration
 */
export async function testCorsConfiguration(): Promise<DiagnosticResult> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'OPTIONS',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    const corsHeaders = {
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      'access-control-allow-credentials': response.headers.get('access-control-allow-credentials'),
      'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
    };
    
    return {
      test: 'CORS Configuration',
      success: response.ok,
      responseTime,
      details: corsHeaders,
      error: !response.ok ? `HTTP ${response.status}: ${response.statusText}` : undefined,
    };
  } catch (error) {
    return {
      test: 'CORS Configuration',
      success: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test DNS resolution and basic connectivity
 */
export async function testDnsResolution(): Promise<DiagnosticResult> {
  const startTime = Date.now();
  
  try {
    const url = new URL(API_BASE_URL);
    
    // Simple fetch test to check DNS and basic connectivity
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    await fetch(`${API_BASE_URL}/favicon.ico`, {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    return {
      test: 'DNS Resolution',
      success: true,
      responseTime,
      details: {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? '443' : '80'),
      },
    };
  } catch (error) {
    return {
      test: 'DNS Resolution',
      success: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Run comprehensive server diagnostics
 */
export async function runServerDiagnostics(): Promise<DiagnosticReport> {
  console.log('🔍 Running server diagnostics...');
  
  const results = await Promise.all([
    testDnsResolution(),
    testServerConnectivity(),
    testCorsConfiguration(),
    testCsrfEndpoint(),
  ]);
  
  const successfulTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  let overallHealth: DiagnosticReport['overallHealth'];
  if (successfulTests === totalTests) {
    overallHealth = 'healthy';
  } else if (successfulTests >= totalTests / 2) {
    overallHealth = 'degraded';
  } else {
    overallHealth = 'unhealthy';
  }
  
  const suggestions: string[] = [];
  
  // Generate suggestions based on failed tests
  results.forEach(result => {
    if (!result.success) {
      switch (result.test) {
        case 'DNS Resolution':
          suggestions.push('Check network connectivity and DNS settings');
          break;
        case 'Health Check':
          suggestions.push('API server may be down or sleeping (try waking it up)');
          break;
        case 'CORS Configuration':
          suggestions.push('CORS headers may be misconfigured on the server');
          break;
        case 'CSRF Token':
          suggestions.push('CSRF endpoint may be unavailable or misconfigured');
          break;
      }
    }
  });
  
  // Additional suggestions based on overall health
  if (overallHealth === 'unhealthy') {
    suggestions.push('Consider using a local development server for testing');
    suggestions.push('Check if the hosting service is experiencing outages');
  }
  
  const report: DiagnosticReport = {
    timestamp: new Date().toISOString(),
    baseUrl: API_BASE_URL,
    overallHealth,
    results,
    suggestions: [...new Set(suggestions)], // Remove duplicates
  };
  
  console.log('📊 Diagnostic Report:', report);
  return report;
}

/**
 * Format diagnostic report for display
 */
export function formatDiagnosticReport(report: DiagnosticReport): string {
  let output = `Server Diagnostic Report\n`;
  output += `========================\n`;
  output += `Timestamp: ${report.timestamp}\n`;
  output += `Base URL: ${report.baseUrl}\n`;
  output += `Overall Health: ${report.overallHealth.toUpperCase()}\n\n`;
  
  output += `Test Results:\n`;
  report.results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const timing = result.responseTime ? ` (${result.responseTime}ms)` : '';
    output += `${index + 1}. ${status} ${result.test}${timing}\n`;
    
    if (result.error) {
      output += `   Error: ${result.error}\n`;
    }
    
    if (result.details) {
      output += `   Details: ${JSON.stringify(result.details, null, 4)}\n`;
    }
    output += `\n`;
  });
  
  if (report.suggestions.length > 0) {
    output += `Suggestions:\n`;
    report.suggestions.forEach((suggestion, index) => {
      output += `${index + 1}. ${suggestion}\n`;
    });
  }
  
  return output;
}

/**
 * Export diagnostic report to JSON file (for saving)
 */
export function exportDiagnosticReport(report: DiagnosticReport): void {
  const dataStr = JSON.stringify(report, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `server-diagnostics-${Date.now()}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}