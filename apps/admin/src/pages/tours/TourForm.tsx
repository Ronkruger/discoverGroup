
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
import { createClient } from '@supabase/supabase-js';

// --- Supabase Upload Helper ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
console.log('supabaseUrl:', supabaseUrl);
console.log('supabaseAnonKey:', supabaseAnonKey);
const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function uploadImageToSupabase(
  file: File,
  bucket: string = 'tour-images',
  tourId?: string,
  label?: string
): Promise<string> {
  // Accept tourId and label for foldered storage
  // Usage: uploadImageToSupabase(file, 'tour-images', tourId, label)
  const filePath = tourId && label
    ? `${tourId}/${label}-${Date.now()}-${file.name}`
    : `${Date.now()}-${file.name}`;
  console.log('[Supabase Upload] Attempting upload:', {
    file,
    fileType: file?.type,
    fileSize: file?.size,
    bucket,
    filePath,
    policyHint: 'Ensure your Supabase storage policy allows INSERT for public/anons.'
  });
  const response = await supabase.storage.from(bucket).upload(filePath, file);
  console.log('[Supabase Upload] Raw response:', response);
  const { error, data } = response;
  if (error) {
    console.error('[Supabase Upload] Error:', error.message, error);
    alert('Supabase upload failed: ' + error.message);
    return '';
  }
  // Get public URL
  const { publicUrl } = supabase.storage.from(bucket).getPublicUrl(filePath).data;
  console.log('[Supabase Upload] Success. Public URL:', publicUrl, 'Data:', data);
  return publicUrl;
}

