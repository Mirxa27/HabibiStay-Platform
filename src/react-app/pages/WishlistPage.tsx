import { useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { Link } from 'react-router';
import { 
  Heart, 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  Star, 
  Eye, 
  Share2,
  Grid3X3,
  List,
  Filter,
  Search,
  Trash2,
  Home
} from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import WishlistButton from '@/components/WishlistButton';

export default function WishlistPage() {
  const { user, redirectToLogin } = useAuth();
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_low' | 'price_high' | 'name'>('newest');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view your wishlist</h2>
          <p className="text-gray-600 mb-6">
            Save properties you love and access them from any device
          </p>
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

  // Filter and sort wishlist
  const filteredWishlist = wishlist
    .filter(item => 
      item.property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.property.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'price_low':
          return a.property.price_per_night - b.property.price_per_night;
        case 'price_high':
          return b.property.price_per_night - a.property.price_per_night;
        case 'name':
          return a.property.title.localeCompare(b.property.title);
        default:
          return 0;
      }
    });

  const handleRemoveFromWishlist = async (propertyId: number) => {
    const success = await removeFromWishlist(propertyId);
    if (!success) {
      alert('Failed to remove from wishlist');
    }
  };

  const handleShare = (property: any) => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this amazing property: ${property.title}`,
        url: `${window.location.origin}/property/${property.id}`
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/property/${property.id}`);
      alert('Property link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
              <p className="text-gray-600">
                {wishlist.length} saved propert{wishlist.length !== 1 ? 'ies' : 'y'}
              </p>
            </div>
            <Link
              to="/properties"
              className="bg-[#2957c3] text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Browse Properties
            </Link>
          </div>
        </div>

        {wishlist.length > 0 ? (
          <>
            {/* Controls */}
            <div className="mb-6 space-y-4">
              {/* Search and Sort */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search saved properties..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                  
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-3 ${viewMode === 'grid' ? 'bg-[#2957c3] text-white' : 'text-gray-600'}`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-3 ${viewMode === 'list' ? 'bg-[#2957c3] text-white' : 'text-gray-600'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Results count */}
              {searchQuery && (
                <p className="text-sm text-gray-600">
                  {filteredWishlist.length} of {wishlist.length} properties match "{searchQuery}"
                </p>
              )}
            </div>

            {/* Wishlist Items */}
            {filteredWishlist.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {filteredWishlist.map((item) => {
                  const property = item.property;
                  const images = property.images ? JSON.parse(property.images) : [];
                  
                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
                        viewMode === 'list' ? 'flex' : 'block'
                      }`}
                    >
                      <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                        <Link to={`/property/${property.id}`}>
                          <img
                            src={images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&h=250'}
                            alt={property.title}
                            className={`object-cover hover:scale-105 transition-transform duration-300 ${
                              viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'
                            }`}
                          />
                        </Link>
                        
                        {/* Wishlist Button */}
                        <div className="absolute top-3 right-3">
                          <WishlistButton 
                            propertyId={property.id} 
                            variant="filled"
                            showTooltip={false}
                          />
                        </div>

                        {/* Featured badge */}
                        {property.is_featured && (
                          <div className="absolute top-3 left-3">
                            <span className="bg-[#2957c3] text-white text-xs px-2 py-1 rounded-full font-medium">
                              Featured
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <Link to={`/property/${property.id}`} className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg hover:text-[#2957c3] transition-colors">
                              {property.title}
                            </h3>
                          </Link>
                        </div>

                        <p className="text-gray-600 text-sm mb-3 flex items-center">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
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
                              {property.bedrooms} bed{property.bedrooms > 1 ? 's' : ''}
                            </span>
                          )}
                          {property.bathrooms && (
                            <span className="flex items-center">
                              <Bath className="w-4 h-4 mr-1" />
                              {property.bathrooms} bath{property.bathrooms > 1 ? 's' : ''}
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
                              {property.price_per_night.toLocaleString()} SAR
                            </p>
                            <p className="text-sm text-gray-600">per night</p>
                          </div>
                        </div>

                        {/* Added date */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            Added {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/property/${property.id}`}
                              className="flex items-center text-[#2957c3] hover:text-blue-700 text-sm font-medium"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Link>
                            <button
                              onClick={() => handleShare(property)}
                              className="flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium"
                            >
                              <Share2 className="w-4 h-4 mr-1" />
                              Share
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveFromWishlist(property.id)}
                            className="flex items-center text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-6">
                  No properties match your search criteria
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#2957c3] font-medium hover:text-blue-700"
                >
                  Clear search
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start exploring amazing properties and save your favorites for later. 
              You can access your wishlist from any device.
            </p>
            <Link
              to="/properties"
              className="bg-[#2957c3] text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Home className="w-5 h-5 mr-2" />
              Discover Properties
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}