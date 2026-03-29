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
        const raw = Array.isArray(response.data) ? response.data : (response.data as any).results || [];
        const data = raw.map((loc: any) => ({
          ...loc,
          latitude: typeof loc.latitude === 'string' ? parseFloat(loc.latitude) : loc.latitude,
          longitude: typeof loc.longitude === 'string' ? parseFloat(loc.longitude) : loc.longitude,
        }));
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

  /**
   * Get ALL saved locations (home, work, favorite, recent)
   * GET /api/v1/customers/locations/
   */
  async getAllLocations(): Promise<ApiResponse<FavoriteLocation[]>> {
    try {
      const response = await BaseApiService.get<any>(`${this.basePath}/`);
      if (response.success && response.data) {
        // Handle multiple response formats:
        // 1. Direct array: [...]
        // 2. Paginated: { results: [...] }
        // 3. Keyed: { locations: [...] }
        // 4. Nested data: { data: [...] }
        const d = response.data;
        const raw = Array.isArray(d)
          ? d
          : Array.isArray(d.results)
            ? d.results
            : Array.isArray(d.locations)
              ? d.locations
              : Array.isArray(d.data)
                ? d.data
                : [];
        const data = raw.map((loc: any) => ({
          ...loc,
          latitude: typeof loc.latitude === 'string' ? parseFloat(loc.latitude) : loc.latitude,
          longitude: typeof loc.longitude === 'string' ? parseFloat(loc.longitude) : loc.longitude,
        }));
        return { ...response, data };
      }
      return response as ApiResponse<FavoriteLocation[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch saved locations',
      };
    }
  }

  /**
   * Update a saved location
   * PUT /api/v1/customers/<id>/locations/
   */
  async updateFavorite(id: string, data: Partial<AddFavoriteRequest>): Promise<ApiResponse<FavoriteLocation>> {
    try {
      const payload: any = { ...data };
      if (data.latitude !== undefined) payload.latitude = parseFloat(data.latitude.toFixed(8));
      if (data.longitude !== undefined) payload.longitude = parseFloat(data.longitude.toFixed(8));
      return await BaseApiService.patch<FavoriteLocation>(`${this.basePath}/${id}/locations/`, payload);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update location',
      };
    }
  }

  /**
   * Delete a saved location
   * DELETE /api/v1/customers/<id>/locations/
   */
  async deleteFavorite(id: string): Promise<ApiResponse<void>> {
    try {
      return await BaseApiService.delete<void>(`${this.basePath}/${id}/locations/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete location',
      };
    }
  }
}

export default new LocationApiService();
