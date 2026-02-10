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
    time_fare?: number;
    surge_amount?: number;
    total_fare?: number;
    subtotal?: number;
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

// Booking Detail Response (matches BookingDetail schema in API)
export interface BookingDetail {
  id: string;
  booking_reference: string;
  customer: string;
  driver?: string | null;
  biker?: string | null;
  car: string;
  pickup_location?: string;  // UUID
  dropoff_location?: string; // UUID
  pickup_address: string;
  pickup_lat: string;
  pickup_long: string;
  dropoff_address: string;
  dropoff_lat: string;
  dropoff_long: string;
  trip_type: TripType;
  service_type?: string; // e.g., 'chauffeur', 'self_drive'
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
  // Timestamp fields
  driver_assigned_at?: string | null;
  biker_assigned_at?: string | null;
  driver_arrived_at?: string | null;
  trip_started_at?: string | null;
  trip_completed_at?: string | null;
  // Embedded details from API (serialized JSON strings that need parsing)
  customer_details?: CustomerDetails | string | null;
  driver_details?: DriverDetails | string | null;
  biker_details?: BikerDetails | string | null;
}

// Driver-specific ride detail (matches DriverRideDetail schema)
export interface DriverRideDetail extends Omit<BookingDetail, 'customer_details' | 'driver_details' | 'biker_details'> {
  vehicle_info?: string; // Serialized JSON string
  pickup_distance_km?: string; // Distance from driver to pickup
  estimated_arrival_minutes?: string; // ETA for driver to reach pickup
  special_requests?: string | null;
  // Embedded details as required strings
  customer_details: CustomerDetails | string;
  driver_details: DriverDetails | string;
  biker_details: BikerDetails | string;
}

// Customer details embedded in booking response
export interface CustomerDetails {
  id: string;
  name: string;
  mobile: string;
  profile_picture?: string | null;
  overall_rating?: number | null;
  total_rides?: number | null;
}

// Driver details embedded in booking response
export interface DriverDetails {
  id: string;
  name: string;
  mobile: string;
  profile_picture?: string | null;
  overall_rating?: number | null;
  total_rides?: number | null;
}

// Biker details embedded in booking response
export interface BikerDetails {
  id: string;
  name: string;
  mobile: string;
  profile_picture?: string | null;
  overall_rating?: number | null;
  total_rides?: number | null;
}

// Vehicle info embedded in booking response (parsed from vehicle_info string)
export interface VehicleInfo {
  id: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  license_plate?: string;
  vehicle_type?: string;
  segment?: string;
}

// Utility function to safely parse JSON strings
function parseJSONField<T>(value: T | string | null | undefined): T | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      console.warn('[BookingApiService] Failed to parse JSON field:', e);
      return null;
    }
  }
  return value;
}

// Parse embedded details in a booking response
export function parseBookingDetails<T extends BookingDetail | DriverRideDetail>(booking: T): T {
  const parsed = { ...booking };

  // Parse customer_details if it's a string
  if ('customer_details' in parsed && parsed.customer_details) {
    parsed.customer_details = parseJSONField<CustomerDetails>(parsed.customer_details);
  }

  // Parse driver_details if it's a string
  if ('driver_details' in parsed && parsed.driver_details) {
    parsed.driver_details = parseJSONField<DriverDetails>(parsed.driver_details);
  }

  // Parse biker_details if it's a string
  if ('biker_details' in parsed && parsed.biker_details) {
    parsed.biker_details = parseJSONField<BikerDetails>(parsed.biker_details);
  }

  // Parse vehicle_info if present and is a string
  if ('vehicle_info' in parsed && typeof parsed.vehicle_info === 'string') {
    parsed.vehicle_info = parseJSONField<VehicleInfo>(parsed.vehicle_info);
  }

  return parsed;
}

class BookingApiService {
  private basePath = '/rides';

