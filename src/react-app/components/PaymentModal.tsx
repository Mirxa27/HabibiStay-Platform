import { useState } from 'react';
import { X, CreditCard, Lock } from 'lucide-react';
import type { Booking } from '@/shared/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
}

export default function PaymentModal({ isOpen, onClose, booking }: PaymentModalProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: booking.id,
          amount: booking.total_amount,
          currency: 'SAR',
          return_url: `${window.location.origin}/payment/success`,
          cancel_url: `${window.location.origin}/payment/cancel`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to MyFatoorah payment page
        window.location.href = data.data.payment_url;
      } else {
        setError(data.error || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Booking Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Guest Name:</span>
              <span className="font-medium">{booking.guest_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Check-in:</span>
              <span className="font-medium">{new Date(booking.check_in_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Check-out:</span>
              <span className="font-medium">{new Date(booking.check_out_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Guests:</span>
              <span className="font-medium">{booking.total_guests}</span>
            </div>
            <div className="border-t pt-2 mt-3">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Amount:</span>
                <span className="text-[#2957c3]">{booking.total_amount} SAR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <CreditCard className="h-5 w-5 text-[#2957c3] mr-2" />
            <h3 className="font-semibold text-gray-900">Secure Payment</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            You will be redirected to MyFatoorah, our secure payment gateway, to complete your payment. 
            All major credit cards, debit cards, and digital wallets are accepted.
          </p>
          
          <div className="flex items-center text-sm text-gray-500">
            <Lock className="h-4 w-4 mr-1" />
            <span>SSL secured payment processing</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Accepted Payment Methods</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-100 rounded p-2 text-center text-xs font-medium">Visa</div>
            <div className="bg-gray-100 rounded p-2 text-center text-xs font-medium">Mastercard</div>
            <div className="bg-gray-100 rounded p-2 text-center text-xs font-medium">Mada</div>
            <div className="bg-gray-100 rounded p-2 text-center text-xs font-medium">Apple Pay</div>
            <div className="bg-gray-100 rounded p-2 text-center text-xs font-medium">STC Pay</div>
            <div className="bg-gray-100 rounded p-2 text-center text-xs font-medium">Tabby</div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            disabled={processing}
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={processing}
            className="flex-1 bg-[#2957c3] text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </span>
            ) : (
              'Proceed to Payment'
            )}
          </button>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          By proceeding, you agree to our{' '}
          <a href="/terms" className="text-[#2957c3] hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="text-[#2957c3] hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
