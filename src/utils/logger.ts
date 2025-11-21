/**
 * Production-safe logging utility
 * Only logs in development, silent in production
 */

const isDevelopment = import.meta.env.DEV;

/* eslint-disable @typescript-eslint/no-explicit-any */
export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    } else {
      // In production, you might want to send to error tracking service
      // Example: Sentry.captureException(args[0]);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};
