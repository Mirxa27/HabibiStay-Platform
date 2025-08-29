import { useState } from 'react';
import { Link } from 'react-router';
import { Cookie, Settings, Shield, BarChart3, Target } from 'lucide-react';

export default function CookiesPage() {
  const [preferences, setPreferences] = useState({
    necessary: true, // Always enabled
    analytics: true,
    marketing: false,
    functional: true,
  });

  const lastUpdated = 'December 15, 2024';

  const cookieTypes = [
    {
      icon: Shield,
      type: 'Necessary Cookies',
      enabled: preferences.necessary,
      required: true,
      description: 'Essential for the website to function properly. These cannot be disabled.',
      examples: [
        'Authentication and security',
        'Session management',
        'Load balancing',
        'Privacy preferences'
      ]
    },
    {
      icon: BarChart3,
      type: 'Analytics Cookies',
      enabled: preferences.analytics,
      required: false,
      description: 'Help us understand how visitors interact with our website.',
      examples: [
        'Google Analytics',
        'Page view tracking',
        'User behavior analysis',
        'Performance monitoring'
      ]
    },
    {
      icon: Target,
      type: 'Marketing Cookies',
      enabled: preferences.marketing,
      required: false,
      description: 'Used to track visitors and display relevant advertisements.',
      examples: [
        'Social media pixels',
        'Advertising platforms',
        'Remarketing tags',
        'Conversion tracking'
      ]
    },
    {
      icon: Settings,
      type: 'Functional Cookies',
      enabled: preferences.functional,
      required: false,
      description: 'Enable enhanced functionality and personalization.',
      examples: [
        'Language preferences',
        'Chat widget settings',
        'Search filters',
        'User interface preferences'
      ]
    }
  ];

  const handlePreferenceChange = (type: string, enabled: boolean) => {
    if (type === 'necessary') return; // Cannot disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [type]: enabled
    }));
  };

  const savePreferences = () => {
    // Save preferences to localStorage or send to server
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    
    // You could also send to your API
    // fetch('/api/user/cookie-preferences', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(preferences)
    // });
    
    alert('Cookie preferences saved successfully!');
  };

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    alert('All cookies accepted!');
  };

  const rejectAll = () => {
    const minimal = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    setPreferences(minimal);
    localStorage.setItem('cookiePreferences', JSON.stringify(minimal));
    alert('Only necessary cookies will be used.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-[#2957c3] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Cookie className="h-16 w-16 mx-auto mb-4 text-blue-200" />
            <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
            <p className="text-xl text-blue-100 mb-2">
              How we use cookies and similar technologies
            </p>
            <p className="text-blue-200">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Cookies are small text files that are stored on your device when you visit our website. 
            They help us provide you with a better experience by remembering your preferences, 
            analyzing how our website is used, and personalizing content.
          </p>
          <p className="text-gray-600 leading-relaxed">
            We use cookies and similar technologies like web beacons, pixels, and local storage 
            to enhance your experience on HabibiStay.
          </p>
        </div>

        {/* Cookie Preferences */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Manage Your Cookie Preferences</h2>
            <div className="flex space-x-3">
              <button
                onClick={acceptAll}
                className="bg-[#2957c3] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={rejectAll}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Reject All
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {cookieTypes.map((category, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#2957c3] bg-opacity-10 rounded-lg flex items-center justify-center">
                      <category.icon className="h-6 w-6 text-[#2957c3]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {category.type}
                        {category.required && (
                          <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                            Required
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Examples:</h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          {category.examples.map((example, idx) => (
                            <li key={idx} className="flex items-center">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={category.enabled}
                        onChange={(e) => handlePreferenceChange(
                          category.type.toLowerCase().split(' ')[0], 
                          e.target.checked
                        )}
                        disabled={category.required}
                        className="rounded border-gray-300 text-[#2957c3] focus:ring-[#2957c3] disabled:opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {category.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={savePreferences}
              className="bg-[#2957c3] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>

        {/* How We Use Cookies */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How We Use Cookies</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Essential Functions</h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-[#2957c3] rounded-full mr-3 mt-2"></span>
                  Keep you signed in to your account
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-[#2957c3] rounded-full mr-3 mt-2"></span>
                  Remember your search preferences
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-[#2957c3] rounded-full mr-3 mt-2"></span>
                  Maintain your shopping cart contents
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-[#2957c3] rounded-full mr-3 mt-2"></span>
                  Ensure website security and prevent fraud
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Improvements & Analytics</h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-[#2957c3] rounded-full mr-3 mt-2"></span>
                  Understand how you use our website
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-[#2957c3] rounded-full mr-3 mt-2"></span>
                  Identify popular content and features
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-[#2957c3] rounded-full mr-3 mt-2"></span>
                  Improve website performance and speed
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-[#2957c3] rounded-full mr-3 mt-2"></span>
                  Personalize your experience
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Third-Party Cookies */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Third-Party Cookies</h2>
          
          <p className="text-gray-600 mb-6">
            We work with trusted third-party services that may also set cookies on your device:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Google Analytics</h3>
              <p className="text-gray-600 text-sm mb-3">
                Helps us understand website usage and improve user experience.
              </p>
              <a 
                href="https://policies.google.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#2957c3] hover:text-blue-700 text-sm font-medium"
              >
                Privacy Policy →
              </a>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">MyFatoorah</h3>
              <p className="text-gray-600 text-sm mb-3">
                Secure payment processing for bookings and transactions.
              </p>
              <a 
                href="https://myfatoorah.com/privacy-policy/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#2957c3] hover:text-blue-700 text-sm font-medium"
              >
                Privacy Policy →
              </a>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Social Media</h3>
              <p className="text-gray-600 text-sm mb-3">
                Social sharing buttons and embedded content from social platforms.
              </p>
              <span className="text-gray-500 text-sm">Various providers</span>
            </div>
          </div>
        </div>

        {/* Managing Cookies */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Managing Cookies in Your Browser</h2>
          
          <p className="text-gray-600 mb-6">
            You can also control cookies through your browser settings. Here's how to manage cookies 
            in popular browsers:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Desktop Browsers</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[#2957c3] hover:text-blue-700">
                    Google Chrome →
                  </a>
                </li>
                <li>
                  <a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-[#2957c3] hover:text-blue-700">
                    Mozilla Firefox →
                  </a>
                </li>
                <li>
                  <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[#2957c3] hover:text-blue-700">
                    Safari →
                  </a>
                </li>
                <li>
                  <a href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-[#2957c3] hover:text-blue-700">
                    Microsoft Edge →
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Mobile Browsers</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[#2957c3] hover:text-blue-700">
                    Chrome Mobile →
                  </a>
                </li>
                <li>
                  <a href="https://support.apple.com/en-us/HT201265" target="_blank" rel="noopener noreferrer" className="text-[#2957c3] hover:text-blue-700">
                    Safari Mobile →
                  </a>
                </li>
                <li>
                  <a href="https://support.mozilla.org/en-US/kb/clear-your-browsing-history-and-other-personal-data" target="_blank" rel="noopener noreferrer" className="text-[#2957c3] hover:text-blue-700">
                    Firefox Mobile →
                  </a>
                </li>
                <li>
                  <a href="https://help.opera.com/en/mobile/android/#privacy" target="_blank" rel="noopener noreferrer" className="text-[#2957c3] hover:text-blue-700">
                    Opera Mobile →
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> Disabling certain cookies may affect the functionality of our website 
              and prevent you from using some features.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Questions About Cookies?</h3>
          <p className="text-gray-600 mb-4">
            If you have any questions about our use of cookies or this Cookie Policy, please contact us:
          </p>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <a 
              href="mailto:privacy@habibistay.com" 
              className="text-[#2957c3] hover:text-blue-700 font-medium"
            >
              privacy@habibistay.com
            </a>
            <Link 
              to="/contact" 
              className="text-[#2957c3] hover:text-blue-700 font-medium"
            >
              Contact Form →
            </Link>
          </div>
        </div>

        {/* Related Policies */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Related Policies:</p>
          <div className="space-x-4">
            <Link to="/privacy" className="text-[#2957c3] hover:text-blue-700 font-medium">
              Privacy Policy
            </Link>
            <span className="text-gray-300">|</span>
            <Link to="/terms" className="text-[#2957c3] hover:text-blue-700 font-medium">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
