import BaseApiService, { ApiResponse } from './BaseApiService';

export type CustomerVehicleType = 'luxury_sedan' | 'executive_suv' | 'limousine' | 'mercedes_sprinter';

export interface CustomerCarApi {
  id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  vehicle_type: CustomerVehicleType;
  display_name?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerCarRequest {
  make: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  vehicle_type: CustomerVehicleType;
  is_active?: boolean;
}

class CustomerCarApiService {
  private basePath = '/customers';

  async listCars(): Promise<ApiResponse<CustomerCarApi[]>> {
    try {
      const response = await BaseApiService.get<any>(`${this.basePath}/cars/`);
      if (response.success && response.data) {
        const data = response.data as any;
        const cars = Array.isArray(data)
          ? data
          : (data.results || data.cars || []);
        return { success: true, data: cars };
      }
      return response as ApiResponse<CustomerCarApi[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch cars',
      };
    }
  }

  async addCar(data: CustomerCarRequest): Promise<ApiResponse<CustomerCarApi>> {
    try {
      return await BaseApiService.post<CustomerCarApi>(`${this.basePath}/cars/add/`, data);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add car',
      };
    }
  }

  async updateCar(id: string, data: CustomerCarRequest): Promise<ApiResponse<CustomerCarApi>> {
    try {
      return await BaseApiService.put<CustomerCarApi>(`${this.basePath}/cars/${id}/update/`, data);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update car',
      };
    }
  }

  async patchCar(id: string, data: Partial<CustomerCarRequest>): Promise<ApiResponse<CustomerCarApi>> {
    try {
      return await BaseApiService.patch<CustomerCarApi>(`${this.basePath}/cars/${id}/update/`, data);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update car',
      };
    }
  }

  async deleteCar(id: string): Promise<ApiResponse<void>> {
    try {
      return await BaseApiService.delete<void>(`${this.basePath}/cars/${id}/delete/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete car',
      };
    }
  }
}

export default new CustomerCarApiService();
