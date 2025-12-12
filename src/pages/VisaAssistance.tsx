import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Globe, Phone, Mail, Clock } from 'lucide-react';

interface VisaAssistanceProps {
  tourCountries?: string[];
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export default function VisaAssistance() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as VisaAssistanceProps | null;

  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [visaType, setVisaType] = useState<string>('tourist');
  const [customerInfo, setCustomerInfo] = useState({
    name: state?.customerName || '',
    email: state?.customerEmail || '',
    phone: state?.customerPhone || '',
    nationality: 'Filipino',
  });
  const [documents, setDocuments] = useState({
    passport: null as File | null,
    photo: null as File | null,
    bankStatement: null as File | null,
    employmentCertificate: null as File | null,
    itr: null as File | null,
  });
  const [urgency, setUrgency] = useState<string>('standard');
  const [additionalServices, setAdditionalServices] = useState<string[]>([]);

  const tourCountries = state?.tourCountries || ['France', 'Switzerland', 'Italy'];

  // Visa requirements information
  // const visaRequirements = {
  //   'Europe': {
  //     type: 'Schengen Visa',
  //     processingTime: '10-15 business days',
  //     validity: '90 days within 180 days',
  //     cost: 'PHP 4,500 - PHP 8,000',
  //   },
  //   'USA': {
  //     type: 'B1/B2 Tourist Visa',
  //     processingTime: '3-5 weeks',
  //     validity: '10 years (multiple entry)',
  //     cost: 'PHP 8,000 - PHP 15,000',
  //   }
  // };

  const services = [
    { id: 'document-review', name: 'Document Review & Checklist', price: 'PHP 1,500' },
    { id: 'appointment-booking', name: 'Embassy Appointment Booking', price: 'PHP 2,000' },
    { id: 'form-assistance', name: 'Visa Form Completion', price: 'PHP 2,500' },
    { id: 'interview-prep', name: 'Interview Preparation', price: 'PHP 3,000' },
    { id: 'expedited', name: 'Expedited Processing', price: 'PHP 5,000' },
  ];

  const handleFileUpload = (type: keyof typeof documents, file: File) => {
    setDocuments(prev => ({ ...prev, [type]: file }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setAdditionalServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmitApplication = async () => {
    // Here you would submit the visa assistance application
    console.log('Visa assistance application:', {
      customerInfo,
      selectedCountry,
      visaType,
      documents,
      urgency,
      additionalServices
    });
    
    // For now, show success and navigate back
    alert('Visa assistance application submitted! We will contact you within 24 hours.');
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all mb-6"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Booking</span>
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Globe className="text-blue-600" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Visa Assistance</h1>
                <p className="text-gray-600">Let us help you secure your travel visa</p>
              </div>
            </div>

            {state?.tourCountries && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  <strong>For your tour to:</strong> {tourCountries.join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Visa Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Visa Requirements</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Europe (Schengen)</h3>
              <div className="space-y-2 text-sm text-gray-900">
                <p className="text-gray-900"><strong>Processing Time:</strong> 10-15 business days</p>
                <p className="text-gray-900"><strong>Validity:</strong> 90 days within 180 days</p>
                <p className="text-gray-900"><strong>Cost:</strong> PHP 4,500 - PHP 8,000</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">USA</h3>
              <div className="space-y-2 text-sm text-gray-900">
                <p className="text-gray-900"><strong>Processing Time:</strong> 3-5 weeks</p>
                <p className="text-gray-900"><strong>Validity:</strong> 10 years (multiple entry)</p>
                <p className="text-gray-900"><strong>Cost:</strong> PHP 8,000 - PHP 15,000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Visa Assistance Application</h2>

          {/* Customer Information */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              />
              <select
                value={customerInfo.nationality}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, nationality: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="Filipino">Filipino</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Destination Country */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Destination Country</h3>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="">Select destination country</option>
              {tourCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* Visa Type */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Visa Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-gray-900">
                <input
                  type="radio"
                  name="visaType"
                  value="tourist"
                  checked={visaType === 'tourist'}
                  onChange={(e) => setVisaType(e.target.value)}
                  className="text-blue-600"
                />
                <span>Tourist Visa</span>
              </label>
              <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-gray-900">
                <input
                  type="radio"
                  name="visaType"
                  value="business"
                  checked={visaType === 'business'}
                  onChange={(e) => setVisaType(e.target.value)}
                  className="text-blue-600"
                />
                <span>Business Visa</span>
              </label>
              <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-gray-900">
                <input
                  type="radio"
                  name="visaType"
                  value="transit"
                  checked={visaType === 'transit'}
                  onChange={(e) => setVisaType(e.target.value)}
                  className="text-blue-600"
                />
                <span>Transit Visa</span>
              </label>
            </div>
          </div>

          {/* Document Upload */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Required Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries({
                passport: 'Passport Copy',
                photo: 'Passport Photo',
                bankStatement: 'Bank Statement',
                employmentCertificate: 'Employment Certificate',
                itr: 'Income Tax Return (ITR)'
              }).map(([key, label]) => (
                <div key={key} className="border border-gray-300 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label} *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(key as keyof typeof documents, file);
                    }}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {documents[key as keyof typeof documents] && (
                    <div className="flex items-center gap-2 mt-2 text-green-600">
                      <CheckCircle size={16} />
                      <span className="text-sm">File uploaded</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Processing Urgency */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Processing Urgency</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-gray-900">
                <input
                  type="radio"
                  name="urgency"
                  value="standard"
                  checked={urgency === 'standard'}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="text-blue-600"
                />
                <div>
                  <span className="font-medium">Standard</span>
                  <p className="text-sm text-gray-600">10-15 business days</p>
                </div>
              </label>
              <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-gray-900">
                <input
                  type="radio"
                  name="urgency"
                  value="rush"
                  checked={urgency === 'rush'}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="text-blue-600"
                />
                <div>
                  <span className="font-medium">Rush</span>
                  <p className="text-sm text-gray-600">5-7 business days (+PHP 3,000)</p>
                </div>
              </label>
              <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-gray-900">
                <input
                  type="radio"
                  name="urgency"
                  value="emergency"
                  checked={urgency === 'emergency'}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="text-blue-600"
                />
                <div>
                  <span className="font-medium">Emergency</span>
                  <p className="text-sm text-gray-600">3-5 business days (+PHP 5,000)</p>
                </div>
              </label>
            </div>
          </div>

          {/* Additional Services */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Additional Services</h3>
            <div className="space-y-2">
              {services.map(service => (
                <label key={service.id} className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-gray-900">
                  <input
                    type="checkbox"
                    checked={additionalServices.includes(service.id)}
                    onChange={() => handleServiceToggle(service.id)}
                    className="text-blue-600 rounded"
                  />
                  <div className="flex-1">
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <span className="text-blue-600 font-semibold">{service.price}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <Phone className="text-blue-600" size={24} />
              <div>
                <p className="font-semibold text-gray-900">Call Us</p>
                <p className="text-gray-600">+63 123 456 7890</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-blue-600" size={24} />
              <div>
                <p className="font-semibold text-gray-900">Email Us</p>
                <p className="text-gray-600">visa@discovergroup.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="text-blue-600" size={24} />
              <div>
                <p className="font-semibold text-gray-900">Office Hours</p>
                <p className="text-gray-600">Mon-Fri 9AM-6PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitApplication}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
}