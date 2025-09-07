import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Supabase Auth Mock
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      user: {
        id: 'test-user-123',
        phone: '+919876543210',
        email: 'test@example.com',
      },
    });
  }),

  // Supabase Database Mocks
  http.get('*/rest/v1/users', () => {
    return HttpResponse.json([
      {
        id: 'test-user-123',
        phone: '+919876543210',
        name: 'Test User',
        created_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  http.get('*/rest/v1/drivers', () => {
    return HttpResponse.json([
      {
        id: 'test-driver-123',
        name: 'Test Driver',
        phone: '+919876543211',
        vehicle_number: 'DL 01 AB 1234',
        vehicle_type: 'sedan',
        rating: 4.5,
        is_online: true,
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
        },
      },
    ]);
  }),

  http.get('*/rest/v1/bikers', () => {
    return HttpResponse.json([
      {
        id: 'test-biker-123',
        name: 'Test Biker',
        phone: '+919876543212',
        vehicle_number: 'DL 05 XY 9876',
        rating: 4.8,
        is_available: true,
        response_time: 5,
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
        },
      },
    ]);
  }),

  http.get('*/rest/v1/bookings', () => {
    return HttpResponse.json([
      {
        id: 'test-booking-123',
        customer_id: 'test-user-123',
        driver_id: 'test-driver-123',
        pickup_location: {
          latitude: 28.6139,
          longitude: 77.2090,
          address: 'Connaught Place, New Delhi',
        },
        destination: {
          latitude: 28.5355,
          longitude: 77.3910,
          address: 'Noida Sector 62',
        },
        duration_hours: 4,
        total_amount: 2000,
        status: 'confirmed',
        created_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  http.post('*/rest/v1/bookings', () => {
    return HttpResponse.json({
      id: 'new-booking-123',
      status: 'pending',
      created_at: new Date().toISOString(),
    });
  }),

  http.get('*/rest/v1/tasks', () => {
    return HttpResponse.json([
      {
        id: 'test-task-123',
        type: 'emergency',
        priority: 'high',
        customer_id: 'test-user-123',
        biker_id: 'test-biker-123',
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
          address: 'Emergency Location',
        },
        description: 'Emergency assistance required',
        status: 'assigned',
        created_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  // Stripe Payment Mocks
  http.post('*/v1/payment_intents', () => {
    return HttpResponse.json({
      id: 'pi_test_123',
      client_secret: 'pi_test_123_secret',
      status: 'requires_payment_method',
      amount: 200000, // ₹2000 in paisa
      currency: 'inr',
    });
  }),

  http.post('*/v1/payment_methods', () => {
    return HttpResponse.json({
      id: 'pm_test_123',
      type: 'card',
      card: {
        brand: 'visa',
        last4: '4242',
      },
    });
  }),

  http.post('*/v1/setup_intents', () => {
    return HttpResponse.json({
      id: 'seti_test_123',
      client_secret: 'seti_test_123_secret',
      status: 'requires_payment_method',
    });
  }),

  // Google Maps API Mocks
  http.get('*/maps/api/geocode/json', ({ request }) => {
    const url = new URL(request.url);
    const address = url.searchParams.get('address');
    const latlng = url.searchParams.get('latlng');

    if (address) {
      return HttpResponse.json({
        results: [
          {
            formatted_address: 'New Delhi, Delhi, India',
            geometry: {
              location: { lat: 28.6139, lng: 77.2090 },
            },
            place_id: 'test_place_id',
          },
        ],
        status: 'OK',
      });
    }

    if (latlng) {
      return HttpResponse.json({
        results: [
          {
            formatted_address: 'Connaught Place, New Delhi, Delhi, India',
            geometry: {
              location: { lat: 28.6139, lng: 77.2090 },
            },
            place_id: 'test_place_id',
          },
        ],
        status: 'OK',
      });
    }

    return HttpResponse.json({ results: [], status: 'ZERO_RESULTS' });
  }),

  http.get('*/maps/api/directions/json', () => {
    return HttpResponse.json({
      routes: [
        {
          overview_polyline: {
            points: 'test_polyline_points',
          },
          legs: [
            {
              duration: { text: '45 mins', value: 2700 },
              distance: { text: '25 km', value: 25000 },
              start_address: 'Connaught Place, New Delhi',
              end_address: 'Noida Sector 62',
            },
          ],
        },
      ],
      status: 'OK',
    });
  }),

  http.get('*/maps/api/place/autocomplete/json', () => {
    return HttpResponse.json({
      predictions: [
        {
          description: 'Connaught Place, New Delhi, Delhi, India',
          place_id: 'test_place_id_1',
          structured_formatting: {
            main_text: 'Connaught Place',
            secondary_text: 'New Delhi, Delhi, India',
          },
        },
        {
          description: 'India Gate, New Delhi, Delhi, India',
          place_id: 'test_place_id_2',
          structured_formatting: {
            main_text: 'India Gate',
            secondary_text: 'New Delhi, Delhi, India',
          },
        },
      ],
      status: 'OK',
    });
  }),

  // SMS API Mock (for OTP)
  http.post('*/sms/send', () => {
    return HttpResponse.json({
      status: 'sent',
      message_id: 'test_sms_123',
    });
  }),

  // OneSignal Push Notification Mock
  http.post('*/notifications', () => {
    return HttpResponse.json({
      id: 'test_notification_123',
      recipients: 1,
    });
  }),

  // Emergency Services Mock
  http.post('*/emergency/alert', () => {
    return HttpResponse.json({
      alert_id: 'emergency_alert_123',
      status: 'dispatched',
      estimated_arrival: 300, // 5 minutes
    });
  }),

  // Fallback handler for unhandled requests
  http.get('*', ({ request }) => {
    console.warn(`Unhandled request: ${request.url}`);
    return new HttpResponse(null, { status: 404 });
  }),
];

export const server = setupServer(...handlers);