import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';
import { 
  Home, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Star,
  Heart,
  Settings,
  Plus,
  Eye,
  Edit3
} from 'lucide-react';
import type { Property, Booking } from '@/shared/types';
import { responsiveClasses, containers, utils, cn } from '../utils/responsive';

export default function DashboardPage() {
  const { user, redirectToLogin } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'bookings' | 'earnings'>('overview');

  useEffect(() => {
    if (!user) {
      redirectToLogin();
      return;
    }
    fetchDashboardData();
  }, [user, redirectToLogin]);

  const fetchDashboardData = async () => {
    try {
      const [propertiesRes, bookingsRes] = await Promise.all([
        fetch('/api/properties/my-properties'),
        fetch('/api/bookings/my-bookings')
      ]);

      const propertiesData = await propertiesRes.json();
      const bookingsData = await bookingsRes.json();

      if (propertiesData.success) setProperties(propertiesData.data);
      if (bookingsData.success) setBookings(bookingsData.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={cn(
        "min-h-screen bg-gray-50",
        responsiveClasses.flex.center
      )}>
        <div className="text-center">
          <h2 className={cn(
            responsiveClasses.text.h2,
            "text-gray-900 mb-2 sm:mb-4"
          )}>Sign In Required</h2>
          <p className={cn(
            responsiveClasses.text.body,
            "text-gray-600 mb-4 sm:mb-6"
          )}>Please sign in to access your dashboard.</p>
          <button
            onClick={redirectToLogin}
            className={cn(
              "bg-[#2957c3] text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors",
              responsiveClasses.button.primary,
              utils.touchTarget
            )}
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
        <div className={containers.page}>
          <div className={cn(
            "animate-pulse space-y-4 sm:space-y-6",
            responsiveClasses.padding.section
          )}>
            <div className="h-6 sm:h-8 bg-gray-300 rounded w-1/4"></div>
            <div className={cn(
              responsiveClasses.grid.quad,
              "gap-4 sm:gap-6"
            )}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 sm:h-32 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
            <div className="h-64 sm:h-96 bg-gray-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const totalEarnings = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.total_amount, 0);

  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const averageRating = 4.8; // This would come from reviews in real implementation

  const stats = [
    {
      title: 'Total Earnings',
      value: `${totalEarnings.toLocaleString()} SAR`,
      icon: DollarSign,
      change: '+12%',
      positive: true,
    },
    {
      title: 'Active Properties',
      value: properties.filter(p => p.is_active).length.toString(),
      icon: Home,
      change: '+2',
      positive: true,
    },
    {
      title: 'Completed Bookings',
      value: completedBookings.toString(),
      icon: Users,
      change: '+8%',
      positive: true,
    },
    {
      title: 'Average Rating',
      value: averageRating.toString(),
      icon: Star,
      change: '+0.2',
      positive: true,
    },
  ];

  const recentBookings = bookings.slice(0, 5);
  const topProperties = properties.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={containers.page}>
        {/* Header */}
        <div className={cn(
          responsiveClasses.padding.section,
          "border-b pb-4 sm:pb-6 mb-6 sm:mb-8"
        )}>
          <h1 className={cn(
            responsiveClasses.text.h1,
            "text-gray-900 mb-1 sm:mb-2"
          )}>
            Welcome back, {user.google_user_data.given_name || user.email}!
          </h1>
          <p className={cn(
            responsiveClasses.text.body,
            "text-gray-600"
          )}>Here's what's happening with your properties and investments.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 sm:mb-8">
          <nav className={cn(
            "flex overflow-x-auto",
            "gap-2 sm:gap-4 md:gap-8",
            "pb-2 scrollbar-hide"
          )}>
            {[
              { key: 'overview', label: 'Overview', icon: Home },
              { key: 'properties', label: 'Properties', icon: Home },
              { key: 'bookings', label: 'Bookings', icon: Calendar },
              { key: 'earnings', label: 'Earnings', icon: DollarSign },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  "flex items-center border-b-2 font-medium whitespace-nowrap",
                  responsiveClasses.button.secondary,
                  utils.touchTarget,
                  activeTab === tab.key
                    ? 'border-[#2957c3] text-[#2957c3]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className={responsiveClasses.text.small}>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Stats Grid */}
            <div className={cn(
              responsiveClasses.grid.quad,
              "gap-4 sm:gap-6"
            )}>
              {stats.map((stat, index) => (
                <div key={index} className={cn(
                  responsiveClasses.card.base,
                  responsiveClasses.card.padding
                )}>
                  <div className={responsiveClasses.flex.between}>
                    <div>
                      <p className={cn(
                        responsiveClasses.text.small,
                        "font-medium text-gray-600 mb-1"
                      )}>{stat.title}</p>
                      <p className={cn(
                        "text-xl sm:text-2xl font-bold text-gray-900"
                      )}>{stat.value}</p>
                    </div>
                    <div className={cn(
                      "p-2 sm:p-3 rounded-full",
                      stat.positive ? 'bg-green-100' : 'bg-red-100'
                    )}>
                      <stat.icon className={cn(
                        "w-5 h-5 sm:w-6 sm:h-6",
                        stat.positive ? 'text-green-600' : 'text-red-600'
                      )} />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4">
                    <span className={cn(
                      responsiveClasses.text.small,
                      "font-medium",
                      stat.positive ? 'text-green-600' : 'text-red-600'
                    )}>
                      {stat.change}
                    </span>
                    <span className={cn(
                      responsiveClasses.text.small,
                      "text-gray-500 ml-1"
                    )}>from last month</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/properties/new"
                  className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#2957c3] hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-6 h-6 text-gray-400 mr-3" />
                  <span className="font-medium text-gray-700">Add New Property</span>
                </Link>
                <Link
                  to="/wishlist"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Heart className="w-6 h-6 text-gray-400 mr-3" />
                  <span className="font-medium text-gray-700">View Wishlist</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-6 h-6 text-gray-400 mr-3" />
                  <span className="font-medium text-gray-700">Account Settings</span>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Bookings */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
                {recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{booking.guest_name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
                          </p>
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
                ) : (
                  <p className="text-gray-500 text-center py-8">No bookings yet</p>
                )}
              </div>

              {/* Top Properties */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Properties</h2>
                {topProperties.length > 0 ? (
                  <div className="space-y-4">
                    {topProperties.map((property) => (
                      <div key={property.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                        <img
                          src={(property.images ? JSON.parse(property.images)[0] : null) || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=100&h=100'}
                          alt={property.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{property.title}</p>
                          <p className="text-sm text-gray-600">{property.location}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            to={`/property/${property.id}`}
                            className="p-1 text-gray-400 hover:text-[#2957c3]"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/properties/${property.id}/edit`}
                            className="p-1 text-gray-400 hover:text-[#2957c3]"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't listed any properties yet</p>
                    <Link
                      to="/properties/new"
                      className="bg-[#2957c3] text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      List Your First Property
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Properties</h2>
              <Link
                to="/properties/new"
                className="bg-[#2957c3] text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Link>
            </div>
            
            {properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div key={property.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={(property.images ? JSON.parse(property.images)[0] : null) || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&h=200'}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2">{property.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{property.location}</p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-[#2957c3]">{property.price_per_night} SAR/night</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          property.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {property.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/property/${property.id}`}
                          className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-center text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          View
                        </Link>
                        <Link
                          to={`/properties/${property.id}/edit`}
                          className="flex-1 bg-[#2957c3] text-white px-3 py-2 rounded text-center text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties listed yet</h3>
                <p className="text-gray-600 mb-6">Start earning by listing your first property on HabibiStay</p>
                <Link
                  to="/properties/new"
                  className="bg-[#2957c3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  List Your First Property
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">My Bookings</h2>
            
            {bookings.length > 0 ? (
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
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status}
                            </span>
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
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-600">Your bookings will appear here once guests start booking your properties</p>
              </div>
            )}
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Total Earnings</h3>
                <p className="text-3xl font-bold text-[#2957c3]">{totalEarnings.toLocaleString()} SAR</p>
                <p className="text-sm text-green-600 mt-1">+12% from last month</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-medium text-gray-700 mb-2">This Month</h3>
                <p className="text-3xl font-bold text-gray-900">{Math.round(totalEarnings * 0.15).toLocaleString()} SAR</p>
                <p className="text-sm text-green-600 mt-1">+8% from last month</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Average per Booking</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {completedBookings > 0 ? Math.round(totalEarnings / completedBookings).toLocaleString() : 0} SAR
                </p>
                <p className="text-sm text-gray-600 mt-1">Per completed booking</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Earnings Overview</h2>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Earnings chart will be displayed here</p>
                  <p className="text-sm text-gray-500">Data visualization coming soon</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
