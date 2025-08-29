import { useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { 
  CheckCircle, 
  Circle, 
  Upload, 
  Home, 
  Camera, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  ArrowRight,
  ArrowLeft,
  User,
  FileText,
  Shield
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
}

interface HostProfile {
  identity: { full_name: string; phone: string; verified: boolean };
  property: { title: string; description: string; location: string; type: string; max_guests: number };
  photos: { main_photos: File[]; };
  pricing: { base_price: number; cleaning_fee: number; cancellation_policy: string };
  banking: { bank_name: string; iban: string; account_holder: string };
  legal: { terms_accepted: boolean; privacy_accepted: boolean };
}

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'studio', label: 'Studio' }
];

export default function HostOnboarding() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [hostProfile, setHostProfile] = useState<HostProfile>({
    identity: { full_name: '', phone: '', verified: false },
    property: { title: '', description: '', location: '', type: '', max_guests: 1 },
    photos: { main_photos: [] },
    pricing: { base_price: 100, cleaning_fee: 25, cancellation_policy: 'moderate' },
    banking: { bank_name: '', iban: '', account_holder: '' },
    legal: { terms_accepted: false, privacy_accepted: false }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps: OnboardingStep[] = [
    {
      id: 'identity',
      title: 'Identity Verification',
      description: 'Verify your identity to build trust',
      icon: User,
      completed: hostProfile.identity.verified
    },
    {
      id: 'property',
      title: 'Property Details',
      description: 'Tell us about your property',
      icon: Home,
      completed: hostProfile.property.title !== '' && hostProfile.property.location !== ''
    },
    {
      id: 'photos',
      title: 'Photos',
      description: 'Upload property photos',
      icon: Camera,
      completed: hostProfile.photos.main_photos.length >= 3
    },
    {
      id: 'pricing',
      title: 'Pricing',
      description: 'Set your rates and policies',
      icon: DollarSign,
      completed: hostProfile.pricing.base_price > 0
    },
    {
      id: 'banking',
      title: 'Banking',
      description: 'Add bank details for payouts',
      icon: CreditCard,
      completed: hostProfile.banking.iban !== ''
    },
    {
      id: 'legal',
      title: 'Legal',
      description: 'Accept terms and conditions',
      icon: FileText,
      completed: hostProfile.legal.terms_accepted && hostProfile.legal.privacy_accepted
    }
  ];

  const updateProfile = (section: keyof HostProfile, data: any) => {
    setHostProfile(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      updateProfile('photos', { main_photos: [...hostProfile.photos.main_photos, ...Array.from(files)] });
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    const step = steps[currentStep];

    switch (step.id) {
      case 'identity':
        if (!hostProfile.identity.full_name) newErrors.full_name = 'Full name is required';
        if (!hostProfile.identity.phone) newErrors.phone = 'Phone number is required';
        break;
      case 'property':
        if (!hostProfile.property.title) newErrors.title = 'Property title is required';
        if (!hostProfile.property.location) newErrors.location = 'Location is required';
        break;
      case 'photos':
        if (hostProfile.photos.main_photos.length < 3) newErrors.photos = 'At least 3 photos required';
        break;
      case 'banking':
        if (!hostProfile.banking.iban) newErrors.iban = 'IBAN is required';
        break;
      case 'legal':
        if (!hostProfile.legal.terms_accepted) newErrors.terms = 'Must accept terms';
        if (!hostProfile.legal.privacy_accepted) newErrors.privacy = 'Must accept privacy policy';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        submitOnboarding();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitOnboarding = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/host/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hostProfile)
      });

      const data = await response.json();
      if (data.success) {
        alert('Onboarding completed successfully!');
      } else {
        alert('Failed to complete onboarding.');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'identity':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="w-16 h-16 text-[#2957c3] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Identity Verification</h3>
              <p className="text-gray-600">Build trust by verifying your identity</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={hostProfile.identity.full_name}
                  onChange={(e) => updateProfile('identity', { full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3]"
                  placeholder="Enter your full name"
                />
                {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={hostProfile.identity.phone}
                  onChange={(e) => updateProfile('identity', { phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3]"
                  placeholder="+966 XX XXX XXXX"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>
        );

      case 'property':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Home className="w-16 h-16 text-[#2957c3] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Property Details</h3>
              <p className="text-gray-600">Tell us about your property</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Title *</label>
              <input
                type="text"
                value={hostProfile.property.title}
                onChange={(e) => updateProfile('property', { title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3]"
                placeholder="e.g., Luxury Downtown Apartment"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={hostProfile.property.description}
                onChange={(e) => updateProfile('property', { description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3]"
                placeholder="Describe your property..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <select
                  value={hostProfile.property.type}
                  onChange={(e) => updateProfile('property', { type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3]"
                >
                  <option value="">Select type</option>
                  {PROPERTY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  value={hostProfile.property.location}
                  onChange={(e) => updateProfile('property', { location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3]"
                  placeholder="City, Neighborhood"
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>
            </div>
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Camera className="w-16 h-16 text-[#2957c3] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Property Photos</h3>
              <p className="text-gray-600">Upload high-quality photos (minimum 3)</p>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="photos"
              />
              <label htmlFor="photos" className="cursor-pointer">
                <p className="text-lg font-medium text-gray-700">Upload Photos</p>
                <p className="text-gray-500">Drag and drop or click to select</p>
              </label>
              {hostProfile.photos.main_photos.length > 0 && (
                <p className="text-green-600 mt-2">✓ {hostProfile.photos.main_photos.length} photos uploaded</p>
              )}
            </div>
            {errors.photos && <p className="text-red-500 text-sm mt-1">{errors.photos}</p>}
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <DollarSign className="w-16 h-16 text-[#2957c3] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Pricing</h3>
              <p className="text-gray-600">Set competitive rates</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Base Price (SAR/night)</label>
                <input
                  type="number"
                  value={hostProfile.pricing.base_price}
                  onChange={(e) => updateProfile('pricing', { base_price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3]"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cleaning Fee (SAR)</label>
                <input
                  type="number"
                  value={hostProfile.pricing.cleaning_fee}
                  onChange={(e) => updateProfile('pricing', { cleaning_fee: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3]"
                  min="0"
                />
              </div>
            </div>
          </div>
        );

      case 'banking':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CreditCard className="w-16 h-16 text-[#2957c3] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Banking Information</h3>
              <p className="text-gray-600">Add your bank details for payouts</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  value={hostProfile.banking.bank_name}
                  onChange={(e) => updateProfile('banking', { bank_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3]"
                  placeholder="e.g., Saudi National Bank"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                <input
                  type="text"
                  value={hostProfile.banking.account_holder}
                  onChange={(e) => updateProfile('banking', { account_holder: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3]"
                  placeholder="Full name as on bank account"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IBAN *</label>
              <input
                type="text"
                value={hostProfile.banking.iban}
                onChange={(e) => updateProfile('banking', { iban: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3]"
                placeholder="SA00 0000 0000 0000 0000 0000"
              />
              {errors.iban && <p className="text-red-500 text-sm mt-1">{errors.iban}</p>}
            </div>
          </div>
        );

      case 'legal':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <FileText className="w-16 h-16 text-[#2957c3] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Legal & Compliance</h3>
              <p className="text-gray-600">Accept terms to complete onboarding</p>
            </div>
            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hostProfile.legal.terms_accepted}
                  onChange={(e) => updateProfile('legal', { terms_accepted: e.target.checked })}
                  className="mt-1 rounded border-gray-300 text-[#2957c3] focus:ring-[#2957c3]"
                />
                <div className="text-sm">
                  <p className="font-medium">Terms and Conditions *</p>
                  <p className="text-gray-600">I agree to the <a href="/terms" className="text-[#2957c3]">Terms and Conditions</a></p>
                </div>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hostProfile.legal.privacy_accepted}
                  onChange={(e) => updateProfile('legal', { privacy_accepted: e.target.checked })}
                  className="mt-1 rounded border-gray-300 text-[#2957c3] focus:ring-[#2957c3]"
                />
                <div className="text-sm">
                  <p className="font-medium">Privacy Policy *</p>
                  <p className="text-gray-600">I agree to the <a href="/privacy" className="text-[#2957c3]">Privacy Policy</a></p>
                </div>
              </label>
            </div>
            {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}
            {errors.privacy && <p className="text-red-500 text-sm">{errors.privacy}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                index <= currentStep ? 'bg-[#2957c3] border-[#2957c3] text-white' : 'border-gray-300 text-gray-400'
              }`}>
                {step.completed ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 ${
                  index < currentStep ? 'bg-[#2957c3]' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </h2>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </button>
        
        <button
          onClick={nextStep}
          disabled={loading}
          className="flex items-center px-6 py-3 bg-[#2957c3] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : currentStep === steps.length - 1 ? 'Complete Onboarding' : 'Next'}
          {!loading && currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
        </button>
      </div>
    </div>
  );
}