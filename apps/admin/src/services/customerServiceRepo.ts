import {
  Customer,
  CustomerInquiry,
  CSRTask,
  CustomerTourHistory,
  CustomerServiceStats,
  CustomerFilter,
  InquiryFilter,
  TaskFilter,
  InquiryStatus,
  TaskStatus,
  Priority,
  ContactMethod,
  InquiryResponse
} from '../types/customerService';

// Sample customer data
const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: '1',
    fullName: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    nationality: 'American',
    passportNumber: 'US123456789',
    dateOfBirth: '1985-06-15',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001'
    },
    contact: {
      id: '1',
      customerId: '1',
      primaryPhone: '+1-555-0123',
      secondaryPhone: '+1-555-0124',
      email: 'john.smith@email.com',
      whatsappNumber: '+1-555-0123',
      preferredContactMethod: ContactMethod.EMAIL,
      emergencyContact: {
        name: 'Jane Smith',
        phone: '+1-555-0125',
        relationship: 'Spouse'
      }
    },
    preferences: {
      tourTypes: ['Adventure', 'Cultural', 'Nature'],
      budgetRange: { min: 2000, max: 5000 },
      groupSize: 4,
      accessibility: [],
      dietary: ['Vegetarian']
    },
    notes: 'Prefers eco-friendly tours. Has young children.',
    isActive: true,
    registrationDate: '2024-01-15T10:00:00Z',
    lastContactDate: '2024-03-10T14:30:00Z',
    totalBookings: 3,
    totalSpent: 8500
  },
  {
    id: '2',
    fullName: 'Maria Garcia',
    email: 'maria.garcia@email.com',
    phone: '+34-600-123456',
    nationality: 'Spanish',
    passportNumber: 'ES987654321',
    dateOfBirth: '1992-03-22',
    address: {
      street: 'Calle Mayor 45',
      city: 'Madrid',
      state: 'Madrid',
      country: 'Spain',
      zipCode: '28013'
    },
    contact: {
      id: '2',
      customerId: '2',
      primaryPhone: '+34-600-123456',
      email: 'maria.garcia@email.com',
      whatsappNumber: '+34-600-123456',
      preferredContactMethod: ContactMethod.WHATSAPP
    },
    preferences: {
      tourTypes: ['Cultural', 'Food & Wine', 'Historical'],
      budgetRange: { min: 1500, max: 3000 },
      groupSize: 2,
      accessibility: [],
      dietary: []
    },
    notes: 'Loves photography. Speaks Spanish and English.',
    isActive: true,
    registrationDate: '2024-02-20T09:15:00Z',
    lastContactDate: '2024-03-12T11:45:00Z',
    totalBookings: 2,
    totalSpent: 4200
  },
  {
    id: '3',
    fullName: 'Hiroshi Tanaka',
    email: 'h.tanaka@email.com',
    phone: '+81-90-1234-5678',
    nationality: 'Japanese',
    passportNumber: 'JP246813579',
    dateOfBirth: '1978-11-08',
    address: {
      street: '2-3-4 Shibuya',
      city: 'Tokyo',
      state: 'Tokyo',
      country: 'Japan',
      zipCode: '150-0002'
    },
    contact: {
      id: '3',
      customerId: '3',
      primaryPhone: '+81-90-1234-5678',
      email: 'h.tanaka@email.com',
      preferredContactMethod: ContactMethod.EMAIL
    },
    preferences: {
      tourTypes: ['Adventure', 'Nature', 'Mountain'],
      budgetRange: { min: 3000, max: 8000 },
      groupSize: 1,
      accessibility: [],
      dietary: []
    },
    notes: 'Solo traveler. Experienced hiker. Prefers English-speaking guides.',
    isActive: true,
    registrationDate: '2024-01-10T16:20:00Z',
    lastContactDate: '2024-03-08T13:15:00Z',
    totalBookings: 4,
    totalSpent: 12300
  }
];

