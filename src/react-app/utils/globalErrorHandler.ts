// Global error handler that integrates with the notification system
import { showNotification } from './errorHandling';

// Make notification helpers available globally for legacy code
if (typeof window !== 'undefined') {
  (window as any).showNotification = (type: string, message: string) => {
    switch (type) {
      case 'success':
        showNotification.success(message);
        break;
      case 'error':
        showNotification.error(message);
        break;
      case 'warning':
        showNotification.warning(message);
        break;
      case 'info':
        showNotification.info(message);
        break;
      default:
        console.log(message);
    }
  };
}

// Global error handler for uncaught exceptions
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    // In production, you might want to send this to your error reporting service
    if (process.env.NODE_ENV === 'development') {
      showNotification.error('An unexpected error occurred. Check the console for details.');
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // In production, you might want to send this to your error reporting service
    if (process.env.NODE_ENV === 'development') {
      showNotification.error('An unexpected error occurred. Check the console for details.');
    }
  });
}

export {};