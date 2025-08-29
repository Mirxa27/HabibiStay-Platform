// Property Service for HabibiStay
// Comprehensive CRUD operations for property management

import { Database } from '../db';
import { Property, PropertyCreate, PropertyUpdate, PropertySearchFilters } from '../../shared/types';
import { sanitizeHtml, validateFileUpload } from '../utils/security';

export interface PropertySearchOptions extends PropertySearchFilters {
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'rating' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  userId?: string; // For user-specific searches
}

export interface PropertySearchResult {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PropertyStats {
  totalProperties: number;
  activeProperties: number;
  featuredProperties: number;
  avgRating: number;
  totalViews: number;
  totalBookings: number;
}

export class PropertyService {
  constructor(private db: Database) {}

  // Create new property
  async createProperty(propertyData: PropertyCreate, ownerId: string): Promise<Property> {
    try {
      // Validate and sanitize input data
      const sanitizedData = this.sanitizePropertyData(propertyData);
      
      // Validate property data
      await this.validatePropertyData(sanitizedData);
      
      // Insert property into database
      const propertyId = await this.db.run(`
        INSERT INTO properties (
          title, description, location, property_type, max_guests, bedrooms, bathrooms,
          price_per_night, amenities, images, owner_id, is_featured, is_active,
          check_in_time, check_out_time, minimum_stay, maximum_stay, house_rules,
          cancellation_policy, latitude, longitude, address, city, country,
          postal_code, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        sanitizedData.title,
        sanitizedData.description,
        sanitizedData.location,
        sanitizedData.property_type,
        sanitizedData.max_guests,
        sanitizedData.bedrooms,
        sanitizedData.bathrooms,
        sanitizedData.price_per_night,
        JSON.stringify(sanitizedData.amenities),
        JSON.stringify(sanitizedData.images || []),
        ownerId,
        false, // is_featured (admin only)
        true,  // is_active
        sanitizedData.check_in_time || '15:00',
        sanitizedData.check_out_time || '11:00',
        sanitizedData.minimum_stay || 1,
        sanitizedData.maximum_stay || 30,
        sanitizedData.house_rules || '',
        sanitizedData.cancellation_policy || 'flexible',
        sanitizedData.latitude || null,
        sanitizedData.longitude || null,
        sanitizedData.address || '',
        sanitizedData.city || '',
        sanitizedData.country || '',
        sanitizedData.postal_code || '',
        new Date().toISOString(),
        new Date().toISOString()
      ]);

      // Log property creation
      await this.logPropertyAction(propertyId, ownerId, 'create', sanitizedData);

      // Get and return the created property
      return await this.getPropertyById(propertyId);
    } catch (error) {
      throw new Error(`Failed to create property: ${error.message}`);
    }
  }

  // Get property by ID
  async getPropertyById(propertyId: number): Promise<Property> {
    try {
      const property = await this.db.get(`
        SELECT p.*, u.name as owner_name, u.email as owner_email,
               COALESCE(AVG(r.rating), 0) as rating,
               COUNT(r.id) as review_count
        FROM properties p
        LEFT JOIN users u ON p.owner_id = u.id
        LEFT JOIN reviews r ON p.id = r.property_id
        WHERE p.id = ?
        GROUP BY p.id
      `, [propertyId]);

      if (!property) {
        throw new Error('Property not found');
      }

      // Parse JSON fields
      property.amenities = JSON.parse(property.amenities || '[]');
      property.images = JSON.parse(property.images || '[]');

      // Increment view count
      await this.incrementViewCount(propertyId);

      return property as Property;
    } catch (error) {
      throw new Error(`Failed to get property: ${error.message}`);
    }
  }

  // Update property
  async updateProperty(propertyId: number, updateData: PropertyUpdate, userId: string): Promise<Property> {
    try {
      // Check if user owns the property or is admin
      await this.validatePropertyOwnership(propertyId, userId);

      // Sanitize input data
      const sanitizedData = this.sanitizePropertyData(updateData);

      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];

      for (const [key, value] of Object.entries(sanitizedData)) {
        if (value !== undefined && key !== 'id') {
          if (key === 'amenities' || key === 'images') {
            updateFields.push(`${key} = ?`);
            updateValues.push(JSON.stringify(value));
          } else {
            updateFields.push(`${key} = ?`);
            updateValues.push(value);
          }
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      // Add updated_at field
      updateFields.push('updated_at = ?');
      updateValues.push(new Date().toISOString());
      updateValues.push(propertyId);

      await this.db.run(`
        UPDATE properties 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);

      // Log property update
      await this.logPropertyAction(propertyId, userId, 'update', sanitizedData);

      // Return updated property
      return await this.getPropertyById(propertyId);
    } catch (error) {
      throw new Error(`Failed to update property: ${error.message}`);
    }
  }

