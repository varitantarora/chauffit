import BaseApiService, { ApiResponse } from './BaseApiService';

// ============================================================================
// LOCATION API TYPES
// ============================================================================

export type LocationType = 'home' | 'work' | 'favorite' | 'recent';

export interface FavoriteLocation {
  id: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  location_type: LocationType;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddFavoriteRequest {
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  location_type: LocationType;
  is_default?: boolean;
}

// ============================================================================
// LOCATION API SERVICE
// ============================================================================

class LocationApiService {
  private basePath = '/customers/locations';

  /**
   * Add a new saved location
   * POST /api/v1/customers/locations/
   */
  async addFavorite(data: AddFavoriteRequest): Promise<ApiResponse<FavoriteLocation>> {
    try {
      const payload = {
        ...data,
        latitude: parseFloat(data.latitude.toFixed(8)),
        longitude: parseFloat(data.longitude.toFixed(8)),
      };
      return await BaseApiService.post<FavoriteLocation>(`${this.basePath}/`, payload);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add location',
      };
    }
  }

  /**
   * Get Favorite Locations
   * GET /api/v1/customers/locations/favorites/
   */
  async getFavorites(): Promise<ApiResponse<FavoriteLocation[]>> {
    try {
      const response = await BaseApiService.get<FavoriteLocation[] | { results: FavoriteLocation[] }>(
        `${this.basePath}/favorites/`
      );
      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : (response.data as any).results || [];
        return { ...response, data };
      }
      return response as ApiResponse<FavoriteLocation[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch favorite locations',
      };
    }
  }
}

export default new LocationApiService();
