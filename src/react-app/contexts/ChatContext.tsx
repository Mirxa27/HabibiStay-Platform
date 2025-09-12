import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { ChatMessage, ChatButton, Property, CreateBooking } from '../../shared/types';

// Extend global Window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChatContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  conversationId: string | null;
  featuredProperties: Property[];
  currentBooking: Partial<CreateBooking> | null;
  voiceEnabled: boolean;
  isListening: boolean;
  sendMessage: (content: string, action?: string) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  toggleChat: () => void;
  closeChat: () => void;
  openChat: () => void;
  showPropertyCard: (property: Property) => void;
  initiateBooking: (propertyId: number) => void;
  updateBookingData: (data: Partial<CreateBooking>) => void;
  handleButtonClick: (button: ChatButton) => void;
  toggleVoice: () => void;
  startListening: () => void;
  stopListening: () => void;
  clearConversation: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'habibistay_chat_state';
const CONVERSATION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function ChatProvider({ children }: ChatProviderProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Partial<CreateBooking> | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for speech recognition support
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';
        
        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript.trim()) {
            sendMessage(transcript, 'voice_input');
          }
          setIsListening(false);
        };
        
        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
        
        recognitionInstance.onend = () => {
          setIsListening(false);
        };
        
        setRecognition(recognitionInstance);
      }
      
      // Check for speech synthesis support
      if (window.speechSynthesis) {
        setSynthesis(window.speechSynthesis);
      }
    }
  }, []);

  // Load conversation state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const { messages: savedMessages, conversationId: savedId, timestamp } = JSON.parse(savedState);
        
        // Check if conversation is still valid (not expired)
        if (timestamp && Date.now() - timestamp < CONVERSATION_TIMEOUT) {
          setMessages(savedMessages || []);
          setConversationId(savedId);
        } else {
          // Clear expired conversation
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        console.error('Error loading chat state:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save conversation state to localStorage
  const saveConversationState = useCallback(() => {
    if (conversationId && messages.length > 0) {
      const state = {
        messages,
        conversationId,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [messages, conversationId]);

  // Save state whenever messages or conversation ID changes
  useEffect(() => {
    saveConversationState();
  }, [saveConversationState]);

  // Fetch featured properties on initialization
  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const response = await fetch('/api/properties/featured');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setFeaturedProperties(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching featured properties:', error);
      }
    };

    fetchFeaturedProperties();
  }, []);

  // Initialize Sara with greeting and featured properties
  const initializeSara = useCallback(() => {
    if (messages.length === 0) {
      const greetingMessage: ChatMessage = {
        role: 'assistant',
        content: `Hello! I'm Sara, your personal accommodation assistant at HabibiStay. I'm here to help you find the perfect stay in Riyadh. \n\nLet me show you some of our featured properties:`,
        timestamp: new Date().toISOString(),
        metadata: {
          type: 'greeting',
          show_featured_properties: true,
          buttons: [
            { id: 'search_properties', text: '🏠 Browse All Properties', action: 'search', style: 'primary' },
            { id: 'check_availability', text: '📅 Check Availability', action: 'availability', style: 'secondary' },
            { id: 'voice_search', text: '🎤 Voice Search', action: 'voice', style: 'secondary' },
            { id: 'get_help', text: '💬 Get Help', action: 'help', style: 'secondary' },
          ],
        },
      };
      setMessages([greetingMessage]);
    }
  }, [messages.length]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, {
      ...message,
      timestamp: message.timestamp || new Date().toISOString(),
    }]);
  }, []);

  const sendMessage = useCallback(async (content: string, action?: string) => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    
    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      metadata: { action },
    };
    
    addMessage(userMessage);

    try {
      // Send to enhanced chat endpoint
      const response = await fetch('/api/chat/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const aiResponse: any = result.data; // Using any for now due to type complexity
        
        // Update conversation ID if new
        if (aiResponse.conversation_id && aiResponse.conversation_id !== conversationId) {
          setConversationId(aiResponse.conversation_id);
        }
        
        // Add Sara's response
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: aiResponse.message,
          timestamp: new Date().toISOString(),
          metadata: {
            buttons: aiResponse.buttons,
            properties: aiResponse.properties || aiResponse.featured_properties,
            action: aiResponse.action,
            data: aiResponse.data,
          },
        };
        
        addMessage(assistantMessage);
        
        // Update featured properties if provided
        if (aiResponse.featured_properties && aiResponse.featured_properties.length > 0) {
          setFeaturedProperties(aiResponse.featured_properties);
        }
        
        // Text-to-speech for Sara's response if voice is enabled
        if (voiceEnabled && synthesis && aiResponse.message) {
          const utterance = new SpeechSynthesisUtterance(aiResponse.message);
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
          utterance.volume = 0.8;
          synthesis.speak(utterance);
        }
        
      } else {
        throw new Error(result.error || 'Failed to get response from Sara');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        metadata: {
          error: true,
          buttons: [
            { id: 'retry', text: '🔄 Retry', action: 'retry', style: 'primary' },
            { id: 'contact_support', text: '📞 Contact Support', action: 'contact', style: 'secondary' },
          ],
        },
      };
      
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, conversationId, addMessage, voiceEnabled, synthesis]);

  const handleButtonClick = useCallback(async (button: ChatButton) => {
    switch (button.action) {
      case 'search':
        await sendMessage('I want to browse all available properties', 'search_properties');
        break;
      case 'availability':
        await sendMessage('I want to check availability for specific dates', 'check_availability');
        break;
      case 'book':
        if (button.data?.property_id) {
          initiateBooking(button.data.property_id);
        } else {
          await sendMessage('I want to book a property', 'initiate_booking');
        }
        break;
      case 'voice':
        startListening();
        break;
      case 'help':
        await sendMessage('I need help with booking', 'get_help');
        break;
      case 'retry':
        // Retry last user message
        const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
        if (lastUserMessage) {
          await sendMessage(lastUserMessage.content, 'retry');
        }
        break;
      case 'contact':
        // Open contact form or redirect
        window.location.href = '/contact';
        break;
      default:
        await sendMessage(button.text, button.action);
    }
  }, [sendMessage, messages]);

  const showPropertyCard = useCallback((property: Property) => {
    const propertyMessage: ChatMessage = {
      role: 'assistant',
      content: `Here's detailed information about ${property.title}:`,
      timestamp: new Date().toISOString(),
      metadata: {
        type: 'property_card',
        property,
        buttons: [
          { id: 'book_property', text: '🏠 Book This Property', action: 'book', style: 'primary', data: { property_id: property.id } },
          { id: 'check_availability', text: '📅 Check Availability', action: 'availability', style: 'secondary', data: { property_id: property.id } },
          { id: 'view_details', text: '👁️ View Full Details', action: 'view_details', style: 'secondary', data: { property_id: property.id } },
          { id: 'add_wishlist', text: '❤️ Add to Wishlist', action: 'wishlist', style: 'secondary', data: { property_id: property.id } },
        ],
      },
    };
    
    addMessage(propertyMessage);
  }, [addMessage]);

  const initiateBooking = useCallback((propertyId: number) => {
    const property = featuredProperties.find(p => p.id === propertyId);
    if (property) {
      setCurrentBooking({ property_id: propertyId });
      
      const bookingMessage: ChatMessage = {
        role: 'assistant',
        content: `Great choice! Let's book ${property.title}. I'll need a few details to get started:`,
        timestamp: new Date().toISOString(),
        metadata: {
          type: 'booking_form',
          property,
          buttons: [
            { id: 'enter_dates', text: '📅 Select Dates', action: 'booking_dates', style: 'primary' },
            { id: 'guest_count', text: '👥 Number of Guests', action: 'guest_count', style: 'secondary' },
            { id: 'guest_info', text: '👤 Guest Information', action: 'guest_info', style: 'secondary' },
          ],
        },
      };
      
      addMessage(bookingMessage);
    }
  }, [featuredProperties, addMessage]);

  const updateBookingData = useCallback((data: Partial<CreateBooking>) => {
    setCurrentBooking(prev => ({ ...prev, ...data }));
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => {
      const newState = !prev;
      if (newState && messages.length === 0) {
        // Initialize Sara when opening chat for first time
        setTimeout(initializeSara, 100);
      }
      return newState;
    });
  }, [messages.length, initializeSara]);

  const openChat = useCallback(() => {
    setIsOpen(true);
    if (messages.length === 0) {
      setTimeout(initializeSara, 100);
    }
  }, [messages.length, initializeSara]);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    if (isListening) {
      stopListening();
    }
  }, [isListening]);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled(prev => !prev);
  }, []);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      setIsListening(true);
      recognition.start();
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setCurrentBooking(null);
    localStorage.removeItem(STORAGE_KEY);
    initializeSara();
  }, [initializeSara]);

  const value: ChatContextType = {
    messages,
    isOpen,
    isLoading,
    conversationId,
    featuredProperties,
    currentBooking,
    voiceEnabled,
    isListening,
    sendMessage,
    addMessage,
    toggleChat,
    closeChat,
    openChat,
    showPropertyCard,
    initiateBooking,
    updateBookingData,
    handleButtonClick,
    toggleVoice,
    startListening,
    stopListening,
    clearConversation,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

// Default export for compatibility
export default ChatProvider;
