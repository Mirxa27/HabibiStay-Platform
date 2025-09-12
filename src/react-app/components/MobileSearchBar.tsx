import { useState, useEffect } from 'react';
import { Search, Filter, X, MapPin, Calendar, Users } from 'lucide-react';
import { responsiveClasses, utils, helpers, spacing, cn } from '../utils/responsive';

interface MobileSearchBarProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: any) => void;
  placeholder?: string;
  showFilters?: boolean;
}

export default function MobileSearchBar({ 
  onSearch, 
  onFilterChange,
  placeholder = "Search properties...",
  showFilters = true 
}: MobileSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const handleSearch = () => {
    onSearch?.(searchQuery);
  };

  const handleFilterApply = () => {
    onFilterChange?.({
      location,
      checkIn,
      checkOut,
      guests
    });
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setLocation('');
    setCheckIn('');
    setCheckOut('');
    setGuests(1);
    onFilterChange?.({});
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowFilterModal(false);
      }
    };

    if (showFilterModal) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [showFilterModal]);

  return (
    <>
      {/* Search Bar */}
      <div className={cn(
        'flex items-center gap-2 p-4 bg-white shadow-sm border-b',
        utils.safeTop
      )}>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={placeholder}
            className={cn(
              responsiveClasses.form.input,
              utils.focusVisible,
              'pl-10 pr-4 border border-gray-300 rounded-lg'
            )}
          />
        </div>
        
        {showFilters && (
          <button
            onClick={() => setShowFilterModal(true)}
            className={cn(
              utils.touchButton,
              utils.focusVisible,
              'p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors'
            )}
            aria-label="Open filters"
          >
            <Filter className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Filter Modal - Mobile Bottom Sheet */}
      {showFilterModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowFilterModal(false)}
          />
          
          {/* Bottom Sheet */}
          <div className={cn(
            responsiveClasses.mobile.bottomSheet,
            utils.safeBottom,
            'z-50 animate-slide-up'
          )}>
            {/* Pull Handle */}
            <div className={responsiveClasses.mobile.pullHandle} />
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className={cn(
                  utils.touchButton,
                  utils.focusVisible,
                  'p-2 rounded-full hover:bg-gray-100 transition-colors'
                )}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Filter Content */}
            <div className={cn(responsiveClasses.form.container, 'max-h-[60vh] overflow-y-auto')}>
              {/* Location */}
              <div className={responsiveClasses.form.field}>
                <label className={cn(responsiveClasses.form.label, 'text-gray-700')}>
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where do you want to stay?"
                  className={cn(
                    responsiveClasses.form.input,
                    utils.focusVisible,
                    'border border-gray-300 rounded-lg'
                  )}
                />
              </div>

              {/* Dates */}
              <div className={responsiveClasses.form.group}>
                <div className={responsiveClasses.form.field}>
                  <label className={cn(responsiveClasses.form.label, 'text-gray-700')}>
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className={cn(
                      responsiveClasses.form.input,
                      utils.focusVisible,
                      'border border-gray-300 rounded-lg'
                    )}
                  />
                </div>
                
                <div className={responsiveClasses.form.field}>
                  <label className={cn(responsiveClasses.form.label, 'text-gray-700')}>
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className={cn(
                      responsiveClasses.form.input,
                      utils.focusVisible,
                      'border border-gray-300 rounded-lg'
                    )}
                  />
                </div>
              </div>

              {/* Guests */}
              <div className={responsiveClasses.form.field}>
                <label className={cn(responsiveClasses.form.label, 'text-gray-700')}>
                  <Users className="w-4 h-4 inline mr-2" />
                  Guests
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className={cn(
                      utils.touchButton,
                      'w-10 h-10 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors',
                      guests <= 1 && 'opacity-50 cursor-not-allowed'
                    )}
                    disabled={guests <= 1}
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                    {guests}
                  </span>
                  <button
                    onClick={() => setGuests(Math.min(12, guests + 1))}
                    className={cn(
                      utils.touchButton,
                      'w-10 h-10 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors',
                      guests >= 12 && 'opacity-50 cursor-not-allowed'
                    )}
                    disabled={guests >= 12}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className={cn(
              'flex gap-3 pt-6 border-t border-gray-200 mt-6',
              utils.safeBottom
            )}>
              <button
                onClick={clearFilters}
                className={cn(
                  utils.touchButton,
                  utils.focusVisible,
                  'flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors'
                )}
              >
                Clear All
              </button>
              <button
                onClick={handleFilterApply}
                className={cn(
                  utils.touchButton,
                  utils.focusVisible,
                  'flex-1 py-3 px-4 bg-[#2957c3] text-white rounded-lg font-medium hover:bg-blue-700 transition-colors'
                )}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}