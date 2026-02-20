import BaseApiService, { ApiResponse } from './BaseApiService';

// ============================================================================
// CUSTOMER RIDES TYPES - API v1.0.0
// ============================================================================

/**
 * Booking Status Values
 */
export type BookingStatus =
  | 'requested'
  | 'driver_assigned'
  | 'biker_assigned'
  | 'driver_en_route'
  | 'driver_arrived'
  | 'trip_started'
  | 'trip_completed'
  | 'cancelled_by_customer'
  | 'cancelled_by_driver'
  | 'cancelled_by_system';

/**
 * Trip Type
 */
export type TripType = 'one_way' | 'round_trip' | 'hourly_charter';

/**
 * Service Type
 */
export type ServiceType = 'driver_booking';

/**
 * Payment Status
 */
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

/**
 * Driver Info (embedded in ride response)
 */
export interface DriverInfo {
  id: string;
  full_name: string;
  phone_number: string;
  profile_picture?: string;
  average_rating?: number;
  total_trips?: number;
}

/**
 * Car Info (embedded in ride response)
 */
export interface CarInfo {
  id?: string;
  make: string;
  model: string;
  plate_number: string;
  color: string;
  vehicle_type?: string;
}

/**
 * Customer Ride - Basic response for list endpoints
 */
export interface CustomerRide {
  id: string;
  booking_reference: string;
  booking_status: BookingStatus;
  pickup_address: string;
  pickup_lat: number;
  pickup_long: number;
  dropoff_address: string;
  dropoff_lat: number;
  dropoff_long: number;
  trip_type: TripType;
  estimated_fare: string;
  actual_fare?: string | null;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at?: string;
  scheduled_at?: string;
  driver?: DriverInfo;
  car?: CarInfo;
  rating?: number;
  insurance?: InsuranceInfo;
}

/**
 * Customer Ride Detail - Full response for detail endpoint
 */
export interface CustomerRideDetail extends CustomerRide {
  actual_fare?: string | null;
  service_type: ServiceType;
  payment_status: PaymentStatus;
  driver_assigned_at?: string | null;
  biker_assigned_at?: string | null;
  driver_en_route_at?: string | null;
  driver_arrived_at?: string | null;
  trip_started_at?: string | null;
  trip_completed_at?: string | null;
  cancelled_at?: string | null;
  special_requests?: string;
  timeline?: TimelineEvent[];
}

/**
 * Timeline Event
 */
export interface TimelineEvent {
  event_type: string;
  created_at: string;
}

/**
 * Schedule Availability Request
 */
export interface BookingAvailabilityRequest {
  scheduled_at: string;
}

/**
 * Schedule Availability Response
 */
export interface BookingAvailabilityResponse {
  scheduled_at: string;
}

/**
 * Fare Estimate Request
 */
export interface FareEstimateRequest {
  vehicle_id: string;
  from_lat: number;
  from_long: number;
  from_address?: string;
  to_lat: number;
  to_long: number;
  to_address?: string;
  type: TripType;
  when?: 'now' | 'schedule';
  scheduled_at?: string | null;
  hours?: number | null;
  insurance_plan_id?: string | null;
}

/**
 * Insurance object returned inside a fare estimate response.
 * Note: field names differ from InsuranceInfo (which comes from booking/detail responses).
 */
export interface FareEstimateInsurance {
  plan_id: string;
  plan_name: string;
  tier: string;
  premium_amount: number;
  max_coverage_amount: number;
}

/**
 * Fare Estimate Response
 */
export interface FareEstimateResponse {
  estimated_distance_km: number;
  estimated_duration_minutes: number;
  estimated_fare: string;
  surge_multiplier?: number;
  insurance?: FareEstimateInsurance;
  fare_breakdown?: {
    base_fare: string;
    distance_fare: string;
    time_fare?: string;
    platform_fee?: string;
    biker_transport_fee?: string;
    surge_amount?: string;
    insurance_premium?: string;
    subtotal?: string;
    total?: string;
  };
}

/**
 * Insurance Info (included in booking response when insurance is selected)
 */
export interface InsuranceInfo {
  id: string;
  plan_name: string;
  plan_tier: string;
  premium_amount: string;
  max_coverage_amount: string;
  status: 'active' | 'expired' | 'cancelled';
  created_at: string;
}

/**
 * Book Ride Request
 */
export interface BookRideRequest {
  vehicle_id: string;
  from_lat: number;
  from_long: number;
  from_address: string;
  to_lat: number;
  to_long: number;
  to_address: string;
  type: TripType;
  scheduled_at?: string | null;
  hours?: number | null;
  insurance_plan_id?: string | null;
}

/**
 * Book Ride Response
 */
export interface BookRideResponse {
  id: string;
  booking_reference: string;
  booking_status: BookingStatus;
  estimated_fare: string;
  insurance?: InsuranceInfo | null;
  created_at: string;
}

/**
 * Cancel Ride Request
 */
export interface CancelRideRequest {
  cancellation_reason?: string;
}

// ============================================================================
// CUSTOMER RIDES API SERVICE
// ============================================================================

class BookingApiService {
  private basePath = '/rides';

