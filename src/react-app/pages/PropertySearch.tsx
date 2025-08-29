import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import { 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  Calendar, 
  Star, 
  Heart, 
  Grid3X3, 
  List,
  SlidersHorizontal,
  X,
  DollarSign,
  Home,
  Bed,
  Bath,
  Wifi,
  Car,
  Coffee
} from 'lucide-react';
import type { Property, AdvancedPropertySearch } from '@/shared/types';
import { responsiveClasses, containers, utils, cn } from '../utils/responsive';

const AMENITIES_LIST = [
  'WiFi',
  'Parking',
  'Kitchen',
  'TV',
  'AC',
  'Pool',
  'Gym',
  'Balcony',
  'Garden',
  'Heating'
];

const PROPERTY_TYPES = [
  'Apartment',
  'Villa',
  'Penthouse',
  'Studio',
  'Townhouse',
  'Duplex'
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' }
];

export default function PropertySearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [filters, setFilters] = useState<AdvancedPropertySearch>({
    location: searchParams.get('location') || '',
    check_in: searchParams.get('check_in') || '',
    check_out: searchParams.get('check_out') || '',
    guests: parseInt(searchParams.get('guests') || '1'),
    min_price: parseInt(searchParams.get('min_price') || '0') || undefined,
    max_price: parseInt(searchParams.get('max_price') || '0') || undefined,
    amenities: searchParams.get('amenities')?.split(',').filter(Boolean) || [],
    property_type: searchParams.get('property_type') || '',
    bedrooms: parseInt(searchParams.get('bedrooms') || '0') || undefined,
    bathrooms: parseInt(searchParams.get('bathrooms') || '0') || undefined,
    rating: parseInt(searchParams.get('rating') || '0') || undefined,
    sort_by: (searchParams.get('sort_by') as any) || 'featured',
    page: currentPage,
    limit: 20
  });

  useEffect(() => {
    searchProperties();
  }, [filters, currentPage]);

  const searchProperties = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 0) {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              queryParams.append(key, value.join(','));
            }
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`/api/properties?${queryParams.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setProperties(data.data);
        setTotalResults(data.total || data.data.length);
      }
    } catch (error) {
      console.error('Error searching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<AdvancedPropertySearch>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== 0) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(','));
          }
        } else {
          params.set(key, value.toString());
        }
      }
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    const basicFilters = {
      location: '',
      check_in: '',
      check_out: '',
      guests: 1,
      sort_by: 'featured' as const,
      page: 1,
      limit: 20
    };
    setFilters(basicFilters);
    setSearchParams(new URLSearchParams());
  };

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    
    updateFilters({ amenities: newAmenities });
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} SAR`;
  };

  const hasActiveFilters = () => {
    return !!(
      filters.min_price ||
      filters.max_price ||
      filters.property_type ||
      filters.bedrooms ||
      filters.bathrooms ||
      filters.rating ||
      (filters.amenities && filters.amenities.length > 0)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={cn(containers.page, responsiveClasses.padding.section)}>
        {/* Search Header */}
        <div className="mb-6 sm:mb-8">
          <div className={cn(
            responsiveClasses.card.base,
            responsiveClasses.card.padding
          )}>
            <div className={cn(
              responsiveClasses.form.group,
              "gap-3 sm:gap-4"
            )}>
              <div className={responsiveClasses.form.field}>
                <label className={cn(
                  responsiveClasses.form.label,
                  "text-gray-700 mb-1 sm:mb-2 block"
                )}>
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => updateFilters({ location: e.target.value })}
                    placeholder="Where are you going?"
                    className={cn(
                      responsiveClasses.form.input,
                      "pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                    )}
                  />
                </div>
              </div>
              
              <div className={responsiveClasses.form.field}>
                <label className={cn(
                  responsiveClasses.form.label,
                  "text-gray-700 mb-1 sm:mb-2 block"
                )}>
                  Check-in
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={filters.check_in}
                    onChange={(e) => updateFilters({ check_in: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className={responsiveClasses.form.field}>
                <label className={cn(
                  responsiveClasses.form.label,
                  "text-gray-700 mb-1 sm:mb-2 block"
                )}>
                  Check-out
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={filters.check_out}
                    onChange={(e) => updateFilters({ check_out: e.target.value })}
                    className={cn(
                      responsiveClasses.form.input,
                      "pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                    )}
                  />
                </div>
              </div>
              
              <div className={responsiveClasses.form.field}>
                <label className={cn(
                  responsiveClasses.form.label,
                  "text-gray-700 mb-1 sm:mb-2 block"
                )}>
                  Guests
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={filters.guests}
                    onChange={(e) => updateFilters({ guests: parseInt(e.target.value) })}
                    className={cn(
                      responsiveClasses.form.input,
                      "pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                    )}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>
                        {num} guest{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Results Header */}
        <div className={cn(
          responsiveClasses.flex.columnToRow,
          "justify-between items-start md:items-center gap-4 mb-6"
        )}>
          <div className={cn(
            responsiveClasses.flex.wrap,
            "items-center gap-2 sm:gap-4"
          )}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center rounded-lg border transition-colors",
                responsiveClasses.button.secondary,
                utils.touchTarget,
                showFilters || hasActiveFilters()
                  ? 'border-[#2957c3] bg-blue-50 text-[#2957c3]'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              )}
            >
              <SlidersHorizontal className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className={responsiveClasses.text.small}>Filters</span>
              {hasActiveFilters() && (
                <span className="ml-1 sm:ml-2 bg-[#2957c3] text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  !
                </span>
              )}
            </button>
            
            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className={cn(
                  responsiveClasses.text.small,
                  "text-gray-600 hover:text-gray-800",
                  utils.touchTarget
                )}
              >
                Clear all
              </button>
            )}
            
            <span className={cn(
              responsiveClasses.text.small,
              "text-gray-600"
            )}>
              {totalResults} properties found
            </span>
          </div>
          
          <div className={cn(
            responsiveClasses.flex.wrap,
            "items-center gap-2 sm:gap-4"
          )}>
            <select
              value={filters.sort_by}
              onChange={(e) => updateFilters({ sort_by: e.target.value as any })}
              className={cn(
                responsiveClasses.form.input,
                "border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent min-w-0"
              )}
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <div className={cn(
              "flex items-center border border-gray-300 rounded-lg",
              utils.hideOnMobile
            )}>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 sm:p-2",
                  utils.touchTarget,
                  viewMode === 'grid' ? 'bg-[#2957c3] text-white' : 'text-gray-600'
                )}
              >
                <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 sm:p-2",
                  utils.touchTarget,
                  viewMode === 'list' ? 'bg-[#2957c3] text-white' : 'text-gray-600'
                )}
              >
                <List className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-sm sticky top-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Price per night</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        placeholder="Min price"
                        value={filters.min_price || ''}
                        onChange={(e) => updateFilters({ min_price: parseInt(e.target.value) || undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Max price"
                        value={filters.max_price || ''}
                        onChange={(e) => updateFilters({ max_price: parseInt(e.target.value) || undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Property type</h4>
                  <select
                    value={filters.property_type || ''}
                    onChange={(e) => updateFilters({ property_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                  >
                    <option value="">Any type</option>
                    {PROPERTY_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Bedrooms & Bathrooms */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Bedrooms</h4>
                    <select
                      value={filters.bedrooms || ''}
                      onChange={(e) => updateFilters({ bedrooms: parseInt(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                    >
                      <option value="">Any</option>
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num}+</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Bathrooms</h4>
                    <select
                      value={filters.bathrooms || ''}
                      onChange={(e) => updateFilters({ bathrooms: parseInt(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                    >
                      <option value="">Any</option>
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num}+</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Minimum rating</h4>
                  <div className="flex space-x-2">
                    {[3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => updateFilters({ rating: filters.rating === rating ? undefined : rating })}
                        className={`flex items-center px-3 py-2 border rounded-lg text-sm transition-colors ${
                          filters.rating === rating
                            ? 'border-[#2957c3] bg-blue-50 text-[#2957c3]'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                        {rating}+
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Amenities</h4>
                  <div className="space-y-2">
                    {AMENITIES_LIST.map(amenity => (
                      <label key={amenity} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.amenities?.includes(amenity) || false}
                          onChange={() => toggleAmenity(amenity)}
                          className="rounded border-gray-300 text-[#2957c3] focus:ring-[#2957c3]"
                        />
                        <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {properties.map((property) => (
                  <Link
                    key={property.id}
                    to={`/property/${property.id}`}
                    className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
                      viewMode === 'list' ? 'flex' : 'block'
                    }`}
                  >
                    <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}>
                      <img
                        src={(property.images ? JSON.parse(property.images)[0] : null) || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&h=250'}
                        alt={property.title}
                        className={viewMode === 'list' ? 'w-full h-full object-cover' : 'w-full h-48 object-cover'}
                      />
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">{property.title}</h3>
                        <button className="text-gray-400 hover:text-red-500">
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-gray-600 text-sm mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {property.location}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {property.max_guests} guests
                        </span>
                        {property.bedrooms && (
                          <span className="flex items-center">
                            <Bed className="w-4 h-4 mr-1" />
                            {property.bedrooms} bed
                          </span>
                        )}
                        {property.bathrooms && (
                          <span className="flex items-center">
                            <Bath className="w-4 h-4 mr-1" />
                            {property.bathrooms} bath
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">4.8</span>
                          <span className="text-sm text-gray-600">(24 reviews)</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#2957c3]">
                            {formatPrice(property.price_per_night)}
                          </p>
                          <p className="text-sm text-gray-600">per night</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
                <button
                  onClick={clearFilters}
                  className="bg-[#2957c3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {properties.length > 0 && totalResults > 20 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {currentPage} of {Math.ceil(totalResults / 20)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage >= Math.ceil(totalResults / 20)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}