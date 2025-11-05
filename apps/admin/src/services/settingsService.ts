const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getToken(): string | null {
  return localStorage.getItem('admin_token');
}

export interface EmailSettings {
  bookingDepartmentEmail: string;
  emailFromAddress: string;
  emailFromName: string;
}

export async function getEmailSettings(): Promise<EmailSettings> {
  const res = await fetch(`${API_BASE_URL}/admin/settings`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  
  if (!res.ok) throw new Error('Failed to fetch email settings');
  
  const data = await res.json();
  return data.settings;
}

export async function updateEmailSettings(settings: Partial<EmailSettings>): Promise<EmailSettings> {
  const res = await fetch(`${API_BASE_URL}/admin/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(settings),
  });
  
  if (!res.ok) throw new Error('Failed to update email settings');
  
  const data = await res.json();
  return data.settings;
}
