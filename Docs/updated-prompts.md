# Chauffit Chauffeur Service - Structured Agent Workflow

## 🎯 PROJECT CONTEXT

Chauffit is a chauffeur service platform where customers book professional drivers for their own vehicles. The service includes three mobile apps (Customer, Driver, Biker) with a unified Supabase backend. Bikers provide first/last-mile transportation for chauffeurs to reach customer locations.

## 📁 PROJECT STRUCTURE

```
Create this project structure:
/chauffit/
├── /docs/
│   ├── /01-ux-research/
│   ├── /02-planning/
│   ├── /03-ui-design/
│   └── /04-architecture/
├── /.agent-artifacts/
├── /apps/
│   ├── /customer/
│   ├── /driver/
│   └── /biker/
├── /packages/
│   ├── /shared-ui/
│   ├── /types/
│   └── /api-client/
└── /backend/
    └── /supabase/

Do not use web search for any phase of this project.
```

---

## 🚀 INITIAL SETUP PROMPT

```
Use the rapid-prototyper agent to:
- Create pnpm workspace monorepo structure in /chauffit/
- Initialize three React Native Expo apps: customer, driver, biker
- Set up shared packages: shared-ui, types, api-client
- Install base dependencies for each app:
  * expo, react-native, typescript
  * nativewind for styling
  * zustand for state management
  * expo-router for navigation
- Create package.json with workspace references
- Set up TypeScript configs
- Save setup log to /.agent-artifacts/initial-setup.md
```

---

## 📋 PHASE 1: UX RESEARCH & PLANNING

### Phase 1 Tasks:

```
1. Use the ux-researcher agent to:
   - Create user personas for three app types:
     * Customer: Books chauffeur for their own car
     * Driver: Professional chauffeur accepting jobs
     * Biker: Transports chauffeurs to/from customer locations
   - Design optimal user flows:
     * Customer: Login → Enter car details → Book chauffeur → Track arrival → Complete ride
     * Driver: Go online → Accept booking → Get biker pickup → Drive customer → Complete
     * Biker: Accept pickup task → Navigate to driver → Drop at customer location
   - Create wireframes for critical screens
   - Plan mobile-first responsive layouts
   - Save all wireframes to /chauffit/docs/01-ux-research/wireframes/
   - Document interaction patterns in /chauffit/docs/01-ux-research/interaction-patterns.md

2. Then use the sprint-prioritizer agent to:
   - Break down into exact components:
     * Customer App: BookingCard, DriverCard, TrackingMap, SOSButton
     * Driver App: JobCard, NavigationView, EarningsCard, OnlineToggle
     * Biker App: TaskCard, RouteMap, IncentiveTracker
   - Prioritize MVP features:
     * Must have: Booking, tracking, payments, driver assignment
     * Nice to have: Amenities, insurance, AI monitoring
   - Save component breakdown to /chauffit/docs/02-planning/component-breakdown.md
   - Create implementation order in /chauffit/docs/02-planning/build-order.md

Do not add features beyond: chauffeur booking, real-time tracking, payment processing, biker coordination.
Update /.agent-artifacts/handoff-notes.md with UX decisions.
```

---

## 🎨 PHASE 2: UI DESIGN

### Phase 2 Tasks:

```
1. Use the ui-designer agent to:
   Design components with luxury/premium feel using NativeWind:
   
   - Customer App Components:
     * BookingCard with:
       - Car details input (make, model, registration)
       - Duration selector (2hr, 4hr, 8hr, custom)
       - Scheduled vs immediate booking toggle
     * DriverCard with:
       - Driver photo, name, rating
       - Experience badges
       - Arrival ETA
     * TrackingMap with:
       - Real-time driver location
       - Estimated arrival time
       - Route visualization
   
   - Driver App Components:
     * JobCard with:
       - Customer name and location
       - Car details (make, model, color)
       - Booking duration and earnings
       - Accept/Decline buttons
     * OnlineToggle with:
       - Availability status
       - Current location display
       - Shift preferences
   
   - Biker App Components:
     * TaskCard with:
       - Pickup type (driver/emergency)
       - Distance and payout
       - Time limit indicator
   
   Define color system:
   - Primary: Pastel Gray (#D9D1C6) for premium feel
   - Secondary: Deer (#BD8C5E)
   - Success: Green for confirmations
   - Danger: Red for SOS/emergency
   - Icons and top appbar: Burgundy (#720c17)
   - Primary text : black (#000000)
   - Secondary text : dark slate gray #314b4c

   Dark Mode Color Strategy:
   - Primary Background: A deep, near-black (#1a1a1a) replaces the light pastel gray.
   - Secondary Backgrounds (Cards, Sections): A slightly lighter dark gray (#2c2c2c) provides contrast against the primary background, replacing white.
   - Primary Text: Your chauffit-pastel-gray (#d9d1c6) is now used for main text, providing good readability on dark backgrounds.
   - Secondary Text/Placeholders: A mid-gray (#999999) for less prominent text.
   - Borders/Dividers: A darker gray (#4a4a4a) for subtle separation.
   - Accent Colors (Burgundy, Deer): Your brand colors (#720c17 and #bd8c5e) remain prominent, as they stand out well against dark backgrounds.
   
   Save all specs to /chauffit/docs/03-ui-design/component-specs.md

2. Then use the whimsy-injector agent to add:
   - Smooth animations:
     * Driver arrival animation
     * Booking confirmation celebration
     * Rating stars fill animation
   - Micro-interactions:
     * Button press feedback
     * Card swipe gestures
     * Pull-to-refresh
   - Loading states:
     * Skeleton screens
     * Progress indicators
   - Success states:
     * Booking confirmed animation
     * Payment success feedback
   
   Document all animations in /chauffit/docs/03-ui-design/animations.md

Keep design premium but functional for drivers using while working.
Update /.agent-artifacts/handoff-notes.md with design decisions.
```

