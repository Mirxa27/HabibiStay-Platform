import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CMSPermissionsService } from '../../src/shared/cms-permissions-service';

// Mock D1Database
const mockDB = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  all: vi.fn(),
  first: vi.fn(),
  run: vi.fn(),
};

describe('CMSPermissionsService', () => {
  let cmsPermissionsService: CMSPermissionsService;

  beforeEach(() => {
    cmsPermissionsService = new CMSPermissionsService(mockDB as any);
    vi.clearAllMocks();
  });

  describe('getUserCMSPermissions', () => {
    it('should fetch CMS permissions for a user', async () => {
      const mockPermissions = [
        { permission_name: 'cms.pages.view' },
        { permission_name: 'cms.pages.create' },
        { permission_name: 'cms.templates.view' }
      ];

      mockDB.all.mockResolvedValue({ results: mockPermissions });

      const permissions = await cmsPermissionsService.getUserCMSPermissions('user123');
      
      expect(permissions).toEqual(['cms.pages.view', 'cms.pages.create', 'cms.templates.view']);
      expect(mockDB.prepare).toHaveBeenCalledWith(`
        SELECT p.permission_name
        FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = ? AND p.category = 'cms'
      `);
      expect(mockDB.bind).toHaveBeenCalledWith('user123');
    });

    it('should return empty array when no permissions found', async () => {
      mockDB.all.mockResolvedValue({ results: [] });

      const permissions = await cmsPermissionsService.getUserCMSPermissions('user123');
      
      expect(permissions).toEqual([]);
    });
  });

  describe('userHasCMSPermission', () => {
    it('should check if user has a specific CMS permission', async () => {
      mockDB.first.mockResolvedValue({ '1': 1 });

      const hasPermission = await cmsPermissionsService.userHasCMSPermission('user123', 'cms.pages.create');
      
      expect(hasPermission).toBe(true);
      expect(mockDB.prepare).toHaveBeenCalledWith(`
        SELECT 1
        FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = ? AND p.permission_name = ? AND p.category = 'cms'
      `);
      expect(mockDB.bind).toHaveBeenCalledWith('user123', 'cms.pages.create');
    });

    it('should return false when user does not have permission', async () => {
      mockDB.first.mockResolvedValue(null);

      const hasPermission = await cmsPermissionsService.userHasCMSPermission('user123', 'cms.pages.create');
      
      expect(hasPermission).toBe(false);
    });
  });

  describe('userHasAnyCMSPermission', () => {
    it('should check if user has any of the specified CMS permissions', async () => {
      mockDB.first.mockResolvedValue({ '1': 1 });

      const hasPermission = await cmsPermissionsService.userHasAnyCMSPermission('user123', ['cms.pages.create', 'cms.pages.edit']);
      
      expect(hasPermission).toBe(true);
      expect(mockDB.bind).toHaveBeenCalledWith('user123', 'cms.pages.create', 'cms.pages.edit');
    });
  });

  describe('userHasAllCMSPermissions', () => {
    it('should check if user has all of the specified CMS permissions', async () => {
      mockDB.first.mockResolvedValue({ count: 2 });

      const hasPermission = await cmsPermissionsService.userHasAllCMSPermissions('user123', ['cms.pages.create', 'cms.pages.edit']);
      
      expect(hasPermission).toBe(true);
    });

    it('should return false when user does not have all permissions', async () => {
      mockDB.first.mockResolvedValue({ count: 1 });

      const hasPermission = await cmsPermissionsService.userHasAllCMSPermissions('user123', ['cms.pages.create', 'cms.pages.edit']);
      
      expect(hasPermission).toBe(false);
    });

    it('should return true when no permissions are specified', async () => {
      const hasPermission = await cmsPermissionsService.userHasAllCMSPermissions('user123', []);
      
      expect(hasPermission).toBe(true);
    });
  });

  describe('grantCMSPermission', () => {
    it('should grant CMS permission to user', async () => {
      mockDB.first.mockResolvedValue({ id: 1 });
      mockDB.run.mockResolvedValue({ success: true });

      await cmsPermissionsService.grantCMSPermission('user123', 'cms.pages.create');
      
      expect(mockDB.prepare).toHaveBeenCalledTimes(2);
      expect(mockDB.bind).toHaveBeenCalledWith('cms.pages.create', 'cms');
      expect(mockDB.bind).toHaveBeenCalledWith('user123', 1);
    });

    it('should throw error when permission does not exist', async () => {
      mockDB.first.mockResolvedValue(null);

      await expect(cmsPermissionsService.grantCMSPermission('user123', 'cms.pages.create'))
        .rejects.toThrow('CMS Permission cms.pages.create not found');
    });
  });

  describe('revokeCMSPermission', () => {
    it('should revoke CMS permission from user', async () => {
      mockDB.run.mockResolvedValue({ success: true });

      await cmsPermissionsService.revokeCMSPermission('user123', 'cms.pages.create');
      
      expect(mockDB.prepare).toHaveBeenCalledWith(`
        DELETE FROM user_permissions
        WHERE user_id = ? AND permission_id = (
          SELECT id FROM permissions WHERE permission_name = ? AND category = 'cms'
        )
      `);
      expect(mockDB.bind).toHaveBeenCalledWith('user123', 'cms.pages.create');
    });
  });

  describe('getAllCMSPermissions', () => {
    it('should fetch all available CMS permissions', async () => {
      const mockPermissions = [
        { name: 'cms.pages.view', description: 'View CMS pages' },
        { name: 'cms.pages.create', description: 'Create CMS pages' },
        { name: 'cms.pages.edit', description: 'Edit CMS pages' }
      ];

      mockDB.all.mockResolvedValue({ results: mockPermissions });

      const permissions = await cmsPermissionsService.getAllCMSPermissions();
      
      expect(permissions).toEqual(mockPermissions);
      expect(mockDB.prepare).toHaveBeenCalledWith(`
        SELECT permission_name as name, description
        FROM permissions
        WHERE category = 'cms'
        ORDER BY permission_name
      `);
    });
  });

  describe('getUsersWithCMSPermission', () => {
    it('should fetch users with specific CMS permission', async () => {
      const mockUsers = [
        { id: 'user1', email: 'user1@example.com', name: 'User 1' },
        { id: 'user2', email: 'user2@example.com', name: 'User 2' }
      ];

      mockDB.all.mockResolvedValue({ results: mockUsers });

      const users = await cmsPermissionsService.getUsersWithCMSPermission('cms.pages.create');
      
      expect(users).toEqual(mockUsers);
      expect(mockDB.prepare).toHaveBeenCalledWith(`
        SELECT u.*
        FROM users u
        JOIN user_permissions up ON u.id = up.user_id
        JOIN permissions p ON up.permission_id = p.id
        WHERE p.permission_name = ? AND p.category = 'cms'
      `);
      expect(mockDB.bind).toHaveBeenCalledWith('cms.pages.create');
    });
  });
});