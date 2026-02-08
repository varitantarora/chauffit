import BaseApiService, { ApiResponse } from './BaseApiService';

// Types based on API YAML schema
export interface BikerProfile {
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
  license_photo?: string;
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
  total_tasks: number;
  created_at: string;
  updated_at: string;
}

export interface BikerProfileDetail extends BikerProfile {
  vehicles: BikerVehicle[];
  documents: BikerDocument[];
}

export interface BikerDocument {
  id: string;
  biker: string;
  biker_name: string;
  document_type: 'police_verification' | 'address_proof' | 'passport' | 'other';
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

export interface BikerVehicle {
  id: string;
  biker: string;
  biker_name: string;
  vehicle_type: 'motorcycle' | 'scooter';
  brand: 'honda' | 'bajaj' | 'tvs' | 'hero' | 'royal_enfield' | 'yamaha' | 'suzuki' | 'other';
  model_name: string;
  registration_number: string;
  registration_expiry: string;
  vehicle_color: string;
  rc_book_photo: string;
  insurance_photo: string;
  puc_certificate?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface BikerProfileRequest {
  license_number: string;
  license_expiry_date: string;
  license_photo?: any; // File/Blob for multipart
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

export interface BikerVehicleRequest {
  vehicle_type: 'motorcycle' | 'scooter';
  brand: 'honda' | 'bajaj' | 'tvs' | 'hero' | 'royal_enfield' | 'yamaha' | 'suzuki' | 'other';
  model_name: string;
  registration_number: string;
  registration_expiry: string;
  vehicle_color: string;
  rc_book_photo: any; // File/Blob
  insurance_photo: any; // File/Blob
  puc_certificate?: any; // File/Blob
}

export interface BikerDocumentRequest {
  document_type: 'police_verification' | 'address_proof' | 'passport' | 'other';
  document_number?: string;
  document_file: any; // File/Blob
  issue_date?: string;
  expiry_date?: string;
  verification_status?: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
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

class BikerApiService {
  private basePath = '/bikers';

  // Get current biker's profile
  async getProfile(): Promise<ApiResponse<BikerProfile>> {
    try {
      return await BaseApiService.get<BikerProfile>(`${this.basePath}/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch biker profile',
      };
    }
  }

  // Get biker profile by ID (detailed with vehicles and documents)
  async getProfileById(id: string): Promise<ApiResponse<BikerProfileDetail>> {
    try {
      return await BaseApiService.get<BikerProfileDetail>(`${this.basePath}/${id}/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch biker profile',
      };
    }
  }

  // Create biker profile
  async createProfile(data: BikerProfileRequest): Promise<ApiResponse<BikerProfile>> {
    try {
      const isFormData = !!(data.license_photo || data.aadhar_photo);
      
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
        if (data.license_photo) {
          formData.append('license_photo', data.license_photo as any);
        }
        if (data.aadhar_photo) {
          formData.append('aadhar_photo', data.aadhar_photo as any);
        }

        return await BaseApiService.post<BikerProfile>(
          `${this.basePath}/`,
          formData,
          true,
          true
        );
      } else {
        return await BaseApiService.post<BikerProfile>(`${this.basePath}/`, data);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create biker profile',
      };
    }
  }

  // Update biker profile
  async updateProfile(id: string, data: Partial<BikerProfileRequest>): Promise<ApiResponse<BikerProfile>> {
    try {
      const isFormData = !!(data.license_photo || data.aadhar_photo);
      
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

        return await BaseApiService.put<BikerProfile>(
          `${this.basePath}/${id}/`,
          formData,
          true,
          true
        );
      } else {
        return await BaseApiService.put<BikerProfile>(`${this.basePath}/${id}/`, data);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update biker profile',
      };
    }
  }

  // Partial update biker profile
  async patchProfile(id: string, data: Partial<BikerProfileRequest>): Promise<ApiResponse<BikerProfile>> {
    try {
      const isFormData = !!(data.license_photo || data.aadhar_photo);
      
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

        return await BaseApiService.patch<BikerProfile>(
          `${this.basePath}/${id}/`,
          formData,
          true,
          true
        );
      } else {
        return await BaseApiService.patch<BikerProfile>(`${this.basePath}/${id}/`, data);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update biker profile',
      };
    }
  }