---

## 💻 PHASE 3: FRONTEND DEVELOPMENT

### Phase 3 Tasks:

```
1. Use the mobile-app-builder agent to implement Customer App:
   
   SCREENS (/apps/customer/app/):
   - (auth)/login.tsx: Phone OTP authentication
   - (auth)/verify-otp.tsx: OTP verification
   - (auth)/car-details.tsx: Add customer's car information
   - (tabs)/home.tsx: Book chauffeur with map view
   - (tabs)/bookings.tsx: Active and past bookings
   - (tabs)/profile.tsx: Profile and car management
   - booking/select-duration.tsx: Choose booking duration
   - booking/select-chauffeur.tsx: View available chauffeurs
   - booking/confirm.tsx: Review and confirm booking
   - ride/tracking.tsx: Real-time chauffeur tracking
   - ride/completed.tsx: Rating and payment
   
   COMPONENTS (/apps/customer/components/):
   - booking/BookingCard.tsx
   - booking/DurationSelector.tsx
   - driver/DriverCard.tsx
   - driver/DriverList.tsx
   - map/TrackingMap.tsx
   - safety/SOSButton.tsx
   - payment/PaymentMethod.tsx
   
   STATE (/apps/customer/stores/):
   - authStore.ts: User authentication and profile
   - bookingStore.ts: Current booking state
   - carStore.ts: Customer's car details

2. Use the mobile-app-builder agent to implement Driver App:
   
   SCREENS (/apps/driver/app/):
   - (auth)/login.tsx: Phone + license verification
   - (tabs)/home.tsx: Online/offline toggle and incoming requests
   - (tabs)/earnings.tsx: Daily/weekly earnings
   - (tabs)/profile.tsx: Documents and ratings
   - job/accept.tsx: View and accept job details
   - job/navigation.tsx: Navigate to customer
   - job/active.tsx: Active ride management
   
   COMPONENTS (/apps/driver/components/):
   - job/JobCard.tsx
   - job/JobDetails.tsx
   - status/OnlineToggle.tsx
   - earnings/EarningsCard.tsx
   - navigation/RouteMap.tsx
   
   STATE (/apps/driver/stores/):
   - authStore.ts: Driver authentication
   - jobStore.ts: Current job state
   - earningsStore.ts: Earnings tracking

3. Use the mobile-app-builder agent to implement Biker App:
   
   SCREENS (/apps/biker/app/):
   - (auth)/login.tsx: Simple phone auth
   - home.tsx: Available tasks list
   - task/[id].tsx: Task details and navigation
   - earnings.tsx: Shift earnings and incentives
   
   COMPONENTS (/apps/biker/components/):
   - task/TaskCard.tsx
   - navigation/BikerMap.tsx
   - earnings/IncentiveTracker.tsx

4. Then use the frontend-developer agent to:
   - Implement shared UI components in /packages/shared-ui/
   - Set up Google Maps integration for all apps
   - Configure Stripe payment UI components
   - Implement real-time updates with Supabase
   - Add OneSignal push notification handlers

5. Then use the test-writer-fixer agent to:
   - Write tests for booking flow
   - Test driver assignment logic
   - Test payment processing
   - Verify real-time tracking works
   - Test SOS functionality

Update /.agent-artifacts/handoff-notes.md with implementation notes.
```

---

## 🔧 PHASE 4: BACKEND DEVELOPMENT

### Phase 4 Tasks:

