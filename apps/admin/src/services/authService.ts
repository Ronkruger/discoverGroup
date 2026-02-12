import { User, LoginCredentials, RegisterData, ROLE_PERMISSIONS, RolePermissions } from '../types/auth';
import { setToken, getToken, getRefreshToken, clearToken, authFetch } from '../utils/tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

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
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Invalid email or password' }));
      throw new Error(error.error || 'Login failed');
    }
    
    const data = await res.json();
    
    // Store both access and refresh tokens
    if (data.accessToken) {
      setToken(data.accessToken, data.refreshToken);
    }
    
    return data.user;
  }

  // Register user via API
  async register(data: RegisterData): Promise<User> {
    const res = await authFetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Registration failed');
    return await res.json();
  }

  // Get all users from API
  async getAllUsers(includeArchived = false): Promise<User[]> {
    const url = includeArchived 
      ? `${API_BASE_URL}/admin/users?includeArchived=true`
      : `${API_BASE_URL}/admin/users`;
    
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
  }

  // Update user via API
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const res = await authFetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return await res.json();
  }

  // Archive user (soft delete)
  async archiveUser(userId: string): Promise<User> {
    const res = await authFetch(`${API_BASE_URL}/admin/users/${userId}/archive`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to archive user');
    const data = await res.json();
    return data.user;
  }

  // Unarchive user (restore)
  async unarchiveUser(userId: string): Promise<User> {
    const res = await authFetch(`${API_BASE_URL}/admin/users/${userId}/unarchive`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to unarchive user');
    const data = await res.json();
    return data.user;
  }

  // Permanently delete user
  async deleteUser(userId: string): Promise<void> {
    const res = await authFetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete user');
  }

  // Refresh access token using refresh token
  async refreshAccessToken(): Promise<boolean> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        clearToken();
        return false;
      }

      const data = await res.json();
      setToken(data.accessToken, data.refreshToken);
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      clearToken();
      return false;
    }
  }

  async logout(): Promise<void> {
    const refreshToken = getRefreshToken();
    
    // Revoke refresh token on server
    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.error('Failed to revoke refresh token:', error);
      }
    }
    
    // Clear local tokens
    clearToken();
  }

  // Optionally, get current user from token or API
  async getCurrentUser(): Promise<User | null> {
    const token = getToken();
    if (!token) return null;
    
    try {
      const res = await authFetch(`${API_BASE_URL}/auth/me`);
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
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