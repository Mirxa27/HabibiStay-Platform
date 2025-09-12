import { describe, it, expect, vi } from 'vitest';
import { 
  HabibiStayError, 
  parseApiError, 
  apiRequest, 
  createRetryWrapper,
  extractValidationErrors,
  ErrorTypes,
  ErrorMessages
} from '../errorHandling';

// Mock the ErrorBoundary hook
vi.mock('../../components/ErrorBoundary', () => ({
  useErrorHandler: () => ({
    handleError: vi.fn()
  })
}));

// Mock the NotificationSystem hook
vi.mock('../../components/NotificationSystem', () => ({
  useNotificationHelpers: () => ({
    showError: vi.fn()
  })
}));

describe('errorHandling', () => {
  describe('HabibiStayError', () => {
    it('should create error with correct properties', () => {
      const error = new HabibiStayError('Test error', 'TEST_CODE', 400, { detail: 'test' });
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.status).toBe(400);
      expect(error.details).toEqual({ detail: 'test' });
      expect(error.name).toBe('HabibiStayError');
    });

    it('should create error with optional properties', () => {
      const error = new HabibiStayError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBeUndefined();
      expect(error.status).toBeUndefined();
      expect(error.details).toBeUndefined();
    });
  });

  describe('ErrorTypes', () => {
    it('should have all expected error types', () => {
      expect(ErrorTypes.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(ErrorTypes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorTypes.AUTHENTICATION_ERROR).toBe('AUTHENTICATION_ERROR');
      expect(ErrorTypes.AUTHORIZATION_ERROR).toBe('AUTHORIZATION_ERROR');
      expect(ErrorTypes.NOT_FOUND_ERROR).toBe('NOT_FOUND_ERROR');
      expect(ErrorTypes.SERVER_ERROR).toBe('SERVER_ERROR');
      expect(ErrorTypes.TIMEOUT_ERROR).toBe('TIMEOUT_ERROR');
      expect(ErrorTypes.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });
  });

  describe('ErrorMessages', () => {
    it('should have user-friendly error messages', () => {
      expect(ErrorMessages[ErrorTypes.NETWORK_ERROR]).toBe('Unable to connect to the server. Please check your internet connection.');
      expect(ErrorMessages[ErrorTypes.VALIDATION_ERROR]).toBe('Please check your input and try again.');
      expect(ErrorMessages[ErrorTypes.AUTHENTICATION_ERROR]).toBe('Please sign in to continue.');
      expect(ErrorMessages[ErrorTypes.AUTHORIZATION_ERROR]).toBe('You don\'t have permission to perform this action.');
      expect(ErrorMessages[ErrorTypes.NOT_FOUND_ERROR]).toBe('The requested resource could not be found.');
      expect(ErrorMessages[ErrorTypes.SERVER_ERROR]).toBe('A server error occurred. Please try again later.');
      expect(ErrorMessages[ErrorTypes.TIMEOUT_ERROR]).toBe('The request timed out. Please try again.');
      expect(ErrorMessages[ErrorTypes.UNKNOWN_ERROR]).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('parseApiError', () => {
    it('should handle network errors', () => {
      const error = { message: 'Network error' };
      const result = parseApiError(error);
      
      expect(result).toBeInstanceOf(HabibiStayError);
      expect(result.code).toBe(ErrorTypes.NETWORK_ERROR);
      expect(result.message).toBe(ErrorMessages[ErrorTypes.NETWORK_ERROR]);
    });

    it('should handle authentication errors', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };
      const result = parseApiError(error);
      
      expect(result).toBeInstanceOf(HabibiStayError);
      expect(result.code).toBe(ErrorTypes.AUTHENTICATION_ERROR);
      expect(result.status).toBe(401);
      expect(result.message).toBe('Unauthorized');
    });

    it('should handle authorization errors', () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'Forbidden' }
        }
      };
      const result = parseApiError(error);
      
      expect(result).toBeInstanceOf(HabibiStayError);
      expect(result.code).toBe(ErrorTypes.AUTHORIZATION_ERROR);
      expect(result.status).toBe(403);
      expect(result.message).toBe('Forbidden');
    });

    it('should handle not found errors', () => {
      const error = {
        response: {
          status: 404,
          data: { message: 'Not Found' }
        }
      };
      const result = parseApiError(error);
      
      expect(result).toBeInstanceOf(HabibiStayError);
      expect(result.code).toBe(ErrorTypes.NOT_FOUND_ERROR);
      expect(result.status).toBe(404);
      expect(result.message).toBe('Not Found');
    });

    it('should handle validation errors', () => {
      const error = {
        response: {
          status: 422,
          data: { message: 'Validation failed' }
        }
      };
      const result = parseApiError(error);
      
      expect(result).toBeInstanceOf(HabibiStayError);
      expect(result.code).toBe(ErrorTypes.VALIDATION_ERROR);
      expect(result.status).toBe(422);
      expect(result.message).toBe('Validation failed');
    });

    it('should handle server errors', () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      };
      const result = parseApiError(error);
      
      expect(result).toBeInstanceOf(HabibiStayError);
      expect(result.code).toBe(ErrorTypes.SERVER_ERROR);
      expect(result.status).toBe(500);
      expect(result.message).toBe('Internal Server Error');
    });

    it('should handle unknown errors', () => {
      const error = {
        response: {
          status: 999,
          data: { message: 'Unknown Error' }
        }
      };
      const result = parseApiError(error);
      
      expect(result).toBeInstanceOf(HabibiStayError);
      expect(result.code).toBe(ErrorTypes.UNKNOWN_ERROR);
      expect(result.status).toBe(999);
      expect(result.message).toBe('Unknown Error');
    });
  });

  describe('apiRequest', () => {
    // Mock fetch globally
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    beforeEach(() => {
      mockFetch.mockClear();
    });

    it('should make successful API request', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true, data: 'test' })
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await apiRequest('/test-endpoint');
      
      expect(result).toEqual({ success: true, data: 'test' });
      expect(mockFetch).toHaveBeenCalledWith('/test-endpoint', expect.objectContaining({
        headers: { 'Content-Type': 'application/json' }
      }));
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({ message: 'Bad Request' })
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      await expect(apiRequest('/test-endpoint')).rejects.toBeInstanceOf(HabibiStayError);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      await expect(apiRequest('/test-endpoint')).rejects.toBeInstanceOf(HabibiStayError);
    });

    it('should handle timeout errors', async () => {
      // Mock AbortController to simulate timeout
      const originalAbortController = global.AbortController;
      const abortMock = vi.fn();
      
      global.AbortController = vi.fn().mockImplementation(() => ({
        signal: {},
        abort: abortMock
      }));
      
      // Mock fetch to reject with AbortError
      mockFetch.mockRejectedValueOnce(new Error('AbortError'));
      
      await expect(apiRequest('/test-endpoint')).rejects.toBeInstanceOf(HabibiStayError);
      
      // Restore
      global.AbortController = originalAbortController;
    });
  });

  describe('createRetryWrapper', () => {
    it('should retry failed operations', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'))
        .mockResolvedValue('Success on third attempt');
      
      const wrappedFn = createRetryWrapper(mockFn, 3, 1);
      
      const result = await wrappedFn();
      
      expect(result).toBe('Success on third attempt');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should not retry client errors (4xx) except 429', async () => {
      const error = new HabibiStayError('Client error', ErrorTypes.VALIDATION_ERROR, 400);
      const mockFn = vi.fn().mockRejectedValue(error);
      
      const wrappedFn = createRetryWrapper(mockFn, 3, 1);
      
      await expect(wrappedFn()).rejects.toBeInstanceOf(HabibiStayError);
      
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry rate limit errors (429)', async () => {
      const error = new HabibiStayError('Rate limited', ErrorTypes.VALIDATION_ERROR, 429);
      const mockFn = vi.fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue('Success on second attempt');
      
      const wrappedFn = createRetryWrapper(mockFn, 3, 1);
      
      const result = await wrappedFn();
      
      expect(result).toBe('Success on second attempt');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should throw error after max retries', async () => {
      const error = new Error('Persistent error');
      const mockFn = vi.fn().mockRejectedValue(error);
      
      const wrappedFn = createRetryWrapper(mockFn, 3, 1);
      
      await expect(wrappedFn()).rejects.toThrow('Persistent error');
      
      expect(mockFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('extractValidationErrors', () => {
    it('should extract validation errors from HabibiStayError', () => {
      const error = new HabibiStayError('Validation failed', ErrorTypes.VALIDATION_ERROR, 400, {
        errors: {
          name: 'Name is required',
          email: 'Email is invalid'
        }
      });
      
      const result = extractValidationErrors(error);
      
      expect(result).toEqual({
        name: 'Name is required',
        email: 'Email is invalid'
      });
    });

    it('should handle errors with fields property', () => {
      const error = new HabibiStayError('Validation failed', ErrorTypes.VALIDATION_ERROR, 400, {
        fields: {
          password: 'Password is too short'
        }
      });
      
      const result = extractValidationErrors(error);
      
      expect(result).toEqual({
        password: 'Password is too short'
      });
    });

    it('should return empty object for non-validation errors', () => {
      const error = new HabibiStayError('Server error', ErrorTypes.SERVER_ERROR, 500);
      
      const result = extractValidationErrors(error);
      
      expect(result).toEqual({});
    });
  });
});