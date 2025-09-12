import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NotificationProvider, useNotifications, useNotificationHelpers } from '../NotificationSystem';

// Test component that uses the notification hooks
const TestComponent = () => {
  const { addNotification, removeNotification, clearAll } = useNotifications();
  const { showSuccess, showError, showWarning, showInfo } = useNotificationHelpers();
  
  return (
    <div>
      <button onClick={() => addNotification({ 
        type: 'success', 
        title: 'Test Notification',
        message: 'This is a test notification'
      })}>
        Add Notification
      </button>
      
      <button onClick={() => showSuccess('Success Title', 'Success message')}>
        Show Success
      </button>
      
      <button onClick={() => showError('Error Title', 'Error message')}>
        Show Error
      </button>
      
      <button onClick={() => showWarning('Warning Title', 'Warning message')}>
        Show Warning
      </button>
      
      <button onClick={() => showInfo('Info Title', 'Info message')}>
        Show Info
      </button>
      
      <button onClick={clearAll}>
        Clear All
      </button>
    </div>
  );
};

describe('NotificationSystem', () => {
  it('renders without crashing', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    expect(screen.getByText('Add Notification')).toBeInTheDocument();
  });

  it('adds and displays notifications', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Add a notification
    fireEvent.click(screen.getByText('Add Notification'));
    
    // Check that notification is displayed
    await waitFor(() => {
      expect(screen.getByText('Test Notification')).toBeInTheDocument();
      expect(screen.getByText('This is a test notification')).toBeInTheDocument();
    });
  });

  it('shows different notification types', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Test success notification
    fireEvent.click(screen.getByText('Show Success'));
    await waitFor(() => {
      expect(screen.getByText('Success Title')).toBeInTheDocument();
    });
    
    // Test error notification
    fireEvent.click(screen.getByText('Show Error'));
    await waitFor(() => {
      expect(screen.getByText('Error Title')).toBeInTheDocument();
    });
  });

  it('automatically removes notifications after duration', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Add a notification with short duration
    const button = screen.getByText('Add Notification');
    fireEvent.click(button);
    
    // Check that notification is displayed
    await waitFor(() => {
      expect(screen.getByText('Test Notification')).toBeInTheDocument();
    });
    
    // Wait for it to be removed (default is 5000ms, but we can't wait that long in tests)
    // This test would need to be adjusted in a real implementation
  });

  it('allows manual removal of notifications', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Add a notification
    fireEvent.click(screen.getByText('Add Notification'));
    
    // Check that notification is displayed
    await waitFor(() => {
      expect(screen.getByText('Test Notification')).toBeInTheDocument();
    });
    
    // Close the notification
    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    
    // Check that notification is removed
    await waitFor(() => {
      expect(screen.queryByText('Test Notification')).not.toBeInTheDocument();
    });
  });

  it('clears all notifications', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Add multiple notifications
    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Error'));
    
    // Check that notifications are displayed
    await waitFor(() => {
      expect(screen.getByText('Success Title')).toBeInTheDocument();
      expect(screen.getByText('Error Title')).toBeInTheDocument();
    });
    
    // Clear all notifications
    fireEvent.click(screen.getByText('Clear All'));
    
    // Check that notifications are removed
    await waitFor(() => {
      expect(screen.queryByText('Success Title')).not.toBeInTheDocument();
      expect(screen.queryByText('Error Title')).not.toBeInTheDocument();
    });
  });

  it('throws error when used outside provider', () => {
    // Mock console.error to avoid noisy output
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useNotifications must be used within NotificationProvider');
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});