# Chauffit Setup Guide

Complete guide for setting up the Chauffit React Native app for local development.

---

## Prerequisites

### Required for all platforms

- **Node.js** 18 or later
- **npm** or **yarn**
- **Expo CLI** (invoked via `npx expo`, no global install needed)
- **Git**

### iOS (macOS only)

- **Xcode** 15 or later
- **CocoaPods** (`gem install cocoapods`)
- **iOS Simulator** (installed via Xcode > Settings > Platforms)

### Android

- **Android Studio** with Android SDK
- **Android SDK 34+** (compileSdk 35 used by the project)
- **Java 17** (set `org.gradle.java.home` in `android/gradle.properties` if needed)
- **Android emulator** or a physical device with USB debugging

---

## Tech Stack

| Layer            | Technology                        |
| ---------------- | --------------------------------- |
| Framework        | React Native 0.81.5               |
| SDK              | Expo SDK 54                       |
| Navigation       | Expo Router v6 (file-based)       |
| Language         | TypeScript 5.9                    |
| State Management | Zustand v5                        |
| Styling          | NativeWind v4 (Tailwind for RN)   |
| Payments         | Razorpay (Indian payment gateway) |
| Real-Time        | Supabase Broadcast channels       |
| Maps             | react-native-maps + Google SDK    |

---

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url>
cd chauffit

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env

# 4. Fill in the required values in .env (see Environment Variables below)

# 5. Start the development server
npx expo start
```

After starting the dev server, press:

- `i` to open in iOS Simulator
- `a` to open in Android emulator
- Scan the QR code with Expo Go on a physical device

---

## Commands

| Command                             | Description                                |
| ----------------------------------- | ------------------------------------------ |
| `npx expo start`                    | Start Expo dev server                      |
| `npx expo start -c`                 | Start with cleared Metro bundler cache     |
| `npx expo run:ios`                  | Build and run on iOS simulator             |
| `npx expo run:android`              | Build and run on Android emulator/device   |
| `npx jest`                          | Run all tests (jest-expo preset)           |
| `npx jest --testPathPattern=<file>` | Run a single test file                     |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values. Only the variables prefixed with `EXPO_PUBLIC_` are bundled into the client app; the rest are for backend or build tooling.

### Required

| Variable                              | Description                                             |
| ------------------------------------- | ------------------------------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL`            | Backend API base URL. Default: `http://54.234.146.195/api/v1` |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`     | Google Maps SDK key (iOS + Android)                     |
| `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY`   | Google Places API key for address autocomplete          |
| `EXPO_PUBLIC_SUPABASE_URL`            | Supabase project URL                                    |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY`       | Supabase anonymous key                                  |
| `EXPO_PUBLIC_RAZORPAY_KEY_ID`         | Razorpay key ID for payments                            |

### Optional Feature Flags

These control which features appear in the app. Set to `true` or `false`.

| Variable                                | Default | Description                      |
| --------------------------------------- | ------- | -------------------------------- |
| `EXPO_PUBLIC_REAL_TIME_TRACKING`        | `true`  | Live ride tracking on map        |
| `EXPO_PUBLIC_BIOMETRIC_AUTH`            | `true`  | Fingerprint / Face ID login      |
| `EXPO_PUBLIC_VOICE_CALLING`             | `true`  | In-app voice calls               |
| `EXPO_PUBLIC_CHAT_MESSAGING`            | `true`  | Chat between rider and driver    |
| `EXPO_PUBLIC_EMERGENCY_ALERTS`          | `true`  | SOS / emergency alerts           |
| `EXPO_PUBLIC_SCHEDULED_BOOKINGS`        | `true`  | Book rides in advance            |
| `EXPO_PUBLIC_MULTIPLE_PAYMENTS`         | `true`  | Multiple payment methods         |
| `EXPO_PUBLIC_LOYALTY_PROGRAM`           | `false` | Loyalty / rewards program        |
| `EXPO_PUBLIC_AADHAAR_OTP_ENABLED`       | `false` | Aadhaar OTP-based verification   |
| `EXPO_PUBLIC_UPI_ENABLED`              | `true`  | UPI payment support              |
| `EXPO_PUBLIC_GST_ENABLED`              | `true`  | GST tax calculations             |
| `EXPO_PUBLIC_INDIAN_PHONE_VALIDATION`   | `true`  | Indian phone number format check |

### Optional Integrations

