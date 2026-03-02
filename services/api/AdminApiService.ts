import BaseApiService, { ApiResponse } from './BaseApiService';

// ============================================================================
// ADMIN API TYPES
// ============================================================================

export interface DashboardStats {
  total_rides: number;
  completed_rides: number;
  active_rides: number;
  cancelled_rides: number;
  total_revenue: number;
  active_drivers: number;
  active_bikers: number;
  pending_driver_verifications: number;
  pending_biker_verifications: number;
  total_customers: number;
  total_payments: number;
  open_disputes: number;
}

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  user_type: string;
  status: string;
  is_verified: boolean;
  profile_picture?: string;
  created_at: string;
  updated_at?: string;
  date_of_birth?: string;
}

export interface AdminDriver {
  id: string;
  user_details: AdminUser;
  license_number?: string;
  license_expiry?: string;
  aadhar_number?: string;
  background_check_status?: string;
  background_check_status_display?: string;
  current_status?: string;
  current_status_display?: string;
  years_of_experience?: number;
  is_online: boolean;
  average_rating?: number;
  total_trips: number;
  documents: AdminDocument[];
  created_at: string;
}

export interface AdminDocument {
  id: string;
  document_type: string;
  document_number?: string;
  document_url?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  verified_at?: string;
  uploaded_at: string;
  expiry_date?: string;
}

export interface AdminBiker {
  id: string;
  user_details: AdminUser;
  license_number?: string;
  aadhar_number?: string;
  background_check_status?: string;
  background_check_status_display?: string;
  current_status?: string;
  current_status_display?: string;
  years_of_experience?: number;
  is_online: boolean;
  average_rating?: number;
  total_tasks: number;
  created_at: string;
}

export interface AdminRide {
  id: string;
  booking_reference: string;
  booking_status: string;
  booking_status_display?: string;
  customer_name?: string;
  driver_name?: string;
  biker_name?: string;
  trip_type: string;
  trip_type_display?: string;
  estimated_fare: string;
  actual_fare?: string;
  created_at: string;
  scheduled_at?: string;
}

export interface AdminRideInsurance {
  id: string;
  plan_name: string;
  plan_tier: string;
  premium_amount: string;
  max_coverage_amount: string;
  status: string;
  coverage_details?: any;
}

export interface AdminRideAmenity {
  id: string;
  amenity_id?: string;
  name: string;
  description?: string;
  category?: string;
  price: string;
  quantity?: number;
  total_price?: string;
  status?: string;
  is_delivered?: boolean;
}

