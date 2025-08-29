import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { 
  User, 
  Camera, 
  Save, 
  Bell, 
  Shield, 
  Eye,
  EyeOff
} from 'lucide-react';

interface UserProfile {
  full_name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  date_of_birth: string;
  preferred_language: string;
  currency: string;
  bio: string;
}

interface NotificationSettings {
  email_booking_updates: boolean;
  email_marketing: boolean;
  sms_booking_updates: boolean;
  push_notifications: boolean;
}

export default function ProfilePage() {
  const { user, redirectToLogin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'security'>('profile');
  
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    country: 'Saudi Arabia',
    date_of_birth: '',
    preferred_language: 'en',
    currency: 'SAR',
    bio: '',
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_booking_updates: true,
    email_marketing: false,
    sms_booking_updates: true,
    push_notifications: true,
  });

  const [showPersonalInfo, setShowPersonalInfo] = useState(true);
  const [showContactInfo, setShowContactInfo] = useState(true);

  useEffect(() => {
    if (!user) {
      redirectToLogin();
      return;
    }
    fetchProfile();
  }, [user, redirectToLogin]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/profile');
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.data.profile || profile);
        setNotifications(data.data.notifications || notifications);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, notifications }),
      });
      
      const data = await response.json();
      if (data.success) {
        // Show success message
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access your profile.</p>
          <button
            onClick={redirectToLogin}
            className="bg-[#2957c3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="h-64 bg-gray-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'profile', label: 'Profile Information', icon: User },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'privacy', label: 'Privacy Settings', icon: Shield },
    { key: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your profile and account preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              {user.google_user_data.picture ? (
                <img
                  src={user.google_user_data.picture}
                  alt={user.google_user_data.name || user.email}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-[#2957c3] rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {user.google_user_data.name || profile.full_name || user.email}
              </h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Member since {new Date(user.created_at).getFullYear()}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center px-3 py-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-[#2957c3] text-[#2957c3]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Personal Information</h3>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                    placeholder="+966 XXX XXX XXX"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                  placeholder="Enter your address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                    placeholder="Enter your city"
                  />
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    id="country"
                    value={profile.country}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                  >
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Kuwait">Kuwait</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Bahrain">Bahrain</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="date_of_birth"
                    value={profile.date_of_birth}
                    onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="preferred_language" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Language
                  </label>
                  <select
                    id="preferred_language"
                    value={profile.preferred_language}
                    onChange={(e) => setProfile({ ...profile, preferred_language: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent resize-none"
                  placeholder="Tell us about yourself..."
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving}
                  className="bg-[#2957c3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Notification Preferences</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Booking Updates</h4>
                  <p className="text-sm text-gray-600">Get notified about booking confirmations, changes, and updates</p>
                </div>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifications.email_booking_updates}
                      onChange={(e) => setNotifications({ ...notifications, email_booking_updates: e.target.checked })}
                      className="rounded border-gray-300 text-[#2957c3] focus:ring-[#2957c3]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Email</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifications.sms_booking_updates}
                      onChange={(e) => setNotifications({ ...notifications, sms_booking_updates: e.target.checked })}
                      className="rounded border-gray-300 text-[#2957c3] focus:ring-[#2957c3]"
                    />
                    <span className="ml-2 text-sm text-gray-700">SMS</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Marketing Communications</h4>
                  <p className="text-sm text-gray-600">Receive newsletters, promotions, and special offers</p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notifications.email_marketing}
                    onChange={(e) => setNotifications({ ...notifications, email_marketing: e.target.checked })}
                    className="rounded border-gray-300 text-[#2957c3] focus:ring-[#2957c3]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Email</span>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Push Notifications</h4>
                  <p className="text-sm text-gray-600">Receive push notifications on your device</p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notifications.push_notifications}
                    onChange={(e) => setNotifications({ ...notifications, push_notifications: e.target.checked })}
                    className="rounded border-gray-300 text-[#2957c3] focus:ring-[#2957c3]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable</span>
                </label>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="bg-[#2957c3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Settings Tab */}
        {activeTab === 'privacy' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Privacy Settings</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Show Personal Information</h4>
                  <p className="text-sm text-gray-600">Allow other users to see your profile information</p>
                </div>
                <button
                  onClick={() => setShowPersonalInfo(!showPersonalInfo)}
                  className="flex items-center text-[#2957c3] hover:text-blue-700"
                >
                  {showPersonalInfo ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  <span className="ml-2">{showPersonalInfo ? 'Visible' : 'Hidden'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Show Contact Information</h4>
                  <p className="text-sm text-gray-600">Allow hosts to see your contact details for bookings</p>
                </div>
                <button
                  onClick={() => setShowContactInfo(!showContactInfo)}
                  className="flex items-center text-[#2957c3] hover:text-blue-700"
                >
                  {showContactInfo ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  <span className="ml-2">{showContactInfo ? 'Visible' : 'Hidden'}</span>
                </button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Data Management</h4>
                <div className="space-y-3">
                  <button className="text-[#2957c3] hover:text-blue-700 text-sm font-medium">
                    Download Your Data
                  </button>
                  <br />
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Security Settings</h3>
            
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">Account Secured with Google OAuth</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your account is secured through Google's authentication system.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <button className="bg-[#2957c3] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Enable 2FA
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Active Sessions</h4>
                    <p className="text-sm text-gray-600">Manage devices that are signed into your account</p>
                  </div>
                  <button className="text-[#2957c3] hover:text-blue-700 text-sm font-medium">
                    View Sessions
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Login Alerts</h4>
                    <p className="text-sm text-gray-600">Get notified when someone signs into your account</p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-[#2957c3] focus:ring-[#2957c3]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
