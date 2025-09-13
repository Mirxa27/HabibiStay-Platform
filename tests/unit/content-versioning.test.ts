import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CMSService } from '../../src/shared/cms-service';
import { ContentVersion } from '../../src/shared/types';

// Mock D1Database
const mockDB = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  all: vi.fn(),
  first: vi.fn(),
  run: vi.fn(),
};

describe('Content Versioning', () => {
  let cmsService: CMSService;

  beforeEach(() => {
    cmsService = new CMSService(mockDB as any);
    vi.clearAllMocks();
  });

  it('should create a content version', async () => {
    const versionData = {
      content_id: 1,
      content_type: 'page',
      data: '{"title":"Test Page","content":"Test content"}',
      created_by: 'user1',
      comment: 'Initial version'
    };

    const expectedResult = {
      id: 1,
      ...versionData,
      created_at: '2023-01-01T00:00:00Z'
    };

    mockDB.run.mockResolvedValue({ 
      results: [expectedResult],
      success: true
    });

    const version = await cmsService.createContentVersion(versionData);
    
    expect(version).toEqual(expectedResult);
    expect(mockDB.prepare).toHaveBeenCalled();
    expect(mockDB.bind).toHaveBeenCalledWith(
      1,
      'page',
      '{"title":"Test Page","content":"Test content"}',
      'user1',
      'Initial version'
    );
  });

  it('should fetch content versions for a specific content item', async () => {
    const mockVersions: ContentVersion[] = [
      {
        id: 1,
        content_id: 1,
        content_type: 'page',
        data: '{"title":"Test Page","content":"Version 1"}',
        created_by: 'user1',
        created_at: '2023-01-01T00:00:00Z',
        comment: 'First version'
      },
      {
        id: 2,
        content_id: 1,
        content_type: 'page',
        data: '{"title":"Test Page","content":"Version 2"}',
        created_by: 'user1',
        created_at: '2023-01-02T00:00:00Z',
        comment: 'Updated version'
      }
    ];

    mockDB.all.mockResolvedValue({ results: mockVersions });

    const versions = await cmsService.getContentVersions(1, 'page');
    
    expect(versions).toEqual(mockVersions);
    expect(mockDB.prepare).toHaveBeenCalledWith(
      'SELECT * FROM cms_content_versions WHERE content_id = ? AND content_type = ? ORDER BY created_at DESC'
    );
    expect(mockDB.bind).toHaveBeenCalledWith(1, 'page');
  });
});