| Variable                             | Description                           |
| ------------------------------------ | ------------------------------------- |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe key (alternative to Razorpay)  |
| `EXPO_PUBLIC_ONESIGNAL_APP_ID`       | OneSignal push notification app ID    |
| `EXPO_PUBLIC_EAS_PROJECT_ID`         | Expo Application Services project ID  |

---

## Platform Setup

### Android

The project uses the following Android configuration (from `android/app/build.gradle` and `android/gradle.properties`):

- **minSdk**: 24
- **targetSdk**: 34
- **compileSdk**: 35
- **Package**: `com.chauffit.app`
- **Hermes**: enabled
- **Architectures**: `armeabi-v7a`, `arm64-v8a`

**Steps:**

1. Open Android Studio > SDK Manager and install SDK 34+.
2. Place your `google-services.json` file at the project root (`./google-services.json`). This is required for Firebase push notifications.
3. The Google Maps API key is referenced from the environment in `android/app/src/main/AndroidManifest.xml` via app config. Make sure `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` is set in your `.env`.
4. For release builds, configure signing properties in `android/gradle.properties`:
   - `MYAPP_RELEASE_STORE_FILE`
   - `MYAPP_RELEASE_KEY_ALIAS`
   - `MYAPP_RELEASE_STORE_PASSWORD`
   - `MYAPP_RELEASE_KEY_PASSWORD`
5. Run the app:
   ```bash
   npx expo run:android
   ```

### iOS

The project uses the following iOS configuration (from `app.json`):

- **Bundle identifier**: `com.chauffit.app`
- **Supports tablet**: yes
- **Permissions**: Location (when in use + always), Camera, Photo Library

**Steps:**

1. Open `ios/Chauffit.xcworkspace` (or let Expo generate it with `npx expo run:ios`).
2. If running the bare workflow or after adding native dependencies, install CocoaPods:
   ```bash
   cd ios && pod install && cd ..
   ```
3. Set your Google Maps API key in the iOS `AppDelegate` if required by your setup.
4. Run the app:
   ```bash
   npx expo run:ios
   ```

---

## app.json Configuration Reference

Key fields in `app.json`:

```json
{
  "expo": {
    "scheme": "chauffit",
    "name": "Chauffit",
    "slug": "chauffit-main",
    "version": "1.0.4",
    "orientation": "portrait",
    "newArchEnabled": false,
    "splash": {
      "backgroundColor": "#720C17"
    }
  }
}
```

- **newArchEnabled** is set to `false`. The React Native New Architecture causes issues with some dependencies; keep this disabled.
- **Plugins**: `expo-router`, `expo-notifications`, `expo-location`, `expo-image-picker`.

---

## Third-Party Service Setup

### Google Cloud Console

Required for Maps and Places functionality.

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or select an existing one).
3. Enable the following APIs:
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
   - **Places API**
4. Go to **Credentials > Create Credentials > API Key**.
5. Restrict the key to the APIs above and to your app's package name / bundle identifier.
6. Set the key as `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` and `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` in your `.env`.

### Supabase

Required for real-time features (driver location, booking status, chat, emergency alerts).

