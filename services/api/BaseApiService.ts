import AsyncStorage from '@react-native-async-storage/async-storage';
import { appConfig, getApiUrl } from '../../config/env';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

class BaseApiService {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.baseUrl = appConfig.apiBaseUrl;
    this.loadTokens();
  }

  // Token Management
  private async loadTokens() {
    try {
      this.accessToken = await AsyncStorage.getItem('access_token');
      this.refreshToken = await AsyncStorage.getItem('refresh_token');
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
  }

  async setTokens(accessToken: string, refreshToken: string) {
    try {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      await AsyncStorage.setItem('access_token', accessToken);
      await AsyncStorage.setItem('refresh_token', refreshToken);
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  }

  async clearTokens() {
    try {
      this.accessToken = null;
      this.refreshToken = null;
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Store request info for response logging
  private requestTimings: Map<string, number> = new Map();

  // Logging utility
  private logApiRequest(
    method: string,
    url: string,
    headers: HeadersInit,
    body?: any,
    isFormData: boolean = false
  ): string {
    const timestamp = new Date().toISOString();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    
    // Store start time for response timing
    this.requestTimings.set(requestId, startTime);
    
    // Sanitize headers (hide full token)
    const sanitizedHeaders: Record<string, string> = {};
    Object.entries(headers).forEach(([key, value]) => {
      if (key.toLowerCase() === 'authorization') {
        const token = value as string;
        if (token.startsWith('Bearer ')) {
          const tokenValue = token.substring(7);
          sanitizedHeaders[key] = `Bearer ${tokenValue.substring(0, 10)}...${tokenValue.substring(tokenValue.length - 4)}`;
        } else {
          sanitizedHeaders[key] = 'Bearer ***';
        }
      } else {
        sanitizedHeaders[key] = value as string;
      }
    });

    // Prepare body info
    let bodyInfo: string | object = 'No body';
    if (body) {
      if (isFormData && body instanceof FormData) {
        // For FormData, just show that it's FormData
        bodyInfo = '[FormData]';
      } else if (typeof body === 'string') {
        try {
          // Try to parse and sanitize JSON
          const parsed = JSON.parse(body);
          bodyInfo = this.sanitizeRequestBody(parsed);
        } catch {
          // If not JSON, show truncated string
          bodyInfo = body.length > 200 ? `${body.substring(0, 200)}...` : body;
        }
      } else {
        bodyInfo = this.sanitizeRequestBody(body);
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📡 API Request [${requestId}]`);
    console.log(`⏰ Timestamp: ${timestamp}`);
    console.log(`🔹 Method: ${method}`);
    console.log(`🔗 URL: ${url}`);
    console.log(`📋 Headers:`, sanitizedHeaders);
    console.log(`📦 Body:`, bodyInfo);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return requestId;
  }

  // Log API Response
  private logApiResponse(
    requestId: string,
    url: string,
    response: Response,
    responseData?: any,
    error?: string
  ): void {
    const timestamp = new Date().toISOString();
    const startTime = this.requestTimings.get(requestId);
    const duration = startTime ? `${Date.now() - startTime}ms` : 'N/A';
    
    // Remove timing after logging
    if (startTime) {
      this.requestTimings.delete(requestId);
    }

    // Sanitize response headers
    const sanitizedHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'authorization' || key.toLowerCase().includes('token')) {
        sanitizedHeaders[key] = '***HIDDEN***';
      } else {
        sanitizedHeaders[key] = value;
      }
    });

    // Prepare response body info
    let bodyInfo: string | object = 'No body';
    if (responseData) {
      if (typeof responseData === 'string') {
        try {
          const parsed = JSON.parse(responseData);
          bodyInfo = this.sanitizeResponseBody(parsed);
        } catch {
          bodyInfo = responseData.length > 500 ? `${responseData.substring(0, 500)}...` : responseData;
        }
      } else {
        bodyInfo = this.sanitizeResponseBody(responseData);
      }
    }

    // Status indicator
    const statusEmoji = response.ok ? '✅' : '❌';
    const statusText = response.ok ? 'SUCCESS' : 'ERROR';

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📥 API Response [${requestId}] ${statusEmoji}`);
    console.log(`⏰ Timestamp: ${timestamp}`);
    console.log(`⏱️  Duration: ${duration}`);
    console.log(`🔗 URL: ${url}`);
    console.log(`📊 Status: ${response.status} ${response.statusText} (${statusText})`);
    console.log(`📋 Headers:`, sanitizedHeaders);
    if (error) {
      console.log(`❌ Error:`, error);
    }
    console.log(`📦 Body:`, bodyInfo);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  // Sanitize request body to hide sensitive information
  private sanitizeRequestBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveKeys = ['password', 'old_password', 'new_password', 'new_password_confirm', 'token', 'refresh', 'access'];
    const sanitized = Array.isArray(body) ? [...body] : { ...body };

    Object.keys(sanitized).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
        sanitized[key] = '***HIDDEN***';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeRequestBody(sanitized[key]);
      }
    });

    return sanitized;
  }

  // Sanitize response body to hide sensitive information
  private sanitizeResponseBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveKeys = ['password', 'old_password', 'new_password', 'new_password_confirm', 'token', 'refresh', 'access', 'access_token', 'refresh_token'];
    const sanitized = Array.isArray(body) ? [...body] : { ...body };

    Object.keys(sanitized).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
        sanitized[key] = '***HIDDEN***';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeResponseBody(sanitized[key]);
      }
    });

    return sanitized;
  }

  // Headers
  private getHeaders(includeAuth: boolean = true, contentType: string = 'application/json'): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': contentType,
    };

    if (includeAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  // Error Handling
  private handleError(error: any, response?: Response): ApiError {
    if (response) {
      return {
        message: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message || 'Network error occurred',
      };
    }

    return {
      message: 'An unexpected error occurred',
    };
  }

  // Parse Response
  private async parseResponse<T>(
    response: Response,
    requestId?: string,
    url?: string
  ): Promise<ApiResponse<T>> {
    try {
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        if (response.ok) {
          // Log response for non-JSON responses
          if (requestId && url) {
            this.logApiResponse(requestId, url, response, undefined);
          }
          return { success: true };
        }
        throw new Error(`Unexpected content type: ${contentType}`);
      }

      const data = await response.json();

      // Log response
      if (requestId && url) {
        if (!response.ok) {
          this.logApiResponse(requestId, url, response, data, data.errormessage || data.detail || data.error?.message || 'Request failed');
        } else {
          this.logApiResponse(requestId, url, response, data);
        }
      }

      if (!response.ok) {
        // If response already has error structure, return it directly
        if (data.success === false || data.error) {
          return {
            success: false,
            error: data.error?.message || data.errormessage || data.detail || 'Request failed',
            errors: data.error?.details || data.errors || data,
            message: data.message,
          };
        }
        return {
          success: false,
          error: data.errormessage || data.detail || 'Request failed',
          errors: data.errors || data,
        };
      }

      // If response already has success/data structure, return it directly
      if (data.success !== undefined && (data.data !== undefined || data.error !== undefined)) {
        return {
          success: data.success,
          data: data.data,
          error: data.error?.message || data.errormessage,
          errors: data.error?.details || data.errors,
          message: data.message,
        };
      }

      // Otherwise, wrap the response
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      // Log error response
      if (requestId && url) {
        this.logApiResponse(requestId, url, response, undefined, error instanceof Error ? error.message : 'Failed to parse response');
      }
      return {
        success: false,
        error: 'Failed to parse response',
      };
    }
  }

  // Refresh Token
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const url = getApiUrl('/auth/refresh/');
      const headers = this.getHeaders(false);
      
      // Log request
      const requestId = this.logApiRequest('POST', url, headers, { refresh: '***HIDDEN***' });
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ refresh: this.refreshToken }), // Use actual token in request
      });

      const result = await this.parseResponse<{ refresh: string; access?: string }>(response, requestId, url);
      
      if (result.success && result.data) {
        // Update access token if provided in response
        if (result.data.access) {
          this.accessToken = result.data.access;
          await AsyncStorage.setItem('access_token', result.data.access);
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Request with retry on 401
  private async requestWithAuth<T>(
    url: string,
    options: RequestInit,
    retry: boolean = true,
    requestId?: string
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, options);

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && retry) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry request with new token
          const newOptions = {
            ...options,
            headers: {
              ...this.getHeaders(true),
              ...(options.headers as HeadersInit),
            },
          };
          return this.requestWithAuth<T>(url, newOptions, false, requestId);
        } else {
          // Refresh failed, clear tokens
          await this.clearTokens();
          if (requestId) {
            // Log error without creating Response object
            console.error(`📥 API Response [${requestId}] ❌`);
            console.error(`❌ Network Error: Session expired. Please login again.`);
            console.error(`📊 URL: ${url}`);
          }
          return {
            success: false,
            error: 'Session expired. Please login again.',
          };
        }
      }

      return await this.parseResponse<T>(response, requestId, url);
    } catch (error) {
      const errorMessage = this.handleError(error).message;
      if (requestId) {
        // Log error without creating invalid Response object
        console.error(`📥 API Response [${requestId}] ❌`);
        console.error(`❌ Network Error: ${errorMessage}`);
        console.error(`📊 URL: ${url}`);
      }
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // GET Request
  async get<T>(
    endpoint: string,
    params?: Record<string, string>,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = getApiUrl(endpoint, params);
    const headers = this.getHeaders(includeAuth);
    
    // Log request
    const requestId = this.logApiRequest('GET', url, headers);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      return await this.parseResponse<T>(response, requestId, url);
    } catch (error) {
      // Log error without creating invalid Response object
      const errorMessage = this.handleError(error).message;
      if (requestId) {
        console.error(`📥 API Response [${requestId}] ❌`);
        console.error(`❌ Network Error: ${errorMessage}`);
        console.error(`📊 URL: ${url}`);
      }
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // POST Request
  async post<T>(
    endpoint: string,
    data?: any,
    includeAuth: boolean = true,
    isFormData: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = getApiUrl(endpoint);
    
    // For FormData, don't set Content-Type header (browser will set it with boundary)
    const headers = isFormData 
      ? (includeAuth && this.accessToken 
          ? { 'Authorization': `Bearer ${this.accessToken}` } 
          : {})
      : this.getHeaders(includeAuth);
    
    const body = isFormData ? data : (data ? JSON.stringify(data) : undefined);
    
    // Log request
    const requestId = this.logApiRequest('POST', url, headers, body, isFormData);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
      });

      return await this.parseResponse<T>(response, requestId, url);
    } catch (error) {
      // Log error without creating invalid Response object
      const errorMessage = this.handleError(error).message;
      if (requestId) {
        console.error(`📥 API Response [${requestId}] ❌`);
        console.error(`❌ Network Error: ${errorMessage}`);
        console.error(`📊 URL: ${url}`);
      }
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // PUT Request
  async put<T>(
    endpoint: string,
    data?: any,
    includeAuth: boolean = true,
    isFormData: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = getApiUrl(endpoint);
    
    const headers = isFormData 
      ? (includeAuth && this.accessToken 
          ? { 'Authorization': `Bearer ${this.accessToken}` } 
          : {})
      : this.getHeaders(includeAuth);
    
    const body = isFormData ? data : (data ? JSON.stringify(data) : undefined);

    // Log request
    const requestId = this.logApiRequest('PUT', url, headers, body, isFormData);

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body,
      });

      return await this.parseResponse<T>(response, requestId, url);
    } catch (error) {
      // Log error without creating invalid Response object
      const errorMessage = this.handleError(error).message;
      if (requestId) {
        console.error(`📥 API Response [${requestId}] ❌`);
        console.error(`❌ Network Error: ${errorMessage}`);
        console.error(`📊 URL: ${url}`);
      }
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // PATCH Request
  async patch<T>(
    endpoint: string,
    data?: any,
    includeAuth: boolean = true,
    isFormData: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = getApiUrl(endpoint);
    
    const headers = isFormData 
      ? (includeAuth && this.accessToken 
          ? { 'Authorization': `Bearer ${this.accessToken}` } 
          : {})
      : this.getHeaders(includeAuth);
    
    const body = isFormData ? data : (data ? JSON.stringify(data) : undefined);

    // Log request
    const requestId = this.logApiRequest('PATCH', url, headers, body, isFormData);

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body,
      });

      return await this.parseResponse<T>(response, requestId, url);
    } catch (error) {
      // Log error without creating invalid Response object
      const errorMessage = this.handleError(error).message;
      if (requestId) {
        console.error(`📥 API Response [${requestId}] ❌`);
        console.error(`❌ Network Error: ${errorMessage}`);
        console.error(`📊 URL: ${url}`);
      }
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // DELETE Request
  async delete<T>(
    endpoint: string,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = getApiUrl(endpoint);
    const headers = this.getHeaders(includeAuth);

    // Log request
    const requestId = this.logApiRequest('DELETE', url, headers);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      return await this.parseResponse<T>(response, requestId, url);
    } catch (error) {
      // Log error without creating invalid Response object
      const errorMessage = this.handleError(error).message;
      if (requestId) {
        console.error(`📥 API Response [${requestId}] ❌`);
        console.error(`❌ Network Error: ${errorMessage}`);
        console.error(`📊 URL: ${url}`);
      }
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

export default new BaseApiService();
