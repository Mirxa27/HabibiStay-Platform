import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '@getmocha/users-service/react';
import { responsiveClasses, containers, utils, cn } from '../utils/responsive';

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
      <div className={containers.page}>
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="https://mocha-cdn.com/0198e085-9738-7b3f-a205-ec01ec5b130b/-logo.png" 
                alt="HabibiStay" 
                className="h-6 w-6 sm:h-8 sm:w-8"
              />
              <span className="text-lg sm:text-xl font-bold text-[#2957c3]">HabibiStay</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className={utils.hideOnMobile}>
            <div className="ml-6 lg:ml-10 flex items-baseline space-x-2 lg:space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'text-[#2957c3] bg-blue-50'
                      : 'text-gray-700 hover:text-[#2957c3] hover:bg-gray-50'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className={utils.hideOnMobile}>
            <div className="ml-2 lg:ml-6 flex items-center">
              {user ? (
                <div className="flex items-center space-x-2 lg:space-x-4">
                  <div className="flex items-center space-x-2">
                    {user.google_user_data.picture ? (
                      <img
                        src={user.google_user_data.picture}
                        alt={user.google_user_data.name || user.email}
                        className="h-6 w-6 lg:h-8 lg:w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-6 w-6 lg:h-8 lg:w-8 rounded-full bg-[#2957c3] flex items-center justify-center">
                        <User className="h-3 w-3 lg:h-5 lg:w-5 text-white" />
                      </div>
                    )}
                    <span className="text-xs lg:text-sm font-medium text-gray-700 max-w-20 lg:max-w-none truncate">
                      {user.google_user_data.given_name || user.email}
                    </span>
                  </div>
                  <div className="hidden lg:flex items-center space-x-4">
                    <Link
                      to="/dashboard"
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/wishlist"
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Wishlist
                    </Link>
                    <Link
                      to="/profile"
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={redirectToLogin}
                  className="bg-[#2957c3] text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-md text-xs lg:text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className={utils.showOnMobile}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                utils.touchButton,
                utils.focusVisible,
                'inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors'
              )}
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? (
                <X className="block h-5 w-5" />
              ) : (
                <Menu className="block h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <>
          <div 
            className={cn(
              responsiveClasses.nav.overlay,
              utils.overscrollBehavior
            )}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div 
            id="mobile-menu"
            className={cn(
              responsiveClasses.nav.panel,
              utils.overscrollBehavior,
              utils.safeTop,
              utils.safeBottom
            )}
          >
            <div className="flex flex-col h-full">
              {/* Mobile menu header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <Link 
                  to="/" 
                  className="flex items-center space-x-2"
                  onClick={() => setIsOpen(false)}
                >
                  <img 
                    src="https://mocha-cdn.com/0198e085-9738-7b3f-a205-ec01ec5b130b/-logo.png" 
                    alt="HabibiStay" 
                    className="h-6 w-6"
                  />
                  <span className="text-lg font-bold text-[#2957c3]">HabibiStay</span>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    utils.touchButton,
                    utils.focusVisible,
                    'inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100'
                  )}
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile navigation links */}
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-1 px-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        utils.touchButton,
                        utils.focusVisible,
                        'flex items-center px-3 py-3 rounded-md text-base font-medium transition-colors w-full justify-start',
                        isActive(item.href)
                          ? 'text-[#2957c3] bg-blue-50'
                          : 'text-gray-700 hover:text-[#2957c3] hover:bg-gray-50'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                {/* Mobile user section */}
                <div className="border-t border-gray-200 mt-6 pt-6 px-4">
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 px-3 py-2">
                        {user.google_user_data.picture ? (
                          <img
                            src={user.google_user_data.picture}
                            alt={user.google_user_data.name || user.email}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-[#2957c3] flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.google_user_data.name || user.google_user_data.given_name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            utils.touchButton,
                            utils.focusVisible,
                            'flex items-center w-full px-3 py-3 text-left text-sm text-gray-700 hover:text-[#2957c3] hover:bg-gray-50 rounded-md transition-colors'
                          )}
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            utils.touchButton,
                            utils.focusVisible,
                            'flex items-center w-full px-3 py-3 text-left text-sm text-gray-700 hover:text-[#2957c3] hover:bg-gray-50 rounded-md transition-colors'
                          )}
                        >
                          Wishlist
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            utils.touchButton,
                            utils.focusVisible,
                            'flex items-center w-full px-3 py-3 text-left text-sm text-gray-700 hover:text-[#2957c3] hover:bg-gray-50 rounded-md transition-colors'
                          )}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setIsOpen(false);
                          }}
                          className={cn(
                            utils.touchButton,
                            utils.focusVisible,
                            'flex items-center w-full px-3 py-3 text-left text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors'
                          )}
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        redirectToLogin();
                        setIsOpen(false);
                      }}
                      className={cn(
                        utils.touchButton,
                        utils.focusVisible,
                        'w-full bg-[#2957c3] text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors'
                      )}
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
