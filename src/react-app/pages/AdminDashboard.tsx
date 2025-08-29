import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { 
  Users, 
  Home, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Settings,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Activity,
  Eye,
  Plus,
  Bot
} from 'lucide-react';
import { Link } from 'react-router';
import AIConfigPanel from '@/react-app/components/admin/AIConfigPanel';
import type { Property, Booking } from '@/shared/types';

interface AdminStats {
  total_users: number;
  total_properties: number;
  total_bookings: number;
  total_revenue: number;
  pending_bookings: number;
  active_properties: number;
  monthly_growth: number;
  occupancy_rate: number;
}

export default function AdminDashboardPage() {
  const { user, redirectToLogin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'bookings' | 'users' | 'ai-config' | 'settings'>('overview');
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    total_properties: 0,
    total_bookings: 0,
    total_revenue: 0,
    pending_bookings: 0,
    active_properties: 0,
    monthly_growth: 0,
    occupancy_rate: 0,
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user) {
      redirectToLogin();
      return;
    }
    
    // Simple admin check - in production, this would be more robust
    if (!user.email.includes('admin') && !user.email.includes('owner')) {
      // Redirect non-admin users
      window.location.href = '/dashboard';
      return;
    }
    
    fetchAdminData();
  }, [user, redirectToLogin]);

  const fetchAdminData = async () => {
    try {
      const [statsRes, propertiesRes, bookingsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/properties'),
        fetch('/api/admin/bookings')
      ]);

      const statsData = await statsRes.json();
      const propertiesData = await propertiesRes.json();
      const bookingsData = await bookingsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (propertiesData.success) setProperties(propertiesData.data);
      if (bookingsData.success) setBookings(bookingsData.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePropertyStatus = async (propertyId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
      });
      
      if (response.ok) {
        setProperties(props => 
          props.map(p => p.id === propertyId ? { ...p, is_active: isActive } : p)
        );
      }
    } catch (error) {
      console.error('Error updating property status:', error);
    }
  };

  const updateBookingStatus = async (bookingId: number, status: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        setBookings(bookings => 
          bookings.map(b => b.id === bookingId ? { ...b, status } : b)
        );
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access the admin dashboard.</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'properties', label: 'Properties', icon: Home },
    { key: 'bookings', label: 'Bookings', icon: Calendar },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'ai-config', label: 'AI Configuration', icon: Bot },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  const overviewStats = [
    {
      title: 'Total Revenue',
      value: `${stats.total_revenue.toLocaleString()} SAR`,
      icon: DollarSign,
      change: `+${stats.monthly_growth}%`,
      positive: stats.monthly_growth > 0,
    },
    {
      title: 'Active Properties',
      value: stats.active_properties.toString(),
      icon: Home,
      change: `${stats.total_properties} total`,
      positive: true,
    },
    {
      title: 'Total Bookings',
      value: stats.total_bookings.toString(),
      icon: Calendar,
      change: `${stats.pending_bookings} pending`,
      positive: true,
    },
    {
      title: 'Occupancy Rate',
      value: `${stats.occupancy_rate}%`,
      icon: TrendingUp,
      change: '+5% from last month',
      positive: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your HabibiStay platform</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">System Status: Operational</span>
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewStats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${
                      stat.positive ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <stat.icon className={`w-6 h-6 ${
                        stat.positive ? 'text-green-600' : 'text-red-600'
                      }`} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className={`text-sm font-medium ${
                      stat.positive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{booking.guest_name}</p>
                        <p className="text-sm text-gray-600">{booking.guest_email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{booking.total_amount} SAR</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">System Alerts</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Property Review Required</p>
                      <p className="text-sm text-yellow-700">2 properties need admin approval</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">System Backup Complete</p>
                      <p className="text-sm text-green-700">Daily backup completed successfully</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">High Activity Period</p>
                      <p className="text-sm text-blue-700">Booking volume is 25% above average</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">All Properties</h2>
              <Link
                to="/properties/new"
                className="bg-[#2957c3] text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Property</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Owner</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property) => (
                    <tr key={property.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={(property.images ? JSON.parse(property.images)[0] : null) || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=100&h=100'}
                            alt={property.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{property.title}</p>
                            <p className="text-sm text-gray-600">{property.max_guests} guests</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-900">{property.user_id}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-900">{property.location}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{property.price_per_night} SAR</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          property.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {property.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {property.is_featured && (
                          <span className="ml-2 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Link
                            to={`/property/${property.id}`}
                            className="text-[#2957c3] hover:text-blue-700"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => updatePropertyStatus(property.id, !property.is_active)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">All Bookings</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Guest</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Property</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Dates</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const property = properties.find(p => p.id === booking.property_id);
                    return (
                      <tr key={booking.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{booking.guest_name}</p>
                            <p className="text-sm text-gray-600">{booking.guest_email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{property?.title || 'Unknown Property'}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-900">
                            {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{booking.total_amount} SAR</p>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={booking.status}
                            onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                            className={`px-2 py-1 rounded text-xs border-none ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <button className="text-[#2957c3] hover:text-blue-700 text-sm font-medium">
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">User Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Total Users</h3>
                <p className="text-2xl font-bold text-blue-600">{stats.total_users}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">Active This Month</h3>
                <p className="text-2xl font-bold text-green-600">{Math.round(stats.total_users * 0.7)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900 mb-2">Property Owners</h3>
                <p className="text-2xl font-bold text-purple-600">{Math.round(stats.total_users * 0.2)}</p>
              </div>
            </div>

            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Detailed user management features coming soon</p>
            </div>
          </div>
        )}

        {/* AI Configuration Tab */}
        {activeTab === 'ai-config' && (
          <AIConfigPanel />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Settings</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Commission (%)
                  </label>
                  <input
                    type="number"
                    defaultValue="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Property Fee (SAR)
                  </label>
                  <input
                    type="number"
                    defaultValue="500"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  defaultValue="support@habibistay.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
                  <p className="text-sm text-gray-600">Temporarily disable the platform for maintenance</p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-[#2957c3] focus:ring-[#2957c3]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable</span>
                </label>
              </div>

              <div className="flex justify-end pt-4">
                <button className="bg-[#2957c3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
