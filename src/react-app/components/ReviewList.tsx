import { useState, useEffect } from 'react';
import { Star, ThumbsUp, Flag, User, Calendar, MoreHorizontal } from 'lucide-react';
import type { Review } from '@/shared/types';

interface ReviewListProps {
  propertyId: number;
  averageRating?: number;
  totalReviews?: number;
  showWriteReview?: boolean;
  onWriteReviewClick?: () => void;
}

interface ReviewWithUser extends Review {
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
  cleanliness_rating?: number;
  communication_rating?: number;
  location_rating?: number;
  value_rating?: number;
  helpful_count?: number;
}

const REVIEW_FILTERS = [
  { value: 'all', label: 'All reviews' },
  { value: '5', label: '5 stars' },
  { value: '4', label: '4 stars' },
  { value: '3', label: '3 stars' },
  { value: '2', label: '2 stars' },
  { value: '1', label: '1 star' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Most recent' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'highest', label: 'Highest rated' },
  { value: 'lowest', label: 'Lowest rated' },
  { value: 'helpful', label: 'Most helpful' },
];

export default function ReviewList({ 
  propertyId, 
  averageRating = 0, 
  totalReviews = 0,
  showWriteReview = true,
  onWriteReviewClick 
}: ReviewListProps) {
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [propertyId, filter, sortBy]);

  const fetchReviews = async (pageNum = 1) => {
    setLoading(pageNum === 1);
    
    try {
      const params = new URLSearchParams({
        property_id: propertyId.toString(),
        page: pageNum.toString(),
        limit: '10',
        sort_by: sortBy,
        ...(filter !== 'all' && { rating: filter })
      });

      const response = await fetch(`/api/reviews?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        if (pageNum === 1) {
          setReviews(data.data || []);
        } else {
          setReviews(prev => [...prev, ...(data.data || [])]);
        }
        setHasMore(data.data?.length === 10);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleHelpful = async (reviewId: number) => {
    try {
      await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
      });
      // Refresh reviews to show updated helpful count
      fetchReviews();
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) => {
    const starSize = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
    
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Reviews ({totalReviews})
          </h3>
          {averageRating > 0 && (
            <div className="flex items-center space-x-2">
              <StarRating rating={Math.round(averageRating)} size="md" />
              <span className="font-medium text-gray-900">
                {averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        
        {showWriteReview && (
          <button
            onClick={onWriteReviewClick}
            className="bg-[#2957c3] text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-wrap gap-2">
          {REVIEW_FILTERS.map((filterOption) => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                filter === filterOption.value
                  ? 'border-[#2957c3] bg-blue-50 text-[#2957c3]'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {review.user?.avatar ? (
                    <img
                      src={review.user.avatar}
                      alt={review.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {review.user?.name || 'Anonymous'}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <StarRating rating={review.rating} />
                    <span className="text-sm text-gray-500 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Review Content */}
            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            </div>

            {/* Category Ratings */}
            {(review.cleanliness_rating || review.communication_rating || 
              review.location_rating || review.value_rating) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                {review.cleanliness_rating && (
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-700">Cleanliness</div>
                    <div className="text-lg font-semibold text-[#2957c3]">
                      {review.cleanliness_rating}/5
                    </div>
                  </div>
                )}
                {review.communication_rating && (
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-700">Communication</div>
                    <div className="text-lg font-semibold text-[#2957c3]">
                      {review.communication_rating}/5
                    </div>
                  </div>
                )}
                {review.location_rating && (
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-700">Location</div>
                    <div className="text-lg font-semibold text-[#2957c3]">
                      {review.location_rating}/5
                    </div>
                  </div>
                )}
                {review.value_rating && (
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-700">Value</div>
                    <div className="text-lg font-semibold text-[#2957c3]">
                      {review.value_rating}/5
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleHelpful(review.id)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Helpful ({review.helpful_count || 0})</span>
              </button>
              
              <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                <Flag className="w-4 h-4" />
                <span>Report</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && !loading && (
        <div className="text-center">
          <button
            onClick={loadMore}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Load More Reviews
          </button>
        </div>
      )}

      {/* No Reviews */}
      {reviews.length === 0 && !loading && (
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600 mb-6">
            Be the first to share your experience with this property!
          </p>
          {showWriteReview && (
            <button
              onClick={onWriteReviewClick}
              className="bg-[#2957c3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Write the First Review
            </button>
          )}
        </div>
      )}
    </div>
  );
}