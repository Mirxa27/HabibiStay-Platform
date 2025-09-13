import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIChatService, ChatRequestSchema } from '../../src/shared/ai-chat-service';

// Mock database
const mockDB = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  first: vi.fn(),
  run: vi.fn(),
  all: vi.fn(),
};

describe('AIChatService', () => {
  let chatService: AIChatService;

  beforeEach(() => {
    chatService = new AIChatService(mockDB);
    vi.clearAllMocks();
  });

  it('should validate chat request schema', () => {
    const validRequest = {
      message: 'Hello Sara',
      conversation_id: 'conv_123',
      user_id: 'user_123',
      context: {
        property_id: 1,
        user_preferences: { location: 'Riyadh' }
      }
    };

    const result = ChatRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should reject invalid chat request', () => {
    const invalidRequest = {
      message: '', // Empty message should fail
    };

    const result = ChatRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });

  it('should generate conversation ID', () => {
    const id1 = (chatService as any).generateConversationId();
    const id2 = (chatService as any).generateConversationId();
    
    expect(id1).toMatch(/^conv_\d+_[a-z0-9]+$/);
    expect(id2).toMatch(/^conv_\d+_[a-z0-9]+$/);
    expect(id1).not.toBe(id2);
  });

  it('should check rate limit', () => {
    const userId = 'test-user';
    const checkRateLimit = (chatService as any).checkRateLimit.bind(chatService);
    
    // First call should pass
    expect(checkRateLimit(userId)).toBe(true);
    
    // Second call should also pass (below limit)
    expect(checkRateLimit(userId)).toBe(true);
  });
});