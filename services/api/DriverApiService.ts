import BaseApiService, { ApiResponse } from './BaseApiService';

// Types based on API YAML schema
export interface DriverProfile {
  id: string;
  user: {
    id: string;
    email: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  full_name: string;
  email: string;
  phone_number: string;
  license_number: string;
  license_expiry_date: string;
  license_photo_front?: string;
  license_photo_back?: string;
  aadhar_number: string;
  aadhar_photo?: string;
  background_check_status: 'pending' | 'in_progress' | 'verified' | 'failed';
  background_check_date?: string;
  bio?: string;
  years_of_experience?: number;
  languages_spoken?: Record<string, any>;
  is_online: boolean;
  current_location_lat?: string;
  current_location_long?: string;
  location_updated_at?: string;
  current_status: 'pending_verification' | 'active' | 'inactive' | 'suspended' | 'banned';
  is_verified: boolean;
  average_rating: number;
  total_trips: number;
  created_at: string;
  updated_at: string;
}

export interface DriverProfileDetail extends DriverProfile {
  documents: DriverDocument[];
}

export interface DriverDocument {
  id: string;
  driver: string;
  driver_name: string;
  document_type: 'police_verification' | 'address_proof' | 'passport' | 'insurance' | 'other';
  document_number?: string;
  document_file: string;
  issue_date?: string;
  expiry_date?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DriverProfileRequest {
  license_number: string;
  license_expiry_date: string;
  license_photo_front?: any; // File/Blob for multipart
  license_photo_back?: any;
  aadhar_number: string;
  aadhar_photo?: any;
  background_check_status?: 'pending' | 'in_progress' | 'verified' | 'failed';
  bio?: string;
  years_of_experience?: number;
  languages_spoken?: Record<string, any>;
  is_online?: boolean;
  current_location_lat?: string;
  current_location_long?: string;
  location_updated_at?: string;
  current_status?: 'pending_verification' | 'active' | 'inactive' | 'suspended' | 'banned';
}

export interface UpdateLocationRequest {
  latitude: string;
  longitude: string;
}

export interface UpdateStatusRequest {
  is_online: boolean;
  latitude?: string;
  longitude?: string;
}

export interface DriverDocumentRequest {
  document_type: 'police_verification' | 'address_proof' | 'passport' | 'insurance' | 'other';
  document_number?: string;
  document_file: any; // File/Blob
  issue_date?: string;
  expiry_date?: string;
  verification_status?: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
}

// ============================================================================
// EARNINGS TYPES - Based on API Contract v1.0.0
// ============================================================================

/**
 * Driver Earnings Summary
 * GET /api/v1/drivers/earnings/
 */
export interface DriverEarningsSummary {
  total_earnings: string;    // Lifetime net earnings (all time)
  total_trips: number;        // Total completed trips (all time)
  today_earnings: string;     // Net earnings for today
  today_trips: number;         // Completed trips today
  week_earnings: string;      // Net earnings for last 7 days
  week_trips: number;          // Completed trips in last 7 days
  month_earnings: string;     // Net earnings for last 30 days
  month_trips: number;         // Completed trips in last 30 days
}

/**
 * Daily Earning Entry
 * Part of daily breakdown response
 */
export interface DailyEarningEntry {
  date: string;               // YYYY-MM-DD format
  trips_completed: number;    // Number of trips completed on that day
  total_earnings: string;     // Total fare amount earned (before fees)
  net_earnings: string;       // Net earnings after platform fee
}

/**
 * Daily Earnings Response
 * GET /api/v1/earnings/driver/daily/
 */
export interface DailyEarningsResponse {
  daily_breakdown: DailyEarningEntry[];
  summary: {
    total_trips: number;
    total_earnings: string;
    total_net_earnings: string;
  };
}

/**
 * Bonus/Tip Entry
 */
export interface BonusTipEntry {
  id: string;
  earning_type: 'bonus' | 'tip';
  earning_type_display: string;
  bonus_type: string;
  amount: string;
  platform_fee: string;
  net_earnings: string;
  payment_status: 'pending' | 'processing' | 'paid' | 'failed';
  payment_status_display: string;
  created_at: string;
}

/**
 * Bonuses and Incentives Response
 * GET /api/v1/earnings/driver/bonuses/
 */
export interface BonusesIncentivesResponse {
  summary: {
    total_count: number;
    total_amount: string;
    total_net_earnings: string;
    pending_amount: string;
    paid_amount: string;
    bonus: {
      count: number;
      amount: string;
    };
    tips: {
      count: number;
      amount: string;
    };
  };
  bonuses: BonusTipEntry[];
}

/**
 * Daily Earnings Request Parameters
 */
export interface DailyEarningsParams {
  days?: number;              // Number of days to fetch (max 90, default 30)
  start_date?: string;        // Start date (YYYY-MM-DD format)
  end_date?: string;          // End date (YYYY-MM-DD format)
}

/**
 * Bonuses Request Parameters
 */
export interface BonusesParams {
  type?: 'bonus' | 'tip' | 'all';     // Filter by type (default: all)
  status?: 'pending' | 'processing' | 'paid' | 'failed' | 'all';  // Filter by status (default: all)
}

// ============================================================================
// STATS TYPES - Based on API Contract v1.0.0
// ============================================================================

/**
 * Driver Stats Period
 * Stats for a specific time period
 */
export interface DriverStatsPeriod {
  trips: number;                  // Number of completed trips
  earned: string;                 // Net earnings (after fees)
  average_rating: number;         // Average rating (1-5 scale)
  rating_count: number;           // Number of ratings received
  completion_rate: number;        // Percentage of accepted trips completed
  distance_covered_km: number;    // Total distance driven in km
}

/**
 * Driver Stats Response
 * GET /api/v1/drivers/stats/
 */
export interface DriverStats {
  lifetime: DriverStatsPeriod;
  today: DriverStatsPeriod;
  week: DriverStatsPeriod;
  month: DriverStatsPeriod;
  current_streak: {
    days: number;                 // Consecutive days with at least one completed trip
  };
}

// ============================================================================
// DRIVER API SERVICE
// ============================================================================

class DriverApiService {
  private basePath = '/drivers';

