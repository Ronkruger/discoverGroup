import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Upload, ChevronUp, ChevronDown } from 'lucide-react';
import { fetchCountries, deleteCountry, type Country, type Attraction, type Testimonial } from '../../../../src/api/countries';
import { createCountryAdmin, updateCountryAdmin } from '../services/apiClient';
import React from 'react';
import { useToast } from '../components/Toast';

// --- Image Upload Helper (TODO: Implement with your storage solution) ---
async function uploadImageToStorage(
  file: File,
  countryId: string,
  imageType: 'hero' | 'attraction'
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', `countries/${countryId}/${imageType}`);
  formData.append('label', imageType);

  const response = await fetch(`${import.meta.env.VITE_ADMIN_API_URL}/api/upload/single`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  const data = await response.json();
  return data.url;
}

export default function CountryManagement() {
  const { success, error: errorToast } = useToast();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Country>>({
    name: '',
    description: '',
    heroQuery: '',
    heroImageUrl: '',
    heroImages: [],
    bestTime: '',
    currency: '',
    language: '',
    visaInfo: '',
    attractions: [],
    testimonials: [],
    isActive: true
  });
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingAttraction, setUploadingAttraction] = useState<string | null>(null);

  const loadCountries = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCountries();
      setCountries(data);
    } catch (error) {
      console.error('Failed to load countries:', error);
      errorToast('Failed to load countries');
    } finally {
      setLoading(false);
    }
  }, [errorToast]);

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  const handleEdit = (country: Country) => {
    setEditingCountry(country);
    setFormData({
      name: country.name,
      description: country.description,
      heroQuery: country.heroQuery || '',
      heroImageUrl: country.heroImageUrl || '',
      heroImages: country.heroImages || [],
      bestTime: country.bestTime,
      currency: country.currency,
      language: country.language,
      visaInfo: country.visaInfo || '',
      attractions: country.attractions || [],
      testimonials: country.testimonials || [],
      isActive: country.isActive
    });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingCountry(null);
    setFormData({
      name: '',
      description: '',
      heroQuery: '',
      heroImageUrl: '',
      heroImages: [],
      bestTime: '',
      currency: '',
      language: '',
      visaInfo: '',
      attractions: [],
      testimonials: [],
      isActive: true
    });
    setIsCreating(true);
  };

  const handleCancel = () => {
    setEditingCountry(null);
    setIsCreating(false);
    setFormData({
      name: '',
      description: '',
      heroQuery: '',
      heroImageUrl: '',
      heroImages: [],
      bestTime: '',
      currency: '',
      language: '',
      visaInfo: '',
      attractions: [],
      testimonials: [],
      isActive: true
    });
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingHero(true);
      const countryId = editingCountry?._id || formData._id || `new-${Date.now()}`;
      const url = await uploadImageToStorage(file, countryId, 'hero');
      const currentImages = formData.heroImages || [];
      const updatedImages = [...currentImages, url];
      setFormData({ 
        ...formData, 
        heroImages: updatedImages,
        heroImageUrl: updatedImages[0] // Set first image as primary
      });
      alert('Hero image uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploadingHero(false);
    }
  };

  const removeHeroImage = (index: number) => {
    const currentImages = formData.heroImages || [];
    const updatedImages = currentImages.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      heroImages: updatedImages,
      heroImageUrl: updatedImages[0] || '' // Update primary to first remaining image
    });
  };

  const setPrimaryHeroImage = (index: number) => {
    const currentImages = formData.heroImages || [];
    if (currentImages[index]) {
      setFormData({
        ...formData,
        heroImageUrl: currentImages[index]
      });
    }
  };

  const handleAttractionImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAttraction(index.toString());
      const countryId = editingCountry?._id || formData._id || `new-${Date.now()}`;
      const url = await uploadImageToStorage(file, countryId, 'attraction');
      const updatedAttractions = [...(formData.attractions || [])];
      updatedAttractions[index] = { ...updatedAttractions[index], imageUrl: url };
      setFormData({ ...formData, attractions: updatedAttractions });
      success('Hero image uploaded successfully! ✅');
    } catch (error) {
      console.error('Upload failed:', error);
      errorToast(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploadingAttraction(null);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description || !formData.bestTime || !formData.currency || !formData.language) {
      errorToast('Please fill in all required fields');
      return;
    }

    try {
      if (editingCountry) {
        await updateCountryAdmin(editingCountry._id, formData);
        success('Country updated successfully! ✅');
      } else {
        await createCountryAdmin(formData as Omit<Country, '_id' | 'slug' | 'createdAt' | 'updatedAt'>);
        success('Country created successfully! ✅');
      }
      handleCancel();
      loadCountries();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save country';
      console.error('Save failed:', error);
      errorToast(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this country?')) return;

    try {
      await deleteCountry(id);
      success('Country deleted successfully! 🗑️');
      loadCountries();
    } catch (error) {
      console.error('Delete failed:', error);
      errorToast('Failed to delete country');
    }
  };

  const addAttraction = () => {
    const newAttraction: Attraction = {
      title: '',
      description: '',
      imageUrl: '',
      displayOrder: (formData.attractions?.length || 0) + 1
    };
    setFormData({ ...formData, attractions: [...(formData.attractions || []), newAttraction] });
  };

  const updateAttraction = (index: number, field: keyof Attraction, value: string | number) => {
    const updatedAttractions = [...(formData.attractions || [])];
    updatedAttractions[index] = { ...updatedAttractions[index], [field]: value };
    setFormData({ ...formData, attractions: updatedAttractions });
  };

  const removeAttraction = (index: number) => {
    const updatedAttractions = (formData.attractions || []).filter((_, i) => i !== index);
    setFormData({ ...formData, attractions: updatedAttractions });
  };

  const moveAttraction = (index: number, direction: 'up' | 'down') => {
    const attractions = [...(formData.attractions || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= attractions.length) return;

    [attractions[index], attractions[newIndex]] = [attractions[newIndex], attractions[index]];
    attractions.forEach((attr, i) => {
      attr.displayOrder = i + 1;
    });
    setFormData({ ...formData, attractions });
  };

  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      quote: '',
      author: '',
      displayOrder: (formData.testimonials?.length || 0) + 1
    };
    setFormData({ ...formData, testimonials: [...(formData.testimonials || []), newTestimonial] });
  };

  const updateTestimonial = (index: number, field: keyof Testimonial, value: string | number) => {
    const updatedTestimonials = [...(formData.testimonials || [])];
    updatedTestimonials[index] = { ...updatedTestimonials[index], [field]: value };
    setFormData({ ...formData, testimonials: updatedTestimonials });
  };

  const removeTestimonial = (index: number) => {
    const updatedTestimonials = (formData.testimonials || []).filter((_, i) => i !== index);
    setFormData({ ...formData, testimonials: updatedTestimonials });
  };

  const moveTestimonial = (index: number, direction: 'up' | 'down') => {
    const testimonials = [...(formData.testimonials || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= testimonials.length) return;

    [testimonials[index], testimonials[newIndex]] = [testimonials[newIndex], testimonials[index]];
    testimonials.forEach((test, i) => {
      test.displayOrder = i + 1;
    });
    setFormData({ ...formData, testimonials });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading countries...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Country Management</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Country
        </button>
      </div>

      {(isCreating || editingCountry) && (
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">
            {editingCountry ? 'Edit Country' : 'Create New Country'}
          </h2>

          {/* Basic Info */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., France"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Brief description of the country..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Hero Search Query</label>
                <input
                  type="text"
                  value={formData.heroQuery}
                  onChange={(e) => setFormData({ ...formData, heroQuery: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., paris eiffel tower"
                />
                <p className="text-xs text-gray-500 mt-1">Used for Unsplash fallback if no hero image</p>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Hero Images</label>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Upload size={16} />
                  {uploadingHero ? 'Uploading...' : 'Add Hero Image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroImageUpload}
                    className="hidden"
                    disabled={uploadingHero}
                  />
                </label>
                
                {formData.heroImages && formData.heroImages.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-600">{formData.heroImages.length} image(s) uploaded</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {formData.heroImages.map((imageUrl, index) => (
                        <div key={index} className="relative group border rounded-lg overflow-hidden">
                          <img 
                            src={imageUrl} 
                            alt={`Hero ${index + 1}`} 
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              onClick={() => setPrimaryHeroImage(index)}
                              className={`px-2 py-1 text-xs rounded ${
                                formData.heroImageUrl === imageUrl 
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-white text-gray-800 hover:bg-gray-100'
                              }`}
                              title="Set as primary"
                            >
                              {formData.heroImageUrl === imageUrl ? 'Primary' : 'Set Primary'}
                            </button>
                            <button
                              onClick={() => removeHeroImage(index)}
                              className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                              title="Remove image"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          {formData.heroImageUrl === imageUrl && (
                            <div className="absolute top-1 left-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                              Primary
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Best Time to Visit *</label>
                <input
                  type="text"
                  value={formData.bestTime}
                  onChange={(e) => setFormData({ ...formData, bestTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., April - October"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Currency *</label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Euro (EUR)"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Language *</label>
                <input
                  type="text"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., French"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Visa Information</label>
                <input
                  type="text"
                  value={formData.visaInfo}
                  onChange={(e) => setFormData({ ...formData, visaInfo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Schengen Visa Required"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">Active</label>
            </div>
          </div>

          {/* Attractions */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold">Attractions</h3>
              <button
                onClick={addAttraction}
                className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                <Plus size={16} />
                Add Attraction
              </button>
            </div>

            <div className="space-y-4">
              {formData.attractions?.map((attraction, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-medium">Attraction #{index + 1}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveAttraction(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-600 hover:text-blue-600 disabled:opacity-30"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => moveAttraction(index, 'down')}
                        disabled={index === (formData.attractions?.length || 0) - 1}
                        className="p-1 text-gray-600 hover:text-blue-600 disabled:opacity-30"
                      >
                        <ChevronDown size={16} />
                      </button>
                      <button
                        onClick={() => removeAttraction(index)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={attraction.title}
                      onChange={(e) => updateAttraction(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Attraction title"
                    />
                    <textarea
                      value={attraction.description}
                      onChange={(e) => updateAttraction(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      rows={2}
                      placeholder="Attraction description"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={attraction.imageUrl}
                        onChange={(e) => updateAttraction(index, 'imageUrl', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded"
                        placeholder="Image URL"
                      />
                      <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200">
                        <Upload size={16} />
                        {uploadingAttraction === index.toString() ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleAttractionImageUpload(index, e)}
                          className="hidden"
                          disabled={uploadingAttraction === index.toString()}
                        />
                      </label>
                    </div>
                    {attraction.imageUrl && (
                      <img src={attraction.imageUrl} alt="Preview" className="h-20 w-auto rounded" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold">Testimonials</h3>
              <button
                onClick={addTestimonial}
                className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                <Plus size={16} />
                Add Testimonial
              </button>
            </div>

            <div className="space-y-4">
              {formData.testimonials?.map((testimonial, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-medium">Testimonial #{index + 1}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveTestimonial(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-600 hover:text-blue-600 disabled:opacity-30"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => moveTestimonial(index, 'down')}
                        disabled={index === (formData.testimonials?.length || 0) - 1}
                        className="p-1 text-gray-600 hover:text-blue-600 disabled:opacity-30"
                      >
                        <ChevronDown size={16} />
                      </button>
                      <button
                        onClick={() => removeTestimonial(index)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <textarea
                      value={testimonial.quote}
                      onChange={(e) => updateTestimonial(index, 'quote', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      rows={2}
                      placeholder="Testimonial quote"
                    />
                    <input
                      type="text"
                      value={testimonial.author}
                      onChange={(e) => updateTestimonial(index, 'author', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Author name"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save size={20} />
              Save Country
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
            >
              <X size={20} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Countries List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {countries.map((country) => (
          <div key={country._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {country.heroImageUrl && (
              <div
                className="h-40 bg-cover bg-center"
                style={{ backgroundImage: `url(${country.heroImageUrl})` }}
              />
            )}
            <div className="p-4">
              <h3 className="text-xl font-bold mb-2">{country.name}</h3>
              <p className="text-sm text-gray-600 mb-2">Slug: {country.slug}</p>
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">{country.description}</p>
              <div className="text-xs text-gray-500 mb-3">
                <div>Attractions: {country.attractions?.length || 0}</div>
                <div>Testimonials: {country.testimonials?.length || 0}</div>
                <div>Status: {country.isActive ? '✅ Active' : '❌ Inactive'}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(country)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  <Edit2 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(country._id)}
                  className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {countries.length === 0 && !isCreating && (
        <div className="text-center py-12 text-gray-500">
          No countries found. Click "Add Country" to create your first country.
        </div>
      )}
    </div>
  );
}
