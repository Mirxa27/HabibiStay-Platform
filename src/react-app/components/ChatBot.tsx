import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  User, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Heart,
  Calendar,
  Users,
  MapPin,
  Star,
  Home,
  Phone,
  Mail,
  Bed,
  Bath,
  Wifi,
  Car,
  Waves,
  Dumbbell
} from 'lucide-react';
import { useChat } from '@/react-app/contexts/ChatContext';
import type { ChatMessage, ChatButton, Property } from '@/shared/types';
import { clsx } from 'clsx';

interface PropertyCardProps {
  property: Property;
  onBook: (propertyId: number) => void;
  onViewDetails: (propertyId: number) => void;
}

function PropertyCard({ property, onBook, onViewDetails }: PropertyCardProps) {
  const amenityIcons: Record<string, any> = {
    wifi: Wifi,
    parking: Car,
    pool: Waves,
    gym: Dumbbell,
  };

  const images = Array.isArray(property.images) ? property.images : 
    (typeof property.images === 'string' ? JSON.parse(property.images || '[]') : []);
  const amenities = Array.isArray(property.amenities) ? property.amenities :
    (typeof property.amenities === 'string' ? JSON.parse(property.amenities || '[]') : []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm">
      {/* Property Image */}
      {images.length > 0 && (
        <img 
          src={images[0]} 
          alt={property.title}
          className="w-full h-32 object-cover rounded-lg mb-3"
        />
      )}
      
      {/* Property Details */}
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-900 text-sm">{property.title}</h4>
        
        <div className="flex items-center text-xs text-gray-600">
          <MapPin className="h-3 w-3 mr-1" />
          <span>{property.location}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Bed className="h-3 w-3 mr-1 text-gray-500" />
              <span className="text-gray-600">{property.bedrooms}</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-3 w-3 mr-1 text-gray-500" />
              <span className="text-gray-600">{property.bathrooms}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1 text-gray-500" />
              <span className="text-gray-600">{property.max_guests}</span>
            </div>
          </div>
          
          {property.average_rating && (
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
              <span className="text-gray-600">{property.average_rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex items-center space-x-2">
            {amenities.slice(0, 4).map((amenity, index) => {
              const IconComponent = amenityIcons[amenity];
              return IconComponent ? (
                <IconComponent key={index} className="h-3 w-3 text-gray-400" />
              ) : null;
            })}
            {amenities.length > 4 && (
              <span className="text-xs text-gray-500">+{amenities.length - 4} more</span>
            )}
          </div>
        )}
        
        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="text-sm">
            <span className="font-semibold text-[#2957c3]">{property.price_per_night} SAR</span>
            <span className="text-gray-500"> / night</span>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => onViewDetails(property.id)}
              className="px-2 py-1 text-xs text-gray-600 hover:text-[#2957c3] transition-colors"
            >
              Details
            </button>
            <button
              onClick={() => onBook(property.id)}
              className="px-3 py-1 text-xs bg-[#2957c3] text-white rounded hover:bg-blue-700 transition-colors"
            >
              Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ChatButtonProps {
  button: ChatButton;
  onClick: (button: ChatButton) => void;
}

function ChatButtonComponent({ button, onClick }: ChatButtonProps) {
  const getButtonStyle = (style?: string) => {
    switch (style) {
      case 'primary':
        return 'bg-[#2957c3] text-white hover:bg-blue-700';
      case 'success':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'warning':
        return 'bg-yellow-500 text-white hover:bg-yellow-600';
      case 'danger':
        return 'bg-red-500 text-white hover:bg-red-600';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  return (
    <button
      onClick={() => onClick(button)}
      className={clsx(
        'px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
        getButtonStyle(button.style)
      )}
    >
      {button.text}
    </button>
  );
}

interface MessageContentProps {
  message: ChatMessage;
  onButtonClick: (button: ChatButton) => void;
  onPropertyBook: (propertyId: number) => void;
  onPropertyViewDetails: (propertyId: number) => void;
}

function MessageContent({ message, onButtonClick, onPropertyBook, onPropertyViewDetails }: MessageContentProps) {
  const metadata = message.metadata || {};
  
  return (
    <div className="space-y-3">
      {/* Message Text */}
      <div className="whitespace-pre-wrap">{message.content}</div>
      
      {/* Featured Properties */}
      {metadata.show_featured_properties && metadata.properties && (
        <div className="space-y-2">
          {metadata.properties.map((property: Property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onBook={onPropertyBook}
              onViewDetails={onPropertyViewDetails}
            />
          ))}
        </div>
      )}
      
      {/* Single Property Card */}
      {metadata.type === 'property_card' && metadata.property && (
        <PropertyCard
          property={metadata.property}
          onBook={onPropertyBook}
          onViewDetails={onPropertyViewDetails}
        />
      )}
      
      {/* Action Buttons */}
      {metadata.buttons && metadata.buttons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {metadata.buttons.map((button: ChatButton) => (
            <ChatButtonComponent
              key={button.id}
              button={button}
              onClick={onButtonClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChatBot() {
  const {
    messages,
    isOpen,
    isLoading,
    sendMessage,
    toggleChat,
    closeChat,
    handleButtonClick,
    voiceEnabled,
    isListening,
    toggleVoice,
    startListening,
    stopListening,
    clearConversation,
    showPropertyCard,
    initiateBooking,
    featuredProperties,
  } = useChat();
  
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() && !isLoading) {
      const message = inputMessage.trim();
      setInputMessage('');
      await sendMessage(message);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePropertyBook = (propertyId: number) => {
    initiateBooking(propertyId);
  };

  const handlePropertyViewDetails = (propertyId: number) => {
    window.open(`/property/${propertyId}`, '_blank');
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 bg-[#2957c3] text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110 group"
        aria-label="Open chat with Sara"
      >
        <MessageCircle className="h-6 w-6" />
        <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          👋
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[32rem] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="bg-[#2957c3] text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Sara</h3>
            <p className="text-xs text-blue-100">Your accommodation assistant</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Voice Toggle */}
          <button
            onClick={toggleVoice}
            className={clsx(
              'p-1 rounded transition-colors',
              voiceEnabled ? 'bg-white bg-opacity-20' : 'hover:bg-white hover:bg-opacity-10'
            )}
            title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          
          {/* Clear Conversation */}
          <button
            onClick={clearConversation}
            className="p-1 rounded hover:bg-white hover:bg-opacity-10 transition-colors"
            title="New conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          
          {/* Close */}
          <button
            onClick={closeChat}
            className="p-1 rounded hover:bg-white hover:bg-opacity-10 transition-colors"
            title="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={clsx(
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={clsx(
                'max-w-[85%] p-3 rounded-lg text-sm',
                message.role === 'user'
                  ? 'bg-[#2957c3] text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              )}
            >
              {message.role === 'assistant' ? (
                <MessageContent
                  message={message}
                  onButtonClick={handleButtonClick}
                  onPropertyBook={handlePropertyBook}
                  onPropertyViewDetails={handlePropertyViewDetails}
                />
              ) : (
                <div>{message.content}</div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none text-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Sara about accommodations..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
            disabled={isLoading}
          />
          
          {/* Voice Input Button */}
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!voiceEnabled || isLoading}
            className={clsx(
              'p-2 rounded-md transition-colors',
              isListening
                ? 'bg-red-500 text-white hover:bg-red-600'
                : voiceEnabled
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            )}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
          
          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className={clsx(
              'p-2 rounded-md transition-colors',
              isLoading || !inputMessage.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#2957c3] text-white hover:bg-blue-700'
            )}
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        
        {/* Voice Status */}
        {isListening && (
          <div className="mt-2 text-xs text-red-600 flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
            Listening... Speak now
          </div>
        )}
      </div>
    </div>
  );
}
