import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '@getmocha/users-service/react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, redirectToLogin, logout } = useAuth();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Stays', href: '/stays' },
    { name: 'Owners', href: '/owners' },
    { name: 'Invest', href: '/invest' },
    { name: 'About', href: '/about' },
    { name: 'Stories', href: '/stories' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="https://mocha-cdn.com/0198e085-9738-7b3f-a205-ec01ec5b130b/-logo.png" 
                alt="HabibiStay" 
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-[#2957c3]">HabibiStay</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-[#2957c3] bg-blue-50'
                      : 'text-gray-700 hover:text-[#2957c3] hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {user.google_user_data.picture ? (
                      <img
                        src={user.google_user_data.picture}
                        alt={user.google_user_data.name || user.email}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-[#2957c3] flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {user.google_user_data.given_name || user.email}
                    </span>
                  </div>
                  <Link
                    to="/dashboard"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/wishlist"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Wishlist
                  </Link>
                  <Link
                    to="/profile"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={redirectToLogin}
                  className="bg-[#2957c3] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-100">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.href)
                    ? 'text-[#2957c3] bg-blue-50'
                    : 'text-gray-700 hover:text-[#2957c3] hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile user section */}
            <div className="border-t border-gray-200 pt-4">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 px-3">
                    {user.google_user_data.picture ? (
                      <img
                        src={user.google_user_data.picture}
                        alt={user.google_user_data.name || user.email}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-[#2957c3] flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {user.google_user_data.given_name || user.email}
                    </span>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Wishlist
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    redirectToLogin();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 bg-[#2957c3] text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
