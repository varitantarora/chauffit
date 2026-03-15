import BaseApiService, { ApiResponse } from './BaseApiService';

// ============================================================================
// PAYMENT API TYPES
// ============================================================================

export interface RazorpayOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  payment_id: string;
  key_id: string;
}

export interface RazorpayVerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  payment_id: string;
}

export interface RazorpayVerifyResponse {
  success: boolean;
  payment_status: string;
  booking_id: string;
}

export interface RazorpayPaymentMethod {
  id: string;
  method_type: 'card' | 'upi' | 'netbanking' | 'wallet';
  provider: string;
  upi_id: string;
  card_last_4: string;
  card_brand: string;
  card_expiry: string;
  bank_name: string;
  bank_account_last_4: string;
  display_name: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PAYMENT API SERVICE
// ============================================================================

class PaymentApiService {
  private basePath = '/payments';

  /**
   * Create Razorpay Order
   * POST /api/v1/payments/razorpay/create-order/
   *
   * Creates a Razorpay order for a booking payment.
   */
  async createRazorpayOrder(
    bookingId: string,
    amount: number,
    currency: string = 'INR'
  ): Promise<ApiResponse<RazorpayOrderResponse>> {
    try {
      return await BaseApiService.post<RazorpayOrderResponse>(
        `${this.basePath}/razorpay/create-order/`,
        {
          booking_id: bookingId,
          amount: amount.toFixed(2),
          currency,
        }
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create Razorpay order',
      };
    }
  }

  /**
   * Get Razorpay Payment Methods
   * GET /api/v1/payments/razorpay/payment-methods/
   *
   * Fetches the authenticated customer's saved payment methods from Razorpay.
   */
  async getPaymentMethods(): Promise<ApiResponse<RazorpayPaymentMethod[]>> {
    try {
      return await BaseApiService.get<RazorpayPaymentMethod[]>(
        `${this.basePath}/razorpay/payment-methods/`
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payment methods',
      };
    }
  }

  /**
   * Verify Razorpay Payment
   * POST /api/v1/payments/razorpay/verify/
   *
   * Verifies a completed Razorpay payment using signature.
   */
  async verifyRazorpayPayment(
    data: RazorpayVerifyRequest
  ): Promise<ApiResponse<RazorpayVerifyResponse>> {
    try {
      return await BaseApiService.post<RazorpayVerifyResponse>(
        `${this.basePath}/razorpay/verify/`,
        data
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify payment',
      };
    }
  }
}

export default new PaymentApiService();