// Sample inquiries
const SAMPLE_INQUIRIES: CustomerInquiry[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'John Smith',
    subject: 'Question about Everest Base Camp Trek',
    message: 'Hi, I\'m interested in the Everest Base Camp trek for my family. Can you provide more details about the difficulty level and age requirements?',
    category: 'tour_info',
    priority: Priority.MEDIUM,
    status: InquiryStatus.OPEN,
    contactMethod: ContactMethod.EMAIL,
    assignedToCSR: 'Emily Rodriguez',
    responses: [
      {
        id: '1',
        inquiryId: '1',
        message: 'Thank you for your inquiry! The Everest Base Camp trek is quite challenging and typically requires participants to be at least 16 years old with good physical fitness. Let me provide you with detailed information...',
        isFromCustomer: false,
        csrName: 'Emily Rodriguez',
        createdAt: '2024-03-12T10:30:00Z'
      }
    ],
    relatedTourId: 'tour_001',
    createdAt: '2024-03-12T09:15:00Z',
    updatedAt: '2024-03-12T10:30:00Z'
  },
  {
    id: '2',
    customerId: '2',
    customerName: 'Maria Garcia',
    subject: 'Booking Confirmation Issue',
    message: 'I made a booking for the Mediterranean Cruise last week but haven\'t received confirmation yet. Booking reference: MDC2024001',
    category: 'booking',
    priority: Priority.HIGH,
    status: InquiryStatus.IN_PROGRESS,
    contactMethod: ContactMethod.WHATSAPP,
    assignedToCSR: 'Emily Rodriguez',
    responses: [
      {
        id: '2',
        inquiryId: '2',
        message: 'I apologize for the delay. Let me check your booking status immediately. I can see your booking in our system...',
        isFromCustomer: false,
        csrName: 'Emily Rodriguez',
        createdAt: '2024-03-11T14:20:00Z'
      },
      {
        id: '3',
        inquiryId: '2',
        message: 'Thank you! Could you also send me the detailed itinerary?',
        isFromCustomer: true,
        createdAt: '2024-03-11T16:45:00Z'
      }
    ],
    relatedBookingId: 'booking_001',
    createdAt: '2024-03-11T13:00:00Z',
    updatedAt: '2024-03-11T16:45:00Z'
  },
  {
    id: '3',
    customerId: '3',
    customerName: 'Hiroshi Tanaka',
    subject: 'Visa Requirements for Nepal Trek',
    message: 'What are the visa requirements for Japanese citizens visiting Nepal for the Annapurna Circuit trek?',
    category: 'visa',
    priority: Priority.MEDIUM,
    status: InquiryStatus.RESOLVED,
    contactMethod: ContactMethod.EMAIL,
    assignedToCSR: 'Emily Rodriguez',
    responses: [
      {
        id: '4',
        inquiryId: '3',
        message: 'For Japanese citizens, you can obtain a visa on arrival in Nepal or apply online. Here are the requirements...',
        isFromCustomer: false,
        csrName: 'Emily Rodriguez',
        createdAt: '2024-03-10T11:15:00Z'
      }
    ],
    relatedTourId: 'tour_002',
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-03-10T11:15:00Z',
    resolvedAt: '2024-03-10T11:15:00Z'
  }
];

// Sample tasks
const SAMPLE_TASKS: CSRTask[] = [
  {
    id: '1',
    title: 'Follow up on Everest Trek inquiry',
    description: 'Provide detailed itinerary and pricing for John Smith\'s family Everest Base Camp trek inquiry',
    category: 'follow_up',
    priority: Priority.MEDIUM,
    status: TaskStatus.PENDING,
    assignedCSR: 'Emily Rodriguez',
    customerId: '1',
    customerName: 'John Smith',
    relatedInquiryId: '1',
    dueDate: '2024-03-14T17:00:00Z',
    notes: 'Customer has 2 children (ages 16 and 18). Need to check family-friendly options.',
    createdAt: '2024-03-12T11:00:00Z',
    updatedAt: '2024-03-12T11:00:00Z'
  },
  {
    id: '2',
    title: 'Send booking confirmation to Maria',
    description: 'Resolve booking confirmation issue and send detailed itinerary',
    category: 'booking_assistance',
    priority: Priority.HIGH,
    status: TaskStatus.IN_PROGRESS,
    assignedCSR: 'Emily Rodriguez',
    customerId: '2',
    customerName: 'Maria Garcia',
    relatedInquiryId: '2',
    relatedBookingId: 'booking_001',
    dueDate: '2024-03-13T12:00:00Z',
    notes: 'Customer paid deposit. Need to send confirmation and itinerary.',
    createdAt: '2024-03-11T14:30:00Z',
    updatedAt: '2024-03-11T15:00:00Z'
  },
  {
    id: '3',
    title: 'Prepare travel documents checklist',
    description: 'Create comprehensive travel documents checklist for Hiroshi\'s Nepal trek',
    category: 'document_verification',
    priority: Priority.LOW,
    status: TaskStatus.COMPLETED,
    assignedCSR: 'Emily Rodriguez',
    customerId: '3',
    customerName: 'Hiroshi Tanaka',
    dueDate: '2024-03-10T16:00:00Z',
    completedAt: '2024-03-10T15:30:00Z',
    notes: 'Sent visa information and required documents list.',
    createdAt: '2024-03-10T11:20:00Z',
    updatedAt: '2024-03-10T15:30:00Z'
  }
];

