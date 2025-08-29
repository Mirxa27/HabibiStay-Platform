import { useState, useEffect } from 'react';
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
import type { Property, Review, CreateBooking } from '@/shared/types';

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

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [property, setProperty] = useState<PropertyDetailData | null>(null);
  const [loading, setLoading] = useState(true);
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
      const response = await fetch(`/api/properties/${id}`);
      const data = await response.json();
      
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
      console.error('Error fetching property details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch('/api/wishlist');
      const data = await response.json();
      
      if (data.success) {
        const isInWishlist = data.data.some((item: any) => item.property_id === parseInt(id || '0'));
        setIsWishlisted(isInWishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      alert('Please sign in to add to wishlist');
      return;
    }

    try {
      const method = isWishlisted ? 'DELETE' : 'POST';
      const response = await fetch(`/api/wishlist/${id}`, { method });
      
      if (response.ok) {
        setIsWishlisted(!isWishlisted);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      alert('Please sign in to make a booking');
      return;
    }

    setBookingLoading(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Booking request submitted successfully!');
        setShowBookingForm(false);
      } else {
        alert(data.error || 'Failed to submit booking');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Failed to submit booking');
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-gray-300 rounded-xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
              <div className="h-96 bg-gray-300 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
          <Link
            to="/properties"
            className="bg-[#2957c3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse Properties
          </Link>
        </div>
      </div>
    );
  }

  const images = property.images ? JSON.parse(property.images) : [];
  const amenities = property.amenities ? JSON.parse(property.amenities) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/properties" className="hover:text-[#2957c3]">Properties</Link>
            <span>/</span>
            <span className="text-gray-900">{property.title}</span>
          </div>
        </nav>

        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative rounded-xl overflow-hidden">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-96 object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-sm"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-sm"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {images.map((_: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No images available</span>
              </div>
            )}
          </div>
          
          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex space-x-2 mt-4 overflow-x-auto">
              {images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    index === currentImageIndex ? 'border-[#2957c3]' : 'border-transparent'
                  }`}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{property.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                      <span>{property.avg_rating || 0} ({property.review_count || 0} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleWishlist}
                    className={`p-2 rounded-full ${isWishlisted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Property specs */}
              <div className="flex items-center space-x-6 text-gray-600">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{property.max_guests} guests</span>
                </div>
                {property.bedrooms && (
                  <div className="flex items-center">
                    <Bed className="w-4 h-4 mr-1" />
                    <span>{property.bedrooms} bedrooms</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center">
                    <Bath className="w-4 h-4 mr-1" />
                    <span>{property.bathrooms} bathrooms</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">About this place</h2>
              <p className="text-gray-700 leading-relaxed">
                {property.description || "Experience luxury and comfort in this beautiful property located in the heart of Riyadh. Perfect for both business and leisure travelers, this accommodation offers modern amenities and exceptional service."}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenities.map((amenity: string, index: number) => {
                  const IconComponent = AMENITY_ICONS[amenity as keyof typeof AMENITY_ICONS] || Shield;
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <IconComponent className="w-5 h-5 text-[#2957c3]" />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Host Information */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Meet your host</h2>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-[#2957c3] rounded-full flex items-center justify-center">
                  {property.host_avatar ? (
                    <img
                      src={property.host_avatar}
                      alt={property.host_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-lg">
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
                              {review.reviewer_name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{review.reviewer_name || 'Anonymous'}</span>
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