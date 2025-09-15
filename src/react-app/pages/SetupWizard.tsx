import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Lock, 
  Mail, 
  Globe, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Shield
} from 'lucide-react';

interface SetupFormData {
  admin_email: string;
  admin_password: string;
  admin_confirm_password: string;
  admin_name: string;
  site_name?: string;
  site_url?: string;
}

export default function SetupWizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<SetupFormData>({
    mode: 'onChange',
    defaultValues: {
      site_name: 'HabibiStay'
    }
  });

  const password = watch('admin_password');

  const onSubmit = async (data: SetupFormData) => {
    if (data.admin_password !== data.admin_confirm_password) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/setup/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admin_email: data.admin_email,
          admin_password: data.admin_password,
          admin_name: data.admin_name,
          site_name: data.site_name,
          site_url: data.site_url,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/auth/login', { 
            replace: true,
            state: { message: 'Setup completed! Please log in with your admin credentials.' }
          });
        }, 2000);
      } else {
        setError(result.error || 'Setup failed');
      }
    } catch (err) {
      setError('Network error during setup');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4 text-center">
          <div className="mb-6">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Setup Complete!
          </h1>
          <p className="text-gray-600 mb-6">
            Your HabibiStay platform has been successfully configured. 
            You will be redirected to the login page shortly.
          </p>
          <div className="animate-pulse text-purple-600">
            Redirecting...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full mx-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-purple-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to HabibiStay
            </h1>
          </div>
          <p className="text-gray-600">
            Let's set up your vacation rental platform
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    i <= step
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {i}
                </div>
                {i < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      i < step ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Admin Account</span>
            <span>Site Settings</span>
            <span>Review</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Create Admin Account
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    {...register('admin_name', { 
                      required: 'Name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' }
                    })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.admin_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.admin_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    {...register('admin_email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Please enter a valid email'
                      }
                    })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="admin@yourcompany.com"
                  />
                </div>
                {errors.admin_email && (
                  <p className="mt-1 text-sm text-red-600">{errors.admin_email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    {...register('admin_password', { 
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' }
                    })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter a secure password"
                  />
                </div>
                {errors.admin_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.admin_password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    {...register('admin_confirm_password', { 
                      required: 'Please confirm your password',
                      validate: (value) => value === password || 'Passwords do not match'
                    })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                </div>
                {errors.admin_confirm_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.admin_confirm_password.message}</p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Site Configuration
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    {...register('site_name')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="HabibiStay"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site URL (Optional)
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    {...register('site_url')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://yoursite.com"
                  />
                </div>
                {errors.site_url && (
                  <p className="mt-1 text-sm text-red-600">{errors.site_url.message}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Configuration Note
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        You can modify these settings later from the admin dashboard.
                        Additional features like payment gateways and AI services
                        can be configured after setup.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Review & Complete Setup
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Admin Name:</span>
                  <span>{watch('admin_name')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Admin Email:</span>
                  <span>{watch('admin_email')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Site Name:</span>
                  <span>{watch('site_name')}</span>
                </div>
                {watch('site_url') && (
                  <div className="flex justify-between">
                    <span className="font-medium">Site URL:</span>
                    <span>{watch('site_url')}</span>
                  </div>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Ready to Launch
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Your HabibiStay platform is ready to be initialized.
                        Click "Complete Setup" to create your admin account and finish the setup process.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={step === 1 && (!watch('admin_name') || !watch('admin_email') || !watch('admin_password') || !watch('admin_confirm_password'))}
                className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !isValid}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Setting Up...' : 'Complete Setup'}
                {!loading && <CheckCircle className="ml-2 h-4 w-4" />}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}