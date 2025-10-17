import React, { JSX, useState, useEffect } from "react";
import { createTour, updateTour, fetchTourById, type Tour } from "../../services/apiClient";
import { fetchContinents } from "../../../../../src/api/tours";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Save, 
  ArrowLeft,
  FileText,
  Clock,
  DollarSign,
  Camera
} from "lucide-react";

const LINE_OPTIONS = [
  { value: "", label: "Select Line" },
  { value: "RED", label: "Red Line" },
  { value: "ROUTE_A", label: "Route A Preferred" },
  { value: "BLUE", label: "Blue Line" },
  { value: "GREEN", label: "Green Line" },
  { value: "YELLOW", label: "Yellow Line" }
];

interface ExtendedTour extends Tour {
  regularPricePerPerson?: number;
  promoPricePerPerson?: number;
  shortDescription?: string;
  departureDates?: string[];
}

interface TourFormData {
  // Basic Info
  title: string;
  slug: string;
  summary: string;
  shortDescription: string;
  line: string;
  continent: string;
  durationDays: number;
  guaranteedDeparture: boolean;
  bookingPdfUrl: string;

  // Pricing
  regularPricePerPerson: number | "";
  promoPricePerPerson: number | "";
  basePricePerDay: number | "";

  // Travel Details
  travelWindow: { start: string; end: string };
  departureDates: string[];

  // Content
  highlights: string[];
  images: string[];
  
  // Itinerary
  itinerary: { day: number; title: string; description: string }[];
  
  // Stops & Geography
  fullStops: { city: string; country: string; days?: number }[];
  additionalInfo: {
    countriesVisited: string[];
    startingPoint: string;
    endingPoint: string;
    mainCities: Record<string, string[]>;
  };
}