  // Get current driver's profile
  async getProfile(): Promise<ApiResponse<DriverProfile>> {
    try {
      const response = await BaseApiService.get<DriverProfile[]>(`${this.basePath}/`);
      // API returns array, but we need single profile
      if (response.success && response.data) {
        const profiles = Array.isArray(response.data) ? response.data : [response.data];
        if (profiles.length > 0) {
          return {
            success: true,
            data: profiles[0],
          };
        }
      }
      return {
        success: false,
        error: 'Driver profile not found',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch driver profile',
      };
    }
  }

  // Get driver profile by ID (detailed with documents)
  async getProfileById(id: string): Promise<ApiResponse<DriverProfileDetail>> {
    try {
      return await BaseApiService.get<DriverProfileDetail>(`${this.basePath}/${id}/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch driver profile',
      };
    }
  }

  // Create driver profile
  async createProfile(data: DriverProfileRequest): Promise<ApiResponse<DriverProfile>> {
    try {
      const isFormData = !!(data.license_photo_front || data.license_photo_back || data.aadhar_photo);

      if (isFormData) {
        const formData = new FormData();

        // Add text fields
        formData.append('license_number', data.license_number);
        formData.append('license_expiry_date', data.license_expiry_date);
        formData.append('aadhar_number', data.aadhar_number);

        if (data.bio) formData.append('bio', data.bio);
        if (data.years_of_experience !== undefined) {
          formData.append('years_of_experience', data.years_of_experience.toString());
        }
        if (data.is_online !== undefined) {
          formData.append('is_online', data.is_online.toString());
        }
        if (data.current_status) formData.append('current_status', data.current_status);
        if (data.background_check_status) {
          formData.append('background_check_status', data.background_check_status);
        }
        if (data.current_location_lat) formData.append('current_location_lat', data.current_location_lat);
        if (data.current_location_long) formData.append('current_location_long', data.current_location_long);

        // Add file fields
        if (data.license_photo_front) {
          formData.append('license_photo_front', data.license_photo_front as any);
        }
        if (data.license_photo_back) {
          formData.append('license_photo_back', data.license_photo_back as any);
        }
        if (data.aadhar_photo) {
          formData.append('aadhar_photo', data.aadhar_photo as any);
        }

        return await BaseApiService.post<DriverProfile>(
          `${this.basePath}/`,
          formData,
          true,
          true
        );
      } else {
        return await BaseApiService.post<DriverProfile>(`${this.basePath}/`, data);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create driver profile',
      };
    }
  }

  // Update driver profile
  async updateProfile(id: string, data: Partial<DriverProfileRequest>): Promise<ApiResponse<DriverProfile>> {
    try {
      const isFormData = !!(data.license_photo_front || data.license_photo_back || data.aadhar_photo);

      if (isFormData) {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (value instanceof File || value instanceof Blob) {
              formData.append(key, value);
            } else if (typeof value === 'object' && !(value instanceof File) && !(value instanceof Blob)) {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value.toString());
            }
          }
        });

        return await BaseApiService.put<DriverProfile>(
          `${this.basePath}/${id}/`,
          formData,
          true,
          true
        );
      } else {
        return await BaseApiService.put<DriverProfile>(`${this.basePath}/${id}/`, data);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update driver profile',
      };
    }
  }

  // Partial update driver profile
  async patchProfile(id: string, data: Partial<DriverProfileRequest>): Promise<ApiResponse<DriverProfile>> {
    try {
      const isFormData = !!(data.license_photo_front || data.license_photo_back || data.aadhar_photo);

      if (isFormData) {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (value instanceof File || value instanceof Blob) {
              formData.append(key, value);
            } else if (typeof value === 'object' && !(value instanceof File) && !(value instanceof Blob)) {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value.toString());
            }
          }
        });

        return await BaseApiService.patch<DriverProfile>(
          `${this.basePath}/${id}/`,
          formData,
          true,
          true
        );
      } else {
        return await BaseApiService.patch<DriverProfile>(`${this.basePath}/${id}/`, data);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update driver profile',
      };
    }
  }

  // Delete driver profile
  async deleteProfile(id: string): Promise<ApiResponse<void>> {
    try {
      return await BaseApiService.delete<void>(`${this.basePath}/${id}/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete driver profile',
      };
    }
  }

