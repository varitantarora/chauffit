import BaseApiService, { ApiResponse } from './BaseApiService';
import { API_ENDPOINTS } from '../../config/env';

export interface RegisterDeviceRequest {
  device_token: string;
  device_type: 'ios' | 'android' | 'web';
  app_version: string;
  os_version: string;
  device_model: string;
  is_active: boolean;
  last_used_at: string;
}

class NotificationApiService {
  async registerDevice(data: RegisterDeviceRequest): Promise<ApiResponse<any>> {
    try {
      return await BaseApiService.post<any>(API_ENDPOINTS.REGISTER_DEVICE, data, true);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register device',
      };
    }
  }

  async updateDevice(id: string, data: Partial<RegisterDeviceRequest>): Promise<ApiResponse<any>> {
    try {
      const endpoint = `${API_ENDPOINTS.REGISTER_DEVICE}${id}/`;
      return await BaseApiService.patch<any>(endpoint, data, true);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update device',
      };
    }
  }

  async listDevices(): Promise<ApiResponse<any[]>> {
    try {
      return await BaseApiService.get<any[]>(API_ENDPOINTS.REGISTER_DEVICE, undefined, true);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list devices',
      };
    }
  }
}

export default new NotificationApiService();
