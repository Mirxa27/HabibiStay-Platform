// Responsive Design System for HabibiStay
// Mobile-first approach with Tailwind CSS integration

import { useState, useEffect } from 'react';

// Breakpoint definitions (matches Tailwind CSS)
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Screen size detection hook
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState<{
    width: number;
    height: number;
    breakpoint: Breakpoint;
  }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    breakpoint: 'md'
  });

  useEffect(() => {
    function updateSize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let breakpoint: Breakpoint = 'xs';
      if (width >= breakpoints['2xl']) breakpoint = '2xl';
      else if (width >= breakpoints.xl) breakpoint = 'xl';
      else if (width >= breakpoints.lg) breakpoint = 'lg';
      else if (width >= breakpoints.md) breakpoint = 'md';
      else if (width >= breakpoints.sm) breakpoint = 'sm';

      setScreenSize({ width, height, breakpoint });
    }

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return screenSize;
}

// Device detection utilities
export function isMobile(width = typeof window !== 'undefined' ? window.innerWidth : 768): boolean {
  return width < breakpoints.md;
}

export function isTablet(width = typeof window !== 'undefined' ? window.innerWidth : 768): boolean {
  return width >= breakpoints.md && width < breakpoints.lg;
}

export function isDesktop(width = typeof window !== 'undefined' ? window.innerWidth : 768): boolean {
  return width >= breakpoints.lg;
}

// Touch device detection
export function isTouchDevice(): boolean {
  return typeof window !== 'undefined' && (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
}

// Responsive class generator
export function responsiveClasses(classes: Partial<Record<Breakpoint, string>>): string {
  const classArray: string[] = [];
  
  // Start with base (xs) classes
  if (classes.xs) classArray.push(classes.xs);
  
  // Add responsive prefixes
  Object.entries(classes).forEach(([breakpoint, className]) => {
    if (breakpoint !== 'xs' && className) {
      classArray.push(`${breakpoint}:${className}`);
    }
  });
  
  return classArray.join(' ');
}

// Container sizes for different breakpoints
export const containerSizes = {
  xs: 'px-4',
  sm: 'px-6 max-w-screen-sm mx-auto',
  md: 'px-8 max-w-screen-md mx-auto',
  lg: 'px-8 max-w-screen-lg mx-auto',
  xl: 'px-8 max-w-screen-xl mx-auto',
  '2xl': 'px-8 max-w-screen-2xl mx-auto'
} as const;

// Grid system utilities
export function gridCols(breakpoint: Breakpoint, cols: number): string {
  return breakpoint === 'xs' ? `grid-cols-${cols}` : `${breakpoint}:grid-cols-${cols}`;
}

// Spacing utilities for different screen sizes
export const spacing = {
  section: {
    xs: 'py-8',
    sm: 'py-12', 
    md: 'py-16',
    lg: 'py-20',
    xl: 'py-24'
  },
  component: {
    xs: 'p-4',
    sm: 'p-6',
    md: 'p-8', 
    lg: 'p-10',
    xl: 'p-12'
  },
  gap: {
    xs: 'gap-3',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8', 
    xl: 'gap-10'
  }
} as const;

// Typography scaling
export const typography = {
  hero: {
    xs: 'text-2xl leading-tight',
    sm: 'text-3xl leading-tight',
    md: 'text-4xl leading-tight',
    lg: 'text-5xl leading-tight',
    xl: 'text-6xl leading-tight'
  },
  heading: {
    xs: 'text-xl',
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-4xl'
  },
  subheading: {
    xs: 'text-lg',
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  },
  body: {
    xs: 'text-sm leading-relaxed',
    sm: 'text-base leading-relaxed',
    md: 'text-base leading-relaxed',
    lg: 'text-lg leading-relaxed',
    xl: 'text-lg leading-relaxed'
  },
  caption: {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-sm',
    xl: 'text-base'
  }
} as const;

// Button sizes for different breakpoints
export const buttonSizes = {
  small: {
    xs: 'px-3 py-2 text-sm',
    sm: 'px-4 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-4 py-2 text-base'
  },
  medium: {
    xs: 'px-4 py-3 text-base',
    sm: 'px-6 py-3 text-base',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-3 text-lg'
  },
  large: {
    xs: 'px-6 py-4 text-lg',
    sm: 'px-8 py-4 text-lg',
    md: 'px-10 py-4 text-xl',
    lg: 'px-12 py-4 text-xl'
  }
} as const;

// Touch target optimization
export const touchTargets = {
  minimum: 'min-h-[44px] min-w-[44px]', // iOS guideline minimum
  comfortable: 'min-h-[48px] min-w-[48px]', // Android guideline
  large: 'min-h-[56px] min-w-[56px]' // Material Design large
} as const;

// Image aspect ratios
export const aspectRatios = {
  square: 'aspect-square',
  video: 'aspect-video', // 16:9
  photo: 'aspect-[4/3]',
  wide: 'aspect-[21/9]',
  property: 'aspect-[3/2]' // Good for property images
} as const;

// Layout helpers
export function createResponsiveLayout(layout: {
  mobile?: string;
  tablet?: string; 
  desktop?: string;
}): string {
  const classes = [];
  
  if (layout.mobile) classes.push(layout.mobile);
  if (layout.tablet) classes.push(`md:${layout.tablet}`);
  if (layout.desktop) classes.push(`lg:${layout.desktop}`);
  
  return classes.join(' ');
}

// Card layouts for different screen sizes
export const cardLayouts = {
  grid: {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-2', 
    desktop: 'grid-cols-3',
    wide: 'grid-cols-4'
  },
  list: {
    mobile: 'flex flex-col',
    tablet: 'flex flex-col',
    desktop: 'flex flex-row'
  }
} as const;

// Safe area insets for mobile devices (iOS notch, etc.)
export const safeArea = {
  top: 'pt-safe-top',
  bottom: 'pb-safe-bottom',
  left: 'pl-safe-left',
  right: 'pr-safe-right',
  all: 'p-safe'
} as const;

// Performance optimization helpers
export function getOptimalImageSize(breakpoint: Breakpoint, containerWidth?: number): {
  width: number;
  sizes: string;
} {
  const baseWidth = containerWidth || breakpoints[breakpoint];
  
  // Calculate optimal width with device pixel ratio consideration
  const optimalWidth = Math.min(baseWidth * 2, 1920); // Max 1920px for performance
  
  // Generate sizes attribute for responsive images
  const sizes = [
    '(max-width: 640px) 100vw',
    '(max-width: 768px) 50vw', 
    '(max-width: 1024px) 33vw',
    '25vw'
  ].join(', ');
  
  return {
    width: optimalWidth,
    sizes
  };
}

// Accessibility helpers for mobile
export const a11y = {
  focusVisible: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2957c3] focus-visible:ring-offset-2',
  screenReader: 'sr-only',
  skipLink: 'absolute left-[-9999px] focus:left-0 focus:top-0 focus:z-50 focus:p-4 focus:bg-white focus:text-black',
  highContrast: 'contrast-more:border-black contrast-more:text-black'
} as const;

// Animation performance preferences
export function respectsReducedMotion(): boolean {
  return typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Export utility functions as default
export default {
  useScreenSize,
  isMobile,
  isTablet, 
  isDesktop,
  isTouchDevice,
  responsiveClasses,
  gridCols,
  createResponsiveLayout,
  getOptimalImageSize,
  respectsReducedMotion,
  breakpoints,
  containerSizes,
  spacing,
  typography,
  buttonSizes,
  touchTargets,
  aspectRatios,
  cardLayouts,
  safeArea,
  a11y
};