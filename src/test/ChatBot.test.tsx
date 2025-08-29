// ChatBot component tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockFetch, mockApiResponse, waitForAsync } from '@test/utils';
import ChatBot from '@/react-app/components/ChatBot';

// Mock the ChatContext
const mockChatContext = {
  messages: [],
  isOpen: true,
  isLoading: false,
  featuredProperties: [],
  addMessage: vi.fn(),
  sendMessage: vi.fn(),
  toggleChat: vi.fn(),
  showPropertyCard: vi.fn(),
  initiateBooking: vi.fn(),
};

vi.mock('@/contexts/ChatContext', () => ({
  useChatContext: () => mockChatContext,
  ChatProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock Web Speech API
const mockSpeechRecognition = {
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  onresult: null,
  onerror: null,
  onend: null,
};

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: vi.fn(() => mockSpeechRecognition),
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: vi.fn(() => mockSpeechRecognition),
});

const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => []),
  pending: false,
  speaking: false,
  paused: false,
};

Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: mockSpeechSynthesis,
});

describe('ChatBot Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockChatContext.messages = [];
    mockChatContext.isLoading = false;
    mockChatContext.featuredProperties = [
      {
        id: 1,
        title: 'Luxury Downtown Apartment',
        location: 'Riyadh, Saudi Arabia',
        price_per_night: 250,
        images: ['https://example.com/image1.jpg'],
        rating: 4.8,
        amenities: ['wifi', 'parking'],
      },
      {
        id: 2,
        title: 'Modern Villa',
        location: 'Jeddah, Saudi Arabia',
        price_per_night: 400,
        images: ['https://example.com/image2.jpg'],
        rating: 4.9,
        amenities: ['pool', 'gym'],
      },
    ];
  });

  it('should render Sara greeting and featured properties', () => {
    renderWithProviders(<ChatBot />);
    
    expect(screen.getByText(/Hi! I'm Sara/)).toBeInTheDocument();
    expect(screen.getByText(/How can I help you find the perfect stay today?/)).toBeInTheDocument();
    expect(screen.getByText('Luxury Downtown Apartment')).toBeInTheDocument();
    expect(screen.getByText('Modern Villa')).toBeInTheDocument();
  });

  it('should display quick action buttons', () => {
    renderWithProviders(<ChatBot />);
    
    expect(screen.getByText('🏠 Browse Properties')).toBeInTheDocument();
    expect(screen.getByText('📅 Check Availability')).toBeInTheDocument();
    expect(screen.getByText('💳 Book Now')).toBeInTheDocument();
    expect(screen.getByText('👤 Login/Register')).toBeInTheDocument();
    expect(screen.getByText('🎤 Voice Search')).toBeInTheDocument();
  });

  it('should handle text message input', async () => {
    mockFetch(mockApiResponse({ message: 'Great! I can help you find properties.' }));
    
    renderWithProviders(<ChatBot />);
    
    const input = screen.getByPlaceholder('Type your message...');
    const sendButton = screen.getByText('Send');
    
    await user.type(input, 'I need a place to stay');
    await user.click(sendButton);
    
    expect(mockChatContext.sendMessage).toHaveBeenCalledWith('I need a place to stay');
  });

  it('should handle Enter key to send message', async () => {
    renderWithProviders(<ChatBot />);
    
    const input = screen.getByPlaceholder('Type your message...');
    
    await user.type(input, 'Looking for hotels');
    await user.keyboard('{Enter}');
    
    expect(mockChatContext.sendMessage).toHaveBeenCalledWith('Looking for hotels');
  });

  it('should prevent sending empty messages', async () => {
    renderWithProviders(<ChatBot />);
    
    const sendButton = screen.getByText('Send');
    await user.click(sendButton);
    
    expect(mockChatContext.sendMessage).not.toHaveBeenCalled();
  });

  it('should show loading state when processing', () => {
    mockChatContext.isLoading = true;
    
    renderWithProviders(<ChatBot />);
    
    expect(screen.getByText('Sara is typing...')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeDisabled();
  });

  it('should display chat messages correctly', () => {
    mockChatContext.messages = [
      {
        id: '1',
        role: 'user',
        content: 'Hello Sara',
        timestamp: Date.now() - 60000,
      },
      {
        id: '2',
        role: 'assistant',
        content: 'Hello! How can I help you today?',
        timestamp: Date.now() - 30000,
      },
    ];
    
    renderWithProviders(<ChatBot />);
    
    expect(screen.getByText('Hello Sara')).toBeInTheDocument();
    expect(screen.getByText('Hello! How can I help you today?')).toBeInTheDocument();
  });

  it('should handle property card interactions', async () => {
    renderWithProviders(<ChatBot />);
    
    const propertyCard = screen.getByText('Luxury Downtown Apartment').closest('.property-card');
    const viewDetailsButton = propertyCard?.querySelector('button:contains("View Details")');
    
    if (viewDetailsButton) {
      await user.click(viewDetailsButton);
      expect(mockChatContext.showPropertyCard).toHaveBeenCalledWith('1');
    }
  });

  it('should handle booking initiation', async () => {
    renderWithProviders(<ChatBot />);
    
    const propertyCard = screen.getByText('Luxury Downtown Apartment').closest('.property-card');
    const bookButton = propertyCard?.querySelector('button:contains("Book Now")');
    
    if (bookButton) {
      await user.click(bookButton);
      expect(mockChatContext.initiateBooking).toHaveBeenCalledWith('1');
    }
  });

  it('should handle voice recognition start', async () => {
    renderWithProviders(<ChatBot />);
    
    const voiceButton = screen.getByText('🎤 Voice Search');
    await user.click(voiceButton);
    
    expect(mockSpeechRecognition.start).toHaveBeenCalled();
  });

  it('should handle voice recognition results', async () => {
    renderWithProviders(<ChatBot />);
    
    const voiceButton = screen.getByText('🎤 Voice Search');
    await user.click(voiceButton);
    
    // Simulate speech recognition result
    const mockEvent = {
      results: [
        [
          {
            transcript: 'I need a hotel in Riyadh',
            confidence: 0.9,
          },
        ],
      ],
      resultIndex: 0,
    };
    
    if (mockSpeechRecognition.onresult) {
      mockSpeechRecognition.onresult(mockEvent);
    }
    
    await waitFor(() => {
      expect(mockChatContext.sendMessage).toHaveBeenCalledWith('I need a hotel in Riyadh');
    });
  });

  it('should handle voice recognition errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    renderWithProviders(<ChatBot />);
    
    const voiceButton = screen.getByText('🎤 Voice Search');
    await user.click(voiceButton);
    
    // Simulate speech recognition error
    if (mockSpeechRecognition.onerror) {
      mockSpeechRecognition.onerror({ error: 'network' });
    }
    
    expect(consoleSpy).toHaveBeenCalledWith('Speech recognition error:', { error: 'network' });
    consoleSpy.mockRestore();
  });

  it('should toggle voice output setting', async () => {
    renderWithProviders(<ChatBot />);
    
    const voiceToggle = screen.getByLabelText(/Voice Output/);
    await user.click(voiceToggle);
    
    // Should save preference to localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith('sara_voice_enabled', 'false');
  });

  it('should speak responses when voice output is enabled', async () => {
    localStorage.setItem('sara_voice_enabled', 'true');
    
    mockChatContext.messages = [
      {
        id: '1',
        role: 'assistant',
        content: 'Welcome to HabibiStay!',
        timestamp: Date.now(),
      },
    ];
    
    renderWithProviders(<ChatBot />);
    
    await waitFor(() => {
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    });
  });

  it('should handle quick action button clicks', async () => {
    renderWithProviders(<ChatBot />);
    
    await user.click(screen.getByText('📅 Check Availability'));
    expect(mockChatContext.sendMessage).toHaveBeenCalledWith('I want to check availability for dates');
    
    await user.click(screen.getByText('🏠 Browse Properties'));
    expect(mockChatContext.sendMessage).toHaveBeenCalledWith('Show me available properties');
  });

  it('should close chat when close button is clicked', async () => {
    renderWithProviders(<ChatBot />);
    
    const closeButton = screen.getByLabelText('Close chat');
    await user.click(closeButton);
    
    expect(mockChatContext.toggleChat).toHaveBeenCalled();
  });

  it('should scroll to bottom when new messages arrive', async () => {
    const scrollSpy = vi.fn();
    Element.prototype.scrollTo = scrollSpy;
    
    mockChatContext.messages = [
      {
        id: '1',
        role: 'user',
        content: 'First message',
        timestamp: Date.now() - 60000,
      },
    ];
    
    const { rerender } = renderWithProviders(<ChatBot />);
    
    // Add new message
    mockChatContext.messages.push({
      id: '2',
      role: 'assistant',
      content: 'Second message',
      timestamp: Date.now(),
    });
    
    rerender(<ChatBot />);
    
    await waitFor(() => {
      expect(scrollSpy).toHaveBeenCalledWith({
        top: expect.any(Number),
        behavior: 'smooth',
      });
    });
  });

  it('should format timestamps correctly', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    const timestamp = now.getTime();
    
    mockChatContext.messages = [
      {
        id: '1',
        role: 'user',
        content: 'Test message',
        timestamp,
      },
    ];
    
    renderWithProviders(<ChatBot />);
    
    expect(screen.getByText('12:00')).toBeInTheDocument();
  });

  it('should handle network errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockChatContext.sendMessage.mockRejectedValue(new Error('Network error'));
    
    renderWithProviders(<ChatBot />);
    
    const input = screen.getByPlaceholder('Type your message...');
    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });

  it('should be accessible with keyboard navigation', async () => {
    renderWithProviders(<ChatBot />);
    
    const input = screen.getByPlaceholder('Type your message...');
    
    // Tab should focus the input
    await user.tab();
    expect(input).toHaveFocus();
    
    // Tab should move to send button
    await user.tab();
    expect(screen.getByText('Send')).toHaveFocus();
  });

  it('should have proper ARIA labels', () => {
    renderWithProviders(<ChatBot />);
    
    expect(screen.getByLabelText('Close chat')).toBeInTheDocument();
    expect(screen.getByLabelText('Voice Output')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /type your message/i })).toBeInTheDocument();
  });
});