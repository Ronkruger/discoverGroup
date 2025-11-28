import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Power, Tag } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface PromoBanner {
  _id: string;
  isEnabled: boolean;
  title: string;
  message: string;
  ctaText: string;
  ctaLink: string;
  backgroundColor: string;
  textColor: string;
  discountPercentage: number;
  discountedTours: string[];
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Tour {
  _id: string;
  slug: string;
  title: string;
  line?: string;
}

export default function PromoBannerManagement() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);
  const [formData, setFormData] = useState({
    title: 'Limited Time Offer',
    message: 'Up to 30% off on European Tours!',
    ctaText: 'Book Now',
    ctaLink: '/deals',
    backgroundColor: '#1e40af',
    textColor: '#ffffff',
    discountPercentage: 30,
    discountedTours: [] as string[],
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchBanners();
    fetchTours();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/promo-banners`);
      const data = await response.json();
      setBanners(data.banners || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTours = async () => {
    try {
      const response = await fetch(`${API_BASE}/public/tours`);
      const data = await response.json();
      setTours(data || []);
    } catch (error) {
      console.error('Error fetching tours:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBanner
        ? `${API_BASE}/api/promo-banners/${editingBanner._id}`
        : `${API_BASE}/api/promo-banners`;
      
      const method = editingBanner ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchBanners();
        setShowModal(false);
        resetForm();
        alert(editingBanner ? 'Banner updated successfully!' : 'Banner created successfully!');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Failed to save banner');
    }
  };

  const toggleBanner = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/promo-banners/${id}/toggle`, {
        method: 'PATCH',
      });
      if (response.ok) {
        await fetchBanners();
      }
    } catch (error) {
      console.error('Error toggling banner:', error);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/promo-banners/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchBanners();
        alert('Banner deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
  };

  const openEditModal = (banner: PromoBanner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      message: banner.message,
      ctaText: banner.ctaText,
      ctaLink: banner.ctaLink,
      backgroundColor: banner.backgroundColor,
      textColor: banner.textColor,
      discountPercentage: banner.discountPercentage,
      discountedTours: banner.discountedTours,
      startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
      endDate: banner.endDate ? banner.endDate.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingBanner(null);
    setFormData({
      title: 'Limited Time Offer',
      message: 'Up to 30% off on European Tours!',
      ctaText: 'Book Now',
      ctaLink: '/deals',
      backgroundColor: '#1e40af',
      textColor: '#ffffff',
      discountPercentage: 30,
      discountedTours: [],
      startDate: '',
      endDate: '',
    });
  };

  const toggleTourSelection = (tourSlug: string) => {
    setFormData(prev => ({
      ...prev,
      discountedTours: prev.discountedTours.includes(tourSlug)
        ? prev.discountedTours.filter(s => s !== tourSlug)
        : [...prev.discountedTours, tourSlug]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotional Banners</h1>
          <p className="text-gray-600 mt-1">Manage promotional banners and tour discounts</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Banner
        </button>
      </div>

      {/* Banners List */}
      <div className="grid gap-4">
        {banners.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed">
            <Tag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg mb-2">No promotional banners yet</p>
            <p className="text-gray-500">Create your first banner to start promoting tours</p>
          </div>
        ) : (
          banners.map((banner) => (
            <div
              key={banner._id}
              className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-colors"
            >
              {/* Banner Preview */}
              <div
                className="p-4"
                style={{
                  backgroundColor: banner.backgroundColor,
                  color: banner.textColor,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✈️</span>
                    <div>
                      <div className="font-bold">{banner.title}</div>
                      <div className="text-sm opacity-90">{banner.message}</div>
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-full font-bold hover:bg-yellow-300 transition-all"
                  >
                    {banner.ctaText} →
                  </button>
                </div>
              </div>

              {/* Banner Details */}
              <div className="p-4 bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">Status</div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        banner.isEnabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {banner.isEnabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">Discount</div>
                    <div className="font-semibold">{banner.discountPercentage}%</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">Tours</div>
                    <div className="font-semibold">
                      {banner.discountedTours.length === 0 ? 'All' : banner.discountedTours.length}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">Duration</div>
                    <div className="text-sm">
                      {banner.startDate && banner.endDate ? (
                        <span>
                          {new Date(banner.startDate).toLocaleDateString()} - {new Date(banner.endDate).toLocaleDateString()}
                        </span>
                      ) : (
                        'Unlimited'
                      )}
                    </div>
                  </div>
                </div>

                {/* Selected Tours */}
                {banner.discountedTours.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 uppercase mb-2">Discounted Tours</div>
                    <div className="flex flex-wrap gap-2">
                      {banner.discountedTours.map((slug) => {
                        const tour = tours.find(t => t.slug === slug);
                        return (
                          <span
                            key={slug}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {tour?.title || slug}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleBanner(banner._id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      banner.isEnabled
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    {banner.isEnabled ? 'Disable' : 'Enable'}
                  </button>
                  
                  <button
                    onClick={() => openEditModal(banner)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => deleteBanner(banner._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">
                {editingBanner ? 'Edit Banner' : 'Create New Banner'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* CTA Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Message */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Message
                  </label>
                  <input
                    type="text"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* CTA Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Discount Percentage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Percentage
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountPercentage}
                      onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-600">%</span>
                  </div>
                </div>

                {/* Background Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="w-16 h-10 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="w-16 h-10 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Tour Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apply Discount to Specific Tours (Leave empty for all tours)
                </label>
                <div className="max-h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {tours.map((tour) => (
                      <label
                        key={tour.slug}
                        className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.discountedTours.includes(tour.slug)}
                          onChange={() => toggleTourSelection(tour.slug)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm">{tour.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Preview
                </label>
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: formData.backgroundColor,
                    color: formData.textColor,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✈️</span>
                      <div>
                        <div className="font-bold">{formData.title}</div>
                        <div className="text-sm opacity-90">{formData.message}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-full font-bold"
                    >
                      {formData.ctaText} →
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