export default function TourForm(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<TourFormData>({
    title: "",
    slug: "",
    summary: "",
    shortDescription: "",
    line: "",
    continent: "",
    durationDays: 7,
    guaranteedDeparture: false,
    bookingPdfUrl: "",
    
    regularPricePerPerson: "",
    promoPricePerPerson: "",
    basePricePerDay: "",
    
    travelWindow: { start: "", end: "" },
    departureDates: [],
    
    highlights: [],
    images: [],
    
    itinerary: [],
    
    fullStops: [],
    additionalInfo: {
      countriesVisited: [],
      startingPoint: "",
      endingPoint: "",
      mainCities: {}
    }
  });

  // Continents for dropdown
  const [continents, setContinents] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Temporary input states

  // Helper function to generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };

  // Load continents
  useEffect(() => {
    const loadContinents = async () => {
      try {
        const continentsList = await fetchContinents();
        setContinents(continentsList);
      } catch (error) {
        console.error("Failed to fetch continents:", error);
      }
    };
    loadContinents();
  }, []);

  // Load existing tour for editing
  useEffect(() => {
    if (!isEdit || !id) return;
    
    const loadTour = async () => {
      try {
        setLoading(true);
        const tour = await fetchTourById(id) as ExtendedTour;
        if (!tour) {
          setError("Tour not found");
          return;
        }
        
        // Convert tour to form data
        setFormData({
          title: tour.title || "",
          slug: tour.slug || "",
          summary: tour.summary || "",
          shortDescription: tour.shortDescription || "",
          line: tour.line || "",
          continent: "",
          durationDays: tour.durationDays || 7,
          guaranteedDeparture: tour.guaranteedDeparture || false,
          bookingPdfUrl: tour.bookingPdfUrl || "",
          
          regularPricePerPerson: tour.regularPricePerPerson || "",
          promoPricePerPerson: tour.promoPricePerPerson || "",
          basePricePerDay: tour.basePricePerDay || "",
          
          travelWindow: tour.travelWindow || { start: "", end: "" },
          departureDates: tour.departureDates || [],
          
          highlights: tour.highlights || [],
          images: tour.images || [],
          
          itinerary: (tour.itinerary || []).map((it, i) => ({
            day: typeof it.day === "number" ? it.day : i + 1,
            title: it.title || "",
            description: it.description || ""
          })),
          
          fullStops: tour.fullStops || [],
          additionalInfo: {
            countriesVisited: tour.additionalInfo?.countriesVisited || [],
            startingPoint: tour.additionalInfo?.startingPoint || "",
            endingPoint: tour.additionalInfo?.endingPoint || "",
            mainCities: tour.additionalInfo?.mainCities || {}
          }
        });
      } catch (err) {
        console.error("Load tour error", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load tour";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    loadTour();
  }, [isEdit, id]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEdit && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isEdit]);

  // Form handlers
  const handleInputChange = <K extends keyof TourFormData>(field: K, value: TourFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value } as unknown as TourFormData));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      // Prepare payload - convert empty strings to undefined/null for numbers
      const payload = {
        ...formData,
        regularPricePerPerson: formData.regularPricePerPerson === "" ? undefined : Number(formData.regularPricePerPerson),
        promoPricePerPerson: formData.promoPricePerPerson === "" ? undefined : Number(formData.promoPricePerPerson),
        basePricePerDay: formData.basePricePerDay === "" ? undefined : Number(formData.basePricePerDay),
        travelWindow: formData.travelWindow.start && formData.travelWindow.end ? formData.travelWindow : undefined,
        additionalInfo: {
          ...formData.additionalInfo,
          continent: formData.continent
        }
      };
      
      if (isEdit && id) {
        await updateTour(id, payload);
      } else {
        await createTour(payload);
      }
      
      navigate("/tours");
    } catch (err) {
      console.error("Save tour error", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to save tour";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/tours")}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all mb-6"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Tours</span>
          </button>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {isEdit ? "Edit Tour" : "Create New Tour"}
            </h1>
            <p className="text-gray-600 text-lg">
              {isEdit ? "Update tour information and details" : "Add a new tour to your collection"}
            </p>
          </div>
        </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-100 p-3 rounded-xl">
              <FileText className="text-blue-600" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
              <p className="text-gray-600">Essential details about your tour</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tour Name *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => {
                  const title = e.target.value;
                  handleInputChange("title", title);
                  // Auto-generate slug if it's empty or matches the previous title's slug
                  if (!formData.slug || formData.slug === generateSlug(formData.title)) {
                    handleInputChange("slug", generateSlug(title));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                placeholder="e.g., Route A Preferred - European Adventure"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                URL Slug *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  placeholder="auto-generated-from-title"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-400 text-sm">.html</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Auto-generated from tour name, but you can customize it</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tour Line
              </label>
              <select
                value={formData.line}
                onChange={(e) => handleInputChange("line", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white"
              >
                {LINE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Assigned Continent *
              </label>
              <select
                required
                value={formData.continent}
                onChange={(e) => handleInputChange("continent", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white"
                disabled={continents.length === 0}
              >
                <option value="">
                  {continents.length === 0 ? "🔄 Loading continents..." : "🌍 Select Continent"}
                </option>
                {continents.map(continent => (
                  <option key={continent} value={continent}>
                    {continent === "Europe" ? "🇪🇺" : continent === "Asia" ? "🌏" : "🌎"} {continent}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Choose the primary continent for this tour</p>
            </div>
            
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📝 Tour Summary
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => handleInputChange("summary", e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm resize-none"
                placeholder="Write a compelling summary that highlights what makes this tour special..."
              />
              <p className="text-xs text-gray-500 mt-1">This appears on tour listings and detail pages</p>
            </div>
            
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                ✏️ Short Description
              </label>
              <textarea
                value={formData.shortDescription}
                onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm resize-none"
                placeholder="Quick description for cards and previews..."
              />
              <p className="text-xs text-gray-500 mt-1">Used for tour cards and search results</p>
            </div>
          </div>
        </div>

        {/* Tour Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-green-100 p-3 rounded-xl">
              <Clock className="text-green-600" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Tour Details</h2>
              <p className="text-gray-600">Configure tour duration and special features</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                🗓️ Duration (days) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.durationDays}
                onChange={(e) => handleInputChange("durationDays", Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-lg font-medium"
                placeholder="7"
              />
              <p className="text-xs text-gray-500 mt-1">How many days does this tour last?</p>
            </div>
            
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                ✅ Special Features
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.guaranteedDeparture}
                    onChange={(e) => handleInputChange("guaranteedDeparture", e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Guaranteed Departure</span>
                    <p className="text-xs text-gray-500">This tour will run regardless of group size</p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking PDF URL
              </label>
              <input
                type="url"
                value={formData.bookingPdfUrl}
                onChange={(e) => handleInputChange("bookingPdfUrl", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/booking.pdf"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-yellow-100 p-3 rounded-xl">
              <DollarSign className="text-yellow-600" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Pricing Information</h2>
              <p className="text-gray-600">Set competitive pricing for your tour</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                💰 Regular Price per Person (PHP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.regularPricePerPerson}
                  onChange={(e) => handleInputChange("regularPricePerPerson", e.target.value ? Number(e.target.value) : "")}
                  className="w-full border border-gray-300 rounded-xl pl-8 pr-4 py-3 text-lg font-medium focus:ring-2 focus:ring-yellow-500 focus:border-transparent shadow-sm"
                  placeholder="250,000.00"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                🏷️ Promo Price per Person (PHP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.promoPricePerPerson}
                  onChange={(e) => handleInputChange("promoPricePerPerson", e.target.value ? Number(e.target.value) : "")}
                  className="w-full border border-gray-300 rounded-xl pl-8 pr-4 py-3 text-lg font-medium focus:ring-2 focus:ring-yellow-500 focus:border-transparent shadow-sm"
                  placeholder="200,000.00"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📅 Base Price per Day (PHP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.basePricePerDay}
                  onChange={(e) => handleInputChange("basePricePerDay", e.target.value ? Number(e.target.value) : "")}
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  placeholder="15,000.00"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Daily rate for pricing calculations</p>
            </div>
          </div>
        </div>

        {/* Travel Dates Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-green-100 p-3 rounded-xl">
              <Clock className="text-green-600" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Departure Dates</h2>
              <p className="text-gray-600">Set multiple departure windows for this tour</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📅 Multiple Departure Windows</h3>
              <p className="text-blue-700 text-sm">
                Add multiple departure date ranges for this tour. Each range represents a separate tour departure that customers can book.
                For example: "Feb 4-18, 2026", "May 27 - Jun 10, 2026", etc.
              </p>
            </div>

            {/* Departure Dates List */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                Departure Date Ranges
              </label>
              
              {formData.departureDates.map((dateRange, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 w-8">#{index + 1}</span>
                  <input
                    type="text"
                    value={dateRange}
                    onChange={(e) => {
                      const newDates = [...formData.departureDates];
                      newDates[index] = e.target.value;
                      handleInputChange("departureDates", newDates);
                    }}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Feb 4-18, 2026 or May 27 - Jun 10, 2026"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newDates = formData.departureDates.filter((_, i) => i !== index);
                      handleInputChange("departureDates", newDates);
                    }}
                    className="text-red-500 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              {/* Add New Departure Date */}
              <button
                type="button"
                onClick={() => {
                  const newDates = [...formData.departureDates, ""];
                  handleInputChange("departureDates", newDates);
                }}
                className="w-full border-2 border-dashed border-green-300 rounded-lg p-4 text-green-600 hover:border-green-400 hover:bg-green-50 transition-all"
              >
                + Add New Departure Date Range
              </button>
              
              {formData.departureDates.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <Clock className="mx-auto mb-2" size={32} />
                  <p>No departure dates set yet. Add your first departure date range above.</p>
                </div>
              )}
            </div>

            {/* Legacy Travel Window (Optional) */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Legacy Travel Window (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.travelWindow.start}
                    onChange={(e) => handleInputChange("travelWindow", { ...formData.travelWindow, start: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.travelWindow.end}
                    onChange={(e) => handleInputChange("travelWindow", { ...formData.travelWindow, end: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This is the old single travel window format. Use departure date ranges above for better flexibility.
              </p>
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Camera className="text-purple-600" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Tour Images</h2>
              <p className="text-gray-600">Add stunning visuals to showcase your tour</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📸 Upload Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-purple-400 hover:bg-purple-50 transition-all duration-200">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setImageFiles(files);
                    // Convert files to URLs for preview and form data
                    const imageUrls = files.map(file => URL.createObjectURL(file));
                    handleInputChange("images", imageUrls);
                  }}
                  className="hidden"
                  id="image-upload"
                />
                <label 
                  htmlFor="image-upload" 
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Camera className="text-gray-400 mb-4" size={56} />
                  <span className="text-xl font-semibold text-gray-700 mb-2">Click to upload images</span>
                  <span className="text-gray-500">or drag and drop your photos here</span>
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                📝 Supported formats: JPG, PNG, GIF • Maximum 10 images • Each image up to 5MB
              </p>
            </div>

            {/* Image Preview */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Tour image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = formData.images.filter((_, i) => i !== index);
                        const newFiles = imageFiles.filter((_, i) => i !== index);
                        handleInputChange("images", newImages);
                        setImageFiles(newFiles);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Fallback URL input for existing images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or add image URLs (one per line)
              </label>
              <textarea
                rows={3}
                value={formData.images.join('\n')}
                onChange={(e) => {
                  const urls = e.target.value.split('\n').filter(url => url.trim() !== '');
                  handleInputChange("images", urls);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              />
            </div>
          </div>
        </div>

        {/* Continue with more sections... */}
        
        {/* Submit Buttons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col sm:flex-row gap-6 justify-between items-center">
            <div>
              <p className="text-gray-700 font-medium text-lg">
                {isEdit ? "Save your changes to update the tour" : "Create your new tour and make it available to customers"}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {isEdit ? "All changes will be saved immediately" : "Your tour will be visible to customers once created"}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/tours")}
                className="px-8 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-3 px-10 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg font-semibold text-lg"
              >
                <Save size={22} />
                {saving ? "Saving..." : isEdit ? "Update Tour" : "Create Tour"}
              </button>
            </div>
          </div>
        </div>
      </form>
      </div>
    </div>
  );
}