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

  // Get earnings
  async getEarnings(): Promise<ApiResponse<DriverProfile>> {
    try {
      return await BaseApiService.get<DriverProfile>(`${this.basePath}/earnings/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch earnings',
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

  // Get driver stats
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

  // Get daily earnings breakdown (GET /earnings/driver/daily/)
  async getDailyEarnings(): Promise<ApiResponse<DriverDailyEarning[]>> {
    try {
      const response = await BaseApiService.get<any>(`/earnings/driver/daily/`);
      // API might return array directly or nested in data property
      if (response.success && response.data) {
        const dailyEarnings = Array.isArray(response.data) 
          ? response.data 
          : (response.data.results || response.data.daily || []);
        return {
          success: true,
          data: dailyEarnings,
        };
      }
      return response as ApiResponse<DriverDailyEarning[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch daily earnings',
      };
    }
  }

  // Get bonuses and incentives (GET /earnings/driver/bonuses/)
  async getBonuses(): Promise<ApiResponse<DriverBonus[]>> {
    try {
      const response = await BaseApiService.get<any>(`/earnings/driver/bonuses/`);
      // API might return array directly or nested in data property
      if (response.success && response.data) {
        const bonuses = Array.isArray(response.data) 
          ? response.data 
          : (response.data.results || response.data.bonuses || []);
        
        const mappedBonuses: DriverBonus[] = bonuses.map((item: any) => ({
          id: item.id || item.bonus_id || Math.random().toString(),
          title: item.title || item.name || item.bonus_type || 'Bonus',
          description: item.description || item.details || '',
          amount: parseFloat(item.amount || item.reward || item.bonus_amount || '0'),
          earnedAt: item.earned_at || item.date || item.created_at || new Date().toISOString(),
        }));
        return {
          success: true,
          data: mappedBonuses,
        };
      }
      return response as ApiResponse<DriverBonus[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch driver bonuses',
      };
    }
  }
}

export interface DriverStatsPeriod {
  pickups: number;
  earned: string;
  average_rating: number;
  rating_count: number;
  completion_rate: number;
  distance_covered_km: number;
}

export interface DriverStats {
  lifetime: DriverStatsPeriod;
  today: DriverStatsPeriod;
  week: DriverStatsPeriod;
  month: DriverStatsPeriod;
  current_streak: {
    days: number;
  };
}

export interface DriverDailyEarning {
  date: string; // ISO date string
  trips: number; // or trips_completed
  earnings: string; // or total_earnings
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
