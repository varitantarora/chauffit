import BaseApiService, { ApiResponse } from './BaseApiService';

// Types based on rides API v1.0.0

// ============================================================================
// COMMON TYPES
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

// ============================================================================
// DRIVER RIDES TYPES
// ============================================================================

/**
 * User Details (embedded in driver ride response)
 */
export interface UserInfo {
  id: string;
  name: string;
  mobile: string;
  profile_picture?: string | null;
  overall_rating?: number | null;
  total_rides?: number;
}

/**
 * Vehicle Info (embedded in driver ride response)
 */
export interface VehicleInfo {
  make: string;
  model: string;
  plate: string;
  color: string;
  vehicle_type: string;
}

/**
 * Driver Ride - Basic response for list endpoints (matches backend DriverRideListSerializer)
 */
export interface DriverRide {
  id: string;
  booking_reference: string;
  booking_status: BookingStatus;
  pickup_address: string;
  pickup_lat: string;
  pickup_long: string;
  dropoff_address: string;
  dropoff_lat: string;
  dropoff_long: string;
  trip_type: TripType;
  estimated_distance_km?: string;
  estimated_duration_minutes?: number;
  estimated_fare: string;
  pickup_distance_km?: number | null;
  waiting_duration_minutes?: number | null;
  scheduled_at?: string | null;
  special_requests?: string;
  created_at: string;
  customer_details: UserInfo;
  driver_details: UserInfo | null;
  biker_details: UserInfo | null;
  vehicle_info: VehicleInfo;
}

/**
 * Driver Ride Detail - Full response for detail endpoint
 */
export interface DriverRideDetail extends DriverRide {
  service_type: ServiceType;
  actual_distance_km?: number | null;
  actual_duration_minutes?: number | null;
  actual_fare?: string | null;
  payment_status?: PaymentStatus;
  driver_assigned_at?: string | null;
  biker_assigned_at?: string | null;
  driver_en_route_at?: string | null;
  driver_arrived_at?: string | null;
  trip_started_at?: string | null;
  trip_completed_at?: string | null;
  cancelled_at?: string | null;
}

/**
 * Update Ride Status Request
 */
export interface UpdateRideStatusRequest {
  status: 'driver_en_route' | 'driver_arrived';
  location_lat?: number;
  location_long?: number;
}

/**
 * Start Trip Request
 */
export interface StartTripRequest {
  pickup_lat?: number;
  pickup_long?: number;
  odometer_start_km?: number;
}

/**
 * Complete Trip Request
 */
export interface CompleteTripRequest {
  dropoff_lat?: number;
  dropoff_long?: number;
  actual_distance_km?: number;
  actual_duration_minutes?: number;
  odometer_end_km?: number;
}

/**
 * Cancel Ride Request
 */
export interface CancelRideRequest {
  cancellation_reason?: string;
}

// ============================================================================
// PENDING RIDES TYPES
// ============================================================================

/**
 * Pending Ride - Ride available for driver to accept
 */
export interface PendingRide {
  id: string;
  booking_reference: string;
  booking_status: BookingStatus;
  pickup_address: string;
  dropoff_address: string;
  estimated_distance_km: number;
  estimated_fare: string;
  estimated_earnings: string;
  distance_from_driver_km: number;
  customer: {
    id: string;
    full_name: string;
    phone_number: string;
    average_rating?: number;
  };
  car: CarInfo;
}

// ============================================================================
// DRIVER RIDES API SERVICE
// ============================================================================

class DriverRidesApiService {
  private basePath = '/rides/driver';

