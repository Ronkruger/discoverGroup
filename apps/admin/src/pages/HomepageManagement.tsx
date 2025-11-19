import React, { useState, useEffect } from 'react';
import {
  Home as HomeIcon,
  Save,
  Image,
  Type,
  BarChart,
  Plus,
  Trash2,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Star,
  Users,
  Shield,
  Headphones,
  Award,
  Globe,
  Film,
  Eye,
  EyeOff
} from 'lucide-react';
import FileUpload from '../components/FileUpload';
import {
  uploadLogo,
  uploadFeaturedVideo,
  uploadVideoThumbnail,
  deleteFile,
  extractFilePathFromUrl,
} from '../lib/supabase';
import {
  fetchAllFeaturedVideos,
  createFeaturedVideo,
  updateFeaturedVideo,
  deleteFeaturedVideo,
  type FeaturedVideo,
} from '../lib/featured-videos';

interface HomepageSettings {
  logo: {
    url: string;
    height: number;
  };
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    promoText: string;
    promoButtonText: string;
  };
  statistics: {
    travelers: number;
    packages: number;
    rating: number;
    destinations: number;
  };
  features: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
  }>;
  testimonials: Array<{
    id: string;
    name: string;
    location: string;
    rating: number;
    text: string;
    image: string;
  }>;
}

