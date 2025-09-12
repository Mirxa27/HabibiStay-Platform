import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';
import { 
  Heart, 
  Share2, 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  Wifi, 
  Car, 
  Coffee, 
  Tv, 
  Star,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CreditCard,
  Shield,
  Award,
  MessageSquare,
  Phone,
  Mail
} from 'lucide-react';
import type { Property, Review, CreateBooking } from '../../shared/types';
import { responsiveClasses, containers, imageSizes, utils, cn } from '../utils/responsive';
import { LoadingState, NetworkError, Skeleton } from '../components/LoadingStates';
import { apiRequest, useApiErrorHandler } from '../utils/errorHandling';

interface PropertyDetailData extends Property {
  reviews: Review[];
  host_name: string;
  host_email: string;
  host_phone?: string;
  host_avatar?: string;
  avg_rating: number;
  review_count: number;
}

const AMENITY_ICONS = {
  'WiFi': Wifi,
  'Parking': Car,
  'Kitchen': Coffee,
  'TV': Tv,
  'AC': Shield,
  'Pool': Shield,
  'Gym': Award,
  'Balcony': Shield,
  'Garden': Shield,
  'Heating': Shield,
};

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { handleApiError } = useApiErrorHandler();
  const [property, setProperty] = useState<PropertyDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [booking, setBooking] = useState<CreateBooking>({
    property_id: parseInt(id || '0'),
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in_date: '',
    check_out_date: '',
    total_guests: 1,
    special_requests: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
      if (user) {
        checkWishlistStatus();
      }
    }
  }, [id, user]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest(`/api/properties/${id}`);
      
      if (data.success) {
        setProperty(data.data);
        setBooking(prev => ({
          ...prev,
          property_id: data.data.id,
          guest_name: user?.google_user_data?.name || '',
          guest_email: user?.email || ''
        }));
      }
    } catch (error) {
      handleApiError(error, 'fetchPropertyDetails');
      setError('Failed to load property details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const data = await apiRequest('/api/wishlist');
      
      if (data.success) {
        const isInWishlist = data.data.some((item: any) => item.property_id === parseInt(id || '0'));
        setIsWishlisted(isInWishlist);
      }
    } catch (error) {
      handleApiError(error, 'checkWishlistStatus');
      // Silently fail for wishlist status - not critical
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      alert('Please sign in to add to wishlist');
      return;
    }

    try {
      const method = isWishlisted ? 'DELETE' : 'POST';
      await apiRequest(`/api/wishlist/${id}`, { method });
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      handleApiError(error, 'toggleWishlist');
      alert('Failed to update wishlist. Please try again.');
    }
  };

  const handleBooking = async () => {
    if (!user) {
      alert('Please sign in to make a booking');
      return;
    }

    setBookingLoading(true);
    try {
      const data = await apiRequest('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(booking),
      });
      
      if (data.success) {
        alert('Booking request submitted successfully!');
        setShowBookingForm(false);
      } else {
        alert(data.error || 'Failed to submit booking');
      }
    } catch (error) {
      handleApiError(error, 'handleBooking');
      alert('Failed to submit booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateNights = () => {
    if (booking.check_in_date && booking.check_out_date) {
      const checkIn = new Date(booking.check_in_date);
      const checkOut = new Date(booking.check_out_date);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const totalAmount = calculateNights() * (property?.price_per_night || 0);
  const serviceFee = totalAmount * 0.1;
  const taxes = totalAmount * 0.15;
  const finalTotal = totalAmount + serviceFee + taxes;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className={containers.page}>
          <div className={cn(
            "space-y-4 sm:space-y-6",
            responsiveClasses.padding.section
          )}>
            <Skeleton variant="rectangular" className="h-64 sm:h-80 md:h-96 rounded-xl" />
            <div className={cn(
              "grid grid-cols-1 lg:grid-cols-3",
              "gap-4 sm:gap-6 lg:gap-8"
            )}>
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <Skeleton variant="text" width="75%" height={32} />
                <Skeleton variant="text" width="50%" height={16} />
                <Skeleton variant="rectangular" className="h-24 sm:h-32 rounded" />
                <div className="space-y-2">
                  <Skeleton variant="text" lines={3} />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton variant="rectangular" className="h-64 sm:h-80 md:h-96 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className={containers.page}>
          <div className={responsiveClasses.padding.section}>
            <NetworkError 
              onRetry={fetchPropertyDetails}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className={containers.page}>
          <div className={responsiveClasses.padding.section}>
            <NetworkError 
              onRetry={fetchPropertyDetails}
            />
          </div>
        </div>
      </div>
    );
  }


  const images = property.images ? JSON.parse(property.images) : [];
  const amenities = property.amenities ? JSON.parse(property.amenities) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={containers.page}>
        {/* Breadcrumb */}
        <nav className={cn("mb-4 sm:mb-6", responsiveClasses.padding.page)}>
          <div className={cn(
            "flex items-center space-x-2",
            responsiveClasses.text.small,
            "text-gray-600"
          )}>
            <Link to="/properties" className="hover:text-[#2957c3]">Properties</Link>
            <span>/</span>
            <span className="text-gray-900">{property.title}</span>
          </div>
        </nav>

        {/* Image Gallery */}
        <div className={cn("mb-6 sm:mb-8", responsiveClasses.padding.page)}>
          <div className="relative rounded-xl overflow-hidden">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={property.title}
                  className={cn(
                    "w-full object-cover",
                    "h-48 sm:h-64 md:h-80 lg:h-96"
                  )}
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                      className={cn(
                        "absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-sm",
                        utils.touchTarget
                      )}
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                      className={cn(
                        "absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-sm",
                        utils.touchTarget
                      )}
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2">
                      {images.map((_: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={cn(
                            "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors",
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className={cn(
                "w-full bg-gray-200 flex items-center justify-center text-gray-500",
                "h-48 sm:h-64 md:h-80 lg:h-96"
              )}>
                <span className={responsiveClasses.text.small}>No images available</span>
              </div>
            )}
          </div>
          
          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex space-x-1 sm:space-x-2 mt-3 sm:mt-4 overflow-x-auto scrollbar-hide">
              {images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors",
                    "w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20",
                    index === currentImageIndex ? 'border-[#2957c3]' : 'border-transparent'
                  )}
                >
                  <img
                    src={image}
                    alt={`${property.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={cn(
          "grid grid-cols-1 lg:grid-cols-3",
          "gap-6 sm:gap-8",
          responsiveClasses.padding.page
        )}>
          {/* Property Details */}
          <div className={cn(
            "lg:col-span-2 space-y-6 sm:space-y-8"
          )}>
            {/* Header */}
            <div>
              <div className={cn(
                "flex flex-col sm:flex-row items-start justify-between mb-3 sm:mb-4",
                "space-y-3 sm:space-y-0"
              )}>
                <div className="flex-1">
                  <h1 className={cn(
                    responsiveClasses.text.h2,
                    "text-gray-900 mb-2"
                  )}>{property.title}</h1>
                  <div className={cn(
                    "flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-gray-600",
                    responsiveClasses.text.small
                  )}>
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span>{property.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-yellow-400 fill-current" />
                      <span>{property.avg_rating || 0} ({property.review_count || 0} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleWishlist}
                    className={cn(
                      utils.touchTarget,
                      "p-2 rounded-full transition-colors",
                      isWishlisted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600',
                      "hover:bg-opacity-80"
                    )}
                  >
                    <Heart className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5",
                      isWishlisted ? 'fill-current' : ''
                    )} />
                  </button>
                  <button className={cn(
                    utils.touchTarget,
                    "p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  )}>
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Property specs */}
              <div className={cn(
                "flex flex-wrap items-center gap-3 sm:gap-6 text-gray-600",
                responsiveClasses.text.small
              )}>
                <div className="flex items-center">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span>{property.max_guests} guests</span>
                </div>
                {property.bedrooms && (
                  <div className="flex items-center">
                    <Bed className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span>{property.bedrooms} bedrooms</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center">
                    <Bath className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span>{property.bathrooms} bathrooms</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className={cn(
                responsiveClasses.text.h3,
                "text-gray-900 mb-3 sm:mb-4"
              )}>About this place</h2>
              <p className={cn(
                responsiveClasses.text.body,
                "text-gray-700 leading-relaxed"
              )}>
                {property.description || "Experience luxury and comfort in this beautiful property located in the heart of Riyadh. Perfect for both business and leisure travelers, this accommodation offers modern amenities and exceptional service."}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className={cn(
                responsiveClasses.text.h3,
                "text-gray-900 mb-3 sm:mb-4"
              )}>Amenities</h2>
              <div className={cn(
                "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
                "gap-3 sm:gap-4"
              )}>
                {amenities.map((amenity: string, index: number) => {
                  const IconComponent = AMENITY_ICONS[amenity as keyof typeof AMENITY_ICONS] || Shield;
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-[#2957c3]" />
                      <span className={cn(
                        responsiveClasses.text.small,
                        "text-gray-700"
                      )}>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Host Information */}
            <div className={cn(
              responsiveClasses.card.base,
              responsiveClasses.card.padding
            )}>
              <h2 className={cn(
                responsiveClasses.text.h3,
                "text-gray-900 mb-3 sm:mb-4"
              )}>Meet your host</h2>
              <div className={cn(
                "flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4"
              )}>
                <div className={cn(
                  "w-12 h-12 sm:w-16 sm:h-16 bg-[#2957c3] rounded-full flex items-center justify-center flex-shrink-0"
                )}>
                  {property.host_avatar ? (
                    <img
                      src={property.host_avatar}
                      alt={property.host_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className={cn(
                      "text-white font-semibold",
                      "text-sm sm:text-lg"
                    )}>
                      {property.host_name?.charAt(0) || 'H'}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{property.host_name || 'Host'}</h3>
                  <p className="text-gray-600">Superhost · Hosting since 2023</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <button className="flex items-center text-[#2957c3] hover:text-blue-700">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Contact host
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Reviews ({property.review_count || 0})
              </h2>
              {property.reviews && property.reviews.length > 0 ? (
                <div className="space-y-4">
                  {property.reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="bg-white p-4 rounded-xl shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-[#2957c3] rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {(review as any).reviewer_name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{(review as any).reviewer_name || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                  {property.reviews.length > 3 && (
                    <button className="text-[#2957c3] font-medium hover:text-blue-700">
                      Show all {property.reviews.length} reviews
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8">
              <div className="mb-6">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{property.price_per_night} SAR</span>
                    <span className="text-gray-600"> / night</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                    <span>{property.avg_rating || 0}</span>
                  </div>
                </div>
              </div>

              {!showBookingForm ? (
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="w-full bg-[#2957c3] text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Reserve
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={booking.check_in_date}
                      onChange={(e) => setBooking(prev => ({ ...prev, check_in_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={booking.check_out_date}
                      onChange={(e) => setBooking(prev => ({ ...prev, check_out_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guests
                    </label>
                    <select
                      value={booking.total_guests}
                      onChange={(e) => setBooking(prev => ({ ...prev, total_guests: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                    >
                      {[...Array(property.max_guests)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} guest{i > 0 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {booking.check_in_date && booking.check_out_date && (
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{property.price_per_night} SAR × {calculateNights()} nights</span>
                        <span>{totalAmount.toLocaleString()} SAR</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Service fee</span>
                        <span>{serviceFee.toLocaleString()} SAR</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Taxes</span>
                        <span>{taxes.toLocaleString()} SAR</span>
                      </div>
                      <div className="flex justify-between font-semibold text-gray-900 border-t pt-2">
                        <span>Total</span>
                        <span>{finalTotal.toLocaleString()} SAR</span>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowBookingForm(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBooking}
                      disabled={bookingLoading || !booking.check_in_date || !booking.check_out_date}
                      className="flex-1 bg-[#2957c3] text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {bookingLoading ? 'Booking...' : 'Book Now'}
                    </button>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-4 text-center">
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}