// Simulate backend API for image record creation
async function createImageRecord(label: 'main' | 'gallery'): Promise<{ id: string; label: string; url?: string }> {
  // Replace with real API call if available
  return { id: `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, label };
}

const LINE_OPTIONS = [
  { value: "", label: "Select Line" },
  { value: "ROUTE_A", label: "Route A Preferred" },
    { value: "ROUTE_B", label: "Route B Deluxe" },
    { value: "ROUTE_C", label: "Route C Preferred" },
    { value: "ROUTE_D", label: "Route D Easy" },
];

interface ExtendedTour extends Tour {
  title: string;
  slug: string;
  summary: string;
  shortDescription: string;
  line: string;
  continent: string;
  durationDays: number;
  guaranteedDeparture: boolean;
  bookingPdfUrl: string;
  regularPricePerPerson: number;
  promoPricePerPerson: number;
  basePricePerDay: number;
  isSaleEnabled: boolean;
  saleEndDate: string;
  travelWindow: { start: string; end: string };
  departureDates: { start: string; end: string }[];
  highlights: string[];
  mainImage: string;
  galleryImages: string[];
  relatedImages: string[];
  itinerary: { day: number; title: string; description: string }[];
  fullStops: { city: string; country: string; days?: number }[];
  additionalInfo: {
    countriesVisited: string[];
    startingPoint: string;
    endingPoint: string;
    mainCities: Record<string, string[]>;
    countries: CountryEntry[];
  };

}


interface CountryEntry {
  name: string;
  image?: string; // a single image URL for the country
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
  // NEW: sale toggle + end date
  isSaleEnabled?: boolean;
  saleEndDate?: string | "";

  // Travel Details
  travelWindow: { start: string; end: string };
  departureDates: { start: string; end: string }[];

  // Content
  highlights: string[];
  mainImage: string;
  galleryImages: string[];
  relatedImages: string[];

  // Itinerary
  itinerary: { day: number; title: string; description: string }[];

  // Stops & Geography
  fullStops: { city: string; country: string; days?: number }[];
  additionalInfo: {
    countriesVisited: string[];
    startingPoint: string;
    endingPoint: string;
    mainCities: Record<string, string[]>;
    // New: countries with images
    countries?: CountryEntry[];
  };
}

export default function TourForm(): JSX.Element {
  // Departure Date Range Handlers
  function addDepartureDateRange() {
    setFormData((prev) => ({
      ...prev,
      departureDates: [...prev.departureDates, { start: '', end: '' }],
    }));
  }

  function updateDepartureDateRange(index: number, field: 'start' | 'end', value: string) {
    setFormData((prev) => {
      const updated = [...prev.departureDates];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, departureDates: updated };
    });
  }

  function removeDepartureDateRange(index: number) {
    setFormData((prev) => {
      const updated = [...prev.departureDates];
      updated.splice(index, 1);
      return { ...prev, departureDates: updated };
    });
  }

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
    isSaleEnabled: false,
    saleEndDate: "",
    travelWindow: { start: "", end: "" },
    departureDates: [],
    highlights: [],
    mainImage: "",
    galleryImages: [],
    relatedImages: [],
    itinerary: [],
    fullStops: [],
    additionalInfo: {
      countriesVisited: [],
      startingPoint: "",
      endingPoint: "",
      mainCities: {},
      countries: []
    }
  });

  // Dynamic gallery upload fields
  const [galleryFields, setGalleryFields] = useState<string[]>([]);
  // Gallery modal state for galleryImages
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Continents for dropdown
  const [continents, setContinents] = useState<string[]>([]);
  // Sync galleryFields with formData.galleryImages
  useEffect(() => {
    setGalleryFields(formData.galleryImages.length ? formData.galleryImages : [""]);
  }, [formData.galleryImages]);
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

        // Convert tour to form data and include sale fields if present
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

          regularPricePerPerson: tour.regularPricePerPerson ?? "",
          promoPricePerPerson: tour.promoPricePerPerson ?? "",
          basePricePerDay: tour.basePricePerDay ?? "",
          // populate sale fields from tour
          isSaleEnabled: tour.isSaleEnabled ?? false,
          saleEndDate: tour.saleEndDate ?? "",

          travelWindow: tour.travelWindow || { start: "", end: "" },
          departureDates: tour.departureDates || [],

          highlights: tour.highlights || [],
          mainImage: typeof tour.mainImage === 'string' ? tour.mainImage : "",
          galleryImages: Array.isArray(tour.galleryImages) ? tour.galleryImages : [],
          relatedImages: Array.isArray(tour.relatedImages) ? tour.relatedImages : [],

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
            mainCities: tour.additionalInfo?.mainCities || {},
            countries: (tour.additionalInfo as Record<string, unknown>)?.countries as CountryEntry[] || []
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
  setFormData((prev: TourFormData) => ({ ...prev, slug }));
    }
  }, [formData.title, isEdit]);

  // Form handlers
  const handleInputChange = <K extends keyof TourFormData>(field: K, value: TourFormData[K]) => {
  setFormData((prev: TourFormData) => ({ ...prev, [field]: value } as unknown as TourFormData));
  };

  // ----- Countries to Visit helpers -----
  function addCountry() {
  setFormData((prev: TourFormData) => ({
      ...prev,
      additionalInfo: {
        ...prev.additionalInfo,
        countries: [...(prev.additionalInfo.countries || []), { name: "", image: "" }]
      }
    }));
  }

  function updateCountry(index: number, field: "name" | "image", value: string) {
  setFormData((prev: TourFormData) => {
      const countries = [...(prev.additionalInfo.countries || [])];
      countries[index] = { ...(countries[index] || { name: "", image: "" }), [field]: value };
      return { ...prev, additionalInfo: { ...prev.additionalInfo, countries } };
    });
  }

  function removeCountry(index: number) {
  setFormData((prev: TourFormData) => {
      const countries = [...(prev.additionalInfo.countries || [])];
      countries.splice(index, 1);
      return { ...prev, additionalInfo: { ...prev.additionalInfo, countries } };
    });
  }

  function handleCountryFile(index: number, file?: File | null) {
    if (!file) return;
    uploadImageToSupabase(file, 'country-images').then(url => {
      if (url) updateCountry(index, "image", url);
    });
  }
  // ---------------------------------------

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
        // include sale fields
        isSaleEnabled: !!formData.isSaleEnabled,
        saleEndDate: formData.isSaleEnabled && formData.saleEndDate ? formData.saleEndDate : undefined,
        travelWindow: formData.travelWindow.start && formData.travelWindow.end ? formData.travelWindow : undefined,
        additionalInfo: {
          ...formData.additionalInfo,
          continent: formData.continent,
          // ensure countries list is included; backend will receive under additionalInfo.countries
          countries: formData.additionalInfo.countries && formData.additionalInfo.countries.length ? formData.additionalInfo.countries : undefined
        },
        // Preserve existing backend field name for compatibility — used to store FlippingBook links
        bookingPdfUrl: formData.bookingPdfUrl ? formData.bookingPdfUrl : undefined
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
                  {continents.map((continent: string) => (
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
                  Flipping Book URL
                </label>
                <input
                  type="url"
                  value={formData.bookingPdfUrl}
                  onChange={(e) => handleInputChange("bookingPdfUrl", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.flippingbook.com/view/example-id"
                />
                <p className="text-xs text-gray-500 mt-1">Paste the FlippingBook link (flipbook viewer) for this tour — it will be used instead of a raw PDF file.</p>
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
                    disabled={!formData.isSaleEnabled}
                  />
                </div>

                {/* Enable/disable sale toggle */}
                <div className="flex items-center mt-4 gap-2">
                  <input
                    type="checkbox"
                    id="enable-sale"
                    checked={!!formData.isSaleEnabled}
                    onChange={e => handleInputChange("isSaleEnabled", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="enable-sale" className="font-medium">
                    Enable Promo Price (Sale)
                  </label>
                </div>

                {/* Sale end date */}
                {formData.isSaleEnabled && (
                  <div className="mt-2 flex items-center gap-2">
                    <label className="font-medium" htmlFor="sale-end-date">
                      Sale End Date:
                    </label>
                    <input
                      id="sale-end-date"
                      type="date"
                      value={formData.saleEndDate ? formData.saleEndDate.slice(0, 10) : ""}
                      onChange={e => handleInputChange("saleEndDate", e.target.value)}
                      className="rounded border px-2 py-1"
                    />
                  </div>
                )}
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
                {formData.departureDates.map((range, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2 bg-gray-50 rounded-lg p-4">
                    <span className="text-sm font-medium text-gray-600 w-8">#{idx + 1}</span>
                    <label className="text-sm">Start Date:</label>
                    <input
                      type="date"
                      value={range.start}
                      onChange={e => updateDepartureDateRange(idx, 'start', e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                    <label className="text-sm">End Date:</label>
                    <input
                      type="date"
                      value={range.end}
                      onChange={e => updateDepartureDateRange(idx, 'end', e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                    <button type="button" onClick={() => removeDepartureDateRange(idx)} className="text-red-500 ml-2">Remove</button>
                  </div>
                ))}
                <button type="button" onClick={addDepartureDateRange} className="w-full border-2 border-dashed border-green-300 rounded-lg p-4 text-green-600 hover:border-green-400 hover:bg-green-50 transition-all">
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

            <div className="space-y-8">
              {/* Main Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Main Image (required)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    // Create record with label 'main'
                    const record = await createImageRecord('main');
                    const url = await uploadImageToSupabase(file, 'tour-images', id || formData.slug, 'main');
                    // Update record with URL (simulate)
                    record.url = url;
                    if (url) handleInputChange("mainImage", url);
                  }}
                  className="mb-2"
                />
                {formData.mainImage && (
                  <div className="flex items-center gap-2 mt-2">
                    <img src={formData.mainImage} alt="Main Tour" className="w-48 h-32 object-cover rounded border" />
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">Main</span>
                  </div>
                )}
              </div>

              {/* Gallery Images Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Tour Gallery Images</label>
                <div className="space-y-2">
                  {galleryFields.map((img: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      {img ? (
                        <img src={img} alt={`Gallery ${idx + 1}`} className="w-24 h-16 object-cover rounded border" />
                      ) : (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const record = await createImageRecord('gallery');
                            const url = await uploadImageToSupabase(file, 'tour-images', id || formData.slug, 'gallery');
                            record.url = url;
                            // Update galleryFields and formData.galleryImages
                            const newFields = [...galleryFields];
                            newFields[idx] = url;
                            setGalleryFields(newFields);
                            handleInputChange("galleryImages", newFields.filter(Boolean));
                          }}
                          className="mb-2"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const newFields = galleryFields.filter((_: string, i: number) => i !== idx);
                          setGalleryFields(newFields);
                          handleInputChange("galleryImages", newFields.filter(Boolean));
                        }}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold"
                      >Remove</button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setGalleryFields([...galleryFields, ""])}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded font-semibold mt-2"
                  >+ Add Gallery Image</button>
                </div>
                {formData.galleryImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {formData.galleryImages.map((image: string, index: number) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-24 object-cover rounded border cursor-pointer"
                          onClick={() => { setGalleryIndex(index); setGalleryOpen(true); }}
                        />
                        <span className="absolute top-2 left-2 bg-white text-purple-700 border border-purple-300 rounded-full px-2 py-1 text-xs font-bold shadow">Gallery</span>
                        <button
                          type="button"
                          onClick={() => {
                            // Set as main image
                            handleInputChange("mainImage", image);
                          }}
                          className="absolute bottom-2 left-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-full px-2 py-1 text-xs font-bold shadow hover:bg-blue-200"
                        >
                          Set as Main
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Remove image from gallery
                            const newGallery = formData.galleryImages.filter((_: string, i: number) => i !== index);
                            handleInputChange("galleryImages", newGallery);
                          }}
                          className="absolute bottom-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Gallery Modal */}
                {galleryOpen && formData.galleryImages.length > 0 && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
                    <div className="relative bg-white rounded-lg shadow-lg p-4 max-w-xl w-full flex flex-col items-center">
                      <img
                        src={formData.galleryImages[galleryIndex]}
                        alt={`Gallery image ${galleryIndex + 1}`}
                        className="w-full h-96 object-contain rounded-lg mb-4"
                      />
                      <div className="flex gap-4 mb-2">
                        <button
                          type="button"
                          onClick={() => setGalleryIndex((galleryIndex - 1 + formData.galleryImages.length) % formData.galleryImages.length)}
                          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          Prev
                        </button>
                        <button
                          type="button"
                          onClick={() => setGalleryIndex((galleryIndex + 1) % formData.galleryImages.length)}
                          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          Next
                        </button>
                      </div>
                      <div className="flex gap-2 mb-2">
                        {formData.galleryImages.map((img: string, idx: number) => (
                          <button
                            key={idx}
                            type="button"
                            className={`w-4 h-4 rounded-full border ${galleryIndex === idx ? 'bg-blue-500 border-blue-700' : 'bg-gray-300 border-gray-400'}`}
                            onClick={() => setGalleryIndex(idx)}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setGalleryOpen(false)}
                        className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Related Images Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Other Related Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;
                    const urls = await Promise.all(files.map(async (file) => await uploadImageToSupabase(file, 'tour-images', id || formData.slug, 'related')));
                    const validUrls = urls.filter(url => url);
                    handleInputChange("relatedImages", [...formData.relatedImages, ...validUrls]);
                  }}
                  className="mb-2"
                />
                {formData.relatedImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.relatedImages.map((image: string, index: number) => (
                      <img key={index} src={image} alt={`Related ${index + 1}`} className="w-20 h-16 object-cover rounded border" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* NEW: Countries to Visit */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Countries to Visit</h2>
                <p className="text-gray-600">Add the countries this tour will visit and a single image for each country.</p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={addCountry}
                  className="px-4 py-2 rounded bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold text-sm shadow hover:from-pink-500 hover:to-pink-600 transition"
                >
                  + Add Country
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {(formData.additionalInfo.countries && formData.additionalInfo.countries.length > 0) ? (
                formData.additionalInfo.countries.map((c: CountryEntry, idx: number) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center bg-gray-50 p-3 rounded">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">Country</label>
                      <input
                        type="text"
                        value={c.name}
                        onChange={(e) => updateCountry(idx, "name", e.target.value)}
                        placeholder="e.g., France"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs text-gray-600 mb-1">Image URL</label>
                      <input
                        type="url"
                        value={c.image ?? ""}
                        onChange={(e) => updateCountry(idx, "image", e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                      <div className="text-xs text-gray-500 mt-1">Or upload an image file below — a preview will be shown.</div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          if (file) handleCountryFile(idx, file);
                        }}
                        className="mt-2"
                      />
                    </div>

                    <div className="md:col-span-1 flex items-center gap-3">
                      {c.image ? (
                        <img src={c.image} alt={c.name || `country-${idx}`} className="w-24 h-16 object-cover rounded border" />
                      ) : (
                        <div className="w-24 h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-400">No image</div>
                      )}
                      <div className="ml-auto">
                        <button
                          type="button"
                          onClick={() => removeCountry(idx)}
                          className="px-3 py-1 rounded bg-red-50 text-red-700 text-xs hover:bg-red-100"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No countries added yet. Click "Add Country" to begin.</div>
              )}
            </div>
          </div>

          {/* Continue with more sections... (rest unchanged) */}

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


