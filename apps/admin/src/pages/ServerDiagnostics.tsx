import React, { useState } from 'react';
import { runServerDiagnostics, exportDiagnosticReport, DiagnosticReport } from '../utils/serverDiagnostics';
import { wakeUpServer } from '../utils/serverStatus';

export const ServerDiagnosticsPage: React.FC = () => {
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);

  const handleRunDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    try {
      const report = await runServerDiagnostics();
      setDiagnosticReport(report);
    } catch (error) {
      console.error('Failed to run diagnostics:', error);
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  const handleWakeUpServer = async () => {
    setIsWakingUp(true);
    try {
      const success = await wakeUpServer();
      if (success) {
        // Re-run diagnostics to show updated status
        await handleRunDiagnostics();
      }
    } catch (error) {
      console.error('Failed to wake up server:', error);
    } finally {
      setIsWakingUp(false);
    }
  };

  const handleExportReport = () => {
    if (diagnosticReport) {
      exportDiagnosticReport(diagnosticReport);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Server Diagnostics</h1>
        
        {/* Control Panel */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Diagnostic Tools</h2>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleRunDiagnostics}
              disabled={isRunningDiagnostics}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunningDiagnostics ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                  Running Diagnostics...
                </span>
              ) : (
                'Run Full Diagnostics'
              )}
            </button>
            
            <button
              onClick={handleWakeUpServer}
              disabled={isWakingUp}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isWakingUp ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                  Waking Up Server...
                </span>
              ) : (
                'Wake Up Server'
              )}
            </button>
            
            {diagnosticReport && (
              <button
                onClick={handleExportReport}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
              >
                Export Report
              </button>
            )}
          </div>
        </div>
        
        {/* Diagnostic Results */}
        {diagnosticReport && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Diagnostic Results</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(diagnosticReport.overallHealth)}`}>
                  {diagnosticReport.overallHealth.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Generated at {new Date(diagnosticReport.timestamp).toLocaleString()}
              </p>
            </div>
            
            <div className="p-6">
              {/* Test Results */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">Test Results</h3>
                <div className="space-y-3">
                  {diagnosticReport.results.map((result, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md">
                      <span className="text-lg">
                        {result.success ? '✅' : '❌'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{result.test}</h4>
                          {result.responseTime && (
                            <span className="text-xs text-gray-500">
                              {result.responseTime}ms
                            </span>
                          )}
                        </div>
                        {result.error && (
                          <p className="text-sm text-red-600 mt-1">{result.error}</p>
                        )}
                        {result.details && (
                          <pre className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Suggestions */}
              {diagnosticReport.suggestions.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Suggestions</h3>
                  <ul className="space-y-2">
                    {diagnosticReport.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span className="text-sm text-gray-700">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-md font-medium text-blue-900 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-700 mb-3">
            If you're experiencing persistent issues, try the following steps:
          </p>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Run a full diagnostic to identify specific issues</li>
            <li>Try waking up the server if it appears to be sleeping</li>
            <li>Check your network connection</li>
            <li>Clear your browser cache and reload the page</li>
            <li>Contact the development team if issues persist</li>
          </ol>
          
          <div className="mt-4 p-3 bg-blue-100 rounded-md">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Free tier hosting services (like Render.com) automatically sleep after periods of inactivity. 
              This is normal behavior and the server should wake up within 30-60 seconds when accessed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};