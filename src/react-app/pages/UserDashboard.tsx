import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { 
  User, 
  Calendar, 
  Heart, 
  Home,
  Eye,
  CreditCard,
  Clock,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router';
import type { Booking, Property } from '@/shared/types';

interface DashboardStats {
  total_bookings: number;
  upcoming_bookings: number;
  wishlist_count: number;
  total_spent: number;
}

interface UserBooking extends Booking {
  property_title: string;
  property_location: string;
  property_image: string;
}

export default function UserDashboard() {
  const { user, redirectToLogin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'wishlist'>('overview');
  
  const [stats, setStats] = useState<DashboardStats>({
    total_bookings: 0,
    upcoming_bookings: 0,
    wishlist_count: 0,
    total_spent: 0
  });
  
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [wishlist, setWishlist] = useState<Property[]>([]);

  useEffect(() => {
    if (!user) {
      redirectToLogin();
      return;
    }
    fetchUserData();
  }, [user, redirectToLogin]);

  const fetchUserData = async () => {
    try {
      const [bookingsRes, wishlistRes] = await Promise.all([
        fetch('/api/bookings/my-bookings'),
        fetch('/api/wishlist')
      ]);

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        if (bookingsData.success) {
          setBookings(bookingsData.data);
          // Calculate stats from bookings
          const upcoming = bookingsData.data.filter((b: UserBooking) => new Date(b.check_in_date) > new Date()).length;
          const totalSpent = bookingsData.data.reduce((sum: number, b: UserBooking) => sum + b.total_amount, 0);
          setStats(prev => ({
            ...prev,
            total_bookings: bookingsData.data.length,
            upcoming_bookings: upcoming,
            total_spent: totalSpent
          }));
        }
      }

      if (wishlistRes.ok) {
        const wishlistData = await wishlistRes.json();
        if (wishlistData.success) {
          setWishlist(wishlistData.data);
          setStats(prev => ({ ...prev, wishlist_count: wishlistData.data.length }));
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (propertyId: number) => {
    try {
      const response = await fetch(`/api/wishlist/${propertyId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setWishlist(prev => prev.filter(p => p.id !== propertyId));
        setStats(prev => ({ ...prev, wishlist_count: prev.wishlist_count - 1 }));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingBookings = bookings.filter(b => new Date(b.check_in_date) > new Date());

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access your dashboard.</p>
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
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Home },
    { key: 'bookings', label: 'My Bookings', icon: Calendar },
    { key: 'wishlist', label: 'Wishlist', icon: Heart },
  ];

  const overviewStats = [
    {
      title: 'Total Bookings',
      value: stats.total_bookings.toString(),
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Upcoming Trips',
      value: stats.upcoming_bookings.toString(),
      icon: Clock,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Wishlist Items',
      value: stats.wishlist_count.toString(),
      icon: Heart,
      color: 'bg-red-100 text-red-600',
    },
    {
      title: 'Total Spent',
      value: `${stats.total_spent.toLocaleString()} SAR`,
      icon: CreditCard,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-[#2957c3] flex items-center justify-center">
                {user.google_user_data?.picture ? (
                  <img
                    src={user.google_user_data.picture}
                    alt={user.google_user_data.name || 'User'}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user.google_user_data?.name || 'Guest'}!
                </h1>
                <p className="text-gray-600">Manage your bookings and wishlist</p>
              </div>
            </div>
            
            <Link
              to="/properties"
              className="bg-[#2957c3] text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Browse Properties
            </Link>
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
                    <div className={`p-3 rounded-full ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upcoming Bookings */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Trips</h2>
                {upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                        <img
                          src={booking.property_image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=100&h=100'}
                          alt={booking.property_title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{booking.property_title}</h3>
                          <p className="text-sm text-gray-600">{booking.property_location}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${getBookingStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No upcoming trips planned</p>
                    <Link
                      to="/properties"
                      className="text-[#2957c3] text-sm font-medium hover:text-blue-700"
                    >
                      Browse properties →
                    </Link>
                  </div>
                )}
              </div>

              {/* Recent Wishlist */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Saved Properties</h2>
                {wishlist.length > 0 ? (
                  <div className="space-y-4">
                    {wishlist.slice(0, 3).map((property) => (
                      <div key={property.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                        <img
                          src={(property.images ? JSON.parse(property.images)[0] : null) || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=100&h=100'}
                          alt={property.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{property.title}</h3>
                          <p className="text-sm text-gray-600">{property.location}</p>
                          <p className="text-sm font-medium text-[#2957c3]">{property.price_per_night} SAR/night</p>
                        </div>
                        <Link
                          to={`/property/${property.id}`}
                          className="text-[#2957c3] hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No saved properties yet</p>
                    <Link
                      to="/properties"
                      className="text-[#2957c3] text-sm font-medium hover:text-blue-700"
                    >
                      Discover amazing places →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
            
            {bookings.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Property</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Dates</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Guests</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Amount</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-gray-100">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <img
                                src={booking.property_image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=100&h=100'}
                                alt={booking.property_title}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-medium text-gray-900">{booking.property_title}</p>
                                <p className="text-sm text-gray-600">{booking.property_location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(booking.check_in_date).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                to {new Date(booking.check_out_date).toLocaleDateString()}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm text-gray-900">{booking.total_guests} guests</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-medium text-gray-900">{booking.total_amount} SAR</p>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 rounded-full text-xs ${getBookingStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-600 mb-6">Start planning your next getaway!</p>
                <Link
                  to="/properties"
                  className="bg-[#2957c3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Browse Properties
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
              <p className="text-gray-600">{wishlist.length} saved properties</p>
            </div>
            
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((property) => (
                  <div key={property.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                    <div className="relative">
                      <img
                        src={(property.images ? JSON.parse(property.images)[0] : null) || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&h=250'}
                        alt={property.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={() => removeFromWishlist(property.id)}
                        className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white shadow-sm"
                      >
                        <Heart className="w-4 h-4 text-red-500 fill-current" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{property.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {property.location}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-[#2957c3]">{property.price_per_night} SAR/night</p>
                        <Link
                          to={`/property/${property.id}`}
                          className="px-3 py-1 bg-[#2957c3] text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-600 mb-6">Save properties you love to view them later</p>
                <Link
                  to="/properties"
                  className="bg-[#2957c3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Discover Properties
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}