  // Get driver documents
  async getDocuments(): Promise<ApiResponse<DriverDocument[]>> {
    try {
      const response = await BaseApiService.get<any>(`${this.basePath}/documents/`);
      // API might return array directly or nested in data property
      if (response.success && response.data) {
        const documents = Array.isArray(response.data)
          ? response.data
          : (response.data.documents || []);
        return {
          success: true,
          data: documents,
        };
      }
      return response as ApiResponse<DriverDocument[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch documents',
      };
    }
  }

  // Upload document
  async uploadDocument(data: DriverDocumentRequest): Promise<ApiResponse<DriverProfile>> {
    try {
      const formData = new FormData();

      formData.append('document_type', data.document_type);

      // Handle React Native file objects (with uri, name, type)
      const docFile = data.document_file as any;
      if (docFile.uri) {
        formData.append('document_file', docFile as any);
      } else {
        formData.append('document_file', data.document_file as any);
      }

      if (data.document_number) formData.append('document_number', data.document_number);
      if (data.issue_date) formData.append('issue_date', data.issue_date);
      if (data.expiry_date) formData.append('expiry_date', data.expiry_date);
      if (data.verification_status) formData.append('verification_status', data.verification_status);
      if (data.rejection_reason) formData.append('rejection_reason', data.rejection_reason);

      return await BaseApiService.post<DriverProfile>(
        `${this.basePath}/documents/upload/`,
        formData,
        true,
        true
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload document',
      };
    }
  }

