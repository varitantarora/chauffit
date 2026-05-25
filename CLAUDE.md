# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npx expo start            # Start Expo dev server
npx expo run:ios          # Build and run on iOS simulator
npx expo run:android      # Build and run on Android emulator/device
npx jest                  # Run tests (jest-expo preset; no npm test script yet)
npx jest --testPathPattern=<pattern>  # Run a single test file
```

## Architecture

### User Roles
Three role-based app sections under `app/`:
- `(customer)/` — book rides, manage vehicles, payments, history
- `(driver)/` — accept/manage rides, navigation, earnings
- `(biker)/` — emergency tasks, deliveries

Role routing: `app/index.tsx` calls `initializeAuth()` then redirects based on `activeRole` from `useAuthStore`.

### Navigation
**expo-router** (file-based, v6). Root layout is `app/_layout.tsx` (Stack). Each role has a nested `(tabs)/` group. All layouts use `headerShown: false`.

### State Management
**Zustand v5** (no Redux, no Context for app state). Stores in `store/`:
- `authStore.ts` — auth, user profile, roles, theme, online status
- `bookingStore.ts` — booking flow, chauffeur search, ride tracking *(still has mock chauffeur data — not fully integrated)*
- `jobStore.ts` — driver job state (fully API-integrated)
- `taskStore.ts` — biker tasks
- `carStore.ts`, `earningsStore.ts`, `bikerEarningsStore.ts`

JWT tokens (access + refresh) are persisted in AsyncStorage and rehydrated on `initializeAuth()`.

### API Layer
All API calls go through `services/api/BaseApiService.ts` (singleton). It handles:
- Bearer token auth from AsyncStorage
- Automatic 401 → refresh → retry
- Logging with timing (sanitizes passwords/tokens)

Specialized services extend it: `AuthApiService`, `BookingApiService`, `DriverRidesApiService`, `BikerTaskApiService`, `PaymentApiService`, etc.

API base URL: `EXPO_PUBLIC_API_BASE_URL` env var (falls back to `http://54.234.146.195/api/v1`).

### Real-Time
`services/SupabaseRealTimeService.ts` — driver/biker location, booking status, emergency alerts, chat via Supabase broadcast channels.

### Styling
**NativeWind v4** (Tailwind for React Native). Custom brand colors in `tailwind.config.js` and `constants/Colors.tsx`:
- `primary`: `#D9D1C6` (pastel gray)
- `secondary`: `#BD8C5E` (warm accent)
- `burgundy`: `#720C17` (icons, app bar)

Themed primitives: `ThemedText`, `ThemedView`, `ThemedCard`, `PrimaryButton` in `components/common/`. Dark mode is toggled via `useAuthStore().toggleTheme()`.

### Payments
`services/RazorpayService.ts` — full Razorpay flow: create order → open native SDK checkout → verify signature. Uses `PaymentApiService` for backend calls.

## Environment Setup
Copy `.env.example` to `.env` and fill in:
- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_RAZORPAY_KEY_ID`

## Known Caveats
- `bookingStore.ts` `loadAvailableChauffeurs` / `createBooking` still use mock data with simulated delays.
- Frontend ↔ backend field name mismatches (e.g. `chauffeurId` vs `driverId`, `price` vs `estimatedFare`) are documented in `BACKEND_INTEGRATION_README.md`.
- `app.json` has `newArchEnabled: false` (React Native New Architecture disabled).
- `Docs/CLAUDE.md` is a VS Code extension prompt — unrelated to this project.