const HomepageManagement: React.FC = () => {
  const [settings, setSettings] = useState<HomepageSettings>({
    logo: {
      url: '/logo.png',
      height: 64,
    },
    hero: {
      title: 'Experience the Magic of European Adventures',
      subtitle: 'Discover breathtaking destinations with expertly crafted tours',
      ctaText: 'Explore Tours',
      ctaLink: '#tours',
      promoText: 'Limited Time Offer: Up to 30% off on European Tours!',
      promoButtonText: 'Book Now',
    },
    statistics: {
      travelers: 30000,
      packages: 75,
      rating: 4.9,
      destinations: 25,
    },
    features: [
      {
        id: '1',
        title: 'Expert Guides',
        description: 'Professional local guides with deep knowledge',
        icon: 'Users',
      },
      {
        id: '2',
        title: 'Best Prices',
        description: 'Competitive rates with no hidden fees',
        icon: 'Award',
      },
      {
        id: '3',
        title: 'Safe & Secure',
        description: 'Fully licensed and insured travel services',
        icon: 'Shield',
      },
      {
        id: '4',
        title: '24/7 Support',
        description: 'Round-the-clock customer assistance',
        icon: 'Headphones',
      },
    ],
    testimonials: [
      {
        id: '1',
        name: 'Sarah Johnson',
        location: 'New York, USA',
        rating: 5,
        text: 'Absolutely incredible experience! The attention to detail and quality of service exceeded all expectations.',
        image: 'https://i.pravatar.cc/150?img=1',
      },
      {
        id: '2',
        name: 'Michael Chen',
        location: 'Singapore',
        rating: 5,
        text: 'Professional, reliable, and thoroughly enjoyable. The guides were knowledgeable and the itinerary was perfect.',
        image: 'https://i.pravatar.cc/150?img=2',
      },
      {
        id: '3',
        name: 'Emma Rodriguez',
        location: 'Barcelona, Spain',
        rating: 5,
        text: 'Best travel agency I have ever worked with. They handled everything seamlessly and made our trip unforgettable.',
        image: 'https://i.pravatar.cc/150?img=3',
      },
    ],
  });

  const [activeSection, setActiveSection] = useState('logo');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(true);
  
  // Featured Videos state
  const [featuredVideos, setFeaturedVideos] = useState<FeaturedVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  
  // New video form state
  const [newVideo, setNewVideo] = useState<{
    title: string;
    description: string;
    video_url: string;
    thumbnail_url: string;
    is_active: boolean;
  }>({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    is_active: true,
  });
  const [isAdding, setIsAdding] = useState(false);
  const [savingVideo, setSavingVideo] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('discovergroup-homepage-settings');
    
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        setSaved(true);
      } catch (error) {
        console.error('Error loading saved homepage settings:', error);
      }
    }
    
    // Load featured videos from Supabase
    loadFeaturedVideos();
  }, []);
  
  const loadFeaturedVideos = async () => {
    setLoadingVideos(true);
    try {
      const videos = await fetchAllFeaturedVideos();
      setFeaturedVideos(videos);
    } catch (error) {
      console.error('Error loading featured videos:', error);
    } finally {
      setLoadingVideos(false);
    }
  };

  const sections = [
    { id: 'logo', name: 'Logo & Branding', icon: Image },
    { id: 'hero', name: 'Hero Section', icon: Type },
    { id: 'videos', name: 'Featured Videos', icon: Film },
    { id: 'statistics', name: 'Statistics', icon: BarChart },
    { id: 'features', name: 'Features', icon: Star },
    { id: 'testimonials', name: 'Testimonials', icon: Users },
  ];

  const iconOptions = [
    { value: 'Users', label: 'Users', icon: Users },
    { value: 'Shield', label: 'Shield', icon: Shield },
    { value: 'Award', label: 'Award', icon: Award },
    { value: 'Headphones', label: 'Headphones', icon: Headphones },
    { value: 'Star', label: 'Star', icon: Star },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      // Store settings in localStorage
      localStorage.setItem('discovergroup-homepage-settings', JSON.stringify(settings));
      
      // Also try to sync to client domain if possible
      syncToClientDomain();
      
      setSaved(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        // Keep saved state but button is ready for new changes
      }, 3000);
      
    } catch (error) {
      console.error('Error saving homepage settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const syncToClientDomain = () => {
    // Try to sync settings to client domain via postMessage if window is open
    try {
      const clientUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:5173' 
        : window.location.protocol + '//' + window.location.hostname.replace('admin.', '').replace('lambent-dodol-2486cc', 'discovergrp');
      
      // Open a hidden iframe to client domain to sync settings
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = clientUrl + '?sync-settings=true';
      
      iframe.onload = () => {
        // Send settings to client page
        iframe.contentWindow?.postMessage({
          type: 'SYNC_HOMEPAGE_SETTINGS',
          settings: settings,
        }, clientUrl);
        
        // Remove iframe after sync
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      };
      
      document.body.appendChild(iframe);
    } catch (error) {
      console.warn('Could not auto-sync to client domain:', error);
    }
  };

  const updateLogoSetting = (key: keyof typeof settings.logo, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      logo: { ...prev.logo, [key]: value }
    }));
    setSaved(false);
  };

  const updateHeroSetting = (key: keyof typeof settings.hero, value: string) => {
    setSettings(prev => ({
      ...prev,
      hero: { ...prev.hero, [key]: value }
    }));
    setSaved(false);
  };

  const updateStatisticsSetting = (key: keyof typeof settings.statistics, value: number) => {
    setSettings(prev => ({
      ...prev,
      statistics: { ...prev.statistics, [key]: value }
    }));
    setSaved(false);
  };

  const updateFeature = (index: number, field: string, value: string) => {
    setSettings(prev => {
      const newFeatures = [...prev.features];
      newFeatures[index] = { ...newFeatures[index], [field]: value };
      return { ...prev, features: newFeatures };
    });
    setSaved(false);
  };

  const addFeature = () => {
    setSettings(prev => ({
      ...prev,
      features: [
        ...prev.features,
        {
          id: Date.now().toString(),
          title: 'New Feature',
          description: 'Feature description',
          icon: 'Star',
        },
      ],
    }));
    setSaved(false);
  };

  const removeFeature = (index: number) => {
    setSettings(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
    setSaved(false);
  };

  const updateTestimonial = (index: number, field: string, value: string | number) => {
    setSettings(prev => {
      const newTestimonials = [...prev.testimonials];
      newTestimonials[index] = { ...newTestimonials[index], [field]: value };
      return { ...prev, testimonials: newTestimonials };
    });
    setSaved(false);
  };

  const addTestimonial = () => {
    setSettings(prev => ({
      ...prev,
      testimonials: [
        ...prev.testimonials,
        {
          id: Date.now().toString(),
          name: 'New Customer',
          location: 'City, Country',
          rating: 5,
          text: 'Customer testimonial text...',
          image: 'https://i.pravatar.cc/150',
        },
      ],
    }));
    setSaved(false);
  };

  const removeTestimonial = (index: number) => {
    setSettings(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index),
    }));
    setSaved(false);
  };

  const renderLogoSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Logo Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FileUpload
              label="Logo Image"
              value={settings.logo.url}
              onChange={(url) => updateLogoSetting('url', url || '/logo.png')}
              onUpload={uploadLogo}
              onDelete={async (url) => {
                const path = extractFilePathFromUrl(url, 'homepage-media');
                if (path) {
                  await deleteFile('homepage-media', path);
                }
              }}
              accept="image/*"
              maxSize={5}
              type="image"
              placeholder="Upload your logo"
            />
            <p className="text-xs text-gray-500 mt-2">Recommended: PNG or SVG format with transparent background</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo Height (pixels)
            </label>
            <input
              type="number"
              value={settings.logo.height}
              onChange={(e) => updateLogoSetting('height', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Height of logo in navbar</p>
          </div>
        </div>

        {/* Logo Preview */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-sm font-medium text-gray-700 mb-3">Preview:</p>
          <div className="bg-white p-4 rounded-md inline-block">
            {settings.logo.url ? (
              <img 
                src={settings.logo.url} 
                alt="Logo" 
                style={{ height: `${settings.logo.height}px` }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="60"%3E%3Crect fill="%23ddd" width="100" height="60"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ELogo%3C/text%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div className="w-32 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
                No Logo
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderHeroSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hero Section Content</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Title
            </label>
            <input
              type="text"
              value={settings.hero.title}
              onChange={(e) => updateHeroSetting('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle
            </label>
            <textarea
              value={settings.hero.subtitle}
              onChange={(e) => updateHeroSetting('subtitle', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CTA Button Text
              </label>
              <input
                type="text"
                value={settings.hero.ctaText}
                onChange={(e) => updateHeroSetting('ctaText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CTA Link
              </label>
              <input
                type="text"
                value={settings.hero.ctaLink}
                onChange={(e) => updateHeroSetting('ctaLink', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Promotional Banner</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Text
                </label>
                <input
                  type="text"
                  value={settings.hero.promoText}
                  onChange={(e) => updateHeroSetting('promoText', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Button Text
                </label>
                <input
                  type="text"
                  value={settings.hero.promoButtonText}
                  onChange={(e) => updateHeroSetting('promoButtonText', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeaturedVideosSection = () => {
    const handleCreateVideo = async () => {
      if (!newVideo.title || !newVideo.video_url) {
        alert('Please provide at least a title and video');
        return;
      }

      setSavingVideo(true);
      try {
        const result = await createFeaturedVideo({
          title: newVideo.title,
          description: newVideo.description,
          video_url: newVideo.video_url,
          thumbnail_url: newVideo.thumbnail_url,
          display_order: featuredVideos.length,
          is_active: newVideo.is_active,
        });

        if (result.success) {
          await loadFeaturedVideos();
          setNewVideo({ title: '', description: '', video_url: '', thumbnail_url: '', is_active: true });
          setIsAdding(false);
          alert('Video added successfully!');
        } else {
          alert(`Error: ${result.error}`);
        }
      } catch (error) {
        console.error('Error creating video:', error);
        alert('Failed to create video');
      } finally {
        setSavingVideo(false);
      }
    };

    const handleToggleActive = async (video: FeaturedVideo) => {
      const result = await updateFeaturedVideo(video.id, { is_active: !video.is_active });
      if (result.success) {
        await loadFeaturedVideos();
      } else {
        alert(`Error: ${result.error}`);
      }
    };

    const handleDeleteVideo = async (video: FeaturedVideo) => {
      if (!confirm(`Are you sure you want to delete "${video.title}"?`)) {
        return;
      }

      try {
        // Delete video file from storage
        if (video.video_url) {
          const videoPath = extractFilePathFromUrl(video.video_url, 'homepage-media');
          if (videoPath) {
            await deleteFile('homepage-media', videoPath);
          }
        }

        // Delete thumbnail from storage
        if (video.thumbnail_url) {
          const thumbPath = extractFilePathFromUrl(video.thumbnail_url, 'homepage-media');
          if (thumbPath) {
            await deleteFile('homepage-media', thumbPath);
          }
        }

        // Delete from database
        const result = await deleteFeaturedVideo(video.id);
        if (result.success) {
          await loadFeaturedVideos();
          alert('Video deleted successfully');
        } else {
          alert(`Error: ${result.error}`);
        }
      } catch (error) {
        console.error('Error deleting video:', error);
        alert('Failed to delete video');
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Featured Videos</h3>
            <p className="text-sm text-gray-600 mt-1">Manage videos shown in the homepage carousel</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{isAdding ? 'Cancel' : 'Add Video'}</span>
          </button>
        </div>

        {/* Add New Video Form */}
        {isAdding && (
          <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
            <h4 className="font-medium text-gray-900 mb-4">Add New Featured Video</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FileUpload
                    label="Video File"
                    value={newVideo.video_url}
                    onChange={(url) => setNewVideo({ ...newVideo, video_url: url || '' })}
                    onUpload={uploadFeaturedVideo}
                    accept="video/mp4,video/webm,video/quicktime"
                    maxSize={100}
                    type="video"
                    placeholder="Upload video (max 100MB)"
                    required
                  />
                </div>

                <div>
                  <FileUpload
                    label="Thumbnail Image"
                    value={newVideo.thumbnail_url}
                    onChange={(url) => setNewVideo({ ...newVideo, thumbnail_url: url || '' })}
                    onUpload={uploadVideoThumbnail}
                    accept="image/*"
                    maxSize={5}
                    type="image"
                    placeholder="Upload thumbnail"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  placeholder="e.g., Explore the Swiss Alps"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newVideo.description}
                  onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                  placeholder="Brief description of the video..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="newVideoActive"
                  checked={newVideo.is_active}
                  onChange={(e) => setNewVideo({ ...newVideo, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="newVideoActive" className="text-sm text-gray-700">
                  Active (show on homepage)
                </label>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={handleCreateVideo}
                  disabled={savingVideo || !newVideo.title || !newVideo.video_url}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingVideo ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Save Video</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewVideo({ title: '', description: '', video_url: '', thumbnail_url: '', is_active: true });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Videos List */}
        <div className="space-y-4">
          {loadingVideos ? (
            <div className="text-center py-8 text-gray-500">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p>Loading videos...</p>
            </div>
          ) : featuredVideos.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Film className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No featured videos yet</p>
              <p className="text-sm text-gray-500">Click "Add Video" to create your first featured video</p>
            </div>
          ) : (
            featuredVideos.map((video) => (
              <div key={video.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="w-48 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{video.title}</h4>
                        {video.description && (
                          <p className="text-sm text-gray-600 mt-1">{video.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>Order: {video.display_order}</span>
                          <span className={`px-2 py-1 rounded ${video.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {video.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleActive(video)}
                          className="p-2 text-gray-600 hover:text-blue-600 rounded-md hover:bg-blue-50"
                          title={video.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {video.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(video)}
                          className="p-2 text-gray-600 hover:text-red-600 rounded-md hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderStatisticsSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics Display</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Travelers
            </label>
            <input
              type="number"
              value={settings.statistics.travelers}
              onChange={(e) => updateStatisticsSetting('travelers', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Packages
            </label>
            <input
              type="number"
              value={settings.statistics.packages}
              onChange={(e) => updateStatisticsSetting('packages', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Average Rating
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={settings.statistics.rating}
              onChange={(e) => updateStatisticsSetting('rating', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Destinations
            </label>
            <input
              type="number"
              value={settings.statistics.destinations}
              onChange={(e) => updateStatisticsSetting('destinations', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-4">Preview:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg text-center shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{settings.statistics.travelers.toLocaleString()}+</div>
              <div className="text-sm text-gray-600">Happy Travelers</div>
            </div>
            <div className="bg-white p-4 rounded-lg text-center shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{settings.statistics.packages}+</div>
              <div className="text-sm text-gray-600">Tour Packages</div>
            </div>
            <div className="bg-white p-4 rounded-lg text-center shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{settings.statistics.rating}★</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="bg-white p-4 rounded-lg text-center shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{settings.statistics.destinations}+</div>
              <div className="text-sm text-gray-600">Destinations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeaturesSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Features Section</h3>
        <button
          onClick={addFeature}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Feature</span>
        </button>
      </div>

      <div className="space-y-4">
        {settings.features.map((feature, index) => (
          <div key={feature.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Feature {index + 1}</h4>
              <button
                onClick={() => removeFeature(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={feature.title}
                  onChange={(e) => updateFeature(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <select
                  value={feature.icon}
                  onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {iconOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={feature.description}
                  onChange={(e) => updateFeature(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTestimonialsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Testimonials Section</h3>
        <button
          onClick={addTestimonial}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      <div className="space-y-4">
        {settings.testimonials.map((testimonial, index) => (
          <div key={testimonial.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Testimonial {index + 1}</h4>
              <button
                onClick={() => removeTestimonial(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={testimonial.name}
                  onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={testimonial.location}
                  onChange={(e) => updateTestimonial(index, 'location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={testimonial.rating}
                  onChange={(e) => updateTestimonial(index, 'rating', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={testimonial.image}
                  onChange={(e) => updateTestimonial(index, 'image', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Testimonial Text
                </label>
                <textarea
                  value={testimonial.text}
                  onChange={(e) => updateTestimonial(index, 'text', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'logo': return renderLogoSection();
      case 'hero': return renderHeroSection();
      case 'videos': return renderFeaturedVideosSection();
      case 'statistics': return renderStatisticsSection();
      case 'features': return renderFeaturesSection();
      case 'testimonials': return renderTestimonialsSection();
      default: return renderLogoSection();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <HomeIcon className="h-8 w-8 text-gray-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Homepage Management</h1>
            <p className="text-sm text-gray-600">Customize your client-facing homepage content</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {saved ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Settings saved successfully</span>
            </div>
          ) : (
            <div className="flex items-center text-orange-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Unsaved changes</span>
            </div>
          )}
          <button
            onClick={() => {
              const clientUrl = window.location.hostname === 'localhost' 
                ? 'http://localhost:5173' 
                : 'https://discoverg.netlify.app';
              window.open(clientUrl, '_blank');
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span>Preview on Client</span>
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              loading 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : saved
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{loading ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{section.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Export/Import */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Settings Management</h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(settings, null, 2);
                  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                  const exportFileDefaultName = `homepage-settings-${new Date().toISOString().split('T')[0]}.json`;
                  
                  const linkElement = document.createElement('a');
                  linkElement.setAttribute('href', dataUri);
                  linkElement.setAttribute('download', exportFileDefaultName);
                  linkElement.click();
                }}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                <Upload className="h-4 w-4" />
                <span>Export Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {renderSectionContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomepageManagement;
