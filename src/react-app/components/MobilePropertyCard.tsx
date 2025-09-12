import { useState } from 'react';
import { Link } from 'react-router';
import { Heart, MapPin, Users, Star, Share2, Eye } from 'lucide-react';
import { responsiveClasses, utils, helpers, spacing, cn } from '../utils/responsive';
import type { Property } from '../../shared/types';

interface MobilePropertyCardProps {
  property: Property;
  onWishlistToggle?: (propertyId: number) => void;
  onShare?: (property: Property) => void;
  isInWishlist?: boolean;
  viewMode?: 'grid' | 'list';
}

export default function MobilePropertyCard({ 
  property, 
  onWishlistToggle, 
  onShare, 
  isInWishlist = false,
  viewMode = 'grid'
}: MobilePropertyCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const images = property.images ? JSON.parse(property.images) : [];
  const amenities = property.amenities ? JSON.parse(property.amenities) : [];
  const mainImage = images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&h=600';

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onWishlistToggle?.(property.id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(property);
  };

  if (viewMode === 'list') {
    return (
      <Link to={`/property/${property.id}`} className="block">
        <div 
          className={cn(
            responsiveClasses.card.base,
            responsiveClasses.touch.press,
            utils.focusVisible,
            'hover:shadow-lg transition-all duration-300'
          )}
          data-testid="mobile-property-card"
        >
          <div className="flex gap-4">
            {/* Image */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 overflow-hidden rounded-lg">
              {!imageLoaded && !imageError && (
                <div className="w-full h-full bg-gray-200 animate-pulse" />
              )}
              <img
                src={mainImage}
                alt={property.title}
                className={cn(
                  'w-full h-full object-cover transition-opacity duration-300',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
              {property.is_featured && (
                <div className="absolute top-1 left-1 bg-[#2957c3] text-white px-1.5 py-0.5 rounded text-xs font-semibold">
                  Featured
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-2">
                <h3 className={cn(
                  responsiveClasses.text.small,
                  'font-semibold text-gray-900 truncate pr-2'
                )}>
                  {property.title}
                </h3>
                <button
                  onClick={handleWishlistClick}
                  className={cn(
                    utils.touchButton,
                    'p-1.5 rounded-full',
                    isInWishlist ? 'text-red-500' : 'text-gray-400'
                  )}
                >
                  <Heart className={cn('w-4 h-4', isInWishlist && 'fill-current')} />
                </button>
              </div>

              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="text-xs truncate">{property.location}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-xs text-gray-600">
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    <span>{property.max_guests}</span>
                  </div>
                  <div className="flex items-center">
                    <Star 
                      className="w-3 h-3 mr-1 text-yellow-400 fill-current" 
                      data-testid="star-icon"
                    />
                    <span>4.8</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#2957c3]">
                    {property.price_per_night} SAR
                  </span>
                  <div className="text-xs text-gray-500">/night</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/property/${property.id}`} className="block">
      <div 
        className={cn(
          responsiveClasses.card.base,
          responsiveClasses.touch.press,
          utils.focusVisible,
          'hover:shadow-lg transition-all duration-300 group'
        )}
        data-testid="mobile-property-card"
      >
        {/* Image */}
        <div className="relative overflow-hidden">
          {!imageLoaded && !imageError && (
            <div className={cn(
              responsiveClasses.card.image,
              'bg-gray-200 animate-pulse'
            )} />
          )}
          <img
            src={mainImage}
            alt={property.title}
            className={cn(
              responsiveClasses.card.image,
              'group-hover:scale-110 transition-transform duration-500',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          
          {/* Overlay actions */}
          <div className="absolute top-3 right-3 flex space-x-2">
            <button
              onClick={handleWishlistClick}
              className={cn(
                utils.touchButton,
                'p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all',
                isInWishlist ? 'text-red-500' : 'text-gray-600'
              )}
            >
              <Heart className={cn('w-4 h-4', isInWishlist && 'fill-current')} />
            </button>
            <button
              onClick={handleShareClick}
              className={cn(
                utils.touchButton,
                'p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all text-gray-600'
              )}
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          
          {/* Featured badge */}
          {property.is_featured && (
            <div className="absolute top-3 left-3 bg-[#2957c3] text-white px-3 py-1 rounded-full text-sm font-semibold">
              Featured
            </div>
          )}
          
          {/* Quick view button - mobile only */}
          <div className={cn(
            'absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity',
            utils.showOnMobile
          )}>
            <button className={cn(
              utils.touchButton,
              'p-2 bg-[#2957c3] text-white rounded-full shadow-lg'
            )}>
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={cn(responsiveClasses.card.padding, responsiveClasses.card.content)}>
          <div className="flex justify-between items-start mb-2">
            <h3 className={cn(
              responsiveClasses.text.small,
              'font-semibold text-gray-900 line-clamp-1 flex-1 pr-2'
            )}>
              {property.title}
            </h3>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Star 
                className="w-4 h-4 text-yellow-400 fill-current" 
                data-testid="star-icon"
              />
              <span className="text-sm font-medium text-gray-700">4.8</span>
            </div>
          </div>

          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className={cn(responsiveClasses.text.small, 'truncate')}>
              {property.location}
            </span>
          </div>

          {property.description && (
            <p className={cn(
              responsiveClasses.text.small,
              'text-gray-600 mb-3 line-clamp-2'
            )}>
              {property.description}
            </p>
          )}

          <div className={cn('flex items-center justify-between mb-3', spacing.sm)}>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{property.max_guests} guests</span>
              </div>
              {property.bedrooms && (
                <span className={utils.hideOnMobile}>
                  {property.bedrooms} bed{property.bedrooms > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Amenities - mobile optimized */}
          {amenities.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {amenities.slice(0, 2).map((amenity: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {amenity}
                  </span>
                ))}
                {amenities.length > 2 && (
                  <span className="text-xs text-gray-500 self-center">
                    +{amenities.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Price and CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline">
              <span className="text-lg sm:text-xl font-bold text-[#2957c3]">
                {property.price_per_night} SAR
              </span>
              <span className="text-gray-600 ml-1 text-sm">/night</span>
            </div>
            <button className={cn(
              utils.touchButton,
              helpers.touchButton('primary'),
              'px-4 py-2 text-sm'
            )}>
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}