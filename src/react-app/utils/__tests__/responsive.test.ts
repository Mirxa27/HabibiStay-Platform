import { describe, it, expect } from 'vitest';
import { 
  breakpoints, 
  responsiveClasses, 
  imageSizes, 
  containers, 
  utils,
  useResponsive
} from '../responsive';

describe('responsive', () => {
  describe('breakpoints', () => {
    it('should have correct breakpoint values', () => {
      expect(breakpoints.sm).toBe('640px');
      expect(breakpoints.md).toBe('768px');
      expect(breakpoints.lg).toBe('1024px');
      expect(breakpoints.xl).toBe('1280px');
      expect(breakpoints['2xl']).toBe('1536px');
    });
  });

  describe('responsiveClasses', () => {
    it('should have grid classes', () => {
      expect(responsiveClasses.grid.single).toBe('grid grid-cols-1');
      expect(responsiveClasses.grid.double).toBe('grid grid-cols-1 md:grid-cols-2');
      expect(responsiveClasses.grid.triple).toBe('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3');
    });

    it('should have flex classes', () => {
      expect(responsiveClasses.flex.column).toBe('flex flex-col');
      expect(responsiveClasses.flex.columnToRow).toBe('flex flex-col md:flex-row');
    });

    it('should have padding classes', () => {
      expect(responsiveClasses.padding.page).toBe('px-4 sm:px-6 lg:px-8');
      expect(responsiveClasses.padding.section).toBe('py-8 md:py-12 lg:py-16');
    });

    it('should have text classes', () => {
      expect(responsiveClasses.text.h1).toBe('text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold');
      expect(responsiveClasses.text.body).toBe('text-sm sm:text-base');
    });

    it('should have button classes', () => {
      expect(responsiveClasses.button.primary).toBe('w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base');
    });

    it('should have card classes', () => {
      expect(responsiveClasses.card.base).toBe('bg-white rounded-lg shadow-md overflow-hidden');
    });

    it('should have nav classes', () => {
      expect(responsiveClasses.nav.desktop).toBe('hidden md:flex md:items-center md:space-x-6');
      expect(responsiveClasses.nav.mobile).toBe('md:hidden');
    });

    it('should have form classes', () => {
      expect(responsiveClasses.form.container).toBe('space-y-4 sm:space-y-6');
    });

    it('should have modal classes', () => {
      expect(responsiveClasses.modal.overlay).toBe('fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50');
    });

    it('should have mobile-specific classes', () => {
      expect(responsiveClasses.mobile.drawer).toContain('fixed bottom-0');
      expect(responsiveClasses.mobile.fab).toContain('fixed bottom-6');
    });

    it('should have touch classes', () => {
      expect(responsiveClasses.touch.area).toBe('min-h-[44px] min-w-[44px] flex items-center justify-center');
      expect(responsiveClasses.touch.press).toContain('active:scale-95');
    });
  });

  describe('imageSizes', () => {
    it('should have property image sizes', () => {
      expect(imageSizes.property.card).toBe('w-full h-48 sm:h-56 md:h-64 object-cover');
      expect(imageSizes.property.gallery).toBe('w-full h-64 sm:h-80 md:h-96 object-cover');
    });

    it('should have avatar image sizes', () => {
      expect(imageSizes.avatar.small).toBe('w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover');
      expect(imageSizes.avatar.large).toBe('w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full object-cover');
    });
  });

  describe('containers', () => {
    it('should have container classes', () => {
      expect(containers.page).toBe('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8');
      expect(containers.content).toBe('max-w-4xl mx-auto px-4 sm:px-6 lg:px-8');
    });
  });

  describe('utils', () => {
    it('should have utility classes', () => {
      expect(utils.hideOnMobile).toBe('hidden sm:block');
      expect(utils.showOnMobile).toBe('block sm:hidden');
      expect(utils.touchTarget).toBe('min-h-[44px] min-w-[44px] flex items-center justify-center');
      expect(utils.touchButton).toBe('min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation');
    });
  });

  describe('useResponsive', () => {
    it('should return correct screen size on server', () => {
      // Mock window as undefined to simulate server environment
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      
      const { getScreenSize } = useResponsive();
      const size = getScreenSize();
      
      // Restore window
      global.window = originalWindow;
      
      // On server, should return 'md' as default
      expect(size).toBe('md');
    });

    it('should detect mobile correctly', () => {
      const { isMobile } = useResponsive();
      const mobile = isMobile();
      // On server, should return false
      expect(mobile).toBe(false);
    });

    it('should return correct container classes', () => {
      // Just test the containers.page constant directly since it's not a function
      expect(containers.page).toBe('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8');
    });
  });
});