```
1. Use the backend-architect agent to create Supabase schema:
   
   DATABASE TABLES (/backend/supabase/migrations/):
   
   -- Users table for all user types
   CREATE TABLE users (
     id UUID PRIMARY KEY,
     phone VARCHAR(15) UNIQUE,
     role ENUM('customer', 'driver', 'biker'),
     name VARCHAR(100),
     email VARCHAR(100),
     created_at TIMESTAMP
   );
   
   -- Customer cars (customers can have multiple cars)
   CREATE TABLE customer_cars (
     id UUID PRIMARY KEY,
     customer_id UUID REFERENCES users(id),
     make VARCHAR(50),
     model VARCHAR(50),
     color VARCHAR(30),
     registration VARCHAR(20),
     is_primary BOOLEAN
   );
   
   -- Drivers table with additional info
   CREATE TABLE drivers (
     id UUID PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     license_no VARCHAR(50),
     experience_years INTEGER,
     rating DECIMAL(3,2),
     status ENUM('online', 'offline', 'busy'),
     current_location JSONB
   );
   
   -- Bookings for chauffeur service
   CREATE TABLE bookings (
     id UUID PRIMARY KEY,
     customer_id UUID REFERENCES users(id),
     driver_id UUID REFERENCES drivers(id),
     car_id UUID REFERENCES customer_cars(id),
     pickup_location JSONB,
     dropoff_location JSONB,
     scheduled_time TIMESTAMP,
     duration_hours INTEGER,
     status ENUM('pending', 'accepted', 'arriving', 'in_progress', 'completed'),
     fare_amount DECIMAL(10,2),
     created_at TIMESTAMP
   );
   
   -- Biker tasks for driver transportation
   CREATE TABLE biker_tasks (
     id UUID PRIMARY KEY,
     biker_id UUID REFERENCES users(id),
     driver_id UUID REFERENCES drivers(id),
     booking_id UUID REFERENCES bookings(id),
     pickup_location JSONB,
     dropoff_location JSONB,
     distance_km DECIMAL(5,2),
     payout_amount DECIMAL(10,2),
     status ENUM('pending', 'accepted', 'in_progress', 'completed')
   );

2. Then use the backend-architect agent to create Edge Functions:
   
   EDGE FUNCTIONS (/backend/supabase/functions/):
   
   - find-available-chauffeur/
     * Match driver skills with car type
     * Check driver proximity
     * Verify driver availability
     * Assign best match
   
   - calculate-fare/
     * Base rate per hour
     * Distance-based adjustments
     * Peak hour pricing
     * Package discounts (4hr, 8hr)
   
   - dispatch-biker/
     * Find nearest available biker
     * Calculate pickup route
     * Send notification
     * Track acceptance
   
   - process-payment/
     * Charge customer via Stripe
     * Split payment (driver 80%, platform 20%)
     * Process biker payout
     * Handle tips
   
   - trigger-sos/
     * Get customer location
     * Alert nearest biker
     * Notify emergency contacts
     * Log incident

3. Use the backend-architect agent to set up Realtime:
   - Booking status updates channel
   - Driver location tracking channel
   - Customer notifications channel
   - Biker task updates channel

4. Then use the api-tester agent to:
   - Test booking creation and assignment
   - Test driver matching algorithm
   - Test payment processing
   - Test real-time location updates
   - Test SOS trigger system

5. Use the performance-benchmarker agent to:
   - Load test with 1000 concurrent bookings
   - Optimize driver assignment queries
   - Test real-time update latency
   - Ensure sub-500ms response times

6. Use the devops-automator agent to:
   - Set up EAS build configurations
   - Configure Supabase deployment
   - Set up environment variables:
     * SUPABASE_URL, SUPABASE_ANON_KEY
     * STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY
     * GOOGLE_MAPS_API_KEY
     * ONESIGNAL_APP_ID
   - Create CI/CD pipeline
   - Document deployment in /chauffit/docs/04-architecture/deployment.md

Update /.agent-artifacts/handoff-notes.md with backend architecture.
```

---

## 🚀 FINAL LAUNCH TASKS

### Final Launch Prompt:

```
Use the project-shipper agent to:
- Verify all three apps are fully functional
- Ensure chauffeur booking flow works end-to-end
- Test driver arrival tracking is real-time
- Verify payment processing and splits work
- Test biker dispatch for driver transportation
- Check SOS functionality triggers correctly
- Run performance tests (booking < 30s, tracking < 500ms latency)
- Create demo accounts for testing
- Generate APK/IPA builds via EAS
- Deploy Supabase to production
- Create launch checklist in /chauffit/docs/launch-checklist.md
- Document known issues in /chauffit/docs/known-issues.md

Then use the studio-coach agent to:
- Create comprehensive handover document
- Include all environment variables needed
- Document API endpoints and authentication
- Provide maintenance guidelines
- Create user guides for each app type
- Save everything to /chauffit/docs/handover.md
```

---

## 🚫 STRICT CONSTRAINTS

1. **NO SCOPE CREEP**: Chauffeurs drive customer's own cars - no vehicle ownership
2. **EXACT FEATURES ONLY**: No AI monitoring or video playback in MVP
3. **FILE DISCIPLINE**: Save all outputs to specified paths
4. **READ HANDOFFS**: Each phase must read previous phase outputs
5. **TECH STACK LOCKED**: React Native + Expo + Supabase + TypeScript only
6. **TESTING REQUIRED**: Every feature needs corresponding tests
7. **NO WEB SEARCH**: Build with internal knowledge only