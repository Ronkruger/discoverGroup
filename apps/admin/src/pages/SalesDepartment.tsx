import React, { JSX, useEffect, useState } from "react";

interface MetaMessengerConfig {
  pageId: string;
  appId: string;
  enabled: boolean;
}

export default function SalesDepartment(): JSX.Element {
  const [config, setConfig] = useState<MetaMessengerConfig>({
    pageId: "",
    appId: "",
    enabled: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Load saved configuration from localStorage
    const savedConfig = localStorage.getItem('metaMessengerConfig');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Failed to load Meta Messenger config:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Load Meta Business Suite SDK
    if (config.enabled && config.appId && config.pageId) {
      const script = document.createElement('script');
      script.innerHTML = `
        window.fbAsyncInit = function() {
          FB.init({
            xfbml: true,
            version: 'v18.0'
          });
        };
      `;
      document.head.appendChild(script);

      const sdk = document.createElement('script');
      sdk.src = 'https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js';
      sdk.async = true;
      sdk.defer = true;
      sdk.crossOrigin = 'anonymous';
      document.body.appendChild(sdk);

      return () => {
        document.head.removeChild(script);
        document.body.removeChild(sdk);
      };
    }
  }, [config.enabled, config.appId, config.pageId]);

  const handleSave = () => {
    setIsSaving(true);
    setMessage(null);

    // Validate inputs
    if (config.enabled && (!config.pageId || !config.appId)) {
      setMessage({ type: 'error', text: 'Please provide both Page ID and App ID when enabling messenger' });
      setIsSaving(false);
      return;
    }

    try {
      // Save to localStorage
      localStorage.setItem('metaMessengerConfig', JSON.stringify(config));
      setMessage({ type: 'success', text: 'Meta Messenger configuration saved successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setIsSaving(false);
    }
  };

  const testMessenger = () => {
    if (config.enabled && config.pageId) {
      // Open Facebook Messenger in new window
      window.open(`https://m.me/${config.pageId}`, '_blank', 'width=400,height=600');
    } else {
      setMessage({ type: 'error', text: 'Please enable and configure messenger first' });
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "20px auto", padding: "0 20px" }}>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>Sales Department</h1>
        <p style={{ color: "#666", fontSize: 15 }}>
          Connect and manage your Meta Business Suite Messenger automation for sales inquiries
        </p>
      </div>

      {/* Status Banner */}
      <div style={{
        background: config.enabled ? '#d4edda' : '#fff3cd',
        border: `1px solid ${config.enabled ? '#c3e6cb' : '#ffeaa7'}`,
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: config.enabled ? '#28a745' : '#ffc107',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20
        }}>
          {config.enabled ? '✓' : '⚠'}
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            {config.enabled ? 'Meta Messenger Integration Active' : 'Meta Messenger Integration Inactive'}
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>
            {config.enabled 
              ? 'Your sales team can receive and respond to customer messages via Facebook Messenger'
              : 'Configure and enable Meta Messenger to start receiving customer inquiries'}
          </div>
        </div>
      </div>

      {/* Configuration Section */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Meta Business Suite Configuration</h2>

        <div style={{ marginBottom: 20 }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            padding: 12,
            background: '#f9fafb',
            borderRadius: 8,
            border: '1px solid #e5e7eb'
          }}>
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              style={{ width: 20, height: 20, cursor: 'pointer' }}
            />
            <div>
              <div style={{ fontWeight: 600 }}>Enable Meta Messenger Integration</div>
              <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                Activate Facebook Messenger chat widget on your website
              </div>
            </div>
          </label>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>
              Facebook Page ID *
            </label>
            <input
              type="text"
              value={config.pageId}
              onChange={(e) => setConfig({ ...config, pageId: e.target.value })}
              placeholder="Enter your Facebook Page ID (e.g., 123456789012345)"
              disabled={!config.enabled}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14,
                opacity: config.enabled ? 1 : 0.6
              }}
            />
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
              Find your Page ID in Meta Business Suite → Settings → Page Info
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>
              Facebook App ID *
            </label>
            <input
              type="text"
              value={config.appId}
              onChange={(e) => setConfig({ ...config, appId: e.target.value })}
              placeholder="Enter your Facebook App ID (e.g., 987654321098765)"
              disabled={!config.enabled}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14,
                opacity: config.enabled ? 1 : 0.6
              }}
            />
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
              Create an app at developers.facebook.com and add Messenger platform
            </div>
          </div>
        </div>

        {message && (
          <div style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 6,
            background: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {message.text}
          </div>
        )}

        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '10px 20px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 500,
              cursor: 'pointer',
              opacity: isSaving ? 0.7 : 1
            }}
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
          <button
            onClick={testMessenger}
            style={{
              padding: '10px 20px',
              background: '#fff',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Test Messenger
          </button>
        </div>
      </div>

      {/* Setup Instructions */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 24
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Setup Instructions</h2>
        
        <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 12 }}>
            Step 1: Create Facebook App
          </h3>
          <ol style={{ paddingLeft: 20, marginBottom: 20 }}>
            <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>developers.facebook.com</a></li>
            <li>Click "My Apps" → "Create App"</li>
            <li>Select "Business" as the app type</li>
            <li>Add "Messenger" platform to your app</li>
            <li>Copy your App ID from the dashboard</li>
          </ol>

          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            Step 2: Connect Facebook Page
          </h3>
          <ol style={{ paddingLeft: 20, marginBottom: 20 }}>
            <li>Go to <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>Meta Business Suite</a></li>
            <li>Select your business page</li>
            <li>Go to Settings → Page Info</li>
            <li>Copy your Page ID</li>
            <li>In your app dashboard, add this page under Messenger → Settings</li>
          </ol>

          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            Step 3: Configure Messenger
          </h3>
          <ol style={{ paddingLeft: 20, marginBottom: 20 }}>
            <li>Enter your Page ID and App ID above</li>
            <li>Enable the integration</li>
            <li>Click "Save Configuration"</li>
            <li>Test the messenger using "Test Messenger" button</li>
          </ol>

          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            Step 4: Set Up Automation (Optional)
          </h3>
          <ol style={{ paddingLeft: 20, marginBottom: 0 }}>
            <li>In Meta Business Suite, go to Inbox → Automated Responses</li>
            <li>Set up instant replies for common sales inquiries</li>
            <li>Configure away messages for off-hours</li>
            <li>Create FAQ responses for tour packages</li>
            <li>Set up lead qualification questions</li>
          </ol>
        </div>
      </div>

      {/* Messenger Preview (if enabled) */}
      {config.enabled && config.pageId && config.appId && (
        <div style={{
          marginTop: 24,
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 24
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Messenger Chat Widget Preview</h2>
          <p style={{ color: '#666', marginBottom: 16 }}>
            This is how the Messenger chat widget will appear on your website:
          </p>
          
          {/* Facebook Messenger Customer Chat Plugin */}
          <div id="fb-root"></div>
          <div
            className="fb-customerchat"
            data-page-id={config.pageId}
            data-theme-color="#0084ff"
            data-logged-in-greeting="Hi! How can we help you with your travel plans today?"
            data-logged-out-greeting="Hi! How can we help you with your travel plans today?"
          ></div>
        </div>
      )}
    </div>
  );
}
