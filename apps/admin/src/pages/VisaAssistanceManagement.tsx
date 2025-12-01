import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Phone, 
  Mail, 
  Globe,
  Calendar,
  Filter,
  Search,
  Plus,
  X,
  Save
} from 'lucide-react';

interface VisaApplication {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  nationality: string;
  destinationCountry: string;
  visaType: string;
  urgency: 'standard' | 'rush' | 'emergency';
  status: 'pending' | 'under_review' | 'documents_requested' | 'approved' | 'rejected' | 'completed';
  applicationDate: string;
  submittedDocuments: {
    passport: string;
    photo: string;
    bankStatement: string;
    employmentCertificate: string;
    itr: string;
  };
  additionalServices: string[];
  estimatedCost: number;
  notes: string;
  assignedTo?: string;
  tourReference?: string;
}

const mockApplications: VisaApplication[] = [
  {
    id: 'VA-2024-001',
    customerName: 'Juan Dela Cruz',
    customerEmail: 'juan.delacruz@email.com',
    customerPhone: '+63 912 345 6789',
    nationality: 'Filipino',
    destinationCountry: 'France',
    visaType: 'tourist',
    urgency: 'standard',
    status: 'under_review',
    applicationDate: '2024-11-20',
    submittedDocuments: {
      passport: 'passport_juan_001.pdf',
      photo: 'photo_juan_001.jpg',
      bankStatement: 'bank_juan_001.pdf',
      employmentCertificate: 'employment_juan_001.pdf',
      itr: 'itr_juan_001.pdf'
    },
    additionalServices: ['document-review', 'appointment-booking'],
    estimatedCost: 8500,
    notes: 'Customer traveling for European tour package',
    assignedTo: 'Maria Santos',
    tourReference: 'TR-2024-EU-045'
  },
  {
    id: 'VA-2024-002',
    customerName: 'Maria Rodriguez',
    customerEmail: 'maria.r@email.com',
    customerPhone: '+63 917 555 8888',
    nationality: 'Filipino',
    destinationCountry: 'USA',
    visaType: 'tourist',
    urgency: 'rush',
    status: 'documents_requested',
    applicationDate: '2024-11-25',
    submittedDocuments: {
      passport: 'passport_maria_002.pdf',
      photo: 'photo_maria_002.jpg',
      bankStatement: 'bank_maria_002.pdf',
      employmentCertificate: '',
      itr: ''
    },
    additionalServices: ['document-review', 'form-assistance', 'interview-prep'],
    estimatedCost: 15000,
    notes: 'Missing employment certificate and ITR',
    assignedTo: 'John Reyes'
  }
];

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  under_review: { color: 'bg-blue-100 text-blue-800', label: 'Under Review' },
  documents_requested: { color: 'bg-orange-100 text-orange-800', label: 'Documents Requested' },
  approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
  rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
  completed: { color: 'bg-gray-100 text-gray-800', label: 'Completed' }
};

const urgencyConfig = {
  standard: { color: 'bg-gray-100 text-gray-800', label: 'Standard', fee: 0 },
  rush: { color: 'bg-yellow-100 text-yellow-800', label: 'Rush', fee: 3000 },
  emergency: { color: 'bg-red-100 text-red-800', label: 'Emergency', fee: 5000 }
};

