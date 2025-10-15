export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMINISTRATOR = 'administrator',
  WEB_DEVELOPER = 'web_developer',
  BOOKING_DEPARTMENT = 'booking_department',
  VISA_DEPARTMENT = 'visa_department',
  CSR_DEPARTMENT = 'csr_department'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  gender: Gender;
  profileImage?: string;
  age: number;
  birthDate: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  gender: Gender;
  profileImage?: File | null;
  age: number;
  birthDate: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface RolePermissions {
  canAccessBookings: boolean;
  canAccessTours: boolean;
  canAccessVisaAssistance: boolean;
  canAccessCustomerService: boolean;
  canAccessReports: boolean;
  canAccessUserManagement: boolean;
  canAccessSettings: boolean;
  canManageBookingStatus: boolean;
  canCreateBookings: boolean;
  canCancelBookings: boolean;
  canViewAllBookings: boolean;
  canCreateTours: boolean;
  canEditTours: boolean;
  canDeleteTours: boolean;
  canProcessVisaApplications: boolean;
  canUpdateVisaStatus: boolean;
  canRespondToInquiries: boolean;
  canAccessCustomerData: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.SUPER_ADMIN]: {
    canAccessBookings: true,
    canAccessTours: true,
    canAccessVisaAssistance: true,
    canAccessCustomerService: true,
    canAccessReports: true,
    canAccessUserManagement: true,
    canAccessSettings: true,
    canManageBookingStatus: true,
    canCreateBookings: true,
    canCancelBookings: true,
    canViewAllBookings: true,
    canCreateTours: true,
    canEditTours: true,
    canDeleteTours: true,
    canProcessVisaApplications: true,
    canUpdateVisaStatus: true,
    canRespondToInquiries: true,
    canAccessCustomerData: true,
  },
  [UserRole.ADMINISTRATOR]: {
    canAccessBookings: true,
    canAccessTours: true,
    canAccessVisaAssistance: true,
    canAccessCustomerService: true,
    canAccessReports: true,
    canAccessUserManagement: true,
    canAccessSettings: true,
    canManageBookingStatus: true,
    canCreateBookings: true,
    canCancelBookings: true,
    canViewAllBookings: true,
    canCreateTours: true,
    canEditTours: true,
    canDeleteTours: true,
    canProcessVisaApplications: true,
    canUpdateVisaStatus: true,
    canRespondToInquiries: true,
    canAccessCustomerData: true,
  },
  [UserRole.WEB_DEVELOPER]: {
    canAccessBookings: true,
    canAccessTours: true,
    canAccessVisaAssistance: true,
    canAccessCustomerService: true,
    canAccessReports: true,
    canAccessUserManagement: true,
    canAccessSettings: true,
    canManageBookingStatus: true,
    canCreateBookings: true,
    canCancelBookings: true,
    canViewAllBookings: true,
    canCreateTours: true,
    canEditTours: true,
    canDeleteTours: true,
    canProcessVisaApplications: true,
    canUpdateVisaStatus: true,
    canRespondToInquiries: true,
    canAccessCustomerData: true,
  },
  [UserRole.BOOKING_DEPARTMENT]: {
    canAccessBookings: true,
    canAccessTours: true,
    canAccessVisaAssistance: false,
    canAccessCustomerService: true,
    canAccessReports: true,
    canAccessUserManagement: false,
    canAccessSettings: false,
    canManageBookingStatus: true,
    canCreateBookings: true,
    canCancelBookings: true,
    canViewAllBookings: true,
    canCreateTours: true,
    canEditTours: true,
    canDeleteTours: false,
    canProcessVisaApplications: false,
    canUpdateVisaStatus: false,
    canRespondToInquiries: true,
    canAccessCustomerData: true,
  },
  [UserRole.VISA_DEPARTMENT]: {
    canAccessBookings: false,
    canAccessTours: false,
    canAccessVisaAssistance: true,
    canAccessCustomerService: true,
    canAccessReports: true,
    canAccessUserManagement: false,
    canAccessSettings: false,
    canManageBookingStatus: false,
    canCreateBookings: false,
    canCancelBookings: false,
    canViewAllBookings: true,
    canCreateTours: false,
    canEditTours: false,
    canDeleteTours: false,
    canProcessVisaApplications: true,
    canUpdateVisaStatus: true,
    canRespondToInquiries: true,
    canAccessCustomerData: true,
  },
  [UserRole.CSR_DEPARTMENT]: {
    canAccessBookings: true,
    canAccessTours: false,
    canAccessVisaAssistance: false,
    canAccessCustomerService: true,
    canAccessReports: false,
    canAccessUserManagement: false,
    canAccessSettings: false,
    canManageBookingStatus: true,
    canCreateBookings: false,
    canCancelBookings: true,
    canViewAllBookings: true,
    canCreateTours: false,
    canEditTours: false,
    canDeleteTours: false,
    canProcessVisaApplications: false,
    canUpdateVisaStatus: false,
    canRespondToInquiries: true,
    canAccessCustomerData: true,
  },
};

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.ADMINISTRATOR]: 'Administrator',
  [UserRole.WEB_DEVELOPER]: 'Web Developer',
  [UserRole.BOOKING_DEPARTMENT]: 'Booking Department',
  [UserRole.VISA_DEPARTMENT]: 'Visa Department',
  [UserRole.CSR_DEPARTMENT]: 'Customer Service Representative',
};

export const GENDER_DISPLAY_NAMES: Record<Gender, string> = {
  [Gender.MALE]: 'Male',
  [Gender.FEMALE]: 'Female',
  [Gender.OTHER]: 'Other',
  [Gender.PREFER_NOT_TO_SAY]: 'Prefer not to say',
};