  // Delete property
  async deleteProperty(propertyId: number, userId: string): Promise<void> {
    try {
      // Check if user owns the property or is admin
      await this.validatePropertyOwnership(propertyId, userId);

      // Check for active bookings
      const activeBookings = await this.db.get(`
        SELECT COUNT(*) as count 
        FROM bookings 
        WHERE property_id = ? AND status IN ('confirmed', 'pending') 
        AND check_out_date > ?
      `, [propertyId, new Date().toISOString()]);

      if (activeBookings.count > 0) {
        throw new Error('Cannot delete property with active bookings');
      }

      // Soft delete the property
      await this.db.run(`
        UPDATE properties 
        SET is_active = false, updated_at = ?
        WHERE id = ?
      `, [new Date().toISOString(), propertyId]);

      // Log property deletion
      await this.logPropertyAction(propertyId, userId, 'delete', {});
    } catch (error) {
      throw new Error(`Failed to delete property: ${error.message}`);
    }
  }

  // Search properties with filters
  async searchProperties(options: PropertySearchOptions): Promise<PropertySearchResult> {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'created_at',
        sortOrder = 'desc',
        location,
        property_type,
        max_guests,
        min_price,
        max_price,
        amenities,
        check_in_date,
        check_out_date,
        userId
      } = options;

      // Build WHERE clause
      const whereConditions = ['p.is_active = true'];
      const queryParams: any[] = [];

      if (location) {
        whereConditions.push('(p.location LIKE ? OR p.city LIKE ? OR p.country LIKE ?)');
        const locationPattern = `%${location}%`;
        queryParams.push(locationPattern, locationPattern, locationPattern);
      }

      if (property_type) {
        whereConditions.push('p.property_type = ?');
        queryParams.push(property_type);
      }

      if (max_guests) {
        whereConditions.push('p.max_guests >= ?');
        queryParams.push(max_guests);
      }

      if (min_price) {
        whereConditions.push('p.price_per_night >= ?');
        queryParams.push(min_price);
      }

      if (max_price) {
        whereConditions.push('p.price_per_night <= ?');
        queryParams.push(max_price);
      }

      if (amenities && amenities.length > 0) {
        const amenityConditions = amenities.map(() => 'p.amenities LIKE ?').join(' AND ');
        whereConditions.push(`(${amenityConditions})`);
        amenities.forEach(amenity => queryParams.push(`%"${amenity}"%`));
      }

      // Check availability if dates provided
      if (check_in_date && check_out_date) {
        whereConditions.push(`
          p.id NOT IN (
            SELECT DISTINCT b.property_id 
            FROM bookings b 
            WHERE b.status IN ('confirmed', 'pending') 
            AND (
              (b.check_in_date <= ? AND b.check_out_date > ?) OR
              (b.check_in_date < ? AND b.check_out_date >= ?) OR
              (b.check_in_date >= ? AND b.check_out_date <= ?)
            )
          )
        `);
        queryParams.push(check_in_date, check_in_date, check_out_date, check_out_date, check_in_date, check_out_date);
      }

      if (userId) {
        whereConditions.push('p.owner_id = ?');
        queryParams.push(userId);
      }

      const whereClause = whereConditions.join(' AND ');

      // Build ORDER BY clause
      const validSortFields = ['price_per_night', 'rating', 'created_at', 'updated_at'];
      const sortField = validSortFields.includes(sortBy) ? 
        (sortBy === 'rating' ? 'COALESCE(AVG(r.rating), 0)' : `p.${sortBy}`) : 
        'p.created_at';
      const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

      // Get total count
      const totalResult = await this.db.get(`
        SELECT COUNT(DISTINCT p.id) as total
        FROM properties p
        LEFT JOIN reviews r ON p.id = r.property_id
        WHERE ${whereClause}
      `, queryParams);

      const total = totalResult.total;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;

      // Get properties
      const properties = await this.db.all(`
        SELECT p.*, u.name as owner_name,
               COALESCE(AVG(r.rating), 0) as rating,
               COUNT(r.id) as review_count
        FROM properties p
        LEFT JOIN users u ON p.owner_id = u.id
        LEFT JOIN reviews r ON p.id = r.property_id
        WHERE ${whereClause}
        GROUP BY p.id
        ORDER BY ${sortField} ${sortDirection}
        LIMIT ? OFFSET ?
      `, [...queryParams, limit, offset]);

