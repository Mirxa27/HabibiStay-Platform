// Test utilities and helpers for HabibiStay

import { ReactElement } from 'react';
import { render as rtlRender, RenderOptions, RenderResult } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { ChatProvider } from '@/contexts/ChatContext';

// Mock data generators
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  avatar: 'https://example.com/avatar.jpg',
  role: 'user',
  created_at: '2024-01-01T00:00:00Z',
  google_user_data: {
    name: 'Test User',
    email: 'test@example.com',
    picture: 'https://example.com/avatar.jpg',
  },
};

export const mockAdmin = {
  ...mockUser,
  id: 'test-admin-id',
  email: 'admin@habibistay.com',
  name: 'Admin User',
  role: 'admin',
};

export const mockProperty = {
  id: 1,
  title: 'Luxury Downtown Apartment',
  description: 'A beautiful apartment in the heart of the city',
  location: 'Riyadh, Saudi Arabia',
  price_per_night: 250,
  max_guests: 4,
  bedrooms: 2,
  bathrooms: 2,
  amenities: ['wifi', 'parking', 'pool', 'gym'],
  images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  property_type: 'apartment',
  is_featured: true,
  is_active: true,
  owner_id: 'test-owner-id',
  rating: 4.8,
  review_count: 24,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockBooking = {
  id: 1,
  user_id: 'test-user-id',
  property_id: 1,
  check_in_date: '2024-12-01',
  check_out_date: '2024-12-05',
  guests: 2,
  total_amount: 1000,
  status: 'confirmed',
  guest_name: 'Test User',
  guest_email: 'test@example.com',
  guest_phone: '+966501234567',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockReview = {
  id: 1,
  property_id: 1,
  user_id: 'test-user-id',
  booking_id: 1,
  rating: 5,
  comment: 'Amazing stay! Highly recommended.',
  user_name: 'Test User',
  user_avatar: 'https://example.com/avatar.jpg',
  created_at: '2024-01-01T00:00:00Z',
  helpful_count: 3,
};

export const mockChatMessage = {
  id: 'msg-1',
  role: 'user' as const,
  content: 'Hello Sara',
  timestamp: Date.now(),
};

export const mockPricingSettings = {
  property_id: 1,
  base_price: 250,
  currency: 'SAR',
  minimum_price: 100,
  maximum_price: 500,
  auto_pricing_enabled: true,
  update_frequency: 'daily',
  aggressiveness: 'moderate',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Mock API responses
export const mockApiResponse = <T>(data: T, success = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error',
});

export const mockErrorResponse = (error: string, status = 400) => ({
  success: false,
  error,
  status,
});

// Enhanced render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  withChat?: boolean;
  withAuth?: boolean;
  user?: typeof mockUser | null;
}

function AllTheProviders({ 
  children, 
  initialEntries = ['/'], 
  withChat = true,
  withAuth = true,
  user = mockUser 
}: {
  children: React.ReactNode;
  initialEntries?: string[];
  withChat?: boolean;
  withAuth?: boolean;
  user?: typeof mockUser | null;
}) {
  // Mock auth context
  const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    if (!withAuth) return <>{children}</>;
    
    // Mock useAuth hook
    const mockAuthContext = {
      user,
      isAuthenticated: !!user,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    };

    // You would inject this into your actual auth context provider
    return <>{children}</>;
  };

  let content = (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );

  if (withChat) {
    content = (
      <ChatProvider>
        {content}
      </ChatProvider>
    );
  }

  return content;
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult {
  const {
    initialEntries = ['/'],
    withChat = true,
    withAuth = true,
    user = mockUser,
    ...renderOptions
  } = options;

  return rtlRender(ui, {
    wrapper: (props) => (
      <AllTheProviders 
        {...props} 
        initialEntries={initialEntries}
        withChat={withChat}
        withAuth={withAuth}
        user={user}
      />
    ),
    ...renderOptions,
  });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Mock fetch helper
export const mockFetch = (response: any, ok = true, status = 200) => {
  return vi.mocked(fetch).mockResolvedValueOnce({
    ok,
    status,
    json: vi.fn().mockResolvedValue(response),
    text: vi.fn().mockResolvedValue(JSON.stringify(response)),
    headers: new Headers(),
    body: null,
    bodyUsed: false,
    clone: vi.fn(),
    formData: vi.fn(),
    blob: vi.fn(),
    arrayBuffer: vi.fn(),
    redirected: false,
    type: 'default' as ResponseType,
    url: 'http://localhost:3000/api/test',
    statusText: ok ? 'OK' : 'Error',
  } as Response);
};

// Mock error fetch
export const mockFetchError = (error: string, status = 500) => {
  return vi.mocked(fetch).mockRejectedValueOnce(new Error(error));
};

// Wait for async operations
export const waitForAsync = (ms = 0) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Mock intersection observer
export const mockIntersectionObserver = (isIntersecting = true) => {
  const mockObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: mockObserver,
  });

  return mockObserver;
};