export interface AdminRideDetail {
  id: string;
  booking_reference: string;
  booking_status: string;
  booking_status_display?: string;
  customer_details?: AdminUser;
  driver_details?: AdminUser;
  biker_details?: AdminUser;
  pickup_address: string;
  dropoff_address: string;
  pickup_lat?: string;
  pickup_long?: string;
  dropoff_lat?: string;
  dropoff_long?: string;
  trip_type: string;
  trip_type_display?: string;
  service_type?: string;
  estimated_fare: string;
  actual_fare?: string;
  estimated_fare_notes?: any;
  payment_status?: string;
  payment_status_display?: string;
  estimated_distance_km?: string;
  actual_distance_km?: string;
  estimated_duration_minutes?: number;
  actual_duration_minutes?: number;
  insurance?: AdminRideInsurance;
  amenities?: AdminRideAmenity[];
  amenities_total?: string;
  special_requests?: string;
  notes?: string;
  scheduled_at?: string;
  driver_assigned_at?: string;
  driver_arrived_at?: string;
  trip_started_at?: string;
  trip_completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface AdminTask {
  id: string;
  task_reference: string;
  priority: string;
  biker_name: string;
  task_status: string;
  task_status_display: string;
  booking_reference: string;
  created_at: string;
  updated_at: string;
}

export interface AdminPayment {
  id: string;
  payment_reference?: string;
  booking_reference?: string;
  customer_name?: string;
  amount: string;
  net_amount?: string;
  payment_type?: string;
  payment_type_display?: string;
  payment_method?: string;
  payment_status: string;
  payment_status_display?: string;
  transaction_id?: string;
  customer?: AdminUser;
  driver?: AdminUser;
  created_at: string;
}

export interface AdminDispute {
  id: string;
  booking_reference?: string;
  ride_id?: string;
  raised_by?: AdminUser;
  reason: string;
  description: string;
  status: string;
  resolution?: string;
  resolved_at?: string;
  created_at: string;
}

export interface AdminInsurancePlan {
  id: string;
  tier: 'scratch' | 'scratch_and_dent' | 'full';
  name: string;
  description: string;
  premium_amount: string;
  max_coverage_amount: string;
  coverage_details: string[];
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdminAmenity {
  id: string;
  name: string;
  description: string;
  category: 'refreshment' | 'comfort' | 'premium';
  price: string;
  available_segments: string[];
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}


export interface AdminSurgeConfig {
  id?: string;
  surge_type: 'NIGHT' | 'TRAFFIC' | 'HOURLY';
  multiplier: string;
  min_multiplier?: string;
  max_multiplier?: string;
}

export interface AdminPerKmRate {
  id?: string;
  vehicle_segment: string;
  base_fare: string;
  per_km: string;
}

export interface AdminPerMinRate {
  id?: string;
  vehicle_segment: string;
  base_fare: string;
  per_min: string;
}

export interface AdminHourlyHireRate {
  id?: string;
  vehicle_segment: string;
  base_1h: string;
  per_hour_after_1h: string;
}

export interface AdminRateCard {
  id: string;
  code: string;
  city: string;
  currency: string;
  driver_share: string;
  platform_share: string;
  is_active: boolean;
  effective_from?: string;
  effective_to?: string;
  surge_configs: AdminSurgeConfig[];
  per_km_rates: AdminPerKmRate[];
  per_min_rates: AdminPerMinRate[];
  hourly_rates: AdminHourlyHireRate[];
}

export interface HourlyHireSettings {
  id?: string;
  is_enabled: boolean;
  surge_multiplier: number;
  daily_cap: number;
  min_hours: number;
  max_hours?: number;
  base_rate_per_hour?: number;
}

export interface RevenuePayment {
  id: string;
  payment_reference?: string;
  booking_reference?: string;
  customer_name?: string;
  amount: string;
  net_amount?: string;
  payment_type?: string;
  payment_type_display?: string;
  created_at: string;
}

export interface RevenueData {
  weekly_earnings: string;
  monthly_earnings: string;
  selected_date: string;
  daily_revenue: string;
  daily_rides: number;
  daily_breakdown: RevenuePayment[];
}

// ============================================================================
// ADMIN API SERVICE
// ============================================================================

class AdminApiService {
  private basePath = '/admin';

  // Dashboard
  async getDashboard(): Promise<ApiResponse<DashboardStats>> {
    try {
      return await BaseApiService.get<DashboardStats>(`${this.basePath}/dashboard/`);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch dashboard' };
    }
  }

  // Revenue
  async getRevenue(date?: string): Promise<ApiResponse<RevenueData>> {
    try {
      const queryParams: Record<string, string> = {};
      if (date) queryParams.date = date;
      return await BaseApiService.get<RevenueData>(
        `${this.basePath}/revenue/`,
        Object.keys(queryParams).length > 0 ? queryParams : undefined
      );
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch revenue' };
    }
  }

  // Users
  async getUsers(params?: { user_type?: string; status?: string }): Promise<ApiResponse<AdminUser[]>> {
    try {
      const queryParams: Record<string, string> = {};
      if (params?.user_type) queryParams.user_type = params.user_type;
      if (params?.status) queryParams.status = params.status;
      return await BaseApiService.get<AdminUser[]>(
        `${this.basePath}/users/`,
        Object.keys(queryParams).length > 0 ? queryParams : undefined
      );
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch users' };
    }
  }

  async getUserDetail(id: string): Promise<ApiResponse<AdminUser>> {
    try {
      return await BaseApiService.get<AdminUser>(`${this.basePath}/users/${id}/`);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch user' };
    }
  }

  async updateUserStatus(id: string, status: string): Promise<ApiResponse<AdminUser>> {
    try {
      return await BaseApiService.put<AdminUser>(`${this.basePath}/users/${id}/status/`, { status });
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update user status' };
    }
  }

  // Drivers
  async getDrivers(): Promise<ApiResponse<AdminDriver[]>> {
    try {
      return await BaseApiService.get<AdminDriver[]>(`${this.basePath}/drivers/`);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch drivers' };
    }
  }

  async getPendingDrivers(): Promise<ApiResponse<AdminDriver[]>> {
    try {
      return await BaseApiService.get<AdminDriver[]>(`${this.basePath}/drivers/pending/`);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch pending drivers' };
    }
  }

  async getDriver(id: string): Promise<ApiResponse<AdminDriver>> {
    try {
      return await BaseApiService.get<AdminDriver>(`${this.basePath}/drivers/${id}/`);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch driver' };
    }
  }