  /**
   * List Driver Rides
   * GET /api/v1/rides/driver/
   *
   * Get rides assigned to the authenticated driver.
   *
   * @param status - Filter by status: 'accepted', 'in-progress', 'completed'
   */
  async getDriverRides(status?: 'accepted' | 'in-progress' | 'completed'): Promise<ApiResponse<DriverRide[]>> {
    try {
      const params: Record<string, string> = {};
      if (status) {
        params.status = status;
      }

      const response = await BaseApiService.get<DriverRide[]>(
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

      return response as ApiResponse<DriverRide[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch driver rides',
      };
    }
  }

  /**
   * Get Pending Rides
   * GET /api/v1/rides/driver/pending/
   *
   * Get rides available for the driver to accept (nearby rides).
   *
   * @param radius - Search radius in km (default: 50)
   */
  async getPendingRides(radius: number = 50): Promise<ApiResponse<PendingRide[]>> {
    try {
      const response = await BaseApiService.get<PendingRide[]>(
        `${this.basePath}/pending/`,
        { radius: radius.toString() }
      );

      if (response.success && response.data) {
        // Handle both array and nested data responses
        const rides = Array.isArray(response.data) ? response.data : (response.data as any).data || [];
        return {
          ...response,
          data: rides,
        };
      }

      return response as ApiResponse<PendingRide[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch pending rides',
      };
    }
  }

  /**
   * Get Driver Ride Details
   * GET /api/v1/rides/driver/{id}/
   *
   * Get detailed information about a specific ride.
   *
   * @param rideId - The booking ID
   */
  async getRideDetails(rideId: string): Promise<ApiResponse<DriverRideDetail>> {
    try {
      return await BaseApiService.get<DriverRideDetail>(`${this.basePath}/${rideId}/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch ride details',
      };
    }
  }

  /**
   * Accept Ride
   * POST /api/v1/rides/{id}/accept/
   *
   * Accept a ride request.
   *
   * @param rideId - The booking ID
   */
  async acceptRide(rideId: string): Promise<ApiResponse<DriverRideDetail>> {
    try {
      return await BaseApiService.post<DriverRideDetail>(`/rides/${rideId}/accept/`, {});
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to accept ride',
      };
    }
  }

  /**
   * Update Ride Status
   * POST /api/v1/rides/driver/{id}/status/
   *
   * Update the ride status (driver_en_route, driver_arrived).
   *
   * @param rideId - The booking ID
   * @param data - Status update data
   */
  async updateRideStatus(rideId: string, data: UpdateRideStatusRequest): Promise<ApiResponse<DriverRideDetail>> {
    try {
      return await BaseApiService.post<DriverRideDetail>(
        `${this.basePath}/${rideId}/status/`,
        data
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update ride status',
      };
    }
  }

  /**
   * Start Trip
   * POST /api/v1/rides/driver/{id}/start/
   *
   * Start the trip (after customer is in the car).
   *
   * @param rideId - The booking ID
   * @param data - Start trip data
   */
  async startTrip(rideId: string, data?: StartTripRequest): Promise<ApiResponse<DriverRideDetail>> {
    try {
      return await BaseApiService.post<DriverRideDetail>(
        `${this.basePath}/${rideId}/start/`,
        data || {}
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start trip',
      };
    }
  }

  /**
   * Complete Trip
   * POST /api/v1/rides/driver/{id}/complete/
   *
   * Complete the trip and update final details.
   *
   * @param rideId - The booking ID
   * @param data - Complete trip data
   */
  async completeTrip(rideId: string, data?: CompleteTripRequest): Promise<ApiResponse<DriverRideDetail>> {
    try {
      return await BaseApiService.post<DriverRideDetail>(
        `${this.basePath}/${rideId}/complete/`,
        data || {}
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete trip',
      };
    }
  }

  /**
   * Cancel Ride (Driver)
   * POST /api/v1/rides/driver/{id}/cancel/
   *
   * Cancel a ride by the driver.
   *
   * @param rideId - The booking ID
   * @param data - Cancellation data
   */
  async cancelRide(rideId: string, data?: CancelRideRequest): Promise<ApiResponse<DriverRideDetail>> {
    try {
      return await BaseApiService.post<DriverRideDetail>(
        `${this.basePath}/${rideId}/cancel/`,
        data || {}
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel ride',
      };
    }
  }

  // =========================================================================
  // OTP API METHODS
  // =========================================================================

  /**
   * Send OTP
   * POST /api/v1/rides/driver/{id}/send-otp/
   *
   * Send OTP to customer for ride start verification.
   *
   * @param rideId - The booking ID
   */
  async sendOtp(rideId: string): Promise<ApiResponse<{ message: string; otp?: string }>> {
    try {
      return await BaseApiService.post<{ message: string; otp?: string }>(
        `${this.basePath}/${rideId}/send-otp/`,
        {}
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send OTP',
      };
    }
  }

  /**
   * Verify OTP and Start Trip
   * POST /api/v1/rides/driver/{id}/verify-otp-start/
   *
   * Verify OTP and start the trip in one call.
   *
   * @param rideId - The booking ID
   * @param otp - 4-digit OTP code
   * @param pickupLat - Pickup location latitude
   * @param pickupLong - Pickup location longitude
   * @param odometerStartKm - Odometer reading at start
   */
  async verifyOtpAndStart(
    rideId: string,
    otp: string,
    pickupLat?: number,
    pickupLong?: number,
    odometerStartKm?: number
  ): Promise<ApiResponse<DriverRideDetail>> {
    try {
      const data: StartTripRequest = {};
      if (pickupLat !== undefined) data.pickup_lat = pickupLat;
      if (pickupLong !== undefined) data.pickup_long = pickupLong;
      if (odometerStartKm !== undefined) data.odometer_start_km = odometerStartKm;

      return await BaseApiService.post<DriverRideDetail>(
        `${this.basePath}/${rideId}/verify-otp-start/`,
        { otp, ...data }
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify OTP',
      };
    }
  }
}

export default new DriverRidesApiService();

// Re-export BookingDetail for backward compatibility
export type { BookingDetail } from './BookingApiService';
