import { initPaymentSheet, presentPaymentSheet, confirmPayment, StripeProvider } from '@stripe/stripe-react-native';
import { appConfig, getApiUrl, API_ENDPOINTS } from '../config/env';

export interface PaymentMethodData {
  id: string;
  type: 'card' | 'upi' | 'wallet';
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    funding: string;
  };
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postalCode?: string;
      state?: string;
    };
  };
}

export interface PaymentIntentData {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface StripeConfig {
  publishableKey: string;
  merchantIdentifier?: string;
  urlScheme?: string;
  setUrlSchemeOnAndroid?: boolean;
}

class StripeService {
  private isInitialized = false;
  private config: StripeConfig;

  constructor() {
    this.config = {
      publishableKey: appConfig.stripePublishableKey,
      merchantIdentifier: 'merchant.com.chauffit.app',
      urlScheme: 'chauffit',
      setUrlSchemeOnAndroid: true,
    };
  }

  // Initialize Stripe
  async initialize(): Promise<boolean> {
    try {
      if (!this.config.publishableKey) {
        console.error('Stripe publishable key is not configured');
        return false;
      }

      // Stripe initialization is handled by StripeProvider component
      this.isInitialized = true;
      console.log('Stripe service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      return false;
    }
  }

  // Create payment intent
  async createPaymentIntent(
    amount: number, // in smallest currency unit (paise for INR)
    currency: string = 'inr',
    customerId?: string,
    metadata?: Record<string, string>
  ): Promise<PaymentIntentData | null> {
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.CREATE_PAYMENT_INTENT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          customer_id: customerId,
          metadata,
          automatic_payment_methods: {
            enabled: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      return {
        clientSecret: data.client_secret,
        paymentIntentId: data.id,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return null;
    }
  }

  // Initialize payment sheet
  async initializePaymentSheet(
    paymentIntentClientSecret: string,
    customerId?: string,
    customerEphemeralKeySecret?: string,
    merchantDisplayName: string = 'Chauffit',
    allowsDelayedPaymentMethods: boolean = false
  ): Promise<{ error?: string }> {
    try {
      const { error } = await initPaymentSheet({
        merchantDisplayName,
        paymentIntentClientSecret,
        customerId,
        customerEphemeralKeySecret,
        allowsDelayedPaymentMethods,
        defaultBillingDetails: {
          name: 'Customer',
        },
        appearance: {
          colors: {
            primary: '#BD8C5E', // Secondary color from theme
            background: '#FFFFFF',
            componentBackground: '#F9F9F9',
            componentBorder: '#E5E5E5',
            componentDivider: '#E5E5E5',
            primaryText: '#000000',
            secondaryText: '#314B4C',
            componentText: '#000000',
            placeholderText: '#999999',
          },
          shapes: {
            borderRadius: 8,
            borderWidth: 1,
          },
          primaryButton: {
            colors: {
              background: '#BD8C5E',
              text: '#FFFFFF',
              border: '#BD8C5E',
            },
          },
        },
        applePay: {
          merchantCountryCode: 'IN',
        },
        googlePay: {
          merchantCountryCode: 'IN',
          testEnv: !appConfig.appEnvironment === 'production',
          currencyCode: 'INR',
        },
        // Indian payment methods
        allowsDelayedPaymentMethods: true,
      });

      if (error) {
        console.error('Error initializing payment sheet:', error);
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('Error in payment sheet initialization:', error);
      return { error: 'Failed to initialize payment sheet' };
    }
  }

  // Present payment sheet
  async presentPaymentSheet(): Promise<{ error?: string; success?: boolean }> {
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        // Handle different error codes
        if (error.code === 'Canceled') {
          return { error: 'Payment was cancelled' };
        } else {
          console.error('Payment sheet error:', error);
          return { error: error.message };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error presenting payment sheet:', error);
      return { error: 'Failed to present payment sheet' };
    }
  }

  // Process payment with complete flow
  async processPayment(
    amount: number,
    currency: string = 'inr',
    customerId?: string,
    metadata?: Record<string, string>
  ): Promise<{ success: boolean; error?: string; paymentIntentId?: string }> {
    try {
      // Step 1: Create payment intent
      const paymentIntent = await this.createPaymentIntent(amount, currency, customerId, metadata);
      if (!paymentIntent) {
        return { success: false, error: 'Failed to create payment intent' };
      }

      // Step 2: Initialize payment sheet
      const initResult = await this.initializePaymentSheet(paymentIntent.clientSecret, customerId);
      if (initResult.error) {
        return { success: false, error: initResult.error };
      }

      // Step 3: Present payment sheet
      const presentResult = await this.presentPaymentSheet();
      if (presentResult.error) {
        return { success: false, error: presentResult.error };
      }

      return { 
        success: true, 
        paymentIntentId: paymentIntent.paymentIntentId 
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      return { success: false, error: 'Payment processing failed' };
    }
  }

  // Confirm payment (for custom payment flows)
  async confirmPayment(
    paymentIntentClientSecret: string,
    paymentMethodData: any
  ): Promise<{ success: boolean; error?: string; paymentIntent?: any }> {
    try {
      const { error, paymentIntent } = await confirmPayment(
        paymentIntentClientSecret,
        paymentMethodData
      );

      if (error) {
        console.error('Payment confirmation error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, paymentIntent };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return { success: false, error: 'Payment confirmation failed' };
    }
  }

  // Get payment methods for customer
  async getPaymentMethods(customerId: string): Promise<PaymentMethodData[]> {
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.GET_PAYMENT_METHODS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customer_id: customerId }),
      });

      if (!response.ok) {
        throw new Error('Failed to get payment methods');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return [];
    }
  }

  // Calculate Indian taxes (GST)
  calculateGST(amount: number, gstRate: number = 18): { amount: number; gst: number; total: number } {
    const gst = Math.round((amount * gstRate) / 100);
    return {
      amount,
      gst,
      total: amount + gst,
    };
  }

  // Format currency for display
  formatCurrency(
    amount: number,
    currency: string = 'INR',
    locale: string = 'en-IN'
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount / 100); // Convert from paise to rupees
  }

  // Validate Indian payment methods
  validatePaymentMethod(type: string, details: any): { isValid: boolean; error?: string } {
    switch (type) {
      case 'card':
        if (!details.number || !details.expMonth || !details.expYear || !details.cvc) {
          return { isValid: false, error: 'Missing required card details' };
        }
        // Basic card number validation (simplified)
        if (details.number.replace(/\s/g, '').length < 13) {
          return { isValid: false, error: 'Invalid card number' };
        }
        return { isValid: true };

      case 'upi':
        if (!details.upiId) {
          return { isValid: false, error: 'UPI ID is required' };
        }
        // Basic UPI ID validation
        const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
        if (!upiRegex.test(details.upiId)) {
          return { isValid: false, error: 'Invalid UPI ID format' };
        }
        return { isValid: true };

      default:
        return { isValid: true };
    }
  }

  // Handle payment errors
  getErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }

    switch (error.code) {
      case 'PaymentSheetError':
        return 'Payment sheet error occurred';
      case 'UserCancel':
        return 'Payment was cancelled';
      case 'Timeout':
        return 'Payment timed out';
      case 'PaymentError':
        return error.localizedMessage || 'Payment failed';
      default:
        return 'An unexpected error occurred';
    }
  }

  // Check if service is ready
  isReady(): boolean {
    return this.isInitialized && !!this.config.publishableKey;
  }

  // Get configuration
  getConfig(): StripeConfig {
    return this.config;
  }
}

export default new StripeService();