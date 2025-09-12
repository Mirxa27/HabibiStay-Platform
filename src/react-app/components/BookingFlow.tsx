import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  User, 
  Mail, 
  Phone, 
  MessageSquare, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react';
import type { Property, CreateBooking } from '@/shared/types';
import { responsiveClasses, containers, utils, cn } from '../utils/responsive';
import { clsx } from 'clsx';

interface BookingStep {
  id: string;
  title: string;
  completed: boolean;
  current: boolean;
}

interface BookingFlowProps {
  property: Property;
  onComplete: (bookingData: CreateBooking) => void;
  onCancel: () => void;
  className?: string;
}

interface BookingFormData extends CreateBooking {
  nights?: number;
  totalAmount?: number;
  serviceFee?: number;
  taxes?: number;
}

const BookingFlow: React.FC<BookingFlowProps> = ({ 
  property, 
  onComplete, 
  onCancel, 
  className 
}) => {
  const [currentStep, setCurrentStep] = useState<string>('dates');
  const [formData, setFormData] = useState<BookingFormData>({
    property_id: property.id,
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    total_guests: 1,
    check_in_date: '',
    check_out_date: '',
    special_requests: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const steps: BookingStep[] = [
    { id: 'dates', title: 'Dates & Guests', completed: false, current: currentStep === 'dates' },
    { id: 'details', title: 'Guest Info', completed: false, current: currentStep === 'details' },
    { id: 'review', title: 'Review & Pay', completed: false, current: currentStep === 'review' },
  ];

  // Calculate pricing
  useEffect(() => {
    if (formData.check_in_date && formData.check_out_date) {
      const checkIn = new Date(formData.check_in_date);
      const checkOut = new Date(formData.check_out_date);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      if (nights > 0) {
        const baseAmount = nights * property.price_per_night;
        const serviceFee = Math.round(baseAmount * 0.05); // 5% service fee
        const taxes = Math.round(baseAmount * 0.15); // 15% VAT
        const totalAmount = baseAmount + serviceFee + taxes;

        setFormData(prev => ({
          ...prev,
          nights,
          totalAmount,
          serviceFee,
          taxes,
        }));
      }
    }
  }, [formData.check_in_date, formData.check_out_date, property.price_per_night]);

  const validateStep = (step: string): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'dates':
        if (!formData.check_in_date) newErrors.check_in_date = 'Check-in date is required';
        if (!formData.check_out_date) newErrors.check_out_date = 'Check-out date is required';
        if (formData.total_guests < 1) newErrors.total_guests = 'At least 1 guest is required';
        if (formData.total_guests > property.max_guests) {
          newErrors.total_guests = `Maximum ${property.max_guests} guests allowed`;
        }
        if (formData.check_in_date && formData.check_out_date) {
          const checkIn = new Date(formData.check_in_date);
          const checkOut = new Date(formData.check_out_date);
          if (checkOut <= checkIn) {
            newErrors.check_out_date = 'Check-out must be after check-in';
          }
          if (checkIn < new Date()) {
            newErrors.check_in_date = 'Check-in date cannot be in the past';
          }
        }
        break;

      case 'details':
        if (!formData.guest_name.trim()) newErrors.guest_name = 'Guest name is required';
        if (!formData.guest_email.trim()) newErrors.guest_email = 'Email is required';
        if (formData.guest_email && !/\S+@\S+\.\S+/.test(formData.guest_email)) {
          newErrors.guest_email = 'Please enter a valid email';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    const stepIndex = steps.findIndex(s => s.id === currentStep);
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const stepIndex = steps.findIndex(s => s.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep('review')) return;

    setIsLoading(true);
    try {
      await onComplete(formData);
    } catch (error) {
      console.error('Booking submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (updates: Partial<BookingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear related errors
    const newErrors = { ...errors };
    Object.keys(updates).forEach(key => {
      delete newErrors[key];
    });
    setErrors(newErrors);
  };

  const renderStepIndicator = () => (
    <div className={cn(
      "flex items-center justify-between mb-4 sm:mb-6",
      "overflow-x-auto scrollbar-hide"
    )}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center flex-shrink-0">
            <div className={cn(
              "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-medium",
              responsiveClasses.text.small,
              step.current ? 'bg-[#2957c3] text-white' :
              step.completed ? 'bg-green-500 text-white' :
              'bg-gray-200 text-gray-600'
            )}>
              {step.completed ? <CheckCircle className="h-3 w-3 sm:h-5 sm:w-5" /> : index + 1}
            </div>
            <span className={cn(
              "ml-1 sm:ml-2 font-medium whitespace-nowrap",
              responsiveClasses.text.small,
              step.current ? 'text-[#2957c3]' : step.completed ? 'text-green-600' : 'text-gray-500'
            )}>
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={cn(
              "flex-1 h-0.5 mx-2 sm:mx-4",
              step.completed ? 'bg-green-500' : 'bg-gray-200'
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderDateAndGuestsStep = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-in Date
          </label>
          <input
            type="date"
            value={formData.check_in_date}
            onChange={(e) => updateFormData({ check_in_date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className={clsx(
              'w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2957c3] focus:border-transparent',
              errors.check_in_date ? 'border-red-500' : 'border-gray-300'
            )}
          />
          {errors.check_in_date && (
            <p className="text-red-500 text-xs mt-1">{errors.check_in_date}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-out Date
          </label>
          <input
            type="date"
            value={formData.check_out_date}
            onChange={(e) => updateFormData({ check_out_date: e.target.value })}
            min={formData.check_in_date || new Date().toISOString().split('T')[0]}
            className={clsx(
              'w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2957c3] focus:border-transparent',
              errors.check_out_date ? 'border-red-500' : 'border-gray-300'
            )}
          />
          {errors.check_out_date && (
            <p className="text-red-500 text-xs mt-1">{errors.check_out_date}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Number of Guests (Max: {property.max_guests})
        </label>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => updateFormData({ total_guests: Math.max(1, formData.total_guests - 1) })}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            -
          </button>
          <input
            type="number"
            value={formData.total_guests}
            onChange={(e) => updateFormData({ total_guests: parseInt(e.target.value) || 1 })}
            min="1"
            max={property.max_guests}
            className={clsx(
              'w-16 text-center px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2957c3] focus:border-transparent',
              errors.guest_count ? 'border-red-500' : 'border-gray-300'
            )}
          />
          <button
            type="button"
            onClick={() => updateFormData({ total_guests: Math.min(property.max_guests, formData.total_guests + 1) })}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            +
          </button>
        </div>
        {errors.guest_count && (
          <p className="text-red-500 text-xs mt-1">{errors.guest_count}</p>
        )}
      </div>

      {formData.nights && formData.nights > 0 && (
        <div className="bg-blue-50 p-3 rounded-md">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {formData.nights} night{formData.nights > 1 ? 's' : ''} × {property.price_per_night} SAR
            </span>
            <span className="font-medium">
              {(formData.nights * property.price_per_night).toLocaleString()} SAR
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderGuestDetailsStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <User className="inline h-4 w-4 mr-1" />
          Full Name *
        </label>
        <input
          type="text"
          value={formData.guest_name}
          onChange={(e) => updateFormData({ guest_name: e.target.value })}
          placeholder="Enter your full name"
          className={clsx(
            'w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2957c3] focus:border-transparent',
            errors.guest_name ? 'border-red-500' : 'border-gray-300'
          )}
        />
        {errors.guest_name && (
          <p className="text-red-500 text-xs mt-1">{errors.guest_name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Mail className="inline h-4 w-4 mr-1" />
          Email Address *
        </label>
        <input
          type="email"
          value={formData.guest_email}
          onChange={(e) => updateFormData({ guest_email: e.target.value })}
          placeholder="your@email.com"
          className={clsx(
            'w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2957c3] focus:border-transparent',
            errors.guest_email ? 'border-red-500' : 'border-gray-300'
          )}
        />
        {errors.guest_email && (
          <p className="text-red-500 text-xs mt-1">{errors.guest_email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Phone className="inline h-4 w-4 mr-1" />
          Phone Number (Optional)
        </label>
        <input
          type="tel"
          value={formData.guest_phone || ''}
          onChange={(e) => updateFormData({ guest_phone: e.target.value })}
          placeholder="+966 5X XXX XXXX"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <MessageSquare className="inline h-4 w-4 mr-1" />
          Special Requests (Optional)
        </label>
        <textarea
          value={formData.special_requests || ''}
          onChange={(e) => updateFormData({ special_requests: e.target.value })}
          placeholder="Any special requests or notes for your stay..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-4">
      {/* Property Summary */}
      <div className="border border-gray-200 rounded-md p-3">
        <div className="flex items-start space-x-3">
          <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0">
            {/* Property image placeholder */}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 text-sm">{property.title}</h4>
            <div className="flex items-center text-xs text-gray-600 mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {property.location}
            </div>
            {property.average_rating && (
              <div className="flex items-center mt-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                <span className="text-xs text-gray-600">{property.average_rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Check-in:</span>
          <span className="font-medium">{new Date(formData.check_in_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Check-out:</span>
          <span className="font-medium">{new Date(formData.check_out_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Guests:</span>
          <span className="font-medium">{formData.total_guests}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Guest:</span>
          <span className="font-medium">{formData.guest_name}</span>
        </div>
      </div>

      {/* Price Breakdown */}
      {formData.totalAmount && (
        <div className="border-t border-gray-200 pt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {formData.nights} night{formData.nights !== 1 ? 's' : ''} × {property.price_per_night} SAR
            </span>
            <span>{(formData.nights! * property.price_per_night).toLocaleString()} SAR</span>
          </div>
          {formData.serviceFee && formData.serviceFee > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Service fee</span>
              <span>{formData.serviceFee.toLocaleString()} SAR</span>
            </div>
          )}
          {formData.taxes && formData.taxes > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Taxes & fees</span>
              <span>{formData.taxes.toLocaleString()} SAR</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-2">
            <div className="flex items-center justify-between font-medium">
              <span>Total</span>
              <span className="text-[#2957c3]">{formData.totalAmount.toLocaleString()} SAR</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Notice */}
      <div className="bg-blue-50 p-3 rounded-md">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Secure Payment</p>
            <p>You'll be redirected to our secure payment partner to complete your booking.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'dates':
        return renderDateAndGuestsStep();
      case 'details':
        return renderGuestDetailsStep();
      case 'review':
        return renderReviewStep();
      default:
        return null;
    }
  };

  return (
    <div className={clsx('bg-white rounded-lg border border-gray-200 p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Book Your Stay</h3>
        <button
          onClick={onCancel}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      <div className="mb-6">
        {renderStepContent()}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 'dates'}
          className={clsx(
            'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
            currentStep === 'dates'
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-50'
          )}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Previous
        </button>

        {currentStep === 'review' ? (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center px-6 py-2 bg-[#2957c3] text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Complete Booking
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center px-4 py-2 bg-[#2957c3] text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingFlow;