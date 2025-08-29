import type {
  IChannelManager,
  ExternalChannel,
  ChannelSyncRequest,
  ChannelSyncResponse,
  ChannelSyncLog,
  ChannelConflict,
  ChannelMetrics,
  ExternalProperty,
  ExternalBooking,
  RateAndAvailability,
  ChannelConfiguration
} from './channel-manager-types';

export class ChannelManager implements IChannelManager {
  private db: any;
  private config: ChannelConfiguration;

  constructor(database: any, configuration?: Partial<ChannelConfiguration>) {
    this.db = database;
    this.config = {
      rate_sync_enabled: true,
      availability_sync_enabled: true,
      booking_sync_enabled: true,
      property_sync_enabled: true,
      review_sync_enabled: true,
      auto_accept_bookings: false,
      sync_frequency: 60,
      conflict_resolution: 'manual_review',
      notification_settings: {
        sync_errors: true,
        booking_notifications: true,
        conflict_alerts: true,
        daily_summary: true
      },
      rate_adjustment: {
        enabled: false,
        markup_percentage: 0,
        currency_conversion: true,
        seasonal_adjustments: []
      },
      ...configuration
    };
  }

  // Channel Management Methods
  async addChannel(channelData: Omit<ExternalChannel, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const channelId = `channel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const result = await this.db.prepare(`
        INSERT INTO external_channels (
          id, name, type, is_active, api_endpoint, credentials, 
          sync_settings, mapping_rules, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).bind(
        channelId,
        channelData.name,
        channelData.type,
        channelData.is_active,
        channelData.api_endpoint || null,
        JSON.stringify(channelData.credentials),
        JSON.stringify(channelData.sync_settings),
        JSON.stringify(channelData.mapping_rules)
      ).run();

      if (result.success) {
        // Test connection
        await this.testChannelConnection(channelId);
        return channelId;
      }
      
      throw new Error('Failed to create channel');
    } catch (error) {
      console.error('Error adding channel:', error);
      throw error;
    }
  }

  async updateChannel(channelId: string, updates: Partial<ExternalChannel>): Promise<boolean> {
    try {
      const setParts: string[] = [];
      const values: any[] = [];

      if (updates.name) {
        setParts.push('name = ?');
        values.push(updates.name);
      }
      if (updates.is_active !== undefined) {
        setParts.push('is_active = ?');
        values.push(updates.is_active);
      }
      if (updates.credentials) {
        setParts.push('credentials = ?');
        values.push(JSON.stringify(updates.credentials));
      }
      if (updates.sync_settings) {
        setParts.push('sync_settings = ?');
        values.push(JSON.stringify(updates.sync_settings));
      }
      if (updates.mapping_rules) {
        setParts.push('mapping_rules = ?');
        values.push(JSON.stringify(updates.mapping_rules));
      }

      setParts.push('updated_at = datetime(\'now\')');
      values.push(channelId);

      const result = await this.db.prepare(`
        UPDATE external_channels 
        SET ${setParts.join(', ')}
        WHERE id = ?
      `).bind(...values).run();

      return result.success;
    } catch (error) {
      console.error('Error updating channel:', error);
      return false;
    }
  }

  async removeChannel(channelId: string): Promise<boolean> {
    try {
      // Remove all related data
      await Promise.all([
        this.db.prepare('DELETE FROM external_properties WHERE channel_id = ?').bind(channelId).run(),
        this.db.prepare('DELETE FROM external_bookings WHERE channel_id = ?').bind(channelId).run(),
        this.db.prepare('DELETE FROM channel_sync_logs WHERE channel_id = ?').bind(channelId).run(),
        this.db.prepare('DELETE FROM channel_conflicts WHERE channel_id = ?').bind(channelId).run()
      ]);

      const result = await this.db.prepare('DELETE FROM external_channels WHERE id = ?').bind(channelId).run();
      return result.success;
    } catch (error) {
      console.error('Error removing channel:', error);
      return false;
    }
  }

  async getChannel(channelId: string): Promise<ExternalChannel | null> {
    try {
      const channel = await this.db.prepare('SELECT * FROM external_channels WHERE id = ?').bind(channelId).first();
      
      if (!channel) return null;

      return {
        ...channel,
        credentials: JSON.parse(channel.credentials),
        sync_settings: JSON.parse(channel.sync_settings),
        mapping_rules: JSON.parse(channel.mapping_rules)
      };
    } catch (error) {
      console.error('Error getting channel:', error);
      return null;
    }
  }

  async getAllChannels(): Promise<ExternalChannel[]> {
    try {
      const { results } = await this.db.prepare('SELECT * FROM external_channels ORDER BY created_at DESC').all();
      
      return results.map((channel: any) => ({
        ...channel,
        credentials: JSON.parse(channel.credentials),
        sync_settings: JSON.parse(channel.sync_settings),
        mapping_rules: JSON.parse(channel.mapping_rules)
      }));
    } catch (error) {
      console.error('Error getting all channels:', error);
      return [];
    }
  }

  // Synchronization Methods
  async syncChannel(request: ChannelSyncRequest): Promise<ChannelSyncResponse> {
    const logId = await this.createSyncLog(request);
    
    try {
      await this.updateSyncLog(logId, { status: 'in_progress' });
      
      const channel = await this.getChannel(request.channel_id);
      if (!channel || !channel.is_active) {
        throw new Error('Channel not found or inactive');
      }

      let totalRecords = 0;
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];
      const warnings: string[] = [];

      // Sync based on type
      switch (request.sync_type) {
        case 'properties':
          const propertyResult = await this.syncProperties(channel, request);
          totalRecords += propertyResult.total;
          successCount += propertyResult.success;
          failedCount += propertyResult.failed;
          errors.push(...propertyResult.errors);
          break;

        case 'bookings':
          const bookingResult = await this.syncBookings(channel, request);
          totalRecords += bookingResult.total;
          successCount += bookingResult.success;
          failedCount += bookingResult.failed;
          errors.push(...bookingResult.errors);
          break;

        case 'rates':
        case 'availability':
          const rateResult = await this.syncRatesAndAvailability(channel, request);
          totalRecords += rateResult.total;
          successCount += rateResult.success;
          failedCount += rateResult.failed;
          errors.push(...rateResult.errors);
          break;

        case 'all':
          // Sync everything
          const results = await Promise.allSettled([
            this.syncProperties(channel, request),
            this.syncBookings(channel, request),
            this.syncRatesAndAvailability(channel, request)
          ]);
          
          results.forEach(result => {
            if (result.status === 'fulfilled') {
              totalRecords += result.value.total;
              successCount += result.value.success;
              failedCount += result.value.failed;
              errors.push(...result.value.errors);
            } else {
              errors.push(result.reason?.message || 'Unknown error');
              failedCount++;
            }
          });
          break;
      }

      // Update sync log with results
      await this.updateSyncLog(logId, {
        status: failedCount === 0 ? 'success' : (successCount > 0 ? 'partial' : 'failed'),
        records_processed: totalRecords,
        records_success: successCount,
        records_failed: failedCount,
        sync_details: {
          completed_at: new Date().toISOString(),
          warnings,
          changes_summary: {
            created: 0, // Will be populated by specific sync methods
            updated: successCount,
            deleted: 0,
            errors: failedCount
          }
        }
      });

      // Update channel last sync time
      await this.updateChannel(request.channel_id, {
        sync_settings: {
          ...channel.sync_settings,
          last_sync_at: new Date().toISOString()
        }
      } as any);

      return {
        success: failedCount === 0,
        sync_log_id: logId,
        message: `Sync completed: ${successCount}/${totalRecords} records processed successfully`,
        summary: {
          total_records: totalRecords,
          processed: totalRecords,
          success: successCount,
          failed: failedCount,
          warnings: warnings.length
        },
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      await this.updateSyncLog(logId, {
        status: 'failed',
        sync_details: {
          completed_at: new Date().toISOString(),
          error_message: (error as Error).message,
          warnings: [],
          changes_summary: { created: 0, updated: 0, deleted: 0, errors: 1 }
        }
      });

      return {
        success: false,
        sync_log_id: logId,
        message: `Sync failed: ${(error as Error).message}`,
        summary: {
          total_records: 0,
          processed: 0,
          success: 0,
          failed: 1,
          warnings: 0
        },
        errors: [(error as Error).message]
      };
    }
  }

  async syncAllChannels(): Promise<ChannelSyncResponse[]> {
    const channels = await this.getAllChannels();
    const activeChannels = channels.filter(c => c.is_active);
    
    const results = await Promise.allSettled(
      activeChannels.map(channel => 
        this.syncChannel({
          channel_id: channel.id,
          sync_type: 'all',
          operation: 'bidirectional'
        })
      )
    );

    return results.map(result => 
      result.status === 'fulfilled' 
        ? result.value 
        : {
            success: false,
            sync_log_id: -1,
            message: `Sync failed: ${result.reason?.message || 'Unknown error'}`,
            summary: { total_records: 0, processed: 0, success: 0, failed: 1, warnings: 0 }
          }
    );
  }

  async getSyncLogs(channelId?: string, limit: number = 50): Promise<ChannelSyncLog[]> {
    try {
      let query = 'SELECT * FROM channel_sync_logs';
      const params: any[] = [];

      if (channelId) {
        query += ' WHERE channel_id = ?';
        params.push(channelId);
      }

      query += ' ORDER BY created_at DESC LIMIT ?';
      params.push(limit);

      const { results } = await this.db.prepare(query).bind(...params).all();
      
      return results.map((log: any) => ({
        ...log,
        sync_details: JSON.parse(log.sync_details)
      }));
    } catch (error) {
      console.error('Error getting sync logs:', error);
      return [];
    }
  }

  // Property Management Methods
  async mapProperty(localPropertyId: number, channelId: string, externalPropertyId: string): Promise<boolean> {
    try {
      const channel = await this.getChannel(channelId);
      if (!channel) return false;

      const updatedMappingRules = {
        ...channel.mapping_rules,
        property_mapping: {
          ...channel.mapping_rules.property_mapping,
          [localPropertyId.toString()]: externalPropertyId
        }
      };

      return await this.updateChannel(channelId, {
        mapping_rules: updatedMappingRules
      } as any);
    } catch (error) {
      console.error('Error mapping property:', error);
      return false;
    }
  }

  async unmapProperty(localPropertyId: number, channelId: string): Promise<boolean> {
    try {
      const channel = await this.getChannel(channelId);
      if (!channel) return false;

      const updatedMappingRules = { ...channel.mapping_rules };
      delete updatedMappingRules.property_mapping[localPropertyId.toString()];

      return await this.updateChannel(channelId, {
        mapping_rules: updatedMappingRules
      } as any);
    } catch (error) {
      console.error('Error unmapping property:', error);
      return false;
    }
  }

  async getPropertyMapping(channelId: string): Promise<Record<string, string>> {
    try {
      const channel = await this.getChannel(channelId);
      return channel?.mapping_rules.property_mapping || {};
    } catch (error) {
      console.error('Error getting property mapping:', error);
      return {};
    }
  }

  // Rate and Availability Methods
  async updateRateAndAvailability(
    propertyId: number,
    dateRange: { startDate: string; endDate: string },
    data: Partial<RateAndAvailability>
  ): Promise<boolean> {
    try {
      // This would typically push rate/availability updates to all connected channels
      const channels = await this.getAllChannels();
      const activeChannels = channels.filter(c => c.is_active && c.sync_settings.sync_rates);

      const updatePromises = activeChannels.map(async (channel) => {
        const mapping = await this.getPropertyMapping(channel.id);
        const externalPropertyId = mapping[propertyId.toString()];
        
        if (!externalPropertyId) return false;

        // Push rate/availability to external channel
        return await this.pushRateToChannel(channel, externalPropertyId, dateRange, data);
      });

      const results = await Promise.allSettled(updatePromises);
      return results.some(result => result.status === 'fulfilled' && result.value === true);
    } catch (error) {
      console.error('Error updating rate and availability:', error);
      return false;
    }
  }

  // Conflict Resolution Methods
  async getConflicts(channelId?: string): Promise<ChannelConflict[]> {
    try {
      let query = 'SELECT * FROM channel_conflicts WHERE resolution_status = \'pending\'';
      const params: any[] = [];

      if (channelId) {
        query += ' AND channel_id = ?';
        params.push(channelId);
      }

      query += ' ORDER BY created_at DESC';

      const { results } = await this.db.prepare(query).bind(...params).all();
      
      return results.map((conflict: any) => ({
        ...conflict,
        conflict_details: JSON.parse(conflict.conflict_details)
      }));
    } catch (error) {
      console.error('Error getting conflicts:', error);
      return [];
    }
  }

  async resolveConflict(conflictId: number, resolution: 'local' | 'external', notes?: string): Promise<boolean> {
    try {
      const resolutionStatus = resolution === 'local' ? 'resolved_local' : 'resolved_external';
      
      const result = await this.db.prepare(`
        UPDATE channel_conflicts 
        SET resolution_status = ?, resolution_notes = ?, resolved_at = datetime('now')
        WHERE id = ?
      `).bind(resolutionStatus, notes || null, conflictId).run();

      return result.success;
    } catch (error) {
      console.error('Error resolving conflict:', error);
      return false;
    }
  }

  // Metrics and Reporting Methods
  async getChannelMetrics(channelId: string, period: { startDate: string; endDate: string }): Promise<ChannelMetrics> {
    try {
      const channel = await this.getChannel(channelId);
      if (!channel) {
        throw new Error('Channel not found');
      }

      // Get metrics from database
      const metricsQuery = `
        SELECT 
          COUNT(DISTINCT ep.external_id) as total_properties,
          COUNT(DISTINCT CASE WHEN ep.sync_status = 'synced' THEN ep.external_id END) as active_properties,
          COUNT(eb.external_id) as total_bookings,
          COALESCE(SUM(eb.booking_data), 0) as revenue
        FROM external_properties ep
        LEFT JOIN external_bookings eb ON ep.external_id = eb.external_property_id 
          AND eb.channel_id = ep.channel_id
          AND date(eb.created_at) BETWEEN ? AND ?
        WHERE ep.channel_id = ?
      `;

      const metrics = await this.db.prepare(metricsQuery)
        .bind(period.startDate, period.endDate, channelId)
        .first();

      // Get sync success rate
      const syncLogs = await this.getSyncLogs(channelId, 10);
      const successfulSyncs = syncLogs.filter(log => log.status === 'success').length;
      const syncSuccessRate = syncLogs.length > 0 ? (successfulSyncs / syncLogs.length) * 100 : 0;

      return {
        channel_id: channelId,
        channel_name: channel.name,
        metrics: {
          total_properties: metrics?.total_properties || 0,
          active_properties: metrics?.active_properties || 0,
          total_bookings: metrics?.total_bookings || 0,
          revenue: metrics?.revenue || 0,
          average_rate: 0, // Calculate from rate data
          occupancy_rate: 0, // Calculate from booking data
          sync_success_rate: Math.round(syncSuccessRate),
          last_successful_sync: channel.sync_settings.last_sync_at || '',
          sync_errors_24h: 0 // Count errors in last 24h
        },
        period
      };
    } catch (error) {
      console.error('Error getting channel metrics:', error);
      throw error;
    }
  }

  async getPerformanceReport(): Promise<{
    total_channels: number;
    active_channels: number;
    total_synced_properties: number;
    sync_health_score: number;
    recent_errors: number;
  }> {
    try {
      const channels = await this.getAllChannels();
      const activeChannels = channels.filter(c => c.is_active);
      
      const totalProperties = await this.db.prepare(`
        SELECT COUNT(*) as count FROM external_properties WHERE sync_status = 'synced'
      `).first();

      const recentErrors = await this.db.prepare(`
        SELECT COUNT(*) as count FROM channel_sync_logs 
        WHERE status = 'failed' AND created_at >= datetime('now', '-24 hours')
      `).first();

      const totalSyncs = await this.db.prepare(`
        SELECT COUNT(*) as count FROM channel_sync_logs 
        WHERE created_at >= datetime('now', '-7 days')
      `).first();

      const successfulSyncs = await this.db.prepare(`
        SELECT COUNT(*) as count FROM channel_sync_logs 
        WHERE status = 'success' AND created_at >= datetime('now', '-7 days')
      `).first();

      const syncHealthScore = totalSyncs?.count > 0 
        ? Math.round((successfulSyncs?.count / totalSyncs?.count) * 100)
        : 100;

      return {
        total_channels: channels.length,
        active_channels: activeChannels.length,
        total_synced_properties: totalProperties?.count || 0,
        sync_health_score: syncHealthScore,
        recent_errors: recentErrors?.count || 0
      };
    } catch (error) {
      console.error('Error getting performance report:', error);
      return {
        total_channels: 0,
        active_channels: 0,
        total_synced_properties: 0,
        sync_health_score: 0,
        recent_errors: 0
      };
    }
  }

  // Helper Methods
  private async createSyncLog(request: ChannelSyncRequest): Promise<number> {
    const result = await this.db.prepare(`
      INSERT INTO channel_sync_logs (
        channel_id, sync_type, operation, status, 
        records_processed, records_success, records_failed,
        sync_details, created_at
      ) VALUES (?, ?, ?, 'pending', 0, 0, 0, ?, datetime('now'))
    `).bind(
      request.channel_id,
      request.sync_type,
      request.operation,
      JSON.stringify({
        started_at: new Date().toISOString(),
        warnings: [],
        changes_summary: { created: 0, updated: 0, deleted: 0, errors: 0 }
      })
    ).run();

    return result.meta.last_row_id;
  }

  private async updateSyncLog(logId: number, updates: Partial<ChannelSyncLog>): Promise<void> {
    const setParts: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        setParts.push(`${key} = ?`);
        values.push(typeof value === 'object' ? JSON.stringify(value) : value);
      }
    });

    if (setParts.length > 0) {
      values.push(logId);
      await this.db.prepare(`
        UPDATE channel_sync_logs SET ${setParts.join(', ')} WHERE id = ?
      `).bind(...values).run();
    }
  }

  private async testChannelConnection(channelId: string): Promise<boolean> {
    // Test connection to external channel API
    // This would be implemented per channel type
    return true;
  }

  private async syncProperties(channel: ExternalChannel, request: ChannelSyncRequest) {
    // Implement property synchronization logic
    return { total: 0, success: 0, failed: 0, errors: [] };
  }

  private async syncBookings(channel: ExternalChannel, request: ChannelSyncRequest) {
    // Implement booking synchronization logic
    return { total: 0, success: 0, failed: 0, errors: [] };
  }

  private async syncRatesAndAvailability(channel: ExternalChannel, request: ChannelSyncRequest) {
    // Implement rate/availability synchronization logic
    return { total: 0, success: 0, failed: 0, errors: [] };
  }

  private async pushRateToChannel(
    channel: ExternalChannel,
    externalPropertyId: string,
    dateRange: { startDate: string; endDate: string },
    data: Partial<RateAndAvailability>
  ): Promise<boolean> {
    // Implement rate pushing to external channel
    return true;
  }
}

export default ChannelManager;