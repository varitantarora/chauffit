# Chauffit - Architecture Documentation

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [App Entry and Initialization](#app-entry-and-initialization)
5. [Routing and Navigation](#routing-and-navigation)
6. [Authentication and Role System](#authentication-and-role-system)
7. [State Management](#state-management)
8. [API Layer](#api-layer)
9. [Real-Time Communication](#real-time-communication)
10. [Payments](#payments)
11. [Styling and Theming](#styling-and-theming)
12. [Components](#components)
13. [Internationalization](#internationalization)
14. [Environment Configuration](#environment-configuration)
15. [Known Caveats](#known-caveats)

---

## Overview

Chauffit is a multi-role ride-hailing and delivery platform built as a single React Native application. It serves four distinct user roles -- customers, drivers, bikers, and administrators -- through a shared codebase with role-based routing and feature segregation.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React Native | 0.81.5 |
| SDK | Expo | 54 |
| Routing | Expo Router | v6 (file-based) |
| State Management | Zustand | v5 |
| Styling | NativeWind | v4 (Tailwind CSS for RN) |
| Language | TypeScript | 5.9 |
| Real-Time | Supabase | Broadcast channels |
| Payments | Razorpay | Native SDK |
| Maps | react-native-maps | 1.20.1 |
| Animations | Reanimated | v4 |
| Date Handling | date-fns | v4 |
| Notifications | expo-notifications | -- |

---

## Project Structure

```
chauffit/
├── app/                          # Expo Router file-based routes
│   ├── _layout.tsx               # Root layout (GestureHandler + SafeArea + Stack)
│   ├── index.tsx                 # Entry: auth init + role-based redirect
│   ├── (auth)/                   # Authentication screens
│   ├── (customer)/               # Customer role screens
│   ├── (driver)/                 # Driver role screens
│   ├── (biker)/                  # Biker role screens
│   └── (admin)/                  # Admin role screens
├── components/
│   ├── admin/                    # FilterPills, StatCard, StatusBadge
│   ├── auth/                     # EmailLoginForm, LoginMethodToggle, PhoneLoginForm
│   ├── biker/                    # IncentiveTracker, ResponseTimer, BikerMap, TaskCard
│   ├── common/                   # PrimaryButton, ThemedCard, ThemedText, ThemedView
│   ├── customer/                 # BookingCard, CancelReasonModal, MapLocationPicker
│   ├── driver/                   # EarningsCard, JobCard, RouteMap, OnlineToggle
│   └── shared/                   # ErrorBoundary, LoadingOverlay, MapView, NetworkStatus
├── constants/
│   ├── Colors.tsx                # BrandColors, LightColors, DarkColors, useThemeColors
│   ├── MapStyles.ts              # Google Maps custom styles
│   ├── VerificationConfig.ts     # Document verification settings
│   └── carBrandsData.ts          # Car brand catalog data
├── services/
│   ├── api/                      # API service layer
│   │   ├── BaseApiService.ts     # Singleton HTTP client with auth + retry
│   │   ├── AuthApiService.ts
│   │   ├── BookingApiService.ts
│   │   ├── DriverApiService.ts
│   │   ├── DriverRidesApiService.ts
│   │   ├── BikerApiService.ts
│   │   ├── BikerTaskApiService.ts
│   │   ├── PaymentApiService.ts
│   │   ├── InsuranceApiService.ts
│   │   ├── AdminApiService.ts
│   │   ├── BlogApiService.ts
│   │   ├── LoyaltyApiService.ts
│   │   ├── ConfigApiService.ts
│   │   ├── NotificationApiService.ts
│   │   ├── NotificationPreferencesApiService.ts
│   │   ├── CustomerCarApiService.ts
│   │   ├── LocationApiService.ts
│   │   ├── MetaApiService.ts
│   │   ├── AmenityApiService.ts
│   │   └── AdvertisementApiService.ts
│   ├── SupabaseRealTimeService.ts
│   ├── RazorpayService.ts
│   ├── StripeService.ts
│   └── NotificationService.ts
├── store/                        # Zustand state stores
│   ├── authStore.ts
│   ├── bookingStore.ts
│   ├── jobStore.ts
│   ├── taskStore.ts
│   ├── carStore.ts
│   ├── earningsStore.ts
│   ├── bikerEarningsStore.ts
│   ├── i18nStore.ts
│   ├── configStore.ts
│   ├── loyaltyStore.ts
│   ├── loginStore.ts
│   └── adminStore.ts
├── config/
│   ├── env.ts                    # Environment variable loading
│   └── supabase.ts               # Supabase client config
└── global.css                    # NativeWind/Tailwind global styles
```

---

## App Entry and Initialization

```
┌─────────────────────────────────────────────────┐
│                 app/_layout.tsx                  │
│  GestureHandlerRootView                         │
│  └── SafeAreaProvider                           │
│      └── Stack (expo-router)                    │
│          ├── Language init from AsyncStorage     │
│          ├── Push notification registration      │
│          └── Renders child route (index.tsx)     │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│                 app/index.tsx                    │
│                                                 │
│  1. initializeAuth() loads JWT from AsyncStorage│
│  2. Show ActivityIndicator while isInitializing │
│  3. On completion:                              │
│     ┌─ !hasSeenOnboarding → /(auth)/onboarding  │
│     ├─ !isAuthenticated   → /(auth)/login       │
│     ├─ activeRole=driver  → getDriverRoute()    │
│     ├─ activeRole=biker   → /(biker)/(tabs)     │
│     ├─ activeRole=admin   → /(admin)/(tabs)     │
│     └─ activeRole=customer→ /(customer)/(tabs)  │
└─────────────────────────────────────────────────┘
```

The root layout wraps the entire app in `GestureHandlerRootView` and `SafeAreaProvider` before rendering the Expo Router `Stack`. It also initializes language preferences and registers push notification listeners.

The entry screen (`index.tsx`) triggers `initializeAuth()` which rehydrates JWT tokens from AsyncStorage, fetches the user profile, and determines the correct landing route based on authentication state and active role.

---

## Routing and Navigation

Expo Router v6 provides file-based routing. Route groups (directories wrapped in parentheses) organize screens without affecting URL paths.

### Navigation Flow

```
                            index.tsx
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
            Not auth'd     Has auth        Driver with
                 │          + role          onboarding
                 ▼              ▼           incomplete
           /(auth)/        /(role)/             │
                            (tabs)         /(driver)/
                                           onboarding/
```

### Auth Screens -- `(auth)/`

| Screen | Purpose |
|---|---|
| `login.tsx` | Main login with method toggle |
| `email-login.tsx` | Email/password authentication |
| `phone-login.tsx` | Phone number + OTP authentication |
| `signup.tsx` | New account registration |
| `otp-verification.tsx` | OTP entry and verification |
| `delete-account.tsx` | Account deletion flow |
| `car-details.tsx` | Vehicle details entry during signup |

### Customer Screens -- `(customer)/`

**Tabs:** home, history, profile, services

Additional screens: booking flows (`book-ride-new.tsx`), ride tracking, wallet management, payment methods, favorite drivers/locations, and ride scheduling.

### Driver Screens -- `(driver)/`

**Tabs:** home, requests, earnings, profile

```
Driver Onboarding Flow (getDriverRoute):
────────────────────────────────────────
  null                    → registration.tsx
  registered              → documents.tsx
  verification_in_progress → background-check.tsx
  verified_ready_for_training → background-check.tsx
  training_scheduled      → background-check.tsx
  certified               → onboarding-complete.tsx
  active                  → (driver)/(tabs)/index.tsx
```

Additional screens: job flows (accept, active ride, completed, navigation, OTP verification), banking details, and earnings management.

### Biker Screens -- `(biker)/`

**Tabs:** home, deliveries, earnings, profile

Additional screens: task flows (single-pickup, batch-pickup, delivery confirmation, emergency response), navigation, and onboarding.

### Admin Screens -- `(admin)/`

**Tabs:** dashboard, analytics, rides, users, profile, settings

Additional screens: driver management, biker management, dispute resolution, payment oversight, insurance toggles, config management, training batch management, advertisement management, amenity management, and pricing configuration.

---

## Authentication and Role System

### Auth Flow

```
┌──────────┐     ┌──────────────┐     ┌────────────────┐
│  Login    │────▶│  Auth API    │────▶│  JWT tokens    │
│  Screen   │     │  (email/     │     │  saved to      │
│           │     │   phone)     │     │  AsyncStorage   │
└──────────┘     └──────────────┘     └───────┬────────┘
                                              │
                                              ▼
                                     ┌────────────────┐
                                     │  initializeAuth│
                                     │  rehydrates    │
                                     │  tokens +      │
                                     │  user profile  │
                                     └───────┬────────┘
                                              │
                          ┌───────────────────┼───────────────────┐
                          │                   │                   │
                          ▼                   ▼                   ▼
                   activeRole:          activeRole:         activeRole:
                   'customer'           'driver'            'biker'/'admin'
                          │                   │                   │
                          ▼                   ▼                   ▼
                   /(customer)/         getDriverRoute()    /(biker)/ or
                   (tabs)/              checks status       /(admin)/
                                        for onboarding
```

### Token Management

- Access token and refresh token stored in `AsyncStorage` under keys `access_token` and `refresh_token`.
- `BaseApiService` loads tokens on construction and attaches them as `Authorization: Bearer <token>` headers.
- On 401 responses, the service automatically attempts a token refresh. Concurrent refresh attempts are deduplicated via a shared Promise to prevent race conditions.
- On successful refresh, the failed request is retried with the new token.

### Role System

Users can hold multiple roles (`customer`, `driver`, `biker`, `admin`, `super_admin`). The `activeRole` in `authStore` determines which section of the app is displayed. This allows a single user account to switch between roles.

---

## State Management

All application state is managed through Zustand v5 stores. There is no Redux or React Context for app state.

### Store Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Zustand Stores                        │
├─────────────────┬───────────────────────────────────────┤
│ authStore       │ Auth state, user profile, roles,       │
│                 │ theme toggle, online status,           │
│                 │ driverOnboardingStatus                 │
├─────────────────┼───────────────────────────────────────┤
│ bookingStore    │ Booking flow, chauffeur search,        │
│                 │ ride tracking (partially mock)          │
├─────────────────┼───────────────────────────────────────┤
│ jobStore        │ Driver job state (fully API-integrated) │
├─────────────────┼───────────────────────────────────────┤
│ taskStore       │ Biker task management                   │
├─────────────────┼───────────────────────────────────────┤
│ carStore        │ Customer vehicle management             │
├─────────────────┼───────────────────────────────────────┤
│ earningsStore   │ Driver earnings and statistics          │
├─────────────────┼───────────────────────────────────────┤
│ bikerEarningsStore│ Biker earnings and statistics         │
├─────────────────┼───────────────────────────────────────┤
│ i18nStore       │ Internationalization (EN + HI, 70+ keys)│
├─────────────────┼───────────────────────────────────────┤
│ configStore     │ Feature flags (insurance_enabled, etc.) │
├─────────────────┼───────────────────────────────────────┤
│ loyaltyStore    │ Loyalty program state                   │
├─────────────────┼───────────────────────────────────────┤
│ loginStore      │ Login form state                        │
├─────────────────┼───────────────────────────────────────┤
│ adminStore      │ Admin dashboard state                   │
└─────────────────┴───────────────────────────────────────┘
```

### Data Flow Pattern

```
  Component
     │
     │  reads state via hook: useXxxStore(state => state.field)
     │  calls action: useXxxStore.getState().someAction()
     │
     ▼
  Zustand Store ──────────────────────────────┐
     │                                        │
     │  action calls API service              │
     ▼                                        │
  API Service (services/api/)                 │
     │                                        │
     │  HTTP request with auth headers        │
     ▼                                        │
  Backend API                                 │
     │                                        │
     │  response                              │
     ▼                                        │
  Store updates state ◄───────────────────────┘
     │            set({ field: data })
     ▼
  Component re-renders with new state
```

---

## API Layer

### BaseApiService (Singleton)

Located at `services/api/BaseApiService.ts`. All specialized API services extend or use this class.

```
┌─────────────────────────────────────────────────────────┐
│                   BaseApiService                         │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Token Management                                │   │
│  │  ├── loadTokens() from AsyncStorage              │   │
│  │  ├── setTokens(access, refresh)                  │   │
│  │  ├── clearTokens()                               │   │
│  │  └── getAccessToken()                            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  HTTP Methods                                    │   │
│  │  ├── GET(url, params)                            │   │
│  │  ├── POST(url, body)                             │   │
│  │  ├── PUT(url, body)                              │   │
│  │  ├── PATCH(url, body)                            │   │
│  │  └── DELETE(url)                                 │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Middleware / Cross-cutting                      │   │
│  │  ├── Bearer token injection                     │   │
│  │  ├── 401 → refresh → retry (deduplicated)       │   │
│  │  ├── Request/response logging with timing       │   │
│  │  ├── Password/token sanitization in logs         │   │
│  │  └── FormData support for file uploads           │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Token Refresh Flow

```
  Request fails with 401
         │
         ▼
  refreshPromise exists?
     ├── Yes → await existing refreshPromise
     └── No  → create new refreshPromise
                   │
                   ▼
              POST /auth/refresh with refresh_token
                   │
              ┌────┴────┐
              │         │
           Success    Failure
              │         │
              ▼         ▼
         Save new    Clear tokens
         tokens to   + Redirect
         AsyncStore  to login
              │
              ▼
         Retry original
         request with
         new access_token
```

### Specialized API Services

| Service | Responsibility |
|---|---|
| `AuthApiService` | Login, signup, OTP, token refresh, profile |
| `BookingApiService` | Ride booking, chauffeur search, ride history |
| `DriverApiService` | Driver profile, registration, onboarding |
| `DriverRidesApiService` | Driver ride acceptance, completion, navigation |
| `BikerApiService` | Biker profile and registration |
| `BikerTaskApiService` | Biker task assignment and completion |
| `PaymentApiService` | Payment processing, order creation, verification |
| `InsuranceApiService` | Insurance policy management |
| `AdminApiService` | Admin dashboard, user management, analytics |
| `BlogApiService` | Blog content management |
| `LoyaltyApiService` | Loyalty program operations |
| `ConfigApiService` | Feature flag and app configuration |
| `NotificationApiService` | Push notification management |
| `NotificationPreferencesApiService` | Notification preference settings |
| `CustomerCarApiService` | Customer vehicle CRUD |
| `LocationApiService` | Location search, geocoding |
| `MetaApiService` | Metadata and configuration endpoints |
| `AmenityApiService` | Amenity listing and management |
| `AdvertisementApiService` | Advertisement content management |

---

## Real-Time Communication

`services/SupabaseRealTimeService.ts` manages all real-time features through Supabase broadcast channels.

### Channel Types

```
┌────────────────────────────────────────────────────────┐
│              SupabaseRealTimeService                    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Location Channel                                │  │
│  │  ├── Driver/biker GPS position updates           │  │
│  │  ├── Speed, heading, accuracy metadata           │  │
│  │  └── Used for: map markers, ETA calculation      │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  Booking Channel                                 │  │
│  │  ├── Status changes (pending → accepted → etc.)  │  │
│  │  ├── Driver assignment notifications             │  │
│  │  ├── Fare updates                                │  │
│  │  └── Used for: ride tracking, driver dispatch    │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  Emergency Channel                               │  │
│  │  ├── SOS alerts with GPS coordinates             │  │
│  │  ├── Alert type classification                   │  │
│  │  └── Used for: safety monitoring, dispatch       │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  Chat Channel                                    │  │
│  │  ├── Text, location, image messages              │  │
│  │  ├── Read receipts                               │  │
│  │  └── Used for: customer-driver communication     │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Data Contracts

```typescript
// Location update payload
interface LocationUpdate {
  userId: string;
  userType: 'customer' | 'driver' | 'biker';
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

// Booking status change payload
interface BookingUpdate {
  id: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  driverId?: string;
  bikerId?: string;
  driverLocation?: { lat: number; lng: number };
  estimatedArrival?: string;
  fare?: number;
}

// Emergency alert payload
interface EmergencyAlert {
  id: string;
  userId: string;
  userType: 'customer' | 'driver' | 'biker';
  latitude: number;
  longitude: number;
  locationDescription: string;
  alertType: 'general' | 'medical' | 'security' | 'vehicle';
  message?: string;
  timestamp: number;
}

// Chat message payload
interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderType: 'customer' | 'driver' | 'biker' | 'system';
  message: string;
  messageType: 'text' | 'location' | 'image' | 'system';
  timestamp: number;
  isRead: boolean;
}
```

---

## Payments

### Razorpay Integration

`services/RazorpayService.ts` implements the full Razorpay native checkout flow.

```
  User taps "Pay"
       │
       ▼
  RazorpayService.initiatePayment(bookingId)
       │
       ▼
  PaymentApiService.createOrder(bookingId)
       │  POST to backend → returns Razorpay order_id
       ▼
  Razorpay SDK opens native checkout
       │  User enters payment details / selects UPI / card
       ▼
  SDK returns payment response
  (payment_id, order_id, signature)
       │
       ▼
  PaymentApiService.verifyPayment(response)
       │  Backend verifies signature server-side
       ▼
  Payment confirmed or rejected
```

---

## Styling and Theming

### NativeWind v4 (Tailwind for React Native)

All styling uses Tailwind utility classes via NativeWind v4. The `global.css` file is imported at the root layout level.

### Brand Color System

```
┌─────────────────────────────────────────────────────┐
│                  Brand Palette                       │
│                                                      │
│  Primary:    #D9D1C6  ██████████  Pastel Gray        │
│  Secondary:  #BD8C5E  ██████████  Deer / Warm Accent │
│  Burgundy:   #720C17  ██████████  Icons, App Bar     │
│                                                      │
│  Semantic:                                          │
│  Success:    #10B981  ██████████  Green              │
│  Danger:     #EF4444  ██████████  Red / SOS          │
│  Warning:    #F59E0B  ██████████  Amber              │
│  Info:       #BD8C5E  ██████████  Brand-aligned      │
└─────────────────────────────────────────────────────┘
```

Each brand color has a full 50--900 scale defined in `tailwind.config.js`:

- `primary-50` (#F7F0E7) through `primary-900` (#916E53)
- `secondary-50` (#F7F0E7) through `secondary-900` (#612800)
- `burgundy-50` (#FCE8EA) through `burgundy-900` (#46080E)

### Theme System

```typescript
// constants/Colors.tsx provides light and dark palettes

LightColors:                          DarkColors:
  background: #FFFFFF                  background: #1A1A1A
  surface:    #F9F9F9                  surface:    #2C2C2C
  card:       #FFFFFF                  card:       #2C2C2C
  textPrimary:#000000                  textPrimary:#D9D1C6
  textSecondary:#314B4C               textSecondary:#999999
  border:     #E5E5E5                  border:     #4A4A4A
  overlay:    rgba(0,0,0,0.5)          overlay:    rgba(0,0,0,0.7)
```

Dark mode is toggled via `useAuthStore().toggleTheme()`. The `useThemeColors(isDark)` hook returns the appropriate color set.

### Themed Components

Reusable themed primitives in `components/common/`:

| Component | Purpose |
|---|---|
| `ThemedText` | Text that adapts to light/dark theme |
| `ThemedView` | View with theme-aware background |
| `ThemedCard` | Card container with theme styling |
| `PrimaryButton` | Brand-styled button component |
| `SearchableDropdown` | Dropdown with search and theming |

### Custom Animations

Defined in `tailwind.config.js`:

| Animation | Duration | Use Case |
|---|---|---|
| `fade-in` | 0.5s ease-in-out | Screen transitions |
| `slide-up` | 0.3s ease-out | Bottom sheets, modals |
| `bounce-gentle` | 0.6s ease-in-out | Subtle attention draws |
| `scale-in` | 0.2s ease-out | Button press feedback |
| `slide-in-right` | 0.3s ease-out | Navigation transitions |
| `pulse-soft` | 2s ease-in-out infinite | Loading indicators |

---

## Components

### Component Organization

```
components/
├── admin/           Admin-specific UI
│   ├── FilterPills        Multi-select filter chips
│   ├── StatCard           Dashboard statistics card
│   └── StatusBadge        Status indicator badges
├── auth/            Authentication forms
│   ├── EmailLoginForm     Email/password input form
│   ├── LoginMethodToggle  Switch between email/phone login
│   └── PhoneLoginForm     Phone number + OTP form
├── biker/           Biker-specific UI
│   ├── IncentiveTracker   Bonus/incentive progress display
│   ├── ResponseTimer      Countdown for task acceptance
│   ├── BikerMap           Map view for biker tasks
│   ├── BikeDetails        Bike information display
│   ├── PriorityBadge      Task priority indicator
│   └── TaskCard           Task summary card
├── common/          Shared primitives (themed)
│   ├── PrimaryButton      Brand-styled button
│   ├── SearchableDropdown Search + select component
│   ├── ThemedCard         Theme-aware card
│   ├── ThemedText         Theme-aware text
│   └── ThemedView         Theme-aware view
├── customer/        Customer-specific UI
│   ├── BookingCard        Ride booking summary
│   ├── CancelReasonModal  Cancellation reason selector
│   ├── CarDetailsScreen   Vehicle details display
│   ├── DriverCard         Driver information card
│   ├── DurationSelector   Ride duration picker
│   ├── GooglePlacesAutocomplete  Address search
│   ├── MapLocationPicker  Interactive map for pin drop
│   ├── PaymentMethodSelector  Payment option chooser
│   ├── SOSButton          Emergency assistance button
│   ├── SlideToCancel      Slide gesture for cancellation
│   └── TaxesAndFeesRow    Tax/fee breakdown display
├── driver/          Driver-specific UI
│   ├── EarningsCard       Earnings summary card
│   ├── JobCard            Job/ride request card
│   ├── RouteMap           Route display map
│   ├── DocumentUpload     File upload component
│   ├── TrainingCertificate Training cert display
│   └── OnlineToggle       Online/offline status switch
└── shared/          Cross-role shared components
    ├── EmergencyButton    SOS emergency trigger
    ├── ErrorBoundary      Error catching wrapper
    ├── LoadingOverlay     Full-screen loading spinner
    ├── LocationPicker     Location selection component
    ├── MapView            Base map component
    ├── NetworkStatus      Connectivity indicator
    ├── PaymentSelector    Payment method picker
    └── PushNotificationHandler  Push notification setup
```

---

## Internationalization

The `i18nStore` manages localization with a `t(key)` translation function.

### Supported Languages

- English (default)
- Hindi

### Coverage

70+ translation keys covering:
- Greetings (Good morning, Good afternoon, Good evening)
- Ride statuses (Pending, Accepted, Active, Completed)
- Profile labels (Verified Driver, Pending Verification)
- Loading states and empty messages
- Tab labels and navigation items
- Earnings page periods and metrics
- Bonus and incentive labels
- Training certificate labels

### Usage

```typescript
import { useI18nStore } from '../store/i18nStore';

const { t } = useI18nStore();
// Returns translated string based on current language
```

---

## Environment Configuration

### Required Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Backend API base URL |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `EXPO_PUBLIC_RAZORPAY_KEY_ID` | Razorpay merchant key |

### Defaults

- API base URL falls back to `http://54.234.146.195/api/v1` when not set.
- Config is loaded via `config/env.ts` which reads from `expo-constants`.

---

## Known Caveats

1. **Mock data in bookingStore**: `loadAvailableChauffeurs` and `createBooking` still use mock data with simulated delays. The booking flow is not fully integrated with the backend.

2. **Frontend-backend field mismatches**: The frontend uses different field names than the backend API in some places. Known mismatches include:
   - `chauffeurId` (frontend) vs `driverId` (backend)
   - `price` (frontend) vs `estimatedFare` (backend)
   - These are documented in `BACKEND_INTEGRATION_README.md`

3. **New Architecture disabled**: `app.json` has `newArchEnabled: false`. React Native's New Architecture is intentionally turned off.

4. **Config endpoint not implemented**: The backend `/meta/configs/` endpoint returns 404. All `fetchConfigs()` calls are commented out with TODO markers until the backend is ready. This affects the feature flag system (insurance toggle, etc.).

5. **Docs/CLAUDE.md is not project documentation**: The file at `Docs/CLAUDE.md` contains VS Code extension prompt instructions and is unrelated to this project's architecture.
