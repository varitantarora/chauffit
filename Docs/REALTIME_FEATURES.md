# Chauffit - Real-Time Features

Implementation details for Supabase-powered real-time features.

---

## Overview

Real-time communication handled by `services/SupabaseRealTimeService.ts` using Supabase **Broadcast channels**. No WebSockets managed directly — Supabase client SDK handles connection lifecycle.

### Configuration

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Channel Types

### 1. Location Tracking (`locations`)

Tracks user positions in real-time. Used for:
- Driver location on customer map during ride
- Biker location during delivery
- Nearby driver discovery

| Method | Description |
|---|---|
| `startLocationTracking()` | Begin sending GPS updates every 5 seconds |
| `stopLocationTracking()` | Stop sending updates |
| `subscribeToLocation(userId, callback)` | Listen to a user's position |

**Payload:**
```typescript
{
  userId: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  accuracy: number;
  timestamp: string;
}
```

**Features:**
- Haversine distance calculation between points
- Accuracy filtering (rejects low-accuracy reads)
- Background location support
- Automatic reconnection on network restore

---

### 2. Booking Updates (`booking:{bookingId}`)

Real-time booking status changes. Used by both customer and driver.

| Method | Description |
|---|---|
| `subscribeToBookingUpdates(bookingId, callback)` | Listen to booking changes |
| `unsubscribeFromBooking(bookingId)` | Stop listening |

**Event Types:**

| Event | Trigger | Audience |
|---|---|---|
| `driver_assigned` | Driver accepts ride | Customer |
| `driver_arrived` | Driver at pickup | Customer |
| `ride_started` | OTP verified, ride begins | Customer |
| `ride_completed` | Ride ends | Customer + Driver |
| `fare_updated` | Fare recalculated | Customer + Driver |
| `eta_update` | New ETA calculated | Customer |
| `booking_cancelled` | Either party cancels | Both |

---

### 3. Emergency Alerts (`emergency_alerts`)

Broadcast emergency alerts to nearby users. Critical safety feature.

| Method | Description |
|---|---|
| `sendEmergencyAlert(alert)` | Broadcast emergency |
| `subscribeToEmergencyAlerts(callback)` | Listen for alerts |
| `subscribeToNearbyAlerts(radiusKm, callback)` | Geofenced alerts |

**Alert Types:**
- `general` — General emergency
- `medical` — Medical emergency
- `security` — Security threat
- `vehicle` — Vehicle breakdown

**Alert Payload:**
```typescript
{
  alertId: string;
  type: 'general' | 'medical' | 'security' | 'vehicle';
  userId: string;
  userType: 'customer' | 'driver' | 'biker';
  latitude: number;
  longitude: number;
  message: string;
  timestamp: string;
  status: 'active' | 'responded' | 'resolved';
}
```

**Emergency Numbers (India):**
- 100 — Police
- 108 — Ambulance
- 101 — Fire
- 1091 — Women's helpline
- 1098 — Child helpline

---

### 4. Chat Messaging (`chat:{bookingId}`)

In-ride messaging between customer and driver.

| Method | Description |
|---|---|
| `sendChatMessage(bookingId, message)` | Send message |
| `subscribeToChat(bookingId, callback)` | Listen to messages |
| `markMessagesRead(bookingId)` | Mark as read |

**Message Types:**
- `text` — Plain text message
- `location` — Shared location pin
- `image` — Photo message
- `system` — Automated system message

**Message Payload:**
```typescript
{
  messageId: string;
  bookingId: string;
  senderId: string;
  senderType: 'customer' | 'driver';
  type: 'text' | 'location' | 'image' | 'system';
  content: string;
  timestamp: string;
  read: boolean;
}
```

---

### 5. User Status (`user:{userId}`)

Online/offline presence and status updates.

| Event | Description |
|---|---|
| `online` | User came online |
| `offline` | User went offline |
| `location_update` | Periodic position ping |

---

## Connection Management

### Lifecycle

```
App Start → initializeAuth() → SupabaseRealTimeService.connect()
  ↓
Role Selected → Subscribe to role-specific channels
  ↓
Ride/Task Active → Subscribe to booking/task channels
  ↓
Ride/Task End → Unsubscribe from booking/task channels
  ↓
App Background → Disconnect (save battery)
  ↓
App Foreground → Reconnect + resubscribe
  ↓
Logout → Disconnect all channels
```

### Error Handling

- Automatic reconnection on network restore
- Exponential backoff on connection failures
- Graceful degradation — app works without real-time (polling fallback)
- Error logging via `BaseApiService` logger

### Performance Considerations

- Location updates throttled to 5-second intervals
- Distance-based filtering prevents unnecessary updates
- Channels auto-cleanup when components unmount
- Presence tracking limited to active ride participants

---

## Integration with Stores

| Store | Real-time Feature |
|---|---|
| `authStore` | `bikerIsOnline`, `driverIsOnline` toggle |
| `bookingStore` | `activeRideTracking` updated via booking channel |
| `jobStore` | `pendingRequests` via driver status, `activeJob` via booking channel |
| `taskStore` | `emergencyAlerts`, `availableTasks` via biker channel |

---

## Supabase Database Tables

Real-time features reference these tables:

| Table | Purpose | Real-Time |
|---|---|---|
| `users` | User profiles with location | Yes (location column) |
| `bookings` | Booking records with status | Yes |
| `locations` | Position history | Yes |
| `messages` | Chat messages | Yes |
| `emergency_alerts` | Emergency records | Yes |
| `emergency_responses` | Responder tracking | Yes |

---

## Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| No location updates | Permission denied | Check `ACCESS_FINE_LOCATION` permission |
| Stale position data | Background restriction | Enable background location in app settings |
| Missing booking updates | Channel not subscribed | Verify `subscribeToBookingUpdates` called after booking creation |
| Chat messages not received | Wrong booking channel | Confirm `bookingId` matches active ride |
| Emergency alerts not received | Geofence too small | Increase radius in `subscribeToNearbyAlerts` |
