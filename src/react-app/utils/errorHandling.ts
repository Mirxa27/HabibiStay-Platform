import { useErrorHandler } from '../components/ErrorBoundary';
import { useNotificationHelpers } from '../components/NotificationSystem';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class HabibiStayError extends Error {
  public code?: string;
  public status?: number;
  public details?: any;

  constructor(message: string, code?: string, status?: number, details?: any) {
    super(message);
    this.name = 'HabibiStayError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// Error types for different scenarios
export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

export type ErrorType = typeof ErrorTypes[keyof typeof ErrorTypes];

// Error messages for user-friendly display
export const ErrorMessages = {
  [ErrorTypes.NETWORK_ERROR]: 'Unable to connect to the server. Please check your internet connection.',
  [ErrorTypes.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorTypes.AUTHENTICATION_ERROR]: 'Please sign in to continue.',
  [ErrorTypes.AUTHORIZATION_ERROR]: 'You don\'t have permission to perform this action.',
  [ErrorTypes.NOT_FOUND_ERROR]: 'The requested resource could not be found.',
  [ErrorTypes.SERVER_ERROR]: 'A server error occurred. Please try again later.',
  [ErrorTypes.TIMEOUT_ERROR]: 'The request timed out. Please try again.',
  [ErrorTypes.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.'
};

// Parse API response errors
export function parseApiError(error: any): HabibiStayError {
  // Network error
  if (!error.response) {
    return new HabibiStayError(
      ErrorMessages[ErrorTypes.NETWORK_ERROR],
      ErrorTypes.NETWORK_ERROR,
      0
    );
  }

  const { status, data } = error.response;

  // Validation errors (400-499, excluding 401, 403, 404)
  if (status >= 400 && status < 500) {
    // Special handling for specific status codes
    if (status === 401) {
      return new HabibiStayError(
        data?.message || ErrorMessages[ErrorTypes.AUTHENTICATION_ERROR],
        ErrorTypes.AUTHENTICATION_ERROR,
        status,
        data
      );
    }
    
    if (status === 403) {
      return new HabibiStayError(
        data?.message || ErrorMessages[ErrorTypes.AUTHORIZATION_ERROR],
        ErrorTypes.AUTHORIZATION_ERROR,
        status,
        data
      );
    }
    
    if (status === 404) {
      return new HabibiStayError(
        data?.message || ErrorMessages[ErrorTypes.NOT_FOUND_ERROR],
        ErrorTypes.NOT_FOUND_ERROR,
        status,
        data
      );
    }
    
    return new HabibiStayError(
      data?.message || ErrorMessages[ErrorTypes.VALIDATION_ERROR],
      ErrorTypes.VALIDATION_ERROR,
      status,
      data
    );
  }

  // Server errors (500-599)
  if (status >= 500 && status < 600) {
    return new HabibiStayError(
      data?.message || ErrorMessages[ErrorTypes.SERVER_ERROR],
      ErrorTypes.SERVER_ERROR,
      status,
      data
    );
  }

  // Unknown error (any other status code including 999)
  return new HabibiStayError(
    data?.message || ErrorMessages[ErrorTypes.UNKNOWN_ERROR],
    ErrorTypes.UNKNOWN_ERROR,
    status,
    data
  );
}

// Enhanced fetch wrapper with error handling
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data: await response.json().catch(() => ({}))
        }
      };
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new HabibiStayError(
        ErrorMessages[ErrorTypes.TIMEOUT_ERROR],
        ErrorTypes.TIMEOUT_ERROR
      );
    }

    throw parseApiError(error);
  }
}

// Hook for API error handling in components
export function useApiErrorHandler() {
  const { handleError } = useErrorHandler();
  const { showError } = useNotificationHelpers();

  const handleApiError = (error: unknown, context?: string) => {
    if (error instanceof HabibiStayError) {
      console.error(`API Error ${context ? `in ${context}` : ''}:`, {
        message: error.message,
        code: error.code,
        status: error.status,
        details: error.details
      });
      
      // Show user-friendly error notification
      showError('Error', error.message);
    } else {
      handleError(error as Error, context);
    }
  };

  return { handleApiError };
}

// Retry utility for failed operations
export function createRetryWrapper<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  maxRetries: number = 3,
  delay: number = 1000
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry client errors (4xx) except for 429 (rate limit)
        if (error instanceof HabibiStayError && 
            error.status && 
            error.status >= 400 && 
            error.status < 500 && 
            error.status !== 429) {
          throw error;
        }

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Exponential backoff
        const backoffDelay = delay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }

    throw lastError!;
  }) as T;
}

// Validation error helpers
export function extractValidationErrors(error: HabibiStayError): Record<string, string> {
  if (error.code !== ErrorTypes.VALIDATION_ERROR || !error.details) {
    return {};
  }

  // Handle different validation error formats
  if (error.details.errors) {
    return error.details.errors;
  }

  if (error.details.fields) {
    return error.details.fields;
  }

  return {};
}

// Success/failure notification helpers
export const showNotification = {
  success: (message: string) => {
    // In a real app, you'd integrate with a toast library
    if (typeof window !== 'undefined' && (window as any).showNotification) {
      (window as any).showNotification('success', message);
    } else {
      console.log('✅ Success:', message);
    }
  },
  error: (message: string) => {
    // In a real app, you'd integrate with a toast library
    if (typeof window !== 'undefined' && (window as any).showNotification) {
      (window as any).showNotification('error', message);
    } else {
      console.error('❌ Error:', message);
    }
  },
  warning: (message: string) => {
    // In a real app, you'd integrate with a toast library
    if (typeof window !== 'undefined' && (window as any).showNotification) {
      (window as any).showNotification('warning', message);
    } else {
      console.warn('⚠️ Warning:', message);
    }
  },
  info: (message: string) => {
    // In a real app, you'd integrate with a toast library
    if (typeof window !== 'undefined' && (window as any).showNotification) {
      (window as any).showNotification('info', message);
    } else {
      console.info('ℹ️ Info:', message);
    }
  }
};