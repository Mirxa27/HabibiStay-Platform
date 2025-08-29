import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Heart, Share2, MapPin, Users, Bed, Bath, Wifi, Car, Coffee, Tv, ArrowLeft, Star, Calendar } from 'lucide-react';
import { useChat } from '@/react-app/contexts/ChatContext';
import BookingModal from '@/react-app/components/BookingModal';
import ReviewModal from '@/react-app/components/ReviewModal';
import type { Property } from '@/shared/types';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { openChat } = useChat();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState({ avgRating: 4.8, totalReviews: 127 });
  

  useEffect(() => {
    if (id) {
      fetchProperty(id);
      fetchReviews(id);
    }
  }, [id]);

  const fetchProperty = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      const data = await response.json();
      if (data.success) {
        setProperty(data.data);
        if (data.data.reviews) {
          setReviews(data.data.reviews);
          // Calculate review stats
          const avgRating = data.data.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / data.data.reviews.length;
          setReviewStats({
            avgRating: Math.round(avgRating * 10) / 10,
            totalReviews: data.data.reviews.length
          });
        }
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/reviews/${propertyId}`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.data);
        // Calculate review stats
        if (data.data.length > 0) {
          const avgRating = data.data.reduce((sum: number, review: any) => sum + review.rating, 0) / data.data.length;
          setReviewStats({
            avgRating: Math.round(avgRating * 10) / 10,
            totalReviews: data.data.length
          });
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    // TODO: Implement wishlist API call
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: property?.description || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleBookNow = () => {
    setShowBookingModal(true);
  };

  const handleChatBooking = () => {
    openChat();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-gray-300 rounded-xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
              <div className="h-64 bg-gray-300 rounded-xl"></div>
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
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/stays"
            className="bg-[#2957c3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse Other Properties
          </Link>
        </div>
      </div>
    );
  }

  const images = property.images ? JSON.parse(property.images) : [];
  const amenities = property.amenities ? JSON.parse(property.amenities) : [];
  const allImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&h=600',
    'https://images.unsplash.com/photo-1560448204-e1a3ecbdd6cc?auto=format&fit=crop&w=800&h=600',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&h=600',
  ];

  const amenityIcons: { [key: string]: any } = {
    'WiFi': Wifi,
    'Parking': Car,
    'Kitchen': Coffee,
    'TV': Tv,
    'Air Conditioning': Coffee,
    'Heating': Coffee,
    'Gym': Users,
    'Pool': Users,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/stays"
          className="inline-flex items-center text-gray-600 hover:text-[#2957c3] mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Properties
        </Link>

        {/* Image Gallery */}
        <div className="relative h-96 rounded-xl overflow-hidden mb-8">
          <img
            src={allImages[currentImageIndex]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={handleWishlistToggle}
              className="p-3 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200 transform hover:scale-110"
            >
              <Heart
                className={`h-6 w-6 ${
                  isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600'
                }`}
              />
            </button>
            <button
              onClick={handleShare}
              className="p-3 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200 transform hover:scale-110"
            >
              <Share2 className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          {property.is_featured && (
            <div className="absolute top-4 left-4 bg-[#2957c3] text-white px-4 py-2 rounded-full font-semibold">
              Featured Property
            </div>
          )}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {allImages.map((_: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="text-lg">{property.location}</span>
                  </div>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-gray-600 ml-2">(4.8) • 127 reviews</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6 mb-8 text-gray-600">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span>{property.max_guests} guests</span>
                </div>
                {property.bedrooms && (
                  <div className="flex items-center">
                    <Bed className="h-5 w-5 mr-2" />
                    <span>{property.bedrooms} bedroom{property.bedrooms > 1 ? 's' : ''}</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center">
                    <Bath className="h-5 w-5 mr-2" />
                    <span>{property.bathrooms} bathroom{property.bathrooms > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              {property.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About this place</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {property.description}
                  </p>
                </div>
              )}

              {amenities.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amenities.map((amenity: string, index: number) => {
                      const IconComponent = amenityIcons[amenity] || Coffee;
                      return (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <IconComponent className="h-5 w-5 text-[#2957c3]" />
                          <span className="text-gray-700">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-lg sticky top-8">
              <div className="mb-6">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-[#2957c3]">
                    {property.price_per_night} SAR
                  </span>
                  <span className="text-gray-600">/ night</span>
                </div>
                <div className="flex items-center mt-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-700 ml-1">{reviewStats.avgRating}</span>
                  <span className="text-sm text-gray-500 ml-1">• {reviewStats.totalReviews} reviews</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-2">
                  <div className="border border-gray-300 rounded-lg p-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Check-in
                    </label>
                    <input
                      type="date"
                      className="w-full text-sm focus:outline-none"
                    />
                  </div>
                  <div className="border border-gray-300 rounded-lg p-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Check-out
                    </label>
                    <input
                      type="date"
                      className="w-full text-sm focus:outline-none"
                    />
                  </div>
                </div>
                <div className="border border-gray-300 rounded-lg p-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Guests
                  </label>
                  <select className="w-full text-sm focus:outline-none">
                    {[...Array(property.max_guests)].map((_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1} guest{i > 0 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleBookNow}
                  className="w-full bg-[#2957c3] text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Calendar className="inline h-5 w-5 mr-2" />
                  Book Now
                </button>

                <button
                  onClick={handleChatBooking}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Chat with Sara
                </button>
              </div>

              <div className="text-center mt-3">
                <p className="text-sm text-gray-600">
                  Instant booking or get help from our AI assistant
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-600">3 nights</span>
                  <span className="text-gray-900">{property.price_per_night * 3} SAR</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-600">Service fee</span>
                  <span className="text-gray-900">125 SAR</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-4">
                  <span className="text-gray-600">Taxes</span>
                  <span className="text-gray-900">89 SAR</span>
                </div>
                <div className="flex justify-between items-center font-semibold text-gray-900 text-lg">
                  <span>Total</span>
                  <span>{property.price_per_night * 3 + 125 + 89} SAR</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 bg-white rounded-xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Guest Reviews</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-semibold text-gray-900 ml-1">{reviewStats.avgRating}</span>
                <span className="text-gray-600 ml-1">• {reviewStats.totalReviews} reviews</span>
              </div>
              <button
                onClick={() => setShowReviewModal(true)}
                className="bg-[#2957c3] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Write Review
              </button>
            </div>
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reviews.slice(0, 6).map((review, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      {review.reviewer_avatar ? (
                        <img 
                          src={review.reviewer_avatar} 
                          alt={review.reviewer_name || 'Anonymous'} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[#2957c3] rounded-full flex items-center justify-center text-white font-semibold">
                          {(review.reviewer_name || 'A').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="font-semibold text-gray-900">{review.reviewer_name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-600">{new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No reviews yet</p>
              <p className="text-gray-400 mb-4">Be the first to share your experience!</p>
              <button
                onClick={() => setShowReviewModal(true)}
                className="bg-[#2957c3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Write First Review
              </button>
            </div>
          )}

          {reviews.length > 6 && (
            <div className="text-center mt-6">
              <button className="text-[#2957c3] hover:text-blue-700 font-medium">
                Show All {reviewStats.totalReviews} Reviews →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {property && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          property={property}
        />
      )}

      {/* Review Modal */}
      {property && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          property={property}
          onReviewSubmitted={() => {
            fetchReviews(property.id.toString());
          }}
        />
      )}
    </div>
  );
}