  // Delete biker profile
  async deleteProfile(id: string): Promise<ApiResponse<void>> {
    try {
      return await BaseApiService.delete<void>(`${this.basePath}/${id}/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete biker profile',
      };
    }
  }

  // Get biker documents
  async getDocuments(): Promise<ApiResponse<BikerDocument[]>> {
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
      return response as ApiResponse<BikerDocument[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch documents',
      };
    }
  }

  // Upload document (POST /bikers/documents/upload/)
  async uploadDocument(data: BikerDocumentRequest): Promise<ApiResponse<BikerDocument>> {
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

      const response = await BaseApiService.post<any>(
        `${this.basePath}/documents/upload/`,
        formData,
        true,
        true
      );
      
      // Backend returns { success: true, data: BikerDocument }
      if (response.success && response.data) {
        // Handle nested data structure
        const document = response.data.data || response.data;
        return {
          success: true,
          data: document,
        };
      }
      
      return response as ApiResponse<BikerDocument>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload document',
      };
    }
  }

  // Get earnings
  async getEarnings(): Promise<ApiResponse<BikerProfile>> {
    try {
      return await BaseApiService.get<BikerProfile>(`${this.basePath}/earnings/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch earnings',
      };
    }
  }

  // Get vehicles
  async getVehicles(): Promise<ApiResponse<BikerVehicle[]>> {
    try {
      const response = await BaseApiService.get<any>(`${this.basePath}/vehicles/`);
      // API might return array directly or nested in data property
      if (response.success && response.data) {
        const vehicles = Array.isArray(response.data) 
          ? response.data 
          : (response.data.vehicles || []);
        return {
          success: true,
          data: vehicles,
        };
      }
      return response as ApiResponse<BikerVehicle[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch vehicles',
      };
    }
  }

  // Add vehicle (POST /bikers/vehicles/)
  async addVehicle(data: BikerVehicleRequest): Promise<ApiResponse<BikerVehicle>> {
    try {
      const formData = new FormData();
      
      formData.append('vehicle_type', data.vehicle_type);
      formData.append('brand', data.brand);
      formData.append('model_name', data.model_name);
      formData.append('registration_number', data.registration_number);
      formData.append('registration_expiry', data.registration_expiry);
      formData.append('vehicle_color', data.vehicle_color);
      
      // Handle React Native file objects (with uri, name, type)
      if (data.rc_book_photo) {
        const rcPhoto = data.rc_book_photo as any;
        if (rcPhoto.uri) {
          formData.append('rc_book_photo', rcPhoto as any);
        } else {
          formData.append('rc_book_photo', data.rc_book_photo as any);
        }
      }
      
      if (data.insurance_photo) {
        const insurancePhoto = data.insurance_photo as any;
        if (insurancePhoto.uri) {
          formData.append('insurance_photo', insurancePhoto as any);
        } else {
          formData.append('insurance_photo', data.insurance_photo as any);
        }
      }
      
      if (data.puc_certificate) {
        const pucCert = data.puc_certificate as any;
        if (pucCert.uri) {
          formData.append('puc_certificate', pucCert as any);
        } else {
          formData.append('puc_certificate', data.puc_certificate as any);
        }
      }

      return await BaseApiService.post<BikerVehicle>(
        `${this.basePath}/vehicles/`,
        formData,
        true,
        true
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add vehicle',
      };
    }
  }

  // Update vehicle
  async updateVehicle(vehicleId: string, data: Partial<BikerVehicleRequest>): Promise<ApiResponse<BikerProfile>> {
    try {
      const isFormData = !!(data.rc_book_photo || data.insurance_photo || data.puc_certificate);
      
      if (isFormData) {
        const formData = new FormData();
        
        if (data.vehicle_type) formData.append('vehicle_type', data.vehicle_type);
        if (data.brand) formData.append('brand', data.brand);
        if (data.model_name) formData.append('model_name', data.model_name);
        if (data.registration_number) formData.append('registration_number', data.registration_number);
        if (data.registration_expiry) formData.append('registration_expiry', data.registration_expiry);
        if (data.vehicle_color) formData.append('vehicle_color', data.vehicle_color);
        if (data.rc_book_photo) formData.append('rc_book_photo', data.rc_book_photo as any);
        if (data.insurance_photo) formData.append('insurance_photo', data.insurance_photo as any);
        if (data.puc_certificate) formData.append('puc_certificate', data.puc_certificate as any);

        return await BaseApiService.put<BikerProfile>(
          `${this.basePath}/vehicles/${vehicleId}/`,
          formData,
          true,
          true
        );
      } else {
        return await BaseApiService.put<BikerProfile>(`${this.basePath}/vehicles/${vehicleId}/`, data);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update vehicle',
      };
    }
  }

