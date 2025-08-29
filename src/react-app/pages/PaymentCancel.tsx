import { Link } from 'react-router';
import { XCircle, ArrowLeft, Home, MessageCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          {/* Cancel Icon */}
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-yellow-600" />
          </div>

          {/* Cancel Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
          <p className="text-lg text-gray-600 mb-6">
            Your payment has been cancelled. Your booking is still pending and can be completed later.
          </p>

          {/* Information */}
          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Booking Status</h3>
            <p className="text-sm text-yellow-800">
              Your booking reservation is held for a limited time. You can complete the payment 
              anytime before the reservation expires. Check your email for booking details.
            </p>
          </div>

          {/* Options */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">What would you like to do?</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start">
                <ArrowLeft className="w-5 h-5 text-[#2957c3] mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Return to Property</p>
                  <p className="text-sm text-gray-600">Go back to the property page and try booking again</p>
                </div>
              </div>
              <div className="flex items-start">
                <MessageCircle className="w-5 h-5 text-[#2957c3] mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Get Help</p>
                  <p className="text-sm text-gray-600">Chat with Sara or contact our support team</p>
                </div>
              </div>
              <div className="flex items-start">
                <Home className="w-5 h-5 text-[#2957c3] mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Browse More</p>
                  <p className="text-sm text-gray-600">Explore other amazing properties</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-[#2957c3] text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="inline h-5 w-5 mr-2" />
              Return to Property
            </button>
            <Link
              to="/dashboard"
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors inline-block"
            >
              View My Dashboard
            </Link>
            <Link
              to="/stays"
              className="w-full text-gray-500 py-2 px-6 rounded-lg font-medium hover:text-gray-700 transition-colors inline-block"
            >
              Browse Properties
            </Link>
          </div>

          {/* Support */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Have questions about your booking or need assistance?
            </p>
            <div className="space-x-4">
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

          {/* Reassurance */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>No charges applied:</strong> Your payment method was not charged. 
              You can safely try again or choose a different payment method.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
