

import {
  Customer,
  CustomerInquiry,
  CSRTask,
  CustomerTourHistory,
  CustomerServiceStats,
  TaskFilter,
} from '../types/customerService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
function getToken() { return localStorage.getItem('token'); }

export const customerServiceRepo = {
  async createInquiry(inquiry: Omit<CustomerInquiry, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomerInquiry> {
    const res = await fetch(`${API_BASE_URL}/admin/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(inquiry),
    });
    if (!res.ok) throw new Error('Failed to create inquiry');
    return await res.json();
  },

  async getAllCustomers(): Promise<Customer[]> {
    const res = await fetch(`${API_BASE_URL}/admin/customers`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error('Failed to fetch customers');
    return await res.json();
  },

  async getAllInquiries(): Promise<CustomerInquiry[]> {
    const res = await fetch(`${API_BASE_URL}/admin/inquiries`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error('Failed to fetch inquiries');
    return await res.json();
  },

  async updateInquiry(id: string, updates: Partial<CustomerInquiry>): Promise<CustomerInquiry> {
    const res = await fetch(`${API_BASE_URL}/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update inquiry');
    return await res.json();
  },

  async getAllTasks(filter?: TaskFilter): Promise<CSRTask[]> {
    const res = await fetch(`${API_BASE_URL}/admin/tasks/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(filter || {}),
    });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return await res.json();
  },

  async getTaskById(id: string): Promise<CSRTask | null> {
    const res = await fetch(`${API_BASE_URL}/admin/tasks/${id}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch task');
    return await res.json();
  },

  async createTask(task: Omit<CSRTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<CSRTask> {
    const res = await fetch(`${API_BASE_URL}/admin/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return await res.json();
  },

  async updateTask(id: string, updates: Partial<CSRTask>): Promise<CSRTask> {
    const res = await fetch(`${API_BASE_URL}/admin/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return await res.json();
  },

  async getCustomerTourHistory(customerId: string): Promise<CustomerTourHistory[]> {
    const res = await fetch(`${API_BASE_URL}/admin/customers/${customerId}/tour-history`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error('Failed to fetch tour history');
    return await res.json();
  },

  async getCustomerServiceStats(): Promise<CustomerServiceStats> {
    const res = await fetch(`${API_BASE_URL}/admin/customer-service/stats`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error('Failed to fetch customer service stats');
    return await res.json();
  },
};

