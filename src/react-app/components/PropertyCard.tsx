import React, { useState } from 'react';
import { 
  MapPin, 
  Star, 
  Heart, 
  Users, 
  Bed, 
  Bath, 
  Wifi, 
  Car, 
  Waves, 
  Dumbbell,
  Coffee,
  Utensils,
  Wind,
  Trees,
  Phone,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { Property } from '../../shared/types';
import { responsiveClasses, imageSizes, utils, cn } from '../utils/responsive';
import { clsx } from 'clsx';

interface PropertyCardProps {
  property: Property;
  showWishlist?: boolean;
  isInWishlist?: boolean;
  onAddToWishlist?: (propertyId: number) => void;
  onRemoveFromWishlist?: (propertyId: number) => void;
  onBook?: (propertyId: number) => void;
  onViewDetails?: (propertyId: number) => void;
  onCheckAvailability?: (propertyId: number) => void;
  variant?: 'default' | 'featured' | 'compact' | 'chat';
  className?: string;
}

const amenityIcons: Record<string, React.ComponentType<any>> = {
  wifi: Wifi,
  parking: Car,
  pool: Waves,
  gym: Dumbbell,
  kitchen: Utensils,
  coffee: Coffee,
  air_conditioning: Wind,
  garden: Trees,
  balcony: Trees,
};

export default function PropertyCard({
  property,
  showWishlist = true,
  isInWishlist = false,
  onAddToWishlist,
  onRemoveFromWishlist,
  onBook,
  onViewDetails,
  onCheckAvailability,
  variant = 'default',
  className,
}: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Parse images and amenities from JSON strings if needed
  const images = React.useMemo(() => {
    if (Array.isArray(property.images)) return property.images;
    if (typeof property.images === 'string') {
      try {
        return JSON.parse(property.images) || [];
      } catch {
        return [];
      }
    }
    return [];
  }, [property.images]);

  const amenities = React.useMemo(() => {
    if (Array.isArray(property.amenities)) return property.amenities;
    if (typeof property.amenities === 'string') {
      try {
        return JSON.parse(property.amenities) || [];
      } catch {
        return [];
      }
    }
    return [];
  }, [property.amenities]);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInWishlist && onRemoveFromWishlist) {
      onRemoveFromWishlist(property.id);
    } else if (!isInWishlist && onAddToWishlist) {
      onAddToWishlist(property.id);
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const renderImageGallery = () => {
    if (images.length === 0 || imageError) {
      return (
        <div className={cn(
          'bg-gray-200 flex items-center justify-center text-gray-400',
          variant === 'compact' || variant === 'chat' 
            ? 'h-32 sm:h-36'
            : 'h-48 sm:h-56 md:h-64'
        )}>
          <div className="text-center">
            <Bed className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" />
            <span className="text-xs sm:text-sm">No image available</span>
          </div>
        </div>
      );
    }

    return (
      <div className="relative group">
        <img
          src={images[currentImageIndex]}
          alt={`${property.title} - Image ${currentImageIndex + 1}`}
          className={cn(
            'w-full object-cover transition-all duration-300',
            variant === 'compact' || variant === 'chat' 
              ? 'h-32 sm:h-36'
              : 'h-48 sm:h-56 md:h-64'
          )}
          onError={() => setImageError(true)}
        />
        
        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className={cn(
                utils.touchTarget,
                'absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 sm:p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
              )}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <button
              onClick={nextImage}
              className={cn(
                utils.touchTarget,
                'absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 sm:p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
              )}
              aria-label="Next image"
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            
            {/* Image Indicators */}
            <div className="absolute bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {images.map((_: string, index: number) => (
                <div
                  key={index}
                  className={cn(
                    'w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors',
                    index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  )}
                />
              ))}
            </div>
          </>
        )}

        {/* Wishlist Button */}
        {showWishlist && (
          <button
            onClick={handleWishlistClick}
            className={cn(
              utils.touchTarget,
              'absolute top-1 sm:top-2 right-1 sm:right-2 p-1.5 sm:p-2 bg-white bg-opacity-90 rounded-full shadow-sm hover:bg-opacity-100 transition-all'
            )}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={cn(
                'h-3 w-3 sm:h-4 sm:w-4 transition-colors',
                isInWishlist ? 'text-red-500 fill-current' : 'text-gray-600'
              )}
            />
          </button>
        )}

        {/* Featured Badge */}
        {property.is_featured && (
          <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-[#2957c3] text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-medium">
            Featured
          </div>
        )}
      </div>
    );
  };

  const renderAmenities = () => {
    const maxAmenities = variant === 'compact' || variant === 'chat' ? 3 : 5;
    const displayAmenities = amenities.slice(0, maxAmenities);
    
    return (
      <div className="flex items-center space-x-1 sm:space-x-2 overflow-hidden">
        {displayAmenities.map((amenity: string, index: number) => {
          const IconComponent = amenityIcons[amenity];
          return IconComponent ? (
            <IconComponent 
              key={index} 
              className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" 
              title={amenity.replace('_', ' ')}
            />
          ) : (
            <span key={index} className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded truncate">
              {amenity.replace('_', ' ')}
            </span>
          );
        })}
        {amenities.length > maxAmenities && (
          <span className="text-xs text-gray-400 ml-1">+{amenities.length - maxAmenities}</span>
        )}
      </div>
    );
  };

  const cardClasses = clsx(
    'bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-all duration-200',
    {
      'hover:shadow-md': variant !== 'chat',
      'cursor-pointer': variant !== 'chat',
      'max-w-sm': variant === 'compact',
      'w-full': variant === 'chat',
    },
    className
  );

  return (
    <div className={cardClasses} onClick={() => variant !== 'chat' && onViewDetails?.(property.id)}>
      {/* Image Gallery */}
      {renderImageGallery()}

      {/* Content */}
      <div className={clsx('p-4', variant === 'compact' || variant === 'chat' ? 'space-y-2' : 'space-y-3')}>
        {/* Title and Location */}
        <div>
          <h3 className={clsx(
            'font-semibold text-gray-900 line-clamp-1',
            variant === 'compact' || variant === 'chat' ? 'text-sm' : 'text-base'
          )}>
            {property.title}
          </h3>
          <div className="flex items-center text-gray-600 mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            <span className={clsx(
              'line-clamp-1',
              variant === 'compact' || variant === 'chat' ? 'text-xs' : 'text-sm'
            )}>
              {property.location}
            </span>
          </div>
        </div>

        {/* Property Details */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Bed className="h-3 w-3 mr-1 text-gray-500" />
              <span className="text-xs text-gray-600">{property.bedrooms}</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-3 w-3 mr-1 text-gray-500" />
              <span className="text-xs text-gray-600">{property.bathrooms}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1 text-gray-500" />
              <span className="text-xs text-gray-600">{property.max_guests}</span>
            </div>
          </div>

          {/* Rating */}
          {(property as any).average_rating && (property as any).average_rating > 0 && (
            <div className="flex items-center">
              <Star 
                className="h-3 w-3 text-yellow-400 fill-current mr-1" 
                data-testid="star-icon"
              />
              <span className="text-xs text-gray-600">
                {(property as any).average_rating.toFixed(1)}
                {(property as any).review_count && (property as any).review_count > 0 && (
                  <span className="text-gray-400"> ({(property as any).review_count})</span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {property.description && variant !== 'compact' && variant !== 'chat' && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {property.description}
          </p>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div>
            {renderAmenities()}
          </div>
        )}

        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="text-left">
            <div className="flex items-baseline">
              <span className={clsx(
                'font-semibold text-[#2957c3]',
                variant === 'compact' || variant === 'chat' ? 'text-sm' : 'text-lg'
              )}>
                {property.price_per_night} {(property as any).currency || 'SAR'}
              </span>
              <span className={clsx(
                'text-gray-500 ml-1',
                variant === 'compact' || variant === 'chat' ? 'text-xs' : 'text-sm'
              )}>
                / night
              </span>
            </div>
            {property.price_per_night > 500 && (
              <div className="text-xs text-green-600">Free cancellation</div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-1">
            {variant === 'chat' ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails?.(property.id);
                  }}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-[#2957c3] transition-colors"
                >
                  <Eye className="h-3 w-3" />
                </button>
                {onCheckAvailability && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCheckAvailability(property.id);
                    }}
                    className="px-2 py-1 text-xs text-gray-600 hover:text-[#2957c3] transition-colors"
                  >
                    <Calendar className="h-3 w-3" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBook?.(property.id);
                  }}
                  className="px-3 py-1 text-xs bg-[#2957c3] text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Book
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails?.(property.id);
                  }}
                  className={clsx(
                    'text-gray-600 hover:text-[#2957c3] transition-colors',
                    variant === 'compact' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
                  )}
                >
                  Details
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBook?.(property.id);
                  }}
                  className={clsx(
                    'bg-[#2957c3] text-white rounded hover:bg-blue-700 transition-colors',
                    variant === 'compact' ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'
                  )}
                >
                  Book Now
                </button>
              </>
            )}
          </div>
        </div>

        {/* Quick Contact for Featured Properties */}
        {property.is_featured && variant === 'featured' && (
          <div className="border-t border-gray-100 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Need help? Contact us:</span>
              <div className="flex space-x-2">
                <a
                  href="tel:+966550800669"
                  className="p-1 text-[#2957c3] hover:text-blue-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="h-3 w-3" />
                </a>
                <a
                  href="mailto:info@habibistay.com"
                  className="p-1 text-[#2957c3] hover:text-blue-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Export variants for different use cases
export const FeaturedPropertyCard = (props: Omit<PropertyCardProps, 'variant'>) => (
  <PropertyCard {...props} variant="featured" />
);

export const CompactPropertyCard = (props: Omit<PropertyCardProps, 'variant'>) => (
  <PropertyCard {...props} variant="compact" />
);

export const ChatPropertyCard = (props: Omit<PropertyCardProps, 'variant'>) => (
  <PropertyCard {...props} variant="chat" />
);