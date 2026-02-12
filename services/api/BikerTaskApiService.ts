import BaseApiService, { ApiResponse } from './BaseApiService';

// Types based on API YAML schema
export interface BikerTaskUserDetails {
  id: string;
  name: string;
  mobile: string;
  profile_picture: string | null;
  overall_rating: number | null;
}

export interface BikerTaskDetail {
  id: string;
  task_reference: string;
  booking: string;
  biker: string;
  driver: string;
  driver_details: BikerTaskUserDetails | null;
  biker_details: BikerTaskUserDetails | null;
  customer_details: BikerTaskUserDetails | null;
  // Backward-compatible flattened fields used by some UI screens
  driver_name?: string;
  driver_phone?: string;
  driver_profile_picture?: string | null;
  vehicle: string | null;
  pickup_location_lat: string;
  pickup_location_long: string;
  pickup_address: string;
  dropoff_location_lat: string;
  dropoff_location_long: string;
  dropoff_address: string;
  task_type: 'driver_transport';
  priority: 'low' | 'standard' | 'high' | 'urgent';
  estimated_distance_km: string | null;
  estimated_duration_minutes: number | null;
  actual_distance_km: string | null;
  actual_duration_minutes: number | null;
  task_fare: string;
  biker_earnings: string;
  platform_fee: string;
  task_status: 'requested' | 'assigned' | 'accepted' | 'en_route_to_driver' | 'arrived_at_driver' | 'driver_picked_up' | 'en_route_to_customer' | 'arrived_at_customer' | 'completed' | 'cancelled_by_biker' | 'cancelled_by_driver' | 'cancelled_by_system';
  task_status_display: string;
  assigned_at: string | null;
  accepted_at: string | null;
  en_route_to_driver_at: string | null;
  arrived_at_driver_at: string | null;
  driver_picked_up_at: string | null;
  en_route_to_customer_at: string | null;
  arrived_at_customer_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  cancelled_by: 'biker' | 'driver' | 'system' | null;
  special_instructions: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BikerTaskCreateRequest {
  booking: string;
  biker: string;
  driver: string;
  vehicle?: string | null;
  pickup_location_lat: string;
  pickup_location_long: string;
  pickup_address: string;
  dropoff_location_lat: string;
  dropoff_location_long: string;
  dropoff_address: string;
  task_type: 'driver_transport';
  priority?: 'low' | 'standard' | 'high' | 'urgent';
  estimated_distance_km?: string | null;
  estimated_duration_minutes?: number | null;
  task_fare: string;
  biker_earnings: string;
  platform_fee: string;
  special_instructions?: string | null;
  notes?: string | null;
}

export interface BikerTaskCreate {
  booking: string;
  biker: string;
  driver: string;
  vehicle: string | null;
  pickup_location_lat: string;
  pickup_location_long: string;
  pickup_address: string;
  dropoff_location_lat: string;
  dropoff_location_long: string;
  dropoff_address: string;
  task_type: 'driver_transport';
  priority: 'low' | 'standard' | 'high' | 'urgent';
  estimated_distance_km: string | null;
  estimated_duration_minutes: number | null;
  task_fare: string;
  biker_earnings: string;
  platform_fee: string;
  special_instructions: string | null;
  notes: string | null;
}

export interface BikerTaskCancelRequest {
  cancellation_reason: string;
}

export interface BikerTaskCancel {
  cancellation_reason: string;
}

export interface BikerTaskRatingRequest {
  overall_rating: number; // 1-5
  driving_safety: number; // 1-5
  professionalism: number; // 1-5
  punctuality: number; // 1-5
  communication: number; // 1-5
  review?: string | null; // max 500 chars
}

export interface BikerTaskRating {
  task?: string;
  rating_id?: string;
  overall_rating: number;
  driving_safety?: number;
  professionalism?: number;
  punctuality?: number;
  communication?: number;
  review?: string | null;
}

export interface BikerTaskStatusRequest {
  task_status: 'requested' | 'assigned' | 'accepted' | 'en_route_to_driver' | 'arrived_at_driver' | 'driver_picked_up' | 'en_route_to_customer' | 'arrived_at_customer' | 'completed' | 'cancelled_by_biker' | 'cancelled_by_driver' | 'cancelled_by_system';
}

export interface BikerTaskStatus {
  task_status: 'requested' | 'assigned' | 'accepted' | 'en_route_to_driver' | 'arrived_at_driver' | 'driver_picked_up' | 'en_route_to_customer' | 'arrived_at_customer' | 'completed' | 'cancelled_by_biker' | 'cancelled_by_driver' | 'cancelled_by_system';
}

class BikerTaskApiService {
  private basePath = '/biker-tasks';

