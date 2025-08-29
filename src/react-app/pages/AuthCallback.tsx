import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setStatus('error');
        setError('Authentication was cancelled or failed');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setError('No authorization code received');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (response.ok) {
          setStatus('success');
          // Redirect to dashboard after successful authentication
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          throw new Error('Failed to authenticate');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setStatus('error');
        setError('Failed to complete authentication');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          {status === 'processing' && (
            <>
              <Loader2 className="h-12 w-12 text-[#2957c3] animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Completing Sign In
              </h2>
              <p className="text-gray-600">
                Please wait while we securely sign you in to your account...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Welcome to HabibiStay!
              </h2>
              <p className="text-gray-600 mb-4">
                You have been successfully signed in. Redirecting to your dashboard...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#2957c3] h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600 mb-4">
                {error || 'Something went wrong during sign in. Please try again.'}
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to home page...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
