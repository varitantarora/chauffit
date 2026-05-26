# Chauffit API Integration Guide

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Base API Service](#base-api-service)
4. [Authentication Service](#authentication-service)
5. [Booking Service (Customer)](#booking-service-customer)
6. [Driver API Service](#driver-api-service)
7. [Driver Rides Service](#driver-rides-service)
8. [Biker API Service](#biker-api-service)
9. [Biker Task Service](#biker-task-service)
10. [Payment Service](#payment-service)
11. [Insurance Service](#insurance-service)
12. [Admin API Service](#admin-api-service)
13. [Customer Car Service](#customer-car-service)
14. [Location Service](#location-service)
15. [Config Service](#config-service)
16. [Other Services](#other-services)
17. [Payment Integration (Razorpay)](#payment-integration-razorpay)
18. [Real-Time (Supabase)](#real-time-supabase)
19. [Error Handling Patterns](#error-handling-patterns)
20. [Token Refresh Flow](#token-refresh-flow)
21. [FormData / File Uploads](#formdata--file-uploads)
22. [Field Mapping Reference](#field-mapping-reference)
23. [Troubleshooting](#troubleshooting)

---

## Overview

Chauffit is a ride-hailing platform with three user roles: **Customer**, **Driver**, and **Biker**. The frontend is a React Native (Expo) app that communicates with a Django REST backend. All API calls flow through a centralized `BaseApiService` singleton, and specialized service classes extend it with domain-specific endpoints.

The backend follows RESTful conventions with JWT-based authentication. All endpoints are prefixed with `/api/v1/`.

### Key Files

| Purpose | File |
|---|---|
| Base HTTP client | `services/api/BaseApiService.ts` |
| Environment config | `config/env.ts` |
| Auth endpoints | `services/api/AuthApiService.ts` |
| Customer bookings | `services/api/BookingApiService.ts` |
| Driver profile/earnings | `services/api/DriverApiService.ts` |
| Driver ride actions | `services/api/DriverRidesApiService.ts` |
| Biker profile/vehicles | `services/api/BikerApiService.ts` |
| Biker task actions | `services/api/BikerTaskApiService.ts` |
| Payment/Razorpay | `services/api/PaymentApiService.ts` |
| Razorpay flow wrapper | `services/RazorpayService.ts` |
| Insurance plans | `services/api/InsuranceApiService.ts` |
| Admin dashboard | `services/api/AdminApiService.ts` |
| Customer vehicles | `services/api/CustomerCarApiService.ts` |
| Saved locations | `services/api/LocationApiService.ts` |
| Feature flags/config | `services/api/ConfigApiService.ts` |
| Real-time channels | `services/SupabaseRealTimeService.ts` |

---

## Getting Started

### Environment Variables

Copy `.env.example` to `.env` and configure these variables:

```
EXPO_PUBLIC_API_BASE_URL=http://54.234.146.195/api/v1
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
EXPO_PUBLIC_RAZORPAY_KEY_ID=<your-razorpay-key>
```

If `EXPO_PUBLIC_API_BASE_URL` is not set, the app falls back to `http://54.234.146.195/api/v1`.

The `config/env.ts` module reads all environment variables at startup and exposes them through the `appConfig` object. It also supports environment-specific overrides for `development`, `staging`, and `production`.

### Importing a Service

Every service is exported as a **singleton**. Import and call methods directly:

```typescript
import AuthApiService from '../services/api/AuthApiService';
import BookingApiService from '../services/api/BookingApiService';
import DriverApiService from '../services/api/DriverApiService';

// Example: login
const result = await AuthApiService.login({ email: 'user@example.com', password: 'secret' });
if (result.success) {
  console.log('Logged in as', result.data?.user?.full_name);
}
```

---

## Base API Service

**File:** `services/api/BaseApiService.ts`

Exported as `default new BaseApiService()` -- a single shared instance used by all other services.

### Core Methods

| Method | Signature |
|---|---|
| `get<T>` | `get(endpoint, params?, includeAuth?)` |
| `post<T>` | `post(endpoint, data?, includeAuth?, isFormData?)` |
| `put<T>` | `put(endpoint, data?, includeAuth?, isFormData?)` |
| `patch<T>` | `patch(endpoint, data?, includeAuth?, isFormData?)` |
| `delete<T>` | `delete(endpoint, includeAuth?)` |

All methods return `Promise<ApiResponse<T>>`.

### API Response Type

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  message?: string;
  errors?: Record<string, string[]>;
}
```

### Token Management

| Method | Description |
|---|---|
| `setTokens(access, refresh)` | Stores both tokens in AsyncStorage and memory |
| `clearTokens()` | Removes both tokens |
| `ensureTokensLoaded()` | Awaits the initial AsyncStorage read (called internally) |
| `getAccessToken()` | Returns the in-memory access token |

Tokens are stored under keys `access_token` and `refresh_token` in AsyncStorage.

### Request Lifecycle

1. If `includeAuth` is true, `ensureTokensLoaded()` waits for the initial AsyncStorage read.
2. The full URL is built via `getApiUrl(endpoint, params)` from `config/env.ts`.
3. Headers are constructed with `Content-Type: application/json` and `Authorization: Bearer <token>`.
4. Request and response are logged to console with timing. Sensitive fields (passwords, tokens) are replaced with `***HIDDEN***`.
5. On a **401** response, the service attempts one automatic token refresh and retries the request. If refresh fails, tokens are cleared and a "Session expired" error is returned.

### URL Construction

`getApiUrl()` (in `config/env.ts`) concatenates `appConfig.apiBaseUrl` (which already includes `/api/v1`) with the endpoint path. Remaining params not consumed by path replacement are appended as query strings.

---

## Authentication Service

**File:** `services/api/AuthApiService.ts`

### Endpoints

| Action | Method | Endpoint | Auth Required |
|---|---|---|---|
| Email/password login | POST | `/auth/login/` | No |
| Register | POST | `/auth/register/` | No |
| Refresh token | POST | `/auth/refresh/` | No |
| Logout | POST | `/auth/logout/` | Yes |
| Get profile | GET | `/auth/profile/` | Yes |
| Update profile (PUT) | PUT | `/auth/profile/` | Yes |
| Update profile (PATCH) | PATCH | `/auth/profile/` | Yes |
| Change password | POST | `/auth/change-password/` | Yes |
| Send OTP | POST | `/auth/send-otp/` | No |
| Verify OTP | POST | `/auth/otp-login/verify/` | No |
| OTP login send | POST | `/auth/otp-login/send/` | No |
| OTP login verify | POST | `/auth/otp-login/verify/` | No |
| OTP register | POST | `/auth/register-with-otp/` | No |
| Delete account send OTP | POST | `/auth/delete-account/send-otp/` | Yes |
| Delete account confirm | POST | `/auth/delete-account/` | Yes |

### Key Types

```typescript
interface User {
  id: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  user_type: string;
  is_verified: boolean;
  status: 'active' | 'inactive';
  // ... see file for full type
}

interface LoginResponse {
  user: User;
  tokens: { access: string; refresh: string };
}
```

### Usage Examples

```typescript
// Email login
const result = await AuthApiService.login({ email: 'user@example.com', password: 'pass' });

// OTP login (two-step)
await AuthApiService.otpLoginSend({ phone_number: '+919876543210' });
const verifyResult = await AuthApiService.otpLoginVerify({ phone_number: '+919876543210', otp: '1234' });

// Update profile with photo (FormData auto-detected)
await AuthApiService.updateProfile({
  first_name: 'John',
  profile_picture: { uri: '...', name: 'photo.jpg', type: 'image/jpeg' },
});

// Delete account
await AuthApiService.sendDeleteAccountOTP();
await AuthApiService.deleteAccount({ otp: '1234' });
```

After successful login/register, tokens are automatically stored in AsyncStorage via `BaseApiService.setTokens()`.

---

## Booking Service (Customer)

**File:** `services/api/BookingApiService.ts`

### Endpoints

| Action | Method | Endpoint |
|---|---|---|
| List rides | GET | `/rides/` |
| Ride detail | GET | `/rides/{id}/` |
| Active ride | GET | `/rides/active/` |
| Book ride | POST | `/rides/book/` |
| Fare estimate | POST | `/rides/estimate/` |
| Cancel ride | POST | `/rides/{id}/cancel/` |
| Schedule availability | POST | `/rides/schedule/check-availability/` |

### Booking Status Values

`requested`, `driver_assigned`, `biker_assigned`, `driver_en_route`, `driver_arrived`, `trip_started`, `trip_completed`, `cancelled_by_customer`, `cancelled_by_driver`, `cancelled_by_system`

### Trip Types

`one_way`, `round_trip`, `hourly`, `multi_stop`

### Fare Estimate

The fare estimate endpoint normalizes the backend response. The raw backend uses a `breakdown` field, but the service maps it to `fare_breakdown` for UI consistency:

```typescript
const estimate = await BookingApiService.getFareEstimate({
  vehicle_id: 'uuid',
  from_lat: 28.6,
  from_long: 77.2,
  to_lat: 28.5,
  to_long: 77.1,
  type: 'one_way',
});
// estimate.data.fare_breakdown contains: base_fare, distance_fare, surge_amount, gst_amount, etc.
```

### Booking with Insurance

```typescript
const booking = await BookingApiService.bookRide({
  vehicle_id: 'uuid',
  from_lat: 28.6, from_long: 77.2, from_address: 'Pickup',
  to_lat: 28.5, to_long: 77.1, to_address: 'Drop',
  type: 'one_way',
  insurance_plan_id: 'plan-uuid',   // optional
  stops: [{ stop_number: 1, address: 'Midpoint', lat: 28.55, long: 77.15 }],
});
```

### Known Issue

`bookingStore.ts` methods `loadAvailableChauffeurs` and `createBooking` still use mock data with simulated delays. These have not been fully replaced with the API service calls yet.

---

## Driver API Service

**File:** `services/api/DriverApiService.ts`

### Profile & Onboarding

| Action | Method | Endpoint |
|---|---|---|
| Get own profile | GET | `/drivers/` |
| Get profile by ID | GET | `/drivers/{id}/` |
| Create profile | POST | `/drivers/` |
| Update profile (PUT) | PUT | `/drivers/{id}/` |
| Update profile (PATCH) | PATCH | `/drivers/{id}/` |
| Delete profile | DELETE | `/drivers/{id}/` |
| Onboarding status | GET | `/drivers/onboarding-status/` |
| Aadhaar send OTP | POST | `/drivers/aadhaar/send-otp/` |
| Aadhaar verify OTP | POST | `/drivers/aadhaar/verify-otp/` |

### Onboarding Status Flow

```
registered -> verification_in_progress -> verified_ready_for_training
  -> training_scheduled -> certified -> active
```

Possible failure/rejection states: `verification_failed`, `training_failed`, `suspended`, `rejected`.

### Documents

| Action | Method | Endpoint |
|---|---|---|
| Get documents | GET | `/drivers/documents/` |
| Upload document | POST | `/drivers/documents/upload/` |

Document types include: `driving_license_front`, `driving_license_back`, `aadhaar_front`, `aadhaar_back`, `live_selfie`, `pan_card`, `passport`, `police_verification`, `medical_certificate`, `profile_photo`, and more.

### Earnings

| Action | Method | Endpoint |
|---|---|---|
| Earnings summary | GET | `/drivers/earnings/` |
| Daily earnings | GET | `/earnings/driver/daily/` |
| Bonuses & incentives | GET | `/earnings/driver/bonuses/` |
| Driver stats | GET | `/drivers/stats/` |

### Training

| Action | Method | Endpoint |
|---|---|---|
| Training schedule | GET | `/drivers/training/` |
| Reschedule training | POST | `/drivers/training/reschedule/` |
| Request retake | POST | `/drivers/training/request-retake/` |

### Location & Status

| Action | Method | Endpoint |
|---|---|---|
| Update location | POST | `/drivers/location/` |
| Update online status | POST | `/drivers/status/` |

---

## Driver Rides Service

**File:** `services/api/DriverRidesApiService.ts`

### Endpoints

| Action | Method | Endpoint |
|---|---|---|
| List assigned rides | GET | `/rides/driver/` |
| Pending (available) rides | GET | `/rides/driver/pending/` |
| Ride detail | GET | `/rides/driver/{id}/` |
| Accept ride | POST | `/rides/driver/{id}/accept/` |
| Update status (en_route/arrived) | POST | `/rides/driver/{id}/status/` |
| Start trip | POST | `/rides/driver/{id}/start/` |
| Complete trip | POST | `/rides/driver/{id}/complete/` |
| Cancel ride | POST | `/rides/driver/{id}/cancel/` |
| Send OTP | POST | `/rides/driver/{id}/send-otp/` |
| Verify OTP + start | POST | `/rides/driver/{id}/verify-otp-start/` |
| Rate customer | POST | `/rides/driver/{id}/rate-customer/` |

### Typical Driver Ride Flow

```
getPendingRides() -> acceptRide(id) -> updateRideStatus(id, { status: 'driver_en_route' })
  -> updateRideStatus(id, { status: 'driver_arrived' })
  -> verifyOtpAndStart(id, otp) or startTrip(id)
  -> completeTrip(id, { dropoff_lat, dropoff_long })
  -> rateCustomer(id, 5)
```

### Filtering Rides

```typescript
// Get in-progress rides
const result = await DriverRidesApiService.getDriverRides('in-progress');

// Get pending rides within 30km
const pending = await DriverRidesApiService.getPendingRides(30);
```

---

## Biker API Service

**File:** `services/api/BikerApiService.ts`

### Profile & CRUD

| Action | Method | Endpoint |
|---|---|---|
| Get own profile | GET | `/bikers/` |
| Get profile by ID | GET | `/bikers/{id}/` |
| Create profile | POST | `/bikers/` |
| Update profile (PUT) | PUT | `/bikers/{id}/` |
| Update profile (PATCH) | PATCH | `/bikers/{id}/` |
| Delete profile | DELETE | `/bikers/{id}/` |
| Earnings summary | GET | `/bikers/earnings/` |
| Stats | GET | `/bikers/stats/` |
| Daily earnings | GET | `/earnings/biker/daily/` |
| Bonuses | GET | `/earnings/biker/bonuses/` |

### Vehicles

| Action | Method | Endpoint |
|---|---|---|
| Get vehicles | GET | `/bikers/vehicles/` |
| Add vehicle | POST | `/bikers/vehicles/` |
| Update vehicle (PUT) | PUT | `/bikers/vehicles/{id}/` |
| Update vehicle (PATCH) | PATCH | `/bikers/vehicles/{id}/` |
| Delete vehicle | DELETE | `/bikers/vehicles/{id}/` |

### Documents

| Action | Method | Endpoint |
|---|---|---|
| Get documents | GET | `/bikers/documents/` |
| Upload document | POST | `/bikers/documents/upload/` |

### Location & Status

| Action | Method | Endpoint |
|---|---|---|
| Update location | POST | `/bikers/location/` |
| Update online status | POST | `/bikers/status/` |

---

## Biker Task Service

**File:** `services/api/BikerTaskApiService.ts`

### Endpoints

| Action | Method | Endpoint |
|---|---|---|
| List tasks | GET | `/biker-tasks/` |
| Pending tasks | GET | `/biker-tasks/pending/` |
| Task detail | GET | `/biker-tasks/{id}/` |
| Create task | POST | `/biker-tasks/` |
| Accept task | POST | `/biker-tasks/{id}/accept/` |
| Cancel task | POST | `/biker-tasks/{id}/cancel/` |
| Update task status | POST | `/biker-tasks/{id}/status/` |
| Rate task | POST | `/biker-tasks/{id}/rate/` |

### Task Status Flow

```
requested -> assigned -> accepted -> en_route_to_driver -> arrived_at_driver
  -> driver_picked_up -> en_route_to_customer -> arrived_at_customer -> completed
```

Cancellation states: `cancelled_by_biker`, `cancelled_by_driver`, `cancelled_by_system`.

### Filtering Tasks

```typescript
const tasks = await BikerTaskApiService.getTasks({ filter: 'ongoing' });
// filter options: 'all', 'available', 'ongoing', 'completed'
```

### Task Status Update

```typescript
await BikerTaskApiService.updateTaskStatus(taskId, {
  task_status: 'en_route_to_driver'
});
```

---

## Payment Service

**File:** `services/api/PaymentApiService.ts`

### Endpoints

| Action | Method | Endpoint |
|---|---|---|
| Create Razorpay order | POST | `/payments/razorpay/create-order/` |
| Get saved payment methods | GET | `/payments/razorpay/payment-methods/` |
| Verify Razorpay payment | POST | `/payments/razorpay/verify/` |

### Creating an Order

```typescript
const order = await PaymentApiService.createRazorpayOrder('booking-uuid', 500.00, 'INR');
// order.data = { order_id, amount, currency, payment_id, key_id }
```

### Verifying Payment

```typescript
await PaymentApiService.verifyRazorpayPayment({
  razorpay_order_id: '...',
  razorpay_payment_id: '...',
  razorpay_signature: '...',
  payment_id: '...',  // internal payment ID from order creation
});
```

---

## Insurance Service

**File:** `services/api/InsuranceApiService.ts`

### Endpoints

| Action | Method | Endpoint |
|---|---|---|
| List plans | GET | `/insurance/plans/` |
| Plan detail | GET | `/insurance/plans/{id}/` |

### Plan Tiers

- `scratch` -- Basic scratch coverage
- `scratch_and_dent` -- Enhanced protection for scratches and dents
- `full` -- Comprehensive coverage

### Utility Methods

The service includes helpers: `parseAmount()`, `getTierDisplayName()`, `getTierColor()`, `isRecommendedPlan()`, `formatCoverageAmount()`, `formatPremiumAmount()`.

---

## Admin API Service

**File:** `services/api/AdminApiService.ts`

All admin endpoints are under `/admin/`.

### Dashboard & Analytics

| Action | Method | Endpoint |
|---|---|---|
| Dashboard stats | GET | `/admin/dashboard/` |
| Analytics | GET | `/admin/analytics/` |
| Revenue | GET | `/admin/revenue/` |

### Users

| Action | Method | Endpoint |
|---|---|---|
| List users | GET | `/admin/users/` |
| User detail | GET | `/admin/users/{id}/` |
| Update user status | PUT | `/admin/users/{id}/status/` |

### Drivers

| Action | Method | Endpoint |
|---|---|---|
| List drivers | GET | `/admin/drivers/` |
| Pending drivers | GET | `/admin/drivers/pending/` |
| Driver detail | GET | `/admin/drivers/{id}/` |
| Verify driver | PUT | `/admin/drivers/{id}/verify/` |
| Verify document | PUT | `/admin/drivers/{id}/documents/{docId}/verify/` |
| Update driver status | PATCH | `/admin/drivers/{id}/` |

### Bikers

| Action | Method | Endpoint |
|---|---|---|
| List bikers | GET | `/admin/bikers/` |
| Pending bikers | GET | `/admin/bikers/pending/` |
| Biker detail | GET | `/admin/bikers/{id}/` |
| Verify biker | PUT | `/admin/bikers/{id}/verify/` |
| Update biker status | PATCH | `/admin/bikers/{id}/` |

### Rides

| Action | Method | Endpoint |
|---|---|---|
| List rides | GET | `/admin/rides/` |
| Ride detail | GET | `/admin/rides/{id}/` |
| Dispatch ride | PUT | `/admin/rides/{id}/dispatch/` |
| Cancel ride | PUT | `/admin/rides/{id}/cancel/` |

### Payments & Disputes

| Action | Method | Endpoint |
|---|---|---|
| List payments | GET | `/admin/payments/` |
| Payment detail | GET | `/admin/payments/{id}/` |
| List disputes | GET | `/admin/disputes/` |
| Dispute detail | GET | `/admin/disputes/{id}/` |
| Resolve dispute | PUT | `/admin/disputes/{id}/resolve/` |

### Pricing & Rate Cards

| Action | Method | Endpoint |
|---|---|---|
| List rate cards | GET | `/admin/pricing/rate-cards/` |
| Rate card detail | GET | `/admin/pricing/rate-cards/{id}/` |
| Update rate card | PATCH | `/admin/pricing/rate-cards/{id}/` |
| Get hourly hire settings | GET | `/admin/hourly-hire/` |
| Update hourly hire settings | PUT | `/admin/hourly-hire/` |

### Insurance Plans (Admin)

| Action | Method | Endpoint |
|---|---|---|
| List plans | GET | `/insurance/admin/plans/` |
| Plan detail | GET | `/insurance/admin/plans/{id}/` |
| Create plan | POST | `/insurance/admin/plans/` |
| Update plan | PUT | `/insurance/admin/plans/{id}/` |
| Delete plan | DELETE | `/insurance/admin/plans/{id}/` |

### Amenities (Admin)

| Action | Method | Endpoint |
|---|---|---|
| List amenities | GET | `/amenities/admin/` |
| Amenity detail | GET | `/amenities/admin/{id}/` |
| Create amenity | POST | `/amenities/admin/` |
| Update amenity | PUT | `/amenities/admin/{id}/` |
| Delete amenity | DELETE | `/amenities/admin/{id}/` |

### Training Batches

| Action | Method | Endpoint |
|---|---|---|
| List batches | GET | `/admin/training-batches/` |
| Batch detail | GET | `/admin/training-batches/{id}/` |
| Create batch | POST | `/admin/training-batches/` |
| Auto-assign batch | POST | `/admin/training-batches/{id}/auto-assign/` |
| Mark training results | POST | `/admin/training-batches/{id}/mark-results/` |

---

## Customer Car Service

**File:** `services/api/CustomerCarApiService.ts`

Endpoints under `/customers/cars/`.

| Action | Method | Endpoint |
|---|---|---|
| List cars | GET | `/customers/cars/` |
| Add car | POST | `/customers/cars/add/` |
| Update car (PUT) | PUT | `/customers/cars/{id}/update/` |
| Update car (PATCH) | PATCH | `/customers/cars/{id}/update/` |
| Delete car | DELETE | `/customers/cars/{id}/delete/` |

Vehicle types: `luxury_sedan`, `executive_suv`, `limousine`, `mercedes_sprinter`.

---

## Location Service

**File:** `services/api/LocationApiService.ts`

Endpoints under `/customers/locations/`.

| Action | Method | Endpoint |
|---|---|---|
| Add favorite location | POST | `/customers/locations/` |
| Get favorites | GET | `/customers/locations/favorites/` |
| Get all locations | GET | `/customers/locations/` |
| Update location | PATCH | `/customers/locations/{id}/locations/` |
| Delete location | DELETE | `/customers/locations/{id}/locations/` |

Location types: `home`, `work`, `favorite`, `recent`.

---

## Config Service

**File:** `services/api/ConfigApiService.ts`

Endpoints under `/meta/configs/`.

| Action | Method | Endpoint |
|---|---|---|
| Get all configs | GET | `/meta/configs/` |
| Get by key | GET | `/meta/configs/{key}/` |
| Create config | POST | `/meta/configs/` |
| Update config | PATCH | `/meta/configs/{key}/` |
| Delete config | DELETE | `/meta/configs/{key}/` |

Each config entry has: `key`, `name`, `value`, `value_type` (string|integer|float|boolean|json).

**Known Issue:** The `/meta/configs/` endpoint currently returns 404 (backend not implemented). All `fetchConfigs()` calls in the app are commented out to prevent infinite re-render loops.

---

## Other Services

These services exist in `services/api/` but are less commonly used:

| Service | File | Purpose |
|---|---|---|
| BlogApiService | `BlogApiService.ts` | Blog content management |
| LoyaltyApiService | `LoyaltyApiService.ts` | Loyalty/rewards program |
| NotificationApiService | `NotificationApiService.ts` | Push notifications |
| NotificationPreferencesApiService | `NotificationPreferencesApiService.ts` | Notification settings |
| MetaApiService | `MetaApiService.ts` | Metadata endpoints |
| AmenityApiService | `AmenityApiService.ts` | Amenity listing (customer-facing) |
| AdvertisementApiService | `AdvertisementApiService.ts` | Ad management |

---

## Payment Integration (Razorpay)

**File:** `services/RazorpayService.ts`

The `RazorpayService` wraps the complete payment flow:

### Flow

```
1. processPayment(bookingId, amount, userInfo)
   |
   +--> PaymentApiService.createRazorpayOrder(bookingId, amount)
   |       Returns: { order_id, amount, currency, payment_id, key_id }
   |
   +--> Razorpay.open(checkoutOptions)
   |       Opens native SDK checkout UI
   |       Options include: key, amount, currency, order_id, prefill, theme
   |
   +--> PaymentApiService.verifyRazorpayPayment({
   |       razorpay_order_id, razorpay_payment_id,
   |       razorpay_signature, payment_id
   |     })
   |
   +--> Returns { success: true, paymentId } or { success: false, error }
```

### Usage

```typescript
import RazorpayService from '../services/RazorpayService';

const result = await RazorpayService.processPayment(
  'booking-uuid',
  500.00,
  { name: 'John Doe', email: 'john@example.com', phone: '+919876543210' }
);

if (result.success) {
  console.log('Payment successful:', result.paymentId);
} else {
  console.log('Payment failed:', result.error);
}
```

The Razorpay checkout theme color is set to `#720C17` (burgundy, the Chauffit brand color).

**Note:** The Razorpay native module requires a Development Client build (not Expo Go). If the module is not available, the service returns a descriptive error message.

---

## Real-Time (Supabase)

**File:** `services/SupabaseRealTimeService.ts`

The real-time service uses Supabase broadcast channels for live features.

### Initialization

```typescript
import SupabaseRealTimeService from '../services/SupabaseRealTimeService';

await SupabaseRealTimeService.initialize(userId, 'driver');
```

### Location Tracking

```typescript
// Start tracking (sends own location every 5s / 10m, receives others' updates)
await SupabaseRealTimeService.startLocationTracking((update) => {
  console.log('Location update from', update.userId, update.latitude, update.longitude);
});

// Stop tracking
SupabaseRealTimeService.stopLocationTracking();
```

Uses `expo-location` with `watchPositionAsync` (high accuracy, 5s interval, 10m distance threshold).

### Booking Updates

```typescript
SupabaseRealTimeService.subscribeToBookingUpdates(bookingId, (update) => {
  console.log('Booking', update.id, 'status:', update.status);
});

// Unsubscribe when done
SupabaseRealTimeService.unsubscribeFromBookingUpdates(bookingId);
```

Listens to `UPDATE` events on the `bookings` table filtered by booking ID.

### Emergency Alerts

```typescript
// Subscribe to alerts within a radius
SupabaseRealTimeService.subscribeToEmergencyAlerts(
  5,  // 5km radius
  { lat: 28.6, lng: 77.2 },
  (alert) => {
    console.log('Emergency:', alert.alertType, alert.message);
  }
);

// Send an alert
await SupabaseRealTimeService.sendEmergencyAlert(
  { lat: 28.6, lng: 77.2 },
  'Near MG Road',
  'security',
  'Suspicious activity'
);
```

Uses Haversine formula for distance calculation. Alert types: `general`, `medical`, `security`, `vehicle`.

### Chat

```typescript
SupabaseRealTimeService.subscribeToChat(bookingId, (message) => {
  console.log('Message from', message.senderType, ':', message.message);
});

await SupabaseRealTimeService.sendChatMessage(bookingId, 'Hello!');
```

Message types: `text`, `location`, `image`.

### Cleanup

```typescript
await SupabaseRealTimeService.cleanup();
```

Sets user offline, removes all channel subscriptions, and stops location tracking.

---

## Error Handling Patterns

### Standard Pattern

All service methods follow the same error handling convention:

```typescript
const result = await SomeApiService.someMethod(params);

if (result.success) {
  // Use result.data
} else {
  // Handle result.error
  console.error(result.error);
  if (result.errors) {
    // Field-level validation errors: { field_name: ['error message'] }
  }
}
```

### Error Response Structure

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;          // Human-readable error message
  errorCode?: string;      // Machine-readable error code
  message?: string;        // Info/success message
  errors?: Record<string, string[]>;  // Field-level validation errors
}
```

### Common Error Scenarios

| Scenario | `success` | `error` value |
|---|---|---|
| Network failure | `false` | `"Network error occurred"` |
| 401 Unauthorized (refresh failed) | `false` | `"Session expired. Please login again."` |
| 404 Not Found | `false` | `"HTTP 404: Not Found"` |
| Validation error | `false` | Error string from backend |
| Backend `{ success: false, error: {...} }` | `false` | Extracted from `error.message` or `errormessage` or `detail` |

### Network-Level Errors

The `BaseApiService` catches `fetch` exceptions (network failures, timeouts) and wraps them:

```typescript
{
  success: false,
  error: "Network error occurred"  // or the actual Error.message
}
```

### Session Expiry

When a 401 is received and the refresh token is also invalid:

```typescript
{
  success: false,
  error: "Session expired. Please login again."
}
```

At this point, tokens have been cleared from AsyncStorage. The app should redirect the user to the login screen.

---

## Token Refresh Flow

```
Request -> 401 Response
  |
  +--> Is there already a refresh in flight?
  |      YES -> Wait for existing refresh promise, share result (deduplication)
  |      NO  -> Start new refresh
  |
  +--> POST /auth/refresh/ { refresh: <token> }
  |      |
  |      +--> Success -> Update access token in AsyncStorage + memory
  |      |             Return true
  |      |
  |      +--> Failure -> Clear all tokens
  |                     Return false
  |
  +--> If refresh succeeded:
  |      Retry original request with new token (retry=false to prevent loops)
  |
  +--> If refresh failed:
         Return { success: false, error: "Session expired..." }
```

### Deduplication

If multiple concurrent requests all get 401s simultaneously, only **one** refresh request is made. All other 401s wait on the same promise. This is managed by the `refreshPromise` field on the `BaseApiService` instance.

---

## FormData / File Uploads

When a request body contains file objects (e.g., `profile_picture`, `document_file`), pass `isFormData: true` to the base service method.

### How It Works

1. When `isFormData` is true, the `Content-Type` header is **omitted** -- the browser/runtime sets it automatically with the correct multipart boundary.
2. The body is passed as-is (a `FormData` instance) instead of being `JSON.stringify()`-ed.
3. Logging shows `[FormData]` instead of the full body content.

### Building FormData

```typescript
const formData = new FormData();
formData.append('license_number', 'DL12345678');
formData.append('license_expiry_date', '2028-01-01');

// React Native file object
formData.append('license_photo_front', {
  uri: 'file:///path/to/photo.jpg',
  name: 'license_front.jpg',
  type: 'image/jpeg',
} as any);

await BaseApiService.post('/drivers/documents/upload/', formData, true, true);
//                                                        auth   ^formData
```

### Services That Use FormData

- **AuthApiService** -- profile photo uploads (`updateProfile`, `patchProfile`)
- **DriverApiService** -- license/aadhaar photos, document uploads
- **BikerApiService** -- profile photos, document uploads, vehicle photos (RC book, insurance, PUC)

---

## Field Mapping Reference

There are known naming mismatches between the frontend and backend. These are also documented in `BACKEND_INTEGRATION_README.md`.

| Frontend Field | Backend Field | Context |
|---|---|---|
| `chauffeurId` | `driverId` / `driver_details.id` | Booking/driver references |
| `price` | `estimatedFare` / `estimated_fare` | Fare display |
| `pickupLat` / `pickupLong` | `pickup_lat` / `pickup_long` | Coordinate fields |
| `dropoffLat` / `dropoffLong` | `dropoff_lat` / `dropoff_long` | Coordinate fields |

### Response Wrapper Variations

The backend returns responses in different formats. The `BaseApiService.parseResponse()` handles all of these:

1. **Wrapped:** `{ success: true, data: { ... } }` -- returned as-is
2. **Unwrapped:** `{ id: "...", name: "..." }` -- wrapped into `{ success: true, data: { ... } }`
3. **Nested error:** `{ success: false, error: { message: "...", code: "..." } }` -- error extracted

### Coordinate Type Inconsistency

Some backend endpoints return coordinates as `string` while others return `number`. The frontend services normalize these where possible (e.g., `LocationApiService` parses string lat/lng to float). When consuming API data, always check the type:

```typescript
const lat = typeof loc.lat === 'string' ? parseFloat(loc.lat) : loc.lat;
```

---

## Troubleshooting

### `/meta/configs/` Returns 404

The backend endpoint is not implemented yet. All calls to `ConfigApiService.getAll()` or `fetchConfigs()` from stores/screens will fail. These calls are currently **commented out** across the codebase. See `MEMORY.md` for the list of files where `fetchConfigs()` needs to be re-enabled once the backend is ready.

### Booking Store Mock Data

`bookingStore.ts` methods `loadAvailableChauffeurs` and `createBooking` still use simulated mock data. These should eventually be replaced with `BookingApiService.bookRide()` and related endpoints.

### "Maximum Update Depth Exceeded"

This error occurs if `fetchConfigs()` is called in a `useEffect` without proper guard conditions. Since the backend returns 404, the error triggers re-renders. All such calls have been commented out. If you uncomment them, add a guard:

```typescript
useEffect(() => {
  // TODO: Uncomment when backend /meta/configs/ is ready
  // fetchConfigs();
}, []);
```

### Token Refresh Loops

The base service retries **only once** on 401. If the retried request also returns 401, it returns the error rather than refreshing again. This prevents infinite loops. The `retry` parameter is set to `false` for retry attempts.

### Razorpay Module Not Found

If running in Expo Go (rather than a development build), `RazorpayCheckout` will be null. The service handles this gracefully and returns an error suggesting a development client rebuild.

### "Session Expired" Errors

If users report frequent session expiry, check:
1. The refresh token expiration on the backend
2. Whether the app is calling `BaseApiService.clearTokens()` elsewhere
3. Network connectivity (offline requests may fail and trigger the refresh path)

### Request Logging

All API requests and responses are logged to the console with:
- Unique request ID
- Timestamp
- HTTP method and full URL
- Sanitized headers (bearer token partially masked)
- Sanitized body (passwords/tokens hidden)
- Response status, duration, and body

To reduce log noise in production, consider wrapping the `logApiRequest` / `logApiResponse` calls in a development-only check.

### Adding a New Service

To create a new API service:

1. Create `services/api/YourNewService.ts`
2. Import and use the `BaseApiService` singleton
3. Define TypeScript interfaces for request/response types
4. Follow the existing pattern of wrapping each method in try/catch and returning `ApiResponse<T>`

```typescript
import BaseApiService, { ApiResponse } from './BaseApiService';

class YourNewService {
  private basePath = '/your-path';

  async getItem(id: string): Promise<ApiResponse<YourType>> {
    try {
      return await BaseApiService.get<YourType>(`${this.basePath}/${id}/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch item',
      };
    }
  }
}

export default new YourNewService();
```
