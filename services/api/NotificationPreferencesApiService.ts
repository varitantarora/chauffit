import BaseApiService, { ApiResponse } from './BaseApiService';

export interface NotificationPreferences {
  id: string;
  booking_confirmations: boolean;
  driver_updates: boolean;
  ride_reminders: boolean;
  trip_completion: boolean;
  driver_messages: boolean;
  driver_arrival: boolean;
  promotions_offers: boolean;
  new_features: boolean;
  security_alerts: boolean;
  payment_updates: boolean;
  created_at: string;
  updated_at: string;
}

class NotificationPreferencesApiService {
  private basePath = '/customers/notification-preferences';

  async getPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    try {
      return await BaseApiService.get<NotificationPreferences>(`${this.basePath}/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notification preferences',
      };
    }
  }

  async updatePreferences(data: Partial<NotificationPreferences>): Promise<ApiResponse<NotificationPreferences>> {
    try {
      return await BaseApiService.patch<NotificationPreferences>(`${this.basePath}/`, data);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update notification preferences',
      };
    }
  }

  async enableAll(): Promise<ApiResponse<NotificationPreferences>> {
    try {
      return await BaseApiService.post<NotificationPreferences>(`${this.basePath}/enable-all/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enable all notifications',
      };
    }
  }

  async disableAll(): Promise<ApiResponse<NotificationPreferences>> {
    try {
      return await BaseApiService.post<NotificationPreferences>(`${this.basePath}/disable-all/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to disable all notifications',
      };
    }
  }
}

export default new NotificationPreferencesApiService();