  // Helper to parse response data
  private parseResponse<T extends BookingDetail>(response: ApiResponse<T>): ApiResponse<T> {
    if (response.success && response.data) {
      // Handle array responses
      if (Array.isArray(response.data)) {
        return {
          ...response,
          data: response.data.map(item => parseBookingDetails(item)) as T,
        };
      }
      // Handle single object response
      return {
        ...response,
        data: parseBookingDetails(response.data),
      };
    }
    return response;
  }

  // List all rides for the current user
  async listRides(params?: { booking_status?: string }): Promise<ApiResponse<BookingDetail[]>> {
    try {
      const queryParams = params && params.booking_status
        ? `?booking_status=${params.booking_status}`
        : '';
      const result = await BaseApiService.get<BookingDetail[]>(`${this.basePath}/${queryParams}`);
      return this.parseResponse(result);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch rides',
      };
    }
  }

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
      const result = await BaseApiService.post<BookingDetail>(
        `${this.basePath}/book/`,
        data
      );
      return this.parseResponse(result);
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
      const result = await BaseApiService.get<BookingDetail>(`${this.basePath}/active`);
      return this.parseResponse(result);
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
      const result = await BaseApiService.get<BookingDetail>(`${this.basePath}/${id}`);
      return this.parseResponse(result);
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

  // List rides by status (for filtering)
  async listRidesByStatus(status: string): Promise<ApiResponse<BookingDetail[]>> {
    return this.listRides({ booking_status: status });
  }

  // Get pending rides for drivers (rides without driver assigned)
  async getPendingRides(): Promise<ApiResponse<BookingDetail[]>> {
    return this.listRides({ booking_status: 'requested' });
  }

  // Get driver's accepted rides (rides assigned to this driver but not completed)
  async getDriverAcceptedRides(driverId: string): Promise<ApiResponse<BookingDetail[]>> {
    try {
      // For now, we fetch all rides and filter client-side
      // The backend should ideally have a dedicated endpoint
      const response = await BaseApiService.get<BookingDetail[]>(`${this.basePath}/`);
      if (response.success && response.data) {
        const driverRides = Array.isArray(response.data)
          ? response.data.filter((ride: BookingDetail) =>
              ride.driver === driverId &&
              !['trip_completed', 'cancelled_by_customer', 'cancelled_by_driver', 'cancelled_by_system'].includes(ride.booking_status)
            )
          : [];
        return {
          success: true,
          data: driverRides,
        };
      }
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch accepted rides',
      };
    }
  }

  // Get driver's completed rides
  async getDriverCompletedRides(driverId: string): Promise<ApiResponse<BookingDetail[]>> {
    try {
      const response = await BaseApiService.get<BookingDetail[]>(`${this.basePath}/`);
      if (response.success && response.data) {
        const driverRides = Array.isArray(response.data)
          ? response.data.filter((ride: BookingDetail) =>
              ride.driver === driverId && ride.booking_status === 'trip_completed'
            )
          : [];
        return {
          success: true,
          data: driverRides,
        };
      }
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch completed rides',
      };
    }
  }

  // Accept a ride (assign driver to ride)
  async acceptRide(rideId: string, driverId: string): Promise<ApiResponse<BookingDetail>> {
    try {
      return await BaseApiService.post<BookingDetail>(
        `${this.basePath}/${rideId}/accept/`,
        { driver_id: driverId }
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to accept ride',
      };
    }
  }

  // Start a ride
  async startRide(rideId: string): Promise<ApiResponse<BookingDetail>> {
    try {
      return await BaseApiService.post<BookingDetail>(
        `${this.basePath}/${rideId}/start/`,
        {}
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start ride',
      };
    }
  }

  // Complete a ride
  async completeRide(rideId: string, data?: { actual_distance_km?: string; actual_duration_minutes?: number; actual_fare?: string }): Promise<ApiResponse<BookingDetail>> {
    try {
      return await BaseApiService.post<BookingDetail>(
        `${this.basePath}/${rideId}/complete/`,
        data || {}
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete ride',
      };
    }
  }
}

export default new BookingApiService();
