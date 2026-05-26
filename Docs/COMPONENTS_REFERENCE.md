# Chauffit - Components Reference

All reusable components organized by category under `components/`.

---

## Common Components (`components/common/`)

Core UI primitives used across all roles. Theme-aware via NativeWind.

### ThemedText

Text component with dark/light mode support.

```tsx
<ThemedText className="text-lg font-bold">Hello</ThemedText>
```

### ThemedView

View with theme-aware background.

```tsx
<ThemedView className="flex-1 p-4">
  {/* content */}
</ThemedView>
```

### ThemedCard

Card container with elevation and theme support.

```tsx
<ThemedCard className="p-4 rounded-xl">
  <ThemedText>Card content</ThemedText>
</ThemedCard>
```

### PrimaryButton

Standardized button with variants.

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | required | Button label |
| `onPress` | `() => void` | required | Press handler |
| `loading` | `boolean` | `false` | Show spinner |
| `disabled` | `boolean` | `false` | Disable state |
| `variant` | `'primary' \| 'secondary' \| 'outline'` | `'primary'` | Style variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size |

### SearchableDropdown

Dropdown with search/filter capability.

| Prop | Type | Description |
|---|---|---|
| `data` | `DropdownItem[]` | Options list |
| `onSelect` | `(item) => void` | Selection handler |
| `placeholder` | `string` | Placeholder text |
| `searchPlaceholder` | `string` | Search input placeholder |

---

## Shared Components (`components/shared/`)

Cross-role feature components with complex logic.

### EmergencyButton

Critical safety component. Requires **100% test coverage**.

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `variant` | `'floating' \| 'inline' \| 'header'` | `'inline'` | Display style |
| `userType` | `'customer' \| 'driver' \| 'biker'` | required | Role |
| `onEmergencyTriggered` | `(location) => void` | optional | Callback |
| `emergencyContacts` | `EmergencyContact[]` | optional | SMS targets |
| `showConfirmation` | `boolean` | `true` | Confirmation dialog |
| `autoCallPolice` | `boolean` | `false` | Auto-dial 100 |

**Features:**
- 5-second countdown to prevent accidental activation
- Indian emergency numbers (100, 108, 101, 1091, 1098)
- SMS alerts to emergency contacts
- Location sharing
- Haptic feedback

### MapView

Universal map component wrapping `react-native-maps`.

| Prop | Type | Description |
|---|---|---|
| `initialRegion` | `Region` | Starting map view |
| `markers` | `MapMarker[]` | Map pins |
| `route` | `MapRoute` | Route polyline |
| `animateRoute` | `boolean` | Animated route drawing |
| `showUserLocation` | `boolean` | Blue dot for user |
| `followUserLocation` | `boolean` | Camera follows user |
| `onMarkerPress` | `(marker) => void` | Pin tap handler |
| `onRouteReady` | `(result) => void` | Route calculated |

**Features:**
- Google Maps integration
- Animated route drawing
- Dark mode map style
- Waypoint support
- Multiple marker types with color coding

### PaymentSelector

Payment method selection for Indian payment ecosystem.

| Prop | Type | Description |
|---|---|---|
| `paymentMethods` | `PaymentMethod[]` | Available methods |
| `selectedPaymentMethod` | `PaymentMethod` | Current selection |
| `onPaymentMethodSelect` | `(method) => void` | Selection handler |
| `onAddPaymentMethod` | `() => void` | Add new method |
| `allowCash` | `boolean` | Show cash option |
| `allowUPI` | `boolean` | Show UPI option |
| `allowWallets` | `boolean` | Show wallets |
| `allowCards` | `boolean` | Show cards |

**Features:**
- Indian payment methods (UPI, wallets, net banking)
- Card brand detection (Visa, Mastercard, Rupay)
- Default payment method support

### NetworkStatus

Real-time connectivity banner.

| Prop | Type | Description |
|---|---|---|
| `showWhenOnline` | `boolean` | Show when connected |
| `position` | `'top' \| 'bottom'` | Banner position |
| `onStatusChange` | `(connected, type) => void` | Status callback |
| `enableRetry` | `boolean` | Show retry button |

**Features:**
- Animated slide-in/out
- Network type detection (Wi-Fi, Cellular)
- Color-coded indicators

### ErrorBoundary

React error boundary with recovery.

| Prop | Type | Description |
|---|---|---|
| `fallback` | `(error, info, retry) => ReactNode` | Custom error UI |
| `onError` | `(error, info) => void` | Error callback |
| `enableErrorReporting` | `boolean` | Log to external service |
| `showErrorDetails` | `boolean` | Dev mode details |

### PushNotificationHandler

Push notification management wrapper.

