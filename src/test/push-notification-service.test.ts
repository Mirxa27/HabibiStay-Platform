// Test file for push notification service
import { PushNotificationService } from '../shared/push-notification-service';

// Mock fetch
global.fetch = jest.fn();

describe('PushNotificationService', () => {
  let pushService: PushNotificationService;
  const mockFcmServerKey = 'test-fcm-server-key';
  const mockProjectId = 'test-project-id';

  beforeEach(() => {
    pushService = new PushNotificationService(mockFcmServerKey, mockProjectId);
    (fetch as jest.Mock).mockClear();
  });

  describe('sendToDevice', () => {
    it('should send push notification successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ name: 'test-message-id' })
      };
      
      (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await pushService.sendToDevice('test-device-token', {
        title: 'Test Notification',
        body: 'This is a test notification'
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('test-message-id');
      expect(fetch).toHaveBeenCalledWith(
        `https://fcm.googleapis.com/v1/projects/${mockProjectId}/messages:send`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockFcmServerKey}`,
            'Content-Type': 'application/json'
          }
        })
      );
    });

    it('should handle push notification failure', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: { message: 'Invalid device token' } })
      };
      
      (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await pushService.sendToDevice('invalid-token', {
        title: 'Test Notification',
        body: 'This is a test notification'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid device token');
    });
  });

  describe('registerDeviceToken', () => {
    it('should register device token successfully', async () => {
      const mockDb = {
        prepare: jest.fn().mockReturnThis(),
        bind: jest.fn().mockReturnThis(),
        run: jest.fn().mockResolvedValue({ success: true })
      };

      const result = await pushService.registerDeviceToken('user-123', 'test-device-token', mockDb);

      expect(result).toBe(true);
      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT OR REPLACE INTO user_device_tokens'));
    });
  });
});