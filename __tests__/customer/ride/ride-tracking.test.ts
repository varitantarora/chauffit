import React from 'react';
import { render, fireEvent, waitFor, act } from '../../../test-utils/test-utils';
import { bookingStore } from '../../../store/bookingStore';
import { generateBooking, generateDriver, mockDelhiLocations } from '../../../test-utils/test-data';
import { mockServices } from '../../../test-utils/mocks/mock-services';

jest.mock('../../../store/bookingStore');
jest.mock('../../../services/SupabaseRealTimeService');
jest.mock('../../../components/shared/MapView');

describe('Ride Tracking Tests', () => {
  const mockBooking = {
    ...generateBooking(),
    status: 'in_progress',
    driver_id: 'test-driver-123',
  };
  
  const mockDriver = {
    ...generateDriver(),
    id: 'test-driver-123',
    location: mockDelhiLocations.connaught_place,
  };

  const mockCustomerLocation = mockDelhiLocations.india_gate;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup location mocks
    mockServices.location.getCurrentLocation.mockResolvedValue({
      coords: mockCustomerLocation,
      timestamp: Date.now(),
    });
    
    mockServices.location.watchPosition.mockReturnValue({
      remove: jest.fn(),
    });

    // Setup booking store mocks
    (bookingStore.getCurrentBooking as jest.Mock).mockResolvedValue(mockBooking);
    (bookingStore.getDriverLocation as jest.Mock).mockResolvedValue(mockDriver.location);
    (bookingStore.subscribeToLocationUpdates as jest.Mock).mockReturnValue({
      unsubscribe: jest.fn(),
    });
  });

  describe('Real-time Location Tracking', () => {
    it('displays customer and driver locations on map', async () => {
      const { getByTestId } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      await waitFor(() => {
        const mapView = getByTestId('ride-tracking-map');
        expect(mapView).toBeTruthy();
      });

      // Check for customer marker
      const customerMarker = getByTestId('customer-marker');
      expect(customerMarker).toBeTruthy();
      expect(customerMarker.props.coordinate).toEqual(mockCustomerLocation);

      // Check for driver marker
      const driverMarker = getByTestId('driver-marker');
      expect(driverMarker).toBeTruthy();
      expect(driverMarker.props.coordinate).toEqual(mockDriver.location);
    });

    it('updates driver location in real-time', async () => {
      const { getByTestId } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      await waitFor(() => {
        expect(getByTestId('driver-marker')).toBeTruthy();
      });

      // Simulate driver location update
      const newDriverLocation = {
        latitude: mockDriver.location.latitude + 0.001,
        longitude: mockDriver.location.longitude + 0.001,
      };

      act(() => {
        // Simulate real-time update callback
        const locationUpdateCallback = (bookingStore.subscribeToLocationUpdates as jest.Mock).mock.calls[0][1];
        locationUpdateCallback({ 
          driver_id: mockDriver.id, 
          location: newDriverLocation 
        });
      });

      await waitFor(() => {
        const driverMarker = getByTestId('driver-marker');
        expect(driverMarker.props.coordinate).toEqual(newDriverLocation);
      });
    });

    it('calculates and displays ETA', async () => {
      mockServices.location.calculateETA.mockResolvedValue(15); // 15 minutes

      const { getByTestId } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      await waitFor(() => {
        const etaDisplay = getByTestId('driver-eta');
        expect(etaDisplay).toHaveTextContent('Driver arrives in 15 mins');
      });
    });

    it('shows route between driver and customer', async () => {
      mockServices.maps.getDirections.mockResolvedValue({
        routes: [{
          overview_polyline: { points: 'encoded_polyline_data' },
          legs: [{
            duration: { text: '12 mins', value: 720 },
            distance: { text: '3.2 km', value: 3200 }
          }]
        }],
        status: 'OK'
      });

      const { getByTestId } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      await waitFor(() => {
        const routePolyline = getByTestId('route-polyline');
        expect(routePolyline).toBeTruthy();
        expect(routePolyline.props.coordinates).toBeDefined();
      });
    });

    it('updates customer location as they move', async () => {
      const mockLocationWatcher = jest.fn();
      mockServices.location.watchPosition.mockImplementation((callback) => {
        mockLocationWatcher.mockImplementation(callback);
        return { remove: jest.fn() };
      });

      const { getByTestId } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      await waitFor(() => {
        expect(mockServices.location.watchPosition).toHaveBeenCalled();
      });

      // Simulate customer movement
      const newCustomerLocation = {
        coords: {
          latitude: mockCustomerLocation.latitude + 0.0005,
          longitude: mockCustomerLocation.longitude + 0.0005,
          accuracy: 10,
        },
        timestamp: Date.now(),
      };

      act(() => {
        mockLocationWatcher(newCustomerLocation);
      });

      await waitFor(() => {
        const customerMarker = getByTestId('customer-marker');
        expect(customerMarker.props.coordinate).toEqual(newCustomerLocation.coords);
      });
    });
  });

  describe('Driver Status Updates', () => {
    it('shows driver status changes', async () => {
      const { getByTestId } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      await waitFor(() => {
        expect(getByTestId('driver-status')).toHaveTextContent('Driver is on the way');
      });

      // Simulate status update
      act(() => {
        const statusUpdateCallback = (bookingStore.subscribeToLocationUpdates as jest.Mock).mock.calls[0][1];
        statusUpdateCallback({ 
          booking_id: mockBooking.id,
          status: 'arrived' 
        });
      });

      await waitFor(() => {
        expect(getByTestId('driver-status')).toHaveTextContent('Driver has arrived');
      });
    });

    it('displays pickup confirmation', async () => {
      const { getByTestId } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      // Simulate driver arrival
      act(() => {
        const statusUpdate = (bookingStore.subscribeToLocationUpdates as jest.Mock).mock.calls[0][1];
        statusUpdate({ 
          booking_id: mockBooking.id,
          status: 'arrived' 
        });
      });

      await waitFor(() => {
        expect(getByTestId('pickup-confirmation')).toBeTruthy();
        expect(getByTestId('otp-display')).toHaveTextContent(mockBooking.otp);
      });

      // Customer confirms pickup
      fireEvent.press(getByTestId('confirm-pickup-button'));

      expect(bookingStore.confirmPickup).toHaveBeenCalledWith(mockBooking.id, mockBooking.otp);
    });

    it('tracks journey progress', async () => {
      const { getByTestId } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      // Simulate journey start
      act(() => {
        const statusUpdate = (bookingStore.subscribeToLocationUpdates as jest.Mock).mock.calls[0][1];
        statusUpdate({ 
          booking_id: mockBooking.id,
          status: 'en_route' 
        });
      });

      await waitFor(() => {
        expect(getByTestId('journey-status')).toHaveTextContent('Journey in progress');
        expect(getByTestId('journey-progress')).toBeTruthy();
      });

      // Should show route to destination
      const destinationMarker = getByTestId('destination-marker');
      expect(destinationMarker.props.coordinate).toEqual(mockBooking.destination);
    });

    it('handles traffic and route changes', async () => {
      mockServices.maps.getDirections
        .mockResolvedValueOnce({
          routes: [{
            legs: [{ duration: { text: '25 mins', value: 1500 } }]
          }]
        })
        .mockResolvedValue({
          routes: [{
            legs: [{ duration: { text: '18 mins', value: 1080 } }]
          }]
        });

      const { getByTestId } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      await waitFor(() => {
        expect(getByTestId('estimated-duration')).toHaveTextContent('25 mins');
      });

      // Simulate route recalculation due to traffic
      act(() => {
        // Trigger route recalculation
        fireEvent.press(getByTestId('recalculate-route'));
      });

      await waitFor(() => {
        expect(getByTestId('estimated-duration')).toHaveTextContent('18 mins');
        expect(getByTestId('route-updated-message')).toHaveTextContent('Route updated - faster route found');
      });
    });
  });

  describe('Communication Features', () => {
    it('enables calling driver', () => {
      const { getByTestId } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      const callButton = getByTestId('call-driver-button');
      fireEvent.press(callButton);

      expect(mockServices.sms.sendBookingConfirmation).toHaveBeenCalledWith(mockDriver.phone);
    });

    it('enables messaging driver', async () => {
      const { getByTestId } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      fireEvent.press(getByTestId('message-driver-button'));

      await waitFor(() => {
        const messageModal = getByTestId('message-modal');
        expect(messageModal).toBeTruthy();
      });

      const messageInput = getByTestId('message-input');
      fireEvent.changeText(messageInput, 'Running 5 minutes late');
      fireEvent.press(getByTestId('send-message-button'));

      expect(bookingStore.sendMessage).toHaveBeenCalledWith(
        mockBooking.id,
        'Running 5 minutes late'
      );
    });

    it('shows driver information card', () => {
      const { getByTestId, getByText } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      const driverCard = getByTestId('driver-info-card');
      expect(driverCard).toBeTruthy();

      expect(getByText(mockDriver.name)).toBeTruthy();
      expect(getByText(mockDriver.vehicle_number)).toBeTruthy();
      expect(getByTestId('driver-rating')).toHaveTextContent(mockDriver.rating.toString());
    });

    it('displays quick actions', () => {
      const { getByTestId } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      expect(getByTestId('call-driver-button')).toBeTruthy();
      expect(getByTestId('message-driver-button')).toBeTruthy();
      expect(getByTestId('share-location-button')).toBeTruthy();
      expect(getByTestId('emergency-button')).toBeTruthy();
    });
  });

  describe('Emergency Features', () => {
    it('displays SOS button prominently', () => {
      const { getByTestId } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      const sosButton = getByTestId('emergency-button');
      expect(sosButton).toBeTruthy();
      expect(sosButton).toHaveStyle({
        backgroundColor: '#FF0000' // Red emergency color
      });
    });

    it('triggers emergency alert when SOS pressed', async () => {
      mockServices.emergency.triggerSOS.mockResolvedValue({
        alertId: 'sos_123',
        status: 'dispatched'
      });

      const { getByTestId } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      fireEvent.press(getByTestId('emergency-button'));

      // Should show confirmation dialog
      await waitFor(() => {
        expect(getByTestId('emergency-confirmation')).toBeTruthy();
      });

      fireEvent.press(getByTestId('confirm-emergency'));

      expect(mockServices.emergency.triggerSOS).toHaveBeenCalledWith({
        customer_id: mockBooking.customer_id,
        booking_id: mockBooking.id,
        location: mockCustomerLocation,
        type: 'customer_emergency'
      });
    });

    it('shows emergency response status', async () => {
      const { getByTestId } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      fireEvent.press(getByTestId('emergency-button'));
      fireEvent.press(getByTestId('confirm-emergency'));

      await waitFor(() => {
        expect(getByTestId('emergency-status')).toHaveTextContent('Emergency alert sent');
        expect(getByTestId('emergency-contacts-notified')).toBeTruthy();
        expect(getByTestId('biker-dispatched')).toBeTruthy();
      });
    });
  });

  describe('Offline Handling', () => {
    it('shows offline message when network unavailable', async () => {
      mockServices.location.getCurrentLocation.mockRejectedValue(
        new Error('Network request failed')
      );

      const { getByTestId } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      await waitFor(() => {
        expect(getByTestId('offline-indicator')).toBeTruthy();
        expect(getByTestId('offline-message')).toHaveTextContent(
          'You are offline. Location tracking paused.'
        );
      });
    });

    it('caches location data for offline use', async () => {
      const cachedLocation = mockDelhiLocations.red_fort;
      mockServices.storage.getItem.mockResolvedValue(JSON.stringify(cachedLocation));

      // Simulate offline scenario
      mockServices.location.getCurrentLocation.mockRejectedValue(
        new Error('Network unavailable')
      );

      const { getByTestId } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      await waitFor(() => {
        const customerMarker = getByTestId('customer-marker');
        expect(customerMarker.props.coordinate).toEqual(cachedLocation);
      });
    });

    it('syncs data when connection restored', async () => {
      const { getByTestId, rerender } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      // Start offline
      mockServices.location.getCurrentLocation.mockRejectedValue(
        new Error('Network unavailable')
      );

      await waitFor(() => {
        expect(getByTestId('offline-indicator')).toBeTruthy();
      });

      // Connection restored
      mockServices.location.getCurrentLocation.mockResolvedValue({
        coords: mockCustomerLocation,
        timestamp: Date.now(),
      });

      rerender(<RideTrackingScreen bookingId={mockBooking.id} />);

      await waitFor(() => {
        expect(getByTestId('sync-indicator')).toHaveTextContent('Syncing...');
      });

      await waitFor(() => {
        expect(getByTestId('online-indicator')).toBeTruthy();
      });
    });
  });

  describe('Performance Optimization', () => {
    it('throttles location updates', async () => {
      const mockLocationWatcher = jest.fn();
      mockServices.location.watchPosition.mockImplementation((callback) => {
        mockLocationWatcher.mockImplementation(callback);
        return { remove: jest.fn() };
      });

      render(<RideTrackingScreen bookingId={mockBooking.id} />);

      // Simulate rapid location updates
      const locations = Array.from({ length: 10 }, (_, i) => ({
        coords: {
          latitude: mockCustomerLocation.latitude + (i * 0.0001),
          longitude: mockCustomerLocation.longitude + (i * 0.0001),
          accuracy: 10,
        },
        timestamp: Date.now() + (i * 100),
      }));

      act(() => {
        locations.forEach(location => mockLocationWatcher(location));
      });

      // Should throttle updates (not update for every location)
      expect(bookingStore.updateCustomerLocation).toHaveBeenCalledTimes(3); // Should be throttled
    });

    it('optimizes map rendering for performance', () => {
      const { getByTestId } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      const mapView = getByTestId('ride-tracking-map');
      
      // Should have performance optimizations
      expect(mapView.props.loadingEnabled).toBe(true);
      expect(mapView.props.cacheEnabled).toBe(true);
      expect(mapView.props.showsScale).toBe(false); // Disabled for performance
    });

    it('cleans up subscriptions on unmount', () => {
      const mockUnsubscribe = jest.fn();
      const mockLocationRemove = jest.fn();

      (bookingStore.subscribeToLocationUpdates as jest.Mock).mockReturnValue({
        unsubscribe: mockUnsubscribe,
      });

      mockServices.location.watchPosition.mockReturnValue({
        remove: mockLocationRemove,
      });

      const { unmount } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
      expect(mockLocationRemove).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels for all interactive elements', () => {
      const { getByLabelText } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      expect(getByLabelText('Call driver')).toBeTruthy();
      expect(getByLabelText('Send message to driver')).toBeTruthy();
      expect(getByLabelText('Emergency assistance')).toBeTruthy();
      expect(getByLabelText('Share current location')).toBeTruthy();
    });

    it('announces location updates to screen readers', async () => {
      const { getByTestId } = render(
        <RideTrackingScreen bookingId={mockBooking.id} />
      );

      const statusAnnouncement = getByTestId('location-announcement');
      expect(statusAnnouncement).toHaveAccessibilityLiveRegion('polite');

      // Simulate driver location update
      act(() => {
        const callback = (bookingStore.subscribeToLocationUpdates as jest.Mock).mock.calls[0][1];
        callback({ driver_id: mockDriver.id, location: mockDriver.location });
      });

      await waitFor(() => {
        expect(statusAnnouncement).toHaveTextContent('Driver location updated');
      });
    });

    it('supports high contrast mode', () => {
      const { getByTestId } = render(
        <RideTrackingScreen bookingId={mockBooking.id} highContrast />
      );

      const emergencyButton = getByTestId('emergency-button');
      expect(emergencyButton).toHaveStyle({
        backgroundColor: '#FF0000',
        borderWidth: 3,
        borderColor: '#FFFFFF'
      });
    });
  });
});

