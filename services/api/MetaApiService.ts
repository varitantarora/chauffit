import BaseApiService, { ApiResponse } from './BaseApiService';

export interface EnumOption {
  value: string;
  label?: string;
  display?: string;
}

class MetaApiService {
  private basePath = '/meta';

  async getEnums(): Promise<ApiResponse<Record<string, any>>> {
    try {
      return await BaseApiService.get<Record<string, any>>(`${this.basePath}/enums/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch enums',
      };
    }
  }
}

export default new MetaApiService();
