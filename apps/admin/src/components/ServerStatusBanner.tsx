import React, { useEffect, useState } from 'react';
import { getServerStatus, getServerStatusMessage, wakeUpServer } from '../utils/serverStatus';

interface ServerStatus {
  isOnline: boolean;
  lastChecked: number;
  responseTime?: number;
}

export const ServerStatusBanner: React.FC = () => {
  const [serverStatus, setServerStatus] = useState<ServerStatus>({ isOnline: true, lastChecked: 0 });
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const checkStatus = async () => {
    const status = await getServerStatus(true);
    setServerStatus(status);
    setShowBanner(!status.isOnline);
  };

  const handleWakeUp = async () => {
    setIsWakingUp(true);
    try {
      const success = await wakeUpServer();
      if (success) {
        setShowBanner(false);
        setServerStatus(prev => ({ ...prev, isOnline: true }));
      }
    } catch (error) {
      console.error('Failed to wake up server:', error);
    } finally {
      setIsWakingUp(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkStatus();
    
    // Periodic checks every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (!showBanner) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-yellow-200 border-l-4 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Server Status:</strong> {getServerStatusMessage(serverStatus)}
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Free tier hosting services go to sleep after periods of inactivity.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleWakeUp}
            disabled={isWakingUp}
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-medium px-3 py-1 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isWakingUp ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-1 h-3 w-3 text-yellow-800"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Waking Up...
              </span>
            ) : (
              'Wake Up Server'
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowBanner(false)}
            className="text-yellow-400 hover:text-yellow-600 transition-colors duration-200"
          >
            <span className="sr-only">Dismiss</span>
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};