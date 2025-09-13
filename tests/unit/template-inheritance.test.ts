import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CMSService } from '../../src/shared/cms-service';
import { Template } from '../../src/shared/types';

// Mock D1Database
const mockDB = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  all: vi.fn(),
  first: vi.fn(),
  run: vi.fn(),
};

describe('Template Inheritance', () => {
  let cmsService: CMSService;

  beforeEach(() => {
    cmsService = new CMSService(mockDB as any);
    vi.clearAllMocks();
  });

  it('should create a template with inheritance', async () => {
    const parentTemplate: Template = {
      id: 1,
      name: 'Base Template',
      description: 'Base template for all pages',
      content_structure: '{"layout":"default"}',
      preview_image: '/images/base.png',
      is_default: true,
      parent_template_id: null,
      design_settings: '{"colors":{"primary":"#000000"}}',
      created_by: 'admin',
      updated_by: 'admin',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    const childTemplateData = {
      name: 'Child Template',
      description: 'Child template inheriting from base',
      content_structure: '{"layout":"child"}',
      preview_image: '/images/child.png',
      is_default: false,
      parent_template_id: 1,
      design_settings: '{"colors":{"secondary":"#ffffff"}}',
      created_by: 'admin',
      updated_by: 'admin',
    };

    const expectedResult = {
      id: 2,
      ...childTemplateData,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    mockDB.run.mockResolvedValue({ 
      results: [expectedResult],
      success: true
    });

    const template = await cmsService.createTemplate(childTemplateData);
    
    expect(template).toEqual(expectedResult);
    expect(mockDB.prepare).toHaveBeenCalled();
    expect(mockDB.bind).toHaveBeenCalledWith(
      'Child Template',
      'Child template inheriting from base',
      '{"layout":"child"}',
      '/images/child.png',
      false,
      1,
      '{"colors":{"secondary":"#ffffff"}}',
      'admin',
      'admin'
    );
  });

  it('should update a template with inheritance', async () => {
    const updatedTemplateData = {
      name: 'Updated Template',
      parent_template_id: 1,
      design_settings: '{"colors":{"primary":"#ff0000"}}',
      updated_by: 'admin',
    };

    const expectedResult = {
      id: 1,
      name: 'Updated Template',
      description: 'Base template',
      content_structure: '{"layout":"default"}',
      preview_image: '/images/base.png',
      is_default: true,
      parent_template_id: 1,
      design_settings: '{"colors":{"primary":"#ff0000"}}',
      created_by: 'admin',
      updated_by: 'admin',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
    };

    mockDB.run.mockResolvedValue({ 
      results: [expectedResult],
      success: true
    });

    const template = await cmsService.updateTemplate(1, updatedTemplateData);
    
    expect(template).toEqual(expectedResult);
    expect(mockDB.prepare).toHaveBeenCalled();
  });
});