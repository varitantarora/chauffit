import { NativeModules } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';

// Defensive check for RazorpayCheckout which can be null in some environments (like New Architecture without interop)
const Razorpay = RazorpayCheckout || NativeModules.RazorpayCheckout;
import { appConfig } from '../config/env';
import PaymentApiService from './api/PaymentApiService';

export interface RazorpayUserInfo {
  name: string;
  email: string;
  phone: string;
}

export interface RazorpayPaymentResult {
  success: boolean;
  error?: string;
  paymentId?: string;
}

class RazorpayService {
  /**
   * Full payment flow: create order -> open checkout -> verify payment
   */
  async processPayment(
    bookingId: string,
    amount: number,
    userInfo: RazorpayUserInfo
  ): Promise<RazorpayPaymentResult> {
    try {
      // Step 1: Create order on backend
      const orderResponse = await PaymentApiService.createRazorpayOrder(bookingId, amount);

      if (!orderResponse.success || !orderResponse.data) {
        return {
          success: false,
          error: orderResponse.error || 'Failed to create payment order',
        };
      }

      const { order_id, amount: orderAmount, currency, payment_id, key_id } = orderResponse.data;

      // Step 2: Open Razorpay checkout
      const checkoutOptions = {
        key: key_id || appConfig.razorpayKeyId,
        amount: orderAmount,
        currency,
        name: 'Chauffit',
        description: `Payment for booking`,
        order_id,
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: userInfo.phone,
        },
        theme: {
          color: '#720C17',
        },
      };

      if (!Razorpay) {
        return {
          success: false,
          error: 'Razorpay native module not found. If you are using Expo, please ensure you are using a Development Client and have rebuilt the app.',
        };
      }

      const paymentData = await Razorpay.open(checkoutOptions);

      // Step 3: Verify payment on backend
      const verifyResponse = await PaymentApiService.verifyRazorpayPayment({
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        payment_id,
      });

      if (!verifyResponse.success) {
        return {
          success: false,
          error: verifyResponse.error || 'Payment verification failed',
        };
      }

      return {
        success: true,
        paymentId: paymentData.razorpay_payment_id,
      };
    } catch (error: any) {
      // Razorpay checkout was cancelled or failed
      if (error?.code === 'PAYMENT_CANCELLED' || error?.description?.includes('cancelled')) {
        return { success: false, error: 'Payment was cancelled' };
      }
      return {
        success: false,
        error: error?.description || error?.message || 'Payment failed',
      };
    }
  }
}

export default new RazorpayService();
