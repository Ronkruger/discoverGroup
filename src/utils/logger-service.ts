/**
 * Error Logging Service
 * Centralized error handling and logging
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: Date;
  userAgent?: string;
  url?: string;
}

class ErrorLogger {
  private isDevelopment: boolean;
  private logs: LogEntry[] = [];
  private maxLogs: number = 100;

  constructor() {
    this.isDevelopment = import.meta.env.DEV || false;
  }

  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  /**
   * Log a warning
   */
  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  /**
   * Log an error
   */
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : String(error)
    };
    
    this.log('error', message, errorContext);

    // Send to external error tracking service in production
    if (!this.isDevelopment) {
      this.sendToErrorTracker(message, errorContext);
    }
  }

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, context?: Record<string, unknown>) {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    };

    // Store in memory
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // Console output with appropriate method
    if (this.isDevelopment) {
      const consoleMethod = level === 'error' ? 'error' : 
                           level === 'warn' ? 'warn' : 
                           level === 'debug' ? 'debug' : 'log';
      
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`, context || '');
    }
  }

  /**
   * Send error to external tracking service
   */
  private sendToErrorTracker(message: string, context: Record<string, unknown>) {
    try {
      // TODO: Implement integration with error tracking service
      // Examples: Sentry, LogRocket, Bugsnag, etc.
      
      // For now, just attempt to send to backend
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      
      fetch(`${API_BASE_URL}/api/client-errors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch((_err) => {
        // Silently fail - don't create infinite error loop
        console.error('Failed to send error to tracker:', _err);
      });
    } catch {
      // Silently fail
    }
  }

  /**
   * Get all stored logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all stored logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Export logs as JSON string
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Export singleton instance
export const logger = new ErrorLogger();

// Export type for external use
export type { LogEntry, LogLevel };
