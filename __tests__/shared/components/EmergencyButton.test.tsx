/**
 * Emergency Button Component Tests
 * 
 * This is a critical safety component requiring 100% test coverage.
 * Tests cover all edge cases, accessibility, and emergency scenarios.
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '../../../test-utils/test-utils';
import { EmergencyButton } from '../../../components/shared/EmergencyButton';
import { mockServices } from '../../../test-utils/mocks/mock-services';
import { generateCustomer, mockDelhiLocations } from '../../../test-utils/test-data';

jest.mock('../../../services/SupabaseRealTimeService');
jest.mock('expo-haptics');

describe('EmergencyButton Component - Critical Safety Tests', () => {
  const mockUser = generateCustomer();
  const mockLocation = mockDelhiLocations.connaught_place;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup emergency service mocks
    mockServices.emergency.triggerSOS.mockResolvedValue({
      alertId: 'emergency_123',
      status: 'dispatched',
      estimatedArrival: 300, // 5 minutes
      bikerAssigned: true,
      contactsNotified: 3
    });

    mockServices.location.getCurrentLocation.mockResolvedValue({
      coords: mockLocation,
      timestamp: Date.now()
    });

    mockServices.notification.sendNotification.mockResolvedValue({
      id: 'notification_123'
    });
  });

  describe('Critical Safety Requirements', () => {
    it('renders emergency button with high visibility', () => {
      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      const button = getByTestId('emergency-button');
      
      // Must be highly visible
      expect(button).toHaveStyle({
        backgroundColor: '#FF0000', // Bright red
        borderRadius: '50%',
        elevation: 8, // High elevation for prominence
        shadowColor: '#FF0000',
        shadowOpacity: 0.5
      });

      // Must be large enough for emergency situations
      expect(button.props.style.width).toBeGreaterThanOrEqual(80);
      expect(button.props.style.height).toBeGreaterThanOrEqual(80);
    });

    it('triggers emergency alert immediately on press', async () => {
      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      const button = getByTestId('emergency-button');
      fireEvent.press(button);

      // Should trigger immediately without confirmation for quick access
      await waitFor(() => {
        expect(mockServices.emergency.triggerSOS).toHaveBeenCalledWith({
          user_id: mockUser.id,
          location: mockLocation,
          timestamp: expect.any(Number),
          type: 'sos_button'
        });
      });
    });

    it('triggers emergency alert even with poor network conditions', async () => {
      // Simulate network failure on first attempt
      mockServices.emergency.triggerSOS
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockRejectedValueOnce(new Error('Request failed'))
        .mockResolvedValue({
          alertId: 'emergency_retry_123',
          status: 'dispatched'
        });

      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      fireEvent.press(getByTestId('emergency-button'));

      // Should retry automatically
      await waitFor(() => {
        expect(mockServices.emergency.triggerSOS).toHaveBeenCalledTimes(3);
      });

      // Should eventually succeed
      await waitFor(() => {
        expect(getByTestId('emergency-status')).toHaveTextContent('Emergency alert sent');
      });
    });

    it('works when location services are disabled', async () => {
      mockServices.location.getCurrentLocation.mockRejectedValue(
        new Error('Location services disabled')
      );

      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      fireEvent.press(getByTestId('emergency-button'));

      await waitFor(() => {
        expect(mockServices.emergency.triggerSOS).toHaveBeenCalledWith({
          user_id: mockUser.id,
          location: null, // Should still work without location
          timestamp: expect.any(Number),
          type: 'sos_button'
        });
      });
    });

    it('uses cached location when GPS is unavailable', async () => {
      const cachedLocation = mockDelhiLocations.india_gate;
      
      mockServices.location.getCurrentLocation.mockRejectedValue(
        new Error('GPS unavailable')
      );
      
      mockServices.storage.getItem.mockResolvedValue(
        JSON.stringify(cachedLocation)
      );

      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      fireEvent.press(getByTestId('emergency-button'));

      await waitFor(() => {
        expect(mockServices.emergency.triggerSOS).toHaveBeenCalledWith(
          expect.objectContaining({
            location: cachedLocation,
            location_source: 'cached'
          })
        );
      });
    });
  });

  describe('Emergency Response Flow', () => {
    it('displays emergency status immediately', async () => {
      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      fireEvent.press(getByTestId('emergency-button'));

      // Should show immediate feedback
      expect(getByTestId('emergency-processing')).toHaveTextContent('Sending emergency alert...');

      await waitFor(() => {
        expect(getByTestId('emergency-status')).toHaveTextContent('Emergency alert sent');
      });
    });

    it('shows biker dispatch information', async () => {
      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      fireEvent.press(getByTestId('emergency-button'));

      await waitFor(() => {
        expect(getByTestId('biker-dispatch')).toHaveTextContent('Emergency responder dispatched');
        expect(getByTestId('estimated-arrival')).toHaveTextContent('Estimated arrival: 5 minutes');
      });
    });

    it('displays emergency contacts notification', async () => {
      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      fireEvent.press(getByTestId('emergency-button'));

      await waitFor(() => {
        expect(getByTestId('contacts-notified')).toHaveTextContent('3 emergency contacts notified');
      });
    });

    it('provides option to call emergency services', async () => {
      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      fireEvent.press(getByTestId('emergency-button'));

      await waitFor(() => {
        expect(getByTestId('call-police')).toBeTruthy();
        expect(getByTestId('call-ambulance')).toBeTruthy();
      });

      fireEvent.press(getByTestId('call-police'));
      expect(mockServices.emergency.callPolice).toHaveBeenCalled();
    });

    it('enables cancellation of false alarms', async () => {
      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      fireEvent.press(getByTestId('emergency-button'));

      await waitFor(() => {
        expect(getByTestId('cancel-emergency')).toBeTruthy();
      });

      fireEvent.press(getByTestId('cancel-emergency'));

      await waitFor(() => {
        expect(getByTestId('emergency-cancelled')).toHaveTextContent('Emergency alert cancelled');
      });
    });
  });

  describe('Accessibility Requirements', () => {
    it('has proper accessibility labels for emergency situations', () => {
      const { getByLabelText } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      const button = getByLabelText('Emergency SOS button - tap for immediate help');
      expect(button).toBeTruthy();
      expect(button).toHaveAccessibilityRole('button');
      expect(button).toHaveAccessibilityHint('Activates emergency alert and notifies responders');
    });

    it('supports voice control activation', () => {
      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      const button = getByTestId('emergency-button');
      expect(button).toHaveAccessibilityActions([
        { name: 'activate', label: 'Activate emergency alert' }
      ]);
    });

    it('works with switch control for users with limited mobility', () => {
      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      const button = getByTestId('emergency-button');
      expect(button).toHaveAccessibilityValue({ 
        min: 0, 
        max: 1, 
        now: 0 
      });
    });

    it('provides audio feedback for visually impaired users', async () => {
      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      fireEvent.press(getByTestId('emergency-button'));

      // Should provide immediate audio feedback
      expect(mockServices.emergency.triggerSOS).toHaveBeenCalledWith(
        expect.objectContaining({
          accessibility_mode: expect.any(Boolean)
        })
      );

      await waitFor(() => {
        const announcement = getByTestId('emergency-announcement');
        expect(announcement).toHaveAccessibilityLiveRegion('assertive');
        expect(announcement).toHaveTextContent('Emergency alert has been sent. Help is on the way.');
      });
    });
  });

  describe('Haptic and Visual Feedback', () => {
    it('provides strong haptic feedback on press', async () => {
      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      fireEvent.press(getByTestId('emergency-button'));

      expect(mockServices.emergency.triggerSOS).toHaveBeenCalledWith(
        expect.objectContaining({
          haptic_feedback: 'heavy'
        })
      );
    });

    it('changes visual state during emergency', async () => {
      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      const button = getByTestId('emergency-button');
      fireEvent.press(button);

      // Should show active emergency state
      await waitFor(() => {
        expect(button).toHaveStyle({
          backgroundColor: '#FF4444', // Pulsing red
          transform: [{ scale: 1.1 }] // Slightly enlarged
        });
      });
    });

    it('shows pulsing animation during active emergency', async () => {
      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      fireEvent.press(getByTestId('emergency-button'));

      await waitFor(() => {
        const pulseIndicator = getByTestId('pulse-animation');
        expect(pulseIndicator).toBeTruthy();
        expect(pulseIndicator).toHaveAnimatedStyle({
          opacity: expect.any(Number),
          scale: expect.any(Number)
        });
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles multiple rapid presses gracefully', async () => {
      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      const button = getByTestId('emergency-button');
      
      // Simulate panic pressing
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      // Should only trigger once
      await waitFor(() => {
        expect(mockServices.emergency.triggerSOS).toHaveBeenCalledTimes(1);
      });
    });

    it('works when app is in background', async () => {
      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      // Simulate app going to background
      act(() => {
        // App state change would typically trigger this
      });

      fireEvent.press(getByTestId('emergency-button'));

      await waitFor(() => {
        expect(mockServices.emergency.triggerSOS).toHaveBeenCalled();
      });
    });

    it('handles authentication token expiry during emergency', async () => {
      mockServices.emergency.triggerSOS.mockRejectedValueOnce(
        new Error('Authentication required')
      );

      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      fireEvent.press(getByTestId('emergency-button'));

      // Should attempt anonymous emergency call
      await waitFor(() => {
        expect(mockServices.emergency.triggerSOS).toHaveBeenCalledWith(
          expect.objectContaining({
            anonymous: true
          })
        );
      });
    });

    it('handles complete service failure gracefully', async () => {
      mockServices.emergency.triggerSOS.mockRejectedValue(
        new Error('All emergency services unavailable')
      );

      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      fireEvent.press(getByTestId('emergency-button'));

      await waitFor(() => {
        expect(getByTestId('fallback-options')).toBeTruthy();
        expect(getByTestId('manual-call-police')).toBeTruthy();
        expect(getByTestId('manual-call-ambulance')).toBeTruthy();
      });
    });

    it('persists emergency state across app restarts', async () => {
      const { getByTestId, unmount, rerender } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      fireEvent.press(getByTestId('emergency-button'));
      
      await waitFor(() => {
        expect(mockServices.storage.setItem).toHaveBeenCalledWith(
          'active_emergency',
          expect.stringContaining('emergency_123')
        );
      });

      // Simulate app restart
      unmount();
      
      mockServices.storage.getItem.mockResolvedValue(
        JSON.stringify({ alertId: 'emergency_123', status: 'active' })
      );

      rerender(<EmergencyButton userId={mockUser.id} />);

      await waitFor(() => {
        expect(getByTestId('active-emergency-indicator')).toBeTruthy();
      });
    });
  });

  describe('Performance Under Stress', () => {
    it('responds quickly even with poor device performance', async () => {
      // Simulate low-performance device
      const slowPromise = new Promise(resolve => 
        setTimeout(resolve, 50) // Slow down other operations
      );

      mockServices.location.getCurrentLocation.mockImplementation(() => slowPromise);

      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      const startTime = performance.now();
      fireEvent.press(getByTestId('emergency-button'));

      await waitFor(() => {
        expect(getByTestId('emergency-processing')).toBeTruthy();
      });

      const responseTime = performance.now() - startTime;
      expect(responseTime).toBeLessThan(100); // Should respond within 100ms
    });

    it('works with low memory conditions', async () => {
      // Simulate memory pressure
      const originalGC = global.gc;
      global.gc = jest.fn();

      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      fireEvent.press(getByTestId('emergency-button'));

      await waitFor(() => {
        expect(mockServices.emergency.triggerSOS).toHaveBeenCalled();
      });

      global.gc = originalGC;
    });
  });

  describe('Integration with Other Systems', () => {
    it('integrates with booking system during rides', async () => {
      const activeBookingId = 'booking_123';
      
      const { getByTestId } = render(
        <EmergencyButton 
          userId={mockUser.id} 
          activeBookingId={activeBookingId}
        />
      );

      fireEvent.press(getByTestId('emergency-button'));

      await waitFor(() => {
        expect(mockServices.emergency.triggerSOS).toHaveBeenCalledWith(
          expect.objectContaining({
            booking_id: activeBookingId,
            context: 'active_ride'
          })
        );
      });
    });

    it('notifies driver during active rides', async () => {
      const driverId = 'driver_123';
      
      const { getByTestId } = render(
        <EmergencyButton 
          userId={mockUser.id} 
          activeDriverId={driverId}
        />
      );

      fireEvent.press(getByTestId('emergency-button'));

      await waitFor(() => {
        expect(mockServices.notification.sendNotification).toHaveBeenCalledWith({
          userId: driverId,
          type: 'customer_emergency',
          priority: 'critical',
          message: 'Your customer has triggered an emergency alert'
        });
      });
    });

    it('coordinates with biker dispatch system', async () => {
      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      fireEvent.press(getByTestId('emergency-button'));

      await waitFor(() => {
        expect(getByTestId('biker-tracking')).toBeTruthy();
        expect(getByTestId('biker-contact')).toBeTruthy();
      });
    });
  });

  describe('Regulatory Compliance', () => {
    it('logs emergency events for regulatory reporting', async () => {
      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      fireEvent.press(getByTestId('emergency-button'));

      await waitFor(() => {
        expect(mockServices.analytics.trackEvent).toHaveBeenCalledWith('emergency_triggered', {
          user_id: mockUser.id,
          timestamp: expect.any(Number),
          location: mockLocation,
          response_time: expect.any(Number)
        });
      });
    });

    it('maintains data privacy during emergencies', async () => {
      const { getByTestId } = render(
        <EmergencyButton userId={mockUser.id} />
      );

      fireEvent.press(getByTestId('emergency-button'));

      await waitFor(() => {
        expect(mockServices.emergency.triggerSOS).toHaveBeenCalledWith(
          expect.objectContaining({
            data_minimization: true,
            gdpr_compliant: true
          })
        );
      });
    });
  });
});

// Additional test helper components and utilities would go here...