      // Parse JSON fields
      const parsedProperties = properties.map(property => ({
        ...property,
        amenities: JSON.parse(property.amenities || '[]'),
        images: JSON.parse(property.images || '[]')
      }));

      return {
        properties: parsedProperties as Property[],
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      throw new Error(`Failed to search properties: ${error.message}`);
    }
  }

  // Get featured properties
  async getFeaturedProperties(limit: number = 10): Promise<Property[]> {
    try {
      const properties = await this.db.all(`
        SELECT p.*, u.name as owner_name,
               COALESCE(AVG(r.rating), 0) as rating,
               COUNT(r.id) as review_count
        FROM properties p
        LEFT JOIN users u ON p.owner_id = u.id
        LEFT JOIN reviews r ON p.id = r.property_id
        WHERE p.is_featured = true AND p.is_active = true
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT ?
      `, [limit]);

      return properties.map(property => ({
        ...property,
        amenities: JSON.parse(property.amenities || '[]'),
        images: JSON.parse(property.images || '[]')
      })) as Property[];
    } catch (error) {
      throw new Error(`Failed to get featured properties: ${error.message}`);
    }
  }

  // Get properties by owner
  async getPropertiesByOwner(ownerId: string, page: number = 1, limit: number = 20): Promise<PropertySearchResult> {
    try {
      return await this.searchProperties({ userId: ownerId, page, limit });
    } catch (error) {
      throw new Error(`Failed to get properties by owner: ${error.message}`);
    }
  }

