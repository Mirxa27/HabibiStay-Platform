// End-to-end tests for critical user flows

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  renderWithProviders, 
  mockFetch, 
  mockApiResponse, 
  createMockProperty, 
  createMockUser,
  createMockBooking
} from '@test/utils';
import App from '@/react-app/App';

// Mock react-router-dom for navigation testing
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

describe('End-to-End User Flows', () => {
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
      images: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ],
    }),
    createMockProperty({
      id: 2,
      title: 'Modern Beach Villa',
      location: 'Jeddah, Saudi Arabia',
      price_per_night: 400,
      max_guests: 6,
      bedrooms: 3,
      bathrooms: 3,
      amenities: ['wifi', 'pool', 'gym', 'beach_access'],
      rating: 4.9,
      review_count: 18,
    }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock default API responses
    mockFetch(mockApiResponse({ properties: mockProperties, total: mockProperties.length }));
  });

  describe('Guest User Flow - Property Search and Booking', () => {
    it('should complete full guest booking flow', async () => {
      // Mock API responses for the complete flow
      mockFetch(mockApiResponse({ properties: mockProperties, total: 2 }));
      
      renderWithProviders(<App />, { 
        initialEntries: ['/'],
        user: null // Guest user
      });

      // 1. User lands on homepage
      await waitFor(() => {
        expect(screen.getByText('Find Your Perfect Stay in Saudi Arabia')).toBeInTheDocument();
      });

      // 2. User searches for properties
      const searchInput = screen.getByPlaceholder('Where do you want to stay?');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await user.type(searchInput, 'Riyadh');
      await user.click(searchButton);

      // Should navigate to stays page
      expect(mockNavigate).toHaveBeenCalledWith('/stays?location=Riyadh');

      // 3. Mock stays page with search results
      mockFetch(mockApiResponse({ properties: [mockProperties[0]], total: 1 }));
      
      // Re-render with stays page
      renderWithProviders(<App />, { 
        initialEntries: ['/stays?location=Riyadh'],
        user: null
      });

      await waitFor(() => {
        expect(screen.getByText('Luxury Downtown Apartment')).toBeInTheDocument();
      });

      // 4. User clicks on property to view details
      const propertyCard = screen.getByText('Luxury Downtown Apartment').closest('.property-card');
      const viewButton = within(propertyCard!).getByText('View Details');
      
      await user.click(viewButton);
      expect(mockNavigate).toHaveBeenCalledWith('/property/1');

      // 5. Mock property detail page
      mockFetch(mockApiResponse({
        ...mockProperties[0],
        reviews: [
          { id: 1, rating: 5, comment: 'Amazing place!', user_name: 'John D.' },
          { id: 2, rating: 4, comment: 'Great location', user_name: 'Sarah M.' },
        ]
      }));

      renderWithProviders(<App />, { 
        initialEntries: ['/property/1'],
        user: null
      });

      await waitFor(() => {
        expect(screen.getByText('Luxury Downtown Apartment')).toBeInTheDocument();
        expect(screen.getByText('SAR 250 / night')).toBeInTheDocument();
        expect(screen.getByText('Book Now')).toBeInTheDocument();
      });

      // 6. User initiates booking
      const bookButton = screen.getByText('Book Now');
      await user.click(bookButton);

      // Should open booking modal
      await waitFor(() => {
        expect(screen.getByText('Book Your Stay')).toBeInTheDocument();
      });

      // 7. User fills booking form
      await user.type(screen.getByLabelText('Check-in Date'), '2024-12-01');
      await user.type(screen.getByLabelText('Check-out Date'), '2024-12-05');
      await user.selectOptions(screen.getByLabelText('Number of Guests'), '2');
      await user.type(screen.getByLabelText('Guest Name'), 'John Doe');
      await user.type(screen.getByLabelText('Email'), 'john@example.com');
      await user.type(screen.getByLabelText('Phone'), '+966501234567');

      // 8. User submits booking
      mockFetch(mockApiResponse(createMockBooking({
        id: 123,
        property_id: 1,
        total_amount: 1250,
      })));

      const submitBookingButton = screen.getByRole('button', { name: /book now/i });
      await user.click(submitBookingButton);

      // Should proceed to payment
      await waitFor(() => {
        expect(screen.getByText('Complete Payment')).toBeInTheDocument();
        expect(screen.getByText('SAR 1,250')).toBeInTheDocument();
      });

      // 9. User selects payment method and pays
      const myfatoorahOption = screen.getByLabelText('MyFatoorah');
      await user.click(myfatoorahOption);

      mockFetch(mockApiResponse({
        payment_url: 'https://myfatoorah.com/payment/123',
        invoice_id: 'INV123',
      }));

      const payButton = screen.getByText('Pay Now');
      await user.click(payButton);

      // Should redirect to payment gateway
      await waitFor(() => {
        expect(window.location.href).toBe('https://myfatoorah.com/payment/123');
      });
    });

    it('should handle booking errors gracefully', async () => {
      renderWithProviders(<App />, { 
        initialEntries: ['/property/1'],
        user: null
      });

      const bookButton = screen.getByText('Book Now');
      await user.click(bookButton);

      // Fill form with conflicting dates
      await user.type(screen.getByLabelText('Check-in Date'), '2024-12-01');
      await user.type(screen.getByLabelText('Check-out Date'), '2024-12-05');
      await user.type(screen.getByLabelText('Guest Name'), 'John Doe');
      await user.type(screen.getByLabelText('Email'), 'john@example.com');

      // Mock booking failure
      mockFetch(mockApiResponse({ 
        error: 'Property not available for selected dates'
      }, false), false, 400);

      const submitButton = screen.getByRole('button', { name: /book now/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Property not available for selected dates')).toBeInTheDocument();
      });
    });
  });

  describe('Authenticated User Flow - Search to Booking', () => {
    it('should complete authenticated user booking flow', async () => {
      const mockUser = createMockUser({
        id: 'user123',
        email: 'user@example.com',
        name: 'Test User',
      });

      renderWithProviders(<App />, { 
        initialEntries: ['/'],
        user: mockUser
      });

      // User should see personalized homepage
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument();
      });

      // Use Sara AI chat for property search
      const chatButton = screen.getByLabelText('Open chat');
      await user.click(chatButton);

      await waitFor(() => {
        expect(screen.getByText(/Hi! I'm Sara/)).toBeInTheDocument();
      });

      // User sends message to Sara
      const chatInput = screen.getByPlaceholder('Type your message...');
      await user.type(chatInput, 'I need a luxury apartment in Riyadh');

      mockFetch(mockApiResponse({
        message: 'I found some great luxury apartments in Riyadh for you!',
        properties: [mockProperties[0]],
      }));

      await user.keyboard('{Enter}');

      // Sara should respond with property suggestions
      await waitFor(() => {
        expect(screen.getByText('I found some great luxury apartments in Riyadh for you!')).toBeInTheDocument();
        expect(screen.getByText('Luxury Downtown Apartment')).toBeInTheDocument();
      });

      // User books directly from chat
      const chatBookButton = within(screen.getByText('Luxury Downtown Apartment').closest('.property-card')!)
        .getByText('Book Now');
      
      await user.click(chatBookButton);

      // Should open booking modal with user details pre-filled
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
        expect(screen.getByDisplayValue('user@example.com')).toBeInTheDocument();
      });

      // Complete booking flow
      await user.type(screen.getByLabelText('Check-in Date'), '2024-12-01');
      await user.type(screen.getByLabelText('Check-out Date'), '2024-12-05');

      mockFetch(mockApiResponse(createMockBooking({ id: 456 })));

      const bookNowButton = screen.getByRole('button', { name: /book now/i });
      await user.click(bookNowButton);

      await waitFor(() => {
        expect(screen.getByText('Booking confirmed!')).toBeInTheDocument();
      });
    });
  });

  describe('Admin User Flow - Property Management', () => {
    it('should complete admin property management flow', async () => {
      const mockAdmin = createMockUser({
        id: 'admin123',
        email: 'admin@habibistay.com',
        name: 'Admin User',
        role: 'admin',
      });

      // Mock admin API responses
      mockFetch(mockApiResponse({
        total_properties: 150,
        total_bookings: 300,
        total_revenue: 75000,
        occupancy_rate: 78.5,
      }));

      renderWithProviders(<App />, { 
        initialEntries: ['/admin'],
        user: mockAdmin
      });

      // Admin should see dashboard
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
        expect(screen.getByText('150')).toBeInTheDocument(); // Total properties
        expect(screen.getByText('300')).toBeInTheDocument(); // Total bookings
      });

      // Navigate to properties management
      const propertiesTab = screen.getByText('Properties');
      await user.click(propertiesTab);

      mockFetch(mockApiResponse(mockProperties));

      await waitFor(() => {
        expect(screen.getByText('Property Management')).toBeInTheDocument();
        expect(screen.getByText('Luxury Downtown Apartment')).toBeInTheDocument();
      });

      // Edit property status
      const propertyRow = screen.getByText('Luxury Downtown Apartment').closest('tr');
      const statusToggle = within(propertyRow!).getByRole('switch');
      
      mockFetch(mockApiResponse({ success: true, message: 'Property status updated' }));
      
      await user.click(statusToggle);

      await waitFor(() => {
        expect(screen.getByText('Property status updated')).toBeInTheDocument();
      });

      // View security dashboard
      const securityTab = screen.getByText('Security');
      await user.click(securityTab);

      mockFetch(mockApiResponse({
        totalEvents: 1247,
        criticalAlerts: 3,
        blockedIPs: 15,
        failedLogins: 89,
      }));

      await waitFor(() => {
        expect(screen.getByText('Security Audit Dashboard')).toBeInTheDocument();
        expect(screen.getByText('1,247')).toBeInTheDocument(); // Total events
        expect(screen.getByText('3')).toBeInTheDocument(); // Critical alerts
      });
    });
  });

  describe('Host User Flow - Property Onboarding', () => {
    it('should complete host onboarding flow', async () => {
      const mockHost = createMockUser({
        id: 'host123',
        email: 'host@example.com',
        name: 'Host User',
        role: 'host',
      });

      renderWithProviders(<App />, { 
        initialEntries: ['/host/onboard'],
        user: mockHost
      });

      // Step 1: Identity Verification
      await waitFor(() => {
        expect(screen.getByText('Identity Verification')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText('Full Name'), 'John Host');
      await user.type(screen.getByLabelText('Phone Number'), '+966501234567');

      let nextButton = screen.getByText('Next');
      await user.click(nextButton);

      // Step 2: Property Details
      await waitFor(() => {
        expect(screen.getByText('Property Details')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText('Property Title'), 'Beautiful Riyadh Apartment');
      await user.type(screen.getByLabelText('Location'), 'Riyadh, Saudi Arabia');
      await user.selectOptions(screen.getByLabelText('Property Type'), 'apartment');

      nextButton = screen.getByText('Next');
      await user.click(nextButton);

      // Step 3: Photos Upload
      await waitFor(() => {
        expect(screen.getByText('Property Photos')).toBeInTheDocument();
      });

      // Mock file upload
      const fileInput = screen.getByLabelText('Upload Photos');
      const mockFiles = [
        new File(['photo1'], 'photo1.jpg', { type: 'image/jpeg' }),
        new File(['photo2'], 'photo2.jpg', { type: 'image/jpeg' }),
        new File(['photo3'], 'photo3.jpg', { type: 'image/jpeg' }),
      ];

      await user.upload(fileInput, mockFiles);

      await waitFor(() => {
        expect(screen.getByText('✓ 3 photos uploaded')).toBeInTheDocument();
      });

      nextButton = screen.getByText('Next');
      await user.click(nextButton);

      // Step 4: Pricing
      await waitFor(() => {
        expect(screen.getByText('Pricing')).toBeInTheDocument();
      });

      const basePriceInput = screen.getByLabelText('Base Price (SAR/night)');
      await user.clear(basePriceInput);
      await user.type(basePriceInput, '300');

      nextButton = screen.getByText('Next');
      await user.click(nextButton);

      // Step 5: Banking
      await waitFor(() => {
        expect(screen.getByText('Banking Information')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText('IBAN'), 'SA0380000000608010167519');
      await user.type(screen.getByLabelText('Account Holder Name'), 'John Host');

      nextButton = screen.getByText('Next');
      await user.click(nextButton);

      // Step 6: Legal
      await waitFor(() => {
        expect(screen.getByText('Legal & Compliance')).toBeInTheDocument();
      });

      const termsCheckbox = screen.getByLabelText('Terms and Conditions');
      const privacyCheckbox = screen.getByLabelText('Privacy Policy');

      await user.click(termsCheckbox);
      await user.click(privacyCheckbox);

      // Complete onboarding
      mockFetch(mockApiResponse({
        property_id: 789,
        message: 'Onboarding completed successfully. Your property will be reviewed within 24 hours.',
      }));

      const completeButton = screen.getByText('Complete Onboarding');
      await user.click(completeButton);

      await waitFor(() => {
        expect(screen.getByText('Onboarding completed successfully')).toBeInTheDocument();
        expect(screen.getByText('Your property will be reviewed within 24 hours')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network failure
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      renderWithProviders(<App />, { initialEntries: ['/'] });

      await waitFor(() => {
        expect(screen.getByText('Unable to load content')).toBeInTheDocument();
        expect(screen.getByText('Check your internet connection and try again')).toBeInTheDocument();
      });

      // Retry button should work
      const retryButton = screen.getByText('Retry');
      
      // Mock successful retry
      mockFetch(mockApiResponse({ properties: mockProperties }));
      
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Find Your Perfect Stay')).toBeInTheDocument();
      });
    });

    it('should handle authentication errors', async () => {
      // Mock expired session
      mockFetch(mockApiResponse({ error: 'Token expired' }, false), false, 401);

      renderWithProviders(<App />, { 
        initialEntries: ['/dashboard'],
        user: createMockUser()
      });

      await waitFor(() => {
        expect(screen.getByText('Session expired. Please log in again.')).toBeInTheDocument();
      });

      // Should redirect to login
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should handle validation errors in forms', async () => {
      renderWithProviders(<App />, { 
        initialEntries: ['/property/1'],
        user: null
      });

      const bookButton = screen.getByText('Book Now');
      await user.click(bookButton);

      // Try to submit without required fields
      const submitButton = screen.getByRole('button', { name: /book now/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Check-in date is required')).toBeInTheDocument();
        expect(screen.getByText('Check-out date is required')).toBeInTheDocument();
        expect(screen.getByText('Guest name is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and Performance', () => {
    it('should be navigable with keyboard only', async () => {
      renderWithProviders(<App />, { initialEntries: ['/'] });

      // Tab through navigation
      await user.tab();
      expect(screen.getByText('Properties')).toHaveFocus();

      await user.tab();
      expect(screen.getByText('About')).toHaveFocus();

      await user.tab();
      expect(screen.getByText('Invest')).toHaveFocus();
    });

    it('should have proper ARIA labels and roles', () => {
      renderWithProviders(<App />, { initialEntries: ['/'] });

      expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
      expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Footer
      expect(screen.getByRole('navigation')).toBeInTheDocument(); // Nav menu
    });

    it('should load critical content quickly', async () => {
      const startTime = performance.now();
      
      renderWithProviders(<App />, { initialEntries: ['/'] });

      await waitFor(() => {
        expect(screen.getByText('Find Your Perfect Stay')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Should load main content within 100ms in test environment
      expect(loadTime).toBeLessThan(100);
    });
  });
});