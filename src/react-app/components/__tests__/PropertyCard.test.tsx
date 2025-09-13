import { describe, it, expect } from 'vitest';
import PropertyCard from '../PropertyCard';
import type { Property } from '@/shared/types';
import { render, screen } from '../../../test/utils';

describe('PropertyCard', () => {
  const mockProperty: Property = {
    id: 1,
    user_id: 'user_123',
    title: 'Luxury Villa in Riyadh',
    description: 'Beautiful luxury villa with modern amenities',
    location: 'Riyadh, Saudi Arabia',
    price_per_night: 500,
    max_guests: 6,
    bedrooms: 4,
    bathrooms: 3,
    average_rating: 4.8,
    amenities: JSON.stringify(['WiFi', 'Pool', 'Kitchen']),
    images: JSON.stringify(['https://example.com/image1.jpg']),
    is_featured: true,
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  };

  it('renders property information correctly', () => {
    render(<PropertyCard property={mockProperty} />);
    
    // Check title
    expect(screen.getByText('Luxury Villa in Riyadh')).toBeInTheDocument();
    
    // Check location
    expect(screen.getByText('Riyadh, Saudi Arabia')).toBeInTheDocument();
    
    // Check price
    expect(screen.getByText('500 SAR')).toBeInTheDocument();
    
    // Check guests
    expect(screen.getByText('6')).toBeInTheDocument();
    
    // Check bedrooms and bathrooms
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Check rating
    expect(screen.getByText('4.8')).toBeInTheDocument();
  });

  it('renders amenities correctly', () => {
    render(<PropertyCard property={mockProperty} />);
    
    // Check that amenities are displayed
    expect(screen.getByText('WiFi')).toBeInTheDocument();
    expect(screen.getByText('Pool')).toBeInTheDocument();
    expect(screen.getByText('Kitchen')).toBeInTheDocument();
  });

  it('handles missing amenities gracefully', () => {
    const propertyWithoutAmenities = {
      ...mockProperty,
      amenities: null
    };
    
    render(<PropertyCard property={propertyWithoutAmenities} />);
    
    // Should not crash and should not display amenities section
    expect(screen.getByText('Luxury Villa in Riyadh')).toBeInTheDocument();
  });

  it('handles missing images gracefully', () => {
    const propertyWithoutImages = {
      ...mockProperty,
      images: null
    };
    
    render(<PropertyCard property={propertyWithoutImages} />);
    
    // Should not crash and should display placeholder
    expect(screen.getByText('Luxury Villa in Riyadh')).toBeInTheDocument();
  });

  it('displays "Featured" badge for featured properties', () => {
    render(<PropertyCard property={mockProperty} />);
    
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('does not display "Featured" badge for non-featured properties', () => {
    const nonFeaturedProperty = {
      ...mockProperty,
      is_featured: false
    };
    
    render(<PropertyCard property={nonFeaturedProperty} />);
    
    expect(screen.queryByText('Featured')).not.toBeInTheDocument();
  });

  it('handles undefined average rating', () => {
    const propertyWithoutRating = {
      ...mockProperty,
      average_rating: null
    };
    
    render(<PropertyCard property={propertyWithoutRating} />);
    
    // Should not crash and should not display rating
    expect(screen.getByText('Luxury Villa in Riyadh')).toBeInTheDocument();
  });
});