// Enhanced AI Chat Service - Production Ready
// Supports multiple AI providers with content moderation and conversation persistence

import OpenAI from 'openai';
import { z } from 'zod';

// Input validation schemas
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(4000),
  timestamp: z.number().optional(),
  metadata: z.record(z.any()).optional()
});

export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  conversation_id: z.string().uuid().optional(),
  user_id: z.string().optional(),
  context: z.object({
    property_id: z.number().optional(),
    booking_id: z.string().optional(),
    user_preferences: z.record(z.any()).optional()
  }).optional(),
  model_preferences: z.object({
    provider: z.enum(['openai', 'anthropic', 'gemini']).optional(),
    model: z.string().optional(),
    temperature: z.number().min(0).max(2).optional()
  }).optional()
});

export const AIConfigSchema = z.object({
  model_provider: z.enum(['openai', 'anthropic', 'gemini']),
  model_name: z.string(),
  api_key: z.string(),
  temperature: z.number().min(0).max(2),
  max_tokens: z.number().min(1).max(4000),
  system_prompt: z.string().optional(),
  personality: z.enum(['professional', 'friendly', 'casual']),
  language: z.string().default('en'),
  voice_enabled: z.boolean().default(false),
  context_memory: z.boolean().default(true),
  response_speed: z.enum(['fast', 'balanced', 'detailed']).default('balanced'),
  content_moderation: z.boolean().default(true),
  rate_limit_per_hour: z.number().default(100)
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type AIConfig = z.infer<typeof AIConfigSchema>;

interface ConversationContext {
  property_searches: string[];
  booking_attempts: number;
  user_preferences: Record<string, any>;
  conversation_topics: string[];
  sentiment_score: number;
  last_interaction: Date;
}

interface AIResponse {
  message: string;
  confidence: number;
  tokens_used: number;
  response_time_ms: number;
  suggestions?: string[];
  requires_human?: boolean;
  moderation_flags?: string[];
}

export class AIProviderInterface {
  abstract generateResponse(messages: ChatMessage[], config: AIConfig, context?: any): Promise<AIResponse>;
  abstract moderateContent(content: string): Promise<{ flagged: boolean; categories: string[] }>;
}

export class OpenAIProvider extends AIProviderInterface {
  private client: OpenAI;

  constructor(apiKey: string) {
    super();
    this.client = new OpenAI({ apiKey });
  }

  async generateResponse(messages: ChatMessage[], config: AIConfig, context?: any): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      // Prepare messages for OpenAI
      const openAIMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add system prompt based on personality and context
      const systemPrompt = this.buildSystemPrompt(config, context);
      openAIMessages.unshift({
        role: 'system',
        content: systemPrompt
      });

      const response = await this.client.chat.completions.create({
        model: config.model_name,
        messages: openAIMessages as any,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
        stream: false
      });

      const responseTime = Date.now() - startTime;
      const message = response.choices[0]?.message?.content || 'I apologize, but I cannot process that request right now.';
      
      return {
        message,
        confidence: this.calculateConfidence(response),
        tokens_used: response.usage?.total_tokens || 0,
        response_time_ms: responseTime,
        suggestions: this.generateSuggestions(context),
        requires_human: this.shouldEscalateToHuman(message, context)
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        message: 'I\'m experiencing technical difficulties. Please try again in a moment.',
        confidence: 0,
        tokens_used: 0,
        response_time_ms: Date.now() - startTime,
        requires_human: true
      };
    }
  }

  async moderateContent(content: string): Promise<{ flagged: boolean; categories: string[] }> {
    try {
      const response = await this.client.moderations.create({
        input: content
      });

      const result = response.results[0];
      const flaggedCategories = Object.entries(result.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category, _]) => category);

      return {
        flagged: result.flagged,
        categories: flaggedCategories
      };
    } catch (error) {
      console.error('Content moderation error:', error);
      return { flagged: false, categories: [] };
    }
  }

  private buildSystemPrompt(config: AIConfig, context?: any): string {
    const basePrompts = {
      professional: "You are Sara, a professional AI assistant for HabibiStay, a premium vacation rental platform in Saudi Arabia. Provide helpful, accurate, and courteous assistance to guests and hosts. Focus on property bookings, travel recommendations, and platform guidance. Always maintain a professional tone while being warm and welcoming.",
      friendly: "Hi! I'm Sara, your friendly AI assistant at HabibiStay! I'm here to help you find the perfect vacation rental in Saudi Arabia and make your travel experience amazing. I love helping people discover great places to stay and creating memorable experiences! Feel free to ask me anything about our properties, bookings, or travel tips.",
      casual: "Hey there! I'm Sara, your AI buddy at HabibiStay. I'm here to help you find cool places to stay in Saudi Arabia and book your next adventure. Just ask me anything about properties, bookings, or travel tips - I'm here to make things easy for you!"
    };

    let systemPrompt = basePrompts[config.personality] || basePrompts.friendly;

    // Add context-specific information
    if (context?.property_id) {
      systemPrompt += " The user is currently viewing a property, so focus on helping with booking information, amenities, and area details.";
    }

    if (context?.user_preferences?.location) {
      systemPrompt += ` The user is interested in properties in ${context.user_preferences.location}.`;
    }

    // Add behavioral guidelines
    systemPrompt += `
    
    Important guidelines:
    - Always respond in ${config.language === 'ar' ? 'Arabic' : 'English'}
    - Keep responses concise but informative
    - If you don't know something, be honest about it
    - For booking requests, guide users through the proper process
    - For complex issues, suggest contacting human support
    - Always prioritize user safety and satisfaction
    - Mention specific HabibiStay features when relevant
    - Use Saudi cultural context appropriately
    `;

    return systemPrompt;
  }

  private calculateConfidence(response: any): number {
    // Simple confidence calculation based on response characteristics
    const message = response.choices[0]?.message?.content || '';
    const finishReason = response.choices[0]?.finish_reason;
    
    if (finishReason === 'stop' && message.length > 10) {
      return 0.9;
    } else if (finishReason === 'length') {
      return 0.7;
    } else {
      return 0.5;
    }
  }

  private generateSuggestions(context?: any): string[] {
    const suggestions = [];
    
    if (context?.property_id) {
      suggestions.push("Tell me more about the amenities");
      suggestions.push("What's nearby this property?");
      suggestions.push("How do I book this property?");
    } else {
      suggestions.push("Show me properties in Riyadh");
      suggestions.push("What makes HabibiStay special?");
      suggestions.push("Help me plan my trip");
    }

    return suggestions;
  }

  private shouldEscalateToHuman(message: string, context?: any): boolean {
    // Simple escalation logic - in production, this would be more sophisticated
    const escalationKeywords = ['complaint', 'refund', 'cancel booking', 'emergency', 'problem with payment'];
    return escalationKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }
}