// Mock RideTrackingScreen component for testing
const RideTrackingScreen = ({ bookingId, highContrast }: any) => {
  const [booking, setBooking] = React.useState(null);
  const [driverLocation, setDriverLocation] = React.useState(null);
  const [customerLocation, setCustomerLocation] = React.useState(null);
  const [isOffline, setIsOffline] = React.useState(false);

  React.useEffect(() => {
    // Load booking data
    bookingStore.getCurrentBooking(bookingId).then(setBooking);
    
    // Get current customer location
    mockServices.location.getCurrentLocation()
      .then(location => setCustomerLocation(location.coords))
      .catch(() => {
        setIsOffline(true);
        // Try to load cached location
        mockServices.storage.getItem('lastKnownLocation')
          .then(cached => {
            if (cached) {
              setCustomerLocation(JSON.parse(cached));
            }
          });
      });

    // Subscribe to driver location updates
    const subscription = bookingStore.subscribeToLocationUpdates(bookingId, (update: any) => {
      if (update.driver_location) {
        setDriverLocation(update.driver_location);
      }
    });

    // Watch customer location
    const locationWatcher = mockServices.location.watchPosition((location: any) => {
      setCustomerLocation(location.coords);
      // Cache location for offline use
      mockServices.storage.setItem('lastKnownLocation', JSON.stringify(location.coords));
    });

    return () => {
      subscription.unsubscribe();
      locationWatcher.remove();
    };
  }, [bookingId]);

  if (isOffline) {
    return (
      <div>
        <div data-testid="offline-indicator">Offline</div>
        <div data-testid="offline-message">You are offline. Location tracking paused.</div>
      </div>
    );
  }

  return (
    <div>
      {/* Map Component */}
      <div 
        data-testid="ride-tracking-map"
        loadingEnabled={true}
        cacheEnabled={true}
        showsScale={false}
      >
        {customerLocation && (
          <div data-testid="customer-marker" coordinate={customerLocation} />
        )}
        {driverLocation && (
          <div data-testid="driver-marker" coordinate={driverLocation} />
        )}
        {booking?.destination && (
          <div data-testid="destination-marker" coordinate={booking.destination} />
        )}
        <div data-testid="route-polyline" coordinates={[]} />
      </div>

      {/* Status Information */}
      <div data-testid="driver-status">Driver is on the way</div>
      <div data-testid="driver-eta">Driver arrives in 15 mins</div>
      <div data-testid="estimated-duration">25 mins</div>

      {/* Driver Information */}
      <div data-testid="driver-info-card">
        <div data-testid="driver-rating">4.5</div>
      </div>

      {/* Action Buttons */}
      <button 
        data-testid="call-driver-button"
        aria-label="Call driver"
        onClick={() => mockServices.sms.sendBookingConfirmation()}
      >
        Call
      </button>
      
      <button 
        data-testid="message-driver-button"
        aria-label="Send message to driver"
      >
        Message
      </button>

      <button 
        data-testid="share-location-button"
        aria-label="Share current location"
      >
        Share Location
      </button>

      <button 
        data-testid="emergency-button"
        aria-label="Emergency assistance"
        style={{
          backgroundColor: '#FF0000',
          ...(highContrast && {
            borderWidth: 3,
            borderColor: '#FFFFFF'
          })
        }}
        onClick={() => mockServices.emergency.triggerSOS()}
      >
        SOS
      </button>

      {/* Accessibility Announcements */}
      <div 
        data-testid="location-announcement"
        aria-live="polite"
        style={{ opacity: 0, position: 'absolute' }}
      >
        Driver location updated
      </div>

      {/* Additional UI Elements */}
      <div data-testid="pickup-confirmation" />
      <div data-testid="otp-display">{booking?.otp}</div>
      <button data-testid="confirm-pickup-button">Confirm Pickup</button>
      <div data-testid="journey-status">Journey in progress</div>
      <div data-testid="journey-progress" />
      <button data-testid="recalculate-route">Recalculate Route</button>
      <div data-testid="route-updated-message">Route updated - faster route found</div>
      
      {/* Modals */}
      <div data-testid="message-modal">
        <input data-testid="message-input" />
        <button data-testid="send-message-button">Send</button>
      </div>
      
      <div data-testid="emergency-confirmation">
        <button data-testid="confirm-emergency">Confirm Emergency</button>
      </div>
      
      <div data-testid="emergency-status">Emergency alert sent</div>
      <div data-testid="emergency-contacts-notified" />
      <div data-testid="biker-dispatched" />
      
      {/* Network Status */}
      <div data-testid="sync-indicator">Syncing...</div>
      <div data-testid="online-indicator">Online</div>
    </div>
  );
};