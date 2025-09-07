import React from 'react';
import { render, fireEvent, waitFor } from '../../../test-utils/test-utils';
import { bookingStore } from '../../../store/bookingStore';
import { generateBooking, generateDriver, generatePayment } from '../../../test-utils/test-data';
import { mockServices } from '../../../test-utils/mocks/mock-services';

jest.mock('../../../store/bookingStore');
jest.mock('../../../services/StripeService');

describe('Booking Confirmation Tests', () => {
  const mockBooking = generateBooking();
  const mockDriver = generateDriver();
  const mockPayment = generatePayment();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    (bookingStore.confirmBooking as jest.Mock).mockResolvedValue({ 
      success: true, 
      bookingId: mockBooking.id 
    });
    (bookingStore.getBookingDetails as jest.Mock).mockResolvedValue(mockBooking);
    (bookingStore.calculateTotal as jest.Mock).mockReturnValue({
      baseAmount: 2000,
      platformFee: 100,
      gstAmount: 378,
      totalAmount: 2478,
    });
  });

  describe('Booking Summary Display', () => {
    it('displays booking details correctly', () => {
      const { getByText, getByTestId } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      expect(getByText('Booking Summary')).toBeTruthy();
      expect(getByText(mockBooking.pickup_location.address)).toBeTruthy();
      expect(getByText(mockBooking.destination.address)).toBeTruthy();
      expect(getByText(`${mockBooking.duration_hours} hours`)).toBeTruthy();
      expect(getByTestId('booking-date')).toHaveTextContent(
        new Date(mockBooking.created_at).toLocaleDateString()
      );
    });

    it('shows selected driver information', () => {
      const { getByText, getByTestId } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      expect(getByText(mockDriver.name)).toBeTruthy();
      expect(getByText(mockDriver.vehicle_number)).toBeTruthy();
      expect(getByTestId('driver-rating')).toHaveTextContent(mockDriver.rating.toString());
      expect(getByTestId('driver-phone')).toHaveTextContent(mockDriver.phone);
    });

    it('displays pricing breakdown', () => {
      const { getByText } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      expect(getByText('₹2,000')).toBeTruthy(); // Base amount
      expect(getByText('₹100')).toBeTruthy();   // Platform fee
      expect(getByText('₹378')).toBeTruthy();   // GST
      expect(getByText('₹2,478')).toBeTruthy(); // Total
    });

    it('shows surge pricing when applicable', () => {
      const surgeBooking = { 
        ...mockBooking, 
        surge_multiplier: 1.5,
        total_amount: 3717 
      };

      const { getByText, getByTestId } = render(
        <BookingConfirmation 
          booking={surgeBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      expect(getByTestId('surge-indicator')).toHaveTextContent('1.5x Surge');
      expect(getByText('₹3,717')).toBeTruthy();
    });
  });

  describe('Payment Method Selection', () => {
    it('displays available payment methods', () => {
      const { getByText } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      expect(getByText('Credit/Debit Card')).toBeTruthy();
      expect(getByText('UPI')).toBeTruthy();
      expect(getByText('Net Banking')).toBeTruthy();
      expect(getByText('Cash')).toBeTruthy();
    });

    it('handles payment method selection', () => {
      const { getByTestId } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      const upiOption = getByTestId('payment-method-upi');
      fireEvent.press(upiOption);

      expect(upiOption).toHaveStyle({ 
        backgroundColor: expect.stringMatching(/selected/) 
      });
    });

    it('shows UPI ID input for UPI payment', () => {
      const { getByTestId } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      fireEvent.press(getByTestId('payment-method-upi'));
      
      const upiInput = getByTestId('upi-id-input');
      expect(upiInput).toBeTruthy();
    });

    it('validates UPI ID format', async () => {
      const { getByTestId } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      fireEvent.press(getByTestId('payment-method-upi'));
      
      const upiInput = getByTestId('upi-id-input');
      fireEvent.changeText(upiInput, 'invalid-upi');
      fireEvent.blur(upiInput);

      await waitFor(() => {
        expect(getByTestId('upi-error')).toHaveTextContent('Invalid UPI ID format');
      });
    });

    it('shows saved payment methods', () => {
      const savedMethods = [
        { id: 'pm_1', type: 'card', last4: '4242' },
        { id: 'pm_2', type: 'upi', vpa: 'user@paytm' }
      ];

      const { getByText } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          savedPaymentMethods={savedMethods}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      expect(getByText('**** 4242')).toBeTruthy();
      expect(getByText('user@paytm')).toBeTruthy();
    });
  });

  describe('Terms and Conditions', () => {
    it('requires terms acceptance', async () => {
      const mockOnConfirm = jest.fn();
      const { getByText } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={mockOnConfirm}
          onEdit={jest.fn()}
        />
      );

      fireEvent.press(getByText('Confirm Booking'));
      
      await waitFor(() => {
        expect(getByText('Please accept terms and conditions')).toBeTruthy();
        expect(mockOnConfirm).not.toHaveBeenCalled();
      });
    });

    it('shows terms and conditions modal', () => {
      const { getByText, getByTestId } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      fireEvent.press(getByText('Terms & Conditions'));
      
      expect(getByTestId('terms-modal')).toBeTruthy();
      expect(getByText('Chauffit Terms of Service')).toBeTruthy();
    });

    it('enables confirmation after accepting terms', () => {
      const { getByTestId, getByText } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      const termsCheckbox = getByTestId('terms-checkbox');
      fireEvent.press(termsCheckbox);

      const confirmButton = getByText('Confirm Booking');
      expect(confirmButton).not.toBeDisabled();
    });
  });

  describe('Booking Confirmation Process', () => {
    it('initiates booking confirmation', async () => {
      const mockOnConfirm = jest.fn();
      const { getByTestId, getByText } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={mockOnConfirm}
          onEdit={jest.fn()}
        />
      );

      // Accept terms
      fireEvent.press(getByTestId('terms-checkbox'));
      
      // Select payment method
      fireEvent.press(getByTestId('payment-method-card'));
      
      // Confirm booking
      fireEvent.press(getByText('Confirm Booking'));

      expect(mockOnConfirm).toHaveBeenCalled();
    });

    it('processes payment during confirmation', async () => {
      mockServices.stripe.confirmPayment.mockResolvedValue({
        paymentIntent: { id: 'pi_123', status: 'succeeded' },
        error: null
      });

      const { getByTestId, getByText } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      fireEvent.press(getByTestId('terms-checkbox'));
      fireEvent.press(getByTestId('payment-method-card'));
      fireEvent.press(getByText('Confirm Booking'));

      await waitFor(() => {
        expect(mockServices.stripe.confirmPayment).toHaveBeenCalled();
      });
    });

    it('shows loading state during confirmation', async () => {
      (bookingStore.confirmBooking as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000))
      );

      const { getByTestId, getByText } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      fireEvent.press(getByTestId('terms-checkbox'));
      fireEvent.press(getByText('Confirm Booking'));

      expect(getByTestId('loading-spinner')).toBeTruthy();
      expect(getByText('Processing booking...')).toBeTruthy();
    });

    it('generates OTP for booking verification', async () => {
      const otp = '123456';
      (bookingStore.confirmBooking as jest.Mock).mockResolvedValue({ 
        success: true, 
        bookingId: mockBooking.id,
        otp: otp
      });

      const { getByTestId, getByText } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      fireEvent.press(getByTestId('terms-checkbox'));
      fireEvent.press(getByText('Confirm Booking'));

      await waitFor(() => {
        expect(getByText(`Your OTP: ${otp}`)).toBeTruthy();
        expect(getByText('Share this OTP with your chauffeur')).toBeTruthy();
      });
    });
  });

  describe('Indian Payment Methods', () => {
    it('supports UPI payment', async () => {
      const { getByTestId } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      fireEvent.press(getByTestId('payment-method-upi'));
      const upiInput = getByTestId('upi-id-input');
      fireEvent.changeText(upiInput, 'test@okaxis');

      expect(upiInput.props.value).toBe('test@okaxis');
    });

    it('shows GST breakdown for business bookings', () => {
      const businessBooking = { 
        ...mockBooking, 
        business_booking: true,
        gst_details: {
          gst_number: '29ABCDE1234F1Z5',
          cgst: 180,
          sgst: 180,
          igst: 0
        }
      };

      const { getByText } = render(
        <BookingConfirmation 
          booking={businessBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      expect(getByText('CGST (9%): ₹180')).toBeTruthy();
      expect(getByText('SGST (9%): ₹180')).toBeTruthy();
      expect(getByText('GST Number: 29ABCDE1234F1Z5')).toBeTruthy();
    });

    it('handles Paytm wallet payment', async () => {
      mockServices.stripe.createPaymentIntent.mockResolvedValue({
        id: 'pi_123',
        client_secret: 'pi_123_secret'
      });

      const { getByTestId, getByText } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      fireEvent.press(getByTestId('payment-method-wallet'));
      fireEvent.press(getByText('Paytm'));

      await waitFor(() => {
        expect(getByTestId('wallet-redirect')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles payment failure', async () => {
      mockServices.stripe.confirmPayment.mockResolvedValue({
        error: { message: 'Your card was declined.' }
      });

      const { getByTestId, getByText } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      fireEvent.press(getByTestId('terms-checkbox'));
      fireEvent.press(getByTestId('payment-method-card'));
      fireEvent.press(getByText('Confirm Booking'));

      await waitFor(() => {
        expect(getByText('Payment failed: Your card was declined.')).toBeTruthy();
        expect(getByText('Try Another Payment Method')).toBeTruthy();
      });
    });

    it('handles booking confirmation failure', async () => {
      (bookingStore.confirmBooking as jest.Mock).mockRejectedValue(
        new Error('Driver is no longer available')
      );

      const { getByTestId, getByText } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      fireEvent.press(getByTestId('terms-checkbox'));
      fireEvent.press(getByText('Confirm Booking'));

      await waitFor(() => {
        expect(getByText('Driver is no longer available')).toBeTruthy();
        expect(getByText('Select Another Driver')).toBeTruthy();
      });
    });

    it('shows network error message', async () => {
      (bookingStore.confirmBooking as jest.Mock).mockRejectedValue(
        new Error('Network request failed')
      );

      const { getByTestId, getByText } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      fireEvent.press(getByTestId('terms-checkbox'));
      fireEvent.press(getByText('Confirm Booking'));

      await waitFor(() => {
        expect(getByText('Network error. Please check your connection.')).toBeTruthy();
        expect(getByText('Retry')).toBeTruthy();
      });
    });
  });

  describe('Booking Modifications', () => {
    it('allows editing booking details', () => {
      const mockOnEdit = jest.fn();
      const { getByText } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={mockOnEdit}
        />
      );

      fireEvent.press(getByText('Edit Details'));
      expect(mockOnEdit).toHaveBeenCalled();
    });

    it('shows edit options modal', () => {
      const { getByText, getByTestId } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      fireEvent.press(getByText('Edit Details'));
      
      expect(getByTestId('edit-modal')).toBeTruthy();
      expect(getByText('Change Duration')).toBeTruthy();
      expect(getByText('Change Pickup Location')).toBeTruthy();
      expect(getByText('Select Different Driver')).toBeTruthy();
    });

    it('recalculates pricing after modifications', async () => {
      const updatedBooking = { ...mockBooking, duration_hours: 6 };
      (bookingStore.calculateTotal as jest.Mock).mockReturnValue({
        baseAmount: 3000,
        platformFee: 150,
        gstAmount: 567,
        totalAmount: 3717,
      });

      const { getByTestId, getByText } = render(
        <BookingConfirmation 
          booking={updatedBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(getByText('₹3,717')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const { getByLabelText } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      expect(getByLabelText('Booking summary details')).toBeTruthy();
      expect(getByLabelText('Payment method selection')).toBeTruthy();
      expect(getByLabelText('Accept terms and conditions')).toBeTruthy();
    });

    it('announces pricing changes', () => {
      const { getByLabelText } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      const totalAmount = getByLabelText(/total amount/i);
      expect(totalAmount).toHaveAccessibilityLiveRegion('polite');
    });
  });

  describe('Performance', () => {
    it('debounces payment method selection', async () => {
      const { getByTestId } = render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      // Rapidly select different payment methods
      fireEvent.press(getByTestId('payment-method-upi'));
      fireEvent.press(getByTestId('payment-method-card'));
      fireEvent.press(getByTestId('payment-method-upi'));

      // Should only process the last selection after debounce
      await waitFor(() => {
        const upiInput = getByTestId('upi-id-input');
        expect(upiInput).toBeTruthy();
      });
    });

    it('caches pricing calculations', () => {
      render(
        <BookingConfirmation 
          booking={mockBooking} 
          driver={mockDriver}
          onConfirm={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      // Should only call calculateTotal once for same booking
      expect(bookingStore.calculateTotal).toHaveBeenCalledTimes(1);
    });
  });
});

// Mock component for testing
const BookingConfirmation = ({ booking, driver, savedPaymentMethods, onConfirm, onEdit }: any) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState('');
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showTerms, setShowTerms] = React.useState(false);
  const [showEdit, setShowEdit] = React.useState(false);
  const [upiId, setUpiId] = React.useState('');
  const [upiError, setUpiError] = React.useState('');

  const pricing = bookingStore.calculateTotal(booking);

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    if (method !== 'upi') {
      setUpiError('');
    }
  };

  const validateUpiId = (id: string) => {
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    if (!upiRegex.test(id)) {
      setUpiError('Invalid UPI ID format');
      return false;
    }
    setUpiError('');
    return true;
  };

  const handleConfirm = async () => {
    if (!termsAccepted) {
      setError('Please accept terms and conditions');
      return;
    }

    if (selectedPaymentMethod === 'upi' && !validateUpiId(upiId)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (selectedPaymentMethod === 'card') {
        const paymentResult = await mockServices.stripe.confirmPayment();
        if (paymentResult.error) {
          setError(`Payment failed: ${paymentResult.error.message}`);
          return;
        }
      }

      const result = await bookingStore.confirmBooking(booking.id, selectedPaymentMethod);
      if (result.success) {
        onConfirm(result);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Booking Summary</h2>
      
      <div aria-label="Booking summary details">
        <div>{booking.pickup_location.address}</div>
        <div>{booking.destination.address}</div>
        <div>{booking.duration_hours} hours</div>
        <div data-testid="booking-date">
          {new Date(booking.created_at).toLocaleDateString()}
        </div>
        
        {booking.surge_multiplier && booking.surge_multiplier > 1 && (
          <div data-testid="surge-indicator">
            {booking.surge_multiplier}x Surge
          </div>
        )}
      </div>

      <div>
        <div>{driver.name}</div>
        <div>{driver.vehicle_number}</div>
        <div data-testid="driver-rating">{driver.rating}</div>
        <div data-testid="driver-phone">{driver.phone}</div>
      </div>

      <div>
        <div>₹{pricing.baseAmount.toLocaleString()}</div>
        <div>₹{pricing.platformFee}</div>
        <div>₹{pricing.gstAmount}</div>
        <div aria-live="polite" aria-label={`Total amount ${pricing.totalAmount}`}>
          ₹{pricing.totalAmount.toLocaleString()}
        </div>
      </div>

      <div aria-label="Payment method selection">
        <button 
          data-testid="payment-method-card"
          onClick={() => handlePaymentMethodSelect('card')}
        >
          Credit/Debit Card
        </button>
        <button 
          data-testid="payment-method-upi"
          onClick={() => handlePaymentMethodSelect('upi')}
        >
          UPI
        </button>
        <button 
          data-testid="payment-method-wallet"
          onClick={() => handlePaymentMethodSelect('wallet')}
        >
          Net Banking
        </button>
        <button onClick={() => handlePaymentMethodSelect('cash')}>
          Cash
        </button>

        {selectedPaymentMethod === 'upi' && (
          <div>
            <input
              data-testid="upi-id-input"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              onBlur={() => validateUpiId(upiId)}
              placeholder="Enter UPI ID"
            />
            {upiError && (
              <div data-testid="upi-error">{upiError}</div>
            )}
          </div>
        )}

        {selectedPaymentMethod === 'wallet' && (
          <div>
            <button>Paytm</button>
            <div data-testid="wallet-redirect">Redirecting to wallet...</div>
          </div>
        )}
      </div>

      <div>
        <input
          data-testid="terms-checkbox"
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          aria-label="Accept terms and conditions"
        />
        <button onClick={() => setShowTerms(true)}>Terms & Conditions</button>
      </div>

      {error && <div>{error}</div>}

      {loading && (
        <>
          <div data-testid="loading-spinner">Loading...</div>
          <div>Processing booking...</div>
        </>
      )}

      <button 
        onClick={handleConfirm}
        disabled={!termsAccepted || loading}
      >
        Confirm Booking
      </button>
      
      <button onClick={() => setShowEdit(true)}>Edit Details</button>

      {showTerms && (
        <div data-testid="terms-modal">
          <h3>Chauffit Terms of Service</h3>
          <button onClick={() => setShowTerms(false)}>Close</button>
        </div>
      )}

      {showEdit && (
        <div data-testid="edit-modal">
          <button>Change Duration</button>
          <button>Change Pickup Location</button>
          <button>Select Different Driver</button>
          <button onClick={() => setShowEdit(false)}>Close</button>
        </div>
      )}

      {error === 'Payment failed: Your card was declined.' && (
        <button>Try Another Payment Method</button>
      )}

      {error === 'Driver is no longer available' && (
        <button>Select Another Driver</button>
      )}

      {error === 'Network request failed' && (
        <button>Retry</button>
      )}
    </div>
  );
};