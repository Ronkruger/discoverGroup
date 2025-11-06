import React, { JSX, useEffect, useState } from "react";
import { Trash2, Plus, Edit2, Check, X, Eye, EyeOff } from "lucide-react";

interface MessengerAccount {
  id: string;
  name: string;
  pageId: string;
  appId: string;
  email: string;
  userId?: string; // Link to user account
  status: 'active' | 'inactive';
  createdAt: string;
}

interface MetaMessengerConfig {
  enabled: boolean;
  accounts: MessengerAccount[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface Message {
  id: string;
  sender: 'customer' | 'agent';
  text: string;
  timestamp: string;
}

interface MessengerConversation {
  id: string;
  customerName: string;
  customerMessengerId: string;
  status: 'new' | 'in-progress' | 'converted' | 'closed';
  assignedAgent: string;
  messages: Message[];
  lastMessageAt: string;
  createdAt: string;
}

interface ExtractedTransaction {
  id: string;
  conversationId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  tourInterest: string;
  preferredDates?: string;
  numberOfPeople?: number;
  estimatedBudget?: string;
  extractedAt: string;
  status: 'lead' | 'quoted' | 'booked' | 'lost';
  assignedAgent: string;
  notes?: string;
}

// Dummy data for conversations
const DUMMY_CONVERSATIONS: MessengerConversation[] = [
  {
    id: 'conv_001',
    customerName: 'Maria Santos',
    customerMessengerId: 'fb_12345',
    status: 'new',
    assignedAgent: 'John Doe',
    lastMessageAt: '2025-11-06T14:30:00Z',
    createdAt: '2025-11-06T14:25:00Z',
    messages: [
      {
        id: 'msg_001',
        sender: 'customer',
        text: 'Hi! I\'m interested in booking a tour to Boracay for my family.',
        timestamp: '2025-11-06T14:25:00Z'
      },
      {
        id: 'msg_002',
        sender: 'agent',
        text: 'Hello Maria! Thank you for your interest. How many people will be traveling and what dates are you looking at?',
        timestamp: '2025-11-06T14:27:00Z'
      },
      {
        id: 'msg_003',
        sender: 'customer',
        text: 'We are 4 people - 2 adults and 2 kids. We\'re looking at December 15-20. What\'s the price range?',
        timestamp: '2025-11-06T14:30:00Z'
      }
    ]
  },
  {
    id: 'conv_002',
    customerName: 'James Chen',
    customerMessengerId: 'fb_67890',
    status: 'converted',
    assignedAgent: 'John Doe',
    lastMessageAt: '2025-11-05T16:45:00Z',
    createdAt: '2025-11-05T10:15:00Z',
    messages: [
      {
        id: 'msg_004',
        sender: 'customer',
        text: 'Good morning! Do you have any packages for Palawan in January?',
        timestamp: '2025-11-05T10:15:00Z'
      },
      {
        id: 'msg_005',
        sender: 'agent',
        text: 'Good morning James! Yes, we have several Palawan packages. Can you share your budget and group size?',
        timestamp: '2025-11-05T10:20:00Z'
      },
      {
        id: 'msg_006',
        sender: 'customer',
        text: 'It\'s just me and my wife. Budget is around 50,000 PHP for 5 days.',
        timestamp: '2025-11-05T10:25:00Z'
      },
      {
        id: 'msg_007',
        sender: 'agent',
        text: 'Perfect! I have a 5D4N El Nido package that fits your budget. Let me send you the details.',
        timestamp: '2025-11-05T10:30:00Z'
      },
      {
        id: 'msg_008',
        sender: 'customer',
        text: 'Great! How do I book?',
        timestamp: '2025-11-05T16:40:00Z'
      },
      {
        id: 'msg_009',
        sender: 'agent',
        text: 'I\'ll send you the booking link. You can pay online or via bank transfer.',
        timestamp: '2025-11-05T16:45:00Z'
      }
    ]
  },
  {
    id: 'conv_003',
    customerName: 'Ana Rodriguez',
    customerMessengerId: 'fb_11223',
    status: 'in-progress',
    assignedAgent: 'John Doe',
    lastMessageAt: '2025-11-06T09:15:00Z',
    createdAt: '2025-11-04T15:30:00Z',
    messages: [
      {
        id: 'msg_010',
        sender: 'customer',
        text: 'Hi! I saw your Siargao tour. Is it still available for November 20?',
        timestamp: '2025-11-04T15:30:00Z'
      },
      {
        id: 'msg_011',
        sender: 'agent',
        text: 'Hi Ana! Yes, we still have slots for November 20. How many people?',
        timestamp: '2025-11-04T15:35:00Z'
      },
      {
        id: 'msg_012',
        sender: 'customer',
        text: '6 people. What\'s included in the package?',
        timestamp: '2025-11-04T15:40:00Z'
      },
      {
        id: 'msg_013',
        sender: 'agent',
        text: 'The package includes accommodation, island hopping, surfing lessons, and airport transfers. Total is 35,000 PHP per person.',
        timestamp: '2025-11-06T09:10:00Z'
      },
      {
        id: 'msg_014',
        sender: 'customer',
        text: 'That sounds good. Can I get a group discount?',
        timestamp: '2025-11-06T09:15:00Z'
      }
    ]
  }
];

// Dummy data for extracted transactions
const DUMMY_TRANSACTIONS: ExtractedTransaction[] = [
  {
    id: 'trans_001',
    conversationId: 'conv_002',
    customerName: 'James Chen',
    customerEmail: 'james.chen@email.com',
    customerPhone: '+639171234567',
    tourInterest: 'Palawan - El Nido Package',
    preferredDates: 'January 10-15, 2026',
    numberOfPeople: 2,
    estimatedBudget: '₱50,000',
    extractedAt: '2025-11-05T16:50:00Z',
    status: 'booked',
    assignedAgent: 'John Doe',
    notes: 'Paid full amount via bank transfer. Booking confirmed.'
  },
  {
    id: 'trans_002',
    conversationId: 'conv_001',
    customerName: 'Maria Santos',
    tourInterest: 'Boracay Family Package',
    preferredDates: 'December 15-20, 2025',
    numberOfPeople: 4,
    estimatedBudget: '₱80,000 - ₱100,000',
    extractedAt: '2025-11-06T14:32:00Z',
    status: 'lead',
    assignedAgent: 'John Doe',
    notes: 'Waiting for customer response on package details.'
  },
  {
    id: 'trans_003',
    conversationId: 'conv_003',
    customerName: 'Ana Rodriguez',
    customerPhone: '+639189876543',
    tourInterest: 'Siargao Surfing Package',
    preferredDates: 'November 20-24, 2025',
    numberOfPeople: 6,
    estimatedBudget: '₱210,000 (₱35,000 x 6)',
    extractedAt: '2025-11-06T09:17:00Z',
    status: 'quoted',
    assignedAgent: 'John Doe',
    notes: 'Negotiating group discount. Customer interested.'
  }
];

export default function SalesDepartment(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'accounts' | 'conversations' | 'transactions'>('accounts');
  const [config, setConfig] = useState<MetaMessengerConfig>({
    enabled: false,
    accounts: [],
  });
  
  const [newAccount, setNewAccount] = useState<Partial<MessengerAccount>>({
    name: '',
    pageId: '',
    appId: '',
    email: '',
  });
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<MessengerAccount>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Conversation states
  const [conversations] = useState<MessengerConversation[]>(DUMMY_CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] = useState<MessengerConversation | null>(null);
  const [transactions] = useState<ExtractedTransaction[]>(DUMMY_TRANSACTIONS);

  useEffect(() => {
    // Load saved configuration from localStorage
    const savedConfig = localStorage.getItem('metaMessengerConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        // Migrate old config format to new format
        if (parsed.pageId && parsed.appId && !parsed.accounts) {
          setConfig({
            enabled: parsed.enabled || false,
            accounts: [{
              id: '1',
              name: 'Default Account',
              pageId: parsed.pageId,
              appId: parsed.appId,
              email: 'sales@discovergrp.com',
              status: 'active',
              createdAt: new Date().toISOString()
            }]
          });
          // Save migrated config
          localStorage.setItem('metaMessengerConfig', JSON.stringify({
            enabled: parsed.enabled || false,
            accounts: [{
              id: '1',
              name: 'Default Account',
              pageId: parsed.pageId,
              appId: parsed.appId,
              email: 'sales@discovergrp.com',
              status: 'active',
              createdAt: new Date().toISOString()
            }]
          }));
        } else {
          setConfig(parsed);
        }
      } catch (e) {
        console.error('Failed to load Meta Messenger config:', e);
      }
    }
  }, []);

  const handleAddAccount = async () => {
    if (!newAccount.name || !newAccount.pageId || !newAccount.appId || !newAccount.email) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    if (!password || password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    setIsCreating(true);
    try {
      // Create user account in the system
      const token = localStorage.getItem('token');
      const userResponse = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: newAccount.email,
          password: password,
          fullName: newAccount.name,
          role: 'Sales Department',
          isActive: true
        })
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.message || 'Failed to create user account');
      }

