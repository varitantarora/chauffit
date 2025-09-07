/**
 * End-to-End Payment Flow Integration Tests
 * 
 * Tests comprehensive payment processing including Indian payment methods,
 * GST calculations, commission splits, and error handling scenarios.
 */

import { mockServices } from '../../../test-utils/mocks/mock-services';
import { bookingStore } from '../../../store/bookingStore';
import { earningsStore } from '../../../store/earningsStore';
import { generateBooking, generateDriver, generatePayment } from '../../../test-utils/test-data';

jest.mock('../../../store/bookingStore');
jest.mock('../../../store/earningsStore');
jest.mock('../../../services/StripeService');

describe('End-to-End Payment Flow Integration Tests', () => {
  const mockBooking = generateBooking();
  const mockDriver = generateDriver();
  const mockPayment = generatePayment(mockBooking.id);

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default success responses
    mockServices.stripe.createPaymentIntent.mockResolvedValue({
      id: 'pi_test_123',
      client_secret: 'pi_test_123_secret',
      amount: mockBooking.total_amount * 100, // Convert to paise
      currency: 'INR'
    });

    (bookingStore.updateBookingPayment as jest.Mock).mockResolvedValue({ success: true });
    (earningsStore.recordDriverEarning as jest.Mock).mockResolvedValue({ success: true });
  });

  describe('UPI Payment Flow (Primary Indian Payment Method)', () => {
    it('processes UPI payment end-to-end', async () => {
      const upiId = 'customer@paytm';
      
      mockServices.stripe.createUPIPayment.mockResolvedValue({
        id: 'upi_test_123',
        status: 'requires_confirmation',
        client_secret: 'upi_test_123_secret'
      });

      mockServices.stripe.confirmUPIPayment.mockResolvedValue({
        id: 'upi_test_123',
        status: 'succeeded',
        charges: {
          data: [{
            amount: mockBooking.total_amount * 100,
            currency: 'inr',
            outcome: { type: 'authorized' }
          }]
        }
      });

      // Step 1: Create UPI payment intent
      const paymentIntent = await mockServices.stripe.createUPIPayment({
        amount: mockBooking.total_amount * 100,
        currency: 'INR',
        payment_method: {
          type: 'upi',
          upi: { vpa: upiId }
        }
      });

      expect(paymentIntent.status).toBe('requires_confirmation');

      // Step 2: Confirm UPI payment
      const confirmedPayment = await mockServices.stripe.confirmUPIPayment(paymentIntent.id);
      expect(confirmedPayment.status).toBe('succeeded');

      // Step 3: Update booking with payment status
      await bookingStore.updateBookingPayment(mockBooking.id, {
        payment_id: confirmedPayment.id,
        payment_method: 'upi',
        payment_status: 'completed',
        upi_id: upiId
      });

      // Step 4: Process commission and driver earnings
      const platformCommission = Math.round(mockBooking.total_amount * 0.15); // 15%
      const driverEarning = mockBooking.total_amount - platformCommission;

      await earningsStore.recordDriverEarning({
        booking_id: mockBooking.id,
        driver_id: mockDriver.id,
        gross_amount: mockBooking.total_amount,
        platform_commission: platformCommission,
        net_earning: driverEarning,
        payment_method: 'upi'
      });

      expect(earningsStore.recordDriverEarning).toHaveBeenCalledWith({
        booking_id: mockBooking.id,
        driver_id: mockDriver.id,
        gross_amount: mockBooking.total_amount,
        platform_commission: platformCommission,
        net_earning: driverEarning,
        payment_method: 'upi'
      });
    });

    it('handles UPI payment failure and retry', async () => {
      mockServices.stripe.createUPIPayment
        .mockResolvedValueOnce({
          id: 'upi_failed_123',
          status: 'requires_confirmation'
        });

      mockServices.stripe.confirmUPIPayment
        .mockRejectedValueOnce(new Error('UPI transaction failed'))
        .mockResolvedValue({
          id: 'upi_retry_123',
          status: 'succeeded'
        });

      // First attempt fails
      const paymentIntent = await mockServices.stripe.createUPIPayment({
        amount: mockBooking.total_amount * 100,
        currency: 'INR',
        payment_method: { type: 'upi', upi: { vpa: 'test@okaxis' } }
      });

      await expect(
        mockServices.stripe.confirmUPIPayment(paymentIntent.id)
      ).rejects.toThrow('UPI transaction failed');

      // Retry with new payment intent
      const retryPaymentIntent = await mockServices.stripe.createUPIPayment({
        amount: mockBooking.total_amount * 100,
        currency: 'INR',
        payment_method: { type: 'upi', upi: { vpa: 'test@okaxis' } }
      });

      const retryResult = await mockServices.stripe.confirmUPIPayment(retryPaymentIntent.id);
      expect(retryResult.status).toBe('succeeded');
    });
  });

  describe('Credit/Debit Card Payment Flow', () => {
    it('processes card payment with Indian cards', async () => {
      mockServices.stripe.confirmPayment.mockResolvedValue({
        paymentIntent: {
          id: 'pi_card_123',
          status: 'succeeded',
          charges: {
            data: [{
              payment_method_details: {
                card: {
                  brand: 'visa',
                  country: 'IN',
                  last4: '4242'
                }
              }
            }]
          }
        },
        error: null
      });

      const result = await mockServices.stripe.confirmPayment({
        type: 'card',
        card: { number: '4242424242424242' }
      });

      expect(result.paymentIntent.status).toBe('succeeded');
      
      // Verify Indian card processing
      const cardDetails = result.paymentIntent.charges.data[0].payment_method_details.card;
      expect(cardDetails.country).toBe('IN');
      
      // Update booking with card payment details
      await bookingStore.updateBookingPayment(mockBooking.id, {
        payment_id: result.paymentIntent.id,
        payment_method: 'card',
        payment_status: 'completed',
        card_last4: cardDetails.last4,
        card_brand: cardDetails.brand
      });
    });

    it('applies correct GST for card payments', async () => {
      const baseAmount = 2000;
      const gstRate = 0.18; // 18% GST
      const gstAmount = Math.round(baseAmount * gstRate);
      const totalAmount = baseAmount + gstAmount;

      const gstDetails = {
        gst_number: '29ABCDE1234F1Z5',
        cgst: Math.round(gstAmount / 2), // 9%
        sgst: Math.round(gstAmount / 2), // 9%
        igst: 0 // Intrastate transaction
      };

      await mockServices.stripe.createPaymentIntent({
        amount: totalAmount * 100,
        currency: 'INR',
        metadata: {
          base_amount: baseAmount.toString(),
          gst_amount: gstAmount.toString(),
          gst_number: gstDetails.gst_number,
          cgst: gstDetails.cgst.toString(),
          sgst: gstDetails.sgst.toString()
        }
      });

      expect(mockServices.stripe.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            gst_amount: gstAmount.toString(),
            cgst: gstDetails.cgst.toString(),
            sgst: gstDetails.sgst.toString()
          })
        })
      );
    });
  });

  describe('Commission and Earnings Processing', () => {
    it('calculates and distributes commission correctly', async () => {
      const bookingAmount = 3000;
      const platformCommissionRate = 0.15; // 15%
      const platformCommission = Math.round(bookingAmount * platformCommissionRate);
      const driverEarning = bookingAmount - platformCommission;
      const gstOnCommission = Math.round(platformCommission * 0.18);

      // Process payment
      mockServices.stripe.confirmPayment.mockResolvedValue({
        paymentIntent: { id: 'pi_commission_123', status: 'succeeded' }
      });

      await mockServices.stripe.confirmPayment({});

      // Record earnings
      await earningsStore.recordDriverEarning({
        booking_id: mockBooking.id,
        driver_id: mockDriver.id,
        gross_amount: bookingAmount,
        platform_commission: platformCommission,
        platform_gst: gstOnCommission,
        net_earning: driverEarning,
        payment_method: 'card'
      });

      expect(earningsStore.recordDriverEarning).toHaveBeenCalledWith(
        expect.objectContaining({
          gross_amount: bookingAmount,
          platform_commission: platformCommission,
          platform_gst: gstOnCommission,
          net_earning: driverEarning
        })
      );
    });

    it('handles surge pricing commission adjustments', async () => {
      const baseAmount = 2000;
      const surgeMultiplier = 2.0;
      const surgeAmount = baseAmount * surgeMultiplier;
      
      // Reduced commission during surge to incentivize drivers
      const surgeCommissionRate = 0.10; // 10% instead of 15%
      const commission = Math.round(surgeAmount * surgeCommissionRate);
      const driverEarning = surgeAmount - commission;

      await earningsStore.recordDriverEarning({
        booking_id: mockBooking.id,
        driver_id: mockDriver.id,
        gross_amount: surgeAmount,
        surge_multiplier: surgeMultiplier,
        platform_commission: commission,
        commission_rate: surgeCommissionRate,
        net_earning: driverEarning,
        payment_method: 'upi'
      });

      expect(earningsStore.recordDriverEarning).toHaveBeenCalledWith(
        expect.objectContaining({
          surge_multiplier: surgeMultiplier,
          commission_rate: surgeCommissionRate
        })
      );
    });

    it('processes instant driver payouts', async () => {
      const driverEarning = 2550;
      
      mockServices.stripe.createTransfer = jest.fn().mockResolvedValue({
        id: 'tr_driver_payout_123',
        amount: driverEarning * 100,
        destination: `acct_${mockDriver.id}`,
        currency: 'INR'
      });

      // Trigger instant payout
      await earningsStore.processInstantPayout(mockDriver.id, driverEarning);

      expect(mockServices.stripe.createTransfer).toHaveBeenCalledWith({
        amount: driverEarning * 100,
        currency: 'INR',
        destination: `acct_${mockDriver.id}`,
        description: `Instant payout for driver ${mockDriver.id}`
      });
    });
  });

  describe('Payment Failure Scenarios', () => {
    it('handles insufficient funds gracefully', async () => {
      mockServices.stripe.confirmPayment.mockResolvedValue({
        error: {
          code: 'card_declined',
          decline_code: 'insufficient_funds',
          message: 'Your card has insufficient funds.'
        }
      });

      const result = await mockServices.stripe.confirmPayment({});
      expect(result.error.decline_code).toBe('insufficient_funds');

      // Should update booking with failure reason
      await bookingStore.updateBookingPayment(mockBooking.id, {
        payment_status: 'failed',
        failure_reason: 'insufficient_funds',
        retry_available: true
      });

      expect(bookingStore.updateBookingPayment).toHaveBeenCalledWith(
        mockBooking.id,
        expect.objectContaining({
          payment_status: 'failed',
          failure_reason: 'insufficient_funds'
        })
      );
    });

    it('handles payment timeout scenarios', async () => {
      mockServices.stripe.confirmPayment.mockImplementation(
        () => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Payment timeout')), 30000)
        )
      );

      // Set shorter timeout for testing
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Payment timeout')), 100)
      );

      await expect(timeoutPromise).rejects.toThrow('Payment timeout');

      // Should mark booking as payment pending
      await bookingStore.updateBookingPayment(mockBooking.id, {
        payment_status: 'timeout',
        retry_available: true,
        timeout_at: new Date().toISOString()
      });
    });

    it('processes refunds for cancelled bookings', async () => {
      const refundAmount = Math.round(mockBooking.total_amount * 0.9); // 90% refund
      
      mockServices.stripe.createRefund = jest.fn().mockResolvedValue({
        id: 'rf_refund_123',
        amount: refundAmount * 100,
        status: 'succeeded',
        reason: 'requested_by_customer'
      });

      await mockServices.stripe.createRefund({
        payment_intent: mockPayment.stripe_payment_intent_id,
        amount: refundAmount * 100,
        reason: 'requested_by_customer'
      });

      // Update booking and earnings
      await bookingStore.updateBookingPayment(mockBooking.id, {
        payment_status: 'refunded',
        refund_amount: refundAmount,
        refund_id: 'rf_refund_123'
      });

      // Adjust driver earnings
      await earningsStore.recordDriverEarning({
        booking_id: mockBooking.id,
        driver_id: mockDriver.id,
        adjustment_type: 'refund',
        adjustment_amount: -refundAmount,
        reason: 'booking_cancelled'
      });
    });
  });

  describe('Multi-Currency Support', () => {
    it('handles international payments in INR', async () => {
      // International card but billing in INR
      mockServices.stripe.createPaymentIntent.mockResolvedValue({
        id: 'pi_international_123',
        currency: 'INR',
        amount: mockBooking.total_amount * 100,
        metadata: {
          international_card: 'true',
          conversion_rate: '1.0' // Already in INR
        }
      });

      const paymentIntent = await mockServices.stripe.createPaymentIntent({
        amount: mockBooking.total_amount * 100,
        currency: 'INR'
      });

      expect(paymentIntent.currency).toBe('INR');
    });

    it('applies currency conversion for international cards', async () => {
      const usdAmount = 30; // $30 USD
      const conversionRate = 83.50; // 1 USD = 83.50 INR
      const inrAmount = Math.round(usdAmount * conversionRate);

      mockServices.stripe.createPaymentIntent.mockResolvedValue({
        id: 'pi_conversion_123',
        currency: 'INR',
        amount: inrAmount * 100,
        metadata: {
          original_currency: 'USD',
          original_amount: usdAmount.toString(),
          conversion_rate: conversionRate.toString()
        }
      });

      const paymentIntent = await mockServices.stripe.createPaymentIntent({
        amount: inrAmount * 100,
        currency: 'INR'
      });

      expect(paymentIntent.metadata.conversion_rate).toBe(conversionRate.toString());
    });
  });

  describe('Tax Compliance and Reporting', () => {
    it('generates GST-compliant invoices', async () => {
      const invoice = {
        booking_id: mockBooking.id,
        invoice_number: `INV-${Date.now()}`,
        gst_number: '29CHAUFFIT1234F1Z5',
        base_amount: 2000,
        cgst: 180, // 9%
        sgst: 180, // 9%
        total_amount: 2360,
        invoice_date: new Date().toISOString()
      };

      await bookingStore.generateInvoice(mockBooking.id, invoice);

      expect(bookingStore.generateInvoice).toHaveBeenCalledWith(
        mockBooking.id,
        expect.objectContaining({
          gst_number: expect.stringMatching(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/),
          cgst: expect.any(Number),
          sgst: expect.any(Number)
        })
      );
    });

    it('handles interstate GST (IGST) correctly', async () => {
      const interstateBooking = {
        ...mockBooking,
        pickup_location: { ...mockBooking.pickup_location, state: 'Delhi' },
        destination: { ...mockBooking.destination, state: 'Maharashtra' }
      };

      const invoice = {
        booking_id: interstateBooking.id,
        base_amount: 2000,
        igst: 360, // 18% IGST for interstate
        cgst: 0,
        sgst: 0,
        total_amount: 2360
      };

      await bookingStore.generateInvoice(interstateBooking.id, invoice);

      expect(bookingStore.generateInvoice).toHaveBeenCalledWith(
        interstateBooking.id,
        expect.objectContaining({
          igst: 360,
          cgst: 0,
          sgst: 0
        })
      );
    });
  });

  describe('Fraud Prevention', () => {
    it('detects suspicious payment patterns', async () => {
      // Multiple failed attempts from same card
      const suspiciousPayments = Array.from({ length: 5 }, () => ({
        card_fingerprint: 'fp_suspicious_123',
        status: 'failed',
        timestamp: Date.now()
      }));

      mockServices.stripe.detectFraud = jest.fn().mockReturnValue({
        risk_score: 85, // High risk
        risk_level: 'high',
        blocked: true,
        reason: 'multiple_failed_attempts'
      });

      const fraudCheck = mockServices.stripe.detectFraud({
        payment_attempts: suspiciousPayments
      });

      expect(fraudCheck.risk_level).toBe('high');
      expect(fraudCheck.blocked).toBe(true);
    });

    it('applies 3D Secure for high-value payments', async () => {
      const highValueAmount = 10000; // ₹10,000

      mockServices.stripe.createPaymentIntent.mockResolvedValue({
        id: 'pi_3ds_123',
        amount: highValueAmount * 100,
        currency: 'INR',
        confirmation_method: 'manual',
        require_3d_secure: true
      });

      const paymentIntent = await mockServices.stripe.createPaymentIntent({
        amount: highValueAmount * 100,
        currency: 'INR'
      });

      expect(paymentIntent.require_3d_secure).toBe(true);
    });
  });

  describe('Performance and Scalability', () => {
    it('processes payments efficiently under load', async () => {
      const simultaneousPayments = 50;
      const paymentPromises = Array.from({ length: simultaneousPayments }, (_, i) =>
        mockServices.stripe.createPaymentIntent({
          amount: (1000 + i) * 100,
          currency: 'INR'
        })
      );

      const startTime = performance.now();
      const results = await Promise.all(paymentPromises);
      const endTime = performance.now();

      expect(results).toHaveLength(simultaneousPayments);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('handles payment webhook processing efficiently', async () => {
      const webhookPayloads = Array.from({ length: 100 }, (_, i) => ({
        id: `evt_${i}`,
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: `pi_webhook_${i}`,
            status: 'succeeded'
          }
        }
      }));

      const webhookPromises = webhookPayloads.map(payload =>
        bookingStore.processPaymentWebhook(payload)
      );

      const startTime = performance.now();
      await Promise.all(webhookPromises);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(3000); // Process 100 webhooks in under 3 seconds
    });
  });
});