/**
 * Responsive Design Utilities for HabibiStay
 * Mobile-first responsive design system with Tailwind CSS
 */

// Breakpoint system (Tailwind CSS defaults)
export const breakpoints = {
  sm: '640px',   // Small devices (landscape phones, 640px and up)
  md: '768px',   // Medium devices (tablets, 768px and up)
  lg: '1024px',  // Large devices (desktops, 1024px and up)
  xl: '1280px',  // Extra large devices (large desktops, 1280px and up)
  '2xl': '1536px' // 2X Large devices (larger desktops, 1536px and up)
};

// Common responsive class patterns
export const responsiveClasses = {
  // Grid systems
  grid: {
    single: 'grid grid-cols-1',
    double: 'grid grid-cols-1 md:grid-cols-2',
    triple: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    quad: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    auto: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
  },
  
  // Flexbox layouts
  flex: {
    column: 'flex flex-col',
    columnToRow: 'flex flex-col md:flex-row',
    wrap: 'flex flex-wrap',
    between: 'flex flex-col md:flex-row md:justify-between md:items-center',
    center: 'flex flex-col items-center justify-center',
    end: 'flex flex-col md:flex-row md:justify-end md:items-center'
  },
  
  // Spacing
  padding: {
    page: 'px-4 sm:px-6 lg:px-8',
    section: 'py-8 md:py-12 lg:py-16',
    card: 'p-4 md:p-6',
    modal: 'p-4 sm:p-6 md:p-8'
  },
  
  // Typography
  text: {
    h1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold',
    h2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold',
    h3: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold',
    h4: 'text-base sm:text-lg md:text-xl lg:text-2xl font-semibold',
    body: 'text-sm sm:text-base',
    small: 'text-xs sm:text-sm',
    center: 'text-center',
    left: 'text-left md:text-left',
    responsive: 'text-center md:text-left'
  },
  
  // Buttons
  button: {
    primary: 'w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base',
    secondary: 'w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm',
    icon: 'p-2 sm:p-3',
    group: 'flex flex-col sm:flex-row gap-2 sm:gap-4'
  },
  
  // Cards and containers
  card: {
    base: 'bg-white rounded-lg shadow-md overflow-hidden',
    padding: 'p-4 sm:p-6',
    image: 'aspect-[4/3] sm:aspect-[16/9] w-full object-cover',
    content: 'space-y-2 sm:space-y-4'
  },
  
  // Navigation
  nav: {
    desktop: 'hidden md:flex md:items-center md:space-x-6',
    mobile: 'md:hidden',
    overlay: 'fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden',
    panel: 'fixed top-0 right-0 h-full w-64 sm:w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out'
  },
  
  // Forms
  form: {
    container: 'space-y-4 sm:space-y-6',
    field: 'space-y-1 sm:space-y-2',
    input: 'w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base',
    label: 'text-sm sm:text-base font-medium',
    error: 'text-xs sm:text-sm text-red-600',
    group: 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'
  },
  
  // Modals
  modal: {
    overlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50',
    container: 'bg-white rounded-lg max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl w-full max-h-[90vh] overflow-auto',
    header: 'flex justify-between items-center p-4 sm:p-6 border-b',
    body: 'p-4 sm:p-6',
    footer: 'flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 p-4 sm:p-6 border-t'
  }
};

// Responsive image sizes
export const imageSizes = {
  property: {
    card: 'w-full h-48 sm:h-56 md:h-64 object-cover',
    gallery: 'w-full h-64 sm:h-80 md:h-96 object-cover',
    thumbnail: 'w-16 h-16 sm:w-20 sm:h-20 object-cover rounded'
  },
  avatar: {
    small: 'w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover',
    medium: 'w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover',
    large: 'w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full object-cover'
  }
};

// Container max widths
export const containers = {
  page: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  content: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
  narrow: 'max-w-2xl mx-auto px-4 sm:px-6 lg:px-8',
  form: 'max-w-lg mx-auto px-4 sm:px-6 lg:px-8'
};

// Responsive utilities
export const utils = {
  // Hide/show elements
  hideOnMobile: 'hidden sm:block',
  showOnMobile: 'block sm:hidden',
  hideOnDesktop: 'block md:hidden',
  showOnDesktop: 'hidden md:block',
  
  // Screen reader utilities
  srOnly: 'sr-only',
  
  // Touch targets (minimum 44px)
  touchTarget: 'min-h-[44px] min-w-[44px]',
  
  // Safe areas for mobile
  safeTop: 'pt-safe-top',
  safeBottom: 'pb-safe-bottom'
};

// Responsive hook for JavaScript
export const useResponsive = () => {
  const getScreenSize = (): 'sm' | 'md' | 'lg' | 'xl' | '2xl' => {
    if (typeof window === 'undefined') return 'md';
    
    const width = window.innerWidth;
    if (width >= 1536) return '2xl';
    if (width >= 1280) return 'xl';
    if (width >= 1024) return 'lg';
    if (width >= 768) return 'md';
    return 'sm';
  };

  const isMobile = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  };

  const isTablet = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 768 && window.innerWidth < 1024;
  };

  const isDesktop = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
  };

  return {
    getScreenSize,
    isMobile,
    isTablet,
    isDesktop
  };
};

// Component class builder utility
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Responsive text truncation
export const truncateClasses = {
  lines1: 'line-clamp-1',
  lines2: 'line-clamp-2',
  lines3: 'line-clamp-3',
  responsive: 'line-clamp-2 sm:line-clamp-3 md:line-clamp-4'
};