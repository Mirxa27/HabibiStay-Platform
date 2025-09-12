// Property Service for HabibiStay
// Basic property management operations

import { Property } from '../../shared/types';
import { sanitizeString } from '../../shared/security-utils';

export interface PropertySearchOptions {
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'rating' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  userId?: string;
  location?: string;
  property_type?: string;
  max_guests?: number;
  min_price?: number;
  max_price?: number;
  amenities?: string[];
  check_in_date?: string;
  check_out_date?: string;
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
  constructor(private db: any) {}

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
      throw new Error(`Failed to get property: ${(error as Error).message}`);
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
      const propertiesResult = await this.db.all(`
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

      // Handle both direct array and object with results property (for testing)
      let properties: any[] = [];
      if (Array.isArray(propertiesResult)) {
        properties = propertiesResult;
      } else if (propertiesResult && typeof propertiesResult === 'object' && 'results' in propertiesResult) {
        properties = Array.isArray(propertiesResult.results) ? propertiesResult.results : [];
      }

      // Parse JSON fields
      const parsedProperties = properties.map((property: any) => ({
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
      throw new Error(`Failed to search properties: ${(error as Error).message}`);
    }
  }

  // Get featured properties
  async getFeaturedProperties(limit: number = 10): Promise<Property[]> {
    try {
      const propertiesResult = await this.db.all(`
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

      // Handle both direct array and object with results property (for testing)
      let properties: any[] = [];
      if (Array.isArray(propertiesResult)) {
        properties = propertiesResult;
      } else if (propertiesResult && typeof propertiesResult === 'object' && 'results' in propertiesResult) {
        properties = Array.isArray(propertiesResult.results) ? propertiesResult.results : [];
      }

      return properties.map((property: any) => ({
        ...property,
        amenities: JSON.parse(property.amenities || '[]'),
        images: JSON.parse(property.images || '[]')
      })) as Property[];
    } catch (error) {
      throw new Error(`Failed to get featured properties: ${(error as Error).message}`);
    }
  }

  // Get properties by owner
  async getPropertiesByOwner(ownerId: string, page: number = 1, limit: number = 20): Promise<PropertySearchResult> {
    try {
      return await this.searchProperties({ userId: ownerId, page, limit });
    } catch (error) {
      throw new Error(`Failed to get properties by owner: ${(error as Error).message}`);
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
      throw new Error(`Failed to get property statistics: ${(error as Error).message}`);
    }
  }

  private async incrementViewCount(propertyId: number): Promise<void> {
    await this.db.run(`
      UPDATE properties
      SET view_count = COALESCE(view_count, 0) + 1
      WHERE id = ?
    `, [propertyId]);
  }
}
