// Reports service for data aggregation and analytics

import type {
  ReportMetrics,
  BookingTrend,
  PopularDestination,
  CustomerSegment,
  RevenueBreakdown,
  CustomerAcquisition,
  PerformanceMetric,
  TourPerformance,
  CustomerSatisfactionMetric,
  BookingStatusReport,
  ComprehensiveReport,
  ReportFilter
} from '../types/reports';

const API_BASE_URL = (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) || 'http://localhost:4000';
function getToken() { return localStorage.getItem('token'); }

class ReportsService {
  async generateComprehensiveReport(filter: ReportFilter): Promise<ComprehensiveReport> {
    const res = await fetch(`${API_BASE_URL}/admin/reports/comprehensive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(filter),
    });
    if (!res.ok) throw new Error('Failed to generate comprehensive report');
    return await res.json();
  }

  async getReportMetrics(filter: ReportFilter): Promise<ReportMetrics> {
    const res = await fetch(`${API_BASE_URL}/admin/reports/metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(filter),
    });
    if (!res.ok) throw new Error('Failed to fetch report metrics');
    return await res.json();
  }

  async getBookingTrends(filter: ReportFilter): Promise<BookingTrend[]> {
    const res = await fetch(`${API_BASE_URL}/admin/reports/booking-trends`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(filter),
    });
    if (!res.ok) throw new Error('Failed to fetch booking trends');
    return await res.json();
  }

  async getPopularDestinations(filter: ReportFilter): Promise<PopularDestination[]> {
    const res = await fetch(`${API_BASE_URL}/admin/reports/popular-destinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(filter),
    });
    if (!res.ok) throw new Error('Failed to fetch popular destinations');
    return await res.json();
  }

  async getCustomerSegments(filter: ReportFilter): Promise<CustomerSegment[]> {
    const res = await fetch(`${API_BASE_URL}/admin/reports/customer-segments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(filter),
    });
    if (!res.ok) throw new Error('Failed to fetch customer segments');
    return await res.json();
  }

  async getRevenueBreakdown(filter: ReportFilter): Promise<RevenueBreakdown[]> {
    const res = await fetch(`${API_BASE_URL}/admin/reports/revenue-breakdown`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(filter),
    });
    if (!res.ok) throw new Error('Failed to fetch revenue breakdown');
    return await res.json();
  }

  async getCustomerAcquisition(filter: ReportFilter): Promise<CustomerAcquisition[]> {
    const res = await fetch(`${API_BASE_URL}/admin/reports/customer-acquisition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(filter),
    });
    if (!res.ok) throw new Error('Failed to fetch customer acquisition');
    return await res.json();
  }

  async getPerformanceMetrics(filter: ReportFilter): Promise<PerformanceMetric[]> {
    const res = await fetch(`${API_BASE_URL}/admin/reports/performance-metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(filter),
    });
    if (!res.ok) throw new Error('Failed to fetch performance metrics');
    return await res.json();
  }

  async getTourPerformance(filter: ReportFilter): Promise<TourPerformance[]> {
    const res = await fetch(`${API_BASE_URL}/admin/reports/tour-performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(filter),
    });
    if (!res.ok) throw new Error('Failed to fetch tour performance');
    return await res.json();
  }

  async getCustomerSatisfaction(filter: ReportFilter): Promise<CustomerSatisfactionMetric[]> {
    const res = await fetch(`${API_BASE_URL}/admin/reports/customer-satisfaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(filter),
    });
    if (!res.ok) throw new Error('Failed to fetch customer satisfaction');
    return await res.json();
  }

  async getBookingStatus(filter: ReportFilter): Promise<BookingStatusReport[]> {
    const res = await fetch(`${API_BASE_URL}/admin/reports/booking-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(filter),
    });
    if (!res.ok) throw new Error('Failed to fetch booking status');
    return await res.json();
  }

  // Export functionality (still mock, unless you have an API for this)
  async exportReport(format: 'csv' | 'pdf' | 'xlsx', reportData: ComprehensiveReport): Promise<Blob> {
    const data = JSON.stringify(reportData, null, 2);
    return new Blob([data], { type: 'application/json' });
  }

  // Real-time data refresh (still mock, unless you have WebSocket/polling)
  subscribeToUpdates(callback: (data: Partial<ComprehensiveReport>) => void): () => void {
    const interval = setInterval(() => {
      callback({});
    }, 30000);
    return () => clearInterval(interval);
  }
}

export const reportsService = new ReportsService();