import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  MessageSquare,
  ClipboardList,
  Plane,
  Star,
  Plus,
  Edit
} from 'lucide-react';
import { customerServiceRepo } from '../services/customerServiceRepo';
import {
  Customer,
  CustomerInquiry,
  CSRTask,
  CustomerTourHistory,
  InquiryResponse,
  CONTACT_METHOD_DISPLAY,
  InquiryStatus,
  TaskStatus,
  INQUIRY_STATUS_DISPLAY,
  TASK_STATUS_DISPLAY
} from '../types/customerService';

interface CustomerProfileProps {
  customerId: string;
  onBack: () => void;
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({ customerId, onBack }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [tasks, setTasks] = useState<CSRTask[]>([]);
  const [tourHistory, setTourHistory] = useState<CustomerTourHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'tours' | 'inquiries' | 'tasks'>('overview');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadCustomerData = () => {
      const customerData = customerServiceRepo.getCustomerById(customerId);
      if (customerData) {
        setCustomer(customerData);
        setInquiries(customerServiceRepo.getAllInquiries().filter((i: CustomerInquiry) => i.customerId === customerId));
        setTasks(customerServiceRepo.getAllTasks().filter((t: CSRTask) => t.customerId === customerId));
        setTourHistory(customerServiceRepo.getCustomerTourHistory(customerId));
      }
    };
    
    loadCustomerData();
  }, [customerId]);

  if (!customer) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Customer not found</h1>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string, type: 'tour' | 'inquiry' | 'task') => {
    if (type === 'tour') {
      switch (status) {
        case 'booked': return 'bg-yellow-100 text-yellow-800';
        case 'confirmed': return 'bg-blue-100 text-blue-800';
        case 'in_progress': return 'bg-purple-100 text-purple-800';
        case 'completed': return 'bg-green-100 text-green-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else if (type === 'inquiry') {
      switch (status) {
        case InquiryStatus.OPEN: return 'bg-red-100 text-red-800';
        case InquiryStatus.IN_PROGRESS: return 'bg-yellow-100 text-yellow-800';
        case InquiryStatus.RESOLVED: return 'bg-green-100 text-green-800';
        case InquiryStatus.CLOSED: return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else {
      switch (status) {
        case TaskStatus.PENDING: return 'bg-red-100 text-red-800';
        case TaskStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
        case TaskStatus.COMPLETED: return 'bg-green-100 text-green-800';
        case TaskStatus.CANCELLED: return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Customer Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-blue-600 hover:text-blue-900"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium text-gray-900">{customer.fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{customer.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Nationality</p>
                <p className="font-medium text-gray-900">{customer.nationality}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium text-gray-900">{new Date(customer.dateOfBirth).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Preferences</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Preferred Contact Method</p>
              <p className="font-medium text-gray-900">{CONTACT_METHOD_DISPLAY[customer.contact.preferredContactMethod]}</p>
            </div>
            {customer.contact.whatsappNumber && (
              <div>
                <p className="text-sm text-gray-500">WhatsApp</p>
                <p className="font-medium text-gray-900">{customer.contact.whatsappNumber}</p>
              </div>
            )}
            {customer.contact.emergencyContact && (
              <div>
                <p className="text-sm text-gray-500">Emergency Contact</p>
                <p className="font-medium text-gray-900">
                  {customer.contact.emergencyContact.name} ({customer.contact.emergencyContact.relationship})
                </p>
                <p className="text-sm text-gray-600">{customer.contact.emergencyContact.phone}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <Plane className="w-6 h-6 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Total Bookings</p>
              <p className="text-xl font-bold text-blue-900">{customer.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center">
            <CreditCard className="w-6 h-6 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Total Spent</p>
              <p className="text-xl font-bold text-green-900">${customer.totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-600">Inquiries</p>
              <p className="text-xl font-bold text-purple-900">{inquiries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center">
            <ClipboardList className="w-6 h-6 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-600">Active Tasks</p>
              <p className="text-xl font-bold text-orange-900">
                {tasks.filter(t => t.status !== TaskStatus.COMPLETED).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Travel Preferences */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Travel Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">Preferred Tour Types</p>
            <div className="flex flex-wrap gap-2">
              {customer.preferences.tourTypes.map((type: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {type}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Budget Range</p>
            <p className="font-medium text-gray-900">
              ${customer.preferences.budgetRange.min.toLocaleString()} - ${customer.preferences.budgetRange.max.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Typical Group Size</p>
            <p className="font-medium text-gray-900">{customer.preferences.groupSize} people</p>
          </div>
          {customer.preferences.dietary.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Dietary Requirements</p>
              <div className="flex flex-wrap gap-2">
                {customer.preferences.dietary.map((diet: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {diet}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {customer.notes && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Notes</h3>
          <p className="text-gray-700">{customer.notes}</p>
        </div>
      )}
    </div>
  );

  const renderTours = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Tour History</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          New Booking
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {tourHistory.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {tourHistory.map((tour) => (
              <div key={tour.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{tour.tourName}</h4>
                    <p className="text-sm text-gray-500">{tour.tourDestination}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tour.status, 'tour')}`}>
                    {tour.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Booking Date</p>
                    <p className="font-medium text-gray-900">{new Date(tour.bookingDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Travel Date</p>
                    <p className="font-medium text-gray-900">{new Date(tour.travelDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Guests</p>
                    <p className="font-medium text-gray-900">{tour.guests}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-medium text-gray-900">${tour.amount.toLocaleString()}</p>
                  </div>
                </div>

                {tour.specialRequests && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Special Requests</p>
                    <p className="text-gray-700">{tour.specialRequests}</p>
                  </div>
                )}

                {tour.feedback && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < tour.feedback!.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(tour.feedback.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{tour.feedback.comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tour history found</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderInquiries = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Customer Inquiries</h3>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
          <Plus className="w-4 h-4" />
          New Inquiry
        </button>
      </div>

      <div className="space-y-4">
        {inquiries.length > 0 ? (
          inquiries.map((inquiry) => (
            <div key={inquiry.id} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">{inquiry.subject}</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(inquiry.status, 'inquiry')}`}>
                  {INQUIRY_STATUS_DISPLAY[inquiry.status]}
                </span>
              </div>
              
              <p className="text-gray-700 mb-4">{inquiry.message}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span>Category: {inquiry.category.replace('_', ' ').toUpperCase()}</span>
                  <span>Priority: {inquiry.priority.toUpperCase()}</span>
                  <span>Via: {inquiry.contactMethod.replace('_', ' ')}</span>
                </div>
                <span>{new Date(inquiry.createdAt).toLocaleDateString()}</span>
              </div>

              {inquiry.responses.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">{inquiry.responses.length} responses</p>
                  <div className="space-y-2">
                    {inquiry.responses.slice(-2).map((response: InquiryResponse) => (
                      <div key={response.id} className={`p-3 rounded-lg ${response.isFromCustomer ? 'bg-blue-50' : 'bg-gray-50'}`}>
                        <p className="text-sm text-gray-700">{response.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {response.isFromCustomer ? 'Customer' : response.csrName} - {new Date(response.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No inquiries found</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Customer Tasks</h3>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700">
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      <div className="space-y-4">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">{task.title}</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status, 'task')}`}>
                  {TASK_STATUS_DISPLAY[task.status]}
                </span>
              </div>
              
              <p className="text-gray-700 mb-4">{task.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium text-gray-900">{task.category.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Priority</p>
                  <p className="font-medium text-gray-900">{task.priority}</p>
                </div>
                <div>
                  <p className="text-gray-500">Due Date</p>
                  <p className="font-medium text-gray-900">{new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Assigned CSR</p>
                  <p className="font-medium text-gray-900">{task.assignedCSR}</p>
                </div>
              </div>

              {task.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-gray-700">{task.notes}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{customer.fullName}</h1>
          <p className="text-gray-600">Customer Profile</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {customer.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: User },
            { key: 'tours', label: 'Tour History', icon: Plane },
            { key: 'inquiries', label: 'Inquiries', icon: MessageSquare },
            { key: 'tasks', label: 'Tasks', icon: ClipboardList }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'overview' | 'tours' | 'inquiries' | 'tasks')}
              className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'tours' && renderTours()}
      {activeTab === 'inquiries' && renderInquiries()}
      {activeTab === 'tasks' && renderTasks()}
    </div>
  );
};

export default CustomerProfile;