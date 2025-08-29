import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@getmocha/users-service/react';

interface WishlistButtonProps {
  propertyId: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled' | 'ghost';
  className?: string;
  showTooltip?: boolean;
}

export default function WishlistButton({ 
  propertyId, 
  size = 'md', 
  variant = 'outline',
  className = '',
  showTooltip = true 
}: WishlistButtonProps) {
  const { user, redirectToLogin } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAnimating, setIsAnimating] = useState(false);

  const isWishlisted = isInWishlist(propertyId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      redirectToLogin();
      return;
    }

    setIsAnimating(true);
    const success = await toggleWishlist(propertyId);
    
    if (success) {
      // Add animation delay
      setTimeout(() => setIsAnimating(false), 300);
    } else {
      setIsAnimating(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 p-1.5';
      case 'lg':
        return 'w-12 h-12 p-3';
      default:
        return 'w-10 h-10 p-2';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-4 h-4';
    }
  };

  const getVariantClasses = () => {
    if (isWishlisted) {
      return 'bg-red-100 text-red-600 border-red-200 hover:bg-red-200';
    }

    switch (variant) {
      case 'filled':
        return 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50';
      case 'ghost':
        return 'bg-transparent text-gray-600 border-transparent hover:bg-white/20';
      default:
        return 'bg-white/80 text-gray-600 border-gray-200 hover:bg-white';
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        className={`
          ${getSizeClasses()}
          ${getVariantClasses()}
          rounded-full border transition-all duration-200 
          flex items-center justify-center
          ${isAnimating ? 'scale-110' : 'scale-100'}
          ${className}
        `}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart 
          className={`
            ${getIconSize()}
            transition-all duration-200
            ${isWishlisted ? 'fill-current text-red-500' : ''}
            ${isAnimating ? 'animate-pulse' : ''}
          `} 
        />
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
            {isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}