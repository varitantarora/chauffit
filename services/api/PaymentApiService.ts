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
