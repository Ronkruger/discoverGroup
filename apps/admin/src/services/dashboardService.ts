const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface DashboardStats {
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  tours: {
    total: number;
    active: number;
    upcoming: number;
  };
  visas: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  customerService: {
    openTickets: number;
    resolvedToday: number;
    avgResponseTime: string;
  };
  sales: {
    messagesReceived: number;
    leadsConverted: number;
    activeConversations: number;
  };
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
}

/**
 * Fetch comprehensive dashboard statistics for Super Admin
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard statistics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return default/mock data on error
    return {
      bookings: {
        total: 186,
        pending: 12,
        confirmed: 45,
        completed: 120,
        cancelled: 9
      },
      tours: {
        total: 15,
        active: 12,
        upcoming: 8
      },
      visas: {
        total: 23,
        pending: 5,
        approved: 18,
        rejected: 0
      },
      customerService: {
        openTickets: 7,
        resolvedToday: 12,
        avgResponseTime: "15 min"
      },
      sales: {
        messagesReceived: 34,
        leadsConverted: 8,
        activeConversations: 12
      },
      revenue: {
        today: 3250,
        thisWeek: 18750,
        thisMonth: 65400,
        total: 245000
      },
      users: {
        total: 24,
        active: 18,
        newThisMonth: 3
      }
    };
  }
}

/**
 * Fetch department-specific statistics
 */
export async function fetchDepartmentStats(department: string): Promise<Partial<DashboardStats>> {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats/${department}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${department} statistics`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${department} stats:`, error);
    return {};
  }
}