  // Update location
  async updateLocation(data: UpdateLocationRequest): Promise<ApiResponse<DriverProfile>> {
    try {
      return await BaseApiService.post<DriverProfile>(
        `${this.basePath}/location/`,
        {
          latitude: data.latitude,
          longitude: data.longitude,
        }
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update location',
      };
    }
  }

  // Update online status
  async updateStatus(data: UpdateStatusRequest): Promise<ApiResponse<DriverProfile>> {
    try {
      return await BaseApiService.post<DriverProfile>(
        `${this.basePath}/status/`,
        {
          is_online: data.is_online,
          latitude: data.latitude,
          longitude: data.longitude,
        }
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update status',
      };
    }
  }

  // =========================================================================
  // EARNINGS API METHODS - Based on API Contract v1.0.0
  // =========================================================================

  /**
   * Get Driver Earnings Summary
   * GET /api/v1/drivers/earnings/
   *
   * Quick overview of driver's earnings across different time periods.
   */
  async getEarningsSummary(): Promise<ApiResponse<DriverEarningsSummary>> {
    try {
      return await BaseApiService.get<DriverEarningsSummary>(`${this.basePath}/earnings/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch earnings summary',
      };
    }
  }

  /**
   * Get Daily Earnings Breakdown
   * GET /api/v1/earnings/driver/daily/
   *
   * Detailed daily breakdown of earnings with date, trips completed, and amounts.
   *
   * @param params - Optional query parameters (days, start_date, end_date)
   */
  async getDailyEarnings(params?: DailyEarningsParams): Promise<ApiResponse<DailyEarningsResponse>> {
    try {
      const queryParams: Record<string, string> = {};

      if (params?.days) {
        queryParams.days = params.days.toString();
      }
      if (params?.start_date) {
        queryParams.start_date = params.start_date;
      }
      if (params?.end_date) {
        queryParams.end_date = params.end_date;
      }

      const hasParams = Object.keys(queryParams).length > 0;
      return await BaseApiService.get<DailyEarningsResponse>(
        '/earnings/driver/daily/',
        hasParams ? queryParams : undefined
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch daily earnings',
      };
    }
  }

  /**
   * Get Bonuses and Incentives
   * GET /api/v1/earnings/driver/bonuses/
   *
   * Get summary and list of all bonuses and tips received by the driver.
   *
   * @param params - Optional query parameters (type, status)
   */
  async getBonusesIncentives(params?: BonusesParams): Promise<ApiResponse<BonusesIncentivesResponse>> {
    try {
      const queryParams: Record<string, string> = {};

      if (params?.type && params.type !== 'all') {
        queryParams.type = params.type;
      }
      if (params?.status && params.status !== 'all') {
        queryParams.status = params.status;
      }

      const hasParams = Object.keys(queryParams).length > 0;
      return await BaseApiService.get<BonusesIncentivesResponse>(
        '/earnings/driver/bonuses/',
        hasParams ? queryParams : undefined
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch bonuses and incentives',
      };
    }
  }

  // =========================================================================
  // STATS API METHODS - Based on API Contract v1.0.0
  // =========================================================================

  /**
   * Get Driver Statistics
   * GET /api/v1/drivers/stats/
   *
   * Comprehensive statistics including trips, earnings, ratings,
   * completion rate, distance, and streaks.
   */
  async getStats(): Promise<ApiResponse<DriverStats>> {
    try {
      return await BaseApiService.get<DriverStats>(`${this.basePath}/stats/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch driver stats',
      };
    }
  }

  // =========================================================================
  // LEGACY METHODS (Deprecated - Use new methods above)
  // =========================================================================

  /**
   * @deprecated Use getEarningsSummary() instead
   */
  async getEarnings(): Promise<ApiResponse<DriverProfile>> {
    return this.getEarningsSummary() as any;
  }
}

// Legacy type exports for backward compatibility
export interface DriverDailyEarning {
  date: string;
  trips: number;
  earnings: string;
  trips_completed?: number;
  total_earnings?: string;
}

export interface DriverBonus {
  id: string;
  title: string;
  description: string;
  amount: number;
  earnedAt: string;
}

export default new DriverApiService();
