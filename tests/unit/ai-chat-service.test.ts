/**
 * Unit tests for AIChatService
 */

import { AIChatService } from '../../src/shared/ai-chat-service';

// Mock database
const mockDb = {
  prepare: jest.fn().mockReturnThis(),
  bind: jest.fn().mockReturnThis(),
  first: jest.fn(),
  run: jest.fn()
};

// Mock OpenAI
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn()
        }
      },
      moderations: {
        create: jest.fn()
      }
    }))
  };
});

describe('AIChatService', () => {
  let aiChatService: AIChatService;

  beforeEach(() => {
    aiChatService = new AIChatService(mockDb as any);
    jest.clearAllMocks();
  });

  describe('processMessage', () => {
    const mockChatRequest = {
      message: 'Hello, I need help finding a property in Riyadh',
      user_id: 'user_123',
      context: {
        property_id: 1,
        user_preferences: { location: 'Riyadh' }
      }
    };

    it('should process chat message successfully', async () => {
      // Mock AI config
      mockDb.first.mockResolvedValueOnce({
        model_provider: 'openai',
        model_name: 'gpt-4o-mini',
        api_key: 'test-key',
        temperature: 0.7,
        max_tokens: 500,
        personality: 'friendly',
        language: 'en',
        content_moderation: true,
        is_active: true
      });

      // Mock moderation response
      const mockOpenAI = require('openai').OpenAI();
      mockOpenAI.moderations.create.mockResolvedValue({
        results: [{ flagged: false, categories: {} }]
      });

      // Mock chat completion
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: 'Hello! I\'d be happy to help you find a perfect property in Riyadh. What type of accommodation are you looking for?'
          }
        }],
        usage: { total_tokens: 45 }
      });

      // Mock conversation save
      mockDb.run.mockResolvedValue({ success: true });

      const result = await aiChatService.processMessage(mockChatRequest);

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('Riyadh');
      expect(result.data?.tokens_used).toBe(45);
    });

    it('should handle rate limiting', async () => {
      // Mock AI config
      mockDb.first.mockResolvedValueOnce({
        model_provider: 'openai',
        is_active: true
      });

      // Simulate rate limit exceeded by calling 101 times
      for (let i = 0; i < 101; i++) {
        await aiChatService.processMessage({ ...mockChatRequest, user_id: 'rate_limit_test' });
      }

      const result = await aiChatService.processMessage({ ...mockChatRequest, user_id: 'rate_limit_test' });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Rate limit exceeded');
    });

    it('should block inappropriate content', async () => {
      // Mock AI config
      mockDb.first.mockResolvedValueOnce({
        model_provider: 'openai',
        api_key: 'test-key',
        content_moderation: true,
        is_active: true
      });

      // Mock moderation flagged
      const mockOpenAI = require('openai').OpenAI();
      mockOpenAI.moderations.create.mockResolvedValue({
        results: [{ 
          flagged: true, 
          categories: { harassment: true }
        }]
      });

      const result = await aiChatService.processMessage({
        ...mockChatRequest,
        message: 'inappropriate content here'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('inappropriate content');
    });

    it('should handle AI service unavailable', async () => {
      // Mock no AI config
      mockDb.first.mockResolvedValue(null);

      const result = await aiChatService.processMessage(mockChatRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('AI service is currently unavailable');
    });

    it('should generate conversation ID if not provided', async () => {
      mockDb.first.mockResolvedValueOnce({
        model_provider: 'openai',
        api_key: 'test-key',
        is_active: true,
        content_moderation: false
      });

      const mockOpenAI = require('openai').OpenAI();
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Test response' } }],
        usage: { total_tokens: 10 }
      });

      mockDb.run.mockResolvedValue({ success: true });

      const result = await aiChatService.processMessage({
        message: 'Hello',
        user_id: 'user_123'
      });

      expect(result.success).toBe(true);
      expect(result.data?.conversation_id).toMatch(/^conv_\d+_/);
    });
  });

  describe('buildSystemPrompt', () => {
    it('should build context-aware system prompt', () => {
      const config = {
        personality: 'friendly' as const,
        language: 'en'
      };

      const context = {
        property_id: 1,
        user_preferences: { location: 'Riyadh' }
      };

      // Access private method for testing
      const buildSystemPrompt = (aiChatService as any).buildSystemPrompt;
      const prompt = buildSystemPrompt.call(aiChatService, config, context);

      expect(prompt).toContain('Sara');
      expect(prompt).toContain('friendly');
      expect(prompt).toContain('property');
      expect(prompt).toContain('Riyadh');
      expect(prompt).toContain('English');
    });

    it('should adapt prompt for Arabic language', () => {
      const config = {
        personality: 'professional' as const,
        language: 'ar'
      };

      const buildSystemPrompt = (aiChatService as any).buildSystemPrompt;
      const prompt = buildSystemPrompt.call(aiChatService, config, {});

      expect(prompt).toContain('Arabic');
      expect(prompt).toContain('professional');
    });
  });

  describe('generateSuggestions', () => {
    it('should generate property-specific suggestions', () => {
      const generateSuggestions = (aiChatService as any).generateSuggestions;
      const suggestions = generateSuggestions.call(aiChatService, { property_id: 1 });

      expect(suggestions).toContain('Tell me more about the amenities');
      expect(suggestions).toContain('What\'s nearby this property?');
      expect(suggestions).toContain('How do I book this property?');
    });

    it('should generate general suggestions when no context', () => {
      const generateSuggestions = (aiChatService as any).generateSuggestions;
      const suggestions = generateSuggestions.call(aiChatService, {});

      expect(suggestions).toContain('Show me properties in Riyadh');
      expect(suggestions).toContain('What makes HabibiStay special?');
      expect(suggestions).toContain('Help me plan my trip');
    });
  });
});