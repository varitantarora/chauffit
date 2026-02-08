import BaseApiService, { ApiResponse } from './BaseApiService';

// Types based on API YAML schema and backend views
export interface User {
  id: string;
  email: string;
  phone_number: string;
  phone_verified: boolean;
  first_name: string;
  last_name: string;
  full_name: string;
  profile_picture?: string;
  date_of_birth?: string;
  language?: string;
  user_type: 'customer' | 'driver' | 'biker';
  is_verified: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface RegistrationRequest {
  email: string;
  phone_number: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type: 'customer' | 'driver' | 'biker';
  date_of_birth?: string;
}

export interface RegistrationResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
}

export interface LogoutRequest {
  refresh: string;
}

export interface SendOTPRequest {
  phone_number: string;
  otp_type?: 'phone_verification' | 'password_reset' | 'login';
}

export interface SendOTPResponse {
  expires_in: number; // in seconds
}

export interface VerifyOTPRequest {
  phone_number: string;
  otp: string;
  otp_type?: 'phone_verification' | 'password_reset' | 'login';
}

export interface VerifyOTPResponse {
  user?: User;
  tokens?: {
    access: string;
    refresh: string;
  };
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

export interface UserRequest {
  first_name?: string;
  last_name?: string;
  profile_picture?: any; // File/Blob for multipart
  date_of_birth?: string;
  language?: string;
}

class AuthApiService {
  private basePath = '/auth';

  // Register a new user
  async register(data: RegistrationRequest): Promise<ApiResponse<RegistrationResponse>> {
    try {
      const response = await BaseApiService.post<{
        success: boolean;
        message: string;
        data: RegistrationResponse;
      }>(`${this.basePath}/register/`, data, false);

      if (response.success && response.data) {
        // Backend returns { success: true, message: '...', data: {...} }
        // BaseApiService wraps it as { success: true, data: { success: true, message: '...', data: {...} } }
        const serverResponse = response.data as any;
        
        // Store tokens automatically
        if (serverResponse.data?.tokens) {
          await BaseApiService.setTokens(
            serverResponse.data.tokens.access,
            serverResponse.data.tokens.refresh
          );
        }

        return {
          success: true,
          data: serverResponse.data,
          message: serverResponse.message,
        };
      }

      return {
        success: false,
        error: response.error || 'Registration failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register',
      };
    }
  }

  // Login user
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await BaseApiService.post<{
        success: boolean;
        message: string;
        data: LoginResponse;
      }>(`${this.basePath}/login/`, data, false);

      if (response.success && response.data) {
        // Backend returns { success: true, message: '...', data: {...} }
        // BaseApiService wraps it as { success: true, data: { success: true, message: '...', data: {...} } }
        const serverResponse = response.data as any;
        
        // Store tokens automatically
        if (serverResponse.data?.tokens) {
          await BaseApiService.setTokens(
            serverResponse.data.tokens.access,
            serverResponse.data.tokens.refresh
          );
        }

        return {
          success: true,
          data: serverResponse.data,
          message: serverResponse.message,
        };
      }

