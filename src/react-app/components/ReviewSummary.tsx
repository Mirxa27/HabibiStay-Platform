import { Star, TrendingUp } from 'lucide-react';

interface ReviewSummaryProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  categoryRatings?: {
    cleanliness: number;
    communication: number;
    location: number;
    value: number;
  };
}

export default function ReviewSummary({ 
  averageRating, 
  totalReviews, 
  ratingDistribution,
  categoryRatings 
}: ReviewSummaryProps) {
  const getRatingPercentage = (rating: number) => {
    if (totalReviews === 0) return 0;
    return (ratingDistribution[rating as keyof typeof ratingDistribution] / totalReviews) * 100;
  };

  const StarRating = ({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) => {
    const getStarSize = () => {
      switch (size) {
        case 'sm': return 'w-4 h-4';
        case 'lg': return 'w-8 h-8';
        default: return 'w-5 h-5';
      }
    };

    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${getStarSize()} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (totalReviews === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="text-center py-8">
          <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600">
            This property hasn't received any reviews yet. Be the first to share your experience!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Overall Rating */}
        <div className="text-center">
          <div className="mb-4">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={Math.round(averageRating)} size="lg" />
            <p className="text-gray-600 mt-2">
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center justify-center text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">Excellent rating</span>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 mb-4">Rating Breakdown</h4>
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 w-12">
                <span className="text-sm text-gray-600">{rating}</span>
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
              </div>
              
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getRatingPercentage(rating)}%` }}
                ></div>
              </div>
              
              <span className="text-sm text-gray-600 w-12 text-right">
                {ratingDistribution[rating as keyof typeof ratingDistribution] || 0}
              </span>
            </div>
          ))}
        </div>

        {/* Category Ratings */}
        {categoryRatings && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 mb-4">Category Ratings</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cleanliness</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#2957c3] h-2 rounded-full"
                      style={{ width: `${(categoryRatings.cleanliness / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8">
                    {categoryRatings.cleanliness.toFixed(1)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Communication</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#2957c3] h-2 rounded-full"
                      style={{ width: `${(categoryRatings.communication / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8">
                    {categoryRatings.communication.toFixed(1)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Location</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#2957c3] h-2 rounded-full"
                      style={{ width: `${(categoryRatings.location / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8">
                    {categoryRatings.location.toFixed(1)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Value</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#2957c3] h-2 rounded-full"
                      style={{ width: `${(categoryRatings.value / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8">
                    {categoryRatings.value.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Highlights */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4">What guests love</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-700">
                {Math.round((categoryRatings?.cleanliness || averageRating) * 20)}%
              </div>
              <div className="text-sm text-green-600">Mention cleanliness</div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-700">
                {Math.round((categoryRatings?.location || averageRating) * 20)}%
              </div>
              <div className="text-sm text-blue-600">Love the location</div>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-700">
                {Math.round((categoryRatings?.communication || averageRating) * 20)}%
              </div>
              <div className="text-sm text-purple-600">Great host communication</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}