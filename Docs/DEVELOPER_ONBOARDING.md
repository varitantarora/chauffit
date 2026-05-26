# Chauffit Developer Onboarding Guide

Welcome to Chauffit. This guide covers everything you need to start contributing effectively. It assumes you know React Native and TypeScript but nothing about this specific project.

---

## Table of Contents

1. [What is Chauffit?](#what-is-chauffit)
2. [Tech Stack](#tech-stack)
3. [Get Your Environment Running](#get-your-environment-running)
4. [Repo Structure](#repo-structure)
5. [Routing: How Screens Connect](#routing-how-screens-connect)
6. [State Management: Zustand Stores](#state-management-zustand-stores)
7. [API Layer: How We Talk to the Backend](#api-layer-how-we-talk-to-the-backend)
8. [Styling: NativeWind and Theming](#styling-nativewind-and-theming)
9. [i18n: Multi-Language Support](#i18n-multi-language-support)
10. [Common Tasks](#common-tasks)
11. [Known Gotchas and Landmines](#known-gotchas-and-landmines)
12. [Debugging Tips](#debugging-tips)

---

## What is Chauffit?

Chauffit is a multi-service transportation platform -- think of it as a chauffeur-on-demand app built for the Indian market. Three user roles use the same app, each with their own set of screens:

| Role | What They Do | Screen Group |
|------|-------------|--------------|
| **Customer** | Book rides, manage vehicles and payments, view ride history | `app/(customer)/` |
| **Driver** | Accept/manage rides, navigate routes, track earnings, complete onboarding | `app/(driver)/` |
| **Biker** | Handle deliveries and emergency tasks | `app/(biker)/` |

There is also an **admin** role (`app/(admin)/`) for platform management. The same person can have multiple roles -- a driver can also be a customer -- and they switch between them after login.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React Native (via Expo) | RN 0.81.5, Expo SDK 54 |
| Language | TypeScript | 5.9 |
| Routing | Expo Router (file-based) | v6 |
| State | Zustand | v5 |
| Styling | NativeWind (Tailwind for RN) | v4 |
| Real-Time | Supabase broadcast channels | -- |
| Payments | Razorpay (Indian gateway) | -- |
| Maps | react-native-maps + Google Maps/Directions | -- |

Key point: this is an Expo-managed project. You use `npx expo` commands, not raw `react-native` CLI commands. Do not eject.

---

## Get Your Environment Running

### Prerequisites

- Node.js (LTS)
- Xcode (for iOS simulator) or Android Studio (for Android emulator)
- A physical device is helpful for testing maps and location features

### Setup

```bash
# Clone and enter the repo
git clone <repo-url> chauffit
cd chauffit

# Install dependencies
npm install

# Copy environment config
cp .env.example .env
```

Now open `.env` and fill in the values you actually need. For basic development you can get by with just these:

```bash
EXPO_PUBLIC_API_BASE_URL=http://54.234.146.195/api/v1   # staging backend
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=<ask the team for this>
EXPO_PUBLIC_SUPABASE_URL=<ask the team for this>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<ask the team for this>
EXPO_PUBLIC_RAZORPAY_KEY_ID=<ask the team for this>
```

The `.env.example` file has many keys for production services (Sentry, Twilio, S3, etc.) that you do not need for day-to-day development. Leave them as-is.

### Run the App

```bash
npx expo start          # Start the dev server, then press i (iOS) or a (Android)
npx expo run:ios        # Build and run on iOS simulator directly
npx expo run:android    # Build and run on Android emulator directly
```

### Tests

```bash
npx jest                                # Run all tests
npx jest --testPathPattern=authStore    # Run a specific test file
```

---

## Repo Structure

```
chauffit/
├── app/                        # All screens -- expo-router generates routes from files here
│   ├── _layout.tsx             # Root Stack layout (headerShown: false everywhere)
│   ├── index.tsx               # Entry point: auth check then role-based redirect
│   ├── onboarding.tsx          # First-time app onboarding carousel
│   │
│   ├── (auth)/                 # Login, signup, OTP, email/phone login
│   ├── (customer)/             # Customer role screens
│   │   ├── (tabs)/             # Tab navigator: Home, Rides, Activity, Profile
│   │   ├── book-ride-new.tsx   # Main booking flow
│   │   ├── booking/            # Booking detail screens
│   │   ├── ride/               # Ride tracking, search, completion
│   │   └── ...                 # Wallet, payments, cars, support, etc.
│   ├── (driver)/               # Driver role screens
│   │   ├── (tabs)/             # Tab navigator: Home, Requests, Earnings, Profile
│   │   ├── onboarding/         # Multi-step driver onboarding (see below)
│   │   └── ...                 # Job flows, training certificate
│   ├── (biker)/                # Biker role screens
│   │   ├── (tabs)/             # Tab navigator
│   │   └── ...
│   └── (admin)/                # Admin dashboard and management
│
├── components/                 # Reusable UI components
│   ├── common/                 # Primitives you will use everywhere:
│   │   ├── ThemedView.tsx      # Auto dark-mode View wrapper
│   │   ├── ThemedText.tsx      # Auto dark-mode Text wrapper
│   │   ├── ThemedCard.tsx      # Auto dark-mode Card wrapper
│   │   └── PrimaryButton.tsx   # Standard action button (primary/secondary/outline variants)
│   ├── shared/                 # Cross-role components: MapView, ErrorBoundary, LoadingOverlay
│   ├── auth/                   # Login/signup forms
│   ├── customer/               # Booking, cancel, payment, map components
│   ├── driver/                 # Job card, route map, earnings chart, status toggle
│   ├── biker/                  # Task card, map, incentive cards
│   └── admin/                  # Stat cards, badges, filters
│
├── services/                   # API + external service integrations
│   ├── api/                    # All backend communication
│   │   ├── BaseApiService.ts   # Singleton HTTP client -- everything goes through this
│   │   ├── AuthApiService.ts   # Login, register, OTP, token refresh
│   │   ├── BookingApiService.ts
│   │   ├── DriverApiService.ts
│   │   ├── DriverRidesApiService.ts
│   │   ├── BikerApiService.ts
│   │   ├── BikerTaskApiService.ts
│   │   ├── PaymentApiService.ts
│   │   ├── ConfigApiService.ts
│   │   └── ... (12+ more specialized services)
│   ├── NotificationService.ts
│   ├── RazorpayService.ts      # Indian payment gateway integration
│   └── SupabaseRealTimeService.ts  # Driver/biker location, booking status, chat
│
├── store/                      # Zustand state stores
│   ├── authStore.ts            # Auth state, user profile, roles, theme, online status (~15KB)
│   ├── bookingStore.ts         # Booking flow, chauffeur search, ride tracking (~13KB)
│   ├── jobStore.ts             # Driver job state -- fully API-integrated (~41KB)
│   ├── taskStore.ts            # Biker task state (~10KB)
│   ├── i18nStore.ts            # English + Hindi translations (~20KB)
│   ├── carStore.ts             # Customer car management
│   ├── earningsStore.ts        # Driver earnings
│   ├── bikerEarningsStore.ts   # Biker earnings
│   ├── configStore.ts          # Feature flags / app config
│   ├── loyaltyStore.ts         # Loyalty points
│   ├── adminStore.ts           # Admin dashboard state
│   └── loginStore.ts           # Login flow state
│
├── constants/
│   ├── Colors.tsx              # BrandColors, LightColors, DarkColors
│   └── ...                     # Map styles, verification config
├── types/                      # TypeScript types (navigation.ts)
├── config/                     # Environment config loader
├── tailwind.config.js          # Custom colors, fonts, animations
└── Docs/                       # You are here
```

---

## Routing: How Screens Connect

We use **Expo Router v6** with file-based routing. The file path in `app/` determines the URL/route. Directories wrapped in parentheses like `(auth)` are **route groups** -- they organize screens without adding a path segment.

### Entry Flow

When the app opens, `app/index.tsx` runs:

```
App Opens
  |
  v
initializeAuth() -- loads JWT tokens from AsyncStorage, validates session
  |
  v
Not authenticated? --> (auth)/login
  |
  v (authenticated)
Check activeRole:
  - admin / super_admin --> (admin)/(tabs)
  - driver --> driver onboarding flow (see below)
  - biker --> (biker)/(tabs)
  - customer --> (customer)/(tabs)
```

### Driver Onboarding Flow

Drivers go through a multi-step onboarding before reaching their main tabs. The `driverOnboardingStatus` field determines which screen they see:

```
null / undefined     --> registration (personal info, license, aadhaar)
registered           --> documents (upload license photo, etc.)
verification_*       --> background-check (status page)
training_scheduled   --> training-scheduled
training_failed      --> training-failed
certified            --> onboarding-complete
active               --> (driver)/(tabs) -- the driver is ready!
suspended / rejected --> background-check (appeal/status page)
```

This logic lives in the `getDriverRoute()` function at the bottom of `app/index.tsx`.

### Tab Navigation

Each role has a `(tabs)/` directory containing the screens shown in the bottom tab bar. The tab layout is defined in `(role)/(tabs)/_layout.tsx` using Expo Router's `Tabs` navigator.

### Adding a New Screen

1. Create a `.tsx` file in the appropriate `app/(role)/` directory.
2. Export a default component. Expo Router auto-generates the route.
3. Use themed components for the UI.
4. Connect to Zustand stores for any state needs.

Example -- a minimal new screen:

```tsx
// app/(customer)/my-new-screen.tsx
import React from 'react';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

export default function MyNewScreen() {
  const user = useAuthStore(state => state.user);
  const router = useRouter();

  return (
    <ThemedView className="flex-1 p-4">
      <ThemedText className="text-lg font-semibold text-burgundy">
        Hello, {user?.name}
      </ThemedText>
      <PrimaryButton
        title="Go Back"
        onPress={() => router.back()}
      />
    </ThemedView>
  );
}
```

Navigating to it: `router.push('/my-new-screen')` (from within the customer group) or `router.push('/(customer)/my-new-screen')` (from outside).

---

## State Management: Zustand Stores

All application state lives in Zustand stores. There is no Redux, no Context API for app state. Zustand stores are simple -- they are just functions that return state and actions.

### How to Read from a Store

```typescript
import { useAuthStore } from '../store/authStore';

// In a component -- use selectors for performance
const user = useAuthStore(state => state.user);
const isAuthenticated = useAuthStore(state => state.isAuthenticated);
const isDarkMode = useAuthStore(state => state.isDarkMode);

// Or destructure multiple values
const { user, logout, toggleTheme } = useAuthStore();
```

### How to Call Store Actions

```typescript
// Login
const loginWithEmail = useAuthStore(state => state.loginWithEmail);
const result = await loginWithEmail('user@example.com', 'password123');
if (!result.success) {
  Alert.alert('Login failed', result.error);
}

// Switch role
const switchRole = useAuthStore(state => state.switchRole);
switchRole('driver');

// Toggle dark mode
const toggleTheme = useAuthStore(state => state.toggleTheme);
toggleTheme();
```

### The Key Stores and When to Use Them

| Store | Purpose | When You Need It |
|-------|---------|-----------------|
| `authStore` | User identity, login/logout, roles, theme, online status | Almost every screen |
| `bookingStore` | Booking flow state, chauffeur search, ride tracking | Customer booking screens |
| `jobStore` | Driver job list, active job, job actions (accept, arrive, complete) | Driver job screens |
| `taskStore` | Biker task list, active task, task actions | Biker task screens |
| `carStore` | Customer's saved vehicles | Customer car management |
| `earningsStore` | Driver earnings history and summaries | Driver earnings tab |
| `i18nStore` | Translation function `t()`, current language | Any screen with user-visible text |
| `configStore` | Feature flags from backend | Feature-gated UI |

### JWT Token Flow

Tokens are stored in AsyncStorage and managed by `BaseApiService`:
- On login, `AuthApiService` receives access + refresh tokens from the backend.
- `BaseApiService.setTokens()` saves them to AsyncStorage and memory.
- On app start, `initializeAuth()` in authStore loads tokens and validates the session.
- When any API call gets a 401, `BaseApiService` automatically refreshes the token and retries the request.

You should never need to handle tokens manually. Just make sure you call `initializeAuth()` on app start (it is already called in `app/index.tsx`).

---

## API Layer: How We Talk to the Backend

### BaseApiService (The Singleton)

All API calls go through `BaseApiService`. It is a singleton imported as:

```typescript
import api from '../services/api/BaseApiService';
// or
import BaseApiService from '../services/api/BaseApiService';
```

What it handles for you:
- Appending `Bearer <token>` to every request header
- Automatic token refresh on 401 responses (with retry)
- Request/response logging with timing (passwords and tokens are sanitized in logs)
- Base URL from `EXPO_PUBLIC_API_BASE_URL` env var (falls back to `http://54.234.146.195/api/v1`)

### Using the Base Client Directly

```typescript
import api from '../services/api/BaseApiService';

// GET request
const response = await api.get<Booking[]>('/bookings/');

// POST request
const response = await api.post<Booking>('/bookings/', {
  pickup_location: { lat: 28.6, lng: 77.2 },
  dropoff_location: { lat: 28.5, lng: 77.1 },
});

// PATCH request
const response = await api.patch<Booking>('/bookings/123/', { status: 'cancelled' });

// DELETE request
const response = await api.delete('/bookings/123/');
```

All methods return `ApiResponse<T>`:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  message?: string;
  errors?: Record<string, string[]>;  // validation errors from Django
}
```

### Using Specialized Services

For most work, use the pre-built service classes instead of raw `api` calls. They exist in `services/api/`:

```typescript
import AuthApiService from '../services/api/AuthApiService';
import BookingApiService from '../services/api/BookingApiService';
import DriverRidesApiService from '../services/api/DriverRidesApiService';
import BikerTaskApiService from '../services/api/BikerTaskApiService';
import PaymentApiService from '../services/api/PaymentApiService';
import DriverApiService from '../services/api/DriverApiService';
```

Example -- fetching driver rides:

```typescript
const rides = await DriverRidesApiService.getAvailableRides();
const activeRide = await DriverRidesApiService.getActiveRide();
await DriverRidesApiService.acceptRide('ride-uuid-here');
```

### Creating a New API Service

1. Create `services/api/YourNewService.ts`:

```typescript
import api from './BaseApiService';
import { ApiResponse } from './BaseApiService';

export const YourNewService = {
  async getItems(): Promise<ApiResponse<Item[]>> {
    return api.get<Item[]>('/your-endpoint/');
  },

  async createItem(data: CreateItemPayload): Promise<ApiResponse<Item>> {
    return api.post<Item>('/your-endpoint/', data);
  },
};
```

2. If the new domain needs local state, create or extend a Zustand store.
3. Never use raw `fetch()` -- always go through `BaseApiService`.

---

## Styling: NativeWind and Theming

We use **NativeWind v4**, which lets you write Tailwind CSS classes directly on React Native components. It is not a web view -- NativeWind converts Tailwind classes to native style objects at build time.

### Using Tailwind Classes

```tsx
<View className="flex-1 bg-background p-4">
  <ThemedText className="text-lg font-semibold text-burgundy">
    Section Title
  </ThemedText>
  <View className="mt-2 p-3 rounded-xl bg-surface border border-border">
    <ThemedText className="text-sm text-textSecondary">
      Card content
    </ThemedText>
  </View>
</View>
```

### Brand Colors

These are defined in both `tailwind.config.js` and `constants/Colors.tsx`:

| Color Name | Hex | Tailwind Class | Used For |
|------------|-----|---------------|----------|
| Primary | `#D9D1C6` | `bg-primary`, `text-primary` | Backgrounds, premium feel |
| Secondary | `#BD8C5E` | `bg-secondary`, `text-secondary` | Warm accent, CTAs |
| Burgundy | `#720C17` | `bg-burgundy`, `text-burgundy` | Icons, app bar, emphasis |
| Background | `#FDF8F3` | `bg-background` | Light mode screen background |
| Surface | `#F7F2EB` | `bg-surface` | Cards, elevated areas |
| Dark Background | `#1A1A1A` | `dark:bg-darkBackground` | Dark mode background |
| Dark Surface | `#2C2C2C` | `dark:bg-darkSurface` | Dark mode cards |

### Themed Components (Always Use These)

Never use raw `<View>` or `<Text>` for screen-level containers. Use the themed wrappers -- they handle dark mode automatically:

```tsx
import { ThemedView } from '../components/common/ThemedView';
import { ThemedText } from '../components/common/ThemedText';
import { ThemedCard } from '../components/common/ThemedCard';
import { PrimaryButton } from '../components/common/PrimaryButton';

// ThemedView: automatically switches bg-background <-> bg-darkBackground
<ThemedView className="flex-1 p-4">
  {/* ThemedText: automatically switches text colors for dark mode */}
  <ThemedText className="text-xl font-bold text-burgundy">
    Welcome back
  </ThemedText>

  {/* ThemedCard: elevated card with dark mode support */}
  <ThemedCard className="p-4 mt-4">
    <ThemedText>Card content</ThemedText>
  </ThemedCard>

  {/* PrimaryButton: styled button with variants */}
  <PrimaryButton
    title="Continue"
    onPress={handleContinue}
    variant="primary"    // 'primary' | 'secondary' | 'outline'
    size="medium"        // 'small' | 'medium' | 'large'
    loading={isLoading}
    disabled={!isValid}
  />
</ThemedView>
```

### Dark Mode

Dark mode is toggled via `useAuthStore().toggleTheme()`. The current state is `useAuthStore(state => state.isDarkMode)`. Themed components read this automatically. If you use Tailwind dark mode classes, they respond to this toggle.

---

## i18n: Multi-Language Support

We support **English** and **Hindi**. All user-visible strings should go through the translation function.

### Usage

```typescript
import { useI18nStore } from '../store/i18nStore';

function MyScreen() {
  const t = useI18nStore(state => state.t);
  const language = useI18nStore(state => state.language);
  const setLanguage = useI18nStore(state => state.setLanguage);

  return (
    <ThemedView className="flex-1 p-4">
      <ThemedText>{t('good_morning')}</ThemedText>
      {/* Language switcher */}
      <PrimaryButton
        title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
        onPress={() => setLanguage(language === 'en' ? 'hi' : 'en')}
      />
    </ThemedView>
  );
}
```

### Adding a New Translation Key

Open `store/i18nStore.ts` and add your key to both the English and Hindi translation objects:

```typescript
// In the translations object:
en: {
  // ... existing keys ...
  'my_new_key': 'English text here',
},
hi: {
  // ... existing keys ...
  'my_new_key': 'Hindi text here',
},
```

Then use `t('my_new_key')` in your component. The file is large (~20KB) and organized by feature area.

---

## Common Tasks

### Add a New Customer Screen

1. Create `app/(customer)/your-screen.tsx`
2. Import themed components
3. Use `useBookingStore` or `useAuthStore` for state
4. Call `BookingApiService` for API data
5. Navigate with `router.push('/your-screen')`

### Add a New Driver API Endpoint

1. Add the method to `services/api/DriverApiService.ts` or `services/api/DriverRidesApiService.ts`
2. Use `api.get()` / `api.post()` / etc.
3. If the response needs local state, add it to `store/jobStore.ts`
4. Call from the screen component

### Add a New Feature Flag

1. The backend endpoint `/meta/configs/` is not yet implemented (as of May 2026), but the frontend is ready.
2. Add the config key to `store/configStore.ts` in the `AppConfig` interface.
3. Gate UI with: `const config = useConfigStore(state => state.configs);` then check the flag.
4. All `fetchConfigs()` calls are currently commented out until the backend endpoint is ready.

### Work on the Booking Flow

The booking flow spans multiple screens:
- `book-ride-new.tsx` -- main booking form with map, vehicle selection, pricing
- `searching-drivers.tsx` -- shows drivers being searched (animation)
- `ride-confirmation.tsx` -- confirms ride details and driver
- `ride-tracking.tsx` -- live tracking of the ride
- `trip-completion.tsx` -- rating, feedback, payment

State is in `bookingStore.ts`. Note: `loadAvailableChauffeurs` and `createBooking` currently use mock data with simulated delays. The real API integration for these functions is pending.

### Work on Driver Onboarding

The onboarding screens are in `app/(driver)/onboarding/`:

```
registration.tsx      -- Personal info, DOB (date picker), license number,
                         license expiry (date picker), aadhaar, experience,
                         transmission type, uniform size, city
                         Calls DriverApiService.createProfile() on submit.

documents.tsx         -- Upload license photo, aadhaar photo, etc.

background-check.tsx  -- Verification status page.

training-scheduled.tsx  -- Training appointment details.
training-failed.tsx     -- Retry options.
onboarding-complete.tsx -- Success, proceed to main driver tabs.
```

---

## Known Gotchas and Landmines

Save yourself hours by knowing these upfront:

### 1. Booking Store Uses Mock Data

`bookingStore.ts` methods `loadAvailableChauffeurs()` and `createBooking()` return fake data with `setTimeout` delays. If you are working on the booking flow, be aware that the chauffeur list and booking creation are not hitting the real backend yet.

### 2. Field Name Mismatches Between Frontend and Backend

The frontend and backend use different names for the same things. The ones we know about:
- `chauffeurId` (frontend) vs `driverId` (backend)
- `price` (frontend) vs `estimatedFare` (backend)

If an API call returns unexpected data, check for naming mismatches first. These are documented in `Docs/BACKEND_INTEGRATION_README.md` if it exists in your branch.

### 3. Do Not Enable React Native New Architecture

`app.json` has `newArchEnabled: false`. Do not change this. The project has not been tested with the new architecture and enabling it will cause build failures.

### 4. Docs/CLAUDE.md Is Not Project Documentation

`Docs/CLAUDE.md` is a prompt file for a VS Code extension (Claude AI extension). It is not project documentation and may contain outdated or incorrect information. Rely on this file you are reading instead.

### 5. fetchConfigs() Calls Are Commented Out

Several screens have `fetchConfigs()` calls commented out with TODO notes. The backend `/meta/configs/` endpoint returns 404, so calling it causes infinite re-render loops. Do not uncomment these until the backend endpoint is implemented. Affected files:
- `app/(customer)/book-ride-new.tsx`
- `app/(admin)/insurance-management.tsx`
- `app/(biker)/(tabs)/index.tsx`
- `app/(driver)/(tabs)/index.tsx`
- `app/(admin)/config-management.tsx`

### 6. Console.log Statements Are Everywhere

The codebase has many `console.log` statements left from debugging. This is normal for the current stage of development. Clean up your own before committing, but do not be surprised by existing ones.

### 7. No Redux, No Context

If you catch yourself reaching for `createContext` or installing a Redux package, stop. All app state goes in Zustand stores. The only exception is React Navigation's built-in context, which you should not need to touch.

---

## Debugging Tips

### API Request Logging

`BaseApiService` logs every request with a unique ID, method, URL, and timing. Look for these in the console:

```
[API] POST /auth/login/ [req_abc123] --> 200 (342ms)
```

Passwords and tokens are automatically stripped from log output.

### React DevTools

Use React DevTools to inspect the component tree and props. Works with Expo.

### Zustand State Inspection

You can inspect Zustand state directly in a component for debugging:

```typescript
// Quick debug -- log the entire store state
const storeState = useAuthStore.getState();
console.log('Full auth state:', JSON.stringify(storeState, null, 2));

// Or subscribe to changes
useAuthStore.subscribe((state) => {
  console.log('Auth state changed:', state.isAuthenticated);
});
```

### Common Error: "Maximum update depth exceeded"

This usually means a `useEffect` is triggering a state update that causes a re-render, which triggers the effect again. Check for:
- Missing or incorrect dependency arrays in `useEffect`
- Store actions being called inside render functions (call them in effects or handlers instead)
- `fetchConfigs()` calls (see gotcha #5 above)

### Common Error: Route not found after creating a new file

Expo Router sometimes needs a cache clear to pick up new files:

```bash
npx expo start --clear
```

### Maps Not Loading

Google Maps requires a valid API key with Maps SDK enabled. Check:
1. `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` is set in `.env`
2. The key has "Maps SDK for iOS" and "Maps SDK for Android" APIs enabled in Google Cloud Console
3. The app's bundle identifier is registered with the API key

---

## Quick Reference: File Locations for Common Scenarios

| "I need to..." | File to open |
|---|---|
| Change the entry flow / redirect logic | `app/index.tsx` |
| Add a customer screen | Create in `app/(customer)/` |
| Add a driver screen | Create in `app/(driver)/` |
| Add a biker screen | Create in `app/(biker)/` |
| Modify auth / login flow | `store/authStore.ts`, `app/(auth)/` |
| Add an API endpoint wrapper | Create in `services/api/` |
| Add a Zustand store | Create in `store/` |
| Change brand colors | `constants/Colors.tsx` AND `tailwind.config.js` |
| Add Tailwind custom classes | `tailwind.config.js` |
| Add a translation | `store/i18nStore.ts` |
| Fix driver onboarding | `app/(driver)/onboarding/registration.tsx` and siblings |
| Work on booking | `app/(customer)/book-ride-new.tsx`, `store/bookingStore.ts` |
| Work on payments | `services/RazorpayService.ts`, `services/api/PaymentApiService.ts` |
| Work on real-time features | `services/SupabaseRealTimeService.ts` |
| Configure the root layout | `app/_layout.tsx` |
| Change tab bar icons/order | `(role)/(tabs)/_layout.tsx` |

---

Welcome aboard. If something is not clear, the codebase is the source of truth -- read the relevant store or service file, and the patterns will become familiar quickly.