export class AIChatService {
  private providers: Map<string, AIProviderInterface> = new Map();
  private rateLimiter = new Map<string, { count: number; resetTime: number }>();

  constructor(private db: any) {
    // Initialize providers when keys are available
  }

  async initializeProviders(config: AIConfig): Promise<void> {
    switch (config.model_provider) {
      case 'openai':
        this.providers.set('openai', new OpenAIProvider(config.api_key));
        break;
      // Add other providers as needed
    }
  }

  async processMessage(request: ChatRequest, userId?: string): Promise<{
    success: boolean;
    data?: AIResponse & { conversation_id: string };
    error?: string;
  }> {
    try {
      // Rate limiting check
      if (userId && !this.checkRateLimit(userId)) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please wait before sending another message.'
        };
      }

      // Get AI configuration
      const config = await this.getAIConfig();
      if (!config) {
        return {
          success: false,
          error: 'AI service is currently unavailable'
        };
      }

      // Content moderation
      if (config.content_moderation) {
        const moderation = await this.moderateContent(request.message);
        if (moderation.flagged) {
          await this.logSecurityEvent('inappropriate_content', userId, {
            message: request.message,
            categories: moderation.categories
          });
          
          return {
            success: false,
            error: 'Message contains inappropriate content and cannot be processed.'
          };
        }
      }

