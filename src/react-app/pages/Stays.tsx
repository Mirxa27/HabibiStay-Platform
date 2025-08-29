import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Calendar, Users, Star, Home, Bath, Bed, X } from 'lucide-react';
import type { Property, AdvancedPropertySearch } from '@/shared/types';
import PropertyCard from '@/react-app/components/PropertyCard';

export default function StaysPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  
  const [searchFilters, setSearchFilters] = useState<AdvancedPropertySearch>({
    location: '',
    check_in: '',
    check_out: '',
    guests: 1,
    min_price: undefined,
    max_price: undefined,
    amenities: [],
    bedrooms: undefined,
    bathrooms: undefined,
    rating: undefined,
    sort_by: 'featured',
    page: 1,
    limit: 20,
  });

  const availableAmenities = [
    'WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'TV', 'Balcony',
    'Pool', 'Gym', 'Elevator', 'Security', 'Laundry', 'Garden',
    'BBQ Area', 'Terrace', 'Fireplace', 'Hot Tub'
  ];

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async (filters?: AdvancedPropertySearch) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const filtersToUse = filters || searchFilters;
      
      Object.entries(filtersToUse).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`/api/properties?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setProperties(data.data);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFilters = { ...searchFilters, page: 1 };
    setSearchFilters(updatedFilters);
    fetchProperties(updatedFilters);
  };

  const handleFilterChange = (key: keyof AdvancedPropertySearch, value: any) => {
    const updatedFilters = { ...searchFilters, [key]: value, page: 1 };
    setSearchFilters(updatedFilters);
  };

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = searchFilters.amenities || [];
    const updatedAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    
    handleFilterChange('amenities', updatedAmenities);
  };

  const clearFilters = () => {
    const clearedFilters: AdvancedPropertySearch = {
      location: '',
      check_in: '',
      check_out: '',
      guests: 1,
      min_price: undefined,
      max_price: undefined,
      amenities: [],
      bedrooms: undefined,
      bathrooms: undefined,
      rating: undefined,
      sort_by: 'featured',
      page: 1,
      limit: 20,
    };
    setSearchFilters(clearedFilters);
    fetchProperties(clearedFilters);
  };

  const handlePageChange = (newPage: number) => {
    const updatedFilters = { ...searchFilters, page: newPage };
    setSearchFilters(updatedFilters);
    fetchProperties(updatedFilters);
  };

  const comfort = [
    {
      icon: MapPin,
      title: 'Prime Locations',
      description: 'Handpicked properties in Riyadh\'s best neighborhoods',
    },
    {
      icon: Calendar,
      title: 'Flexible Booking',
      description: 'Easy cancellation and modification policies',
    },
    {
      icon: Users,
      title: 'Concierge Support',
      description: '24/7 assistance with Sara, your personal AI assistant',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-[#2957c3] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Your Perfect Riyadh Stay
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Discover exceptional accommodations that combine luxury, comfort, and authentic Saudi hospitality
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white rounded-xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchFilters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="Enter location..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in
                </label>
                <input
                  type="date"
                  value={searchFilters.check_in}
                  onChange={(e) => handleFilterChange('check_in', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out
                </label>
                <input
                  type="date"
                  value={searchFilters.check_out}
                  onChange={(e) => handleFilterChange('check_out', e.target.value)}
                  min={searchFilters.check_in || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guests
                </label>
                <select
                  value={searchFilters.guests}
                  onChange={(e) => handleFilterChange('guests', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-center space-x-4">
              <button
                type="submit"
                className="bg-[#2957c3] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <Search className="h-5 w-5 mr-2" />
                Search Properties
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors inline-flex items-center"
              >
                <Filter className="h-5 w-5 mr-2" />
                More Filters
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-[#2957c3] hover:text-blue-700 font-medium"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range (SAR/night)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={searchFilters.min_price || ''}
                        onChange={(e) => handleFilterChange('min_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={searchFilters.max_price || ''}
                        onChange={(e) => handleFilterChange('max_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Rooms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms & Bathrooms
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <Bed className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                        <select
                          value={searchFilters.bedrooms || ''}
                          onChange={(e) => handleFilterChange('bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                        >
                          <option value="">Any</option>
                          {[1, 2, 3, 4, 5].map(num => (
                            <option key={num} value={num}>{num}+ bed{num > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                      <div className="relative">
                        <Bath className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                        <select
                          value={searchFilters.bathrooms || ''}
                          onChange={(e) => handleFilterChange('bathrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                        >
                          <option value="">Any</option>
                          {[1, 2, 3, 4, 5].map(num => (
                            <option key={num} value={num}>{num}+ bath{num > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Rating
                    </label>
                    <div className="relative">
                      <Star className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
                      <select
                        value={searchFilters.rating || ''}
                        onChange={(e) => handleFilterChange('rating', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                      >
                        <option value="">Any Rating</option>
                        <option value="4.5">4.5+ Stars</option>
                        <option value="4.0">4.0+ Stars</option>
                        <option value="3.5">3.5+ Stars</option>
                        <option value="3.0">3.0+ Stars</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Amenities
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availableAmenities.map((amenity) => (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`p-2 text-sm font-medium rounded-lg border transition-colors ${
                          searchFilters.amenities?.includes(amenity)
                            ? 'border-[#2957c3] bg-blue-50 text-[#2957c3]'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                  {searchFilters.amenities && searchFilters.amenities.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {searchFilters.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#2957c3] text-white"
                        >
                          {amenity}
                          <button
                            type="button"
                            onClick={() => toggleAmenity(amenity)}
                            className="ml-2 hover:text-gray-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Comfort Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Stays?
            </h2>
            <p className="text-xl text-gray-600">
              Every detail crafted for your comfort and convenience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {comfort.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-[#2957c3] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-[#2957c3]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Available Properties
              </h2>
              {pagination.total > 0 && (
                <p className="text-gray-600 mt-1">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} properties
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={searchFilters.sort_by}
                onChange={(e) => {
                  const updatedFilters = { ...searchFilters, sort_by: e.target.value as any };
                  setSearchFilters(updatedFilters);
                  fetchProperties(updatedFilters);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
              >
                <option value="featured">Featured First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-300 h-64 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No properties found matching your criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your search filters or browse all available properties.</p>
              <button
                onClick={clearFilters}
                className="mt-4 bg-[#2957c3] text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNumber = Math.max(1, Math.min(
                    pagination.totalPages - 4,
                    pagination.page - 2
                  )) + i;
                  
                  if (pageNumber > pagination.totalPages) return null;
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        pageNumber === pagination.page
                          ? 'text-white bg-[#2957c3] border border-[#2957c3]'
                          : 'text-gray-700 bg-white border border-gray-300 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