// Sample tour history
const SAMPLE_TOUR_HISTORY: CustomerTourHistory[] = [
  {
    id: '1',
    customerId: '1',
    tourId: 'tour_003',
    tourName: 'Himalayan Adventure',
    tourDestination: 'Nepal',
    bookingDate: '2024-01-20T10:00:00Z',
    travelDate: '2024-04-15T08:00:00Z',
    status: 'booked',
    amount: 3500,
    guests: 4,
    specialRequests: 'Vegetarian meals for all guests',
    feedback: {
      rating: 5,
      comment: 'Amazing experience! Perfect for families.',
      date: '2024-04-25T12:00:00Z'
    }
  },
  {
    id: '2',
    customerId: '2',
    tourId: 'tour_004',
    tourName: 'Mediterranean Cruise',
    tourDestination: 'Mediterranean',
    bookingDate: '2024-03-05T14:30:00Z',
    travelDate: '2024-05-10T09:00:00Z',
    status: 'confirmed',
    amount: 2100,
    guests: 2,
    specialRequests: 'Balcony cabin preferred'
  },
  {
    id: '3',
    customerId: '3',
    tourId: 'tour_002',
    tourName: 'Annapurna Circuit Trek',
    tourDestination: 'Nepal',
    bookingDate: '2024-02-28T11:15:00Z',
    travelDate: '2024-03-20T07:00:00Z',
    status: 'completed',
    amount: 2800,
    guests: 1,
    feedback: {
      rating: 5,
      comment: 'Excellent guide and well-organized trek.',
      date: '2024-03-30T16:30:00Z'
    }
  }
];

class CustomerServiceRepository {
  private customers: Customer[] = SAMPLE_CUSTOMERS;
  private inquiries: CustomerInquiry[] = SAMPLE_INQUIRIES;
  private tasks: CSRTask[] = SAMPLE_TASKS;
  private tourHistory: CustomerTourHistory[] = SAMPLE_TOUR_HISTORY;

  // Customer methods
  getAllCustomers(filter?: CustomerFilter): Customer[] {
    let filtered = [...this.customers];

    if (filter?.search) {
      const search = filter.search.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.fullName.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.phone.includes(search)
      );
    }

    if (filter?.nationality) {
      filtered = filtered.filter(customer => customer.nationality === filter.nationality);
    }

    if (filter?.isActive !== undefined) {
      filtered = filtered.filter(customer => customer.isActive === filter.isActive);
    }

    if (filter?.minBookings !== undefined) {
      filtered = filtered.filter(customer => customer.totalBookings >= filter.minBookings!);
    }

    if (filter?.minSpent !== undefined) {
      filtered = filtered.filter(customer => customer.totalSpent >= filter.minSpent!);
    }

