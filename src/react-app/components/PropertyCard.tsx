import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Heart, Share2, MapPin, Users, Star } from 'lucide-react';
import { useAuth } from '@getmocha/users-service/react';
import type { Property } from '@/shared/types';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (user) {
      checkWishlistStatus();
    }
  }, [user, property.id]);

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch('/api/wishlist');
      const data = await response.json();
      
      if (data.success) {
        const isInWishlist = data.data.some((item: any) => item.property_id === property.id);
        setIsWishlisted(isInWishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };
  
  const images = property.images ? JSON.parse(property.images) : [];
  const amenities = property.amenities ? JSON.parse(property.amenities) : [];
  const mainImage = images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&h=600';

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      const endpoint = isWishlisted 
        ? `/api/wishlist/${property.id}` 
        : `/api/wishlist/${property.id}`;
      
      const method = isWishlisted ? 'DELETE' : 'POST';
      
      if (!user) {
        // Redirect to login or show message
        return;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsWishlisted(!isWishlisted);
      } else {
        console.error('Failed to update wishlist:', data.error);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description || '',
        url: window.location.origin + `/property/${property.id}`,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin + `/property/${property.id}`);
    }
  };

  return (
    <Link to={`/property/${property.id}`} className="group block">
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={mainImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={handleWishlistToggle}
              className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200 transform hover:scale-110"
            >
              <Heart
                className={`h-5 w-5 ${
                  isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600'
                }`}
              />
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200 transform hover:scale-110"
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
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#2957c3] transition-colors">
              {property.title}
            </h3>
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
            <button className="bg-[#2957c3] text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors transform hover:scale-105">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
