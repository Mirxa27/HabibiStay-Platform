import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { Heart, Share2, MapPin, Users, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import type { Property } from '@/shared/types';

interface WishlistItem {
  id: number;
  property_id: number;
  created_at: string;
  property: Property;
}

export default function WishlistPage() {
  const { user, redirectToLogin } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      redirectToLogin();
      return;
    }
    fetchWishlist();
  }, [user, redirectToLogin]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist');
      const data = await response.json();
      
      if (data.success) {
        setWishlistItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (propertyId: number) => {
    try {
      const response = await fetch(`/api/wishlist/${propertyId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      if (data.success) {
        setWishlistItems(items => items.filter(item => item.property_id !== propertyId));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleShare = (property: Property) => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description || '',
        url: window.location.origin + `/property/${property.id}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/property/${property.id}`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your wishlist.</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-gray-300 rounded-xl"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Wishlist</h1>
          <p className="text-gray-600">
            {wishlistItems.length > 0 
              ? `${wishlistItems.length} saved propert${wishlistItems.length === 1 ? 'y' : 'ies'}`
              : 'Save properties you love to book them later'
            }
          </p>
        </div>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => {
              const property = item.property;
              const images = property.images ? JSON.parse(property.images) : [];
              const amenities = property.amenities ? JSON.parse(property.amenities) : [];
              const mainImage = images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&h=600';

              return (
                <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <Link to={`/property/${property.id}`}>
                      <img
                        src={mainImage}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </Link>
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button
                        onClick={() => removeFromWishlist(property.id)}
                        className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200 transform hover:scale-110"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </button>
                      <button
                        onClick={() => handleShare(property)}
                        className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200 transform hover:scale-110"
                        title="Share property"
                      >
                        <Share2 className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                    {property.is_featured && (
                      <div className="absolute top-4 left-4 bg-[#2957c3] text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <Link 
                        to={`/property/${property.id}`}
                        className="text-xl font-bold text-gray-900 hover:text-[#2957c3] transition-colors"
                      >
                        {property.title}
                      </Link>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-700">4.8</span>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.location}</span>
                    </div>

                    {property.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {property.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{property.max_guests} guests</span>
                        </div>
                        {property.bedrooms && (
                          <span>{property.bedrooms} bed{property.bedrooms > 1 ? 's' : ''}</span>
                        )}
                        {property.bathrooms && (
                          <span>{property.bathrooms} bath{property.bathrooms > 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>

                    {amenities.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {amenities.slice(0, 3).map((amenity: string, index: number) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                            >
                              {amenity}
                            </span>
                          ))}
                          {amenities.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-[#2957c3]">
                          {property.price_per_night} SAR
                        </span>
                        <span className="text-gray-600 text-sm ml-1">/ night</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => removeFromWishlist(property.id)}
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                          Remove
                        </button>
                        <Link
                          to={`/property/${property.id}`}
                          className="bg-[#2957c3] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-gray-500">
                      Added {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start exploring properties and save your favorites by clicking the heart icon on any property you love.
            </p>
            <Link
              to="/stays"
              className="bg-[#2957c3] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
            >
              Explore Properties
            </Link>
          </div>
        )}

        {/* Tips Section */}
        {wishlistItems.length > 0 && (
          <div className="mt-16 bg-blue-50 rounded-xl p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Wishlist Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Heart className="w-8 h-8 text-[#2957c3] mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Save Favorites</h4>
                <p className="text-sm text-gray-600">Keep track of properties you want to book</p>
              </div>
              <div className="text-center">
                <Share2 className="w-8 h-8 text-[#2957c3] mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Share with Friends</h4>
                <p className="text-sm text-gray-600">Get opinions from your travel companions</p>
              </div>
              <div className="text-center">
                <Star className="w-8 h-8 text-[#2957c3] mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Book When Ready</h4>
                <p className="text-sm text-gray-600">Come back anytime to complete your booking</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
