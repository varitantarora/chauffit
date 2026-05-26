# Chauffit API Reference

**Version:** 1.0.0
**Base URL:** `EXPO_PUBLIC_API_BASE_URL` (default: `http://54.234.146.195/api/v1`)
**OpenAPI Spec:** `Docs/Chauffit API.yaml` (169 endpoints)
**Protocol:** HTTPS (recommended), HTTP
**Format:** JSON request/response bodies

---

## Table of Contents

1. [Authentication](#authentication)
2. [Common Patterns](#common-patterns)
3. [Authentication Endpoints](#authentication-endpoints)
4. [Customer Endpoints](#customer-endpoints)
5. [Driver Endpoints](#driver-endpoints)
6. [Biker Endpoints](#biker-endpoints)
7. [Biker Task Endpoints](#biker-task-endpoints)
8. [Rides (Customer)](#rides-customer)
9. [Rides (Driver)](#rides-driver)
10. [Rides (Biker)](#rides-biker)
11. [Payments](#payments)
12. [Earnings](#earnings)
13. [Insurance](#insurance)
14. [Notifications](#notifications)
15. [Loyalty & Referrals](#loyalty--referrals)
16. [Meta & Configuration](#meta--configuration)
17. [Amenities](#amenities)
18. [Advertisements](#advertisements)
19. [Blogs](#blogs)
20. [Pricing](#pricing)
21. [Admin Endpoints](#admin-endpoints)
22. [Enums Reference](#enums-reference)

---

## Authentication

All authenticated endpoints require a JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Token Types

| Token | Purpose | Lifetime |
|-------|---------|----------|
| `access` | Authenticate API requests | Short-lived |
| `refresh` | Obtain new access tokens | Long-lived |

### Auth Flow

1. **Register** via `POST /auth/register/` or `POST /auth/register-with-otp/` -- returns `{ access, refresh }`
2. **Login** via `POST /auth/login/` -- returns `{ access, refresh }`
3. **Include** `Authorization: Bearer <access>` on all subsequent requests
4. **Refresh** when access token expires via `POST /auth/refresh/` with `{ "refresh": "<token>" }`
5. **Logout** via `POST /auth/logout/` with `{ "refresh": "<token>" }` to invalidate tokens

### OTP Auth Flow

For phone-number-based authentication:

1. `POST /auth/send-otp/` -- send OTP to phone number
2. `POST /auth/verify-otp/` -- verify the OTP
3. `POST /auth/otp-login/send/` -- send OTP for login
4. `POST /auth/otp-login/verify/` -- verify OTP and receive tokens

### Token Storage

The mobile client persists JWT tokens in `AsyncStorage` and rehydrates them on app launch via `initializeAuth()` in `authStore.ts`. The `BaseApiService` singleton automatically attaches the Bearer token to requests and handles 401 responses by refreshing and retrying.

---

## Common Patterns

### Response Format (Success)

```json
{
  "success": true,
  "data": { },
  "message": "Operation successful"
}
```

### Response Format (Error)

```json
{
  "success": false,
  "error": "Error message",
  "errors": {
    "field_name": ["Validation error detail"]
  }
}
```

### Pagination

Paginated list endpoints return:

```json
{
  "count": 100,
  "next": "http://api.example.com/api/v1/endpoint/?page=3",
  "previous": "http://api.example.com/api/v1/endpoint/?page=1",
  "results": [ ]
}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (1-indexed) |
| `search` | string | Search term (where supported) |
| `ordering` | string | Field name for sorting (prefix with `-` for descending) |

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK -- successful read or update |
| `201` | Created -- successful resource creation |
| `204` | No Content -- successful deletion |
| `400` | Bad Request -- validation error |
| `401` | Unauthorized -- missing or expired token |
| `403` | Forbidden -- insufficient permissions |
| `404` | Not Found -- resource does not exist |
| `500` | Internal Server Error |

### ID Format

All resource IDs are UUID v4 strings (e.g., `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`).

### Auth Requirement Legend

- **[Public]** -- no authentication required
- **[Auth]** -- JWT Bearer token required

---

## Authentication Endpoints

### POST /auth/login/ [Public]

Log in with email and password.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string (email) | Yes | User email |
| `password` | string | Yes | User password (write-only) |

**Response:** `{ access, refresh }`

---

### POST /auth/register/ [Public]

Register a new user.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string (email) | Yes | User email, max 254 chars |
| `phone_number` | string | Yes | Phone number, max 15 chars |
| `password` | string | Yes | Password (write-only) |
| `password_confirm` | string | Yes | Password confirmation (write-only) |
| `first_name` | string | Yes | First name, max 100 chars |
| `last_name` | string | Yes | Last name, max 100 chars |
| `user_type` | string (enum) | Yes | One of: `customer`, `driver`, `biker`, `admin`, `super_admin` |
| `date_of_birth` | string (date) | No | ISO 8601 date (YYYY-MM-DD), nullable |

**Response:** User profile + `{ access, refresh }`

---

### POST /auth/register-with-otp/ [Public]

Register a new user using OTP verification instead of password.

---

### POST /auth/refresh/ [Public]

Refresh an expired access token.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refresh` | string | Yes | Valid refresh token |

**Response:** `{ access, refresh }`

---

### POST /auth/send-otp/ [Public]

Send an OTP to a phone number.

**Request Body:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `phone_number` | string | Yes | -- | Phone number, max 15 chars |
| `otp_type` | string (enum) | No | `phone_verification` | `registration`, `login`, `password_reset`, `phone_verification`, `ride_start`, `ride_complete` |
| `send_via_whatsapp` | boolean | No | `true` | Send via WhatsApp instead of SMS |

---

### POST /auth/verify-otp/ [Public]

Verify an OTP code.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phone_number` | string | Yes | Phone number |
| `otp` | string | Yes | OTP code, max 6 chars |
| `otp_type` | string (enum) | No | OTP type (default: `phone_verification`) |

---

### POST /auth/otp-login/send/ [Public]

Send an OTP specifically for login flow.

---

### POST /auth/otp-login/verify/ [Public]

Verify OTP and receive authentication tokens.

---

### POST /auth/change-password/ [Auth]

Change the authenticated user's password.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `old_password` | string | Yes | Current password (write-only) |
| `new_password` | string | Yes | New password (write-only) |
| `new_password_confirm` | string | Yes | New password confirmation (write-only) |

---

### GET /auth/profile/ [Auth]

Get the authenticated user's profile.

---

### PUT /auth/profile/ [Auth]

Full update of the authenticated user's profile.

---

### PATCH /auth/profile/ [Auth]

Partial update of the authenticated user's profile.

---

### POST /auth/logout/ [Auth]

Log out and invalidate tokens.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refresh` | string | Yes | Refresh token to invalidate |

---

## Customer Endpoints

### Profile & CRUD

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/customers/profile/` | Get current customer's profile |
| `GET` | `/customers/` | List all customers (paginated) |
| `POST` | `/customers/` | Create a new customer |
| `GET` | `/customers/{id}/` | Get customer by ID |
| `PUT` | `/customers/{id}/` | Full update customer |
| `PATCH` | `/customers/{id}/` | Partial update customer |
| `DELETE` | `/customers/{id}/` | Delete customer |

### Cars

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/customers/cars/` | List customer's cars |
| `POST` | `/customers/cars/add/` | Add a new car |
| `PUT` | `/customers/cars/{id}/update/` | Full update car |
| `PATCH` | `/customers/cars/{id}/update/` | Partial update car |
| `DELETE` | `/customers/cars/{id}/delete/` | Delete a car |

**CustomerCar Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID (read-only) | Car ID |
| `make` | string | Car manufacturer, max 100 |
| `model` | string | Car model, max 100 |
| `year` | integer | Year (1990-2025) |
| `plate` | string | License plate, max 15 |
| `color` | string | Car color, max 50 |
| `vehicle_type` | enum | Vehicle segment (see VehicleSegmentEnum) |
| `transmission` | enum (nullable) | `automatic`, `manual` |
| `display_name` | string (read-only) | Auto-generated display name |
| `is_active` | boolean | Whether car is active |

### Saved Locations

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/customers/locations/` | List saved locations |
| `POST` | `/customers/locations/` | Add a saved location |
| `GET` | `/customers/locations/favorites/` | Get favorite locations |
| `PUT` | `/customers/{id}/locations/` | Update location |

### Payment Methods

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/customers/payment-methods/` | List payment methods |
| `POST` | `/customers/payment-methods/` | Add payment method |
| `DELETE` | `/customers/{id}/payment-methods/` | Delete a payment method |
| `POST` | `/customers/{id}/payment-methods/set-default/` | Set default payment method |

### Notification Preferences

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/customers/notification-preferences/` | Get notification preferences |
| `PUT` | `/customers/notification-preferences/` | Full update preferences |
| `PATCH` | `/customers/notification-preferences/` | Partial update preferences |
| `POST` | `/customers/notification-preferences/disable-all/` | Disable all notifications |
| `POST` | `/customers/notification-preferences/enable-all/` | Enable all notifications |

---

## Driver Endpoints

### Profile & CRUD

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/drivers/` | Get current driver's profile |
| `POST` | `/drivers/` | Create driver profile |
| `GET` | `/drivers/{id}/` | Get driver detail |
| `PUT` | `/drivers/{id}/` | Full update driver |
| `PATCH` | `/drivers/{id}/` | Partial update driver |

**DriverProfile Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID (read-only) | Driver profile ID |
| `user` | User object (read-only) | Associated user |
| `full_name` | string (read-only) | Full name |
| `email` | email (read-only) | Email |
| `phone_number` | string (read-only) | Phone |
| `license_number` | string | License number, max 50 |
| `license_expiry_date` | date | License expiry (YYYY-MM-DD) |
| `license_photo_front` | URI | Front of license |
| `license_photo_back` | URI | Back of license |
| `aadhar_number` | string | Aadhaar number, max 12 |
| `aadhar_photo` | URI | Front of Aadhaar card |
| `aadhar_photo_back` | URI (nullable) | Back of Aadhaar card |
| `background_check_status` | enum | `pending`, `in_progress`, `passed`, `failed` |
| `bio` | string | Driver bio, max 500 |
| `years_of_experience` | integer | Years of experience (0-50) |
| `languages_spoken` | any | Languages spoken |
| `city` | string | City, max 100 |
| `transmission_type` | enum | `automatic`, `manual` |
| `uniform_size` | enum | `M`, `L`, `XL` |
| `is_online` | boolean | Online status |
| `current_location_lat` | decimal (nullable) | Current latitude |
| `current_location_long` | decimal (nullable) | Current longitude |
| `location_updated_at` | datetime (nullable) | Last location update |
| `current_status` | enum | Driver onboarding status (see below) |
| `is_verified` | boolean (read-only) | Verification status |
| `average_rating` | double (read-only) | Average rating |
| `total_trips` | integer (read-only) | Total trips completed |

**Driver Current Status (`current_status`):**
`registered` -> `verification_in_progress` -> `verified_ready_for_training` -> `training_scheduled` -> `certified` -> `active` (or `verification_failed`, `training_failed`, `suspended`, `rejected`)

### Aadhaar Verification

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/drivers/aadhaar/send-otp/` | Send OTP for Aadhaar verification |
| `POST` | `/drivers/aadhaar/verify-otp/` | Verify Aadhaar with OTP |

### Documents

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/drivers/documents/` | List uploaded documents |
| `POST` | `/drivers/documents/upload/` | Upload a document |

### Operations

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/drivers/earnings/` | Get earnings summary |
| `POST` | `/drivers/location/` | Update current GPS location |
| `GET` | `/drivers/onboarding-status/` | Get driver onboarding status |
| `GET` | `/drivers/stats/` | Get driver statistics |
| `POST` | `/drivers/status/` | Toggle online/offline status |

### Training

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/drivers/training/` | Get assigned training schedule |
| `POST` | `/drivers/training/request-retake/` | Request a training retake |
| `POST` | `/drivers/training/reschedule/` | Request training reschedule |

---

## Biker Endpoints

### Profile & CRUD

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/bikers/` | Get current biker's profile |
| `POST` | `/bikers/` | Create biker profile |
| `GET` | `/bikers/{id}/` | Get biker detail |
| `PUT` | `/bikers/{id}/` | Full update biker |
| `PATCH` | `/bikers/{id}/` | Partial update biker |

### Operations

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/bikers/documents/` | List uploaded documents |
| `POST` | `/bikers/documents/upload/` | Upload a document |
| `GET` | `/bikers/earnings/` | Get earnings summary |
| `POST` | `/bikers/location/` | Update current GPS location |
| `GET` | `/bikers/stats/` | Get biker statistics |
| `POST` | `/bikers/status/` | Toggle online/offline status |

**Update Location Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `latitude` | decimal | Yes | Current latitude |
| `longitude` | decimal | Yes | Current longitude |

### Vehicles

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/bikers/vehicles/` | List biker's vehicles |
| `POST` | `/bikers/vehicles/` | Create a vehicle |
| `GET` | `/bikers/vehicles/{id}/` | Get vehicle detail |
| `PUT` | `/bikers/vehicles/{id}/` | Full update vehicle |
| `PATCH` | `/bikers/vehicles/{id}/` | Partial update vehicle |
| `DELETE` | `/bikers/vehicles/{id}/` | Delete a vehicle |

**Biker Vehicle Brands:** `honda`, `bajaj`, `tvs`, `hero`, `royal_enfield`, `yamaha`, `suzuki`, `other`

---

## Biker Task Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/biker-tasks/` | List biker tasks (paginated) |
| `POST` | `/biker-tasks/` | Create a biker task |
| `GET` | `/biker-tasks/{id}/` | Get task detail |
| `POST` | `/biker-tasks/{id}/accept/` | Accept a task |
| `POST` | `/biker-tasks/{id}/cancel/` | Cancel a task |
| `POST` | `/biker-tasks/{id}/rate/` | Rate a task |
| `POST` | `/biker-tasks/{id}/status/` | Update task status |
| `GET` | `/biker-tasks/pending/` | List pending tasks |

**Task Status Flow:**
`requested` -> `assigned` -> `accepted` -> `en_route_to_driver` -> `arrived_at_driver` -> `driver_picked_up` -> `en_route_to_customer` -> `arrived_at_customer` -> `completed`

Cancellation states: `cancelled_by_biker`, `cancelled_by_driver`, `cancelled_by_system`

**Task Types:** `driver_transport`

---

## Rides (Customer)

### Booking & Estimation

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/rides/` | List rides (paginated) |
| `GET` | `/rides/{id}/` | Get ride detail |
| `POST` | `/rides/book/` | Book a new ride |
| `GET` | `/rides/estimate/` | Get fare estimate |
| `GET` | `/rides/active/` | Get current active ride |
| `POST` | `/rides/{id}/cancel/` | Cancel a ride |
| `GET` | `/rides/schedule/check-availability/` | Check scheduled ride availability |

### Fare Estimate Request (`POST /rides/estimate/`)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `from_lat` | decimal | Yes | -- | Pickup latitude |
| `from_long` | decimal | Yes | -- | Pickup longitude |
| `from_address` | string | Yes | -- | Pickup address, max 500 |
| `to_lat` | decimal | Yes | -- | Dropoff latitude |
| `to_long` | decimal | Yes | -- | Dropoff longitude |
| `to_address` | string | Yes | -- | Dropoff address, max 500 |
| `vehicle_id` | UUID | Yes | -- | Customer's car ID |
| `when` | enum | No | `now` | `now` or `schedule` |
| `type` | enum | No | `one_way` | `one_way`, `round_trip`, `hourly`, `multi_stop` |
| `hours` | integer | No | -- | Hours for hourly rides (1-12) |
| `scheduled_at` | datetime | No | null | Required when `when=schedule` |
| `insurance_plan_id` | UUID | No | null | Insurance plan ID |
| `amenity_ids` | UUID[] | No | -- | List of amenity IDs |
| `stops` | StopInput[] | No | -- | Intermediate stops for multi-stop |

### Fare Estimate Response

| Field | Type | Description |
|-------|------|-------------|
| `trip` | TripInfo | Trip type, when, scheduled_at, vehicle_segment |
| `estimate` | Estimate | `currency`, `total_fare`, `fare_range` (min/max with +-10%) |
| `route` | Route (nullable) | `distance_km`, `total_distance_km`, `duration_minutes`, `total_duration_minutes` |
| `pricing_factors` | PricingFactors | `surge_active`, `surge_multiplier`, `is_night_surcharge`, `hours_booked` |
| `breakdown` | object | Detailed fare breakdown |
| `insurance` | InsuranceInfo (nullable) | Insurance plan details if selected |
| `amenities` | AmenityItem[] | Selected amenities with prices |

### Booking Request (`POST /rides/book/`)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `pickup_location_id` | UUID (nullable) | No | -- | Saved pickup location ID |
| `dropoff_location_id` | UUID (nullable) | No | -- | Saved dropoff location ID |
| `from_lat` | decimal (nullable) | No* | -- | Pickup latitude (*required if no location_id) |
| `from_long` | decimal (nullable) | No* | -- | Pickup longitude |
| `from_address` | string | No* | -- | Pickup address, max 500 |
| `to_lat` | decimal (nullable) | No* | -- | Dropoff latitude |
| `to_long` | decimal (nullable) | No* | -- | Dropoff longitude |
| `to_address` | string | No* | -- | Dropoff address, max 500 |
| `vehicle_id` | UUID | Yes | -- | Customer's car ID |
| `when` | enum | No | `now` | `now` or `schedule` |
| `type` | enum | No | `one_way` | Trip type |
| `hours` | integer | No | -- | Hours for hourly rides (1-12) |
| `scheduled_at` | datetime (nullable) | No | null | Required when `when=schedule` |
| `payment_method_id` | UUID (nullable) | No | null | Payment method |
| `special_requests` | string | No | -- | Special requests, max 500 |
| `insurance_plan_id` | UUID (nullable) | No | null | Insurance plan |
| `stops` | StopInput[] | No | -- | Intermediate stops |

### Booking Detail Response

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Booking ID |
| `booking_reference` | string | Human-readable reference |
| `customer` / `driver` / `biker` | UUID | Associated user IDs |
| `customer_details` / `driver_details` / `biker_details` | object | User detail objects |
| `pickup_address` / `pickup_lat` / `pickup_long` | string/decimal | Pickup location |
| `dropoff_address` / `dropoff_lat` / `dropoff_long` | string/decimal | Dropoff location |
| `trip_type` | enum | `one_way`, `round_trip`, `hourly_charter`, `multi_stop` |
| `service_type` | enum | `driver_booking` |
| `estimated_fare` / `actual_fare` | decimal | Fare amounts |
| `estimated_distance_km` / `actual_distance_km` | decimal (nullable) | Distance |
| `estimated_duration_minutes` / `actual_duration_minutes` | integer (nullable) | Duration |
| `booking_status` | enum | See BookingStatusEnum below |
| `payment_status` | enum | See PaymentStatusEnum below |
| `insurance` | object | Insurance details |
| `amenities` / `amenities_total` | array/decimal | Amenity info |
| `stops` | Stop[] | Multi-stop waypoints |
| `completion_otp` | string | OTP for trip completion |
| `driver_assigned_at` / `driver_arrived_at` | datetime (nullable) | Timestamps |
| `trip_started_at` / `trip_completed_at` | datetime (nullable) | Timestamps |
| `cancelled_at` / `cancelled_by` / `cancellation_reason` | mixed | Cancellation info |
| `special_requests` / `notes` | string (nullable) | Notes |
| `created_at` / `updated_at` | datetime | Timestamps |

### Ratings

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/rides/ratings/` | Rate a ride |
| `GET` | `/rides/ratings/received/` | Get received ratings |

**Rating Fields:** `booking`, `biker_task`, `rated_user`, `rating_type`, `overall_rating` (1-5), `driving_quality` (1-5), `vehicle_cleanliness` (1-5), `punctuality` (1-5), `communication` (1-5), `behavior` (1-5), `review` (max 500)

---

## Rides (Driver)

### Ride Management

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/rides/driver/` | List driver's rides (paginated) |
| `GET` | `/rides/driver/pending/` | List pending ride requests |
| `POST` | `/rides/driver/accept/` | Accept a ride |
| `GET` | `/rides/driver/{id}/` | Get specific ride detail |
| `POST` | `/rides/driver/{id}/accept/` | Accept a specific ride |
| `POST` | `/rides/driver/{id}/cancel/` | Cancel a ride |

### Ride Lifecycle

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/rides/driver/{id}/start/` | Start the trip |
| `POST` | `/rides/driver/{id}/complete/` | Complete the trip |
| `POST` | `/rides/driver/{id}/status/` | Update ride status |

**Start Trip Request:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pickup_lat` | decimal (nullable) | No | Actual pickup latitude |
| `pickup_long` | decimal (nullable) | No | Actual pickup longitude |
| `odometer_start_km` | decimal (nullable) | No | Odometer at start |

**Complete Trip Request:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `otp` | string | Yes | 4-6 digit completion OTP from customer |
| `dropoff_lat` | decimal (nullable) | No | Actual dropoff latitude |
| `dropoff_long` | decimal (nullable) | No | Actual dropoff longitude |
| `actual_distance_km` | decimal (nullable) | No | Actual distance in km |
| `actual_duration_minutes` | integer (nullable) | No | Actual duration in minutes |
| `odometer_end_km` | decimal (nullable) | No | Odometer at end |

**Update Ride Status Request:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | enum | Yes | `driver_en_route`, `driver_arrived`, `trip_started`, `trip_completed` |
| `location_lat` | decimal (nullable) | No | Current latitude (required for `trip_started`) |
| `location_long` | decimal (nullable) | No | Current longitude |

### OTP Verification

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/rides/driver/{id}/send-otp/` | Send OTP to customer |
| `POST` | `/rides/driver/{id}/verify-otp-start/` | Verify OTP and start ride |

### Ratings & Amenities

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/rides/driver/{id}/rate-customer/` | Rate the customer |
| `GET` | `/rides/driver/{id}/amenities/` | Get ride amenities |
| `POST` | `/rides/driver/{id}/amenities/add/` | Add amenity to ride |
| `POST` | `/rides/driver/{id}/amenities/{amenity_id}/deliver/` | Mark amenity delivered |
| `POST` | `/rides/driver/{id}/amenities/{amenity_id}/remove/` | Remove amenity |

**Rate Customer Request:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `overall_rating` | integer (1-5) | Yes | Overall rating |
| `punctuality` | integer (1-5) | No | Punctuality rating |
| `communication` | integer (1-5) | No | Communication rating |
| `behavior` | integer (1-5) | No | Behavior rating |
| `review` | string | No | Review comments, max 500 |

---

## Rides (Biker)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/rides/biker/` | List biker's rides (paginated) |
| `GET` | `/rides/biker/pending/` | List pending biker tasks |
| `GET` | `/rides/biker/{id}/` | Get biker ride detail |
| `POST` | `/rides/biker/{id}/accept/` | Accept a biker task |
| `POST` | `/rides/biker/{id}/cancel/` | Cancel a biker task |
| `POST` | `/rides/biker/{id}/status/` | Update biker ride status |
| `POST` | `/rides/biker/{id}/rate/` | Rate a biker ride |

---

## Payments

### General

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/payments/` | List payments (paginated) |
| `GET` | `/payments/{id}/` | Get payment detail |
| `POST` | `/payments/{id}/refund/` | Process a refund |

**Payment Detail Fields:** `id`, `payment_reference`, `booking_reference`, `customer_details`, `amount`, `platform_fee`, `gateway_fee`, `tax_amount`, `net_amount`, `payment_type`, `transaction_type`, `payment_status`, `gateway_transaction_id`, `failure_reason`, `refund_reason`, `refund_amount`, `created_at`, `updated_at`

### Razorpay Integration

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/payments/razorpay/create-order/` | Create a Razorpay order |
| `POST` | `/payments/razorpay/verify/` | Verify Razorpay payment signature |
| `GET` | `/payments/razorpay/payment-methods/` | Get available payment methods |

**Create Razorpay Order:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `booking_id` | UUID | Yes | -- | Booking to pay for |
| `amount` | decimal | Yes | -- | Payment amount |
| `currency` | string | No | `INR` | Currency code, max 3 |

**Razorpay Order Response:** `order_id`, `amount`, `currency`, `payment_id`, `key_id`

**Verify Razorpay Payment:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `razorpay_order_id` | string | Yes | Order ID from Razorpay |
| `razorpay_payment_id` | string | Yes | Payment ID from Razorpay |
| `razorpay_signature` | string | Yes | Signature from Razorpay SDK |
| `payment_id` | UUID | Yes | Internal payment ID |

---

## Earnings

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/earnings/driver/daily/` | Driver daily earnings breakdown |
| `GET` | `/earnings/driver/bonuses/` | Driver bonuses and incentives |
| `GET` | `/earnings/biker/daily/` | Biker daily earnings breakdown |
| `GET` | `/earnings/biker/bonuses/` | Biker bonuses and incentives |

---

## Insurance

### Public-Facing

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/insurance/plans/` | List active insurance plans (customer view) |

**Insurance Plan Fields:** `id`, `tier`, `name`, `description`, `premium_amount`, `max_coverage_amount`, `coverage_details`, `display_order`

**Insurance Tiers:** `scratch`, `scratch_and_dent`, `full`

### Admin Management

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/insurance/admin/plans/` | List all plans (including inactive) |
| `POST` | `/insurance/admin/plans/` | Create a plan |
| `GET` | `/insurance/admin/plans/{id}/` | Get plan detail |
| `PUT` | `/insurance/admin/plans/{id}/` | Full update plan |
| `PATCH` | `/insurance/admin/plans/{id}/` | Partial update plan |
| `DELETE` | `/insurance/admin/plans/{id}/` | Delete plan |

**Insurance Plan Admin Fields:** `tier`, `name`, `description`, `premium_amount`, `max_coverage_amount`, `coverage_details`, `is_active`, `display_order`

---

## Notifications

### Notifications

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/notifications/` | List notifications (paginated) |
| `GET` | `/notifications/{id}/` | Get notification detail |
| `POST` | `/notifications/{id}/read/` | Mark notification as read |

### Devices

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/notifications/devices/` | List registered devices |
| `POST` | `/notifications/devices/` | Register a device |
| `GET` | `/notifications/devices/{id}/` | Get device detail |

### Preferences

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/notifications/preferences/` | List notification preferences |
| `GET` | `/notifications/preferences/{id}/` | Get preference detail |

---

## Loyalty & Referrals

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/loyalty/profile/` | List loyalty profiles |
| `GET` | `/loyalty/profile/{id}/` | Get customer loyalty profile |
| `GET` | `/loyalty/referrals/` | List referral history (paginated) |
| `GET` | `/loyalty/referrals/{id}/` | Get referral event detail |
| `POST` | `/loyalty/submit/` | Apply loyalty credits to a booking |
| `GET` | `/loyalty/transactions/` | List credit transactions (paginated) |
| `GET` | `/loyalty/transactions/{id}/` | Get credit transaction detail |

**Apply Credits Request:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `booking_id` | UUID | Yes | Booking to apply credits to |
| `amount` | decimal | Yes | Amount of credits to apply |

**Credit Transaction Types:** `referral_reward`, `referral_discount`, `loyalty_milestone`, `tier_discount`, `redemption`, `manual_adjustment`

**Referral Event Statuses:** `pending`, `completed`, `rewarded`

---

## Meta & Configuration

### Enums & User Type

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/meta/enums/` | Get all application enum values |
| `GET` | `/meta/user-type/` | Get current user's type |

### App Configuration

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/meta/configs/` | List all configurations |
| `GET` | `/meta/configs/{key}/` | Get configuration by key |

**Note:** The `/meta/configs/` endpoint is used for feature flags (e.g., `insurance_enabled`). Frontend clients poll this to show/hide features dynamically.

### Bank Accounts

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/meta/bank-accounts/` | List bank accounts |
| `POST` | `/meta/bank-accounts/` | Create bank account |
| `GET` | `/meta/bank-accounts/{id}/` | Get bank account detail |
| `PUT` | `/meta/bank-accounts/{id}/` | Full update bank account |
| `PATCH` | `/meta/bank-accounts/{id}/` | Partial update bank account |
| `DELETE` | `/meta/bank-accounts/{id}/` | Delete bank account |
| `POST` | `/meta/bank-accounts/{id}/set-default/` | Set default bank account |

**Bank Account Fields:** `account_number`, `ifsc_code`, `account_holder_name`, `bank_name`, `branch_name`, `account_type` (`savings`, `current`), `is_verified`, `is_default`

---

## Amenities

### Public-Facing

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/amenities/` | List active amenities |
| `GET` | `/amenities/{id}/` | Get amenity detail |

**Amenity Fields:** `id`, `name`, `description`, `category` (`refreshment`, `comfort`, `premium`), `price`, `image`, `is_available`, `preparation_time_minutes`

### Admin Management

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/amenities/admin/` | List all amenities (including inactive) |
| `POST` | `/amenities/admin/` | Create amenity |
| `GET` | `/amenities/admin/{id}/` | Get amenity detail |
| `PUT` | `/amenities/admin/{id}/` | Full update amenity |
| `PATCH` | `/amenities/admin/{id}/` | Partial update amenity |
| `DELETE` | `/amenities/admin/{id}/` | Soft-delete amenity |

---

## Advertisements

### Advertisements

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/advertisements/` | List active advertisements |
| `POST` | `/advertisements/` | Create advertisement (admin) |
| `GET` | `/advertisements/{id}/` | Get advertisement detail |
| `PUT` | `/advertisements/{id}/` | Full update advertisement (admin) |
| `PATCH` | `/advertisements/{id}/` | Partial update advertisement (admin) |
| `DELETE` | `/advertisements/{id}/` | Delete advertisement (admin) |

### Advertisement Categories

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/advertisements/categories/` | List active categories |
| `POST` | `/advertisements/categories/` | Create category (admin) |
| `GET` | `/advertisements/categories/{id}/` | Get category detail |
| `PUT` | `/advertisements/categories/{id}/` | Full update category (admin) |
| `PATCH` | `/advertisements/categories/{id}/` | Partial update category (admin) |
| `DELETE` | `/advertisements/categories/{id}/` | Delete category (admin) |

**Advertisement Fields:** `title`, `description`, `image`, `action_type` (`deeplink`, `web`, `none`), `action_url`, `priority` (`low`, `normal`, `high`, `urgent`), `is_active`, `start_date`, `end_date`, `target_pages`, `target_user_types`

---

## Blogs

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/blogs/` | List published blogs (paginated) |
| `POST` | `/blogs/` | Create blog (admin) |
| `GET` | `/blogs/{slug}/` | Get blog by slug |
| `PATCH` | `/blogs/{slug}/` | Update blog (admin) |
| `DELETE` | `/blogs/{slug}/` | Delete blog (admin) |

**Blog Fields:** `slug`, `title`, `content`, `excerpt`, `featured_image`, `author`, `is_published`, `published_at`, `tags`

---

## Pricing

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/pricing/` | Get current pricing information |

---

## Admin Endpoints

All admin endpoints require authentication with an admin-level user (`admin` or `super_admin` user type).

### Dashboard & Revenue

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/dashboard/` | Get dashboard analytics and KPIs |
| `GET` | `/admin/revenue/` | Get revenue analytics |

### User Management

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/users/` | List all users (paginated) |
| `GET` | `/admin/users/{id}/` | Get user details |
| `PUT` | `/admin/users/{id}/status/` | Update user status |

### Driver Verification

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/drivers/` | List all drivers (paginated) |
| `GET` | `/admin/drivers/pending/` | List drivers pending verification |
| `GET` | `/admin/drivers/{id}/` | Get driver details |
| `PUT` | `/admin/drivers/{id}/verify/` | Approve or reject driver |
| `PUT` | `/admin/drivers/{id}/documents/{doc_id}/verify/` | Verify a driver document |

**Driver Verification Request:** `action` (`approve` or `reject`), `rejection_reason` (required if `reject`)

### Biker Verification

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/bikers/` | List all bikers (paginated) |
| `GET` | `/admin/bikers/pending/` | List bikers pending verification |
| `GET` | `/admin/bikers/{id}/` | Get biker details |
| `PUT` | `/admin/bikers/{id}/verify/` | Approve or reject biker |

### Ride Management

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/rides/` | List all rides (paginated) |
| `GET` | `/admin/rides/{id}/` | Get ride details |
| `PUT` | `/admin/rides/{id}/cancel/` | Cancel a ride |
| `PUT` | `/admin/rides/{id}/dispatch/` | Manually dispatch driver to ride |

### Payments & Disputes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/payments/` | List all payments (paginated) |
| `GET` | `/admin/payments/{id}/` | Get payment details |
| `GET` | `/admin/disputes/` | List all disputes (paginated) |
| `GET` | `/admin/disputes/{id}/` | Get dispute details |
| `PUT` | `/admin/disputes/{id}/resolve/` | Resolve a dispute |

**Dispute Statuses:** `open`, `in_progress`, `resolved`, `closed`

### Tasks

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/tasks/` | List all biker tasks (paginated) |
| `GET` | `/admin/tasks/{id}/` | Get biker task details |

### Hourly Hire Settings

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/hourly-hire/` | Get hourly hire settings |
| `PUT` | `/admin/hourly-hire/{id}/` | Update hourly hire settings |

**Hourly Hire Settings Fields:** `enabled`, `surge_multiplier` (1.0-2.0), `daily_booking_cap`, `minimum_hours`, `auto_disabled`, `auto_disabled_reason`

### Pricing Rate Cards

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/pricing/rate-cards/` | List rate cards (paginated) |
| `POST` | `/admin/pricing/rate-cards/` | Create rate card |
| `GET` | `/admin/pricing/rate-cards/{id}/` | Get rate card detail |
| `PUT` | `/admin/pricing/rate-cards/{id}/` | Full update rate card |
| `PATCH` | `/admin/pricing/rate-cards/{id}/` | Partial update rate card |
| `DELETE` | `/admin/pricing/rate-cards/{id}/` | Delete rate card |

**Rate Card Fields:** `id`, `code`, `city`, `currency`, `driver_share` (percentage), `platform_share` (percentage), `platform_fee` (fixed Rs), `gst_rate` (e.g., 0.18 = 18%), `minimum_fare`, `is_active`, `effective_from`, `effective_to`

### Training Batches

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/training-batches/` | List training batches (paginated) |
| `POST` | `/admin/training-batches/` | Create training batch |
| `GET` | `/admin/training-batches/{id}/` | Get training batch detail |
| `PUT` | `/admin/training-batches/{id}/` | Full update training batch |
| `PATCH` | `/admin/training-batches/{id}/` | Partial update training batch |
| `DELETE` | `/admin/training-batches/{id}/` | Delete training batch |
| `POST` | `/admin/training-batches/{id}/auto-assign/` | Auto-assign verified drivers (FIFO) |
| `POST` | `/admin/training-batches/{id}/mark-results/` | Mark training results |

**Training Result Values:** `pending`, `pass`, `fail`, `absent`

---

## Enums Reference

### Booking Status

| Value | Description |
|-------|-------------|
| `requested` | Ride requested, awaiting driver |
| `driver_assigned` | Driver assigned to ride |
| `biker_assigned` | Biker assigned to ride |
| `driver_en_route` | Driver heading to pickup |
| `driver_arrived` | Driver arrived at pickup |
| `trip_started` | Trip in progress |
| `trip_completed` | Trip completed |
| `cancelled_by_customer` | Cancelled by customer |
| `cancelled_by_driver` | Cancelled by driver |
| `cancelled_by_system` | Cancelled by system |

### User Type

| Value | Description |
|-------|-------------|
| `customer` | Customer (ride booker) |
| `driver` | Driver (chauffeur) |
| `biker` | Biker (task runner) |
| `admin` | Admin user |
| `super_admin` | Super admin |

### Trip Type

| Value | Description |
|-------|-------------|
| `one_way` | One-way trip |
| `round_trip` | Round trip |
| `hourly_charter` | Hourly charter |
| `multi_stop` | Multi-stop trip |

### Vehicle Segment

| Value | Description |
|-------|-------------|
| `HATCHBACK` | Hatchback |
| `MICRO_SUV` | Micro SUV |
| `MID_SUV` | Mid SUV |
| `SEDAN` | Sedan |
| `FULL_SUV` | Full SUV |
| `LUXURY` | Luxury |

### Payment Status (Booking)

| Value | Description |
|-------|-------------|
| `pending` | Pending |
| `processing` | Processing |
| `completed` | Completed |
| `failed` | Failed |
| `refunded` | Refunded |
| `partially_refunded` | Partially refunded |
| `cancelled` | Cancelled |

### Payment Type

| Value | Description |
|-------|-------------|
| `ride_payment` | Ride payment |
| `task_payment` | Task payment |
| `refund` | Refund |
| `payout` | Payout |
| `penalty` | Penalty |

### Transaction Type

| Value | Description |
|-------|-------------|
| `charge` | Charge |
| `credit` | Credit |
| `refund` | Refund |
| `penalty` | Penalty |

### OTP Type

| Value | Description |
|-------|-------------|
| `registration` | Registration |
| `login` | Login |
| `password_reset` | Password reset |
| `phone_verification` | Phone verification |
| `ride_start` | Ride start |
| `ride_complete` | Ride complete |

### Driver Onboarding Status

| Value | Description |
|-------|-------------|
| `registered` | Initial registration |
| `verification_in_progress` | Documents under review |
| `verified_ready_for_training` | Approved, awaiting training |
| `verification_failed` | Verification rejected |
| `training_scheduled` | Training date set |
| `training_failed` | Did not pass training |
| `certified` | Training passed, ready to drive |
| `active` | Currently active driver |
| `suspended` | Account suspended |
| `rejected` | Application rejected |

### Biker Current Status

| Value | Description |
|-------|-------------|
| `pending_verification` | Awaiting verification |
| `active` | Active and available |
| `inactive` | Offline / unavailable |
| `on_task` | Currently on a task |
| `suspended` | Account suspended |
| `banned` | Account banned |

### Document Verification Status

| Value | Description |
|-------|-------------|
| `pending` | Awaiting review |
| `verification_in_progress` | Under review |
| `approved` | Approved |
| `rejected` | Rejected |

### Transmission Type

| Value | Description |
|-------|-------------|
| `automatic` | Automatic |
| `manual` | Manual |

### Insurance Tier

| Value | Description |
|-------|-------------|
| `scratch` | Scratch coverage |
| `scratch_and_dent` | Scratch & dent coverage |
| `full` | Full coverage |

### Amenity Category

| Value | Description |
|-------|-------------|
| `refreshment` | Refreshment |
| `comfort` | Comfort |
| `premium` | Premium |

### Surge Type

| Value | Description |
|-------|-------------|
| `NIGHT` | Night surcharge |
| `TRAFFIC` | Traffic surge |
| `HOURLY` | Hourly surge |

### Background Check Status

| Value | Description |
|-------|-------------|
| `pending` | Pending |
| `in_progress` | In progress |
| `passed` | Passed |
| `failed` | Failed |

### Refund Reason

| Value | Description |
|-------|-------------|
| `cancellation_by_customer` | Customer cancelled |
| `cancellation_by_driver` | Driver cancelled |
| `cancellation_by_system` | System cancelled |
| `service_issue` | Service issue |
| `overcharge` | Overcharge |
| `duplicate_payment` | Duplicate payment |
| `other` | Other |

### App Config Value Type

| Value | Description |
|-------|-------------|
| `string` | String value |
| `boolean` | Boolean value |
| `integer` | Integer value |
| `float` | Float value |
| `json` | JSON value |

---

## Rate Limiting

The API may enforce rate limits. If exceeded, responses return HTTP `429 Too Many Requests` with a `Retry-After` header indicating when to retry.

---

## Error Handling Best Practices

1. **401 responses** -- The `BaseApiService` automatically refreshes the access token and retries the request once. If the refresh also fails, redirect the user to login.
2. **400 responses** -- Check `errors` object for field-level validation messages.
3. **403 responses** -- User does not have the required role/permission.
4. **404 responses** -- Resource not found. For `/meta/configs/`, this indicates the endpoint is not yet deployed.
5. **Network errors** -- Retry with exponential backoff. The `BaseApiService` logs request timing and sanitized errors.

---

## Frontend Service Layer

The mobile app wraps all API calls through typed service classes in `services/api/`:

| Service | Responsibility |
|---------|---------------|
| `BaseApiService` | Singleton HTTP client, auth headers, 401 refresh/retry, logging |
| `AuthApiService` | Login, register, OTP, token refresh, profile |
| `BookingApiService` | Fare estimates, booking CRUD, ride lifecycle |
| `DriverRidesApiService` | Driver-specific ride accept/start/complete |
| `BikerTaskApiService` | Biker task listing, accept, status update |
| `PaymentApiService` | Razorpay order creation, verification, refund |
| `DriverApiService` | Driver profile CRUD, documents, onboarding |

All services extend `BaseApiService` and inherit authentication, logging, and error handling.

---

## Known Issues & Notes

- `/meta/configs/` returns 404 on the current backend deployment. Feature flag polling is disabled with TODO comments in the frontend. See project MEMORY.md for the list of files that need uncommenting once the endpoint is available.
- `bookingStore.ts` uses mock data for `loadAvailableChauffeurs` and `createBooking` -- not fully integrated with the backend.
- Field name mismatches exist between frontend and backend (e.g., `chauffeurId` vs `driverId`, `price` vs `estimatedFare`). See `BACKEND_INTEGRATION_README.md`.
- The full OpenAPI 3.0 specification with all request/response schemas is available at `Docs/Chauffit API.yaml` (169 endpoints, 15,600+ lines).
