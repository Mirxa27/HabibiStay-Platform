// CMS Permissions Service for HabibiStay Platform

import { D1Database } from './types';

export class CMSPermissionsService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Get all CMS permissions for a user
   */
  async getUserCMSPermissions(userId: string): Promise<string[]> {
    try {
      const result = await this.db.prepare(`
        SELECT p.permission_name
        FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = ? AND p.category = 'cms'
      `).bind(userId).all();

      return result.results?.map((row: any) => row.permission_name) || [];
    } catch (error) {
      console.error('Error fetching user CMS permissions:', error);
      return [];
    }
  }

  /**
   * Check if user has a specific CMS permission
   */
  async userHasCMSPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const result = await this.db.prepare(`
        SELECT 1
        FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = ? AND p.permission_name = ? AND p.category = 'cms'
      `).bind(userId, permission).first();

      return !!result;
    } catch (error) {
      console.error('Error checking CMS permission:', error);
      return false;
    }
  }

  /**
   * Check if user has any of the specified CMS permissions
   */
  async userHasAnyCMSPermission(userId: string, permissions: string[]): Promise<boolean> {
    try {
      const placeholders = permissions.map(() => '?').join(',');
      const result = await this.db.prepare(`
        SELECT 1
        FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = ? AND p.permission_name IN (${placeholders}) AND p.category = 'cms'
        LIMIT 1
      `).bind(userId, ...permissions).first();

      return !!result;
    } catch (error) {
      console.error('Error checking CMS permissions:', error);
      return false;
    }
  }

  /**
   * Check if user has all of the specified CMS permissions
   */
  async userHasAllCMSPermissions(userId: string, permissions: string[]): Promise<boolean> {
    try {
      if (permissions.length === 0) return true;
      
      const placeholders = permissions.map(() => '?').join(',');
      const result = await this.db.prepare(`
        SELECT COUNT(DISTINCT p.permission_name) as count
        FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = ? AND p.permission_name IN (${placeholders}) AND p.category = 'cms'
      `).bind(userId, ...permissions).first();

      return result?.count === permissions.length;
    } catch (error) {
      console.error('Error checking CMS permissions:', error);
      return false;
    }
  }

  /**
   * Grant CMS permission to user
   */
  async grantCMSPermission(userId: string, permission: string): Promise<void> {
    try {
      // Check if permission exists and is a CMS permission
      const permissionRecord = await this.db.prepare(`
        SELECT id FROM permissions WHERE permission_name = ? AND category = 'cms'
      `).bind(permission).first();

      if (!permissionRecord) {
        throw new Error(`CMS Permission ${permission} not found`);
      }

      // Grant permission
      await this.db.prepare(`
        INSERT OR IGNORE INTO user_permissions (user_id, permission_id)
        VALUES (?, ?)
      `).bind(userId, permissionRecord.id).run();
    } catch (error) {
      console.error('Error granting CMS permission:', error);
      throw error;
    }
  }

  /**
   * Revoke CMS permission from user
   */
  async revokeCMSPermission(userId: string, permission: string): Promise<void> {
    try {
      await this.db.prepare(`
        DELETE FROM user_permissions
        WHERE user_id = ? AND permission_id = (
          SELECT id FROM permissions WHERE permission_name = ? AND category = 'cms'
        )
      `).bind(userId, permission).run();
    } catch (error) {
      console.error('Error revoking CMS permission:', error);
      throw error;
    }
  }

  /**
   * Get all available CMS permissions
   */
  async getAllCMSPermissions(): Promise<{name: string, description: string}[]> {
    try {
      const result = await this.db.prepare(`
        SELECT permission_name as name, description
        FROM permissions
        WHERE category = 'cms'
        ORDER BY permission_name
      `).all();

      return result.results || [];
    } catch (error) {
      console.error('Error fetching CMS permissions:', error);
      return [];
    }
  }

  /**
   * Get users with specific CMS permission
   */
  async getUsersWithCMSPermission(permission: string): Promise<any[]> {
    try {
      const result = await this.db.prepare(`
        SELECT u.*
        FROM users u
        JOIN user_permissions up ON u.id = up.user_id
        JOIN permissions p ON up.permission_id = p.id
        WHERE p.permission_name = ? AND p.category = 'cms'
      `).bind(permission).all();

      return result.results || [];
    } catch (error) {
      console.error('Error fetching users with CMS permission:', error);
      return [];
    }
  }
}