      return {
        success: false,
        error: response.error || 'Login failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to login',
      };
    }
  }

  // Logout user
  async logout(data: LogoutRequest): Promise<ApiResponse<void>> {
    try {
      const response = await BaseApiService.post<{
        success: boolean;
        message: string;
      }>(`${this.basePath}/logout/`, data, true);

      if (response.success) {
        // Clear tokens
        await BaseApiService.clearTokens();
        const serverResponse = response.data as any;
        return {
          success: true,
          message: serverResponse?.message || 'Logout successful',
        };
      }

      return {
        success: false,
        error: response.error || 'Logout failed',
      };
    } catch (error) {
      // Clear tokens even on error
      await BaseApiService.clearTokens();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to logout',
      };
    }
  }

  // Refresh access token
  async refreshToken(data: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> {
    try {
      const response = await BaseApiService.post<{
        success: boolean;
        data: RefreshTokenResponse;
      }>(`${this.basePath}/refresh/`, data, false);

      if (response.success && response.data) {
        // Backend returns { success: true, data: { access: '...' } }
        // BaseApiService wraps it as { success: true, data: { success: true, data: { access: '...' } } }
        const serverResponse = response.data as any;
        
        // Update access token (keep the same refresh token)
        const refreshToken = data.refresh;
        if (serverResponse.data?.access) {
          await BaseApiService.setTokens(
            serverResponse.data.access,
            refreshToken
          );
        }

        return {
          success: true,
          data: serverResponse.data,
        };
      }

      return {
        success: false,
        error: response.error || 'Token refresh failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refresh token',
      };
    }
  }

  // Send OTP
  async sendOTP(data: SendOTPRequest): Promise<ApiResponse<SendOTPResponse>> {
    try {
      const response = await BaseApiService.post<{
        success: boolean;
        message: string;
        data: SendOTPResponse;
      }>(`${this.basePath}/send-otp/`, {
        phone_number: data.phone_number,
        otp_type: data.otp_type || 'phone_verification',
      }, false);

      if (response.success && response.data) {
        // Backend returns { success: true, message: '...', data: {...} }
        const serverResponse = response.data as any;
        return {
          success: true,
          data: serverResponse.data,
          message: serverResponse.message,
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to send OTP',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send OTP',
      };
    }
  }

  // Verify OTP
  async verifyOTP(data: VerifyOTPRequest): Promise<ApiResponse<VerifyOTPResponse>> {
    try {
      const response = await BaseApiService.post<any>(`${this.basePath}/otp-login/verify/`, {
        phone_number: data.phone_number,
        otp: data.otp,
        otp_type: data.otp_type || 'phone_verification',
      }, false);

      if (response.success) {
        const serverResponse = response.data as any;
        
        // Handle different response formats
        let tokens = serverResponse?.tokens || serverResponse?.data?.tokens;
        let user = serverResponse?.user || serverResponse?.data?.user;
        
        // If tokens exist, store them
        if (tokens) {
          await BaseApiService.setTokens(
            tokens.access,
            tokens.refresh
          );
        }
        
        return {
          success: true,
          data: {
            user: user,
            tokens: tokens,
          },
          message: serverResponse?.message || 'OTP verified successfully',
        };
      }

      return {
        success: false,
        error: response.error || 'OTP verification failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify OTP',
      };
    }
  }

  // Get user profile
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      return await BaseApiService.get<User>(`${this.basePath}/profile/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
      };
    }
  }

  // Update user profile
  async updateProfile(data: UserRequest): Promise<ApiResponse<User>> {
    try {
      const isFormData = !!data.profile_picture;

      if (isFormData) {
        const formData = new FormData();
        
        if (data.first_name) formData.append('first_name', data.first_name);
        if (data.last_name) formData.append('last_name', data.last_name);
        if (data.date_of_birth) formData.append('date_of_birth', data.date_of_birth);
        if (data.language) formData.append('language', data.language);
        if (data.profile_picture) {
          formData.append('profile_picture', data.profile_picture as any);
        }

        return await BaseApiService.put<User>(
          `${this.basePath}/profile/`,
          formData,
          true,
          true
        );
      } else {
        return await BaseApiService.put<User>(`${this.basePath}/profile/`, data);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  }

  // Partial update user profile
  async patchProfile(data: Partial<UserRequest>): Promise<ApiResponse<User>> {
    try {
      const isFormData = !!data.profile_picture;

      if (isFormData) {
        const formData = new FormData();
        
        if (data.first_name) formData.append('first_name', data.first_name);
        if (data.last_name) formData.append('last_name', data.last_name);
        if (data.date_of_birth) formData.append('date_of_birth', data.date_of_birth);
        if (data.language) formData.append('language', data.language);
        if (data.profile_picture) {
          formData.append('profile_picture', data.profile_picture as any);
        }

        return await BaseApiService.patch<User>(
          `${this.basePath}/profile/`,
          formData,
          true,
          true
        );
      } else {
        return await BaseApiService.patch<User>(`${this.basePath}/profile/`, data);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  }

  // Change password
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
    try {
      const response = await BaseApiService.post<{
        success: boolean;
        message: string;
      }>(`${this.basePath}/change-password/`, data, true);

      if (response.success) {
        const serverResponse = response.data as any;
        return {
          success: true,
          message: serverResponse?.message || 'Password changed successfully',
        };
      }

      return {
        success: false,
        error: response.error || 'Password change failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to change password',
      };
    }
  }
}

export default new AuthApiService();