  async verifyDriver(id: string, data: { action: 'approve' | 'reject'; rejection_reason?: string }): Promise<ApiResponse<AdminDriver>> {
    try {
      return await BaseApiService.put<AdminDriver>(`${this.basePath}/drivers/${id}/verify/`, data);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to verify driver' };
    }
  }

  async verifyDriverDocument(driverId: string, docId: string, data: { verification_status: 'approved' | 'rejected'; rejection_reason?: string }): Promise<ApiResponse<AdminDocument>> {
    try {
      return await BaseApiService.put<AdminDocument>(`${this.basePath}/drivers/${driverId}/documents/${docId}/verify/`, data);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to verify document' };
    }
  }

  // Bikers
  async getBikers(): Promise<ApiResponse<AdminBiker[]>> {
    try {
      return await BaseApiService.get<AdminBiker[]>(`${this.basePath}/bikers/`);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch bikers' };
    }
  }

  async getPendingBikers(): Promise<ApiResponse<AdminBiker[]>> {
    try {
      return await BaseApiService.get<AdminBiker[]>(`${this.basePath}/bikers/pending/`);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch pending bikers' };
    }
  }

  async getBiker(id: string): Promise<ApiResponse<AdminBiker>> {
    try {
      return await BaseApiService.get<AdminBiker>(`${this.basePath}/bikers/${id}/`);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch biker' };
    }
  }

  async verifyBiker(id: string, data: { current_status: string; background_check_status?: string }): Promise<ApiResponse<AdminBiker>> {
    try {
      return await BaseApiService.put<AdminBiker>(`${this.basePath}/bikers/${id}/verify/`, data);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to verify biker' };
    }
  }

  // Rides
  async getRides(params?: { status?: string; search?: string }): Promise<ApiResponse<AdminRide[]>> {
    try {
      const queryParams: Record<string, string> = {};
      if (params?.status) queryParams.status = params.status;
      if (params?.search) queryParams.search = params.search;
      return await BaseApiService.get<AdminRide[]>(
        `${this.basePath}/rides/`,
        Object.keys(queryParams).length > 0 ? queryParams : undefined
      );
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch rides' };
    }
  }

  async getRideDetail(id: string): Promise<ApiResponse<AdminRideDetail>> {
    try {
      return await BaseApiService.get<AdminRideDetail>(`${this.basePath}/rides/${id}/`);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch ride' };
    }
  }

  async dispatchRide(id: string, data: { driver_id: string }): Promise<ApiResponse<AdminRideDetail>> {
    try {
      return await BaseApiService.put<AdminRideDetail>(`${this.basePath}/rides/${id}/dispatch/`, data);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to dispatch ride' };
    }
  }

  async cancelRide(id: string, data?: { reason?: string }): Promise<ApiResponse<AdminRideDetail>> {
    try {
      return await BaseApiService.put<AdminRideDetail>(`${this.basePath}/rides/${id}/cancel/`, data || {});
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to cancel ride' };
    }
  }

  // Tasks
  async getTasks(): Promise<ApiResponse<AdminTask[]>> {
    try {
      return await BaseApiService.get<AdminTask[]>(`${this.basePath}/tasks/`);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch tasks' };
    }
  }

  async getTaskDetail(id: string): Promise<ApiResponse<AdminTask>> {
    try {
      return await BaseApiService.get<AdminTask>(`${this.basePath}/tasks/${id}/`);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch task' };
    }
  }

  // Payments
  async getPayments(params?: { status?: string; search?: string }): Promise<ApiResponse<AdminPayment[]>> {
    try {
      const queryParams: Record<string, string> = {};
      if (params?.status) queryParams.status = params.status;
      if (params?.search) queryParams.search = params.search;
      return await BaseApiService.get<AdminPayment[]>(
        `${this.basePath}/payments/`,
        Object.keys(queryParams).length > 0 ? queryParams : undefined
      );
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch payments' };
    }
  }

  async getPaymentDetail(id: string): Promise<ApiResponse<AdminPayment>> {
    try {
      return await BaseApiService.get<AdminPayment>(`${this.basePath}/payments/${id}/`);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch payment' };
    }
  }

  // Disputes
  async getDisputes(): Promise<ApiResponse<AdminDispute[]>> {
    try {
      return await BaseApiService.get<AdminDispute[]>(`${this.basePath}/disputes/`);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch disputes' };
    }
  }