// Mock local storage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn().mockImplementation((key: string) => store[key] || null),
    setItem: vi.fn().mockImplementation((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn().mockImplementation((key: string) => {
      delete store[key];
    }),
    clear: vi.fn().mockImplementation(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    length: Object.keys(store).length,
    key: vi.fn().mockImplementation((index: number) => Object.keys(store)[index] || null),
  };
};

// Mock geolocation
export const mockGeolocation = (coords = { latitude: 24.7136, longitude: 46.6753 }) => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn().mockImplementation((success) => {
      success({
        coords,
        timestamp: Date.now(),
      });
    }),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  };

  Object.defineProperty(navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true,
  });

  return mockGeolocation;
};

// Test data factories
export const createMockProperty = (overrides = {}) => ({
  ...mockProperty,
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  ...mockUser,
  ...overrides,
});

export const createMockBooking = (overrides = {}) => ({
  ...mockBooking,
  ...overrides,
});

export const createMockReview = (overrides = {}) => ({
  ...mockReview,
  ...overrides,
});

// Custom matchers and assertions
export const expectToBeInTheDocument = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument();
};

export const expectToHaveClass = (element: HTMLElement | null, className: string) => {
  expect(element).toHaveClass(className);
};

export const expectToHaveAttribute = (element: HTMLElement | null, attribute: string, value?: string) => {
  if (value !== undefined) {
    expect(element).toHaveAttribute(attribute, value);
  } else {
    expect(element).toHaveAttribute(attribute);
  }
};

// Performance testing helpers
export const measureComponentRenderTime = async (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

// Accessibility testing helpers
export const checkAccessibility = async (container: HTMLElement) => {
  // Basic accessibility checks
  const buttons = container.querySelectorAll('button');
  const links = container.querySelectorAll('a');
  const inputs = container.querySelectorAll('input, textarea, select');
  const images = container.querySelectorAll('img');

  // Check for proper ARIA labels
  buttons.forEach(button => {
    const hasLabel = button.getAttribute('aria-label') || 
                    button.getAttribute('aria-labelledby') || 
                    button.textContent?.trim();
    if (!hasLabel) {
      console.warn('Button without accessible label found:', button);
    }
  });

  // Check for alt text on images
  images.forEach(img => {
    if (!img.getAttribute('alt')) {
      console.warn('Image without alt text found:', img);
    }
  });

  return {
    buttonsCount: buttons.length,
    linksCount: links.length,
    inputsCount: inputs.length,
    imagesCount: images.length,
  };
};

export default {
  mockUser,
  mockAdmin,
  mockProperty,
  mockBooking,
  mockReview,
  mockChatMessage,
  mockPricingSettings,
  mockApiResponse,
  mockErrorResponse,
  renderWithProviders,
  mockFetch,
  mockFetchError,
  waitForAsync,
  mockIntersectionObserver,
  mockLocalStorage,
  mockGeolocation,
  createMockProperty,
  createMockUser,
  createMockBooking,
  createMockReview,
  expectToBeInTheDocument,
  expectToHaveClass,
  expectToHaveAttribute,
  measureComponentRenderTime,
  checkAccessibility,
};