  // Partial update vehicle
  async patchVehicle(vehicleId: string, data: Partial<BikerVehicleRequest>): Promise<ApiResponse<BikerProfile>> {
    try {
      const isFormData = !!(data.rc_book_photo || data.insurance_photo || data.puc_certificate);
      
      if (isFormData) {
        const formData = new FormData();
        
        if (data.vehicle_type) formData.append('vehicle_type', data.vehicle_type);
        if (data.brand) formData.append('brand', data.brand);
        if (data.model_name) formData.append('model_name', data.model_name);
        if (data.registration_number) formData.append('registration_number', data.registration_number);
        if (data.registration_expiry) formData.append('registration_expiry', data.registration_expiry);
        if (data.vehicle_color) formData.append('vehicle_color', data.vehicle_color);
        if (data.rc_book_photo) formData.append('rc_book_photo', data.rc_book_photo as any);
        if (data.insurance_photo) formData.append('insurance_photo', data.insurance_photo as any);
        if (data.puc_certificate) formData.append('puc_certificate', data.puc_certificate as any);

        return await BaseApiService.patch<BikerProfile>(
          `${this.basePath}/vehicles/${vehicleId}/`,
          formData,
          true,
          true
        );
      } else {
        return await BaseApiService.patch<BikerProfile>(`${this.basePath}/vehicles/${vehicleId}/`, data);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update vehicle',
      };
    }
  }

  // Delete vehicle
  async deleteVehicle(vehicleId: string): Promise<ApiResponse<void>> {
    try {
      return await BaseApiService.delete<void>(`${this.basePath}/vehicles/${vehicleId}/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete vehicle',
      };
    }
  }

  // Update location
  async updateLocation(data: UpdateLocationRequest): Promise<ApiResponse<BikerProfile>> {
    try {
      return await BaseApiService.post<BikerProfile>(
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
  async updateStatus(data: UpdateStatusRequest): Promise<ApiResponse<BikerProfile>> {
    try {
      return await BaseApiService.post<BikerProfile>(
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

  // Get biker stats
  async getStats(): Promise<ApiResponse<BikerStats>> {
    try {
      return await BaseApiService.get<BikerStats>(`${this.basePath}/stats/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch biker stats',
      };
    }
  }

  // Get daily earnings breakdown
  async getDailyEarnings(): Promise<ApiResponse<BikerDailyEarning[]>> {
    try {
      const response = await BaseApiService.get<any>(`/earnings/biker/daily/`);
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
      return response as ApiResponse<BikerDailyEarning[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch daily earnings',
      };
    }
  }

  // Get bonuses and incentives
  async getBonuses(): Promise<ApiResponse<BikerBonus[]>> {
    try {
      const response = await BaseApiService.get<any>(`/earnings/biker/bonuses/`);
      // API might return array directly or nested in data property
      if (response.success && response.data) {
        const bonuses = Array.isArray(response.data) 
          ? response.data 
          : (response.data.results || response.data.bonuses || []);
        return {
          success: true,
          data: bonuses,
        };
      }
      return response as ApiResponse<BikerBonus[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch bonuses',
      };
    }
  }
}

export interface BikerStatsPeriod {
  pickups: number;
  earned: string;
  average_rating: number;
  rating_count: number;
  completion_rate: number;
  distance_covered_km: number;
}

export interface BikerStats {
  lifetime: BikerStatsPeriod;
  today: BikerStatsPeriod;
  week: BikerStatsPeriod;
  month: BikerStatsPeriod;
  current_streak: {
    days: number;
  };
}

export interface BikerDailyEarning {
  date: string; // ISO date string
  pickups: number; // or pickups_completed
  earnings: string; // or total_earnings
  pickups_completed?: number;
  total_earnings?: string;
}

export interface BikerBonus {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  amount?: string | number;
  reward?: string | number;
  bonus_type?: string;
  bonus_amount?: string | number;
  earned_at?: string;
  created_at?: string;
  date?: string;
}

export default new BikerApiService();
