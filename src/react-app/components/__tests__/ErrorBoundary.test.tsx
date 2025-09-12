import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router';
import ErrorBoundary from '../ErrorBoundary';

// A component that throws an error
const ProblematicComponent = () => {
  throw new Error('Test error');
};

// A normal component
const NormalComponent = () => <div>Normal Component</div>;

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <BrowserRouter>
        <ErrorBoundary>
          <NormalComponent />
        </ErrorBoundary>
      </BrowserRouter>
    );
    
    expect(screen.getByText('Normal Component')).toBeInTheDocument();
  });

  it('catches errors and displays error UI', () => {
    // Mock console.error to avoid noisy output
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <BrowserRouter>
        <ErrorBoundary>
          <ProblematicComponent />
        </ErrorBoundary>
      </BrowserRouter>
    );
    
    // Check that error message is displayed
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('shows error details in development mode', () => {
    // Mock NODE_ENV
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    // Mock console.error to avoid noisy output
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <BrowserRouter>
        <ErrorBoundary>
          <ProblematicComponent />
        </ErrorBoundary>
      </BrowserRouter>
    );
    
    // Check that error details are shown in development
    expect(screen.getByText('Error Details:')).toBeInTheDocument();
    
    // Restore environment and console.error
    process.env.NODE_ENV = originalEnv;
    consoleErrorSpy.mockRestore();
  });

  it('allows retrying after error', () => {
    // Mock console.error to avoid noisy output
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <BrowserRouter>
        <ErrorBoundary>
          <ProblematicComponent />
        </ErrorBoundary>
      </BrowserRouter>
    );
    
    // Initially shows error
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    
    // Click retry button
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    
    // Since we're not actually fixing the error, it should show the error again
    // But the test ensures the button works without crashing
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('allows going home after error', () => {
    // Mock console.error to avoid noisy output
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <BrowserRouter>
        <ErrorBoundary>
          <ProblematicComponent />
        </ErrorBoundary>
      </BrowserRouter>
    );
    
    // Check that home button exists
    const homeButton = screen.getByText('Go Home');
    expect(homeButton).toBeInTheDocument();
    expect(homeButton).toHaveAttribute('href', '/');
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('uses custom fallback when provided', () => {
    // Mock console.error to avoid noisy output
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const customFallback = <div>Custom Error Fallback</div>;
    
    render(
      <BrowserRouter>
        <ErrorBoundary fallback={customFallback}>
          <ProblematicComponent />
        </ErrorBoundary>
      </BrowserRouter>
    );
    
    // Should show custom fallback instead of default error UI
    expect(screen.getByText('Custom Error Fallback')).toBeInTheDocument();
    expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument();
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});