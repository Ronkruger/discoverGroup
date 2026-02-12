import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { extendSession, getRemainingSessionTime } from '../utils/tokenStorage';

/**
 * Session Monitor Component
 * 
 * Monitors user session and provides:
 * - Automatic session extension on user activity
 * - Session expiration warnings
 * - Auto-logout on session expiration
 */

const SESSION_WARNING_TIME = 5 * 60 * 1000; // Warn 5 minutes before expiration
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every minute
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'];

export const SessionMonitor: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [showWarning, setShowWarning] = React.useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Extend session on user activity
    const handleActivity = () => {
      extendSession();
      setShowWarning(false);
    };

    // Add activity listeners
    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Check session periodically
    const checkSession = () => {
      const remaining = getRemainingSessionTime();

      if (remaining === 0) {
        // Session expired
        logout();
        alert('Your session has expired. Please login again.');
      } else if (remaining < SESSION_WARNING_TIME && remaining > 0) {
        // Show warning
        setShowWarning(true);
      }
    };

    const intervalId = setInterval(checkSession, ACTIVITY_CHECK_INTERVAL);

    // Cleanup
    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(intervalId);
    };
  }, [isAuthenticated, logout]);

  if (!showWarning) return null;

  const remaining = Math.ceil(getRemainingSessionTime() / 1000 / 60); // minutes

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Session Expiring Soon
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Your session will expire in approximately {remaining} minute{remaining !== 1 ? 's' : ''}. 
              Any activity will extend your session.
            </p>
          </div>
          <div className="mt-3">
            <button
              onClick={() => {
                extendSession();
                setShowWarning(false);
              }}
              className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
            >
              Stay logged in
            </button>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={() => setShowWarning(false)}
            className="inline-flex text-yellow-400 hover:text-yellow-500"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
