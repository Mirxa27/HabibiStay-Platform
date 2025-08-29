import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { CheckCircle, Home, Calendar, Mail } from 'lucide-react';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'processing'>('processing');
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const paymentId = searchParams.get('paymentId') || searchParams.get('Id');
    const invoiceId = searchParams.get('InvoiceId');
    
    if (paymentId || invoiceId) {
      processPaymentCallback(paymentId || invoiceId || '');
    } else {
      setPaymentStatus('failed');
      setProcessing(false);
    }
  }, [searchParams]);

  const processPaymentCallback = async (paymentIdentifier: string) => {
    try {
      const response = await fetch('/api/payments/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: paymentIdentifier,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentStatus(data.data.status === 'success' ? 'success' : 'failed');
        setTransactionId(data.data.transaction_id);
      } else {
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Payment callback processing failed:', error);
      setPaymentStatus('failed');
    } finally {
      setProcessing(false);
    }
  };

  if (processing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2957c3] mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for your booking. Your payment has been processed successfully.
            </p>

            {/* Transaction Details */}
            {transactionId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Transaction Details</h3>
                <p className="text-sm text-gray-600">
                  Transaction ID: <span className="font-mono font-medium">{transactionId}</span>
                </p>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-[#2957c3] mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Confirmation Email</p>
                    <p className="text-sm text-gray-600">Check your email for booking confirmation and details</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-[#2957c3] mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Booking Details</p>
                    <p className="text-sm text-gray-600">View your booking in the dashboard or contact the host</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Home className="w-5 h-5 text-[#2957c3] mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Check-in Information</p>
                    <p className="text-sm text-gray-600">You'll receive check-in instructions closer to your arrival date</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                to="/dashboard"
                className="w-full bg-[#2957c3] text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
              >
                View My Bookings
              </Link>
              <Link
                to="/stays"
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors inline-block"
              >
                Browse More Properties
              </Link>
            </div>

            {/* Support */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Need help? Contact our support team or chat with Sara, our AI assistant.
              </p>
              <div className="mt-2 space-x-4">
                <Link to="/contact" className="text-[#2957c3] hover:text-blue-700 text-sm font-medium">
                  Contact Support
                </Link>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => {
                    // This would open the chat widget
                    const chatButton = document.querySelector('[data-chat-trigger]') as HTMLElement;
                    chatButton?.click();
                  }}
                  className="text-[#2957c3] hover:text-blue-700 text-sm font-medium"
                >
                  Chat with Sara
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Payment Failed
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-red-600">⚠</span>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
          <p className="text-lg text-gray-600 mb-6">
            We couldn't process your payment. Your booking is still pending.
          </p>

          {/* Error Details */}
          <div className="bg-red-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">
              Don't worry! Your booking reservation is still held for a limited time. 
              You can try paying again or contact our support team for assistance.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-[#2957c3] text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Payment Again
            </button>
            <Link
              to="/contact"
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors inline-block"
            >
              Contact Support
            </Link>
            <Link
              to="/stays"
              className="w-full text-gray-500 py-2 px-6 rounded-lg font-medium hover:text-gray-700 transition-colors inline-block"
            >
              Browse Other Properties
            </Link>
          </div>

          {/* Support */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Need immediate assistance? Our support team is here to help.
            </p>
            <div className="mt-2">
              <Link to="/contact" className="text-[#2957c3] hover:text-blue-700 text-sm font-medium">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
