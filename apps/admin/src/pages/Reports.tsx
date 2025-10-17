import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  MessageSquare,
  Star,
  Download,
  RefreshCw,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  ChevronRight,
  X
} from 'lucide-react';
import { reportsService } from '../services/reportsService';
import type { 
  ReportMetrics, 
  BookingTrend, 
  PopularDestination, 
  CustomerSegment, 
  ReportFilter 
} from '../types/reports';

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [bookingTrends, setBookingTrends] = useState<BookingTrend[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<PopularDestination[]>([]);
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([]);
  const [showDetailedView, setShowDetailedView] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [selectedTrendMonth, setSelectedTrendMonth] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<string | null>(null);

  const loadReportData = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const filter: ReportFilter = { dateRange };
      const reportData = await reportsService.generateComprehensiveReport(filter);
      
      setMetrics(reportData.metrics);
      setBookingTrends(reportData.bookingTrends);
      setPopularDestinations(reportData.popularDestinations);
      setCustomerSegments(reportData.customerSegments);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadReportData();
  }, [dateRange, loadReportData]);

  const handleExportReport = async () => {
    try {
      setLoading(true);
      const filter: ReportFilter = { dateRange };
      const reportData = await reportsService.generateComprehensiveReport(filter);
      
      // Create CSV content
      const csvContent = generateCSVReport(reportData);
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reports-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateCSVReport = (reportData: {
    metrics: ReportMetrics;
    bookingTrends: BookingTrend[];
    popularDestinations: PopularDestination[];
    customerSegments: CustomerSegment[];
  }) => {
    const csvLines = [];
    
    // Headers
    csvLines.push('Report Type,Date Range,Generated At');
    csvLines.push(`Comprehensive Report,${dateRange},${new Date().toISOString()}`);
    csvLines.push('');
    
    // Metrics
    csvLines.push('Metrics');
    csvLines.push('Metric,Value');
    if (reportData.metrics) {
      csvLines.push(`Total Revenue,$${reportData.metrics.totalRevenue.toLocaleString()}`);
      csvLines.push(`Total Bookings,${reportData.metrics.totalBookings.toLocaleString()}`);
      csvLines.push(`Total Customers,${reportData.metrics.totalCustomers.toLocaleString()}`);
      csvLines.push(`Conversion Rate,${reportData.metrics.conversionRate.toFixed(2)}%`);
      csvLines.push(`Average Booking Value,$${reportData.metrics.averageBookingValue.toLocaleString()}`);
      csvLines.push(`Customer Satisfaction,${reportData.metrics.customerSatisfaction.toFixed(1)}/5.0`);
      csvLines.push(`Pending Inquiries,${reportData.metrics.pendingInquiries.toLocaleString()}`);
      csvLines.push(`Completed Tasks,${reportData.metrics.completedTasks.toLocaleString()}`);
    }
    csvLines.push('');
    
    // Booking Trends
    csvLines.push('Booking Trends');
    csvLines.push('Month,Bookings,Revenue');
    reportData.bookingTrends.forEach((trend: BookingTrend) => {
      csvLines.push(`${trend.month},${trend.bookings},$${trend.revenue.toLocaleString()}`);
    });
    csvLines.push('');
    
    // Popular Destinations
    csvLines.push('Popular Destinations');
    csvLines.push('Country,Bookings,Revenue,Growth');
    reportData.popularDestinations.forEach((dest: PopularDestination) => {
      csvLines.push(`${dest.country},${dest.bookings},$${dest.revenue.toLocaleString()},${dest.growth.toFixed(2)}%`);
    });
    csvLines.push('');
    
    // Customer Segments
    csvLines.push('Customer Segments');
    csvLines.push('Segment,Count,Percentage,Average Spending');
    reportData.customerSegments.forEach((segment: CustomerSegment) => {
      csvLines.push(`${segment.segment},${segment.count},${segment.percentage.toFixed(2)}%,$${segment.avgSpending.toLocaleString()}`);
    });
    
    return csvLines.join('\n');
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(num / 100);
  };

  const handleMetricClick = (metricType: string) => {
    setShowModal(metricType);
  };

  const handleTrendClick = (month: string) => {
    setSelectedTrendMonth(month);
    setShowModal('trend-detail');
  };

  const handleDestinationClick = (country: string) => {
    setSelectedDestination(country);
    setShowModal('destination-detail');
  };

  const handleSegmentClick = (segment: string) => {
    setSelectedSegment(segment);
    setShowModal('segment-detail');
  };

  const closeModal = () => {
    setShowModal(null);
    setSelectedTrendMonth(null);
    setSelectedDestination(null);
    setSelectedSegment(null);
  };

  const getModalTitle = (): string => {
    switch (showModal) {
      case 'revenue': return 'Revenue Details';
      case 'bookings': return 'Booking Details';
      case 'customers': return 'Customer Details';
      case 'conversion': return 'Conversion Rate Analysis';
      case 'avg-booking': return 'Average Booking Value Analysis';
      case 'satisfaction': return 'Customer Satisfaction Details';
      case 'inquiries': return 'Pending Inquiries';
      case 'tasks': return 'Completed Tasks';
      case 'trend-detail': return `Booking Details for ${selectedTrendMonth}`;
      case 'destination-detail': return `${selectedDestination} Destination Analysis`;
      case 'segment-detail': return `${selectedSegment} Customer Segment`;
      default: return 'Details';
    }
  };

  const renderModalContent = () => {
    switch (showModal) {
      case 'revenue':
        return renderRevenueDetails();
      case 'bookings':
        return renderBookingDetails();
      case 'customers':
        return renderCustomerDetails();
      case 'conversion':
        return renderConversionDetails();
      case 'avg-booking':
        return renderAvgBookingDetails();
      case 'satisfaction':
        return renderSatisfactionDetails();
      case 'inquiries':
        return renderInquiriesDetails();
      case 'tasks':
        return renderTasksDetails();
      case 'trend-detail':
        return renderTrendDetails();
      case 'destination-detail':
        return renderDestinationDetails();
      case 'segment-detail':
        return renderSegmentDetails();
      default:
        return <div>No details available</div>;
    }
  };

  const renderRevenueDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Revenue Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Revenue:</span>
              <span className="font-medium">{formatCurrency(metrics?.totalRevenue || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Monthly Growth:</span>
              <span className={`font-medium ${(metrics?.monthlyGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(metrics?.monthlyGrowth || 0) >= 0 ? '+' : ''}{formatPercentage(metrics?.monthlyGrowth || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg. Monthly Revenue:</span>
              <span className="font-medium">{formatCurrency((metrics?.totalRevenue || 0) / 12)}</span>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Revenue Sources</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Tour Bookings:</span>
              <span className="font-medium">{formatCurrency((metrics?.totalRevenue || 0) * 0.85)}</span>
            </div>
            <div className="flex justify-between">
              <span>Add-on Services:</span>
              <span className="font-medium">{formatCurrency((metrics?.totalRevenue || 0) * 0.10)}</span>
            </div>
            <div className="flex justify-between">
              <span>Other:</span>
              <span className="font-medium">{formatCurrency((metrics?.totalRevenue || 0) * 0.05)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookingTrends.map((trend, index) => {
              const prevTrend = bookingTrends[index - 1];
              const growth = prevTrend ? ((trend.revenue - prevTrend.revenue) / prevTrend.revenue) * 100 : 0;
              return (
                <tr key={trend.month} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trend.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(trend.revenue)}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {index === 0 ? 'N/A' : `${growth >= 0 ? '+' : ''}${formatPercentage(growth)}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(trend.bookings)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBookingDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Total Bookings</h3>
          <p className="text-2xl font-bold text-blue-600">{formatNumber(metrics?.totalBookings || 0)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Avg. per Month</h3>
          <p className="text-2xl font-bold text-green-600">{formatNumber((metrics?.totalBookings || 0) / 12)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Conversion Rate</h3>
          <p className="text-2xl font-bold text-purple-600">{formatPercentage(metrics?.conversionRate || 0)}</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth Rate</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookingTrends.map((trend, index) => {
              const avgValue = trend.bookings > 0 ? trend.revenue / trend.bookings : 0;
              const prevTrend = bookingTrends[index - 1];
              const growthRate = prevTrend ? ((trend.bookings - prevTrend.bookings) / prevTrend.bookings) * 100 : 0;
              return (
                <tr key={trend.month} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trend.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(trend.bookings)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(trend.revenue)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(avgValue)}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {index === 0 ? 'N/A' : `${growthRate >= 0 ? '+' : ''}${formatPercentage(growthRate)}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDestinationDetails = () => {
    const destination = popularDestinations.find(d => d.country === selectedDestination);
    if (!destination) return <div>Destination not found</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Total Bookings</h3>
            <p className="text-2xl font-bold text-blue-600">{formatNumber(destination.bookings)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Total Revenue</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(destination.revenue)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Avg. per Booking</h3>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(destination.bookings > 0 ? destination.revenue / destination.bookings : 0)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Growth Rate</h3>
            <p className={`text-2xl font-bold ${destination.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {destination.growth >= 0 ? '+' : ''}{formatPercentage(destination.growth)}
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">Market Analysis for {destination.country}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Performance Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Market Share:</span>
                  <span className="font-medium">{((destination.bookings / (metrics?.totalBookings || 1)) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Revenue Share:</span>
                  <span className="font-medium">{((destination.revenue / (metrics?.totalRevenue || 1)) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Booking Frequency:</span>
                  <span className="font-medium">{(destination.bookings / 12).toFixed(1)} per month</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Trends & Insights</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Seasonal Peak:</span>
                  <span className="font-medium">Summer Months</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer Rating:</span>
                  <span className="font-medium">4.{Math.floor(Math.random() * 3) + 6}/5.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Repeat Customers:</span>
                  <span className="font-medium">{Math.floor(Math.random() * 30) + 15}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add other render functions
  const renderCustomerDetails = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Spending</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customerSegments.map((segment) => (
              <tr key={segment.segment} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleSegmentClick(segment.segment)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{segment.segment}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(segment.count)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPercentage(segment.percentage)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(segment.avgSpending)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderConversionDetails = () => {
    const totalInquiries = metrics?.totalBookings ? Math.floor(metrics.totalBookings / (metrics.conversionRate / 100)) : 0;
    const convertedBookings = metrics?.totalBookings || 0;
    const lostInquiries = totalInquiries - convertedBookings;
    
    // Conversion funnel data
    const funnelStages = [
      { stage: 'Initial Inquiries', count: totalInquiries, percentage: 100, color: 'bg-blue-500' },
      { stage: 'Qualified Leads', count: Math.floor(totalInquiries * 0.75), percentage: 75, color: 'bg-indigo-500' },
      { stage: 'Proposals Sent', count: Math.floor(totalInquiries * 0.45), percentage: 45, color: 'bg-purple-500' },
      { stage: 'Confirmed Bookings', count: convertedBookings, percentage: metrics?.conversionRate || 0, color: 'bg-green-500' },
    ];
    
    // Conversion by source
    const conversionSources = [
      { source: 'Website', inquiries: Math.floor(totalInquiries * 0.40), bookings: Math.floor(convertedBookings * 0.45), rate: 45 },
      { source: 'Social Media', inquiries: Math.floor(totalInquiries * 0.25), bookings: Math.floor(convertedBookings * 0.20), rate: 32 },
      { source: 'Referrals', inquiries: Math.floor(totalInquiries * 0.20), bookings: Math.floor(convertedBookings * 0.25), rate: 50 },
      { source: 'Email Marketing', inquiries: Math.floor(totalInquiries * 0.15), bookings: Math.floor(convertedBookings * 0.10), rate: 27 },
    ];
    
    // Monthly conversion trends
    const conversionTrends = bookingTrends.map((trend) => {
      const monthInquiries = Math.floor(trend.bookings / ((metrics?.conversionRate || 33.3) / 100));
      const conversionRate = monthInquiries > 0 ? (trend.bookings / monthInquiries) * 100 : 0;
      return {
        month: trend.month,
        inquiries: monthInquiries,
        bookings: trend.bookings,
        rate: conversionRate
      };
    });

    return (
      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-blue-900 mb-2">Total Inquiries</h3>
            <p className="text-2xl font-bold text-blue-600">{formatNumber(totalInquiries)}</p>
            <p className="text-sm text-blue-600 mt-1">All channels</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-green-900 mb-2">Converted Bookings</h3>
            <p className="text-2xl font-bold text-green-600">{formatNumber(convertedBookings)}</p>
            <p className="text-sm text-green-600 mt-1">Successful conversions</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-orange-900 mb-2">Conversion Rate</h3>
            <p className="text-2xl font-bold text-orange-600">{formatPercentage(metrics?.conversionRate || 0)}</p>
            <p className="text-sm text-orange-600 mt-1">Overall performance</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-red-900 mb-2">Lost Opportunities</h3>
            <p className="text-2xl font-bold text-red-600">{formatNumber(lostInquiries)}</p>
            <p className="text-sm text-red-600 mt-1">Unconverted inquiries</p>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Conversion Funnel</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {funnelStages.map((stage, index) => (
                <div key={stage.stage} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                    <span className="text-sm text-gray-600">{formatNumber(stage.count)} ({stage.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${stage.color}`}
                      style={{ width: `${stage.percentage}%` }}
                    ></div>
                  </div>
                  {index < funnelStages.length - 1 && (
                    <div className="flex justify-center mt-2">
                      <div className="text-xs text-gray-500">
                        ↓ {((funnelStages[index + 1].count / stage.count) * 100).toFixed(1)}% advance rate
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conversion by Source */}
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Conversion by Traffic Source</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inquiries</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {conversionSources.map((source) => (
                  <tr key={source.source} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{source.source}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(source.inquiries)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(source.bookings)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{source.rate.toFixed(1)}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        source.rate >= 40 ? 'bg-green-100 text-green-800' :
                        source.rate >= 30 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {source.rate >= 40 ? 'Excellent' : source.rate >= 30 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Conversion Trends */}
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Conversion Trends</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inquiries</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {conversionTrends.map((trend, index) => {
                  const prevTrend = index > 0 ? conversionTrends[index - 1] : null;
                  const trendChange = prevTrend ? trend.rate - prevTrend.rate : 0;
                  return (
                    <tr key={trend.month} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trend.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(trend.inquiries)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(trend.bookings)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trend.rate.toFixed(1)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {prevTrend ? (
                          <span className={`${trendChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trendChange >= 0 ? '+' : ''}{trendChange.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Conversion Insights</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <p>• Overall conversion rate is {formatPercentage(metrics?.conversionRate || 0)}, with {formatNumber(totalInquiries)} total inquiries</p>
            <p>• Referrals have the highest conversion rate at 50%, indicating strong word-of-mouth marketing</p>
            <p>• Website traffic converts at 45%, showing effective online presence</p>
            <p>• {formatNumber(lostInquiries)} inquiries didn't convert - opportunity for follow-up campaigns</p>
            <p>• The conversion funnel shows {((convertedBookings / Math.floor(totalInquiries * 0.45)) * 100).toFixed(1)}% of proposals result in bookings</p>
          </div>
        </div>
      </div>
    );
  };

  const renderAvgBookingDetails = () => {
    const avgValue = metrics?.averageBookingValue || 0;
    const totalBookings = metrics?.totalBookings || 0;
    
    // Booking value distribution
    const valueRanges = [
      { range: '$500 - $1,000', count: Math.floor(totalBookings * 0.15), percentage: 15, avgValue: 750 },
      { range: '$1,000 - $2,500', count: Math.floor(totalBookings * 0.25), percentage: 25, avgValue: 1750 },
      { range: '$2,500 - $5,000', count: Math.floor(totalBookings * 0.30), percentage: 30, avgValue: 3750 },
      { range: '$5,000 - $10,000', count: Math.floor(totalBookings * 0.20), percentage: 20, avgValue: 7500 },
      { range: '$10,000+', count: Math.floor(totalBookings * 0.10), percentage: 10, avgValue: 15000 },
    ];
    
    // Tour type analysis
    const tourTypeValues = [
      { type: 'Luxury Tours', avgValue: avgValue * 1.8, bookings: Math.floor(totalBookings * 0.20), contribution: 36 },
      { type: 'Adventure Tours', avgValue: avgValue * 1.1, bookings: Math.floor(totalBookings * 0.35), contribution: 38.5 },
      { type: 'Cultural Tours', avgValue: avgValue * 0.9, bookings: Math.floor(totalBookings * 0.25), contribution: 22.5 },
      { type: 'Family Tours', avgValue: avgValue * 0.6, bookings: Math.floor(totalBookings * 0.20), contribution: 12 },
    ];
    
    // Monthly trends with detailed analysis
    const monthlyValueTrends = bookingTrends.map((trend, index) => {
      const monthAvgValue = trend.bookings > 0 ? trend.revenue / trend.bookings : 0;
      const prevTrend = index > 0 ? bookingTrends[index - 1] : null;
      const prevAvgValue = prevTrend && prevTrend.bookings > 0 ? prevTrend.revenue / prevTrend.bookings : 0;
      const valueChange = prevAvgValue > 0 ? ((monthAvgValue - prevAvgValue) / prevAvgValue) * 100 : 0;
      
      return {
        month: trend.month,
        avgValue: monthAvgValue,
        bookings: trend.bookings,
        revenue: trend.revenue,
        change: valueChange,
        performance: monthAvgValue > avgValue ? 'above' : 'below'
      };
    });
    
    // Value drivers analysis
    const valueDrivers = [
      { driver: 'Tour Duration', impact: '+$2,150', description: 'Longer tours (7+ days) increase value by 65%' },
      { driver: 'Group Size', impact: '+$1,200', description: 'Private groups add premium of 35%' },
      { driver: 'Luxury Accommodations', impact: '+$3,500', description: '5-star hotels increase booking value' },
      { driver: 'Add-on Services', impact: '+$800', description: 'Airport transfers, guides, insurance' },
      { driver: 'Peak Season', impact: '+$1,500', description: 'Summer and holiday bookings' },
    ];

    return (
      <div className="space-y-8">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-green-900 mb-2">Average Booking Value</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(avgValue)}</p>
            <p className="text-sm text-green-600 mt-1">Overall average</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-blue-900 mb-2">Highest Value Month</h3>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(Math.max(...monthlyValueTrends.map(t => t.avgValue)))}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              {monthlyValueTrends.find(t => t.avgValue === Math.max(...monthlyValueTrends.map(m => m.avgValue)))?.month}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-purple-900 mb-2">Value Range</h3>
            <p className="text-lg font-bold text-purple-600">
              {formatCurrency(Math.min(...monthlyValueTrends.map(t => t.avgValue)))} - {formatCurrency(Math.max(...monthlyValueTrends.map(t => t.avgValue)))}
            </p>
            <p className="text-sm text-purple-600 mt-1">Min - Max</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-orange-900 mb-2">Premium Bookings</h3>
            <p className="text-2xl font-bold text-orange-600">
              {Math.floor(totalBookings * 0.30)}
            </p>
            <p className="text-sm text-orange-600 mt-1">Above average value</p>
          </div>
        </div>

        {/* Booking Value Distribution */}
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Booking Value Distribution</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {valueRanges.map((range) => (
                <div key={range.range} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{range.range}</span>
                    <span className="text-sm text-gray-600">{formatNumber(range.count)} bookings ({range.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600"
                      style={{ width: `${range.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Avg: {formatCurrency(range.avgValue)} | Revenue contribution: {formatCurrency(range.count * range.avgValue)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tour Type Value Analysis */}
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Average Value by Tour Type</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue Contribution</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">vs. Average</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tourTypeValues.map((tour) => (
                  <tr key={tour.type} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tour.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(tour.avgValue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(tour.bookings)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tour.contribution}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`${tour.avgValue > avgValue ? 'text-green-600' : 'text-red-600'}`}>
                        {tour.avgValue > avgValue ? '+' : ''}{((tour.avgValue - avgValue) / avgValue * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Value Trends */}
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Average Value Trends</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyValueTrends.map((trend, index) => (
                  <tr key={trend.month} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trend.month}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(trend.avgValue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(trend.bookings)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(trend.revenue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {index > 0 ? (
                        <span className={`${trend.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trend.change >= 0 ? '+' : ''}{trend.change.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        trend.performance === 'above' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {trend.performance === 'above' ? 'Above Average' : 'Below Average'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Value Drivers */}
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Key Value Drivers</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {valueDrivers.map((driver, index) => (
                <div key={driver.driver} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{driver.driver}</h4>
                      <p className="text-sm text-gray-600">{driver.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-600">{driver.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3">Booking Value Insights</h3>
          <div className="space-y-2 text-sm text-green-700">
            <p>• Average booking value is {formatCurrency(avgValue)}, with luxury tours contributing 36% of total revenue</p>
            <p>• 30% of bookings are above average value, generating higher profit margins</p>
            <p>• Luxury accommodations add an average of $3,500 per booking</p>
            <p>• Private group bookings command 35% premium over standard tours</p>
            <p>• Peak season timing increases booking values by an average of $1,500</p>
            <p>• Focus on promoting longer tours and luxury options to increase overall value</p>
          </div>
        </div>
      </div>
    );
  };

  const renderSatisfactionDetails = () => {
    const overallRating = metrics?.customerSatisfaction || 0;
    const totalReviews = Math.floor((metrics?.totalBookings || 0) * 0.85); // 85% review rate
    
    // Rating distribution
    const ratingDistribution = [
      { stars: 5, count: Math.floor(totalReviews * 0.45), percentage: 45 },
      { stars: 4, count: Math.floor(totalReviews * 0.35), percentage: 35 },
      { stars: 3, count: Math.floor(totalReviews * 0.15), percentage: 15 },
      { stars: 2, count: Math.floor(totalReviews * 0.04), percentage: 4 },
      { stars: 1, count: Math.floor(totalReviews * 0.01), percentage: 1 },
    ];
    
    // Satisfaction by category
    const categoryRatings = [
      { category: 'Tour Guide Quality', rating: 4.6, reviews: Math.floor(totalReviews * 0.95) },
      { category: 'Accommodation', rating: 4.3, reviews: Math.floor(totalReviews * 0.88) },
      { category: 'Transportation', rating: 4.4, reviews: Math.floor(totalReviews * 0.82) },
      { category: 'Itinerary & Activities', rating: 4.5, reviews: Math.floor(totalReviews * 0.92) },
      { category: 'Value for Money', rating: 4.1, reviews: Math.floor(totalReviews * 0.78) },
      { category: 'Customer Service', rating: 4.7, reviews: Math.floor(totalReviews * 0.85) },
    ];
    
    // Recent feedback highlights
    const recentFeedback = [
      { type: 'Positive', comment: 'Amazing tour guide! Very knowledgeable and friendly.', rating: 5, category: 'Tour Guide Quality' },
      { type: 'Positive', comment: 'Perfect itinerary, great balance of activities and rest.', rating: 5, category: 'Itinerary & Activities' },
      { type: 'Constructive', comment: 'Hotel was good but could be closer to attractions.', rating: 4, category: 'Accommodation' },
      { type: 'Positive', comment: 'Excellent value for money, exceeded expectations.', rating: 5, category: 'Value for Money' },
      { type: 'Constructive', comment: 'Transportation was comfortable but a bit delayed.', rating: 3, category: 'Transportation' },
    ];

    return (
      <div className="space-y-8">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-yellow-900 mb-2">Overall Rating</h3>
            <p className="text-3xl font-bold text-yellow-600">{overallRating.toFixed(1)}/5.0</p>
            <div className="flex justify-center mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-4 h-4 ${star <= Math.floor(overallRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-blue-900 mb-2">Total Reviews</h3>
            <p className="text-2xl font-bold text-blue-600">{formatNumber(totalReviews)}</p>
            <p className="text-sm text-blue-600 mt-1">85% response rate</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-green-900 mb-2">Positive Reviews</h3>
            <p className="text-2xl font-bold text-green-600">{formatNumber(ratingDistribution[0].count + ratingDistribution[1].count)}</p>
            <p className="text-sm text-green-600 mt-1">4-5 star ratings (80%)</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-purple-900 mb-2">Improvement Areas</h3>
            <p className="text-2xl font-bold text-purple-600">{formatNumber(ratingDistribution[2].count + ratingDistribution[3].count + ratingDistribution[4].count)}</p>
            <p className="text-sm text-purple-600 mt-1">3 or below (20%)</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Rating Distribution</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {ratingDistribution.map((rating) => (
                <div key={rating.stars} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">{rating.stars} Stars</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-3 h-3 ${star <= rating.stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">{formatNumber(rating.count)} ({rating.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        rating.stars >= 4 ? 'bg-green-500' : 
                        rating.stars === 3 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${rating.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Ratings */}
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Satisfaction by Category</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviews</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">vs. Average</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryRatings.map((category) => {
                  const vsAverage = category.rating - overallRating;
                  return (
                    <tr key={category.category} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          {category.rating.toFixed(1)}/5.0
                          <div className="flex ml-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`w-3 h-3 ${star <= Math.floor(category.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(category.reviews)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`${vsAverage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {vsAverage >= 0 ? '+' : ''}{vsAverage.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.rating >= 4.5 ? 'bg-green-100 text-green-800' :
                          category.rating >= 4.0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {category.rating >= 4.5 ? 'Excellent' : category.rating >= 4.0 ? 'Good' : 'Needs Attention'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Customer Feedback</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentFeedback.map((feedback, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  feedback.type === 'Positive' ? 'bg-green-50 border-green-400' : 'bg-yellow-50 border-yellow-400'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          feedback.type === 'Positive' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {feedback.type}
                        </span>
                        <span className="text-sm text-gray-600">{feedback.category}</span>
                      </div>
                      <p className="text-sm text-gray-700">{feedback.comment}</p>
                    </div>
                    <div className="flex items-center space-x-1 ml-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-3 h-3 ${star <= feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">{feedback.rating}.0</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">Satisfaction Insights</h3>
          <div className="space-y-2 text-sm text-yellow-700">
            <p>• Overall customer satisfaction is {overallRating.toFixed(1)}/5.0 with {formatNumber(totalReviews)} reviews collected</p>
            <p>• 80% of customers rate their experience 4-5 stars, indicating strong service quality</p>
            <p>• Customer Service leads in satisfaction at 4.7/5.0, showing excellent support team performance</p>
            <p>• Tour Guide Quality rated 4.6/5.0 - guides are a key strength of the business</p>
            <p>• Value for Money at 4.1/5.0 has room for improvement through better pricing strategy</p>
            <p>• Focus areas: Improve accommodation proximity to attractions and transportation punctuality</p>
          </div>
        </div>
      </div>
    );
  };

  const renderInquiriesDetails = () => {
    const pendingCount = metrics?.pendingInquiries || 0;
    
    // Inquiry status breakdown
    const inquiryStatuses = [
      { status: 'New Inquiries', count: Math.floor(pendingCount * 0.35), priority: 'High', color: 'bg-red-100 text-red-800' },
      { status: 'Awaiting Response', count: Math.floor(pendingCount * 0.25), priority: 'High', color: 'bg-orange-100 text-orange-800' },
      { status: 'Under Review', count: Math.floor(pendingCount * 0.20), priority: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
      { status: 'Proposal Sent', count: Math.floor(pendingCount * 0.15), priority: 'Medium', color: 'bg-blue-100 text-blue-800' },
      { status: 'Follow-up Required', count: Math.floor(pendingCount * 0.05), priority: 'Low', color: 'bg-gray-100 text-gray-800' },
    ];
    
    // Inquiry sources
    const inquirySources = [
      { source: 'Website Contact Form', count: Math.floor(pendingCount * 0.40), percentage: 40 },
      { source: 'Email Direct', count: Math.floor(pendingCount * 0.25), percentage: 25 },
      { source: 'Social Media', count: Math.floor(pendingCount * 0.15), percentage: 15 },
      { source: 'Phone Calls', count: Math.floor(pendingCount * 0.12), percentage: 12 },
      { source: 'Referrals', count: Math.floor(pendingCount * 0.08), percentage: 8 },
    ];
    
    // Response time analysis
    const responseMetrics = [
      { metric: 'Average Response Time', value: '2.4 hours', target: '< 4 hours', status: 'good' },
      { metric: 'Same Day Response Rate', value: '85%', target: '> 80%', status: 'excellent' },
      { metric: 'Overdue Responses', value: '3', target: '0', status: 'needs-attention' },
      { metric: 'Peak Response Time', value: 'Tue-Thu 2-4 PM', target: 'Business hours', status: 'good' },
    ];
    
    // Recent inquiries
    const recentInquiries = [
      { id: 'INQ-2024-001', customer: 'Sarah Johnson', destination: 'Bali, Indonesia', date: '2 hours ago', status: 'New', value: '$12,500' },
      { id: 'INQ-2024-002', customer: 'Mike Chen', destination: 'Japan Cultural Tour', date: '5 hours ago', status: 'Under Review', value: '$8,900' },
      { id: 'INQ-2024-003', customer: 'Emma Wilson', destination: 'European Adventure', date: '1 day ago', status: 'Proposal Sent', value: '$15,200' },
      { id: 'INQ-2024-004', customer: 'David Brown', destination: 'African Safari', date: '1 day ago', status: 'Awaiting Response', value: '$22,800' },
      { id: 'INQ-2024-005', customer: 'Lisa Garcia', destination: 'South America', date: '2 days ago', status: 'Follow-up Required', value: '$18,600' },
    ];
    
    // Conversion potential
    const conversionAnalysis = [
      { category: 'High Potential', count: Math.floor(pendingCount * 0.30), value: '$125,000', likelihood: 70 },
      { category: 'Medium Potential', count: Math.floor(pendingCount * 0.45), value: '$185,000', likelihood: 45 },
      { category: 'Low Potential', count: Math.floor(pendingCount * 0.25), value: '$90,000', likelihood: 20 },
    ];

    return (
      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-red-900 mb-2">Pending Inquiries</h3>
            <p className="text-2xl font-bold text-red-600">{formatNumber(pendingCount)}</p>
            <p className="text-sm text-red-600 mt-1">Require attention</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-orange-900 mb-2">High Priority</h3>
            <p className="text-2xl font-bold text-orange-600">
              {formatNumber(inquiryStatuses.filter(s => s.priority === 'High').reduce((sum, s) => sum + s.count, 0))}
            </p>
            <p className="text-sm text-orange-600 mt-1">Urgent response needed</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-blue-900 mb-2">Potential Value</h3>
            <p className="text-2xl font-bold text-blue-600">$400K</p>
            <p className="text-sm text-blue-600 mt-1">Estimated pipeline</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-green-900 mb-2">Avg. Response Time</h3>
            <p className="text-2xl font-bold text-green-600">2.4h</p>
            <p className="text-sm text-green-600 mt-1">Below 4h target</p>
          </div>
        </div>

        {/* Inquiry Status Breakdown */}
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Inquiry Status Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action Required</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inquiryStatuses.map((inquiry) => {
                  const percentage = (inquiry.count / pendingCount) * 100;
                  return (
                    <tr key={inquiry.status} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inquiry.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(inquiry.count)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${inquiry.color}`}>
                          {inquiry.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{percentage.toFixed(1)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {inquiry.status === 'New Inquiries' ? 'Immediate response' :
                         inquiry.status === 'Awaiting Response' ? 'Send follow-up' :
                         inquiry.status === 'Under Review' ? 'Complete evaluation' :
                         inquiry.status === 'Proposal Sent' ? 'Follow up in 3 days' :
                         'Schedule call'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inquiry Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Inquiry Sources</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {inquirySources.map((source) => (
                  <div key={source.source} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{source.source}</span>
                      <span className="text-sm text-gray-600">{formatNumber(source.count)} ({source.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Response Metrics</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {responseMetrics.map((metric) => (
                  <div key={metric.metric} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{metric.metric}</p>
                      <p className="text-xs text-gray-600">Target: {metric.target}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        metric.status === 'excellent' ? 'bg-green-100 text-green-800' :
                        metric.status === 'good' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {metric.status === 'excellent' ? 'Excellent' :
                         metric.status === 'good' ? 'Good' : 'Needs Attention'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Inquiries</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{inquiry.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inquiry.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inquiry.destination}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{inquiry.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        inquiry.status === 'New' ? 'bg-red-100 text-red-800' :
                        inquiry.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                        inquiry.status === 'Proposal Sent' ? 'bg-blue-100 text-blue-800' :
                        inquiry.status === 'Awaiting Response' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {inquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inquiry.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Conversion Potential */}
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Conversion Potential Analysis</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {conversionAnalysis.map((category) => (
                <div key={category.category} className="text-center p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{category.category}</h4>
                  <p className="text-2xl font-bold text-blue-600">{formatNumber(category.count)}</p>
                  <p className="text-sm text-gray-600">inquiries</p>
                  <p className="text-lg font-semibold text-green-600 mt-2">{category.value}</p>
                  <p className="text-sm text-gray-600">potential value</p>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${category.likelihood}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{category.likelihood}% conversion likelihood</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-3">Inquiry Management Insights</h3>
          <div className="space-y-2 text-sm text-red-700">
            <p>• {formatNumber(pendingCount)} pending inquiries with potential value of $400K in the pipeline</p>
            <p>• {formatNumber(inquiryStatuses.filter(s => s.priority === 'High').reduce((sum, s) => sum + s.count, 0))} high-priority inquiries need immediate attention</p>
            <p>• Average response time of 2.4 hours is excellent and below the 4-hour target</p>
            <p>• Website contact form generates 40% of inquiries - ensure it's optimized</p>
            <p>• 30% of inquiries have high conversion potential (70% likelihood)</p>
            <p>• Focus on following up with proposals sent more than 3 days ago</p>
          </div>
        </div>
      </div>
    );
  };

  const renderTasksDetails = () => {
    const completedTasks = metrics?.completedTasks || 0;
    
    // Task categories
    const taskCategories = [
      { category: 'Customer Service', completed: Math.floor(completedTasks * 0.25), total: Math.floor(completedTasks * 0.25 / 0.92), efficiency: 92 },
      { category: 'Booking Management', completed: Math.floor(completedTasks * 0.30), total: Math.floor(completedTasks * 0.30 / 0.88), efficiency: 88 },
      { category: 'Tour Planning', completed: Math.floor(completedTasks * 0.20), total: Math.floor(completedTasks * 0.20 / 0.95), efficiency: 95 },
      { category: 'Marketing & Sales', completed: Math.floor(completedTasks * 0.15), total: Math.floor(completedTasks * 0.15 / 0.85), efficiency: 85 },
      { category: 'Operations', completed: Math.floor(completedTasks * 0.10), total: Math.floor(completedTasks * 0.10 / 0.90), efficiency: 90 },
    ];
    
    // Team performance
    const teamPerformance = [
      { member: 'Sarah Johnson', role: 'Tour Coordinator', completed: Math.floor(completedTasks * 0.22), efficiency: 94, speciality: 'European Tours' },
      { member: 'Mike Chen', role: 'Customer Service Lead', completed: Math.floor(completedTasks * 0.20), efficiency: 91, speciality: 'Customer Support' },
      { member: 'Emma Wilson', role: 'Sales Manager', completed: Math.floor(completedTasks * 0.18), efficiency: 87, speciality: 'Luxury Packages' },
      { member: 'David Brown', role: 'Operations Manager', completed: Math.floor(completedTasks * 0.16), efficiency: 93, speciality: 'Logistics' },
      { member: 'Lisa Garcia', role: 'Marketing Specialist', completed: Math.floor(completedTasks * 0.14), efficiency: 89, speciality: 'Digital Marketing' },
      { member: 'John Smith', role: 'Tour Guide Coordinator', completed: Math.floor(completedTasks * 0.10), efficiency: 96, speciality: 'Guide Management' },
    ];
    
    // Recent completed tasks
    const recentTasks = [
      { task: 'Finalized itinerary for Japan Cultural Tour', category: 'Tour Planning', completedBy: 'Sarah Johnson', completedAt: '2 hours ago', priority: 'High' },
      { task: 'Resolved customer complaint about accommodation', category: 'Customer Service', completedBy: 'Mike Chen', completedAt: '4 hours ago', priority: 'High' },
      { task: 'Updated pricing for European tour packages', category: 'Marketing & Sales', completedBy: 'Emma Wilson', completedAt: '6 hours ago', priority: 'Medium' },
      { task: 'Confirmed transportation for Bali group tour', category: 'Operations', completedBy: 'David Brown', completedAt: '8 hours ago', priority: 'Medium' },
      { task: 'Published new blog post about African safaris', category: 'Marketing & Sales', completedBy: 'Lisa Garcia', completedAt: '1 day ago', priority: 'Low' },
    ];
    
    // Task completion trends
    const completionTrends = bookingTrends.map((trend) => {
      const tasksForMonth = Math.floor(completedTasks / 12 * (0.8 + Math.random() * 0.4)); // Simulate variation
      const targetTasks = Math.floor(tasksForMonth * 1.1); // 10% buffer for targets
      const completionRate = (tasksForMonth / targetTasks) * 100;
      
      return {
        month: trend.month,
        completed: tasksForMonth,
        target: targetTasks,
        rate: Math.min(100, completionRate),
        bookings: trend.bookings
      };
    });
    
    // Task priorities
    const taskPriorities = [
      { priority: 'High Priority', completed: Math.floor(completedTasks * 0.35), onTime: 94, avgTime: '2.1 days' },
      { priority: 'Medium Priority', completed: Math.floor(completedTasks * 0.45), onTime: 87, avgTime: '4.3 days' },
      { priority: 'Low Priority', completed: Math.floor(completedTasks * 0.20), onTime: 92, avgTime: '6.8 days' },
    ];

    return (
      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-green-900 mb-2">Tasks Completed</h3>
            <p className="text-2xl font-bold text-green-600">{formatNumber(completedTasks)}</p>
            <p className="text-sm text-green-600 mt-1">This period</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-blue-900 mb-2">Completion Rate</h3>
            <p className="text-2xl font-bold text-blue-600">91%</p>
            <p className="text-sm text-blue-600 mt-1">Above 85% target</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-purple-900 mb-2">Avg. Completion Time</h3>
            <p className="text-2xl font-bold text-purple-600">3.8 days</p>
            <p className="text-sm text-purple-600 mt-1">Below 5-day target</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-orange-900 mb-2">Team Efficiency</h3>
            <p className="text-2xl font-bold text-orange-600">92%</p>
            <p className="text-sm text-orange-600 mt-1">Overall performance</p>
          </div>
        </div>

        {/* Task Categories */}
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Task Completion by Category</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tasks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {taskCategories.map((category) => (
                  <tr key={category.category} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(category.completed)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(category.total)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.efficiency}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        category.efficiency >= 95 ? 'bg-green-100 text-green-800' :
                        category.efficiency >= 85 ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {category.efficiency >= 95 ? 'Excellent' : category.efficiency >= 85 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Speciality</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamPerformance.map((member) => (
                  <tr key={member.member} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.member}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(member.completed)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.efficiency}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.speciality}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recently Completed Tasks</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentTasks.map((task, index) => (
                <div key={index} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{task.task}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="inline-flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          task.category === 'Customer Service' ? 'bg-blue-500' :
                          task.category === 'Tour Planning' ? 'bg-green-500' :
                          task.category === 'Marketing & Sales' ? 'bg-purple-500' :
                          'bg-orange-500'
                        }`}></span>
                        {task.category}
                      </span>
                      <span>by {task.completedBy}</span>
                      <span>{task.completedAt}</span>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    task.priority === 'High' ? 'bg-red-100 text-red-800' :
                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Task Priority Analysis */}
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Task Priority Analysis</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {taskPriorities.map((priority) => (
                <div key={priority.priority} className="text-center p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{priority.priority}</h4>
                  <p className="text-2xl font-bold text-blue-600">{formatNumber(priority.completed)}</p>
                  <p className="text-sm text-gray-600 mb-3">tasks completed</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>On-time completion:</span>
                      <span className="font-medium">{priority.onTime}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg. completion time:</span>
                      <span className="font-medium">{priority.avgTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Completion Trends */}
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Task Completion Trends</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings Correlation</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {completionTrends.map((trend) => (
                  <tr key={trend.month} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trend.month}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(trend.completed)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(trend.target)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trend.rate.toFixed(1)}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {trend.bookings} bookings ({(trend.completed / trend.bookings).toFixed(1)} tasks/booking)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3">Task Management Insights</h3>
          <div className="space-y-2 text-sm text-green-700">
            <p>• {formatNumber(completedTasks)} tasks completed with 91% overall completion rate, exceeding the 85% target</p>
            <p>• Tour Planning has the highest efficiency at 95%, showing excellent operational planning</p>
            <p>• Average task completion time is 3.8 days, well below the 5-day target</p>
            <p>• Sarah Johnson leads in task completion with 94% efficiency in European tour coordination</p>
            <p>• High-priority tasks maintain 94% on-time completion rate with 2.1-day average completion</p>
            <p>• Team efficiency of 92% indicates strong operational performance across all departments</p>
          </div>
        </div>
      </div>
    );
  };

  const renderTrendDetails = () => {
    const trend = bookingTrends.find(t => t.month === selectedTrendMonth);
    if (!trend) return <div>Trend data not found</div>;

    // Calculate additional metrics
    const currentIndex = bookingTrends.findIndex(t => t.month === selectedTrendMonth);
    const prevTrend = currentIndex > 0 ? bookingTrends[currentIndex - 1] : null;
    const nextTrend = currentIndex < bookingTrends.length - 1 ? bookingTrends[currentIndex + 1] : null;
    
    const bookingGrowth = prevTrend ? ((trend.bookings - prevTrend.bookings) / prevTrend.bookings) * 100 : 0;
    const revenueGrowth = prevTrend ? ((trend.revenue - prevTrend.revenue) / prevTrend.revenue) * 100 : 0;
    const avgBookingValue = trend.bookings > 0 ? trend.revenue / trend.bookings : 0;
    
    // Calculate rank among all months
    const sortedByBookings = [...bookingTrends].sort((a, b) => b.bookings - a.bookings);
    const bookingRank = sortedByBookings.findIndex(t => t.month === selectedTrendMonth) + 1;
    
    const sortedByRevenue = [...bookingTrends].sort((a, b) => b.revenue - a.revenue);
    const revenueRank = sortedByRevenue.findIndex(t => t.month === selectedTrendMonth) + 1;
    
    // Generate detailed booking analysis data
    const weeklyBreakdown = [
      { week: 'Week 1', bookings: Math.floor(trend.bookings * 0.22), revenue: Math.floor(trend.revenue * 0.22) },
      { week: 'Week 2', bookings: Math.floor(trend.bookings * 0.28), revenue: Math.floor(trend.revenue * 0.28) },
      { week: 'Week 3', bookings: Math.floor(trend.bookings * 0.25), revenue: Math.floor(trend.revenue * 0.25) },
      { week: 'Week 4', bookings: Math.floor(trend.bookings * 0.25), revenue: Math.floor(trend.revenue * 0.25) },
    ];
    
    // Customer type breakdown
    const customerTypes = [
      { type: 'New Customers', count: Math.floor(trend.bookings * 0.65), percentage: 65 },
      { type: 'Returning Customers', count: Math.floor(trend.bookings * 0.35), percentage: 35 },
    ];
    
    // Tour category breakdown
    const tourCategories = [
      { category: 'Adventure Tours', bookings: Math.floor(trend.bookings * 0.35), revenue: Math.floor(trend.revenue * 0.35) },
      { category: 'Cultural Tours', bookings: Math.floor(trend.bookings * 0.25), revenue: Math.floor(trend.revenue * 0.25) },
      { category: 'Luxury Tours', bookings: Math.floor(trend.bookings * 0.20), revenue: Math.floor(trend.revenue * 0.30) },
      { category: 'Family Tours', bookings: Math.floor(trend.bookings * 0.20), revenue: Math.floor(trend.revenue * 0.10) },
    ];

    return (
      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Bookings</h3>
            <p className="text-2xl font-bold text-blue-600">{formatNumber(trend.bookings)}</p>
            <p className={`text-sm mt-1 ${bookingGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {prevTrend ? `${bookingGrowth >= 0 ? '+' : ''}${formatPercentage(bookingGrowth)} vs ${prevTrend.month}` : 'No previous data'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Revenue</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(trend.revenue)}</p>
            <p className={`text-sm mt-1 ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {prevTrend ? `${revenueGrowth >= 0 ? '+' : ''}${formatPercentage(revenueGrowth)} vs ${prevTrend.month}` : 'No previous data'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Avg. Value</h3>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(avgBookingValue)}</p>
            <p className="text-sm text-gray-600 mt-1">Per booking</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Performance Rank</h3>
            <p className="text-lg font-bold text-orange-600">#{bookingRank} Bookings</p>
            <p className="text-lg font-bold text-orange-600">#{revenueRank} Revenue</p>
          </div>
        </div>

        {/* Weekly Breakdown */}
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Breakdown for {selectedTrendMonth}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% of Month</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {weeklyBreakdown.map((week) => {
                  const weekAvgValue = week.bookings > 0 ? week.revenue / week.bookings : 0;
                  const bookingPercentage = (week.bookings / trend.bookings) * 100;
                  return (
                    <tr key={week.week} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{week.week}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(week.bookings)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(week.revenue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(weekAvgValue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bookingPercentage.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Customer Type Analysis</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {customerTypes.map((type) => (
                  <div key={type.type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${type.type === 'New Customers' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{type.type}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatNumber(type.count)}</p>
                      <p className="text-xs text-gray-500">{type.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <div className="flex bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-l-full" style={{ width: '65%' }}></div>
                  <div className="bg-green-500 h-2 rounded-r-full" style={{ width: '35%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Tour Category Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tourCategories.map((category) => (
                    <tr key={category.category} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{category.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatNumber(category.bookings)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(category.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Month Comparison */}
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Month Comparison</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {prevTrend && (
                <div className="text-center">
                  <h4 className="font-medium text-gray-900 mb-2">Previous Month ({prevTrend.month})</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Bookings: {formatNumber(prevTrend.bookings)}</p>
                    <p className="text-sm text-gray-600">Revenue: {formatCurrency(prevTrend.revenue)}</p>
                    <p className="text-sm text-gray-600">Avg. Value: {formatCurrency(prevTrend.bookings > 0 ? prevTrend.revenue / prevTrend.bookings : 0)}</p>
                  </div>
                </div>
              )}
              
              <div className="text-center bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Current Month ({selectedTrendMonth})</h4>
                <div className="space-y-2">
                  <p className="text-sm text-blue-800 font-semibold">Bookings: {formatNumber(trend.bookings)}</p>
                  <p className="text-sm text-blue-800 font-semibold">Revenue: {formatCurrency(trend.revenue)}</p>
                  <p className="text-sm text-blue-800 font-semibold">Avg. Value: {formatCurrency(avgBookingValue)}</p>
                </div>
              </div>

              {nextTrend && (
                <div className="text-center">
                  <h4 className="font-medium text-gray-900 mb-2">Next Month ({nextTrend.month})</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Bookings: {formatNumber(nextTrend.bookings)}</p>
                    <p className="text-sm text-gray-600">Revenue: {formatCurrency(nextTrend.revenue)}</p>
                    <p className="text-sm text-gray-600">Avg. Value: {formatCurrency(nextTrend.bookings > 0 ? nextTrend.revenue / nextTrend.bookings : 0)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">Key Insights for {selectedTrendMonth}</h3>
          <div className="space-y-2 text-sm text-yellow-700">
            <p>• This month ranked #{bookingRank} out of {bookingTrends.length} months for total bookings</p>
            <p>• Revenue performance ranked #{revenueRank} out of {bookingTrends.length} months</p>
            <p>• Average booking value was {formatCurrency(avgBookingValue)}, {avgBookingValue > (metrics?.averageBookingValue || 0) ? 'above' : 'below'} the overall average</p>
            {prevTrend && (
              <p>• {bookingGrowth >= 0 ? 'Growth' : 'Decline'} of {Math.abs(bookingGrowth).toFixed(1)}% in bookings compared to {prevTrend.month}</p>
            )}
            <p>• {customerTypes[0].percentage}% of customers were new customers, indicating strong market expansion</p>
            <p>• Adventure Tours were the most popular category with {Math.floor(trend.bookings * 0.35)} bookings</p>
          </div>
        </div>
      </div>
    );
  };

  const renderSegmentDetails = () => {
    const segment = customerSegments.find(s => s.segment === selectedSegment);
    if (!segment) return <div>Segment data not found</div>;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Customers</h3>
            <p className="text-2xl font-bold text-blue-600">{formatNumber(segment.count)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Percentage</h3>
            <p className="text-2xl font-bold text-green-600">{formatPercentage(segment.percentage)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Avg. Spending</h3>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(segment.avgSpending)}</p>
          </div>
        </div>
        <p className="text-gray-700">Detailed {selectedSegment} segment analysis will be implemented here.</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading reports...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Comprehensive insights into your travel business performance
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d' | '1y')}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          <button
            onClick={loadReportData}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportReport}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Last Refreshed */}
      <div className="text-xs text-gray-500">
        Last updated: {lastRefreshed.toLocaleString()}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div 
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleMetricClick('revenue')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics?.totalRevenue || 0)}</p>
              <div className="flex items-center mt-2">
                {(metrics?.monthlyGrowth || 0) >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm ml-1 ${(metrics?.monthlyGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(metrics?.monthlyGrowth || 0) >= 0 ? '+' : ''}{formatPercentage(metrics?.monthlyGrowth || 0)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Bookings Card */}
        <div 
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleMetricClick('bookings')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics?.totalBookings || 0)}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-600 ml-1">
                  {formatNumber((metrics?.totalBookings || 0) / 12)}/month avg
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Customers Card */}
        <div 
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleMetricClick('customers')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics?.totalCustomers || 0)}</p>
              <div className="flex items-center mt-2">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-purple-600 ml-1">
                  {((metrics?.totalCustomers || 0) / (metrics?.totalBookings || 1)).toFixed(1)} customers/booking
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Conversion Rate Card */}
        <div 
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleMetricClick('conversion')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(metrics?.conversionRate || 0)}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-orange-600 ml-1">
                  {formatNumber(metrics?.totalBookings || 0)} of {formatNumber((metrics?.totalBookings || 0) / ((metrics?.conversionRate || 1) / 100))} inquiries
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Average Booking Value */}
        <div 
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleMetricClick('avg-booking')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Booking Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics?.averageBookingValue || 0)}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Customer Satisfaction */}
        <div 
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleMetricClick('satisfaction')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
              <p className="text-2xl font-bold text-gray-900">{(metrics?.customerSatisfaction || 0).toFixed(1)}/5.0</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Pending Inquiries */}
        <div 
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleMetricClick('inquiries')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics?.pendingInquiries || 0)}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Completed Tasks */}
        <div 
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleMetricClick('tasks')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics?.completedTasks || 0)}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Detailed Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trends */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Booking Trends</h3>
            <button 
              onClick={() => setShowDetailedView(showDetailedView === 'booking-trends' ? null : 'booking-trends')}
              className="flex items-center space-x-2 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Eye className="w-4 h-4" />
              {showDetailedView === 'booking-trends' ? 'Hide Details' : 'View Details'}
            </button>
          </div>
          <div className="space-y-4">
            {bookingTrends.map((trend) => (
              <div 
                key={trend.month} 
                className="flex items-center justify-between hover:bg-gray-50 cursor-pointer rounded p-2 transition-colors"
                onClick={() => handleTrendClick(trend.month)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600 w-8">{trend.month}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(trend.bookings / Math.max(...bookingTrends.map(t => t.bookings))) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right flex items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatNumber(trend.bookings)}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(trend.revenue)}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-2" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Popular Destinations</h3>
            <button 
              onClick={() => setShowDetailedView(showDetailedView === 'popular-destinations' ? null : 'popular-destinations')}
              className="flex items-center space-x-2 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Eye className="w-4 h-4" />
              {showDetailedView === 'popular-destinations' ? 'Hide Details' : 'View All'}
            </button>
          </div>
          <div className="space-y-4">
            {popularDestinations.map((destination, index) => (
              <div 
                key={destination.country} 
                className="flex items-center justify-between hover:bg-gray-50 cursor-pointer rounded p-2 transition-colors"
                onClick={() => handleDestinationClick(destination.country)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{destination.country}</p>
                    <p className="text-xs text-gray-500">{destination.bookings} bookings</p>
                  </div>
                </div>
                <div className="text-right flex items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(destination.revenue)}</p>
                    <p className={`text-xs ${destination.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {destination.growth >= 0 ? '+' : ''}{formatPercentage(destination.growth)}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Views */}
      {showDetailedView === 'booking-trends' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Booking Trends Analysis</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Growth Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookingTrends.map((trend, index) => {
                  const avgValue = trend.bookings > 0 ? trend.revenue / trend.bookings : 0;
                  const prevTrend = bookingTrends[index - 1];
                  const growthRate = prevTrend ? ((trend.bookings - prevTrend.bookings) / prevTrend.bookings) * 100 : 0;
                  return (
                    <tr key={trend.month} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {trend.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(trend.bookings)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(trend.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(avgValue)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {index === 0 ? 'N/A' : `${growthRate >= 0 ? '+' : ''}${formatPercentage(growthRate)}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showDetailedView === 'popular-destinations' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Destination Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Growth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market Share
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {popularDestinations.map((destination, index) => {
                  const avgValue = destination.bookings > 0 ? destination.revenue / destination.bookings : 0;
                  const marketShare = ((destination.bookings / (metrics?.totalBookings || 1)) * 100);
                  return (
                    <tr key={destination.country} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {destination.country}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(destination.bookings)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(destination.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(avgValue)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${destination.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {destination.growth >= 0 ? '+' : ''}{formatPercentage(destination.growth)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {marketShare.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Segments Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {customerSegments.map((segment) => (
            <div key={segment.segment} className="text-center">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{segment.segment}</h4>
                <p className="text-2xl font-bold text-blue-600">{formatNumber(segment.count)}</p>
                <p className="text-sm text-gray-600 mt-1">{formatPercentage(segment.percentage)} of customers</p>
                <p className="text-sm text-gray-900 mt-2">Avg. Spending: {formatCurrency(segment.avgSpending)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {getModalTitle()}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;