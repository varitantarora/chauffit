# Chauffit - State Management Reference

All state managed via **Zustand v5** stores in `store/`. No Redux, no Context for app state.

---

## Overview

| Store | Purpose | API-Integrated | Persisted |
|---|---|---|---|
| `authStore` | Auth, user, roles, theme | Yes | Yes (AsyncStorage) |
| `bookingStore` | Booking flow, chauffeur search | Partial (mock data) | No |
| `configStore` | App configs, feature flags | Yes | No |
| `earningsStore` | Driver earnings & analytics | Yes | No |
| `jobStore` | Driver job/ride management | Yes | No |
| `loginStore` | Login form state | No | No |
| `loyaltyStore` | Loyalty points & referrals | Yes | No |
| `taskStore` | Biker tasks & emergencies | No | No |
| `bikerEarningsStore` | Biker earnings & shifts | No | No |
| `carStore` | Customer vehicle profiles | Yes | No |
| `i18nStore` | Language (en/hi) | No | Yes (AsyncStorage) |
| `adminStore` | Admin panel state | Yes | No |

---

## authStore (`store/authStore.ts`)

Central auth and user state. Initialized on app startup via `initializeAuth()`.

### State

| Field | Type | Description |
|---|---|---|
| `user` | `User \| null` | Current user profile |
| `roles` | `UserRole[]` | All roles assigned to user |
| `activeRole` | `UserRole` | Currently active role |
| `isAuthenticated` | `boolean` | Login state |
| `isDarkMode` | `boolean` | Dark mode preference |
| `hasSeenOnboarding` | `boolean` | Onboarding seen flag |
| `hasSelectedTheme` | `boolean` | Theme selected flag |
| `themeMode` | `'system' \| 'light' \| 'dark'` | Theme preference |
| `isInitializing` | `boolean` | App startup loading |
| `bikerIsOnline` | `boolean` | Biker online status |
| `driverIsOnline` | `boolean` | Driver online status |
| `driverOnboardingStatus` | `string \| null` | Driver onboarding step |
| `trainingSession` | `TrainingSession \| null` | Active training session |
| `userType` | `UserRole \| null` | Primary user type |
| `userCreatedAt` | `string \| null` | Account creation date |
| `userIsVerified` | `boolean` | Verification status |

### Key Actions

| Action | Description |
|---|---|
| `initializeAuth()` | Rehydrate tokens, fetch profile, set role routing |
| `loginWithEmail(email, password)` | Email/password login via API |
| `register(data)` | New user registration |
| `fetchProfile()` | Refresh user profile from API |
| `fetchDriverOnboardingStatus()` | Check driver onboarding progress |
| `logout()` | Clear tokens, reset state |
| `switchRole(role)` | Switch active user role |
| `toggleTheme()` | Toggle dark/light mode |

### Persisted Keys

- `access_token` / `refresh_token` — JWT tokens
- `is_dark_mode` — Theme preference
- `theme_mode` — System/light/dark
- `has_selected_theme` — First-run flag

### Services Used

- `AuthApiService` — login, register, profile
- `DriverApiService` — onboarding status
- `BaseApiService` — token management

---

## bookingStore (`store/bookingStore.ts`)

Manages customer booking flow. **Note: `loadAvailableChauffeurs` and `createBooking` still use mock data.**

### State

| Field | Type | Description |
|---|---|---|
| `currentBooking` | `Partial<BookingDetails> \| null` | Active booking in progress |
| `selectedDuration` | `string` | Selected ride duration |
| `selectedServiceTier` | `'STANDARD' \| 'EXECUTIVE'` | Service tier |
| `selectedChauffeur` | `Chauffeur \| null` | Selected driver |
| `selectedPaymentMethod` | `PaymentMethod \| null` | Payment method |
| `selectedInsurancePlan` | `InsurancePlan \| null` | Insurance selection |
| `activeBookings` | `BookingDetails[]` | Active bookings list |
| `bookingHistory` | `BookingDetails[]` | Past bookings |
| `availableChauffeurs` | `Chauffeur[]` | Search results |
| `loadingChauffeurs` | `boolean` | Loading state |
| `activeRideTracking` | `RideTracking \| null` | Live ride tracking |
| `currentLocation` / `pickupLocation` | `Location \| null` | Location state |

### Key Actions

| Action | Description |
|---|---|
| `loadAvailableChauffeurs()` | Load chauffeurs (mock) |
| `createBooking(details)` | Create booking (mock) |
| `startRideTracking(bookingId)` | Begin live tracking |
| `resetBookingFlow()` | Clear entire booking state |

---

## configStore (`store/configStore.ts`)

