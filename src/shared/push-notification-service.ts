// Push Notification Service for HabibiStay
// Handles Firebase Cloud Messaging (FCM) push notifications

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  topic?: string;
  token?: string;
  condition?: string;
}

export interface PushNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class PushNotificationService {
  private fcmServerKey: string;
  private projectId: string;

  constructor(fcmServerKey: string, projectId: string) {
    this.fcmServerKey = fcmServerKey;
    this.projectId = projectId;
  }

  // Send push notification to a specific device
  async sendToDevice(token: string, payload: PushNotificationPayload): Promise<PushNotificationResult> {
    try {
      const notificationPayload = {
        message: {
          token: token,
          notification: {
            title: payload.title,
            body: payload.body
          },
          data: payload.data || {}
        }
      };

      const response = await fetch(`https://fcm.googleapis.com/v1/projects/${this.projectId}/messages:send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.fcmServerKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationPayload)
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          messageId: result.name
        };
      } else {
        return {
          success: false,
          error: result.error?.message || 'Failed to send push notification'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send push notification to multiple devices
  async sendToDevices(tokens: string[], payload: PushNotificationPayload): Promise<PushNotificationResult[]> {
    const results: PushNotificationResult[] = [];
    
    for (const token of tokens) {
      const result = await this.sendToDevice(token, payload);
      results.push(result);
    }
    
    return results;
  }

  // Send push notification to a topic
  async sendToTopic(topic: string, payload: PushNotificationPayload): Promise<PushNotificationResult> {
    try {
      const notificationPayload = {
        message: {
          topic: topic,
          notification: {
            title: payload.title,
            body: payload.body
          },
          data: payload.data || {}
        }
      };

      const response = await fetch(`https://fcm.googleapis.com/v1/projects/${this.projectId}/messages:send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.fcmServerKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationPayload)
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          messageId: result.name
        };
      } else {
        return {
          success: false,
          error: result.error?.message || 'Failed to send push notification to topic'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send push notification with condition
  async sendToCondition(condition: string, payload: PushNotificationPayload): Promise<PushNotificationResult> {
    try {
      const notificationPayload = {
        message: {
          condition: condition,
          notification: {
            title: payload.title,
            body: payload.body
          },
          data: payload.data || {}
        }
      };

      const response = await fetch(`https://fcm.googleapis.com/v1/projects/${this.projectId}/messages:send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.fcmServerKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationPayload)
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          messageId: result.name
        };
      } else {
        return {
          success: false,
          error: result.error?.message || 'Failed to send push notification with condition'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Register device token for a user
  async registerDeviceToken(userId: string, token: string, db: any): Promise<boolean> {
    try {
      await db.prepare(`
        INSERT OR REPLACE INTO user_device_tokens (user_id, device_token, created_at)
        VALUES (?, ?, ?)
      `).bind(userId, token, new Date().toISOString()).run();
      
      return true;
    } catch (error) {
      console.error('Failed to register device token:', error);
      return false;
    }
  }

  // Unregister device token
  async unregisterDeviceToken(token: string, db: any): Promise<boolean> {
    try {
      await db.prepare(`
        DELETE FROM user_device_tokens WHERE device_token = ?
      `).bind(token).run();
      
      return true;
    } catch (error) {
      console.error('Failed to unregister device token:', error);
      return false;
    }
  }

  // Get device tokens for a user
  async getUserDeviceTokens(userId: string, db: any): Promise<string[]> {
    try {
      const tokens = await db.prepare(`
        SELECT device_token FROM user_device_tokens WHERE user_id = ?
      `).bind(userId).all();
      
      return tokens.results?.map((row: any) => row.device_token) || [];
    } catch (error) {
      console.error('Failed to get user device tokens:', error);
      return [];
    }
  }
}

// Create default push notification service instance
export function createPushNotificationService(fcmServerKey: string, projectId: string): PushNotificationService {
  return new PushNotificationService(fcmServerKey, projectId);
}