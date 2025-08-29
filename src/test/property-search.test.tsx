// Property search functionality tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockFetch, mockApiResponse, createMockProperty } from '@test/utils';
import Stays from '@/react-app/pages/Stays';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

describe('Property Search', () => {
  const user = userEvent.setup();
  
  const mockProperties = [
    createMockProperty({
      id: 1,
      title: 'Luxury Downtown Apartment',
      location: 'Riyadh, Saudi Arabia',
      price_per_night: 250,
      max_guests: 4,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ['wifi', 'parking', 'pool'],
      rating: 4.8,
      review_count: 24,
    }),
    createMockProperty({
      id: 2,
      title: 'Modern Villa',
      location: 'Jeddah, Saudi Arabia',
      price_per_night: 400,
      max_guests: 6,
      bedrooms: 3,
      bathrooms: 3,
      amenities: ['wifi', 'pool', 'gym'],
      rating: 4.9,
      review_count: 18,
    }),
    createMockProperty({
      id: 3,
      title: 'Cozy Studio',
      location: 'Dammam, Saudi Arabia',
      price_per_night: 150,
      max_guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ['wifi'],
      rating: 4.5,
      review_count: 12,
    }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch(mockApiResponse({
      properties: mockProperties,
      total: mockProperties.length,
      page: 1,
      limit: 20,
    }));
  });

  it('should render search form with all filters', async () => {
    renderWithProviders(<Stays />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholder('Where do you want to stay?')).toBeInTheDocument();
      expect(screen.getByText('Check-in')).toBeInTheDocument();
      expect(screen.getByText('Check-out')).toBeInTheDocument();
      expect(screen.getByText('Guests')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
    });
  });

  it('should display properties after search', async () => {
    renderWithProviders(<Stays />);
    
    await waitFor(() => {
      expect(screen.getByText('Luxury Downtown Apartment')).toBeInTheDocument();
      expect(screen.getByText('Modern Villa')).toBeInTheDocument();
      expect(screen.getByText('Cozy Studio')).toBeInTheDocument();
    });
  });

  it('should filter properties by location', async () => {
    renderWithProviders(<Stays />);
    
    const locationInput = screen.getByPlaceholder('Where do you want to stay?');
    const searchButton = screen.getByText('Search');
    
    await user.type(locationInput, 'Riyadh');
    await user.click(searchButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('location=Riyadh'),
        expect.any(Object)
      );
    });
  });

  it('should filter properties by date range', async () => {
    renderWithProviders(<Stays />);
    
    const checkinInput = screen.getByLabelText('Check-in');
    const checkoutInput = screen.getByLabelText('Check-out');
    const searchButton = screen.getByText('Search');
    
    await user.type(checkinInput, '2024-12-01');
    await user.type(checkoutInput, '2024-12-05');
    await user.click(searchButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('check_in=2024-12-01'),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('check_out=2024-12-05'),
        expect.any(Object)
      );
    });
  });

  it('should filter properties by guest count', async () => {
    renderWithProviders(<Stays />);
    
    const guestSelect = screen.getByDisplayValue('2 guests');
    const searchButton = screen.getByText('Search');
    
    await user.selectOptions(guestSelect, '4');
    await user.click(searchButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('guests=4'),
        expect.any(Object)
      );
    });
  });

  it('should show advanced filters when toggle is clicked', async () => {
    renderWithProviders(<Stays />);
    
    const filtersToggle = screen.getByText('Filters');
    await user.click(filtersToggle);
    
    expect(screen.getByText('Price Range')).toBeInTheDocument();
    expect(screen.getByText('Property Type')).toBeInTheDocument();
    expect(screen.getByText('Amenities')).toBeInTheDocument();
    expect(screen.getByText('Bedrooms')).toBeInTheDocument();
    expect(screen.getByText('Bathrooms')).toBeInTheDocument();
  });

  it('should filter by price range', async () => {
    renderWithProviders(<Stays />);
    
    const filtersToggle = screen.getByText('Filters');
    await user.click(filtersToggle);
    
    const minPriceInput = screen.getByLabelText('Min Price');
    const maxPriceInput = screen.getByLabelText('Max Price');
    const searchButton = screen.getByText('Search');
    
    await user.type(minPriceInput, '200');
    await user.type(maxPriceInput, '300');
    await user.click(searchButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('min_price=200'),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('max_price=300'),
        expect.any(Object)
      );
    });
  });

  it('should filter by property type', async () => {
    renderWithProviders(<Stays />);
    
    const filtersToggle = screen.getByText('Filters');
    await user.click(filtersToggle);
    
    const apartmentCheckbox = screen.getByLabelText('Apartment');
    const searchButton = screen.getByText('Search');
    
    await user.click(apartmentCheckbox);
    await user.click(searchButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('property_type=apartment'),
        expect.any(Object)
      );
    });
  });

  it('should filter by amenities', async () => {
    renderWithProviders(<Stays />);
    
    const filtersToggle = screen.getByText('Filters');
    await user.click(filtersToggle);
    
    const wifiCheckbox = screen.getByLabelText('WiFi');
    const poolCheckbox = screen.getByLabelText('Pool');
    const searchButton = screen.getByText('Search');
    
    await user.click(wifiCheckbox);
    await user.click(poolCheckbox);
    await user.click(searchButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('amenities=wifi,pool'),
        expect.any(Object)
      );
    });
  });

  it('should sort properties correctly', async () => {
    renderWithProviders(<Stays />);
    
    const sortSelect = screen.getByDisplayValue('Recommended');
    await user.selectOptions(sortSelect, 'price_asc');
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('sort_by=price_asc'),
        expect.any(Object)
      );
    });
  });

  it('should display property cards with correct information', async () => {
    renderWithProviders(<Stays />);
    
    await waitFor(() => {
      // Check first property
      expect(screen.getByText('Luxury Downtown Apartment')).toBeInTheDocument();
      expect(screen.getByText('SAR 250')).toBeInTheDocument();
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('(24 reviews)')).toBeInTheDocument();
      expect(screen.getByText('4 guests')).toBeInTheDocument();
      expect(screen.getByText('2 bedrooms')).toBeInTheDocument();
      expect(screen.getByText('2 bathrooms')).toBeInTheDocument();
    });
  });

  it('should handle property card interactions', async () => {
    renderWithProviders(<Stays />);
    
    await waitFor(() => {
      const propertyCard = screen.getByText('Luxury Downtown Apartment').closest('.property-card');
      expect(propertyCard).toBeInTheDocument();
    });
    
    const viewButton = screen.getByText('View Details');
    await user.click(viewButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/property/1');
  });

  it('should handle wishlist toggle', async () => {
    mockFetch(mockApiResponse({ success: true, message: 'Added to wishlist' }));
    
    renderWithProviders(<Stays />);
    
    await waitFor(() => {
      const wishlistButton = screen.getAllByLabelText('Add to wishlist')[0];
      return user.click(wishlistButton);
    });
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/wishlist/1',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('should handle pagination', async () => {
    const propertiesWithPagination = {
      properties: mockProperties,
      total: 50,
      page: 1,
      limit: 20,
      totalPages: 3,
    };
    
    mockFetch(mockApiResponse(propertiesWithPagination));
    
    renderWithProviders(<Stays />);
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
    
    const nextPageButton = screen.getByText('2');
    await user.click(nextPageButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      );
    });
  });

  it('should show no results message when no properties found', async () => {
    mockFetch(mockApiResponse({
      properties: [],
      total: 0,
      page: 1,
      limit: 20,
    }));
    
    renderWithProviders(<Stays />);
    
    await waitFor(() => {
      expect(screen.getByText('No properties found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search filters')).toBeInTheDocument();
    });
  });

  it('should handle loading state', () => {
    // Mock pending fetch
    mockFetch(new Promise(() => {})); // Never resolves
    
    renderWithProviders(<Stays />);
    
    expect(screen.getByText('Searching properties...')).toBeInTheDocument();
  });

  it('should handle error state', async () => {
    mockFetch(mockApiResponse({ error: 'Failed to fetch properties' }, false), false, 500);
    
    renderWithProviders(<Stays />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading properties')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should clear filters when clear button is clicked', async () => {
    renderWithProviders(<Stays />);
    
    const filtersToggle = screen.getByText('Filters');
    await user.click(filtersToggle);
    
    const minPriceInput = screen.getByLabelText('Min Price');
    await user.type(minPriceInput, '200');
    
    const clearButton = screen.getByText('Clear Filters');
    await user.click(clearButton);
    
    expect(minPriceInput).toHaveValue('');
  });

  it('should validate date inputs', async () => {
    renderWithProviders(<Stays />);
    
    const checkinInput = screen.getByLabelText('Check-in');
    const checkoutInput = screen.getByLabelText('Check-out');
    
    // Try to set checkout before checkin
    await user.type(checkinInput, '2024-12-05');
    await user.type(checkoutInput, '2024-12-01');
    
    expect(screen.getByText('Check-out date must be after check-in date')).toBeInTheDocument();
  });

  it('should be responsive on mobile devices', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    renderWithProviders(<Stays />);
    
    expect(screen.getByText('Filters')).toBeInTheDocument();
    
    // On mobile, filters should be in a modal/drawer
    const filtersToggle = screen.getByText('Filters');
    expect(filtersToggle).toHaveClass('mobile-filters-toggle');
  });

  it('should update URL with search parameters', async () => {
    const mockSetSearchParams = vi.fn();
    vi.mocked(require('react-router-dom').useSearchParams).mockReturnValue([
      new URLSearchParams(),
      mockSetSearchParams,
    ]);
    
    renderWithProviders(<Stays />);
    
    const locationInput = screen.getByPlaceholder('Where do you want to stay?');
    const searchButton = screen.getByText('Search');
    
    await user.type(locationInput, 'Riyadh');
    await user.click(searchButton);
    
    expect(mockSetSearchParams).toHaveBeenCalledWith(
      expect.objectContaining({
        location: 'Riyadh',
      })
    );
  });

  it('should restore search state from URL parameters', () => {
    const searchParams = new URLSearchParams({
      location: 'Riyadh',
      guests: '4',
      min_price: '200',
      max_price: '500',
    });
    
    vi.mocked(require('react-router-dom').useSearchParams).mockReturnValue([
      searchParams,
      vi.fn(),
    ]);
    
    renderWithProviders(<Stays />);
    
    expect(screen.getByDisplayValue('Riyadh')).toBeInTheDocument();
    expect(screen.getByDisplayValue('4 guests')).toBeInTheDocument();
  });
});