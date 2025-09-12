/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/react-app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // HabibiStay Brand Colors
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
        // Brand specific colors
        brand: {
          blue: '#2957c3',
          'blue-dark': '#1e40af',
          'blue-light': '#3b6cf7'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'brand': '0 4px 14px 0 rgba(41, 87, 195, 0.15)',
        'brand-lg': '0 10px 25px 0 rgba(41, 87, 195, 0.2)'
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #2957c3 0%, #1e40af 100%)'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.4s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      },
      screens: {
        'xs': '475px',
        // Default breakpoints: sm: '640px', md: '768px', lg: '1024px', xl: '1280px', 2xl: '1536px'
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)'
      }
    },
  },
  plugins: [
    // Add line-clamp utility
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        '.touch-manipulation': {
          'touch-action': 'manipulation'
        },
        '.backface-visibility-hidden': {
          'backface-visibility': 'hidden'
        },
        '.overscroll-contain': {
          'overscroll-behavior': 'contain'
        }
      }
      addUtilities(newUtilities)
    }
  ],
};
