import BaseApiService, { ApiResponse } from './BaseApiService';

// Types based on new API YAML schema
export type TripType = 'one_way' | 'round_trip' | 'hourly_charter';
export type WhenType = 'now' | 'schedule';

// Fare Estimate Request
export interface FareEstimateRequest {
  from_lat: string;
  from_long: string;
  from_address: string;
  to_lat: string;
  to_long: string;
  to_address: string;
  vehicle_id: string;
  when?: WhenType;
  type: TripType;
  scheduled_at?: string; // ISO datetime if when='schedule'
}

// Fare Estimate Response
export interface FareEstimateResponse {
  estimated_fare: number;
  estimated_distance_km: number | null;
  estimated_duration_minutes: number | null;
  vehicle_segment: string;
  trip_type: string;
  surge_multiplier: number;
  is_night: boolean;
  breakdown?: {
    base_fare: number;
    distance_fare: number;
    time_fare: number;
    surge_amount: number;
    total_fare: number;
  };
}

// Booking Request
export interface BookingRequest {
  from_lat: string;
  from_long: string;
  from_address: string;
  to_lat: string;
  to_long: string;
  to_address: string;
  vehicle_id: string;
  when?: WhenType;
  type: TripType;
  scheduled_at?: string; // ISO datetime if when='schedule'
  payment_method?: string; // UUID
  special_requests?: string;
  notes?: string;
}

// Booking Detail Response
export interface BookingDetail {
  id: string;
  booking_reference: string;
  customer: string;
  driver?: string | null;
  biker?: string | null;
  car: string;
  pickup_address: string;
  pickup_lat: string;
  pickup_long: string;
  dropoff_address: string;
  dropoff_lat: string;
  dropoff_long: string;
  trip_type: TripType;
  scheduled_at?: string | null;
  estimated_distance_km?: string | null;
  estimated_duration_minutes?: number | null;
  estimated_fare: string;
  actual_distance_km?: string | null;
  actual_duration_minutes?: number | null;
  actual_fare?: string | null;
  payment_method?: string | null;
  payment_status: string;
  booking_status: string;
  created_at: string;
  updated_at: string;
}

class BookingApiService {
  private basePath = '/rides';

  // Get fare estimate from backend
  async getFareEstimate(data: FareEstimateRequest): Promise<ApiResponse<FareEstimateResponse>> {
    try {
      return await BaseApiService.post<FareEstimateResponse>(
        `${this.basePath}/estimate/`,
        data
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get fare estimate',
      };
    }
  }

  // Book new ride
  async bookRide(data: BookingRequest): Promise<ApiResponse<BookingDetail>> {
    try {
      return await BaseApiService.post<BookingDetail>(
        `${this.basePath}/book/`,
        data
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to book ride',
      };
    }
  }

  // Get active ride
  async getActiveRide(): Promise<ApiResponse<BookingDetail>> {
    try {
      return await BaseApiService.get<BookingDetail>(`${this.basePath}/active`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch active ride',
      };
    }
  }

  // Get ride details
  async getRideDetails(id: string): Promise<ApiResponse<BookingDetail>> {
    try {
      return await BaseApiService.get<BookingDetail>(`${this.basePath}/${id}`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch ride details',
      };
    }
  }

  // Cancel ride
  async cancelRide(id: string, reason?: string): Promise<ApiResponse<any>> {
    try {
      return await BaseApiService.post<any>(`${this.basePath}/${id}/cancel/`, {
        cancellation_reason: reason,
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel ride',
      };
    }
  }
}

export default new BookingApiService();
