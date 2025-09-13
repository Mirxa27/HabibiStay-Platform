import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CMSService } from '../../src/shared/cms-service';
import {
  Page,
  Template,
  Component,
  Media,
  ContentVersion,
  AIProvider,
  AIModel,
  AIContentJob,
  AIContentHistory
} from '../../src/shared/types';

// Mock D1Database
const mockDB = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  all: vi.fn(),
  first: vi.fn(),
  run: vi.fn(),
};

describe('CMSService', () => {
  let cmsService: CMSService;

  beforeEach(() => {
    cmsService = new CMSService(mockDB as any);
    vi.clearAllMocks();
  });

  describe('Page Management', () => {
    it('should fetch all pages', async () => {
      const mockPages: Page[] = [
        {
          id: 1,
          title: 'Home',
          slug: 'home',
          template_id: null,
          content: '{"blocks":[]}',
          metadata: '{"seoTitle":"Home Page"}',
          status: 'published',
          created_by: 'user1',
          updated_by: 'user1',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          published_at: '2023-01-01T00:00:00Z',
        }
      ];

      mockDB.all.mockResolvedValue({ results: mockPages });

      const pages = await cmsService.getAllPages();
      
      expect(pages).toEqual(mockPages);
      expect(mockDB.prepare).toHaveBeenCalledWith('SELECT * FROM cms_pages ORDER BY created_at DESC');
      expect(mockDB.all).toHaveBeenCalled();
    });

    it('should create a new page', async () => {
      const newPage = {
        title: 'About',
        slug: 'about',
        template_id: null,
        content: '{"blocks":[]}',
        metadata: '{"seoTitle":"About Page"}',
        status: 'draft' as const,
        created_by: 'user1',
        updated_by: 'user1',
        published_at: null,
      };

      const expectedResult = {
        id: 2,
        ...newPage,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockDB.run.mockResolvedValue({ 
        results: [expectedResult],
        success: true
      });

      const page = await cmsService.createPage(newPage);
      
      expect(page).toEqual(expectedResult);
      expect(mockDB.prepare).toHaveBeenCalled();
      expect(mockDB.bind).toHaveBeenCalledWith(
        'About',
        'about',
        null,
        '{"blocks":[]}',
        '{"seoTitle":"About Page"}',
        'draft',
        'user1',
        'user1',
        null
      );
    });
  });

  describe('Template Management', () => {
    it('should fetch all templates', async () => {
      const mockTemplates: Template[] = [
        {
          id: 1,
          name: 'Default Template',
          description: 'Default page template',
          content_structure: '{"layout":"default"}',
          preview_image: '/images/default.png',
          is_default: true,
          created_by: 'admin',
          updated_by: 'admin',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        }
      ];

      mockDB.all.mockResolvedValue({ results: mockTemplates });

      const templates = await cmsService.getAllTemplates();
      
      expect(templates).toEqual(mockTemplates);
      expect(mockDB.prepare).toHaveBeenCalledWith('SELECT * FROM cms_templates ORDER BY created_at DESC');
      expect(mockDB.all).toHaveBeenCalled();
    });
  });

  describe('Component Management', () => {
    it('should fetch all components', async () => {
      const mockComponents: Component[] = [
        {
          id: 1,
          type: 'text',
          name: 'Text Block',
          properties: '{"text":"Hello World"}',
          styles: '{"color":"#000000"}',
          created_by: 'admin',
          updated_by: 'admin',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        }
      ];

      mockDB.all.mockResolvedValue({ results: mockComponents });

      const components = await cmsService.getAllComponents();
      
      expect(components).toEqual(mockComponents);
      expect(mockDB.prepare).toHaveBeenCalledWith('SELECT * FROM cms_components ORDER BY created_at DESC');
      expect(mockDB.all).toHaveBeenCalled();
    });
  });

  describe('Media Management', () => {
    it('should fetch all media', async () => {
      const mockMedia: Media[] = [
        {
          id: 1,
          filename: 'image.jpg',
          original_name: 'original-image.jpg',
          mime_type: 'image/jpeg',
          size: 1024,
          url: '/uploads/image.jpg',
          alt_text: 'Sample image',
          caption: 'A sample image',
          created_by: 'user1',
          created_at: '2023-01-01T00:00:00Z',
        }
      ];

      mockDB.all.mockResolvedValue({ results: mockMedia });

      const media = await cmsService.getAllMedia();
      
      expect(media).toEqual(mockMedia);
      expect(mockDB.prepare).toHaveBeenCalledWith('SELECT * FROM cms_media ORDER BY created_at DESC');
      expect(mockDB.all).toHaveBeenCalled();
    });
  });

  describe('AI Provider Management', () => {
    it('should fetch all AI providers', async () => {
      const mockProviders: AIProvider[] = [
        {
          id: 1,
          name: 'OpenAI',
          api_key: 'sk-...',
          api_url: 'https://api.openai.com/v1',
          enabled: true,
          default_model: 'gpt-4',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        }
      ];

      mockDB.all.mockResolvedValue({ results: mockProviders });

      const providers = await cmsService.getAllAIProviders();
      
      expect(providers).toEqual(mockProviders);
      expect(mockDB.prepare).toHaveBeenCalledWith('SELECT * FROM cms_ai_providers ORDER BY created_at DESC');
      expect(mockDB.all).toHaveBeenCalled();
    });
  });
});