1. Go to [supabase.com](https://supabase.com/) and create a project.
2. Go to **Settings > API** and copy:
   - **Project URL** into `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** key into `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. Under **Database > Replication**, enable realtime for the tables used by the app (matching the broadcast channels in `services/SupabaseRealTimeService.ts`).

### Razorpay

Required for payment processing (Indian market).

1. Go to [razorpay.com](https://razorpay.com/) and create an account.
2. Navigate to **Settings > API Keys** and generate a test key pair.
3. Copy the **Key ID** into `EXPO_PUBLIC_RAZORPAY_KEY_ID`.
4. **Test card**: `4111 1111 1111 1111` (any future expiry, any CVV).
5. **Test UPI**: `success@razorpay`.

---

## Project Structure Overview

```
chauffit/
  app/                        # Expo Router file-based routes
    (customer)/               # Customer-facing screens
    (driver)/                 # Driver-facing screens
    (biker)/                  # Biker-facing screens
    _layout.tsx               # Root Stack layout
    index.tsx                 # Entry point (auth redirect)
  components/
    common/                   # ThemedText, ThemedView, PrimaryButton, etc.
    driver/                   # Driver-specific components
  constants/
    Colors.tsx                # Brand color definitions
  services/
    api/
      BaseApiService.ts       # HTTP client (auth, refresh, retry)
      AuthApiService.ts       # Login, register, token refresh
      BookingApiService.ts    # Booking CRUD
      DriverRidesApiService.ts
      BikerTaskApiService.ts
      PaymentApiService.ts
    SupabaseRealTimeService.ts
    RazorpayService.ts
  store/                      # Zustand stores
    authStore.ts              # Auth, profile, roles, theme
    bookingStore.ts           # Booking flow (partially mock)
    jobStore.ts               # Driver jobs (API-integrated)
    taskStore.ts              # Biker tasks
    carStore.ts
    earningsStore.ts
  tailwind.config.js          # NativeWind / Tailwind config
  app.json                    # Expo app manifest
  android/                    # Native Android project
  ios/                        # Native iOS project (if generated)
```

---

## Troubleshooting

### Metro bundler cache issues

If you see stale code or unexpected errors:

```bash
npx expo start -c
```

This clears the Metro bundler cache and forces a fresh bundle.

### "Maximum update depth exceeded" on startup

This is caused by `fetchConfigs()` calling the unimplemented `/meta/configs/` backend endpoint in a loop. As of the current version, these calls are commented out with `TODO` markers. If you reintroduce them, ensure the backend endpoint exists before enabling the calls.

### Android Google Maps shows blank screen

1. Verify `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` is set in `.env`.
2. Ensure the API key has **Maps SDK for Android** enabled in Google Cloud Console.
3. Ensure the key is restricted to your app's package name (`com.chauffit.app`).

### iOS CocoaPods errors

```bash
cd ios
pod install --repo-update
cd ..
npx expo run:ios
```

### Android build failures

- Ensure you are using **Java 17**. Check the `org.gradle.java.home` path in `android/gradle.properties`.
- Clean the build:
  ```bash
  cd android && ./gradlew clean && cd ..
  npx expo run:android
  ```
- If you see signing errors for debug builds, verify that `android/app/debug.keystore` exists.

### "/meta/configs/ endpoint returns 404"

This is a known issue. The backend has not implemented this endpoint yet. The frontend code that calls it is commented out. No action needed unless you are working on the admin config or insurance feature flag.

### Booking flow uses mock data

`bookingStore.ts` functions `loadAvailableChauffeurs` and `createBooking` still use simulated data with artificial delays. This is expected and documented. Other stores (e.g., `jobStore.ts`) are fully API-integrated.

### "React Native New Architecture" issues

The project has `newArchEnabled: false` in `app.json`. Do not enable it unless you have verified all native dependencies are compatible. Some libraries (including `react-native-razorpay`) may not work correctly with the New Architecture.

### Native module linking issues after adding a package

```bash
# For managed Expo workflow
npx expo prebuild --clean

# For bare workflow
cd ios && pod install && cd ..
npx expo run:ios   # or run:android
```

### Environment variables not picked up

Environment variables are read at build/start time. After changing `.env`:

1. Stop the dev server.
2. Clear cache: `npx expo start -c`.
3. Restart.

Variables prefixed with `EXPO_PUBLIC_` are embedded into the JS bundle at build time. Non-prefixed variables are only available in server-side or build scripts.

---

## Development Notes

- **State management**: All app state uses Zustand stores in `store/`. Do not use React Context or Redux for app-level state.
- **API calls**: All go through `services/api/BaseApiService.ts`. It handles Bearer token auth, automatic token refresh on 401, and request logging. Extend it for new services rather than making raw `fetch` calls.
- **Styling**: Use NativeWind v4 (Tailwind classes). Brand colors are defined in `constants/Colors.tsx` and `tailwind.config.js`:
  - `primary`: `#D9D1C6` (pastel gray)
  - `secondary`: `#BD8C5E` (warm accent)
  - `burgundy`: `#720C17` (icons, app bar, splash)
- **Dark mode**: Toggle via `useAuthStore().toggleTheme()`. Themed components (`ThemedText`, `ThemedView`, `ThemedCard`) automatically adapt.
- **Navigation**: File-based via Expo Router. Each user role has a nested `(tabs)/` group under `app/(customer)/`, `app/(driver)/`, or `app/(biker)/`.
- **Auth flow**: `app/index.tsx` calls `initializeAuth()` on mount, then redirects based on `activeRole` from `useAuthStore`. JWT tokens (access + refresh) are persisted in AsyncStorage and rehydrated automatically.
