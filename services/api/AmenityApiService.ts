import BaseApiService, { ApiResponse } from './BaseApiService';

// ============================================================================
// AMENITY TYPES
// ============================================================================

export type AmenityCategory = 'refreshment' | 'comfort' | 'premium';

export type BookingAmenityStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export interface Amenity {
  id: string;
  name: string;
  description: string;
  category: AmenityCategory;
  price: string;
  available_segments: string[];
  image_url: string | null;
}

export interface BookingAmenity {
  id: string;
  amenity: Amenity;
  quantity: number;
  unit_price: string;
  total_price: string;
  status: BookingAmenityStatus;
  created_at: string;
}

export interface AddAmenityRequest {
  amenity: string;
  quantity?: number;
}

// ============================================================================
// AMENITY API SERVICE
// ============================================================================

class AmenityApiService {
  private basePath = '/amenities';

  /**
   * List All Amenities
   * GET /api/v1/amenities/
   */
  async listAmenities(): Promise<ApiResponse<Amenity[]>> {
    try {
      const response = await BaseApiService.get<Amenity[]>(`${this.basePath}/`);

      if (response.success && response.data) {
        const amenities = Array.isArray(response.data)
          ? response.data
          : (response.data as any).results || [];
        return { success: true, data: amenities };
      }

      return response as ApiResponse<Amenity[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch amenities',
      };
    }
  }

  /**
   * Get Single Amenity
   * GET /api/v1/amenities/{amenity_id}/
   */
  async getAmenity(amenityId: string): Promise<ApiResponse<Amenity>> {
    try {
      return await BaseApiService.get<Amenity>(`${this.basePath}/${amenityId}/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch amenity details',
      };
    }
  }

  /**
   * Add Amenity to Booking
   * POST /api/v1/rides/{booking_id}/amenities/add/
   */
  async addAmenityToBooking(
    bookingId: string,
    amenityId: string,
    quantity: number = 1
  ): Promise<ApiResponse<BookingAmenity>> {
    try {
      return await BaseApiService.post<BookingAmenity>(
        `/rides/${bookingId}/amenities/add/`,
        { amenity: amenityId, quantity }
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add amenity to booking',
      };
    }
  }

  /**
   * List Booking Amenities
   * GET /api/v1/rides/{booking_id}/amenities/
   */
  async listBookingAmenities(bookingId: string): Promise<ApiResponse<BookingAmenity[]>> {
    try {
      const response = await BaseApiService.get<BookingAmenity[]>(
        `/rides/${bookingId}/amenities/`
      );

      if (response.success && response.data) {
        const amenities = Array.isArray(response.data)
          ? response.data
          : (response.data as any).results || [];
        return { success: true, data: amenities };
      }

      return response as ApiResponse<BookingAmenity[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch booking amenities',
      };
    }
  }

  /**
   * Remove Amenity from Booking
   * DELETE /api/v1/rides/{booking_id}/amenities/{amenity_id}/remove/
   */
  async removeAmenityFromBooking(
    bookingId: string,
    amenityId: string
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      return await BaseApiService.delete<{ message: string }>(
        `/rides/${bookingId}/amenities/${amenityId}/remove/`
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove amenity from booking',
      };
    }
  }

  /**
   * Mark Amenity as Delivered (Driver only)
   * POST /api/v1/rides/{booking_id}/amenities/{amenity_id}/deliver/
   */
  async deliverAmenity(
    bookingId: string,
    amenityId: string
  ): Promise<ApiResponse<BookingAmenity>> {
    try {
      return await BaseApiService.post<BookingAmenity>(
        `/rides/${bookingId}/amenities/${amenityId}/deliver/`,
        {}
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark amenity as delivered',
      };
    }
  }

  // =========================================================================
  // UTILITY METHODS
  // =========================================================================

  parsePrice(price: string | number | undefined): number {
    if (price === undefined || price === null) return 0;
    if (typeof price === 'number') return price;
    const parsed = parseFloat(price);
    return isNaN(parsed) ? 0 : parsed;
  }

  formatPrice(price: string | number): string {
    const num = this.parsePrice(price);
    return `₹${num.toLocaleString('en-IN')}`;
  }

  getCategoryDisplayName(category: AmenityCategory): string {
    const names: Record<AmenityCategory, string> = {
      refreshment: 'Refreshments',
      comfort: 'Comfort',
      premium: 'Premium',
    };
    return names[category] || category;
  }

  getCategoryIcon(category: AmenityCategory): string {
    const icons: Record<AmenityCategory, string> = {
      refreshment: 'cafe-outline',
      comfort: 'bed-outline',
      premium: 'diamond-outline',
    };
    return icons[category] || 'ellipse-outline';
  }

  groupByCategory(amenities: Amenity[]): Record<AmenityCategory, Amenity[]> {
    const grouped: Record<AmenityCategory, Amenity[]> = {
      refreshment: [],
      comfort: [],
      premium: [],
    };

    amenities.forEach((amenity) => {
      if (grouped[amenity.category]) {
        grouped[amenity.category].push(amenity);
      }
    });

    return grouped;
  }
}

export default new AmenityApiService();
