import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { responsiveClasses, utils, cn } from '../utils/responsive';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'primary' | 'white' | 'gray';
}

export function LoadingSpinner({ 
  size = 'md', 
  className = '',
  color = 'primary'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-[#2957c3]',
    white: 'text-white',
    gray: 'text-gray-400'
  };

  return (
    <Loader2 
      className={cn(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )} 
      data-testid="loading-spinner"
    />
  );
}

interface LoadingStateProps {
  type?: 'page' | 'section' | 'inline' | 'overlay';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingState({ 
  type = 'section',
  message = 'Loading...',
  size = 'md',
  className = ''
}: LoadingStateProps) {
  const baseClasses = 'flex flex-col items-center justify-center text-center';

  if (type === 'page') {
    return (
      <div 
        className={cn(
          'min-h-screen bg-gray-50',
          baseClasses,
          className
        )}
        data-testid="loading-container"
      >
        <LoadingSpinner size="xl" />
        <p className={cn(
          responsiveClasses.text.body,
          'text-gray-600 mt-4'
        )}>
          {message}
        </p>
      </div>
    );
  }

  if (type === 'overlay') {
    return (
      <div 
        className={cn(
          'fixed inset-0 bg-black/50 z-50',
          baseClasses,
          className
        )}
        data-testid="loading-overlay"
      >
        <div className="bg-white rounded-lg p-8 shadow-xl">
          <LoadingSpinner size="lg" />
          <p className={cn(
            responsiveClasses.text.body,
            'text-gray-600 mt-4'
          )}>
            {message}
          </p>
        </div>
      </div>
    );
  }

  if (type === 'inline') {
    return (
      <div 
        className={cn('flex items-center gap-2', className)}
        data-testid="loading-inline"
      >
        <LoadingSpinner size={size === 'lg' ? 'md' : 'sm'} />
        <span className={cn(
          responsiveClasses.text.small,
          'text-gray-600'
        )}>
          {message}
        </span>
      </div>
    );
  }

  // Section loading
  return (
    <div 
      className={cn(
        'py-12',
        baseClasses,
        className
      )}
      data-testid="loading-section"
    >
      <LoadingSpinner size={size === 'lg' ? 'xl' : 'lg'} />
      <p className={cn(
        responsiveClasses.text.body,
        'text-gray-600 mt-4'
      )}>
        {message}
      </p>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ 
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded'
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)} data-testid="skeleton">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(baseClasses, variantClasses.text)}
            style={{ width: index === lines - 1 ? '75%' : '100%' }}
            data-testid="skeleton-line"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
      data-testid="skeleton"
    />
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={cn(
      'text-center py-12',
      className
    )}>
      {icon && (
        <div className="mb-4 flex justify-center">
          {icon}
        </div>
      )}
      <h3 className={cn(
        responsiveClasses.text.h4,
        'text-gray-900 mb-2'
      )}>
        {title}
      </h3>
      {description && (
        <p className={cn(
          responsiveClasses.text.body,
          'text-gray-600 mb-6 max-w-sm mx-auto'
        )}>
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            utils.touchButton,
            utils.focusVisible,
            'bg-[#2957c3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors'
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

interface NetworkErrorProps {
  onRetry?: () => void;
  className?: string;
}

export function NetworkError({ onRetry, className = '' }: NetworkErrorProps) {
  return (
    <div className={cn(
      'text-center py-8',
      className
    )}>
      <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className={cn(
        responsiveClasses.text.h4,
        'text-gray-900 mb-2'
      )}>
        Connection Problem
      </h3>
      <p className={cn(
        responsiveClasses.text.body,
        'text-gray-600 mb-6'
      )}>
        Please check your internet connection and try again.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            utils.touchButton,
            utils.focusVisible,
            'bg-[#2957c3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center'
          )}
        >
          <Wifi className="w-4 h-4 mr-2" />
          Try Again
        </button>
      )}
    </div>
  );
}

// Property card skeleton for consistent loading states
export function PropertyCardSkeleton() {
  return (
    <div 
      className={cn(
        responsiveClasses.card.base,
        responsiveClasses.card.padding
      )}
      data-testid="property-card-skeleton"
    >
      <Skeleton 
        variant="rectangular" 
        className="w-full h-48 sm:h-56 md:h-64 mb-4" 
      />
      <div className="space-y-3">
        <Skeleton variant="text" width="75%" />
        <Skeleton variant="text" width="50%" />
        <div className="flex justify-between items-center">
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="rectangular" width={80} height={32} />
        </div>
      </div>
    </div>
  );
}

// Form field skeleton
export function FormFieldSkeleton() {
  return (
    <div 
      className="space-y-2"
      data-testid="form-field-skeleton"
    >
      <Skeleton variant="text" width="25%" height={16} />
      <Skeleton variant="rectangular" className="w-full h-10" />
    </div>
  );
}