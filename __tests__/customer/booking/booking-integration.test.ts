import React from 'react';
import { render, fireEvent, waitFor, within } from '../../../test-utils/test-utils';
import { bookingStore } from '../../../store/bookingStore';
import { generateBooking, generateDriver, indianCityLocations } from '../../../test-utils/test-data';
import { mockServices } from '../../../test-utils/mocks/mock-services';

jest.mock('../../../store/bookingStore');
jest.mock('../../../services/SupabaseRealTimeService');
jest.mock('../../../services/StripeService');

describe('End-to-End Booking Flow Integration Tests', () => {
  const mockCustomerLocation = indianCityLocations.delhi.connaught_place;
  const mockDestination = indianCityLocations.delhi.noida;
  const mockDrivers = Array.from({ length: 3 }, generateDriver);
  const mockBooking = generateBooking();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup comprehensive mocks
    mockServices.location.getCurrentLocation.mockResolvedValue({
      coords: mockCustomerLocation,
      timestamp: Date.now(),
    });
    
    (bookingStore.createBooking as jest.Mock).mockResolvedValue({
      success: true,
      bookingId: mockBooking.id,
      otp: '123456'
    });
    
    (bookingStore.getAvailableDrivers as jest.Mock).mockResolvedValue(mockDrivers);
    (bookingStore.calculateTotal as jest.Mock).mockReturnValue({
      baseAmount: 2000,
      platformFee: 100,
      gstAmount: 378,
      totalAmount: 2478,
    });
  });

  describe('Complete Booking Flow', () => {
    it('completes full booking flow successfully', async () => {
      const { getByTestId, getByText } = render(<BookingFlow />);

      // Step 1: Location Selection
      await waitFor(() => {
        expect(getByText('Select Pickup Location')).toBeTruthy();
      });

      const pickupInput = getByTestId('pickup-location-input');
      fireEvent.changeText(pickupInput, 'Connaught Place');
      fireEvent.press(getByText('Connaught Place, New Delhi'));

      const destinationInput = getByTestId('destination-input');
      fireEvent.changeText(destinationInput, 'Noida');
      fireEvent.press(getByText('Noida, Uttar Pradesh'));

      fireEvent.press(getByText('Next'));

      // Step 2: Duration Selection
      await waitFor(() => {
        expect(getByText('Select Duration')).toBeTruthy();
      });

      fireEvent.press(getByText('4 Hours'));
      fireEvent.press(getByText('Next'));

      // Step 3: Driver Selection
      await waitFor(() => {
        expect(getByText('Select Chauffeur')).toBeTruthy();
      });

      const firstDriverCard = getByTestId(`driver-card-${mockDrivers[0].id}`);
      fireEvent.press(within(firstDriverCard).getByText('Select Driver'));

      // Step 4: Booking Confirmation
      await waitFor(() => {
        expect(getByText('Booking Summary')).toBeTruthy();
      });

      fireEvent.press(getByTestId('terms-checkbox'));
      fireEvent.press(getByTestId('payment-method-upi'));
      
      const upiInput = getByTestId('upi-id-input');
      fireEvent.changeText(upiInput, 'test@okaxis');
      
      fireEvent.press(getByText('Confirm Booking'));

      // Step 5: Booking Confirmation Success
      await waitFor(() => {
        expect(getByText('Booking Confirmed!')).toBeTruthy();
        expect(getByText('Your OTP: 123456')).toBeTruthy();
      });

      expect(bookingStore.createBooking).toHaveBeenCalledWith({
        pickup_location: expect.objectContaining(mockCustomerLocation),
        destination: expect.objectContaining(mockDestination),
        duration_hours: 4,
        driver_id: mockDrivers[0].id,
        payment_method: 'upi',
        upi_id: 'test@okaxis'
      });
    });

    it('handles location permission denied', async () => {
      mockServices.location.getCurrentLocation.mockRejectedValue(
        new Error('Location permission denied')
      );

      const { getByText, getByTestId } = render(<BookingFlow />);

      await waitFor(() => {
        expect(getByText('Location access required')).toBeTruthy();
        expect(getByText('Please enable location permissions')).toBeTruthy();
      });

      // Manual location entry should be available
      fireEvent.press(getByText('Enter Manually'));
      
      const manualInput = getByTestId('manual-location-input');
      fireEvent.changeText(manualInput, 'Connaught Place, New Delhi');
      fireEvent.press(getByText('Use This Location'));

      await waitFor(() => {
        expect(getByText('Select Duration')).toBeTruthy();
      });
    });

    it('handles no available drivers scenario', async () => {
      (bookingStore.getAvailableDrivers as jest.Mock).mockResolvedValue([]);

      const { getByText, getByTestId } = render(<BookingFlow />);

      // Complete location and duration steps
      await completeLocationStep(getByTestId, getByText);
      await completeDurationStep(getByText);

      // Driver selection should show no drivers message
      await waitFor(() => {
        expect(getByText('No drivers available')).toBeTruthy();
        expect(getByText('Try adjusting your pickup time')).toBeTruthy();
      });

      fireEvent.press(getByText('Refresh'));

      // Should retry fetching drivers
      expect(bookingStore.getAvailableDrivers).toHaveBeenCalledTimes(2);
    });

    it('handles surge pricing during booking', async () => {
      const surgeMultiplier = 2.0;
      (bookingStore.calculateTotal as jest.Mock).mockReturnValue({
        baseAmount: 2000,
        surgeMultiplier,
        platformFee: 100,
        gstAmount: 756, // Higher GST due to surge
        totalAmount: 4856,
      });

      const { getByText, getByTestId } = render(<BookingFlow />);

      await completeBookingSteps(getByTestId, getByText);

      // Should show surge pricing notification
      await waitFor(() => {
        expect(getByText('High Demand - Surge Pricing Active')).toBeTruthy();
        expect(getByText('2.0x')).toBeTruthy();
        expect(getByText('₹4,856')).toBeTruthy();
      });

      // User should acknowledge surge pricing
      fireEvent.press(getByText('I Accept Surge Pricing'));
      fireEvent.press(getByText('Confirm Booking'));

      expect(bookingStore.createBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          surge_multiplier: surgeMultiplier,
          total_amount: 4856
        })
      );
    });
  });

  describe('Payment Integration', () => {
    it('processes UPI payment successfully', async () => {
      mockServices.stripe.createUPIPayment.mockResolvedValue({
        id: 'upi_test_123',
        status: 'requires_confirmation'
      });
      
      mockServices.stripe.confirmUPIPayment.mockResolvedValue({
        id: 'upi_test_123',
        status: 'succeeded'
      });

      const { getByTestId, getByText } = render(<BookingFlow />);

      await completeBookingSteps(getByTestId, getByText);

      fireEvent.press(getByTestId('payment-method-upi'));
      const upiInput = getByTestId('upi-id-input');
      fireEvent.changeText(upiInput, 'customer@paytm');
      
      fireEvent.press(getByText('Confirm Booking'));

      await waitFor(() => {
        expect(mockServices.stripe.createUPIPayment).toHaveBeenCalledWith({
          amount: 2478,
          currency: 'INR',
          payment_method: {
            type: 'upi',
            upi: { vpa: 'customer@paytm' }
          }
        });
      });

      expect(getByText('Booking Confirmed!')).toBeTruthy();
    });

    it('handles payment failure and retry', async () => {
      mockServices.stripe.confirmPayment
        .mockResolvedValueOnce({
          error: { message: 'Your card was declined.' }
        })
        .mockResolvedValueOnce({
          paymentIntent: { id: 'pi_123', status: 'succeeded' },
          error: null
        });

      const { getByTestId, getByText } = render(<BookingFlow />);

      await completeBookingSteps(getByTestId, getByText);

      // First payment attempt fails
      fireEvent.press(getByTestId('payment-method-card'));
      fireEvent.press(getByText('Confirm Booking'));

      await waitFor(() => {
        expect(getByText('Payment failed: Your card was declined.')).toBeTruthy();
        expect(getByText('Try Another Payment Method')).toBeTruthy();
      });

      // Retry with UPI
      fireEvent.press(getByTestId('payment-method-upi'));
      const upiInput = getByTestId('upi-id-input');
      fireEvent.changeText(upiInput, 'customer@okaxis');
      
      fireEvent.press(getByText('Confirm Booking'));

      await waitFor(() => {
        expect(getByText('Booking Confirmed!')).toBeTruthy();
      });
    });

    it('handles GST calculation for business booking', async () => {
      (bookingStore.calculateTotal as jest.Mock).mockReturnValue({
        baseAmount: 5000,
        platformFee: 250,
        gstAmount: 945,
        igst: 945, // Interstate booking
        totalAmount: 6195,
      });

      const { getByTestId, getByText } = render(<BookingFlow businessBooking />);

      await completeBookingSteps(getByTestId, getByText);

      // Should show GST breakdown
      expect(getByText('IGST (18%): ₹945')).toBeTruthy();
      expect(getByText('Total (incl. taxes): ₹6,195')).toBeTruthy();
    });
  });

  describe('Real-time Updates', () => {
    it('updates driver locations in real-time', async () => {
      const { getByTestId, getByText } = render(<BookingFlow />);

      await completeLocationStep(getByTestId, getByText);
      await completeDurationStep(getByText);

      // Initial driver locations
      await waitFor(() => {
        expect(getByTestId(`driver-eta-${mockDrivers[0].id}`)).toHaveTextContent('5 mins away');
      });

      // Simulate driver location update
      const updatedLocation = { 
        latitude: mockCustomerLocation.latitude + 0.01,
        longitude: mockCustomerLocation.longitude + 0.01
      };
      
      mockServices.location.calculateETA
        .mockResolvedValueOnce(3); // Closer now

      // Trigger location update
      act(() => {
        // This would typically come from real-time subscription
        updateDriverLocation(mockDrivers[0].id, updatedLocation);
      });

      await waitFor(() => {
        expect(getByTestId(`driver-eta-${mockDrivers[0].id}`)).toHaveTextContent('3 mins away');
      });
    });

    it('removes drivers that go offline', async () => {
      const { getByTestId, getByText, queryByTestId } = render(<BookingFlow />);

      await completeLocationStep(getByTestId, getByText);
      await completeDurationStep(getByText);

      // All drivers should be visible initially
      await waitFor(() => {
        mockDrivers.forEach(driver => {
          expect(getByTestId(`driver-card-${driver.id}`)).toBeTruthy();
        });
      });

      // Simulate driver going offline
      act(() => {
        updateDriverStatus(mockDrivers[0].id, { is_online: false });
      });

      await waitFor(() => {
        expect(queryByTestId(`driver-card-${mockDrivers[0].id}`)).toBeNull();
      });

      // Should show message about driver availability change
      expect(getByText('Driver availability updated')).toBeTruthy();
    });

    it('handles booking acceptance by driver', async () => {
      const { getByTestId, getByText } = render(<BookingFlow />);

      await completeBookingSteps(getByTestId, getByText);
      
      fireEvent.press(getByText('Confirm Booking'));

      // Simulate booking being accepted
      act(() => {
        updateBookingStatus(mockBooking.id, 'confirmed');
      });

      await waitFor(() => {
        expect(getByText('Your chauffeur is on the way!')).toBeTruthy();
        expect(getByText('Track Your Ride')).toBeTruthy();
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('handles network errors gracefully', async () => {
      // Simulate network failure during driver loading
      (bookingStore.getAvailableDrivers as jest.Mock)
        .mockRejectedValueOnce(new Error('Network request failed'))
        .mockResolvedValue(mockDrivers);

      const { getByTestId, getByText } = render(<BookingFlow />);

      await completeLocationStep(getByTestId, getByText);
      await completeDurationStep(getByText);

      await waitFor(() => {
        expect(getByText('Unable to load available drivers')).toBeTruthy();
        expect(getByText('Check your internet connection')).toBeTruthy();
      });

      // Retry should work
      fireEvent.press(getByText('Retry'));

      await waitFor(() => {
        expect(getByTestId(`driver-card-${mockDrivers[0].id}`)).toBeTruthy();
      });
    });

    it('handles booking creation failure', async () => {
      (bookingStore.createBooking as jest.Mock)
        .mockRejectedValueOnce(new Error('Server temporarily unavailable'))
        .mockResolvedValue({ success: true, bookingId: mockBooking.id });

      const { getByTestId, getByText } = render(<BookingFlow />);

      await completeBookingSteps(getByTestId, getByText);
      
      fireEvent.press(getByText('Confirm Booking'));

      await waitFor(() => {
        expect(getByText('Booking failed')).toBeTruthy();
        expect(getByText('Server temporarily unavailable')).toBeTruthy();
        expect(getByText('Try Again')).toBeTruthy();
      });

      fireEvent.press(getByText('Try Again'));

      await waitFor(() => {
        expect(getByText('Booking Confirmed!')).toBeTruthy();
      });
    });

    it('handles session expiry during booking', async () => {
      (bookingStore.createBooking as jest.Mock).mockRejectedValue(
        new Error('Authentication required')
      );

      const { getByTestId, getByText } = render(<BookingFlow />);

      await completeBookingSteps(getByTestId, getByText);
      
      fireEvent.press(getByText('Confirm Booking'));

      await waitFor(() => {
        expect(getByText('Session expired')).toBeTruthy();
        expect(getByText('Please login again')).toBeTruthy();
      });

      // Should redirect to login
      fireEvent.press(getByText('Login'));
      expect(getByText('Phone Number')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles extremely long distance booking', async () => {
      const longDistanceDestination = {
        latitude: 19.0760, // Mumbai
        longitude: 72.8777,
        address: 'Mumbai, Maharashtra, India'
      };

      mockServices.location.calculateDistance.mockReturnValue(1400); // 1400 km
      (bookingStore.calculateTotal as jest.Mock).mockReturnValue({
        baseAmount: 25000,
        platformFee: 1250,
        gstAmount: 4725,
        totalAmount: 30975,
        warning: 'Long distance booking - estimated duration 20+ hours'
      });

      const { getByTestId, getByText } = render(<BookingFlow />);

      // Complete location selection with long distance
      const pickupInput = getByTestId('pickup-location-input');
      fireEvent.changeText(pickupInput, 'Connaught Place');
      
      const destinationInput = getByTestId('destination-input');
      fireEvent.changeText(destinationInput, 'Mumbai');
      fireEvent.press(getByText('Mumbai, Maharashtra, India'));

      await waitFor(() => {
        expect(getByText('Long distance booking detected')).toBeTruthy();
        expect(getByText('1400 km journey')).toBeTruthy();
        expect(getByText('Consider flight booking instead')).toBeTruthy();
      });

      fireEvent.press(getByText('Continue with Chauffeur'));

      // Should show extended duration options
      expect(getByText('12 Hours')).toBeTruthy();
      expect(getByText('24 Hours')).toBeTruthy();
    });

    it('handles booking during maintenance window', async () => {
      (bookingStore.createBooking as jest.Mock).mockRejectedValue(
        new Error('Service temporarily unavailable - maintenance in progress')
      );

      const { getByTestId, getByText } = render(<BookingFlow />);

      await completeBookingSteps(getByTestId, getByText);
      
      fireEvent.press(getByText('Confirm Booking'));

      await waitFor(() => {
        expect(getByText('Service Temporarily Unavailable')).toBeTruthy();
        expect(getByText('We are currently performing maintenance')).toBeTruthy();
        expect(getByText('Expected completion: 30 minutes')).toBeTruthy();
      });
    });

    it('handles booking with special requirements', async () => {
      const { getByTestId, getByText } = render(<BookingFlow />);

      await completeLocationStep(getByTestId, getByText);

      // Add special requirements
      fireEvent.press(getByText('Special Requirements'));
      fireEvent.press(getByTestId('requirement-child-seat'));
      fireEvent.press(getByTestId('requirement-wheelchair'));

      await completeDurationStep(getByText);

      // Should filter drivers based on requirements
      await waitFor(() => {
        expect(getByText('Drivers matching your requirements')).toBeTruthy();
      });

      expect(bookingStore.getAvailableDrivers).toHaveBeenCalledWith(
        expect.objectContaining({
          specialRequirements: ['child_seat', 'wheelchair_accessible']
        })
      );
    });
  });

  // Helper functions
  const completeLocationStep = async (getByTestId: any, getByText: any) => {
    const pickupInput = getByTestId('pickup-location-input');
    fireEvent.changeText(pickupInput, 'Connaught Place');
    fireEvent.press(getByText('Connaught Place, New Delhi'));

    const destinationInput = getByTestId('destination-input');
    fireEvent.changeText(destinationInput, 'Noida');
    fireEvent.press(getByText('Noida, Uttar Pradesh'));

    fireEvent.press(getByText('Next'));
  };

  const completeDurationStep = async (getByText: any) => {
    await waitFor(() => {
      expect(getByText('Select Duration')).toBeTruthy();
    });

    fireEvent.press(getByText('4 Hours'));
    fireEvent.press(getByText('Next'));
  };

  const completeBookingSteps = async (getByTestId: any, getByText: any) => {
    await completeLocationStep(getByTestId, getByText);
    await completeDurationStep(getByText);

    // Select driver
    await waitFor(() => {
      expect(getByText('Select Chauffeur')).toBeTruthy();
    });

    const firstDriverCard = getByTestId(`driver-card-${mockDrivers[0].id}`);
    fireEvent.press(within(firstDriverCard).getByText('Select Driver'));

    // Reach confirmation
    await waitFor(() => {
      expect(getByText('Booking Summary')).toBeTruthy();
    });

    fireEvent.press(getByTestId('terms-checkbox'));
  };

  const updateDriverLocation = (driverId: string, location: any) => {
    // Simulate real-time location update
  };

  const updateDriverStatus = (driverId: string, status: any) => {
    // Simulate real-time status update
  };

  const updateBookingStatus = (bookingId: string, status: string) => {
    // Simulate real-time booking status update
  };
});

// Mock Booking Flow Component
const BookingFlow = ({ businessBooking }: { businessBooking?: boolean }) => {
  const [step, setStep] = React.useState(1);
  const [pickupLocation, setPickupLocation] = React.useState(null);
  const [destination, setDestination] = React.useState(null);
  const [duration, setDuration] = React.useState(0);
  const [selectedDriver, setSelectedDriver] = React.useState(null);
  const [booking, setBooking] = React.useState(null);

  const handleNext = () => setStep(step + 1);

  if (step === 1) {
    return <LocationSelection onNext={handleNext} />;
  }
  if (step === 2) {
    return <DurationSelection onNext={handleNext} />;
  }
  if (step === 3) {
    return <DriverSelection onNext={handleNext} />;
  }
  if (step === 4) {
    return <BookingConfirmation businessBooking={businessBooking} />;
  }

  return <BookingSuccess />;
};

// Mock step components would go here...
const LocationSelection = ({ onNext }: any) => <div>Location Selection Component</div>;
const DurationSelection = ({ onNext }: any) => <div>Duration Selection Component</div>;
const DriverSelection = ({ onNext }: any) => <div>Driver Selection Component</div>;
const BookingConfirmation = ({ businessBooking }: any) => <div>Booking Confirmation Component</div>;
const BookingSuccess = () => <div>Booking Success Component</div>;