| Prop | Type | Description |
|---|---|---|
| `userType` | `'customer' \| 'driver' \| 'biker'` | Role for channel setup |
| `userId` | `string` | User identifier |
| `onNotificationReceived` | `(notification) => void` | Foreground handler |
| `onNotificationPressed` | `(notification) => void` | Tap handler |

**Notification types:** `booking`, `job`, `emergency`, `payment`

---

## Auth Components (`components/auth/`)

### PhoneLoginForm

Phone number login with OTP.

| Prop | Type | Description |
|---|---|---|
| `phoneNumber` | `string` | Phone value |
| `setPhoneNumber` | `(value) => void` | Setter |
| `handlePhoneLogin` | `() => void` | Submit handler |
| `loading` | `boolean` | Loading state |

**Features:** +91 prefix, 10-digit validation, numeric keyboard

### EmailLoginForm

Email/password login form.

| Prop | Type | Description |
|---|---|---|
| `email` | `string` | Email value |
| `setEmail` | `(value) => void` | Setter |
| `password` | `string` | Password value |
| `setPassword` | `(value) => void` | Setter |
| `handleEmailLogin` | `() => void` | Submit handler |
| `loading` | `boolean` | Loading state |

### LoginMethodToggle

Switch between phone and email login.

| Prop | Type | Description |
|---|---|---|
| `loginMethod` | `'phone' \| 'email'` | Current method |
| `onMethodChange` | `(method) => void` | Switch handler |
| `isDarkMode` | `boolean` | Theme state |

---

## Customer Components (`components/customer/`)

### BookingCard

Ride history card for customer home/history screens.

### CarDetailsForm

Vehicle registration/edit form. Fields: make, model, year, color, license plate, transmission.

### MapLocationPicker

Map-based location selection with search.

| Prop | Type | Description |
|---|---|---|
| `onLocationSelect` | `(location) => void` | Selection callback |
| `initialLocation` | `LatLng` | Starting position |
| `searchPlaceholder` | `string` | Search hint |

---

## Driver Components (`components/driver/`)

### EarningsCard

Earnings summary card for driver home.

### JobCard

Job/ride request card with accept/decline actions.

| Prop | Type | Description |
|---|---|---|
| `job` | `JobRequest` | Job data |
| `onAccept` | `() => void` | Accept handler |
| `onDecline` | `() => void` | Decline handler |

### RouteMap

Navigation map showing route to pickup/destination.

### Profile Components

#### TrainingCertificate

Training completion certificate display. Fully translated (en/hi).

---

## Biker Components (`components/biker/`)

### IncentiveTracker

Visual progress tracker for active incentives/bonuses.

### ResponseTimer

Countdown timer for emergency response. Shows time elapsed since alert.

### NavigationMap

Turn-by-turn navigation for biker deliveries.

### TaskCard

Task listing card with status, priority, distance.

---

## Admin Components (`components/admin/`)

### FilterPills

Horizontal scrollable filter pills.

| Prop | Type | Description |
|---|---|---|
| `options` | `FilterOption[]` | Filter choices |
| `selected` | `string` | Active filter |
| `onSelect` | `(value) => void` | Selection handler |

### StatCard

Metric display card with icon.

| Prop | Type | Description |
|---|---|---|
| `title` | `string` | Metric label |
| `value` | `string \| number` | Metric value |
| `icon` | `Ionicons glyphMap` | Icon name |
| `color` | `string` | Icon color |
| `subtitle` | `string` | Secondary text |

### StatusBadge

Color-coded status indicator. 35+ predefined statuses:

| Status Category | Examples |
|---|---|
| Booking | `pending`, `confirmed`, `active`, `completed`, `cancelled` |
| Driver | `available`, `busy`, `offline`, `on_trip` |
| Payment | `paid`, `pending`, `failed`, `refunded` |
| Verification | `verified`, `pending`, `rejected`, `suspended` |
| Emergency | `active`, `responded`, `resolved` |

---

## Component Guidelines

### Adding a new component

1. Place in appropriate subdirectory by role or `common`/`shared`
2. Use NativeWind (`className`) for styling — no inline styles
3. Accept `className` prop for external overrides
4. Support dark mode via `useAuthStore().isDarkMode` or NativeWind `dark:` prefix
5. Export from component file — no barrel exports

### Styling conventions

- Use NativeWind utility classes (`className="flex-1 p-4 bg-white dark:bg-gray-900"`)
- Brand colors: `primary` (#D9D1C6), `secondary` (#BD8C5E), `burgundy` (#720C17)
- Consistent spacing: `p-4` (16px), `p-6` (24px), `gap-3` (12px)
- Border radius: `rounded-xl` for cards, `rounded-full` for avatars

### Theme access

```typescript
const isDarkMode = useAuthStore(state => state.isDarkMode);
// or use NativeWind dark: prefix
<View className="bg-white dark:bg-gray-900" />
```
