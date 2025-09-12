import React, { useState } from 'react';
import { X, User, Mail, Phone, MessageCircle, Calendar, Users } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import PaymentModal from './PaymentModal';
import type { Property, Booking } from '../../shared/types';
import { responsiveClasses, utils, cn } from '../utils/responsive';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
}

export default function BookingModal({ isOpen, onClose, property }: BookingModalProps) {
  const { openChat } = useChat();
  const [step, setStep] = useState<'form' | 'confirm' | 'payment'>('form');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in_date: '',
    check_out_date: '',
    total_guests: 1,
    special_requests: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.guest_name.trim()) {
      newErrors.guest_name = 'Name is required';
    }

    if (!formData.guest_email.trim()) {
      newErrors.guest_email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.guest_email)) {
      newErrors.guest_email = 'Please enter a valid email';
    }

    if (!formData.check_in_date) {
      newErrors.check_in_date = 'Check-in date is required';
    }

    if (!formData.check_out_date) {
      newErrors.check_out_date = 'Check-out date is required';
    }

    if (formData.check_in_date && formData.check_out_date) {
      const checkIn = new Date(formData.check_in_date);
      const checkOut = new Date(formData.check_out_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkIn < today) {
        newErrors.check_in_date = 'Check-in date cannot be in the past';
      }

      if (checkOut <= checkIn) {
        newErrors.check_out_date = 'Check-out must be after check-in';
      }
    }

    if (formData.total_guests > property.max_guests) {
      newErrors.total_guests = `Maximum ${property.max_guests} guests allowed`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateBookingDetails = () => {
    if (!formData.check_in_date || !formData.check_out_date) return null;

    const checkIn = new Date(formData.check_in_date);
    const checkOut = new Date(formData.check_out_date);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    const baseAmount = nights * property.price_per_night;
    const serviceFee = Math.round(baseAmount * 0.05);
    const taxes = Math.round(baseAmount * 0.15);
    const total = baseAmount + serviceFee + taxes;

    return {
      nights,
      baseAmount,
      serviceFee,
      taxes,
      total,
    };
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          property_id: property.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Create booking object for payment
        const newBooking: Booking = {
          id: data.data.booking_id,
          user_id: 'guest',
          property_id: property.id,
          guest_name: formData.guest_name,
          guest_email: formData.guest_email,
          guest_phone: formData.guest_phone || null,
          check_in_date: formData.check_in_date,
          check_out_date: formData.check_out_date,
          total_guests: formData.total_guests,
          total_amount: data.data.total_amount,
          status: 'pending',
          payment_status: 'pending',
          payment_id: null,
          special_requests: formData.special_requests || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setBooking(newBooking);
        setStep('confirm');
      } else {
        throw new Error(data.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setErrors({ form: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    setShowPaymentModal(true);
  };

  const handleChatBooking = () => {
    openChat();
    onClose();
  };

  const resetForm = () => {
    setStep('form');
    setFormData({
      guest_name: '',
      guest_email: '',
      guest_phone: '',
      check_in_date: '',
      check_out_date: '',
      total_guests: 1,
      special_requests: '',
    });
    setErrors({});
    setBooking(null);
  };

  const bookingDetails = calculateBookingDetails();

  if (!isOpen) return null;

  return (
    <>
      <div className={responsiveClasses.modal.overlay}>
        <div className={cn(
          responsiveClasses.modal.container,
          "max-w-sm sm:max-w-md md:max-w-lg"
        )}>
          {/* Header */}
          <div className={responsiveClasses.modal.header}>
            <h2 className={cn(
              responsiveClasses.text.h3,
              "text-gray-900"
            )}>
              {step === 'form' ? 'Book Your Stay' : 'Booking Confirmation'}
            </h2>
            <button
              onClick={() => {
                onClose();
                resetForm();
              }}
              className={cn(
                "text-gray-400 hover:text-gray-600 transition-colors",
                utils.touchTarget
              )}
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Property Info */}
          <div className={cn(
            "bg-gray-50 rounded-lg mb-4 sm:mb-6",
            responsiveClasses.card.padding
          )}>
            <h3 className={cn(
              responsiveClasses.text.h4,
              "text-gray-900 mb-1"
            )}>{property.title}</h3>
            <p className="text-gray-600 text-sm">{property.location}</p>
            <p className="text-[#2957c3] font-bold mt-2">{property.price_per_night} SAR / night</p>
          </div>

          {step === 'form' && (
            <>
              {/* Booking Form */}
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.guest_name}
                    onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent ${
                      errors.guest_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.guest_name && <p className="text-red-500 text-sm mt-1">{errors.guest_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.guest_email}
                    onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent ${
                      errors.guest_email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.guest_email && <p className="text-red-500 text-sm mt-1">{errors.guest_email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.guest_phone}
                    onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                    placeholder="+966 XXX XXX XXX"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Check-in *
                    </label>
                    <input
                      type="date"
                      value={formData.check_in_date}
                      onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent ${
                        errors.check_in_date ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.check_in_date && <p className="text-red-500 text-sm mt-1">{errors.check_in_date}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-out *
                    </label>
                    <input
                      type="date"
                      value={formData.check_out_date}
                      onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                      min={formData.check_in_date || new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent ${
                        errors.check_out_date ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.check_out_date && <p className="text-red-500 text-sm mt-1">{errors.check_out_date}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="inline h-4 w-4 mr-1" />
                    Number of Guests *
                  </label>
                  <select
                    value={formData.total_guests}
                    onChange={(e) => setFormData({ ...formData, total_guests: parseInt(e.target.value) })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent ${
                      errors.total_guests ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    {Array.from({ length: property.max_guests }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                  {errors.total_guests && <p className="text-red-500 text-sm mt-1">{errors.total_guests}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageCircle className="inline h-4 w-4 mr-1" />
                    Special Requests
                  </label>
                  <textarea
                    value={formData.special_requests}
                    onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent resize-none"
                    placeholder="Any special requests or notes..."
                  />
                </div>

                {/* Price Breakdown */}
                {bookingDetails && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Price Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>{bookingDetails.nights} night{bookingDetails.nights > 1 ? 's' : ''} × {property.price_per_night} SAR</span>
                        <span>{bookingDetails.baseAmount} SAR</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service fee</span>
                        <span>{bookingDetails.serviceFee} SAR</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxes (15% VAT)</span>
                        <span>{bookingDetails.taxes} SAR</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold text-base">
                        <span>Total</span>
                        <span className="text-[#2957c3]">{bookingDetails.total} SAR</span>
                      </div>
                    </div>
                  </div>
                )}

                {errors.form && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{errors.form}</p>
                  </div>
                )}
              </form>

              {/* Form Actions */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !bookingDetails}
                  className="w-full bg-[#2957c3] text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Booking...
                    </span>
                  ) : (
                    'Continue to Payment'
                  )}
                </button>

                <button
                  onClick={handleChatBooking}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  <MessageCircle className="inline h-4 w-4 mr-2" />
                  Book with Sara (AI Assistant)
                </button>
              </div>
            </>
          )}

          {step === 'confirm' && booking && (
            <>
              {/* Booking Confirmation */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✓</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Created Successfully!</h3>
                <p className="text-gray-600">Your booking reference is #{booking.id}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Booking Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guest:</span>
                    <span className="font-medium">{booking.guest_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{booking.guest_email}</span>
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
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-[#2957c3]">{booking.total_amount} SAR</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  <strong>Important:</strong> Your booking is confirmed but payment is still pending. 
                  Please complete the payment to secure your reservation.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePayment}
                  className="w-full bg-[#2957c3] text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Complete Payment
                </button>
                <button
                  onClick={() => {
                    onClose();
                    resetForm();
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Pay Later
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                A confirmation email has been sent to {booking.guest_email}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {booking && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            onClose();
            resetForm();
          }}
          booking={booking}
        />
      )}
    </>
  );
}
