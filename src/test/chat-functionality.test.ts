import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIChatService } from '../shared/ai-chat-service';

// Mock database
const mockDB = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  first: vi.fn(),
  run: vi.fn(),
  all: vi.fn(),
};

describe('Chat Functionality', () => {
  let chatService: AIChatService;

  beforeEach(() => {
    chatService = new AIChatService(mockDB);
    vi.clearAllMocks();
  });

  it('should create chat service instance', () => {
    expect(chatService).toBeDefined();
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