App configuration and feature flags. Backend endpoint (`/meta/configs/`) currently returns 404 — calls are commented out.

### State

| Field | Type | Description |
|---|---|---|
| `configs` | `AppConfig[]` | All config entries |
| `configsLoading` | `boolean` | Loading state |
| `configsError` | `string \| null` | Error state |

### Actions

| Action | Description |
|---|---|
| `fetchConfigs()` | Fetch all configs from API |
| `getConfigValue(key)` | Get config value by key |
| `updateConfig(key, data)` | Update a config (admin) |

---

## earningsStore (`store/earningsStore.ts`)

Driver earnings, breakdowns, and targets. API-integrated.

### State

| Field | Type | Description |
|---|---|---|
| `earnings` | `DriverEarnings` | Earnings aggregates |
| `dailyBreakdown` | `EarningsBreakdown[]` | Daily data |
| `weeklyTarget` / `monthlyTarget` | `number` | Earnings goals |
| `activeIncentives` / `completedIncentives` | `Incentive[]` | Bonus tracking |

### Key Actions

| Action | Description |
|---|---|
| `fetchEarnings()` | Load from API |
| `fetchDailyEarnings()` | Daily breakdown |
| `addJobEarnings(fare, tips, distance, duration)` | Record completed job |
| `getWeeklyEarnings()` / `getMonthlyEarnings()` | Computed getters |
| `getWeeklyProgress()` / `getMonthlyProgress()` | Goal progress % |

---

## jobStore (`store/jobStore.ts`)

Driver job management. **Fully API-integrated** via `DriverRidesApiService`.

### State

| Field | Type | Description |
|---|---|---|
| `pendingRequests` | `JobRequest[]` | Incoming ride requests |
| `activeJob` | `ActiveJob \| null` | Current active ride |
| `acceptedJobs` / `inProgressJobs` / `completedJobs` | `JobRequest[]` / `JobHistory[]` | Job lists |
| `isOnline` | `boolean` | Driver availability |
| `currentLocation` | `Location \| null` | GPS position |
| `lastAcceptError` / `lastApiError` | `string \| null` | Error tracking |

### Key Actions

| Action | Description |
|---|---|
| `fetchPendingRequests()` | Load available rides |
| `acceptRideFromAPI(rideId)` | Accept a ride |
| `startRideFromAPI(rideId)` | Begin ride |
| `completeRideFromAPI(rideId, data?)` | End ride |
| `fetchRideDetailsAndSync(rideId)` | Fetch + sync local state |
| `syncActiveJobFromBooking(booking)` | Sync from booking data |
| `setOnlineStatus(isOnline)` | Toggle driver availability |

---

## loginStore (`store/loginStore.ts`)

Simple form state for login screen. No API calls.

### State

| Field | Type |
|---|---|
| `loginMethod` | `'phone' \| 'email'` |
| `phoneNumber` | `string` |
| `email` | `string` |
| `password` | `string` |
| `loading` | `boolean` |

### Actions

`setLoginMethod`, `setPhoneNumber`, `setEmail`, `setPassword`, `setLoading`, `resetForm`

---

## loyaltyStore (`store/loyaltyStore.ts`)

Customer loyalty program. API-integrated via `LoyaltyApiService`.

### State

| Field | Type | Description |
|---|---|---|
| `profile` | `CustomerLoyaltyProfile \| null` | Points balance, tier |
| `transactions` | `CreditTransaction[]` | Point history |
| `referrals` | `ReferralEvent[]` | Referral tracking |
| `pendingCreditsToApply` | `number` | Credits for current booking |

### Actions

`fetchProfile()`, `fetchTransactions()`, `fetchReferrals()`, `fetchAll()`, `setPendingCreditsToApply()`, `clearPendingCredits()`

---

## taskStore (`store/taskStore.ts`)

Biker task management. Local state only (no API yet).

### State

| Field | Type | Description |
|---|---|---|
| `availableTasks` / `acceptedTasks` / `activeTasks` / `completedTasks` | `BikerTask[]` | Task lists by status |
| `emergencyAlerts` | `EmergencyAlert[]` | Active emergencies |
| `activeEmergency` | `EmergencyAlert \| null` | Emergency in progress |
| `notifications` | `TaskNotification[]` | Task notifications |
| `currentLocation` | `BikerLocation \| null` | GPS position |
| `priorityFilter` / `typeFilter` / `sortBy` | Various | Filter/sort state |

### Key Actions

`acceptTask()`, `startTask()`, `completeTask()`, `cancelTask()`, `respondToEmergency()`, `resolveEmergency()`, `getFilteredTasks()`, `getNearbyTasks()`

