import BaseApiService, { ApiResponse } from './BaseApiService';

export interface AppConfig {
  key: string;
  name: string;
  value: string;
  value_type?: 'string' | 'integer' | 'boolean' | 'json';
  created_at: string;
  updated_at: string;
}

class ConfigApiService {
  private basePath = '/meta/configs';

  async getAll(): Promise<ApiResponse<AppConfig[]>> {
    try {
      return await BaseApiService.get<AppConfig[]>(`${this.basePath}/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch configs',
      };
    }
  }

  async getByKey(key: string): Promise<ApiResponse<AppConfig>> {
    try {
      return await BaseApiService.get<AppConfig>(`${this.basePath}/${key}/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch config',
      };
    }
  }

  async create(data: Pick<AppConfig, 'key' | 'name' | 'value'>): Promise<ApiResponse<AppConfig>> {
    try {
      return await BaseApiService.post<AppConfig>(`${this.basePath}/`, data);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create config',
      };
    }
  }

  async update(key: string, data: Partial<AppConfig>): Promise<ApiResponse<AppConfig>> {
    try {
      return await BaseApiService.patch<AppConfig>(`${this.basePath}/${key}/`, data);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update config',
      };
    }
  }

  async delete(key: string): Promise<ApiResponse<void>> {
    try {
      return await BaseApiService.delete<void>(`${this.basePath}/${key}/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete config',
      };
    }
  }
}

export default new ConfigApiService();
