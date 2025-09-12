import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';
import { 
  Save, 
  ArrowLeft, 
  Upload, 
  X, 
  MapPin,
  Home,
  Users,
  DollarSign,
  Star
} from 'lucide-react';
import type { Property, CreateProperty } from '../../shared/types';

export default function PropertyFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, redirectToLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [property, setProperty] = useState<CreateProperty>({
    title: '',
    description: '',
    location: '',
    price_per_night: 0,
    max_guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    amenities: [],
    images: [],
  });

  const isEditing = !!id;

  useEffect(() => {
    if (!user) {
      redirectToLogin();
      return;
    }

    if (isEditing) {
      fetchProperty();
    }
  }, [user, id, isEditing, redirectToLogin]);

  const fetchProperty = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/properties/${id}`);
      const data = await response.json();
      
      if (data.success) {
        const prop = data.data as Property;
        setProperty({
          title: prop.title,
          description: prop.description || '',
          location: prop.location,
          price_per_night: prop.price_per_night,
          max_guests: prop.max_guests,
          bedrooms: prop.bedrooms || 1,
          bathrooms: prop.bathrooms || 1,
          amenities: prop.amenities ? JSON.parse(prop.amenities) : [],
          images: prop.images ? JSON.parse(prop.images) : [],
        });
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isEditing ? `/api/properties/${id}` : '/api/properties';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(property),
      });

      const data = await response.json();
      
      if (data.success) {
        navigate('/dashboard?tab=properties');
      } else {
        console.error('Error saving property:', data.error);
      }
    } catch (error) {
      console.error('Error saving property:', error);
    } finally {
      setSaving(false);
    }
  };

  const addAmenity = (amenity: string) => {
    if (amenity && !property.amenities?.includes(amenity)) {
      setProperty(prev => ({
        ...prev,
        amenities: [...(prev.amenities || []), amenity]
      }));
    }
  };

  const removeAmenity = (amenity: string) => {
    setProperty(prev => ({
      ...prev,
      amenities: (prev.amenities || []).filter(a => a !== amenity)
    }));
  };

  const addImageUrl = (url: string) => {
    if (url && !property.images?.includes(url)) {
      setProperty(prev => ({
        ...prev,
        images: [...(prev.images || []), url]
      }));
    }
  };

  const removeImage = (url: string) => {
    setProperty(prev => ({
      ...prev,
      images: (prev.images || []).filter(img => img !== url)
    }));
  };

  const commonAmenities = [
    'WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'TV', 'Balcony',
    'Pool', 'Gym', 'Elevator', 'Security', 'Laundry', 'Garden',
    'BBQ Area', 'Terrace', 'Fireplace', 'Hot Tub'
  ];

  const sampleImages = [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&h=600',
    'https://images.unsplash.com/photo-1560448204-e1a3ecbdd6cc?auto=format&fit=crop&w=800&h=600',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&h=600',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&h=600',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&h=600',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&h=600',
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to manage properties.</p>
          <button
            onClick={redirectToLogin}
            className="bg-[#2957c3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="h-96 bg-gray-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard?tab=properties')}
            className="inline-flex items-center text-gray-600 hover:text-[#2957c3] mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Properties
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Edit Property' : 'Add New Property'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Update your property details' : 'List your property on HabibiStay'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Home className="w-6 h-6 mr-2 text-[#2957c3]" />
              Basic Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={property.title}
                  onChange={(e) => setProperty({ ...property, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                  placeholder="e.g., Luxury 2BR Apartment in Olaya District"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={property.description}
                  onChange={(e) => setProperty({ ...property, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent resize-none"
                  placeholder="Describe your property, its features, and what makes it special..."
                ></textarea>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="location"
                    required
                    value={property.location}
                    onChange={(e) => setProperty({ ...property, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                    placeholder="e.g., Olaya District, Riyadh"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Users className="w-6 h-6 mr-2 text-[#2957c3]" />
              Property Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="max_guests" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Guests *
                </label>
                <input
                  type="number"
                  id="max_guests"
                  required
                  min="1"
                  max="20"
                  value={property.max_guests}
                  onChange={(e) => setProperty({ ...property, max_guests: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="price_per_night" className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Night (SAR) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    id="price_per_night"
                    required
                    min="50"
                    value={property.price_per_night}
                    onChange={(e) => setProperty({ ...property, price_per_night: parseFloat(e.target.value) })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                    placeholder="500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <input
                  type="number"
                  id="bedrooms"
                  min="0"
                  max="10"
                  value={property.bedrooms}
                  onChange={(e) => setProperty({ ...property, bedrooms: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <input
                  type="number"
                  id="bathrooms"
                  min="0"
                  max="10"
                  value={property.bathrooms}
                  onChange={(e) => setProperty({ ...property, bathrooms: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="w-6 h-6 mr-2 text-[#2957c3]" />
              Amenities
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {commonAmenities.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => {
                      if (property.amenities?.includes(amenity)) {
                        removeAmenity(amenity);
                      } else {
                        addAmenity(amenity);
                      }
                    }}
                    className={`p-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                      property.amenities?.includes(amenity)
                        ? 'border-[#2957c3] bg-blue-50 text-[#2957c3]'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>

              {property.amenities && property.amenities.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Amenities:</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#2957c3] text-white"
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeAmenity(amenity)}
                          className="ml-2 hover:text-gray-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Upload className="w-6 h-6 mr-2 text-[#2957c3]" />
              Property Images
            </h2>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Add high-quality images of your property. The first image will be used as the main photo.
              </p>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Add Sample Images:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {sampleImages.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Sample ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => addImageUrl(url)}
                        disabled={property.images?.includes(url)}
                        className={`absolute inset-0 rounded-lg flex items-center justify-center text-white font-medium text-sm transition-colors ${
                          property.images?.includes(url)
                            ? 'bg-green-500 bg-opacity-90'
                            : 'bg-black bg-opacity-50 hover:bg-opacity-70'
                        }`}
                      >
                        {property.images?.includes(url) ? '✓ Added' : '+ Add'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {property.images && property.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Property Images:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.images.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Property ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 bg-[#2957c3] text-white text-xs px-2 py-1 rounded">
                            Main Photo
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard?tab=properties')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#2957c3] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {isEditing ? 'Update Property' : 'Create Property'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