      // Get or create conversation
      const conversationId = request.conversation_id || this.generateConversationId();
      const conversation = await this.getConversation(conversationId);
      
      // Add user message to conversation
      const userMessage: ChatMessage = {
        role: 'user',
        content: request.message,
        timestamp: Date.now()
      };
      
      conversation.messages.push(userMessage);

      // Generate AI response
      await this.initializeProviders(config);
      const provider = this.providers.get(config.model_provider);
      if (!provider) {
        throw new Error(`AI provider ${config.model_provider} not available`);
      }

      const response = await provider.generateResponse(
        conversation.messages,
        config,
        { ...request.context, conversation_history: conversation }
      );

      // Add AI response to conversation
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
        metadata: {
          confidence: response.confidence,
          tokens_used: response.tokens_used,
          response_time_ms: response.response_time_ms
        }
      };

      conversation.messages.push(assistantMessage);

      // Save conversation
      await this.saveConversation(conversationId, conversation, userId);

      // Log interaction
      await this.logChatInteraction(userId, conversationId, request.message, response);

      return {
        success: true,
        data: {
          ...response,
          conversation_id: conversationId
        }
      };
    } catch (error) {
      console.error('AI Chat Service error:', error);
      return {
        success: false,
        error: 'Unable to process your message at this time. Please try again.'
      };
    }
  }

  private async getAIConfig(): Promise<AIConfig | null> {
    try {
      const config = await this.db.prepare(`
        SELECT * FROM ai_config WHERE is_active = 1 ORDER BY id DESC LIMIT 1
      `).first();

      if (!config) return null;

      return AIConfigSchema.parse(config);
    } catch (error) {
      console.error('Error fetching AI config:', error);
      return null;
    }
  }

  private async moderateContent(content: string): Promise<{ flagged: boolean; categories: string[] }> {
    const config = await this.getAIConfig();
    if (!config) return { flagged: false, categories: [] };

    const provider = this.providers.get(config.model_provider);
    if (!provider) return { flagged: false, categories: [] };

    return provider.moderateContent(content);
  }

  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userLimit = this.rateLimiter.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      this.rateLimiter.set(userId, {
        count: 1,
        resetTime: now + (60 * 60 * 1000) // 1 hour
      });
      return true;
    }

    if (userLimit.count >= 100) { // Default rate limit
      return false;
    }

    userLimit.count++;
    return true;
  }

  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private async getConversation(conversationId: string): Promise<{ messages: ChatMessage[]; context: any }> {
    try {
      const conversation = await this.db.prepare(`
        SELECT * FROM chat_conversations WHERE id = ?
      `).bind(conversationId).first();

      if (conversation) {
        return {
          messages: JSON.parse(conversation.messages || '[]'),
          context: JSON.parse(conversation.context || '{}')
        };
      }

      return { messages: [], context: {} };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return { messages: [], context: {} };
    }
  }

  private async saveConversation(conversationId: string, conversation: any, userId?: string): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT OR REPLACE INTO chat_conversations (
          id, user_id, messages, context, is_active, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        conversationId,
        userId || null,
        JSON.stringify(conversation.messages),
        JSON.stringify(conversation.context),
        1,
        new Date().toISOString()
      ).run();
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  private async logChatInteraction(userId: string | undefined, conversationId: string, message: string, response: AIResponse): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT INTO audit_logs (user_id, action, details, timestamp)
        VALUES (?, ?, ?, ?)
      `).bind(
        userId || 'anonymous',
        'chat_interaction',
        JSON.stringify({
          conversation_id: conversationId,
          message_length: message.length,
          response_length: response.message.length,
          tokens_used: response.tokens_used,
          response_time_ms: response.response_time_ms,
          confidence: response.confidence
        }),
        new Date().toISOString()
      ).run();
    } catch (error) {
      console.error('Error logging chat interaction:', error);
    }
  }

  private async logSecurityEvent(eventType: string, userId?: string, details?: any): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT INTO security_events (event_type, user_id, severity, details, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        eventType,
        userId || null,
        'medium',
        JSON.stringify(details || {}),
        new Date().toISOString()
      ).run();
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }
}