import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Calendar, Users, Star, Home, Bath, Bed, X } from 'lucide-react';
import type { Property, AdvancedPropertySearch } from '../../shared/types';
import PropertyCard from '../components/PropertyCard';
import { LoadingState, PropertyCardSkeleton, EmptyState, NetworkError } from '../components/LoadingStates';
import { useAsync, usePagination } from '../hooks/useAsync';
import { apiRequest } from '../utils/errorHandling';
import { responsiveClasses, containers, utils, cn } from '../utils/responsive';

export default function StaysPage() {
  const [showFilters, setShowFilters] = useState(false);
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

  // Use the pagination hook for loading properties
  const {
    data: properties,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    refreshing
  } = usePagination<Property>(
    async (page: number, limit: number) => {
      const params = new URLSearchParams();
      const filters = { ...searchFilters, page, limit };
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await apiRequest<{
        success: boolean;
        data: Property[];
        pagination: { total: number; hasMore: boolean };
      }>(`/api/properties?${params.toString()}`);
      
      if (response.success) {
        return {
          data: response.data,
          total: response.pagination.total,
          hasMore: response.pagination.hasMore
        };
      }
      
      throw new Error('Failed to fetch properties');
    },
    {
      pageSize: 20,
      onDataLoad: (data, page) => {
        console.log(`Loaded ${data.length} properties for page ${page}`);
      }
    }
  );

  const availableAmenities = [
    'WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'TV', 'Balcony',
    'Pool', 'Gym', 'Elevator', 'Security', 'Laundry', 'Garden',
    'BBQ Area', 'Terrace', 'Fireplace', 'Hot Tub'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refresh(); // Refresh with current filters
  };

  const handleFilterChange = (key: keyof AdvancedPropertySearch, value: any) => {
    setSearchFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = searchFilters.amenities || [];
    const updatedAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    
    handleFilterChange('amenities', updatedAmenities);
  };

  const clearFilters = () => {
    setSearchFilters({
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
    refresh();
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
      <section className={cn(
        "bg-[#2957c3] text-white",
        "py-12 sm:py-16 md:py-20"
      )}>
        <div className={containers.page}>
          <div className={cn(
            "text-center mb-8 sm:mb-12",
            responsiveClasses.padding.page
          )}>
            <h1 className={cn(
              responsiveClasses.text.h1,
              "mb-3 sm:mb-4"
            )}>
              Your Perfect Riyadh Stay
            </h1>
            <p className={cn(
              "text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto",
              responsiveClasses.text.body
            )}>
              Discover exceptional accommodations that combine luxury, comfort, and authentic Saudi hospitality
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className={cn(
            responsiveClasses.card.base,
            "bg-white rounded-xl shadow-lg",
            responsiveClasses.card.padding
          )}>
            <div className={cn(
              "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
              "gap-3 sm:gap-4"
            )}>
              <div>
                <label className={cn(
                  "block font-medium text-gray-700 mb-1 sm:mb-2",
                  responsiveClasses.text.small
                )}>
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-2 sm:left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchFilters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="Enter location..."
                    className={cn(
                      "w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent",
                      responsiveClasses.text.small
                    )}
                  />
                </div>
              </div>

              <div>
                <label className={cn(
                  "block font-medium text-gray-700 mb-1 sm:mb-2",
                  responsiveClasses.text.small
                )}>
                  Check-in
                </label>
                <input
                  type="date"
                  value={searchFilters.check_in}
                  onChange={(e) => handleFilterChange('check_in', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={cn(
                    "w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent",
                    responsiveClasses.text.small
                  )}
                />
              </div>

              <div>
                <label className={cn(
                  "block font-medium text-gray-700 mb-1 sm:mb-2",
                  responsiveClasses.text.small
                )}>
                  Check-out
                </label>
                <input
                  type="date"
                  value={searchFilters.check_out}
                  onChange={(e) => handleFilterChange('check_out', e.target.value)}
                  min={searchFilters.check_in || new Date().toISOString().split('T')[0]}
                  className={cn(
                    "w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent",
                    responsiveClasses.text.small
                  )}
                />
              </div>

              <div>
                <label className={cn(
                  "block font-medium text-gray-700 mb-1 sm:mb-2",
                  responsiveClasses.text.small
                )}>
                  Guests
                </label>
                <select
                  value={searchFilters.guests}
                  onChange={(e) => handleFilterChange('guests', parseInt(e.target.value))}
                  className={cn(
                    "w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent",
                    responsiveClasses.text.small
                  )}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={cn(
              "mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center items-center",
              "space-y-2 sm:space-y-0 sm:space-x-4"
            )}>
              <button
                type="submit"
                className={cn(
                  "bg-[#2957c3] text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center",
                  responsiveClasses.button.primary,
                  utils.touchTarget
                )}
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Search Properties
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors inline-flex items-center",
                  responsiveClasses.button.primary,
                  utils.touchTarget
                )}
              >
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
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
              {properties.length > 0 && (
                <p className="text-gray-600 mt-1">
                  {refreshing ? 'Refreshing...' : `Showing ${properties.length} properties`}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={searchFilters.sort_by}
                onChange={(e) => {
                  handleFilterChange('sort_by', e.target.value);
                  refresh();
                }}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent disabled:opacity-50"
              >
                <option value="featured">Featured First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <NetworkError 
              onRetry={refresh}
              className="mb-8"
            />
          )}

          {/* Loading State */}
          {loading && properties.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Properties Grid */}
          {!loading && !error && properties.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
              
              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-12">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className={cn(
                      utils.touchButton,
                      utils.focusVisible,
                      'bg-[#2957c3] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center',
                      loading && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      'Load More Properties'
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && !error && properties.length === 0 && (
            <EmptyState
              icon={<Home className="w-16 h-16 text-gray-400" />}
              title="No properties found"
              description="No properties match your current search criteria. Try adjusting your filters or browse all available properties."
              action={{
                label: 'Clear Filters',
                onClick: clearFilters
              }}
            />
          )}
        </div>
      </section>
    </div>
  );
}