---

## bikerEarningsStore (`store/bikerEarningsStore.ts`)

Biker earnings and shift tracking. Local state only.

### State

| Field | Type | Description |
|---|---|---|
| `earnings` | `BikerEarnings` | Earnings aggregates |
| `currentShift` | `BikerShift \| null` | Active shift |
| `shiftHistory` / `taskHistory` | Arrays | Historical data |
| `dailyEarnings` / `weeklyEarnings` / `monthlyEarnings` | Arrays | Period breakdowns |
| `performanceMetrics` | `PerformanceMetrics` | KPI tracking |

### Actions

`startShift()`, `endShift()`, `updateEarnings()`, `getTodayEarnings()`, `getWeekEarnings()`, `getMonthEarnings()`

---

## carStore (`store/carStore.ts`)

Customer vehicle management. API-integrated via `CustomerCarApiService`.

### State

| Field | Type | Description |
|---|---|---|
| `cars` | `CustomerCar[]` | User's vehicles |
| `defaultCar` | `CustomerCar \| null` | Default vehicle |
| `isLoading` | `boolean` | Loading state |
| `currentCarForm` | `Partial<CustomerCar> \| null` | Form state |

### Actions

`setCars()`, `addCar()`, `updateCar()`, `deleteCar()`, `setDefaultCar()`, `loadUserCars()`

---

## i18nStore (`store/i18nStore.ts`)

Internationalization. Supports English (`en`) and Hindi (`hi`).

### State

| Field | Type | Description |
|---|---|---|
| `language` | `'en' \| 'hi'` | Current language |

### Actions

| Action | Description |
|---|---|
| `t(key)` | Translate key to current language |
| `setLanguage(lang)` | Switch language (persists) |
| `initLanguage()` | Load from storage on startup |

### Persisted Keys

- `@chauffit_language` — Language preference

---

## adminStore (`store/adminStore.ts`)

Admin panel state. API-integrated via `AdminApiService`. Largest store with 50+ actions.

### State Sections

| Section | Fields |
|---|---|
| Dashboard | `dashboard` stats |
| Users | `users`, `usersLoading` |
| Drivers | `drivers`, `pendingDrivers`, `driversLoading` |
| Bikers | `bikers`, `pendingBikers` |
| Rides | `rides`, `selectedRide` |
| Tasks | `tasks` |
| Payments | `payments` |
| Disputes | `disputes` |
| Pricing | `rateCards`, `activeRateCard`, `hourlyHireSettings` |
| Insurance | `insurancePlans` |
| Amenities | `amenities` |
| Revenue | `revenue` |
| Analytics | `analytics` |
| Training | `trainingBatches` |
| Ads | `advertisements`, `advertisementCategories` |

### Key Action Groups

| Group | Actions |
|---|---|
| **Users** | `fetchUsers()`, `updateUserStatus()` |
| **Drivers** | `fetchDrivers()`, `fetchPendingDrivers()`, `verifyDriver()` |
| **Bikers** | `fetchBikers()`, `fetchPendingBikers()`, `verifyBiker()` |
| **Rides** | `fetchRides()`, `dispatchRide()`, `cancelRide()` |
| **Disputes** | `fetchDisputes()`, `resolveDispute()` |
| **Pricing** | `fetchRateCards()`, `updateRateCard()`, `savePricingSettings()` |
| **Insurance** | `fetchInsurancePlans()`, `createInsurancePlan()`, `updateInsurancePlan()`, `deleteInsurancePlan()` |
| **Amenities** | `fetchAmenities()`, `createAmenity()`, `updateAmenity()`, `deleteAmenity()` |
| **Analytics** | `fetchRevenue()`, `fetchAnalytics()` |
| **Training** | `fetchTrainingBatches()`, `createTrainingBatch()`, `autoAssignBatch()`, `markTrainingResults()` |
| **Ads** | `fetchAdvertisements()`, `createAdvertisement()`, `updateAdvertisement()`, `deleteAdvertisement()` |

---

## Store Usage Patterns

### Accessing a store

```typescript
import { useAuthStore } from '@/store/authStore';

const { user, isAuthenticated } = useAuthStore();
const logout = useAuthStore(state => state.logout);
```

### Initialization flow

1. App starts → `app/index.tsx` calls `initializeAuth()`
2. `initializeAuth()` rehydrates tokens from AsyncStorage
3. If tokens exist → fetch profile → set role → redirect
4. If no tokens → redirect to login

### Role-based routing

```typescript
const activeRole = useAuthStore(state => state.activeRole);
// Routes to app/(customer)/, app/(driver)/, app/(biker)/, or app/(admin)/
```
