// Security notifications and user feedback component for HabibiStay

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, X, Lock, Eye, EyeOff } from 'lucide-react';

interface SecurityAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: number;
  dismissible: boolean;
}

export const SecurityNotifications = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Check for security-related events
    const checkSecurityEvents = () => {
      // Check session expiry
      const sessionExpiry = localStorage.getItem('session_expiry');
      if (sessionExpiry && Date.now() > parseInt(sessionExpiry)) {
        addAlert({
          id: 'session-expired',
          type: 'warning',
          title: 'Session Expired',
          message: 'Your session has expired for security reasons. Please log in again.',
          timestamp: Date.now(),
          dismissible: false
        });
      }

      // Check for suspicious activity
      const failedAttempts = parseInt(localStorage.getItem('failed_login_attempts') || '0');
      if (failedAttempts >= 3) {
        addAlert({
          id: 'multiple-failed-logins',
          type: 'error',
          title: 'Security Alert',
          message: `Multiple failed login attempts detected. Account temporarily locked for security.`,
          timestamp: Date.now(),
          dismissible: true
        });
      }
    };

    checkSecurityEvents();
    const interval = setInterval(checkSecurityEvents, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const addAlert = (alert: SecurityAlert) => {
    setAlerts(prev => {
      const exists = prev.find(a => a.id === alert.id);
      if (exists) return prev;
      return [alert, ...prev].slice(0, 5); // Keep only latest 5 alerts
    });
  };

  const dismissAlert = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Shield className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const visibleAlerts = alerts.filter(alert => !dismissed.has(alert.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {visibleAlerts.map(alert => (
        <div
          key={alert.id}
          className={`border rounded-lg p-4 shadow-lg ${getAlertStyles(alert.type)}`}
        >
          <div className="flex items-start space-x-3">
            {getAlertIcon(alert.type)}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">{alert.title}</h4>
              <p className="text-sm mt-1 opacity-90">{alert.message}</p>
              <p className="text-xs mt-2 opacity-70">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </p>
            </div>
            {alert.dismissible && (
              <button
                onClick={() => dismissAlert(alert.id)}
                className="opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Password strength indicator component
export const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const [strength, setStrength] = useState(0);
  const [checks, setChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    const newChecks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    setChecks(newChecks);
    setStrength(Object.values(newChecks).filter(Boolean).length);
  }, [password]);

  const getStrengthColor = () => {
    if (strength < 3) return 'bg-red-500';
    if (strength < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strength < 3) return 'Weak';
    if (strength < 4) return 'Medium';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium">{getStrengthText()}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className={`flex items-center space-x-1 ${checks.length ? 'text-green-600' : 'text-gray-400'}`}>
          <CheckCircle className="w-3 h-3" />
          <span>8+ characters</span>
        </div>
        <div className={`flex items-center space-x-1 ${checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
          <CheckCircle className="w-3 h-3" />
          <span>Uppercase</span>
        </div>
        <div className={`flex items-center space-x-1 ${checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
          <CheckCircle className="w-3 h-3" />
          <span>Lowercase</span>
        </div>
        <div className={`flex items-center space-x-1 ${checks.number ? 'text-green-600' : 'text-gray-400'}`}>
          <CheckCircle className="w-3 h-3" />
          <span>Number</span>
        </div>
        <div className={`flex items-center space-x-1 ${checks.special ? 'text-green-600' : 'text-gray-400'}`}>
          <CheckCircle className="w-3 h-3" />
          <span>Special char</span>
        </div>
      </div>
    </div>
  );
};

// Secure input component with built-in validation
export const SecureInput = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  maxLength,
  pattern,
  errorMessage,
  showPasswordToggle = false,
  ...props
}: {
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  pattern?: string;
  errorMessage?: string;
  showPasswordToggle?: boolean;
  [key: string]: any;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const validateInput = (inputValue: string) => {
    if (required && !inputValue.trim()) {
      setError('This field is required');
      return false;
    }

    if (pattern && !new RegExp(pattern).test(inputValue)) {
      setError(errorMessage || 'Invalid format');
      return false;
    }

    if (maxLength && inputValue.length > maxLength) {
      setError(`Maximum ${maxLength} characters allowed`);
      return false;
    }

    setError('');
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Sanitize input
    const sanitized = newValue.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    onChange(sanitized);
    validateInput(sanitized);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-300'
          } ${showPasswordToggle && type === 'password' ? 'pr-10' : ''}`}
          {...props}
        />
        
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      
      {error && (
        <p className="text-red-600 text-sm flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3" />
          <span>{error}</span>
        </p>
      )}
      
      {type === 'password' && value && (
        <PasswordStrengthIndicator password={value} />
      )}
    </div>
  );
};

// Security status indicator for the user
export const SecurityStatus = () => {
  const [securityScore, setSecurityScore] = useState(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    const calculateSecurityScore = () => {
      let score = 0;
      const recs: string[] = [];

      // Check if 2FA is enabled
      const has2FA = localStorage.getItem('user_2fa_enabled') === 'true';
      if (has2FA) {
        score += 25;
      } else {
        recs.push('Enable two-factor authentication');
      }

      // Check password age
      const passwordAge = localStorage.getItem('password_last_changed');
      if (passwordAge && Date.now() - parseInt(passwordAge) < 90 * 24 * 60 * 60 * 1000) {
        score += 25;
      } else {
        recs.push('Update your password (last changed over 90 days ago)');
      }

      // Check recent login location
      const lastLoginLocation = localStorage.getItem('last_login_location');
      if (lastLoginLocation) {
        score += 25;
      }

      // Check for verified email
      const emailVerified = localStorage.getItem('email_verified') === 'true';
      if (emailVerified) {
        score += 25;
      } else {
        recs.push('Verify your email address');
      }

      setSecurityScore(score);
      setRecommendations(recs);
    };

    calculateSecurityScore();
  }, []);

  const getScoreColor = () => {
    if (securityScore < 50) return 'text-red-500';
    if (securityScore < 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getScoreText = () => {
    if (securityScore < 50) return 'Low';
    if (securityScore < 75) return 'Medium';
    return 'High';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-3 mb-4">
        <Shield className="w-6 h-6 text-[#2957c3]" />
        <div>
          <h3 className="font-medium text-gray-900">Security Status</h3>
          <div className="flex items-center space-x-2">
            <span className={`font-semibold ${getScoreColor()}`}>
              {getScoreText()} ({securityScore}/100)
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-200 rounded-full h-3 mb-4">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${
            securityScore < 50 ? 'bg-red-500' : securityScore < 75 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${securityScore}%` }}
        />
      </div>

      {recommendations.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Recommended Actions:</h4>
          <ul className="space-y-1">
            {recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                <Lock className="w-3 h-3 mt-0.5 text-gray-400 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default {
  SecurityNotifications,
  PasswordStrengthIndicator,
  SecureInput,
  SecurityStatus
};