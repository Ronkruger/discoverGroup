export enum InquiryStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum ContactMethod {
  EMAIL = 'email',
  PHONE = 'phone',
  WHATSAPP = 'whatsapp',
  WALK_IN = 'walk_in',
  ONLINE_CHAT = 'online_chat'
}

export interface CustomerContact {
  id: string;
  customerId: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email: string;
  whatsappNumber?: string;
  preferredContactMethod: ContactMethod;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  passportNumber?: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  contact: CustomerContact;
  preferences: {
    tourTypes: string[];
    budgetRange: {
      min: number;
      max: number;
    };
    groupSize: number;
    accessibility: string[];
    dietary: string[];
  };
  notes: string;
  isActive: boolean;
  registrationDate: string;
  lastContactDate?: string;
  totalBookings: number;
  totalSpent: number;
}

export interface CustomerInquiry {
  id: string;
  customerId: string;
  customerName: string;
  subject: string;
  message: string;
  category: 'booking' | 'tour_info' | 'visa' | 'cancellation' | 'complaint' | 'general';
  priority: Priority;
  status: InquiryStatus;
  contactMethod: ContactMethod;
  assignedToCSR?: string;
  responses: InquiryResponse[];
  relatedTourId?: string;
  relatedBookingId?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface InquiryResponse {
  id: string;
  inquiryId: string;
  message: string;
  isFromCustomer: boolean;
  csrName?: string;
  attachments?: string[];
  createdAt: string;
}

export interface CSRTask {
  id: string;
  title: string;
  description: string;
  category: 'follow_up' | 'tour_guidance' | 'booking_assistance' | 'document_verification' | 'complaint_resolution' | 'general';
  priority: Priority;
  status: TaskStatus;
  assignedCSR: string;
  customerId: string;
  customerName: string;
  relatedInquiryId?: string;
  relatedBookingId?: string;
  dueDate: string;
  completedAt?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerTourHistory {
  id: string;
  customerId: string;
  tourId: string;
  tourName: string;
  tourDestination: string;
  bookingDate: string;
  travelDate: string;
  status: 'booked' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  amount: number;
  guests: number;
  specialRequests?: string;
  feedback?: {
    rating: number;
    comment: string;
    date: string;
  };
}

export interface CustomerServiceStats {
  totalCustomers: number;
  activeInquiries: number;
  pendingTasks: number;
  resolvedToday: number;
  averageResponseTime: number;
  customerSatisfactionRate: number;
}

export interface CustomerFilter {
  search?: string;
  nationality?: string;
  registrationDateFrom?: string;
  registrationDateTo?: string;
  isActive?: boolean;
  minBookings?: number;
  minSpent?: number;
}

export interface InquiryFilter {
  search?: string;
  status?: InquiryStatus;
  category?: string;
  priority?: Priority;
  assignedToCSR?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface TaskFilter {
  search?: string;
  status?: TaskStatus;
  category?: string;
  priority?: Priority;
  assignedCSR?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export const INQUIRY_STATUS_DISPLAY: Record<InquiryStatus, string> = {
  [InquiryStatus.OPEN]: 'Open',
  [InquiryStatus.IN_PROGRESS]: 'In Progress',
  [InquiryStatus.RESOLVED]: 'Resolved',
  [InquiryStatus.CLOSED]: 'Closed',
};

export const TASK_STATUS_DISPLAY: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'Pending',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.COMPLETED]: 'Completed',
  [TaskStatus.CANCELLED]: 'Cancelled',
};

export const PRIORITY_DISPLAY: Record<Priority, string> = {
  [Priority.LOW]: 'Low',
  [Priority.MEDIUM]: 'Medium',
  [Priority.HIGH]: 'High',
  [Priority.URGENT]: 'Urgent',
};

export const CONTACT_METHOD_DISPLAY: Record<ContactMethod, string> = {
  [ContactMethod.EMAIL]: 'Email',
  [ContactMethod.PHONE]: 'Phone',
  [ContactMethod.WHATSAPP]: 'WhatsApp',
  [ContactMethod.WALK_IN]: 'Walk-in',
  [ContactMethod.ONLINE_CHAT]: 'Online Chat',
};