    return filtered.sort((a, b) => new Date(b.lastContactDate || b.registrationDate).getTime() - new Date(a.lastContactDate || a.registrationDate).getTime());
  }

  getCustomerById(id: string): Customer | null {
    return this.customers.find(customer => customer.id === id) || null;
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer {
    const index = this.customers.findIndex(customer => customer.id === id);
    if (index === -1) throw new Error('Customer not found');

    this.customers[index] = { ...this.customers[index], ...updates };
    return this.customers[index];
  }

  // Inquiry methods
  getAllInquiries(filter?: InquiryFilter): CustomerInquiry[] {
    let filtered = [...this.inquiries];

    if (filter?.search) {
      const search = filter.search.toLowerCase();
      filtered = filtered.filter(inquiry =>
        inquiry.subject.toLowerCase().includes(search) ||
        inquiry.message.toLowerCase().includes(search) ||
        inquiry.customerName.toLowerCase().includes(search)
      );
    }

    if (filter?.status) {
      filtered = filtered.filter(inquiry => inquiry.status === filter.status);
    }

    if (filter?.category) {
      filtered = filtered.filter(inquiry => inquiry.category === filter.category);
    }

    if (filter?.priority) {
      filtered = filtered.filter(inquiry => inquiry.priority === filter.priority);
    }

    if (filter?.assignedToCSR) {
      filtered = filtered.filter(inquiry => inquiry.assignedToCSR === filter.assignedToCSR);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getInquiryById(id: string): CustomerInquiry | null {
    return this.inquiries.find(inquiry => inquiry.id === id) || null;
  }

  createInquiry(inquiry: Omit<CustomerInquiry, 'id' | 'createdAt' | 'updatedAt'>): CustomerInquiry {
    const newInquiry: CustomerInquiry = {
      ...inquiry,
      id: (this.inquiries.length + 1).toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: []
    };

    this.inquiries.push(newInquiry);
    return newInquiry;
  }

  updateInquiry(id: string, updates: Partial<CustomerInquiry>): CustomerInquiry {
    const index = this.inquiries.findIndex(inquiry => inquiry.id === id);
    if (index === -1) throw new Error('Inquiry not found');

    this.inquiries[index] = { 
      ...this.inquiries[index], 
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.inquiries[index];
  }

  addInquiryResponse(inquiryId: string, response: Omit<InquiryResponse, 'id' | 'inquiryId' | 'createdAt'>): CustomerInquiry {
    const inquiry = this.getInquiryById(inquiryId);
    if (!inquiry) throw new Error('Inquiry not found');

    const newResponse: InquiryResponse = {
      ...response,
      id: `${inquiryId}_${inquiry.responses.length + 1}`,
      inquiryId,
      createdAt: new Date().toISOString()
    };

    inquiry.responses.push(newResponse);
    inquiry.updatedAt = new Date().toISOString();

    return inquiry;
  }

  // Task methods
  getAllTasks(filter?: TaskFilter): CSRTask[] {
    let filtered = [...this.tasks];

    if (filter?.search) {
      const search = filter.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search) ||
        task.customerName.toLowerCase().includes(search)
      );
    }

    if (filter?.status) {
      filtered = filtered.filter(task => task.status === filter.status);
    }

    if (filter?.category) {
      filtered = filtered.filter(task => task.category === filter.category);
    }

    if (filter?.priority) {
      filtered = filtered.filter(task => task.priority === filter.priority);
    }

    if (filter?.assignedCSR) {
      filtered = filtered.filter(task => task.assignedCSR === filter.assignedCSR);
    }

    return filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  getTaskById(id: string): CSRTask | null {
    return this.tasks.find(task => task.id === id) || null;
  }

  createTask(task: Omit<CSRTask, 'id' | 'createdAt' | 'updatedAt'>): CSRTask {
    const newTask: CSRTask = {
      ...task,
      id: (this.tasks.length + 1).toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.tasks.push(newTask);
    return newTask;
  }

  updateTask(id: string, updates: Partial<CSRTask>): CSRTask {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index === -1) throw new Error('Task not found');

    const updatedTask = {
      ...this.tasks[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updates.status === TaskStatus.COMPLETED && !updates.completedAt) {
      updatedTask.completedAt = new Date().toISOString();
    }

    this.tasks[index] = updatedTask;
    return this.tasks[index];
  }

  // Tour history methods
  getCustomerTourHistory(customerId: string): CustomerTourHistory[] {
    return this.tourHistory
      .filter(tour => tour.customerId === customerId)
      .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
  }

  // Statistics methods
  getCustomerServiceStats(): CustomerServiceStats {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      totalCustomers: this.customers.filter(c => c.isActive).length,
      activeInquiries: this.inquiries.filter(i => i.status === InquiryStatus.OPEN || i.status === InquiryStatus.IN_PROGRESS).length,
      pendingTasks: this.tasks.filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS).length,
      resolvedToday: this.inquiries.filter(i => i.resolvedAt?.startsWith(today)).length,
      averageResponseTime: 2.5, // hours - would be calculated from actual data
      customerSatisfactionRate: 4.7 // out of 5 - would be calculated from feedback
    };
  }
}

export const customerServiceRepo = new CustomerServiceRepository();