  /**
   * List Rides
   * GET /api/v1/rides/
   *
   * Get all rides for the authenticated customer.
   *
   * @param bookingStatus - Filter by status (optional)
   */
  async listRides(bookingStatus?: BookingStatus): Promise<ApiResponse<CustomerRide[]>> {
    try {
      const params: Record<string, string> = {};
      if (bookingStatus) {
        params.booking_status = bookingStatus;
      }

      const response = await BaseApiService.get<CustomerRide[]>(
        `${this.basePath}/`,
        Object.keys(params).length > 0 ? params : undefined
      );

      if (response.success && response.data) {
        // Handle both array and nested data responses
        const rides = Array.isArray(response.data) ? response.data : (response.data as any).data || [];
        return {
          ...response,
          data: rides,
        };
      }

      return response as ApiResponse<CustomerRide[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch rides',
      };
    }
  }

  /**
   * Get Ride Details
   * GET /api/v1/rides/{id}/
   *
   * Get detailed information about a specific ride.
   *
   * @param id - The booking ID
   */
  async getRideDetails(id: string): Promise<ApiResponse<CustomerRideDetail>> {
    try {
      return await BaseApiService.get<CustomerRideDetail>(`${this.basePath}/${id}/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch ride details',
      };
    }
  }

  /**
   * Get Active Ride
   * GET /api/v1/rides/active/
   *
   * Get the currently active ride for the customer (if any).
   * Returns rides with status: requested, driver_assigned, biker_assigned,
   * driver_en_route, driver_arrived, or trip_started.
   */
  async getActiveRide(): Promise<ApiResponse<CustomerRideDetail | null>> {
    try {
      return await BaseApiService.get<CustomerRideDetail | null>(`${this.basePath}/active/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch active ride',
      };
    }
  }

  /**
   * Cancel Ride
   * POST /api/v1/rides/{id}/cancel/
   *
   * Cancel a ride by the customer.
   *
   * @param id - The booking ID
   * @param reason - Reason for cancellation (optional)
   */
  async cancelRide(id: string, reason?: string): Promise<ApiResponse<CustomerRideDetail>> {
    try {
      const data: CancelRideRequest = {};
      if (reason) {
        data.cancellation_reason = reason;
      }

      return await BaseApiService.post<CustomerRideDetail>(
        `${this.basePath}/${id}/cancel/`,
        data
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel ride',
      };
    }
  }

  /**
   * Book New Ride
   * POST /api/v1/rides/book/
   *
   * Create a new ride booking.
   *
   * @param data - Booking data
   */
  async bookRide(data: BookRideRequest): Promise<ApiResponse<BookRideResponse>> {
    try {
      return await BaseApiService.post<BookRideResponse>(`${this.basePath}/book/`, data);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to book ride',
      };
    }
  }

  /**
   * Get Fare Estimate
   * POST /api/v1/rides/estimate/
   *
   * Get fare estimate without creating a booking.
   *
   * @param data - Estimate request data
   */
  async getFareEstimate(data: FareEstimateRequest): Promise<ApiResponse<FareEstimateResponse>> {
    try {
      return await BaseApiService.post<FareEstimateResponse>(`${this.basePath}/estimate/`, data);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get fare estimate',
      };
    }
  }

  /**
   * Check Schedule Availability
   * POST /api/v1/rides/schedule/check-availability/
   *
   * Check if a scheduled datetime is available for booking.
   *
   * @param data - Availability check data with scheduled_at datetime
   */
  async checkScheduleAvailability(data: BookingAvailabilityRequest): Promise<ApiResponse<BookingAvailabilityResponse>> {
    try {
      return await BaseApiService.post<BookingAvailabilityResponse>(
        `${this.basePath}/schedule/check-availability/`,
        data
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check schedule availability',
      };
    }
  }

  // =========================================================================
  // LEGACY METHODS (Deprecated - Use new methods above)
  // =========================================================================

  /**
   * @deprecated Use listRides() instead
   */
  async listRidesByStatus(status: string): Promise<ApiResponse<CustomerRide[]>> {
    return this.listRides(status as BookingStatus);
  }
}

export default new BookingApiService();

// Legacy type exports for backward compatibility
export interface BookingDetail extends CustomerRideDetail {}
export { DriverInfo as DriverDetails };
export interface CustomerDetails {
  id: string;
  name: string;
  mobile: string;
  profile_picture?: string | null;
  overall_rating?: number | null;
  total_rides?: number | null;
}
export interface BikerDetails {
  id: string;
  name: string;
  mobile: string;
  profile_picture?: string | null;
  overall_rating?: number | null;
  total_rides?: number | null;
}
export interface VehicleInfo {
  id?: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  license_plate?: string;
  vehicle_type?: string;
  segment?: string;
}
export type WhenType = 'now' | 'schedule';
export interface BookingRequest extends BookRideRequest {
  when?: WhenType;
  payment_method?: string;
  special_requests?: string;
  notes?: string;
}
export interface FareEstimateResponseOld {
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

// Utility function to parse embedded details (for backward compatibility)
export function parseBookingDetails<T extends CustomerRideDetail>(booking: T): T {
  return booking;
}
