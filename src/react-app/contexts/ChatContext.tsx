import { createContext, useContext, useState, ReactNode } from 'react';
import type { ChatMessage } from '@/shared/types';

interface ChatContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  addMessage: (message: ChatMessage) => void;
  sendMessage: (content: string) => Promise<void>;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
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

export default function ChatProvider({ children }: ChatProviderProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m Sara, your personal accommodation assistant. I\'m here to help you find the perfect stay in Riyadh. What brings you to our beautiful city?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, {
      ...message,
      timestamp: message.timestamp || new Date().toISOString(),
    }]);
  };

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMessage);
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.data.message,
          timestamp: new Date().toISOString(),
        };
        addMessage(assistantMessage);
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again in a moment.',
        timestamp: new Date().toISOString(),
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => setIsOpen(prev => !prev);
  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);

  return (
    <ChatContext.Provider value={{
      messages,
      isOpen,
      isLoading,
      addMessage,
      sendMessage,
      toggleChat,
      openChat,
      closeChat,
    }}>
      {children}
    </ChatContext.Provider>
  );
}
