import React, { useState, useEffect, JSX } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  AlertCircle 
} from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

interface MapMarker {
  id?: number;
  city: string;
  country?: string;
  top: string;
  left: string;
  description?: string;
  tour_slug?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function MapMarkersManagement(): JSX.Element {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<MapMarker>>({
    city: '',
    country: '',
    top: '50%',
    left: '50%',
    description: '',
    tour_slug: '',
    is_active: true,
  });

  // Fetch markers from Supabase
  const fetchMarkers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('map_markers')
        .select('*')
        .order('city', { ascending: true });

      if (fetchError) throw fetchError;

      setMarkers(data || []);
      console.log('✅ Loaded', data?.length || 0, 'map markers');
    } catch (err) {
      console.error('❌ Failed to fetch markers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load markers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkers();
  }, []);

  // Create new marker
  const handleCreate = async () => {
    try {
      setError(null);
      
      if (!formData.city || !formData.top || !formData.left) {
        setError('City, Top, and Left positions are required');
        return;
      }

      const { data, error: createError } = await supabase
        .from('map_markers')
        .insert([{
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (createError) throw createError;

      setMarkers([...markers, data]);
      setIsAdding(false);
      resetForm();
      console.log('✅ Marker created:', data);
    } catch (err) {
      console.error('❌ Failed to create marker:', err);
      setError(err instanceof Error ? err.message : 'Failed to create marker');
    }
  };

  // Update existing marker
  const handleUpdate = async (id: number) => {
    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('map_markers')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setMarkers(markers.map(m => m.id === id ? data : m));
      setIsEditing(null);
      resetForm();
      console.log('✅ Marker updated:', data);
    } catch (err) {
      console.error('❌ Failed to update marker:', err);
      setError(err instanceof Error ? err.message : 'Failed to update marker');
    }
  };

  // Delete marker
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this marker?')) return;

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('map_markers')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setMarkers(markers.filter(m => m.id !== id));
      console.log('✅ Marker deleted:', id);
    } catch (err) {
      console.error('❌ Failed to delete marker:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete marker');
    }
  };

  // Toggle active status
  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      setError(null);

      const { data, error: toggleError } = await supabase
        .from('map_markers')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (toggleError) throw toggleError;

      setMarkers(markers.map(m => m.id === id ? data : m));
      console.log('✅ Marker status toggled:', id);
    } catch (err) {
      console.error('❌ Failed to toggle marker status:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle status');
    }
  };

  // Edit marker (populate form)
  const startEdit = (marker: MapMarker) => {
    setFormData({
      city: marker.city,
      country: marker.country || '',
      top: marker.top,
      left: marker.left,
      description: marker.description || '',
      tour_slug: marker.tour_slug || '',
      is_active: marker.is_active,
    });
    setIsEditing(marker.id || null);
    setIsAdding(false);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      city: '',
      country: '',
      top: '50%',
      left: '50%',
      description: '',
      tour_slug: '',
      is_active: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Map Markers</h1>
              <p className="text-gray-600 mt-1">Manage markers for "Explore Europe at a Glance" section</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsAdding(true);
              setIsEditing(null);
              resetForm();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Marker
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAdding || isEditing !== null) && (
        <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {isAdding ? 'Add New Marker' : 'Edit Marker'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Paris"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.country || ''}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., France"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Top Position <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.top || ''}
                onChange={(e) => setFormData({ ...formData, top: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 40%"
              />
              <p className="text-xs text-gray-500 mt-1">Vertical position (use % or px)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Left Position <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.left || ''}
                onChange={(e) => setFormData({ ...formData, left: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 35%"
              />
              <p className="text-xs text-gray-500 mt-1">Horizontal position (use % or px)</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Optional description or tooltip text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tour Slug (Optional)
              </label>
              <input
                type="text"
                value={formData.tour_slug || ''}
                onChange={(e) => setFormData({ ...formData, tour_slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., paris-city-tour"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Active (visible on map)</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => isAdding ? handleCreate() : handleUpdate(isEditing!)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Save className="w-4 h-4" />
              {isAdding ? 'Create Marker' : 'Save Changes'}
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setIsEditing(null);
                resetForm();
                setError(null);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Markers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City/Country
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tour Link
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {markers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No markers found. Click "Add Marker" to create your first map marker.
                </td>
              </tr>
            ) : (
              markers.map((marker) => (
                <tr key={marker.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{marker.city}</div>
                        {marker.country && (
                          <div className="text-sm text-gray-500">{marker.country}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Top: {marker.top} / Left: {marker.left}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {marker.tour_slug ? (
                      <span className="text-sm text-blue-600">{marker.tour_slug}</span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(marker.id!, marker.is_active)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        marker.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {marker.is_active ? (
                        <>
                          <Eye className="w-3 h-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEdit(marker)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(marker.id!)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 How to use:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Position values are CSS values (e.g., "40%" or "200px")</li>
          <li>• The map uses relative positioning - test positions on the live site</li>
          <li>• Tour slug links markers to specific tours (optional)</li>
          <li>• Inactive markers won't appear on the client map</li>
        </ul>
      </div>
    </div>
  );
}