  // Update property status (admin only)
  async updatePropertyStatus(propertyId: number, status: { is_active?: boolean; is_featured?: boolean }, adminId: string): Promise<Property> {
    try {
      // Verify admin permissions
      const admin = await this.db.get('SELECT role FROM users WHERE id = ?', [adminId]);
      if (!admin || admin.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const updateFields = [];
      const updateValues = [];

      if (status.is_active !== undefined) {
        updateFields.push('is_active = ?');
        updateValues.push(status.is_active);
      }

      if (status.is_featured !== undefined) {
        updateFields.push('is_featured = ?');
        updateValues.push(status.is_featured);
      }

      if (updateFields.length === 0) {
        throw new Error('No status updates provided');
      }

      updateFields.push('updated_at = ?');
      updateValues.push(new Date().toISOString());
      updateValues.push(propertyId);

      await this.db.run(`
        UPDATE properties 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);

      // Log status update
      await this.logPropertyAction(propertyId, adminId, 'status_update', status);

      return await this.getPropertyById(propertyId);
    } catch (error) {
      throw new Error(`Failed to update property status: ${error.message}`);
    }
  }

  // Get property statistics
  async getPropertyStats(ownerId?: string): Promise<PropertyStats> {
    try {
      let whereClause = '';
      const params: any[] = [];

      if (ownerId) {
        whereClause = 'WHERE p.owner_id = ?';
        params.push(ownerId);
      }

      const stats = await this.db.get(`
        SELECT 
          COUNT(p.id) as totalProperties,
          COUNT(CASE WHEN p.is_active = true THEN 1 END) as activeProperties,
          COUNT(CASE WHEN p.is_featured = true THEN 1 END) as featuredProperties,
          COALESCE(AVG(r.rating), 0) as avgRating,
          COALESCE(SUM(p.view_count), 0) as totalViews,
          COALESCE(COUNT(b.id), 0) as totalBookings
        FROM properties p
        LEFT JOIN reviews r ON p.id = r.property_id
        LEFT JOIN bookings b ON p.id = b.property_id
        ${whereClause}
      `, params);

      return stats as PropertyStats;
    } catch (error) {
      throw new Error(`Failed to get property statistics: ${error.message}`);
    }
  }

  // Upload property images
  async uploadPropertyImages(propertyId: number, files: File[], userId: string): Promise<string[]> {
    try {
      // Validate property ownership
      await this.validatePropertyOwnership(propertyId, userId);

      const uploadedUrls: string[] = [];

      for (const file of files) {
        // Validate file
        const validation = validateFileUpload(file, {
          maxSize: 10 * 1024 * 1024, // 10MB
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
        });

        if (!validation.isValid) {
          throw new Error(`Invalid file: ${validation.error}`);
        }

        // Upload to cloud storage (implement with your chosen provider)
        const url = await this.uploadToCloudStorage(file, `properties/${propertyId}`);
        uploadedUrls.push(url);
      }

      // Update property images
      const currentProperty = await this.getPropertyById(propertyId);
      const updatedImages = [...(currentProperty.images || []), ...uploadedUrls];

      await this.db.run(`
        UPDATE properties 
        SET images = ?, updated_at = ?
        WHERE id = ?
      `, [JSON.stringify(updatedImages), new Date().toISOString(), propertyId]);

      // Log image upload
      await this.logPropertyAction(propertyId, userId, 'images_upload', { count: files.length });

      return uploadedUrls;
    } catch (error) {
      throw new Error(`Failed to upload property images: ${error.message}`);
    }
  }

  // Remove property image
  async removePropertyImage(propertyId: number, imageUrl: string, userId: string): Promise<void> {
    try {
      // Validate property ownership
      await this.validatePropertyOwnership(propertyId, userId);

      const property = await this.getPropertyById(propertyId);
      const updatedImages = (property.images || []).filter(url => url !== imageUrl);

      await this.db.run(`
        UPDATE properties 
        SET images = ?, updated_at = ?
        WHERE id = ?
      `, [JSON.stringify(updatedImages), new Date().toISOString(), propertyId]);

      // Delete from cloud storage
      await this.deleteFromCloudStorage(imageUrl);

      // Log image removal
      await this.logPropertyAction(propertyId, userId, 'image_remove', { imageUrl });
    } catch (error) {
      throw new Error(`Failed to remove property image: ${error.message}`);
    }
  }

  // Private helper methods

  private sanitizePropertyData(data: PropertyCreate | PropertyUpdate): any {
    const sanitized = { ...data };
    
    if (sanitized.title) {
      sanitized.title = sanitizeHtml(sanitized.title);
    }
    
    if (sanitized.description) {
      sanitized.description = sanitizeHtml(sanitized.description);
    }
    
    if (sanitized.house_rules) {
      sanitized.house_rules = sanitizeHtml(sanitized.house_rules);
    }

    return sanitized;
  }

  private async validatePropertyData(data: PropertyCreate): Promise<void> {
    if (!data.title || data.title.trim().length < 5) {
      throw new Error('Property title must be at least 5 characters long');
    }

    if (!data.description || data.description.trim().length < 20) {
      throw new Error('Property description must be at least 20 characters long');
    }

    if (!data.location || data.location.trim().length < 3) {
      throw new Error('Property location is required');
    }

    if (!data.property_type) {
      throw new Error('Property type is required');
    }

    if (!data.max_guests || data.max_guests < 1 || data.max_guests > 20) {
      throw new Error('Max guests must be between 1 and 20');
    }

    if (!data.price_per_night || data.price_per_night < 10 || data.price_per_night > 10000) {
      throw new Error('Price per night must be between 10 and 10000');
    }
  }

  private async validatePropertyOwnership(propertyId: number, userId: string): Promise<void> {
    const property = await this.db.get('SELECT owner_id FROM properties WHERE id = ?', [propertyId]);
    
    if (!property) {
      throw new Error('Property not found');
    }

    const user = await this.db.get('SELECT role FROM users WHERE id = ?', [userId]);
    
    if (property.owner_id !== userId && user?.role !== 'admin') {
      throw new Error('Access denied: You do not own this property');
    }
  }

  private async incrementViewCount(propertyId: number): Promise<void> {
    await this.db.run(`
      UPDATE properties 
      SET view_count = COALESCE(view_count, 0) + 1 
      WHERE id = ?
    `, [propertyId]);
  }

  private async logPropertyAction(propertyId: number, userId: string, action: string, details: any): Promise<void> {
    await this.db.run(`
      INSERT INTO audit_logs (user_id, action, details, timestamp)
      VALUES (?, ?, ?, ?)
    `, [userId, `property_${action}`, JSON.stringify({ propertyId, ...details }), new Date().toISOString()]);
  }

  private async uploadToCloudStorage(file: File, path: string): Promise<string> {
    // Implement with your chosen cloud storage provider (Cloudinary, AWS S3, etc.)
    // This is a placeholder implementation
    return `https://storage.habibistay.com/${path}/${file.name}`;
  }

  private async deleteFromCloudStorage(url: string): Promise<void> {
    // Implement deletion from your cloud storage provider
    console.log(`Deleting image: ${url}`);
  }
}