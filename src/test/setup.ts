// Test setup file for HabibiStay

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

// Global test setup
beforeAll(() => {
  // Mock environment variables
  process.env.NODE_ENV = 'test';
  process.env.VITE_API_URL = 'http://localhost:3000';
  process.env.OPENAI_API_KEY = 'test-openai-key';
  process.env.MYFATOORAH_API_KEY = 'test-myfatoorah-key';
  process.env.JWT_SECRET = 'test-jwt-secret-for-testing-purposes';
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock console methods for cleaner test output
global.console = {
  ...console,
  // Uncomment to suppress console logs in tests
  // log: vi.fn(),
  // debug: vi.fn(),
  // info: vi.fn(),
  // warn: vi.fn(),
  // error: vi.fn(),
};

// Mock fetch globally
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock crypto for testing
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9)),
    subtle: {
      digest: vi.fn(async (algorithm, data) => {
        // More realistic mock implementation that varies based on input
        const dataArray = new Uint8Array(data);
        const mockHash = new Uint8Array(32);
        // Create a hash that varies based on input
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        // Fill with values based on input sum
        for (let i = 0; i < 32; i++) {
          mockHash[i] = (sum + i) % 256;
        }
        return mockHash.buffer;
      }),
      importKey: vi.fn(async () => {
        return {};
      }),
      sign: vi.fn(async () => {
        // Return a mock signature
        const signature = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
          signature[i] = 255 - i;
        }
        return signature.buffer;
      }),
    },
  },
});

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    ...window.navigator,
    clipboard: {
      writeText: vi.fn(),
      readText: vi.fn(),
    },
    geolocation: {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    },
  },
});

// Mock URL constructor for Node.js environment
if (typeof global.URL === 'undefined') {
  global.URL = class URL {
    constructor(public href: string, base?: string) {
      this.href = base ? new URL(href, base).href : href;
      this.searchParams = new URLSearchParams();
    }
    searchParams: URLSearchParams;
  } as any;
}

// Mock URLSearchParams
if (typeof global.URLSearchParams === 'undefined') {
  global.URLSearchParams = class URLSearchParams {
    private params = new Map<string, string>();
    
    constructor(init?: string | Record<string, string>) {
      if (typeof init === 'string') {
        // Parse query string
        if (init.startsWith('?')) init = init.slice(1);
        init.split('&').forEach(pair => {
          const [key, value] = pair.split('=');
          if (key) this.params.set(decodeURIComponent(key), decodeURIComponent(value || ''));
        });
      } else if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this.params.set(key, value);
        });
      }
    }
    
    get(name: string) { return this.params.get(name); }
    set(name: string, value: string) { this.params.set(name, value); }
    has(name: string) { return this.params.has(name); }
    delete(name: string) { this.params.delete(name); }
    entries() { return this.params.entries(); }
    keys() { return this.params.keys(); }
    values() { return this.params.values(); }
    forEach(fn: (value: string, key: string) => void) { this.params.forEach(fn); }
    toString() {
      return Array.from(this.params.entries())
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
    }
  } as any;
}