export default function VisaAssistanceManagement() {
  const [applications, setApplications] = useState<VisaApplication[]>(mockApplications);
  const [filteredApplications, setFilteredApplications] = useState<VisaApplication[]>(mockApplications);
  const [selectedApplication, setSelectedApplication] = useState<VisaApplication | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewApplicationModalOpen, setIsNewApplicationModalOpen] = useState(false);
  const [newApplicationForm, setNewApplicationForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    nationality: 'Filipino',
    destinationCountry: '',
    visaType: 'Tourist',
    urgency: 'standard' as 'standard' | 'rush' | 'emergency',
    additionalServices: [] as string[],
    tourReference: '',
    notes: ''
  });

  useEffect(() => {
    let filtered = applications;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.destinationCountry.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
  }, [applications, filterStatus, searchTerm]);

  const updateApplicationStatus = (id: string, newStatus: VisaApplication['status']) => {
    setApplications(prev => 
      prev.map(app => app.id === id ? { ...app, status: newStatus } : app)
    );
  };

  const handleCreateNewApplication = () => {
    // Generate new application ID
    const newId = `VA-${new Date().getFullYear()}-${String(applications.length + 1).padStart(3, '0')}`;
    
    const newApplication: VisaApplication = {
      id: newId,
      ...newApplicationForm,
      status: 'pending',
      applicationDate: new Date().toISOString().split('T')[0],
      submittedDocuments: {
        passport: '',
        photo: '',
        bankStatement: '',
        employmentCertificate: '',
        itr: ''
      },
      estimatedCost: calculateEstimatedCost(newApplicationForm.destinationCountry, newApplicationForm.visaType, newApplicationForm.urgency),
      assignedTo: 'Visa Team'
    };
    
    setApplications(prev => [newApplication, ...prev]);
    setIsNewApplicationModalOpen(false);
    resetNewApplicationForm();
  };

  const calculateEstimatedCost = (country: string, visaType: string, urgency: string): number => {
    let baseCost = 8500; // Base processing fee
    
    // Country multiplier
    const countryMultipliers: Record<string, number> = {
      'USA': 1.8, 'Canada': 1.6, 'UK': 1.5, 'Australia': 1.4,
      'Germany': 1.3, 'France': 1.3, 'Italy': 1.2, 'Spain': 1.2,
      'Japan': 1.4, 'South Korea': 1.2
    };
    baseCost *= countryMultipliers[country] || 1.0;
    
    // Visa type multiplier
    const visaMultipliers: Record<string, number> = {
      'Tourist': 1.0, 'Business': 1.3, 'Student': 1.5, 'Work': 2.0, 'Transit': 0.6
    };
    baseCost *= visaMultipliers[visaType] || 1.0;
    
    // Urgency multiplier
    const urgencyMultipliers: Record<string, number> = {
      'standard': 1.0, 'rush': 1.5, 'emergency': 2.0
    };
    baseCost *= urgencyMultipliers[urgency] || 1.0;
    
    return Math.round(baseCost);
  };

  const resetNewApplicationForm = () => {
    setNewApplicationForm({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      nationality: 'Filipino',
      destinationCountry: '',
      visaType: 'Tourist',
      urgency: 'standard',
      additionalServices: [],
      tourReference: '',
      notes: ''
    });
  };

  const downloadDocument = (filename: string) => {
    // In real implementation, this would download the actual file
    console.log('Downloading document:', filename);
    alert(`Downloading ${filename}`);
  };

  const handleViewDetails = (application: VisaApplication) => {
    setSelectedApplication(application);
    setShowDetails(true);
  };

  const getStatusIcon = (status: VisaApplication['status']) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'under_review':
        return <Eye size={16} className="text-blue-600" />;
      case 'documents_requested':
        return <AlertTriangle size={16} className="text-orange-600" />;
      case 'approved':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'rejected':
        return <AlertTriangle size={16} className="text-red-600" />;
      case 'completed':
        return <CheckCircle size={16} className="text-gray-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Visa Assistance Management</h1>
            <p className="text-gray-600 mt-2">Manage visa applications and customer assistance requests</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsNewApplicationModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              New Application
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Under Review</p>
              <p className="text-2xl font-bold text-blue-600">
                {applications.filter(app => app.status === 'under_review').length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Eye className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {applications.filter(app => app.status === 'approved').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Documents</p>
              <p className="text-2xl font-bold text-orange-600">
                {applications.filter(app => app.status === 'documents_requested').length}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <AlertTriangle className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 flex-1">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, ID, or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="documents_requested">Documents Requested</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Application</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Customer</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Destination</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Urgency</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Cost</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{application.id}</p>
                      <p className="text-sm text-gray-600">{application.applicationDate}</p>
                      {application.tourReference && (
                        <p className="text-xs text-blue-600">Tour: {application.tourReference}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 rounded-full p-2">
                        <User size={16} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{application.customerName}</p>
                        <p className="text-sm text-gray-600">{application.customerEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{application.destinationCountry}</p>
                        <p className="text-sm text-gray-600 capitalize">{application.visaType} visa</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${urgencyConfig[application.urgency].color}`}>
                      {urgencyConfig[application.urgency].label}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(application.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[application.status].color}`}>
                        {statusConfig[application.status].label}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-gray-900">₱{application.estimatedCost.toLocaleString()}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(application)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <select
                        value={application.status}
                        onChange={(e) => updateApplicationStatus(application.id, e.target.value as VisaApplication['status'])}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="pending">Pending</option>
                        <option value="under_review">Under Review</option>
                        <option value="documents_requested">Documents Requested</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Details Modal */}
      {showDetails && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Visa Application Details</h2>
                  <p className="text-gray-600">{selectedApplication.id}</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User size={16} className="text-gray-400" />
                      <span className="font-medium">{selectedApplication.customerName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-gray-400" />
                      <span>{selectedApplication.customerEmail}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-gray-400" />
                      <span>{selectedApplication.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe size={16} className="text-gray-400" />
                      <span>Nationality: {selectedApplication.nationality}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-gray-400" />
                      <span>Applied: {selectedApplication.applicationDate}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe size={16} className="text-gray-400" />
                      <span>Destination: {selectedApplication.destinationCountry}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Visa Type:</span>
                      <span className="ml-2 capitalize font-medium">{selectedApplication.visaType}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Urgency:</span>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${urgencyConfig[selectedApplication.urgency].color}`}>
                        {urgencyConfig[selectedApplication.urgency].label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Submitted Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedApplication.submittedDocuments).map(([key, filename]) => (
                    <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          {filename ? (
                            <p className="text-sm text-gray-600">{filename}</p>
                          ) : (
                            <p className="text-sm text-red-600">Not submitted</p>
                          )}
                        </div>
                      </div>
                      {filename && (
                        <button
                          onClick={() => downloadDocument(filename)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Services */}
              {selectedApplication.additionalServices.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.additionalServices.map(service => (
                      <span key={service} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {service.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cost Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Base Processing Fee:</span>
                      <span>₱{(selectedApplication.estimatedCost - urgencyConfig[selectedApplication.urgency].fee).toLocaleString()}</span>
                    </div>
                    {urgencyConfig[selectedApplication.urgency].fee > 0 && (
                      <div className="flex justify-between">
                        <span>Urgency Fee ({urgencyConfig[selectedApplication.urgency].label}):</span>
                        <span>₱{urgencyConfig[selectedApplication.urgency].fee.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total Estimated Cost:</span>
                      <span>₱{selectedApplication.estimatedCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedApplication.notes || 'No notes added yet.'}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Application Modal */}
      {isNewApplicationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">New Visa Application</h2>
                <button
                  onClick={() => {
                    setIsNewApplicationModalOpen(false);
                    resetNewApplicationForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateNewApplication();
              }} className="space-y-6">
                {/* Customer Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={20} />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newApplicationForm.customerName}
                        onChange={(e) => setNewApplicationForm(prev => ({ ...prev, customerName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={newApplicationForm.customerEmail}
                        onChange={(e) => setNewApplicationForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={newApplicationForm.customerPhone}
                        onChange={(e) => setNewApplicationForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+63 912 345 6789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nationality *
                      </label>
                      <select
                        value={newApplicationForm.nationality}
                        onChange={(e) => setNewApplicationForm(prev => ({ ...prev, nationality: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Filipino">Filipino</option>
                        <option value="American">American</option>
                        <option value="Canadian">Canadian</option>
                        <option value="Australian">Australian</option>
                        <option value="British">British</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Visa Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe size={20} />
                    Visa Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination Country *
                      </label>
                      <select
                        required
                        value={newApplicationForm.destinationCountry}
                        onChange={(e) => setNewApplicationForm(prev => ({ ...prev, destinationCountry: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select destination country</option>
                        <option value="USA">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Italy">Italy</option>
                        <option value="Spain">Spain</option>
                        <option value="Japan">Japan</option>
                        <option value="South Korea">South Korea</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Thailand">Thailand</option>
                        <option value="Malaysia">Malaysia</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Visa Type *
                      </label>
                      <select
                        value={newApplicationForm.visaType}
                        onChange={(e) => setNewApplicationForm(prev => ({ ...prev, visaType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Tourist">Tourist/Visitor</option>
                        <option value="Business">Business</option>
                        <option value="Student">Student</option>
                        <option value="Work">Work/Employment</option>
                        <option value="Transit">Transit</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Processing Urgency *
                      </label>
                      <select
                        value={newApplicationForm.urgency}
                        onChange={(e) => setNewApplicationForm(prev => ({ ...prev, urgency: e.target.value as 'standard' | 'rush' | 'emergency' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="standard">Standard (10-15 business days)</option>
                        <option value="rush">Rush (5-7 business days)</option>
                        <option value="emergency">Emergency (1-3 business days)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tour Reference (Optional)
                      </label>
                      <input
                        type="text"
                        value={newApplicationForm.tourReference}
                        onChange={(e) => setNewApplicationForm(prev => ({ ...prev, tourReference: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Tour booking reference"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Services */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Additional Services (Optional)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      'Document Translation',
                      'Passport Photo Service', 
                      'Embassy Appointment Booking',
                      'Travel Insurance',
                      'Hotel Booking Assistance',
                      'Flight Booking Assistance'
                    ].map((service) => (
                      <label key={service} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newApplicationForm.additionalServices.includes(service)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewApplicationForm(prev => ({
                                ...prev,
                                additionalServices: [...prev.additionalServices, service]
                              }));
                            } else {
                              setNewApplicationForm(prev => ({
                                ...prev,
                                additionalServices: prev.additionalServices.filter(s => s !== service)
                              }));
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={newApplicationForm.notes}
                    onChange={(e) => setNewApplicationForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any special requirements or additional information..."
                  />
                </div>

                {/* Estimated Cost Display */}
                {newApplicationForm.destinationCountry && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Estimated Processing Cost</h4>
                    <p className="text-2xl font-bold text-yellow-900">
                      ₱{calculateEstimatedCost(newApplicationForm.destinationCountry, newApplicationForm.visaType, newApplicationForm.urgency).toLocaleString()}
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      * Final cost may vary based on embassy fees and additional requirements
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewApplicationModalOpen(false);
                      resetNewApplicationForm();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Save size={16} />
                    Create Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}