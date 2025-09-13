// Booking system tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockFetch, mockApiResponse, createMockProperty, createMockBooking } from './utils.tsx';
import BookingModal from '@/react-app/components/BookingModal';
import PaymentModal from '@/react-app/components/PaymentModal';
import { screen, waitFor, fireEvent } from './utils.tsx';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('Booking System', () => {
  const user = userEvent.setup();
  
  const mockProperty = createMockProperty({
    id: 1,
    title: 'Luxury Downtown Apartment',
    price_per_night: 250,
    max_guests: 4,
    location: 'Riyadh, Saudi Arabia',
  });

  const mockBooking = createMockBooking({
    id: 1,
    property_id: 1,
    total_amount: 1000,
    base_amount: 800,
    service_fee: 120,
    taxes: 80,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('BookingModal Component', () => {
    const mockOnClose = vi.fn();
    const mockOnBookingComplete = vi.fn();

    it('should render booking form with property details', () => {
      renderWithProviders(
        <BookingModal
          property={mockProperty}
          isOpen={true}
          onClose={mockOnClose}
          onBookingComplete={mockBookingComplete}
        />
      );

      expect(screen.getByText('Book Your Stay')).toBeInTheDocument();
      expect(screen.getByText('Luxury Downtown Apartment')).toBeInTheDocument();
      expect(screen.getByText('SAR 250 / night')).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      renderWithProviders(
        <BookingModal
          property={mockProperty}
          isOpen={true}
          onClose={mockOnClose}
          onBookingComplete={mockBookingComplete}
        />
      );

      const bookButton = screen.getByText('Book Now');
      await user.click(bookButton);

      expect(screen.getByText('Check-in date is required')).toBeInTheDocument();
      expect(screen.getByText('Check-out date is required')).toBeInTheDocument();
      expect(screen.getByText('Guest name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('should validate date range', async () => {
      renderWithProviders(
        <BookingModal
          property={mockProperty}
          isOpen={true}
          onClose={mockOnClose}
          onBookingComplete={mockBookingComplete}
        />
      );

      const checkinInput = screen.getByLabelText('Check-in Date');
      const checkoutInput = screen.getByLabelText('Check-out Date');

      await user.type(checkinInput, '2024-12-05');
      await user.type(checkoutInput, '2024-12-01');

      const bookButton = screen.getByText('Book Now');
      await user.click(bookButton);

      expect(screen.getByText('Check-out date must be after check-in date')).toBeInTheDocument();
    });

    it('should validate past dates', async () => {
      renderWithProviders(
        <BookingModal
          property={mockProperty}
          isOpen={true}
          onClose={mockOnClose}
          onBookingComplete={mockBookingComplete}
        />
      );

      const checkinInput = screen.getByLabelText('Check-in Date');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await user.type(checkinInput, yesterday.toISOString().split('T')[0]);

      const bookButton = screen.getByText('Book Now');
      await user.click(bookButton);

      expect(screen.getByText('Check-in date cannot be in the past')).toBeInTheDocument();
    });

    it('should validate guest count', async () => {
      renderWithProviders(
        <BookingModal
          property={mockProperty}
          isOpen={true}
          onClose={mockOnClose}
          onBookingComplete={mockBookingComplete}
        />
      );

      const guestSelect = screen.getByLabelText('Number of Guests');
      await user.selectOptions(guestSelect, '6'); // More than max_guests (4)

      expect(screen.getByText('Maximum 4 guests allowed')).toBeInTheDocument();
    });

    it('should calculate total price correctly', async () => {
      renderWithProviders(
        <BookingModal
          property={mockProperty}
          isOpen={true}
          onClose={mockOnClose}
          onBookingComplete={mockBookingComplete}
        />
      );

      const checkinInput = screen.getByLabelText('Check-in Date');
      const checkoutInput = screen.getByLabelText('Check-out Date');

      await user.type(checkinInput, '2024-12-01');
      await user.type(checkoutInput, '2024-12-05'); // 4 nights

      await waitFor(() => {
        expect(screen.getByText('SAR 1,000')).toBeInTheDocument(); // 4 * 250
        expect(screen.getByText('SAR 150')).toBeInTheDocument(); // Service fee
        expect(screen.getByText('SAR 100')).toBeInTheDocument(); // Taxes
        expect(screen.getByText('SAR 1,250')).toBeInTheDocument(); // Total
      });
    });

    it('should apply discount codes', async () => {
      mockFetch(mockApiResponse({ 
        valid: true, 
        discount_amount: 100,
        discount_percentage: 10
      }));

      renderWithProviders(
        <BookingModal
          property={mockProperty}
          isOpen={true}
          onClose={mockOnClose}
          onBookingComplete={mockBookingComplete}
        />
      );

      const promoInput = screen.getByLabelText('Promo Code');
      const applyButton = screen.getByText('Apply');

      await user.type(promoInput, 'SAVE10');
      await user.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText('-SAR 100')).toBeInTheDocument();
      });
    });

    it('should handle invalid promo codes', async () => {
      mockFetch(mockApiResponse({ 
        valid: false, 
        error: 'Invalid promo code'
      }, false));

      renderWithProviders(
        <BookingModal
          property={mockProperty}
          isOpen={true}
          onClose={mockOnClose}
          onBookingComplete={mockBookingComplete}
        />
      );

      const promoInput = screen.getByLabelText('Promo Code');
      const applyButton = screen.getByText('Apply');

      await user.type(promoInput, 'INVALID');
      await user.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid promo code')).toBeInTheDocument();
      });
    });

    it('should create booking successfully', async () => {
      mockFetch(mockApiResponse(mockBooking));

      renderWithProviders(
        <BookingModal
          property={mockProperty}
          isOpen={true}
          onClose={mockOnClose}
          onBookingComplete={mockBookingComplete}
        />
      );

      // Fill out form
      await user.type(screen.getByLabelText('Check-in Date'), '2024-12-01');
      await user.type(screen.getByLabelText('Check-out Date'), '2024-12-05');
      await user.type(screen.getByLabelText('Guest Name'), 'John Doe');
      await user.type(screen.getByLabelText('Email'), 'john@example.com');
      await user.type(screen.getByLabelText('Phone'), '+966501234567');

      const bookButton = screen.getByText('Book Now');
      await user.click(bookButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/bookings', expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('john@example.com'),
        }));
      });

      expect(mockOnBookingComplete).toHaveBeenCalledWith(mockBooking);
    });

    it('should handle booking errors', async () => {
      mockFetch(mockApiResponse({ 
        error: 'Property not available for selected dates'
      }, false), false, 400);

      renderWithProviders(
        <BookingModal
          property={mockProperty}
          isOpen={true}
          onClose={mockOnClose}
          onBookingComplete={mockBookingComplete}
        />
      );

      // Fill out form
      await user.type(screen.getByLabelText('Check-in Date'), '2024-12-01');
      await user.type(screen.getByLabelText('Check-out Date'), '2024-12-05');
      await user.type(screen.getByLabelText('Guest Name'), 'John Doe');
      await user.type(screen.getByLabelText('Email'), 'john@example.com');

      const bookButton = screen.getByText('Book Now');
      await user.click(bookButton);

      await waitFor(() => {
        expect(screen.getByText('Property not available for selected dates')).toBeInTheDocument();
      });
    });

    it('should close modal when close button is clicked', async () => {
      renderWithProviders(
        <BookingModal
          property={mockProperty}
          isOpen={true}
          onClose={mockOnClose}
          onBookingComplete={mockBookingComplete}
        />
      );

      const closeButton = screen.getByLabelText('Close modal');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('PaymentModal Component', () => {
    const mockOnClose = vi.fn();
    const mockOnPaymentSuccess = vi.fn();

    it('should render payment form with booking details', () => {
      renderWithProviders(
        <PaymentModal
          booking={mockBooking}
          isOpen={true}
          onClose={mockOnClose}
          onPaymentSuccess={mockOnPaymentSuccess}
        />
      );

      expect(screen.getByText('Complete Payment')).toBeInTheDocument();
      expect(screen.getByText('Booking Summary')).toBeInTheDocument();
      expect(screen.getByText('SAR 1,000')).toBeInTheDocument();
    });

    it('should display payment methods', () => {
      renderWithProviders(
        <PaymentModal
          booking={mockBooking}
          isOpen={true}
          onClose={mockOnClose}
          onPaymentSuccess={mockOnPaymentSuccess}
        />
      );

      expect(screen.getByText('MyFatoorah')).toBeInTheDocument();
      expect(screen.getByText('PayPal')).toBeInTheDocument();
      expect(screen.getByText('Credit Card')).toBeInTheDocument();
    });

    it('should process MyFatoorah payment', async () => {
      mockFetch(mockApiResponse({
        payment_url: 'https://myfatoorah.com/payment/123',
        invoice_id: 'INV123',
      }));

      renderWithProviders(
        <PaymentModal
          booking={mockBooking}
          isOpen={true}
          onClose={mockOnClose}
          onPaymentSuccess={mockOnPaymentSuccess}
        />
      );

      const myfatoorahOption = screen.getByLabelText('MyFatoorah');
      await user.click(myfatoorahOption);

      const payButton = screen.getByText('Pay Now');
      await user.click(payButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/payments/create', expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('myfatoorah'),
        }));
      });

      // Should redirect to payment URL
      expect(window.location.href).toBe('https://myfatoorah.com/payment/123');
    });

    it('should handle payment errors', async () => {
      mockFetch(mockApiResponse({ 
        error: 'Payment processing failed'
      }, false), false, 500);

      renderWithProviders(
        <PaymentModal
          booking={mockBooking}
          isOpen={true}
          onClose={mockOnClose}
          onPaymentSuccess={mockOnPaymentSuccess}
        />
      );

      const payButton = screen.getByText('Pay Now');
      await user.click(payButton);

      await waitFor(() => {
        expect(screen.getByText('Payment processing failed')).toBeInTheDocument();
      });
    });

    it('should validate payment form', async () => {
      renderWithProviders(
        <PaymentModal
          booking={mockBooking}
          isOpen={true}
          onClose={mockOnClose}
          onPaymentSuccess={mockOnPaymentSuccess}
        />
      );

      const creditCardOption = screen.getByLabelText('Credit Card');
      await user.click(creditCardOption);

      const payButton = screen.getByText('Pay Now');
      await user.click(payButton);

      expect(screen.getByText('Card number is required')).toBeInTheDocument();
      expect(screen.getByText('Expiry date is required')).toBeInTheDocument();
      expect(screen.getByText('CVV is required')).toBeInTheDocument();
    });

    it('should validate credit card format', async () => {
      renderWithProviders(
        <PaymentModal
          booking={mockBooking}
          isOpen={true}
          onClose={mockOnClose}
          onPaymentSuccess={mockOnPaymentSuccess}
        />
      );

      const creditCardOption = screen.getByLabelText('Credit Card');
      await user.click(creditCardOption);

      const cardNumberInput = screen.getByLabelText('Card Number');
      await user.type(cardNumberInput, '1234'); // Invalid card number

      const payButton = screen.getByText('Pay Now');
      await user.click(payButton);

      expect(screen.getByText('Invalid card number')).toBeInTheDocument();
    });

    it('should show loading state during payment', async () => {
      mockFetch(new Promise(() => {})); // Never resolves

      renderWithProviders(
        <PaymentModal
          booking={mockBooking}
          isOpen={true}
          onClose={mockOnClose}
          onPaymentSuccess={mockOnPaymentSuccess}
        />
      );

      const payButton = screen.getByText('Pay Now');
      await user.click(payButton);

      expect(screen.getByText('Processing payment...')).toBeInTheDocument();
      expect(payButton).toBeDisabled();
    });
  });

  describe('Booking Flow Integration', () => {
    it('should complete full booking flow', async () => {
      const mockOnClose = vi.fn();
      const mockOnBookingComplete = vi.fn();

      // Mock successful booking creation
      mockFetch(mockApiResponse(mockBooking));

      renderWithProviders(
        <BookingModal
          property={mockProperty}
          isOpen={true}
          onClose={mockOnClose}
          onBookingComplete={mockOnBookingComplete}
        />
      );

      // Fill booking form
      await user.type(screen.getByLabelText('Check-in Date'), '2024-12-01');
      await user.type(screen.getByLabelText('Check-out Date'), '2024-12-05');
      await user.type(screen.getByLabelText('Guest Name'), 'John Doe');
      await user.type(screen.getByLabelText('Email'), 'john@example.com');
      await user.type(screen.getByLabelText('Phone'), '+966501234567');

      const bookButton = screen.getByText('Book Now');
      await user.click(bookButton);

      await waitFor(() => {
        expect(mockOnBookingComplete).toHaveBeenCalledWith(mockBooking);
      });
    });

    it('should handle availability check', async () => {
      mockFetch(mockApiResponse({
        available: false,
        conflicting_booking: 123,
      }));

      renderWithProviders(
        <BookingModal
          property={mockProperty}
          isOpen={true}
          onClose={vi.fn()}
          onBookingComplete={vi.fn()}
        />
      );

      const checkinInput = screen.getByLabelText('Check-in Date');
      const checkoutInput = screen.getByLabelText('Check-out Date');

      await user.type(checkinInput, '2024-12-01');
      await user.type(checkoutInput, '2024-12-05');

      // Should trigger availability check
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/properties/1/availability'),
          expect.any(Object)
        );
      });

      expect(screen.getByText('Property not available for selected dates')).toBeInTheDocument();
    });

    it('should save booking details for guest users', async () => {
      renderWithProviders(
        <BookingModal
          property={mockProperty}
          isOpen={true}
          onClose={vi.fn()}
          onBookingComplete={vi.fn()}
        />,
        { user: null } // Guest user
      );

      await user.type(screen.getByLabelText('Guest Name'), 'John Doe');
      await user.type(screen.getByLabelText('Email'), 'john@example.com');

      // Should save guest details to localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'guest_details',
        expect.stringContaining('john@example.com')
      );
    });
  });
});