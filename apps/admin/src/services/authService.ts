import { User, LoginCredentials, RegisterData, ROLE_PERMISSIONS, RolePermissions } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Utility to get auth token from localStorage (if you use JWT)
function getToken() {
  return localStorage.getItem('token');
}

type NavigationItem = {
  label: string;
  to: string;
  icon?: unknown;
  permission?: keyof RolePermissions;
};

const NAVIGATION_CONFIG: NavigationItem[] = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Bookings', to: '/bookings', permission: 'canAccessBookings' },
  { label: 'Tours', to: '/tours', permission: 'canAccessTours' },
  { label: 'Visa Assistance', to: '/visa', permission: 'canAccessVisaAssistance' },
  { label: 'Customer Service', to: '/customer-service', permission: 'canAccessCustomerService' },
  { label: 'Reports', to: '/reports', permission: 'canAccessReports' },
  { label: 'Users', to: '/users', permission: 'canAccessUserManagement' },
  { label: 'Settings', to: '/settings', permission: 'canAccessSettings' },
];

class AuthService {
  // Login user via API
  async login(credentials: LoginCredentials): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error('Invalid email or password');
    const data = await res.json();
    // Optionally store token if returned
    if (data.token) localStorage.setItem('token', data.token);
    return data.user;
  }

  // Register user via API
  async register(data: RegisterData): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Registration failed');
    return await res.json();
  }

  // Get all users from API
  async getAllUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
  }

  // Update user via API
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return await res.json();
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  // Optionally, get current user from token or API
  async getCurrentUser(): Promise<User | null> {
    const token = getToken();
    if (!token) return null;
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  }

  // Permission checking methods
  hasPermission(permission: keyof import('../types/auth').RolePermissions, user: User): boolean {
    if (!user || !user.role) return false;
    const rolePermissions = ROLE_PERMISSIONS[user.role];
    if (!rolePermissions) return false;
    // Defensive: check property exists and is boolean
    if (typeof rolePermissions[permission] !== 'boolean') return false;
    return rolePermissions[permission];
  }

  canManageBookings(user: User): boolean {
    return this.hasPermission('canManageBookingStatus', user) || this.hasPermission('canCreateBookings', user) || this.hasPermission('canCancelBookings', user);
  }
  canManageTours(user: User): boolean {
    return this.hasPermission('canCreateTours', user) || this.hasPermission('canEditTours', user) || this.hasPermission('canDeleteTours', user);
  }
  canProcessVisa(user: User): boolean {
    return this.hasPermission('canProcessVisaApplications', user) || this.hasPermission('canUpdateVisaStatus', user);
  }
  canAccessCustomerService(user: User): boolean {
    return this.hasPermission('canAccessCustomerService', user);
  }

  getNavigationItems(user: User): NavigationItem[] {
    if (!user) return [];
    return NAVIGATION_CONFIG.filter(item => {
      if (!item.permission) return true;
      return this.hasPermission(item.permission as keyof RolePermissions, user);
    });
  }
}

export const authService = new AuthService();