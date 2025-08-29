import { useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { Star, X, MessageSquare, CheckCircle } from 'lucide-react';
import type { CreateReview } from '@/shared/types';

interface ReviewFormProps {
  propertyId: number;
  propertyTitle: string;
  bookingId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RATING_CATEGORIES = [
  { key: 'cleanliness', label: 'Cleanliness', description: 'How clean was the property?' },
  { key: 'communication', label: 'Communication', description: 'How was the host communication?' },
  { key: 'location', label: 'Location', description: 'How was the location?' },
  { key: 'value', label: 'Value', description: 'How was the overall value?' },
];

export default function ReviewForm({ 
  propertyId, 
  propertyTitle, 
  bookingId,
  onSuccess,
  onCancel 
}: ReviewFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [review, setReview] = useState<CreateReview & {
    cleanliness_rating?: number;
    communication_rating?: number;
    location_rating?: number;
    value_rating?: number;
  }>({
    property_id: propertyId,
    booking_id: bookingId,
    rating: 0,
    comment: '',
    cleanliness_rating: 0,
    communication_rating: 0,
    location_rating: 0,
    value_rating: 0,
  });

  const handleRatingChange = (category: string, rating: number) => {
    setReview(prev => ({ ...prev, [category]: rating }));
    
    // Update overall rating as average
    const ratings = RATING_CATEGORIES.map(cat => 
      cat.key === category ? rating : (review[cat.key as keyof typeof review] as number) || 0
    );
    const validRatings = ratings.filter(r => r > 0);
    const averageRating = validRatings.length > 0 
      ? Math.round(validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length)
      : rating;
    
    setReview(prev => ({ ...prev, rating: averageRating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please sign in to submit a review');
      return;
    }

    if (review.rating === 0) {
      alert('Please provide an overall rating');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });

      const data = await response.json();
      
      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      } else {
        alert(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ 
    rating, 
    onRatingChange, 
    size = 'md' 
  }: { 
    rating: number; 
    onRatingChange: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
  }) => {
    const [hoverRating, setHoverRating] = useState(0);
    
    const getStarSize = () => {
      switch (size) {
        case 'sm': return 'w-4 h-4';
        case 'lg': return 'w-8 h-8';
        default: return 'w-6 h-6';
      }
    };

    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-colors duration-200"
          >
            <Star
              className={`${getStarSize()} ${
                star <= (hoverRating || rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Review Submitted!</h3>
        <p className="text-gray-600 mb-6">
          Thank you for sharing your experience. Your review helps other guests make informed decisions.
        </p>
        {onSuccess && (
          <button
            onClick={onSuccess}
            className="bg-[#2957c3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
            <p className="text-gray-600">{propertyTitle}</p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Overall Rating */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Rating</h3>
            <p className="text-gray-600 mb-4">How would you rate your overall experience?</p>
            <div className="flex justify-center mb-4">
              <StarRating
                rating={review.rating}
                onRatingChange={(rating) => setReview(prev => ({ ...prev, rating }))}
                size="lg"
              />
            </div>
            {review.rating > 0 && (
              <p className="text-sm text-gray-600">
                {review.rating === 1 && 'Poor'}
                {review.rating === 2 && 'Fair'}
                {review.rating === 3 && 'Good'}
                {review.rating === 4 && 'Very Good'}
                {review.rating === 5 && 'Excellent'}
              </p>
            )}
          </div>

          {/* Category Ratings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {RATING_CATEGORIES.map((category) => (
                <div key={category.key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{category.label}</h4>
                    <StarRating
                      rating={review[category.key as keyof typeof review] as number || 0}
                      onRatingChange={(rating) => handleRatingChange(`${category.key}_rating`, rating)}
                    />
                  </div>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Written Review */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-2">
              Share Your Experience
            </label>
            <p className="text-gray-600 mb-4">
              Tell other guests about your stay. What did you love? What could be improved?
            </p>
            <textarea
              rows={6}
              value={review.comment}
              onChange={(e) => setReview(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Describe your experience at this property..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent resize-none"
            />
            <div className="flex justify-between mt-2">
              <p className="text-sm text-gray-500">
                Minimum 10 characters recommended
              </p>
              <p className="text-sm text-gray-500">
                {review.comment.length}/1000 characters
              </p>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Review Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be honest and fair in your review</li>
              <li>• Focus on your personal experience</li>
              <li>• Avoid discriminatory or offensive language</li>
              <li>• Reviews are public and help other guests</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading || review.rating === 0}
              className="flex-1 bg-[#2957c3] text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <MessageSquare className="w-5 h-5 mr-2" />
              )}
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}