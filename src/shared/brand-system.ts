// HabibiStay Brand Design System

export const brandColors = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#2957c3', // Main brand color
    600: '#1e40af',
    700: '#1d4ed8',
    800: '#1e3a8a',
    900: '#1e3a8a',
    950: '#172554'
  },
  
  // Secondary Colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },
  
  // Accent Colors
  accent: {
    gold: '#f59e0b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  },
  
  // Neutral Colors
  neutral: {
    white: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    black: '#000000'
  }
} as const;

export const brandTypography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    serif: ['Georgia', 'serif'],
    mono: ['Menlo', 'Monaco', 'monospace']
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
    '7xl': ['4.5rem', { lineHeight: '1' }],
    '8xl': ['6rem', { lineHeight: '1' }],
    '9xl': ['8rem', { lineHeight: '1' }]
  },
  
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  }
} as const;

export const brandSpacing = {
  px: '1px',
  0: '0px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem'
} as const;

export const brandBorderRadius = {
  none: '0px',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px'
} as const;

export const brandShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000'
} as const;

// Brand Component Styles
export const brandComponents = {
  button: {
    base: 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    
    variants: {
      primary: 'bg-[#2957c3] text-white hover:bg-blue-700 focus:ring-[#2957c3]',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
      outline: 'border border-[#2957c3] text-[#2957c3] hover:bg-[#2957c3] hover:text-white focus:ring-[#2957c3]',
      ghost: 'text-[#2957c3] hover:bg-blue-50 focus:ring-[#2957c3]',
      destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    },
    
    sizes: {
      sm: 'h-8 px-3 text-sm rounded-md',
      md: 'h-10 px-4 text-base rounded-lg',
      lg: 'h-12 px-6 text-lg rounded-lg'
    }
  },
  
  input: {
    base: 'flex w-full border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2957c3] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
    sizes: {
      sm: 'h-8 px-2 text-sm rounded-md',
      md: 'h-10 px-3 text-base rounded-lg',
      lg: 'h-12 px-4 text-lg rounded-lg'
    }
  },
  
  card: {
    base: 'rounded-xl border border-gray-200 bg-white text-gray-950 shadow-sm',
    header: 'flex flex-col space-y-1.5 p-6',
    content: 'p-6 pt-0',
    footer: 'flex items-center p-6 pt-0'
  },
  
  badge: {
    base: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    variants: {
      default: 'bg-[#2957c3] text-white hover:bg-blue-700',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      destructive: 'bg-red-100 text-red-800'
    }
  },
  
  alert: {
    base: 'relative w-full rounded-lg border p-4',
    variants: {
      default: 'bg-white text-gray-950 border-gray-200',
      success: 'bg-green-50 text-green-900 border-green-200',
      warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
      destructive: 'bg-red-50 text-red-900 border-red-200'
    }
  }
} as const;

// Utility functions for brand consistency
export const brandUtils = {
  // Color utilities
  getBrandColor: (color: keyof typeof brandColors.primary, shade: keyof typeof brandColors.primary = 500) => {
    return brandColors.primary[shade];
  },
  
  // Consistent spacing
  getSpacing: (size: keyof typeof brandSpacing) => {
    return brandSpacing[size];
  },
  
  // Button class generator
  getButtonClasses: (variant: keyof typeof brandComponents.button.variants = 'primary', size: keyof typeof brandComponents.button.sizes = 'md') => {
    return `${brandComponents.button.base} ${brandComponents.button.variants[variant]} ${brandComponents.button.sizes[size]}`;
  },
  
  // Input class generator
  getInputClasses: (size: keyof typeof brandComponents.input.sizes = 'md') => {
    return `${brandComponents.input.base} ${brandComponents.input.sizes[size]}`;
  },
  
  // Card class generator
  getCardClasses: () => {
    return brandComponents.card.base;
  },
  
  // Badge class generator
  getBadgeClasses: (variant: keyof typeof brandComponents.badge.variants = 'default') => {
    return `${brandComponents.badge.base} ${brandComponents.badge.variants[variant]}`;
  },
  
  // Responsive text sizes
  getResponsiveTextClasses: (mobile: string, desktop: string) => {
    return `text-${mobile} md:text-${desktop}`;
  },
  
  // Brand gradient
  getBrandGradient: () => {
    return 'bg-gradient-to-r from-[#2957c3] to-blue-600';
  },
  
  // Focus ring
  getFocusRing: () => {
    return 'focus:outline-none focus:ring-2 focus:ring-[#2957c3] focus:ring-offset-2';
  }
} as const;

// Animation and transitions
export const brandAnimations = {
  transition: {
    fast: 'transition-all duration-150 ease-in-out',
    normal: 'transition-all duration-300 ease-in-out',
    slow: 'transition-all duration-500 ease-in-out'
  },
  
  hover: {
    scale: 'hover:scale-105 transition-transform duration-200',
    lift: 'hover:-translate-y-1 hover:shadow-lg transition-all duration-200',
    glow: 'hover:shadow-lg hover:shadow-[#2957c3]/25 transition-shadow duration-200'
  },
  
  slide: {
    up: 'animate-slide-up',
    down: 'animate-slide-down',
    left: 'animate-slide-left',
    right: 'animate-slide-right'
  }
} as const;

// Brand icons and illustrations
export const brandIcons = {
  logo: {
    symbol: 'H', // HabibiStay symbol
    color: brandColors.primary[500],
    background: 'bg-[#2957c3]'
  },
  
  sizes: {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
    '2xl': 'w-12 h-12'
  }
} as const;

// Layout utilities
export const brandLayout = {
  container: {
    sm: 'max-w-sm mx-auto px-4',
    md: 'max-w-md mx-auto px-4',
    lg: 'max-w-4xl mx-auto px-4 sm:px-6',
    xl: 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8',
    '2xl': 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    full: 'w-full px-4 sm:px-6 lg:px-8'
  },
  
  grid: {
    responsive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
    properties: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    dashboard: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
  },
  
  section: {
    padding: 'py-12 sm:py-16 lg:py-20',
    hero: 'py-20 sm:py-28 lg:py-32'
  }
} as const;

export default {
  colors: brandColors,
  typography: brandTypography,
  spacing: brandSpacing,
  borderRadius: brandBorderRadius,
  shadow: brandShadow,
  components: brandComponents,
  utils: brandUtils,
  animations: brandAnimations,
  icons: brandIcons,
  layout: brandLayout
};