  async getDisputeDetail(id: string): Promise<ApiResponse<AdminDispute>> {
    try {
      return await BaseApiService.get<AdminDispute>(`${this.basePath}/disputes/${id}/`);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch dispute' };
    }
  }

  async resolveDispute(id: string, data: { resolution: string; status: string }): Promise<ApiResponse<AdminDispute>> {
    try {
      return await BaseApiService.put<AdminDispute>(`${this.basePath}/disputes/${id}/resolve/`, data);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to resolve dispute' };
    }
  }


  // Pricing / Rate Cards
  async getRateCards(): Promise<ApiResponse<AdminRateCard[]>> {
    try {
      return await BaseApiService.get<AdminRateCard[]>(`${this.basePath}/pricing/rate-cards/`);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch rate cards' };
    }
  }

  async getRateCard(id: string): Promise<ApiResponse<AdminRateCard>> {
    try {
      return await BaseApiService.get<AdminRateCard>(`${this.basePath}/pricing/rate-cards/${id}/`);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch rate card' };
    }
  }

  async updateRateCard(id: string, data: Partial<AdminRateCard>): Promise<ApiResponse<AdminRateCard>> {
    try {
      return await BaseApiService.patch<AdminRateCard>(`${this.basePath}/pricing/rate-cards/${id}/`, data);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update rate card' };
    }
  }

  // Hourly Hire Settings
  async getHourlyHireSettings(): Promise<ApiResponse<HourlyHireSettings>> {
    try {
      return await BaseApiService.get<HourlyHireSettings>(`${this.basePath}/hourly-hire/`);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch hourly hire settings' };
    }
  }

  async updateHourlyHireSettings(data: Partial<HourlyHireSettings>): Promise<ApiResponse<HourlyHireSettings>> {
    try {
      return await BaseApiService.put<HourlyHireSettings>(`${this.basePath}/hourly-hire/`, data);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update hourly hire settings' };
    }
  }

  // Insurance Plans Admin
  async getInsurancePlans(): Promise<ApiResponse<AdminInsurancePlan[]>> {
    try {
      return await BaseApiService.get<AdminInsurancePlan[]>('/insurance/admin/plans/');
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch insurance plans' };
    }
  }

  async getInsurancePlan(id: string): Promise<ApiResponse<AdminInsurancePlan>> {
    try {
      return await BaseApiService.get<AdminInsurancePlan>(`/insurance/admin/plans/${id}/`);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch insurance plan' };
    }
  }

  async createInsurancePlan(data: Partial<AdminInsurancePlan>): Promise<ApiResponse<AdminInsurancePlan>> {
    try {
      return await BaseApiService.post<AdminInsurancePlan>('/insurance/admin/plans/', data);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create insurance plan' };
    }
  }

  async updateInsurancePlan(id: string, data: Partial<AdminInsurancePlan>): Promise<ApiResponse<AdminInsurancePlan>> {
    try {
      return await BaseApiService.put<AdminInsurancePlan>(`/insurance/admin/plans/${id}/`, data);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update insurance plan' };
    }
  }

  async deleteInsurancePlan(id: string): Promise<ApiResponse<void>> {
    try {
      return await BaseApiService.delete<void>(`/insurance/admin/plans/${id}/`);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete insurance plan' };
    }
  }

  // Amenities Admin
  async getAmenities(): Promise<ApiResponse<AdminAmenity[]>> {
    try {
      return await BaseApiService.get<AdminAmenity[]>('/amenities/admin/');
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch amenities' };
    }
  }

  async getAmenity(id: string): Promise<ApiResponse<AdminAmenity>> {
    try {
      return await BaseApiService.get<AdminAmenity>(`/amenities/admin/${id}/`);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch amenity' };
    }
  }

  async createAmenity(data: Partial<AdminAmenity>): Promise<ApiResponse<AdminAmenity>> {
    try {
      return await BaseApiService.post<AdminAmenity>('/amenities/admin/', data);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create amenity' };
    }
  }

  async updateAmenity(id: string, data: Partial<AdminAmenity>): Promise<ApiResponse<AdminAmenity>> {
    try {
      return await BaseApiService.put<AdminAmenity>(`/amenities/admin/${id}/`, data);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update amenity' };
    }
  }

  async deleteAmenity(id: string): Promise<ApiResponse<void>> {
    try {
      return await BaseApiService.delete<void>(`/amenities/admin/${id}/`);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete amenity' };
    }
  }
}

export default new AdminApiService();