      const userData = await userResponse.json();
      const userId = userData.id || userData._id;

      // Create messenger account
      const account: MessengerAccount = {
        id: Date.now().toString(),
        name: newAccount.name,
        pageId: newAccount.pageId,
        appId: newAccount.appId,
        email: newAccount.email || '',
        userId: userId,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      const updatedConfig = {
        ...config,
        accounts: [...config.accounts, account]
      };

      setConfig(updatedConfig);
      localStorage.setItem('metaMessengerConfig', JSON.stringify(updatedConfig));
      
      setNewAccount({ name: '', pageId: '', appId: '', email: '' });
      setPassword('');
      setShowAddForm(false);
      setMessage({ type: 'success', text: `Account "${account.name}" added successfully! User account created with email: ${account.email}` });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Error creating account:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to create account. Please try again.' 
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAccount = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;

    const updatedConfig = {
      ...config,
      accounts: config.accounts.filter(acc => acc.id !== id)
    };

    setConfig(updatedConfig);
    localStorage.setItem('metaMessengerConfig', JSON.stringify(updatedConfig));
    setMessage({ type: 'success', text: 'Account deleted successfully' });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleToggleStatus = (id: string) => {
    const updatedConfig = {
      ...config,
      accounts: config.accounts.map(acc =>
        acc.id === id
          ? { ...acc, status: acc.status === 'active' ? 'inactive' as const : 'active' as const }
          : acc
      )
    };

    setConfig(updatedConfig);
    localStorage.setItem('metaMessengerConfig', JSON.stringify(updatedConfig));
  };

  const startEdit = (account: MessengerAccount) => {
    setEditingId(account.id);
    setEditData({ ...account });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = (id: string) => {
    const updatedConfig = {
      ...config,
      accounts: config.accounts.map(acc =>
        acc.id === id ? { ...acc, ...editData } as MessengerAccount : acc
      )
    };

    setConfig(updatedConfig);
    localStorage.setItem('metaMessengerConfig', JSON.stringify(updatedConfig));
    setEditingId(null);
    setEditData({});
    setMessage({ type: 'success', text: 'Account updated successfully' });
    setTimeout(() => setMessage(null), 5000);
  };

  const testMessenger = (pageId: string) => {
    if (pageId) {
      window.open(`https://m.me/${pageId}`, '_blank', 'width=400,height=600');
    } else {
      setMessage({ type: 'error', text: 'No Page ID provided' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const activeAccounts = config.accounts.filter(acc => acc.status === 'active').length;

  return (
    <>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{ maxWidth: 1200, margin: "20px auto", padding: "0 20px" }}>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>Sales Department</h1>
        <p style={{ color: "#666", fontSize: 15 }}>
          Manage multiple Meta Business Suite Messenger accounts for your sales team
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 4,
        borderBottom: '2px solid #e5e7eb',
        marginBottom: 24
      }}>
        <button
          onClick={() => setActiveTab('accounts')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'accounts' ? '#fff' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'accounts' ? '2px solid #3b82f6' : '2px solid transparent',
            marginBottom: '-2px',
            fontWeight: activeTab === 'accounts' ? 600 : 400,
            color: activeTab === 'accounts' ? '#3b82f6' : '#6b7280',
            cursor: 'pointer',
            fontSize: 15
          }}
        >
          📱 Accounts Setup
        </button>
        <button
          onClick={() => setActiveTab('conversations')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'conversations' ? '#fff' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'conversations' ? '2px solid #3b82f6' : '2px solid transparent',
            marginBottom: '-2px',
            fontWeight: activeTab === 'conversations' ? 600 : 400,
            color: activeTab === 'conversations' ? '#3b82f6' : '#6b7280',
            cursor: 'pointer',
            fontSize: 15,
            position: 'relative'
          }}
        >
          💬 Conversations
          <span style={{
            position: 'absolute',
            top: 4,
            right: 4,
            background: '#ef4444',
            color: '#fff',
            borderRadius: '50%',
            width: 20,
            height: 20,
            fontSize: 11,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600
          }}>
            {conversations.filter(c => c.status === 'new').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'transactions' ? '#fff' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'transactions' ? '2px solid #3b82f6' : '2px solid transparent',
            marginBottom: '-2px',
            fontWeight: activeTab === 'transactions' ? 600 : 400,
            color: activeTab === 'transactions' ? '#3b82f6' : '#6b7280',
            cursor: 'pointer',
            fontSize: 15
          }}
        >
          💰 Transactions
        </button>
      </div>

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <>
      {/* Status Banner */}
      <div style={{
        background: config.enabled && activeAccounts > 0 ? '#d4edda' : '#fff3cd',
        border: `1px solid ${config.enabled && activeAccounts > 0 ? '#c3e6cb' : '#ffeaa7'}`,
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
          background: config.enabled && activeAccounts > 0 ? '#28a745' : '#ffc107',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20
        }}>
          {config.enabled && activeAccounts > 0 ? '✓' : '⚠'}
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            {config.enabled && activeAccounts > 0
              ? `Meta Messenger Integration Active (${activeAccounts} ${activeAccounts === 1 ? 'Account' : 'Accounts'})`
              : 'Meta Messenger Integration Inactive'}
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>
            {config.enabled && activeAccounts > 0
              ? `Your sales team can receive and respond to customer messages via ${activeAccounts} Facebook Messenger ${activeAccounts === 1 ? 'account' : 'accounts'}`
              : 'Add sales team accounts and enable integration to start receiving customer inquiries'}
          </div>
        </div>
      </div>

      {/* Global Enable/Disable */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer'
        }}>
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => {
              const updated = { ...config, enabled: e.target.checked };
              setConfig(updated);
              localStorage.setItem('metaMessengerConfig', JSON.stringify(updated));
            }}
            style={{ width: 20, height: 20, cursor: 'pointer' }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>Enable Meta Messenger Integration</div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
              Activate all configured Facebook Messenger accounts for your sales team
            </div>
          </div>
        </label>
      </div>

      {/* Accounts List */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Sales Team Accounts ({config.accounts.length})</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              padding: '10px 16px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Plus size={18} />
            Add Account
          </button>
        </div>

        {/* Add Account Form */}
        {showAddForm && (
          <div style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: 20,
            marginBottom: 20
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Add New Sales Account</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: 14 }}>
                  Employee Name *
                </label>
                <input
                  type="text"
                  value={newAccount.name || ''}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  placeholder="e.g., John Doe"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 14
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: 14 }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newAccount.email || ''}
                  onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                  placeholder="e.g., john.doe@discovergrp.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 14
                  }}
                />
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  This email will be used as login credentials
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: 14 }}>
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      paddingRight: '40px',
                      border: '1px solid #d1d5db',
                      borderRadius: 6,
                      fontSize: 14
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  Password for login credentials (min 6 characters)
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: 14 }}>
                    Facebook Page ID *
                  </label>
                  <input
                    type="text"
                    value={newAccount.pageId || ''}
                    onChange={(e) => setNewAccount({ ...newAccount, pageId: e.target.value })}
                    placeholder="123456789012345"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: 6,
                      fontSize: 14
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: 14 }}>
                    Facebook App ID *
                  </label>
                  <input
                    type="text"
                    value={newAccount.appId || ''}
                    onChange={(e) => setNewAccount({ ...newAccount, appId: e.target.value })}
                    placeholder="987654321098765"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: 6,
                      fontSize: 14
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  onClick={handleAddAccount}
                  disabled={isCreating}
                  style={{
                    padding: '10px 20px',
                    background: isCreating ? '#9ca3af' : '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 500,
                    cursor: isCreating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  {isCreating ? (
                    <>
                      <div style={{
                        width: 16,
                        height: 16,
                        border: '2px solid #fff',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Creating...
                    </>
                  ) : (
                    'Add Account'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewAccount({ name: '', pageId: '', appId: '', email: '' });
                    setPassword('');
                  }}
                  disabled={isCreating}
                  style={{
                    padding: '10px 20px',
                    background: '#6b7280',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 500,
                    cursor: isCreating ? 'not-allowed' : 'pointer',
                    opacity: isCreating ? 0.5 : 1
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Accounts Table */}
        {config.accounts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
            <p style={{ fontSize: 16, marginBottom: 8 }}>No sales accounts configured yet</p>
            <p style={{ fontSize: 14 }}>Click "Add Account" to add your first sales team member</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#374151' }}>Name</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#374151' }}>Email</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#374151' }}>Page ID</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#374151' }}>App ID</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#374151' }}>Status</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {config.accounts.map((account) => (
                  <tr key={account.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    {editingId === account.id ? (
                      <>
                        <td style={{ padding: '12px 8px' }}>
                          <input
                            type="text"
                            value={editData.name || ''}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}
                          />
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <input
                            type="email"
                            value={editData.email || ''}
                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}
                          />
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <input
                            type="text"
                            value={editData.pageId || ''}
                            onChange={(e) => setEditData({ ...editData, pageId: e.target.value })}
                            style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}
                          />
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <input
                            type="text"
                            value={editData.appId || ''}
                            onChange={(e) => setEditData({ ...editData, appId: e.target.value })}
                            style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}
                          />
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 500,
                            background: account.status === 'active' ? '#d4edda' : '#f8d7da',
                            color: account.status === 'active' ? '#155724' : '#721c24'
                          }}>
                            {account.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                            <button
                              onClick={() => saveEdit(account.id)}
                              style={{
                                padding: '6px 10px',
                                background: '#10b981',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 12
                              }}
                              title="Save"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              style={{
                                padding: '6px 10px',
                                background: '#6b7280',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 12
                              }}
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: '12px 8px', fontSize: 14, fontWeight: 500 }}>{account.name}</td>
                        <td style={{ padding: '12px 8px', fontSize: 13, color: '#6b7280' }}>{account.email}</td>
                        <td style={{ padding: '12px 8px', fontSize: 13, color: '#6b7280', fontFamily: 'monospace' }}>{account.pageId}</td>
                        <td style={{ padding: '12px 8px', fontSize: 13, color: '#6b7280', fontFamily: 'monospace' }}>{account.appId}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleToggleStatus(account.id)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 500,
                              background: account.status === 'active' ? '#d4edda' : '#f8d7da',
                              color: account.status === 'active' ? '#155724' : '#721c24',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            {account.status}
                          </button>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                            <button
                              onClick={() => testMessenger(account.pageId)}
                              style={{
                                padding: '6px 10px',
                                background: '#3b82f6',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 12
                              }}
                              title="Test Messenger"
                            >
                              Test
                            </button>
                            <button
                              onClick={() => startEdit(account)}
                              style={{
                                padding: '6px 10px',
                                background: '#f59e0b',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 12
                              }}
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteAccount(account.id)}
                              style={{
                                padding: '6px 10px',
                                background: '#ef4444',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 12
                              }}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {message && (
        <div style={{
          marginBottom: 24,
          padding: 12,
          borderRadius: 6,
          background: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}

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
            For Each Sales Team Member:
          </h3>
          <ol style={{ paddingLeft: 20, marginBottom: 20 }}>
            <li>Each sales person needs their own Facebook Business Page</li>
            <li>Create a Facebook App for each page at <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>developers.facebook.com</a></li>
            <li>Add "Messenger" platform to each app</li>
            <li>Get the Page ID from Meta Business Suite → Settings → Page Info</li>
            <li>Get the App ID from the app dashboard</li>
            <li>Add each account using the form above</li>
          </ol>

          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            How It Works:
          </h3>
          <ul style={{ paddingLeft: 20, marginBottom: 20 }}>
            <li>Each active sales account can receive customer messages independently</li>
            <li>Messages go to each salesperson's individual Meta Business Suite inbox</li>
            <li>Sales team members manage their own conversations</li>
            <li>Toggle accounts active/inactive as needed</li>
            <li>Test each account individually before activating</li>
          </ul>

          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            Benefits of Multiple Accounts:
          </h3>
          <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
            <li><strong>Load Distribution:</strong> Spread customer inquiries across team</li>
            <li><strong>Specialization:</strong> Assign specific regions/products to team members</li>
            <li><strong>Flexibility:</strong> Enable/disable accounts based on availability</li>
            <li><strong>Performance Tracking:</strong> Monitor individual team member metrics</li>
            <li><strong>Backup Coverage:</strong> Multiple points of contact for customers</li>
          </ul>
        </div>
      </div>
      </>
      )}

      {/* Conversations Tab */}
      {activeTab === 'conversations' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, height: 'calc(100vh - 300px)' }}>
          {/* Conversations List */}
          <div style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                Conversations ({conversations.length})
              </h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  style={{
                    padding: 16,
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    background: selectedConversation?.id === conv.id ? '#eff6ff' : '#fff',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedConversation?.id !== conv.id) {
                      e.currentTarget.style.background = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedConversation?.id !== conv.id) {
                      e.currentTarget.style.background = '#fff';
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{conv.customerName}</div>
                    <span style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: 
                        conv.status === 'new' ? '#fecaca' :
                        conv.status === 'in-progress' ? '#fde68a' :
                        conv.status === 'converted' ? '#bbf7d0' : '#e5e7eb',
                      color: 
                        conv.status === 'new' ? '#991b1b' :
                        conv.status === 'in-progress' ? '#92400e' :
                        conv.status === 'converted' ? '#14532d' : '#374151',
                      fontWeight: 500
                    }}>
                      {conv.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>
                    {conv.messages[conv.messages.length - 1].text.slice(0, 60)}...
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>
                    {new Date(conv.lastMessageAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversation Detail */}
          <div style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {selectedConversation ? (
              <>
                {/* Header */}
                <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{selectedConversation.customerName}</h3>
                      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                        Assigned to: {selectedConversation.assignedAgent}
                      </div>
                    </div>
                    <button
                      style={{
                        padding: '8px 16px',
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontSize: 13
                      }}
                    >
                      🤖 Extract Transaction
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: '#f9fafb' }}>
                  {selectedConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        marginBottom: 16,
                        display: 'flex',
                        justifyContent: msg.sender === 'customer' ? 'flex-start' : 'flex-end'
                      }}
                    >
                      <div style={{
                        maxWidth: '70%',
                        padding: '12px 16px',
                        borderRadius: 12,
                        background: msg.sender === 'customer' ? '#fff' : '#3b82f6',
                        color: msg.sender === 'customer' ? '#374151' : '#fff',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.text}</div>
                        <div style={{
                          fontSize: 11,
                          marginTop: 4,
                          opacity: 0.7
                        }}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                <div style={{ padding: 16, borderTop: '1px solid #e5e7eb', background: '#fff' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 14
                      }}
                    />
                    <button
                      style={{
                        padding: '10px 20px',
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                fontSize: 14
              }}>
                Select a conversation to view messages
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 24
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Extracted Transactions ({transactions.length})</h2>
            <div style={{ display: 'flex', gap: 12 }}>
              <select style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14
              }}>
                <option>All Status</option>
                <option>Lead</option>
                <option>Quoted</option>
                <option>Booked</option>
                <option>Lost</option>
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <div style={{ padding: 16, background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: 12, color: '#1e40af', marginBottom: 4, fontWeight: 500 }}>Total Leads</div>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#1e3a8a' }}>
                {transactions.filter(t => t.status === 'lead').length}
              </div>
            </div>
            <div style={{ padding: 16, background: '#fef3c7', borderRadius: 8, border: '1px solid #fde68a' }}>
              <div style={{ fontSize: 12, color: '#92400e', marginBottom: 4, fontWeight: 500 }}>Quoted</div>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#78350f' }}>
                {transactions.filter(t => t.status === 'quoted').length}
              </div>
            </div>
            <div style={{ padding: 16, background: '#d1fae5', borderRadius: 8, border: '1px solid #a7f3d0' }}>
              <div style={{ fontSize: 12, color: '#065f46', marginBottom: 4, fontWeight: 500 }}>Booked</div>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#064e3b' }}>
                {transactions.filter(t => t.status === 'booked').length}
              </div>
            </div>
            <div style={{ padding: 16, background: '#fee2e2', borderRadius: 8, border: '1px solid #fecaca' }}>
              <div style={{ fontSize: 12, color: '#991b1b', marginBottom: 4, fontWeight: 500 }}>Lost</div>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#7f1d1d' }}>
                {transactions.filter(t => t.status === 'lost').length}
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151' }}>Customer</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151' }}>Tour Interest</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151' }}>Dates</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151' }}>People</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151' }}>Budget</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#374151' }}>Status</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151' }}>Agent</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((trans) => (
                  <tr key={trans.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '16px 8px' }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{trans.customerName}</div>
                      {trans.customerEmail && (
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{trans.customerEmail}</div>
                      )}
                      {trans.customerPhone && (
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{trans.customerPhone}</div>
                      )}
                    </td>
                    <td style={{ padding: '16px 8px', fontSize: 14 }}>{trans.tourInterest}</td>
                    <td style={{ padding: '16px 8px', fontSize: 13, color: '#6b7280' }}>
                      {trans.preferredDates || '-'}
                    </td>
                    <td style={{ padding: '16px 8px', fontSize: 14, textAlign: 'center' }}>
                      {trans.numberOfPeople || '-'}
                    </td>
                    <td style={{ padding: '16px 8px', fontSize: 14, fontWeight: 500 }}>
                      {trans.estimatedBudget || '-'}
                    </td>
                    <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 500,
                        background: 
                          trans.status === 'lead' ? '#dbeafe' :
                          trans.status === 'quoted' ? '#fef3c7' :
                          trans.status === 'booked' ? '#d1fae5' : '#fee2e2',
                        color: 
                          trans.status === 'lead' ? '#1e40af' :
                          trans.status === 'quoted' ? '#92400e' :
                          trans.status === 'booked' ? '#065f46' : '#991b1b'
                      }}>
                        {trans.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 8px', fontSize: 13, color: '#6b7280' }}>
                      {trans.assignedAgent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {transactions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
              <p style={{ fontSize: 16, marginBottom: 8 }}>No transactions extracted yet</p>
              <p style={{ fontSize: 14 }}>Conversations will be analyzed to extract transaction data automatically</p>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}
