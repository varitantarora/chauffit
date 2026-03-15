import BaseApiService, { ApiResponse } from './BaseApiService';

export interface AdvertisementCategory {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  display_order: number;
}

export interface Advertisement {
  id: string;
  category: AdvertisementCategory;
  page: string;
  heading: string;
  description: string | null;
  image: string;
  link: string | null;
  is_active: boolean;
  display_order: number;
  start_date: string | null;
  end_date: string | null;
}

class AdvertisementApiService {
  private basePath = '/advertisements';

  // pageFilter: filters client-side by the 'page' model field (e.g. 'home')
  // The API's ?page= param is for pagination (integer), not the page type enum
  async getAdvertisements(pageFilter?: string): Promise<ApiResponse<Advertisement[]>> {
    try {
      const response = await BaseApiService.get<Advertisement[]>(`${this.basePath}/`);

      if (response.success && response.data) {
        let ads: Advertisement[] = Array.isArray(response.data)
          ? response.data
          : (response.data as any).results || [];

        if (pageFilter) {
          ads = ads.filter((ad) => ad.page === pageFilter);
        }

        return { success: true, data: ads };
      }

      return response as ApiResponse<Advertisement[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch advertisements',
      };
    }
  }

  async getAdvertisementCategories(): Promise<ApiResponse<AdvertisementCategory[]>> {
    try {
      const response = await BaseApiService.get<AdvertisementCategory[]>(`${this.basePath}/categories/`);
      if (response.success && response.data) {
        const categories: AdvertisementCategory[] = Array.isArray(response.data)
          ? response.data
          : (response.data as any).results || [];
        return { success: true, data: categories };
      }
      return response as ApiResponse<AdvertisementCategory[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch advertisement categories',
      };
    }
  }

  async createAdvertisement(data: Partial<Advertisement>): Promise<ApiResponse<Advertisement>> {
    try {
      return await BaseApiService.post<Advertisement>(`${this.basePath}/`, data);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create advertisement',
      };
    }
  }

  async updateAdvertisement(id: string, data: Partial<Advertisement>): Promise<ApiResponse<Advertisement>> {
    try {
      return await BaseApiService.patch<Advertisement>(`${this.basePath}/${id}/`, data);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update advertisement',
      };
    }
  }

  async deleteAdvertisement(id: string): Promise<ApiResponse<void>> {
    try {
      return await BaseApiService.delete<void>(`${this.basePath}/${id}/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete advertisement',
      };
    }
  }
}

export default new AdvertisementApiService();