  private normalizeTask(task: BikerTaskDetail): BikerTaskDetail {
    return {
      ...task,
      driver_name: task.driver_name ?? task.driver_details?.name ?? '',
      driver_phone: task.driver_phone ?? task.driver_details?.mobile ?? '',
      driver_profile_picture: task.driver_profile_picture ?? task.driver_details?.profile_picture ?? null,
    };
  }

  private extractTaskList(data: any): BikerTaskDetail[] {
    const rawTasks = Array.isArray(data)
      ? data
      : (Array.isArray(data?.results) ? data.results : []);

    return rawTasks.map((task) => this.normalizeTask(task));
  }

  // List biker tasks
  async getTasks(params?: {
    filter?: 'all' | 'available' | 'ongoing' | 'completed';
    ordering?: string;
    page?: number;
    search?: string;
  }): Promise<ApiResponse<BikerTaskDetail[]>> {
    try {
      let url = `${this.basePath}/`;
      const queryParams: string[] = [];

      if (params?.filter) {
        queryParams.push(`filter=${encodeURIComponent(params.filter)}`);
      }
      if (params?.ordering) {
        queryParams.push(`ordering=${encodeURIComponent(params.ordering)}`);
      }
      if (params?.page) {
        queryParams.push(`page=${params.page}`);
      }
      if (params?.search) {
        queryParams.push(`search=${encodeURIComponent(params.search)}`);
      }

      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      const response = await BaseApiService.get<any>(url);
      if (response.success) {
        return {
          success: true,
          data: this.extractTaskList(response.data),
          message: response.message,
        };
      }
      return response as ApiResponse<BikerTaskDetail[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch biker tasks',
      };
    }
  }

  // Get biker task by ID
  async getTaskById(id: string): Promise<ApiResponse<BikerTaskDetail>> {
    try {
      const response = await BaseApiService.get<BikerTaskDetail>(`${this.basePath}/${id}/`);
      if (response.success && response.data) {
        return {
          success: true,
          data: this.normalizeTask(response.data),
          message: response.message,
        };
      }
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch biker task',
      };
    }
  }

  // Create biker task
  async createTask(data: BikerTaskCreateRequest): Promise<ApiResponse<BikerTaskCreate>> {
    try {
      return await BaseApiService.post<BikerTaskCreate>(`${this.basePath}/`, data);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create biker task',
      };
    }
  }

  // Accept task
  async acceptTask(id: string): Promise<ApiResponse<BikerTaskDetail>> {
    try {
      const response = await BaseApiService.post<BikerTaskDetail>(`${this.basePath}/${id}/accept/`, {});
      if (response.success && response.data) {
        return {
          success: true,
          data: this.normalizeTask(response.data),
          message: response.message,
        };
      }
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to accept task',
      };
    }
  }

  // Cancel task
  async cancelTask(id: string, data: BikerTaskCancelRequest): Promise<ApiResponse<BikerTaskDetail>> {
    try {
      const response = await BaseApiService.post<BikerTaskDetail>(`${this.basePath}/${id}/cancel/`, data);
      if (response.success && response.data) {
        return {
          success: true,
          data: this.normalizeTask(response.data),
          message: response.message,
        };
      }
      return response as ApiResponse<BikerTaskDetail>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel task',
      };
    }
  }

  // Rate task
  async rateTask(id: string, data: BikerTaskRatingRequest): Promise<ApiResponse<BikerTaskRating>> {
    try {
      return await BaseApiService.post<BikerTaskRating>(`${this.basePath}/${id}/rate/`, data);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to rate task',
      };
    }
  }

  // Update task status
  async updateTaskStatus(id: string, data: BikerTaskStatusRequest): Promise<ApiResponse<BikerTaskDetail>> {
    try {
      const response = await BaseApiService.post<BikerTaskDetail>(`${this.basePath}/${id}/status/`, data);
      if (response.success && response.data) {
        return {
          success: true,
          data: this.normalizeTask(response.data),
          message: response.message,
        };
      }
      return response as ApiResponse<BikerTaskDetail>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update task status',
      };
    }
  }

  // List pending biker tasks (assigned and awaiting acceptance)
  async getPendingTasks(): Promise<ApiResponse<BikerTaskDetail[]>> {
    try {
      const response = await BaseApiService.get<any>(`${this.basePath}/pending/`);
      if (response.success) {
        return {
          success: true,
          data: this.extractTaskList(response.data),
          message: response.message,
        };
      }
      return response as ApiResponse<BikerTaskDetail[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch pending biker tasks',
      };
    }
  }
}

export default new BikerTaskApiService();
