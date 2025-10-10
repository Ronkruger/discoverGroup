import { User, LoginCredentials, RegisterData, UserRole, Gender, ROLE_PERMISSIONS } from '../types/auth';

const AUTH_STORAGE_KEY = 'admin_auth_user';
const USERS_STORAGE_KEY = 'admin_users';

// Mock users for demo - in production, this would be handled by the API
const DEMO_USERS: User[] = [
  // Super Admin - Web Developer who created the system
  {
    id: '0',
    email: 'superadmin@discovergroup.com',
    fullName: 'System Developer',
    gender: Gender.PREFER_NOT_TO_SAY,
    age: 30,
    birthDate: '1994-01-01',
    role: UserRole.WEB_DEVELOPER,
    department: 'Web Development',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '1',
    email: 'admin@discovergroup.com',
    fullName: 'System Administrator',
    gender: Gender.PREFER_NOT_TO_SAY,
    age: 30,
    birthDate: '1994-01-01',
    role: UserRole.ADMINISTRATOR,
    department: 'Administration',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'booking@discovergroup.com',
    fullName: 'Sarah Johnson',
    gender: Gender.FEMALE,
    age: 28,
    birthDate: '1996-05-15',
    role: UserRole.BOOKING_DEPARTMENT,
    department: 'Booking Department',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'visa@discovergroup.com',
    fullName: 'Michael Chen',
    gender: Gender.MALE,
    age: 32,
    birthDate: '1992-08-22',
    role: UserRole.VISA_DEPARTMENT,
    department: 'Visa Department',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    email: 'csr@discovergroup.com',
    fullName: 'Emily Rodriguez',
    gender: Gender.FEMALE,
    age: 26,
    birthDate: '1998-11-03',
    role: UserRole.CSR_DEPARTMENT,
    department: 'Customer Service',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class AuthService {
  private users: User[] = [];

  constructor() {
    this.initializeUsers();
  }

  private initializeUsers(): void {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
      
      // Ensure super admin always exists
      const superAdminExists = this.users.find(u => u.email === 'superadmin@discovergroup.com');
      if (!superAdminExists) {
        const superAdmin = DEMO_USERS.find(u => u.email === 'superadmin@discovergroup.com');
        if (superAdmin) {
          this.users.unshift(superAdmin); // Add at the beginning
          this.saveUsers();
        }
      }
    } else {
      this.users = [...DEMO_USERS];
      this.saveUsers();
    }
  }

  private saveUsers(): void {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
  }

  async login(credentials: LoginCredentials): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = this.users.find(
          u => u.email === credentials.email && u.isActive
        );

        if (!user) {
          reject(new Error('Invalid email or password'));
          return;
        }

        // In a real app, you'd verify the password hash
        // For demo purposes, we'll accept specific passwords:
        // - 'superadmin123' for super admin
        // - 'demo123' for other demo accounts
        // - email prefix for new accounts
        const isValidPassword = 
          (credentials.email === 'superadmin@discovergroup.com' && credentials.password === 'superadmin123') ||
          credentials.password === 'demo123' || 
          credentials.password === credentials.email.split('@')[0];

        if (!isValidPassword) {
          reject(new Error('Invalid email or password'));
          return;
        }

        // Save to localStorage
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        resolve(user);
      }, 1000); // Simulate API delay
    });
  }

  async register(data: RegisterData): Promise<User> {
    // Check if current user is an administrator or web developer
    const currentUser = this.getCurrentUser();
    if (!currentUser || (currentUser.role !== UserRole.ADMINISTRATOR && currentUser.role !== UserRole.WEB_DEVELOPER)) {
      return Promise.reject(new Error('Only administrators and web developers can create new accounts'));
    }

    return this.createUser(data);
  }

  async createUser(data: RegisterData): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if user already exists
        const existingUser = this.users.find(u => u.email === data.email);
        if (existingUser) {
          reject(new Error('User with this email already exists'));
          return;
        }

        // Validate passwords match
        if (data.password !== data.confirmPassword) {
          reject(new Error('Passwords do not match'));
          return;
        }

        // Create new user
        const newUser: User = {
          id: (this.users.length + 1).toString(),
          email: data.email,
          fullName: data.fullName,
          gender: data.gender,
          profileImage: data.profileImage ? URL.createObjectURL(data.profileImage) : undefined,
          age: data.age,
          birthDate: data.birthDate,
          role: data.role,
          department: this.getDepartmentName(data.role),
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        this.users.push(newUser);
        this.saveUsers();
        
        // Save to localStorage
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
        resolve(newUser);
      }, 1500); // Simulate API delay
    });
  }

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  getCurrentUser(): User | null {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasPermission(permission: keyof import('../types/auth').RolePermissions): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    return ROLE_PERMISSIONS[user.role][permission];
  }

  private getDepartmentName(role: UserRole): string {
    switch (role) {
      case UserRole.ADMINISTRATOR:
        return 'Administration';
      case UserRole.BOOKING_DEPARTMENT:
        return 'Booking Department';
      case UserRole.VISA_DEPARTMENT:
        return 'Visa Department';
      case UserRole.CSR_DEPARTMENT:
        return 'Customer Service';
      default:
        return 'Unknown';
    }
  }

  getAllUsers(): User[] {
    return this.users;
  }

  updateUser(userId: string, updates: Partial<User>): User {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveUsers();

    // Update current user in localStorage if it's the same user
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.users[userIndex]));
    }

    return this.users[userIndex];
  }

  // Permission checking methods
  hasPermissionForUser(user: User | null, permission: keyof typeof ROLE_PERMISSIONS[UserRole]): boolean {
    if (!user) return false;
    const rolePermissions = ROLE_PERMISSIONS[user.role];
    return rolePermissions[permission] === true;
  }

  canManageBookings(user: User | null): boolean {
    return this.hasPermissionForUser(user, 'canAccessBookings') && 
           this.hasPermissionForUser(user, 'canManageBookingStatus');
  }

  canManageTours(user: User | null): boolean {
    return this.hasPermissionForUser(user, 'canAccessTours') && 
           (this.hasPermissionForUser(user, 'canCreateTours') || this.hasPermissionForUser(user, 'canEditTours'));
  }

  canProcessVisa(user: User | null): boolean {
    return this.hasPermissionForUser(user, 'canAccessVisaAssistance') && 
           this.hasPermissionForUser(user, 'canProcessVisaApplications');
  }

  canAccessCustomerService(user: User | null): boolean {
    return this.hasPermissionForUser(user, 'canAccessCustomerService') && 
           this.hasPermissionForUser(user, 'canRespondToInquiries');
  }

  // Get filtered navigation items based on user role
  getNavigationItems(user: User | null): string[] {
    if (!user) return [];
    
    const items: string[] = [];
    const permissions = ROLE_PERMISSIONS[user.role];

    if (permissions.canAccessBookings) items.push('bookings');
    if (permissions.canAccessTours) items.push('tours');
    if (permissions.canAccessVisaAssistance) items.push('visa-assistance');
    if (permissions.canAccessCustomerService) items.push('customer-service');
    if (permissions.canAccessReports) items.push('reports');
    if (permissions.canAccessUserManagement) items.push('user-management');
    if (permissions.canAccessSettings) items.push('settings');

    return items;
  }

  // Debug method to reset users storage (useful during development)
  resetUsersStorage(): void {
    localStorage.removeItem(USERS_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.users = [...DEMO_USERS];
    this.saveUsers();
    console.log('Users storage reset. Web Developer credentials: superadmin@discovergroup.com / superadmin123');
  }
}

export const authService = new AuthService();