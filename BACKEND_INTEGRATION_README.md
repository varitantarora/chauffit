# Chauffit Platform - Backend Integration Guide

**Complete Frontend-Backend Integration Documentation**

> This guide validates compatibility between the React Native frontend and Express.js backend, provides integration checklists, and documents all API requirements for the Chauffit on-demand chauffeur platform.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Compatibility Analysis](#2-compatibility-analysis)
3. [Pre-Integration Checklist](#3-pre-integration-checklist)
4. [Step-by-Step Integration](#4-step-by-step-integration)
5. [API Inventory](#5-api-inventory)
6. [Environment Configuration](#6-environment-configuration)
7. [External Services](#7-external-services)
8. [Real-Time Services](#8-real-time-services)
9. [Post-Integration Testing](#9-post-integration-testing)
10. [Issues Found & Corrections](#10-issues-found--corrections)
11. [Deployment Guide](#11-deployment-guide)

---

## 1. Architecture Overview

### Frontend Stack
```
chauffit-main/
├── React Native + Expo SDK 53
├── NativeWind (Tailwind CSS)
├── Zustand (State Management)
├── expo-router (Navigation)
├── @stripe/stripe-react-native
└── @supabase/supabase-js
```

### Backend Stack
```
chauffit_dev/backend/
├── Express.js + TypeScript
├── Prisma ORM + PostgreSQL (Neon)
├── Clerk Authentication
├── Socket.io + Redis
├── AWS S3 (File Storage)
└── Multiple Payment Gateways (Stripe, Razorpay)
```

### User Roles
| Role | App Section | Description |
|------|-------------|-------------|
| `customer` | `(customer)` | Book chauffeur services, manage vehicles |
| `driver` | `(driver)` | Accept ride requests, navigate, earn |
| `biker` | `(biker)` | Emergency response, quick tasks |
| `admin` | Backend API | System administration |

---

## 2. Compatibility Analysis

### 2.1 Authentication Flow Comparison

| Frontend Expectation | Backend Implementation | Status |
|---------------------|------------------------|--------|
| Clerk authentication via `useAuthStore` | Clerk JWT verification middleware | COMPATIBLE |
| Role-based access (customer, driver, biker) | RBAC middleware with role checking | COMPATIBLE |
| Token refresh | `/auth/refresh` endpoint | COMPATIBLE |
| Phone OTP verification | `/auth/verify-otp` | COMPATIBLE |

### 2.2 API Endpoint Mapping

#### Frontend API_ENDPOINTS (config/env.ts) vs Backend Routes

| Frontend Endpoint | Backend Route | Match Status |
|------------------|---------------|--------------|
| `/auth/login` | `POST /api/v1/auth/login` | MATCH |
| `/auth/signup` | `POST /api/v1/auth/register` | MISMATCH - Different naming |
| `/auth/verify-otp` | `POST /api/v1/auth/verify-otp` | MATCH |
| `/auth/refresh` | `POST /api/v1/auth/refresh` | MATCH |
| `/bookings` | `POST /api/v1/bookings` | MATCH |
| `/bookings` | `GET /api/v1/bookings` | MATCH |
| `/bookings/:id/cancel` | `POST /api/v1/bookings/:id/cancel` | MATCH |
| `/payments/intent` | `POST /api/v1/payments/create-intent` | MISMATCH - Different path |
| `/payments/methods` | `GET /api/v1/payments/methods` | MATCH |

### 2.3 Data Model Compatibility

#### Booking Model Comparison

**Frontend (types/navigation.ts)**
```typescript
interface BookingDetails {
  id: string;
  userId: string;
  chauffeurId: string;
  chauffeurName: string;
  duration: string;
  pickupLocation: Location;
  dropLocation: Location;
  startTime: Date;
  endTime: Date;
  price: number;
  totalAmount: number;
  status: BookingStatus;
  paymentMethod: string;
  paymentStatus: string;
  vehicleType: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Backend (prisma/schema.prisma)**
```prisma
model Booking {
  id                String        @id @default(uuid())
  customerId        String
  driverId          String?
  vehicleId         String?
  pickupLatitude    Float
  pickupLongitude   Float
  pickupAddress     String
  dropoffLatitude   Float?
  dropoffLongitude  Float?
  dropoffAddress    String?
  scheduledTime     DateTime?
  startTime         DateTime?
  endTime           DateTime?
  status            BookingStatus @default(PENDING)
  bookingType       BookingType   @default(ON_DEMAND)
  estimatedFare     Float?
  actualFare        Float?
  paymentMethod     String?
  paymentStatus     PaymentStatus @default(PENDING)
  cancellationReason String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}
```

**Compatibility Issues:**
| Frontend Field | Backend Field | Issue |
|---------------|---------------|-------|
| `chauffeurId` | `driverId` | Different field name |
| `chauffeurName` | Not stored directly | Need to join with Driver model |
| `duration` | Not present | Add to schema or calculate |
| `pickupLocation` (object) | `pickupLatitude`, `pickupLongitude`, `pickupAddress` | Flattened structure |
| `price` | `estimatedFare` | Different naming |
| `totalAmount` | `actualFare` | Different naming |

### 2.4 Enum Compatibility

**Frontend BookingStatus:**
```typescript
type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
```

**Backend BookingStatus (Prisma):**
```prisma
enum BookingStatus {
  PENDING
  ACCEPTED
  DRIVER_ASSIGNED
  DRIVER_ARRIVED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  FAILED
}
```

**Correction Required:** Frontend needs to map lowercase to uppercase and handle additional states (ACCEPTED, DRIVER_ASSIGNED, DRIVER_ARRIVED, FAILED).

---

## 3. Pre-Integration Checklist

### 3.1 Environment Setup

- [ ] PostgreSQL database created (Neon recommended)
- [ ] Redis instance running (for real-time features)
- [ ] Clerk application configured
- [ ] Stripe account with Indian payments enabled
- [ ] Razorpay account (alternative payment)
- [ ] Google Maps API key with required APIs enabled
- [ ] Supabase project created
- [ ] AWS S3 bucket configured
- [ ] Twilio account for SMS
- [ ] SendGrid account for email
- [ ] Firebase project for push notifications

### 3.2 API Keys Required

```bash
# Authentication
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
CLERK_JWT_KEY=

# Database
DATABASE_URL=

# Payments
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Google Services
GOOGLE_MAPS_API_KEY=

# AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

# Notifications
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
SENDGRID_API_KEY=
FCM_SERVER_KEY=

# Real-time
REDIS_URL=
```

### 3.3 Backend Status Check

```bash
# Required routes (currently active in backend)
/api/v1/auth/*       # Active
/api/v1/bookings/*   # Active

# Routes to uncomment in src/routes/v1/index.ts
/api/v1/users/*      # Currently commented
/api/v1/drivers/*    # Currently commented
/api/v1/payments/*   # Currently commented
/api/v1/admin/*      # Currently commented
```

---

## 4. Step-by-Step Integration

### Step 1: Backend Setup

```bash
# Navigate to backend
cd chauffit_dev/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your actual values

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

### Step 2: Enable All Routes

Edit `src/routes/v1/index.ts`:
```typescript
import { Router } from 'express';

// Import ALL route modules (uncomment these)
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import driverRoutes from './driver.routes';
import bookingRoutes from './booking.routes';
import paymentRoutes from './payment.routes';
import adminRoutes from './admin.routes';

const router: Router = Router();

// Mount ALL route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/drivers', driverRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);

export default router;
```

### Step 3: Frontend Configuration

Update `.env` in `chauffit-main/`:
```bash
# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
EXPO_PUBLIC_APP_ENV=development

# Copy these from backend
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_ONESIGNAL_APP_ID=...

# Indian Market Features
EXPO_PUBLIC_UPI_ENABLED=true
EXPO_PUBLIC_GST_ENABLED=true
EXPO_PUBLIC_INDIAN_PHONE_VALIDATION=true
```

### Step 4: Update API Endpoints

Fix the endpoint mismatches in `config/env.ts`:
```typescript
export const API_ENDPOINTS = {
  // Authentication - Fix signup endpoint
  LOGIN: '/auth/login',
  SIGNUP: '/auth/register',  // Changed from /auth/signup
  VERIFY_OTP: '/auth/verify-otp',
  REFRESH_TOKEN: '/auth/refresh',

  // Payments - Fix endpoint path
  CREATE_PAYMENT_INTENT: '/payments/create-intent',  // Changed from /payments/intent
  // ... rest unchanged
} as const;
```

### Step 5: Create API Service Layer

Create `services/ApiService.ts`:
```typescript
import { appConfig, getApiUrl, API_ENDPOINTS } from '../config/env';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private authToken: string | null = null;

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  // Transform frontend booking to backend format
  transformBookingForBackend(booking: BookingDetails) {
    return {
      customerId: booking.userId,
      driverId: booking.chauffeurId,
      pickupLatitude: booking.pickupLocation.latitude,
      pickupLongitude: booking.pickupLocation.longitude,
      pickupAddress: booking.pickupLocation.address,
      dropoffLatitude: booking.dropLocation?.latitude,
      dropoffLongitude: booking.dropLocation?.longitude,
      dropoffAddress: booking.dropLocation?.address,
      scheduledTime: booking.startTime,
      estimatedFare: booking.price,
      paymentMethod: booking.paymentMethod,
      bookingType: 'ON_DEMAND',
    };
  }

  // Transform backend booking to frontend format
  transformBookingForFrontend(booking: any): BookingDetails {
    return {
      id: booking.id,
      userId: booking.customerId,
      chauffeurId: booking.driverId,
      chauffeurName: booking.driver?.user?.name || 'Unknown',
      duration: this.calculateDuration(booking.startTime, booking.endTime),
      pickupLocation: {
        latitude: booking.pickupLatitude,
        longitude: booking.pickupLongitude,
        address: booking.pickupAddress,
      },
      dropLocation: {
        latitude: booking.dropoffLatitude,
        longitude: booking.dropoffLongitude,
        address: booking.dropoffAddress,
      },
      startTime: new Date(booking.startTime),
      endTime: new Date(booking.endTime),
      price: booking.estimatedFare,
      totalAmount: booking.actualFare || booking.estimatedFare,
      status: this.mapBackendStatus(booking.status),
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus?.toLowerCase(),
      vehicleType: booking.vehicle?.type || 'sedan',
      createdAt: new Date(booking.createdAt),
      updatedAt: new Date(booking.updatedAt),
    };
  }

  // Map backend status to frontend status
  mapBackendStatus(backendStatus: string): BookingStatus {
    const statusMap: Record<string, BookingStatus> = {
      'PENDING': 'pending',
      'ACCEPTED': 'confirmed',
      'DRIVER_ASSIGNED': 'confirmed',
      'DRIVER_ARRIVED': 'confirmed',
      'IN_PROGRESS': 'in_progress',
      'COMPLETED': 'completed',
      'CANCELLED': 'cancelled',
      'FAILED': 'cancelled',
    };
    return statusMap[backendStatus] || 'pending';
  }

  private calculateDuration(start: string, end: string): string {
    if (!start || !end) return 'One-way';
    const hours = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 3600000);
    return hours > 0 ? `${hours}hr` : 'One-way';
  }

  // API Methods
  async createBooking(booking: BookingDetails): Promise<ApiResponse<BookingDetails>> {
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.CREATE_BOOKING), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(this.transformBookingForBackend(booking)),
      });
      const data = await response.json();
      if (data.success) {
        return { success: true, data: this.transformBookingForFrontend(data.data) };
      }
      return { success: false, error: data.message };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async getBookings(): Promise<ApiResponse<BookingDetails[]>> {
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.GET_BOOKINGS), {
        headers: this.getHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        return {
          success: true,
          data: data.data.map(this.transformBookingForFrontend.bind(this))
        };
      }
      return { success: false, error: data.message };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }
}

export default new ApiService();
```

### Step 6: Update Zustand Stores

Update `store/bookingStore.ts` to use real API:
```typescript
import ApiService from '../services/ApiService';

// Replace mock functions with real API calls:
createBooking: async (bookingDetails) => {
  const result = await ApiService.createBooking(bookingDetails);
  if (result.success && result.data) {
    set((state) => ({
      activeBookings: [...state.activeBookings, result.data],
      currentBooking: null,
    }));
    return result.data;
  }
  throw new Error(result.error || 'Failed to create booking');
},
```

---

## 5. API Inventory

### 5.1 Authentication APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | User registration | No |
| POST | `/api/v1/auth/login` | User login | No |
| POST | `/api/v1/auth/verify-otp` | Verify OTP | No |
| POST | `/api/v1/auth/refresh` | Refresh token | Yes |
| POST | `/api/v1/auth/logout` | Logout user | Yes |

### 5.2 Booking APIs

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/api/v1/bookings` | Create booking | Yes | Customer |
| GET | `/api/v1/bookings` | Get user bookings | Yes | Any |
| GET | `/api/v1/bookings/:id` | Get booking details | Yes | Any |
| PUT | `/api/v1/bookings/:id` | Update booking | Yes | Any |
| POST | `/api/v1/bookings/:id/cancel` | Cancel booking | Yes | Customer |
| POST | `/api/v1/bookings/:id/accept` | Accept booking | Yes | Driver |
| POST | `/api/v1/bookings/:id/reject` | Reject booking | Yes | Driver |
| POST | `/api/v1/bookings/:id/start` | Start ride | Yes | Driver |
| POST | `/api/v1/bookings/:id/complete` | Complete ride | Yes | Driver |
| POST | `/api/v1/bookings/:id/rate` | Rate ride | Yes | Customer |
| GET | `/api/v1/bookings/active` | Get active bookings | Yes | Any |
| GET | `/api/v1/bookings/pending` | Get pending for drivers | Yes | Driver |
| POST | `/api/v1/bookings/estimate` | Estimate fare | Yes | Customer |
| GET | `/api/v1/bookings/nearby` | Find nearby drivers | Yes | Customer |
| POST | `/api/v1/bookings/:id/assign` | Assign driver | Yes | Admin |
| POST | `/api/v1/bookings/search` | Search bookings | Yes | Admin |
| GET | `/api/v1/bookings/stats` | Booking statistics | Yes | Admin |
| POST | `/api/v1/bookings/:id/sos` | Emergency SOS | Yes | Any |

### 5.3 User APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/users/profile` | Get user profile | Yes |
| PUT | `/api/v1/users/profile` | Update profile | Yes |
| POST | `/api/v1/users/avatar` | Upload avatar | Yes |
| GET | `/api/v1/users/vehicles` | Get user vehicles | Yes |
| POST | `/api/v1/users/vehicles` | Add vehicle | Yes |
| DELETE | `/api/v1/users/vehicles/:id` | Remove vehicle | Yes |

### 5.4 Driver APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/drivers/register` | Register as driver | Yes |
| GET | `/api/v1/drivers/profile` | Get driver profile | Yes |
| PUT | `/api/v1/drivers/status` | Update availability | Yes |
| POST | `/api/v1/drivers/location` | Update location | Yes |
| GET | `/api/v1/drivers/earnings` | Get earnings | Yes |
| GET | `/api/v1/drivers/stats` | Get statistics | Yes |

### 5.5 Payment APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/payments/create-intent` | Create payment intent | Yes |
| POST | `/api/v1/payments/confirm` | Confirm payment | Yes |
| GET | `/api/v1/payments/methods` | Get payment methods | Yes |
| POST | `/api/v1/payments/methods` | Add payment method | Yes |
| DELETE | `/api/v1/payments/methods/:id` | Remove payment method | Yes |
| GET | `/api/v1/payments/history` | Payment history | Yes |

### 5.6 Admin APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/admin/dashboard` | Admin dashboard | Yes (Admin) |
| GET | `/api/v1/admin/users` | List all users | Yes (Admin) |
| PUT | `/api/v1/admin/users/:id` | Update user | Yes (Admin) |
| GET | `/api/v1/admin/drivers` | List all drivers | Yes (Admin) |
| PUT | `/api/v1/admin/drivers/:id/verify` | Verify driver | Yes (Admin) |
| GET | `/api/v1/admin/bookings` | All bookings | Yes (Admin) |
| GET | `/api/v1/admin/analytics` | Analytics data | Yes (Admin) |
| POST | `/api/v1/admin/notifications` | Send notification | Yes (Admin) |

### 5.7 Webhook Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/stripe` | Stripe payment webhook |
| POST | `/api/webhooks/razorpay` | Razorpay webhook |
| POST | `/api/webhooks/clerk` | Clerk auth webhook |
| POST | `/api/webhooks/twilio` | Twilio SMS webhook |
| POST | `/api/webhooks/firebase` | Firebase webhook |
| POST | `/api/webhooks/maps` | Google Maps webhook |
| GET | `/api/webhooks/health` | Health check |

---

## 6. Environment Configuration

### 6.1 Frontend Environment Variables (.env)

```bash
# =================================================================
# CHAUFFIT FRONTEND - ENVIRONMENT CONFIGURATION
# =================================================================

# =================================================================
# APP CONFIGURATION
# =================================================================
EXPO_PUBLIC_APP_NAME=Chauffit
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_APP_ENV=development

# =================================================================
# API CONFIGURATION
# =================================================================
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
EXPO_PUBLIC_API_TIMEOUT=30000

# =================================================================
# CLERK AUTHENTICATION
# =================================================================
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# =================================================================
# GOOGLE MAPS
# =================================================================
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=AIza...

# =================================================================
# SUPABASE (Real-time)
# =================================================================
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# =================================================================
# STRIPE PAYMENTS
# =================================================================
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# =================================================================
# PUSH NOTIFICATIONS
# =================================================================
EXPO_PUBLIC_ONESIGNAL_APP_ID=...

# =================================================================
# INDIAN MARKET FEATURES
# =================================================================
EXPO_PUBLIC_UPI_ENABLED=true
EXPO_PUBLIC_GST_ENABLED=true
EXPO_PUBLIC_INDIAN_PHONE_VALIDATION=true

# =================================================================
# FEATURE FLAGS
# =================================================================
EXPO_PUBLIC_REAL_TIME_TRACKING=true
EXPO_PUBLIC_BIOMETRIC_AUTH=true
EXPO_PUBLIC_VOICE_CALLING=true
EXPO_PUBLIC_CHAT_MESSAGING=true
EXPO_PUBLIC_EMERGENCY_ALERTS=true
EXPO_PUBLIC_SCHEDULED_BOOKINGS=true
EXPO_PUBLIC_MULTIPLE_PAYMENTS=true
EXPO_PUBLIC_LOYALTY_PROGRAM=false

# =================================================================
# DEBUG
# =================================================================
EXPO_PUBLIC_DEBUG_MODE=true
```

### 6.2 Backend Environment Variables (.env)

```bash
# =================================================================
# CHAUFFIT BACKEND - ENVIRONMENT CONFIGURATION
# =================================================================

# Application
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:pass@host:5432/chauffit_db?sslmode=require"

# Redis
REDIS_URL="redis://localhost:6379"

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_JWT_KEY=...

# JWT
JWT_SECRET=your_jwt_secret_change_in_production
JWT_EXPIRE=7d

# Google Maps
GOOGLE_MAPS_API_KEY=AIza...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
AWS_S3_BUCKET=chauffit-documents

# Notifications
FCM_SERVER_KEY=...
SENDGRID_API_KEY=...
FROM_EMAIL=noreply@chauffit.com
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890

# CORS
ALLOWED_ORIGINS=http://localhost:3000,exp://localhost:19000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# WebSocket
SOCKET_IO_CORS_ORIGIN=http://localhost:3000
SOCKET_IO_PATH=/socket.io

# Business Logic
DRIVER_SEARCH_RADIUS_KM=10
RIDE_REQUEST_TIMEOUT_SECONDS=60
MIN_DRIVER_RATING=3.0
BASE_FARE_AMOUNT=50
FARE_PER_KM=15
FARE_PER_MINUTE=2
MAX_SURGE_MULTIPLIER=3.0
```

---

## 7. External Services

### 7.1 Required Services Summary

| Service | Purpose | Priority | Account Needed |
|---------|---------|----------|----------------|
| **Clerk** | Authentication (JWT, OTP) | Critical | Yes |
| **Neon PostgreSQL** | Database | Critical | Yes |
| **Redis** | Caching, Real-time | High | Yes |
| **Stripe** | Payments (International) | Critical | Yes |
| **Razorpay** | Payments (Indian) | High | Yes |
| **Google Maps** | Maps, Geocoding, Directions | Critical | Yes |
| **Supabase** | Real-time subscriptions | High | Yes |
| **AWS S3** | File storage | Medium | Yes |
| **Twilio** | SMS OTP | High | Yes |
| **SendGrid** | Email notifications | Medium | Yes |
| **Firebase** | Push notifications | High | Yes |
| **OneSignal** | Push notifications (Alt) | Medium | Optional |

### 7.2 Google Maps APIs Required

Enable these APIs in Google Cloud Console:
- Maps JavaScript API
- Maps SDK for Android
- Maps SDK for iOS
- Places API
- Geocoding API
- Directions API
- Distance Matrix API
- Roads API

### 7.3 Stripe Configuration for India

```javascript
// Enable Indian payment methods in Stripe Dashboard:
// 1. Cards (Visa, Mastercard, RuPay)
// 2. UPI
// 3. Wallets (Paytm, PhonePe, Google Pay)
// 4. Net Banking

// Set currency to INR
const paymentIntent = await stripe.paymentIntents.create({
  amount: amount * 100, // paise
  currency: 'inr',
  automatic_payment_methods: { enabled: true },
});
```

---

## 8. Real-Time Services

### 8.1 Supabase Real-Time (Frontend)

**Currently Implemented:**
- Location tracking broadcast
- Booking status updates
- Emergency alerts within radius
- Chat messaging
- Driver/Biker availability

**Setup:**
```typescript
// services/SupabaseRealTimeService.ts
import { createClient } from '@supabase/supabase-js';
import { appConfig } from '../config/env';

const supabase = createClient(
  appConfig.supabaseUrl,
  appConfig.supabaseAnonKey
);

// Subscribe to location updates
const locationChannel = supabase.channel('location-updates');
locationChannel
  .on('broadcast', { event: 'location' }, (payload) => {
    updateDriverLocation(payload);
  })
  .subscribe();
```

### 8.2 Socket.io (Backend)

**Currently Implemented:**
- Real-time booking notifications
- Driver location updates
- Chat messaging
- SOS alerts

**Setup:**
```typescript
// Backend socket configuration
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_IO_CORS_ORIGIN?.split(','),
  },
  path: process.env.SOCKET_IO_PATH,
});

// Use Redis adapter for scaling
const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));
```

---

## 9. Post-Integration Testing

### 9.1 API Testing Checklist

```bash
# Authentication
[ ] User registration works
[ ] User login works
[ ] OTP verification works
[ ] Token refresh works
[ ] Logout works
[ ] Role-based access enforced

# Bookings
[ ] Create booking works
[ ] Get bookings returns correct data
[ ] Cancel booking works
[ ] Driver can accept/reject
[ ] Driver can start/complete ride
[ ] Rating system works

# Payments
[ ] Payment intent creation works
[ ] Stripe checkout works
[ ] Razorpay checkout works (India)
[ ] UPI payments work
[ ] Payment confirmation works
[ ] Refunds work

# Real-time
[ ] Location updates broadcast
[ ] Booking status updates received
[ ] Chat messages delivered
[ ] Emergency alerts work
```

### 9.2 Testing Commands

```bash
# Backend Health Check
curl http://localhost:3000/api/v1/

# Auth Test
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'

# Create Booking Test (with auth)
curl -X POST http://localhost:3000/api/v1/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pickupLatitude": 28.6139,
    "pickupLongitude": 77.2090,
    "pickupAddress": "Connaught Place, New Delhi",
    "dropoffLatitude": 28.6500,
    "dropoffLongitude": 77.2500,
    "dropoffAddress": "India Gate, New Delhi"
  }'
```

---

## 10. Issues Found & Corrections

### 10.1 Critical Issues

| # | Issue | Location | Fix Required |
|---|-------|----------|--------------|
| 1 | Signup endpoint mismatch | `config/env.ts` | Change `/auth/signup` to `/auth/register` |
| 2 | Payment intent endpoint mismatch | `config/env.ts` | Change `/payments/intent` to `/payments/create-intent` |
| 3 | Status enum case mismatch | Frontend/Backend | Create status mapper function |
| 4 | Field naming differences | Booking model | Create transformer functions |
| 5 | User routes commented out | Backend routes | Uncomment user routes |
| 6 | Driver routes commented out | Backend routes | Uncomment driver routes |
| 7 | Payment routes commented out | Backend routes | Uncomment payment routes |
| 8 | Admin routes commented out | Backend routes | Uncomment admin routes |

### 10.2 Field Mapping Corrections

Create these mapping functions:

```typescript
// Field name mappings
const fieldMappings = {
  // Frontend -> Backend
  'chauffeurId': 'driverId',
  'price': 'estimatedFare',
  'totalAmount': 'actualFare',
  'pickupLocation.latitude': 'pickupLatitude',
  'pickupLocation.longitude': 'pickupLongitude',
  'pickupLocation.address': 'pickupAddress',
  'dropLocation.latitude': 'dropoffLatitude',
  'dropLocation.longitude': 'dropoffLongitude',
  'dropLocation.address': 'dropoffAddress',
};

// Status mappings
const statusMappings = {
  // Backend -> Frontend
  'PENDING': 'pending',
  'ACCEPTED': 'confirmed',
  'DRIVER_ASSIGNED': 'confirmed',
  'DRIVER_ARRIVED': 'confirmed',
  'IN_PROGRESS': 'in_progress',
  'COMPLETED': 'completed',
  'CANCELLED': 'cancelled',
  'FAILED': 'cancelled',
};
```

### 10.3 Recommended Schema Updates (Backend)

Add these fields to the Booking model:
```prisma
model Booking {
  // ... existing fields ...

  // Add for frontend compatibility
  duration          String?           // e.g., "2hr", "One-way", "Round-trip"
  serviceType       ServiceType       @default(CHAUFFEUR)
}

enum ServiceType {
  CHAUFFEUR
  EXTENDED_SERVICE
  AIRPORT_TRANSFER
  CORPORATE
}
```

---

## 11. Deployment Guide

### 11.1 Backend Deployment (Railway/Render)

```bash
# Railway
railway login
railway init
railway add
railway up

# Render
# Create web service pointing to backend repo
# Set environment variables in dashboard
# Add build command: npm install && npx prisma generate
# Add start command: npm start
```

### 11.2 Database Deployment (Neon)

```bash
# 1. Create project at neon.tech
# 2. Copy connection string
# 3. Set DATABASE_URL in backend .env
# 4. Run migrations
npx prisma migrate deploy
```

### 11.3 Frontend Deployment (Expo/EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for production
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### 11.4 Production Checklist

```bash
# Backend
[ ] NODE_ENV=production
[ ] All secrets are production values
[ ] Database migrations applied
[ ] Redis configured with password
[ ] CORS configured for production domains
[ ] Rate limiting enabled
[ ] SSL/TLS configured
[ ] Logging configured
[ ] Error monitoring set up (Sentry)

# Frontend
[ ] API_BASE_URL points to production
[ ] All API keys are production values
[ ] Debug mode disabled
[ ] Analytics enabled
[ ] Crash reporting enabled
[ ] App Store/Play Store listings ready
```

---

## Quick Reference Card

### API Base URLs
```
Development: http://localhost:3000/api/v1
Staging:     https://staging-api.chauffit.com/api/v1
Production:  https://api.chauffit.com/api/v1
```

### Key Endpoints
```
Auth:     POST /auth/register, /auth/login, /auth/verify-otp
Bookings: POST /bookings, GET /bookings, POST /bookings/:id/cancel
Payments: POST /payments/create-intent, POST /payments/confirm
Drivers:  GET /drivers/nearby, POST /drivers/location
```

### Emergency Numbers (India)
```
Police:         100
Ambulance:      108
Fire:           101
Women Helpline: 1091
Child Helpline: 1098
```

---

**Document Version:** 1.0.0
**Last Updated:** November 2024
**Maintained By:** Chauffit Development Team
