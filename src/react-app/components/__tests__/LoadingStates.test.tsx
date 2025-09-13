import { describe, it, expect, vi } from 'vitest';
import { 
  LoadingSpinner, 
  LoadingState, 
  Skeleton, 
  EmptyState, 
  NetworkError,
  PropertyCardSkeleton,
  FormFieldSkeleton
} from '../LoadingStates';
import { render, screen } from '../../../test/utils';

describe('LoadingStates', () => {
  describe('LoadingSpinner', () => {
    it('renders with default props', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('renders with different sizes', () => {
      render(<LoadingSpinner size="sm" />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('w-4', 'h-4');
    });

    it('renders with different colors', () => {
      render(<LoadingSpinner color="white" />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('text-white');
    });
  });

  describe('LoadingState', () => {
    it('renders section loading by default', () => {
      render(<LoadingState message="Loading..." />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-section')).toBeInTheDocument();
    });

    it('renders page loading', () => {
      render(<LoadingState type="page" message="Loading page..." />);
      
      expect(screen.getByText('Loading page...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-container')).toBeInTheDocument();
    });

    it('renders overlay loading', () => {
      render(<LoadingState type="overlay" message="Loading overlay..." />);
      
      expect(screen.getByText('Loading overlay...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    });

    it('renders inline loading', () => {
      render(<LoadingState type="inline" message="Loading inline..." />);
      
      expect(screen.getByText('Loading inline...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-inline')).toBeInTheDocument();
    });
  });

  describe('Skeleton', () => {
    it('renders rectangular skeleton by default', () => {
      render(<Skeleton />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('animate-pulse', 'bg-gray-200', 'rounded');
    });

    it('renders text skeleton', () => {
      render(<Skeleton variant="text" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('h-4', 'rounded');
    });

    it('renders circular skeleton', () => {
      render(<Skeleton variant="circular" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('rounded-full');
    });

    it('renders with custom dimensions', () => {
      render(<Skeleton width={100} height={50} />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ width: '100px', height: '50px' });
    });

    it('renders multiline text skeleton', () => {
      render(<Skeleton variant="text" lines={3} />);
      
      // Should have one container with data-testid="skeleton"
      // and three child elements with data-testid="skeleton-line"
      expect(screen.getByTestId('skeleton')).toBeInTheDocument();
      const skeletonLines = screen.getAllByTestId('skeleton-line');
      expect(skeletonLines).toHaveLength(3);
    });
  });

  describe('EmptyState', () => {
    it('renders with title and description', () => {
      render(
        <EmptyState 
          title="No items found"
          description="There are no items to display"
        />
      );
      
      expect(screen.getByText('No items found')).toBeInTheDocument();
      expect(screen.getByText('There are no items to display')).toBeInTheDocument();
    });

    it('renders with icon', () => {
      const TestIcon = () => <div data-testid="test-icon">Icon</div>;
      
      render(
        <EmptyState 
          icon={<TestIcon />}
          title="No items found"
        />
      );
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders with action button', () => {
      const mockAction = { label: 'Create Item', onClick: vi.fn() };
      
      render(
        <EmptyState 
          title="No items found"
          action={mockAction}
        />
      );
      
      const actionButton = screen.getByText('Create Item');
      expect(actionButton).toBeInTheDocument();
      
      actionButton.click();
      expect(mockAction.onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('NetworkError', () => {
    it('renders network error message', () => {
      render(<NetworkError />);
      
      expect(screen.getByText('Connection Problem')).toBeInTheDocument();
      expect(screen.getByText(/internet connection/i)).toBeInTheDocument();
    });

    it('renders retry button when onRetry is provided', () => {
      const mockRetry = vi.fn();
      
      render(<NetworkError onRetry={mockRetry} />);
      
      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toBeInTheDocument();
      
      retryButton.click();
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('does not render retry button when onRetry is not provided', () => {
      render(<NetworkError />);
      
      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });
  });

  describe('PropertyCardSkeleton', () => {
    it('renders property card skeleton', () => {
      render(<PropertyCardSkeleton />);
      
      // Check for the main skeleton container
      expect(screen.getByTestId('property-card-skeleton')).toBeInTheDocument();
      
      // Check that there are elements with animate-pulse class
      const animatedElements = document.querySelectorAll('.animate-pulse');
      expect(animatedElements.length).toBeGreaterThan(0);
    });
  });

  describe('FormFieldSkeleton', () => {
    it('renders form field skeleton', () => {
      render(<FormFieldSkeleton />);
      
      // Check for the main skeleton container
      expect(screen.getByTestId('form-field-skeleton')).toBeInTheDocument();
      
      // Check that there are elements with animate-pulse class
      const animatedElements = document.querySelectorAll('.animate-pulse');
      expect(animatedElements.length).toBeGreaterThanOrEqual(2); // label and input
    });
  });
});