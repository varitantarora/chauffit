# Chauffit App Development Workflow with AI Agents

## 🎯 LOCKED SCOPE & FEATURES

### Core Features (DO NOT ADD MORE)

#### Customer App Features
1. **Authentication**
   - Phone number OTP login
   - Profile management (name, email, saved addresses)

2. **Booking System**
   - Quick booking (immediate rides)
   - Scheduled booking (advance booking)
   - Ride type selection: Short (< 10km), Long (> 10km), Hourly (4hr/8hr packages)
   - Pickup/dropoff location selection with Google Maps
   - Driver selection from available list (shows rating, photo, car details)
   - Fare estimation display

3. **Ride Management**
   - Real-time ride tracking on map
   - Driver details card (name, photo, car number, rating)
   - ETA display
   - In-ride amenities selection (water, snacks)
   - Insurance add-on toggle

4. **Safety**
   - SOS button (triggers biker dispatch)
   - Share ride details button
   - Emergency contact management

5. **Payments**
   - Add/remove payment methods (cards via Stripe)
   - Wallet balance display
   - Ride history with receipts
   - Tip driver option

6. **Notifications**
   - Driver assigned alerts
   - Driver arrival notifications
   - Ride completion summary

#### Driver App Features
1. **Authentication**
   - Phone OTP + license verification
   - Profile with documents upload

2. **Availability Management**
   - Online/offline toggle
   - Shift timing preferences
   - Current location display

3. **Ride Management**
   - Incoming ride requests with accept/decline
   - Navigation to pickup/dropoff
   - Start/complete ride buttons
   - Customer details view

4. **Earnings**
   - Daily earnings summary
   - Weekly/monthly reports
   - Payout history
   - Tips received

5. **Biker Support**
   - Request pickup for distant bookings
   - Drop-off confirmation

#### Biker App Features
1. **Authentication**
   - Phone OTP login
   - E-bike assignment

2. **Task Management**
   - Driver pickup/drop requests
   - SOS response assignments
   - Navigation to locations

3. **Earnings**
   - Per-trip earnings
   - Incentive tracker
   - Shift summary

### Tech Stack (CONFIRMED)
```
Frontend: React Native + Expo + TypeScript
UI: NativeWind (Tailwind for React Native)
Backend: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
Maps: Google Maps SDK for React Native
Payments: Stripe + Stripe Connect
Notifications: OneSignal
State: Zustand
Navigation: Expo Router
Build: EAS (Expo Application Services)
Monorepo: pnpm workspaces
```

### File Structure
```
chauffit/
├── apps/
│   ├── customer/
│   │   ├── app/                    # Expo Router screens
│   │   │   ├── (auth)/
│   │   │   │   ├── login.tsx
│   │   │   │   └── verify-otp.tsx
│   │   │   ├── (tabs)/
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── home.tsx
│   │   │   │   ├── bookings.tsx
│   │   │   │   ├── wallet.tsx
│   │   │   │   └── profile.tsx
│   │   │   ├── booking/
│   │   │   │   ├── select-ride-type.tsx
│   │   │   │   ├── select-location.tsx
│   │   │   │   ├── select-driver.tsx
│   │   │   │   └── confirm-booking.tsx
│   │   │   ├── ride/
│   │   │   │   ├── tracking.tsx
│   │   │   │   └── completed.tsx
│   │   │   └── _layout.tsx
│   │   ├── components/
│   │   │   ├── booking/
│   │   │   ├── ride/
│   │   │   ├── payment/
│   │   │   └── shared/
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   ├── booking.store.ts
│   │   │   └── ride.store.ts
│   │   ├── services/
│   │   │   ├── supabase.ts
│   │   │   ├── maps.ts
│   │   │   └── stripe.ts
│   │   └── constants/
│   ├── driver/
│   │   └── [similar structure]
│   └── biker/
│       └── [similar structure]
├── packages/
│   ├── shared-ui/                  # Shared UI components
│   │   ├── src/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Map.tsx
│   │   └── index.ts
│   ├── types/                      # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── user.types.ts
│   │   │   ├── booking.types.ts
│   │   │   ├── payment.types.ts
│   │   │   └── index.ts
│   │   └── package.json
│   └── api-client/                 # Supabase client wrapper
│       ├── src/
│       │   ├── auth.ts
│       │   ├── bookings.ts
│       │   ├── payments.ts
│       │   └── realtime.ts
│       └── index.ts
├── backend/
│   ├── supabase/
│   │   ├── migrations/
│   │   │   ├── 001_initial_schema.sql
│   │   │   ├── 002_booking_tables.sql
│   │   │   └── 003_payment_tables.sql
│   │   └── functions/
│   │       ├── assign-driver/
│   │       ├── process-payment/
│   │       ├── calculate-fare/
│   │       └── trigger-sos/
│   └── seed/
│       └── seed.sql
├── docs/
│   ├── agent-handoffs/             # Agent collaboration docs
│   │   ├── phase1-ux.md
│   │   ├── phase2-ui.md
│   │   ├── phase3-frontend.md
│   │   └── phase4-backend.md
│   └── api-documentation.md
├── pnpm-workspace.yaml
├── package.json
└── .env.example
```

---

## 📁 INITIAL SETUP PROMPT

```bash
> Use the rapid-prototyper agent to create the initial monorepo structure. 
Create a pnpm workspace with three React Native Expo apps (customer, driver, biker) 
and shared packages (shared-ui, types, api-client). 
Set up the folder structure exactly as specified in /docs/agent-handoffs/structure.md. 
Install base dependencies: expo, react-native, typescript, nativewind, zustand, 
expo-router for each app. Create package.json files with proper workspace references. 
Save the complete setup log to /docs/agent-handoffs/initial-setup.md
```

---

## 🚀 PHASE 1: UX & Planning (Day 1)

### Agent Workflow
```bash
> First use the ux-researcher agent to analyze the three user personas and create 
detailed user journeys for each app. Focus on the booking flow for customers, 
the job acceptance flow for drivers, and the task management flow for bikers. 
Document pain points and opportunities. Save the research to 
/docs/agent-handoffs/phase1-ux-research.md

> Then use the sprint-prioritizer agent to create a feature priority matrix 
based on the UX research. Rank all features by implementation effort vs user value. 
Create a must-have list for MVP. Save priorities to 
/docs/agent-handoffs/phase1-priorities.md

> Next use the ux-researcher agent again to create detailed wireframes for 
each app's critical paths. For customer app: login → book ride → track → complete. 
For driver app: go online → accept → navigate → complete. 
For biker app: accept task → navigate → complete. 
Save wireframes descriptions to /docs/agent-handoffs/phase1-wireframes.md

> Finally use the experiment-tracker agent to define success metrics for each feature. 
Create measurement plans for booking conversion, driver acceptance rate, 
and biker response time. Save metrics to /docs/agent-handoffs/phase1-metrics.md
```

### Handoff Documentation
Create `/docs/agent-handoffs/phase1-complete.json`:
```json
{
  "phase": "UX & Planning",
  "completed": true,
  "outputs": {
    "user_journeys": "phase1-ux-research.md",
    "priorities": "phase1-priorities.md", 
    "wireframes": "phase1-wireframes.md",
    "metrics": "phase1-metrics.md"
  },
  "decisions": {
    "critical_paths": ["booking_flow", "driver_acceptance", "ride_tracking"],
    "mvp_features": ["basic_booking", "realtime_tracking", "stripe_payments"],
    "deferred_features": ["ai_monitoring", "video_playback"]
  }
}
```

---

## 🎨 PHASE 2: UI Design (Day 2)

### Agent Workflow
```bash
> Start by having the brand-guardian agent read /docs/agent-handoffs/phase1-wireframes.md 
and create a comprehensive design system for Chauffit. Define color palette 
(luxury blacks, golds), typography (clean, professional), spacing system, 
and component specifications. Focus on premium feel with high contrast for 
driver safety. Save to /packages/shared-ui/design-system.md

> Then use the ui-designer agent to read the design system and wireframes, 
then create detailed component designs for the customer app. Design these screens: 
login, home with map, ride type selection, driver selection cards, tracking view, 
payment screen. Export all component specifications to 
/apps/customer/components/designs.md

> Next use the ui-designer agent to design the driver app interfaces. 
Create designs for: online/offline toggle, incoming request modal, 
navigation view, earnings dashboard. Keep it minimal for driving safety. 
Save to /apps/driver/components/designs.md

> Use the ui-designer agent once more for biker app designs. Design: 
task list view, navigation screen, earnings tracker. Optimize for quick glances. 
Save to /apps/biker/components/designs.md

> Then use the visual-storyteller agent to create loading animations, 
success states, and error states for all three apps. Design smooth transitions 
and micro-interactions. Document in /packages/shared-ui/animations.md

> Finally use the whimsy-injector agent to add delightful touches: 
car arrival animation, successful booking celebration, 5-star rating animation. 
Keep it subtle and professional. Save to /packages/shared-ui/delights.md
```

### Handoff Documentation
Create `/docs/agent-handoffs/phase2-complete.json`:
```json
{
  "phase": "UI Design",
  "completed": true,
  "outputs": {
    "design_system": "/packages/shared-ui/design-system.md",
    "customer_designs": "/apps/customer/components/designs.md",
    "driver_designs": "/apps/driver/components/designs.md",
    "biker_designs": "/apps/biker/components/designs.md",
    "animations": "/packages/shared-ui/animations.md"
  },
  "design_tokens": {
    "colors": {
      "primary": "#FFD700",
      "secondary": "#1A1A1A", 
      "success": "#4CAF50",
      "danger": "#FF3B30"
    },
    "spacing": [4, 8, 12, 16, 24, 32, 48],
    "typography": {
      "headings": "SF Pro Display",
      "body": "SF Pro Text"
    }
  }
}
```

---

## 💻 PHASE 3: Frontend Development (Days 3-4)

### Agent Workflow
```bash
> Start with the frontend-developer agent. Read /docs/agent-handoffs/phase2-complete.json 
and /packages/shared-ui/design-system.md. Create the shared UI component library 
with NativeWind styling: Button, Input, Card, Modal, Map wrapper. 
Implement in /packages/shared-ui/src/. Each component should follow the design system exactly.

> Next use the mobile-app-builder agent to read all previous handoffs and 
implement the customer app authentication flow. Create login screen with phone input, 
OTP verification, and profile setup. Use Supabase Auth with phone OTP. 
Implement in /apps/customer/app/(auth)/ and create auth store in /apps/customer/stores/auth.store.ts

> Then use the mobile-app-builder agent to implement the customer app booking flow. 
Create screens for ride type selection, location picker with Google Maps, 
driver selection, and booking confirmation. Read the wireframes from phase 1. 
Save to /apps/customer/app/booking/ and create booking store.

> Use the frontend-developer agent to implement real-time ride tracking 
for customer app. Create the tracking screen with live map updates, 
driver location, ETA display, and SOS button. Use Supabase Realtime. 
Implement in /apps/customer/app/ride/tracking.tsx

> Switch to the mobile-app-builder agent to implement the complete driver app. 
Read driver designs and create: online/offline toggle, request acceptance flow, 
navigation integration, and trip management. Focus on large, easy-to-tap buttons. 
Implement all screens in /apps/driver/app/

> Use the mobile-app-builder agent again for the biker app. Implement task list, 
acceptance flow, and navigation. Keep it extremely simple and fast. 
Create all screens in /apps/biker/app/

> Then use the ai-engineer agent to integrate Stripe payment processing. 
Set up Stripe Connect for drivers/bikers, customer payment methods, 
and payment processing. Create payment service in /packages/api-client/src/payments.ts

> Finally use the test-writer-fixer agent to read all frontend code and create 
comprehensive tests for critical flows: booking creation, ride tracking, 
payment processing. Write tests for each app in their respective __tests__ folders.
```

### Handoff Documentation
Create `/docs/agent-handoffs/phase3-complete.json`:
```json
{
  "phase": "Frontend Development",
  "completed": true,
  "apps_status": {
    "customer": {
      "screens_completed": 15,
      "components_created": 23,
      "stores_implemented": ["auth", "booking", "ride", "payment"]
    },
    "driver": {
      "screens_completed": 10,
      "components_created": 15,
      "stores_implemented": ["auth", "availability", "trips", "earnings"]
    },
    "biker": {
      "screens_completed": 6,
      "components_created": 8,
      "stores_implemented": ["auth", "tasks", "earnings"]
    }
  },
  "integrations": {
    "google_maps": true,
    "stripe": true,
    "onesignal": false
  },
  "testing": {
    "unit_tests": 45,
    "integration_tests": 12
  }
}
```

---

## 🔧 PHASE 4: Backend Development (Days 5-6)

### Agent Workflow
```bash
> Begin with the backend-architect agent. Read all previous phases documentation 
and design the complete database schema for Supabase. Create tables for users, 
drivers, bikers, bookings, payments, amenities, bike_trips. Include proper 
indexes, foreign keys, and RLS policies. Write migrations in 
/backend/supabase/migrations/

> Next use the backend-architect agent to implement Supabase Edge Functions. 
Create functions for: assign-driver (finds nearest available), calculate-fare 
(dynamic pricing logic), process-payment (Stripe integration), trigger-sos 
(biker dispatch). Implement in /backend/supabase/functions/

> Then use the devops-automator agent to set up Supabase Realtime channels. 
Create channels for: booking-updates, driver-location, customer-notifications. 
Configure proper authentication and permissions. Document in 
/backend/supabase/realtime-config.md

> Use the backend-architect agent to implement the driver assignment algorithm. 
Consider proximity, driver rating, and availability. Create smart matching logic 
in /backend/supabase/functions/assign-driver/

> Switch to the ai-engineer agent to integrate OneSignal push notifications. 
Set up notification triggers for: booking confirmed, driver assigned, 
driver arrived, ride completed. Create notification service in 
/backend/supabase/functions/notifications/

> Use the api-tester agent to read all backend implementations and create 
comprehensive API tests. Test booking flow, payment processing, real-time updates. 
Create test suites in /backend/__tests__/

> Then use the performance-benchmarker agent to load test critical endpoints. 
Test concurrent bookings, driver assignments, and payment processing. 
Optimize any bottlenecks found. Save results to /docs/performance-report.md

> Finally use the devops-automator agent to create deployment configuration. 
Set up EAS build configs for all three apps, Supabase deployment scripts, 
and environment variable management. Create CI/CD pipeline configuration.
```

### Handoff Documentation
Create `/docs/agent-handoffs/phase4-complete.json`:
```json
{
  "phase": "Backend Development",
  "completed": true,
  "database": {
    "tables_created": 12,
    "migrations_count": 8,
    "rls_policies": 24
  },
  "edge_functions": [
    "assign-driver",
    "calculate-fare",
    "process-payment",
    "trigger-sos",
    "send-notification"
  ],
  "realtime_channels": [
    "booking-updates",
    "driver-location", 
    "customer-notifications"
  ],
  "integrations": {
    "stripe_connect": true,
    "onesignal": true,
    "google_maps_backend": true
  },
  "deployment": {
    "eas_configured": true,
    "supabase_deployed": true,
    "environment_variables": "configured"
  },
  "performance": {
    "concurrent_bookings_tested": 1000,
    "avg_response_time": "234ms",
    "optimization_complete": true
  }
}
```

---

## 🎯 FINAL SHIPPING CHECKLIST

### Agent Workflow for Final Review
```bash
> Use the project-shipper agent to read all phase completion files and verify 
the entire system is ready for launch. Check all features against the locked scope, 
verify all integrations work, and ensure no features were added beyond specification. 
Create launch readiness report at /docs/launch-ready.md

> Then use the legal-compliance-checker agent to review the apps for compliance 
with transportation regulations, payment processing requirements, and data privacy laws. 
Document any issues in /docs/compliance-check.md

> Finally use the studio-coach agent to create a handover document summarizing 
what was built, how to deploy it, and maintenance guidelines. Include all 
environment variables needed, deployment steps, and monitoring setup. 
Save to /docs/handover.md
```

---

## 🚫 STRICT RULES FOR ALL AGENTS

1. **NO SCOPE CREEP**: Do not add ANY features beyond the locked scope defined above
2. **FILE DISCIPLINE**: Always save outputs to specified locations
3. **READ HANDOFFS**: Always read previous phase outputs before starting
4. **UPDATE TRACKING**: Update phase completion JSON files after each phase
5. **TECH STACK**: Use ONLY the confirmed tech stack, no substitutions
6. **TESTING**: Every feature must have corresponding tests
7. **DOCUMENTATION**: Document every decision and implementation

## 🎯 Success Metrics

- All 3 apps functional with defined features
- Booking flow < 4 taps
- Driver assignment < 30 seconds
- Real-time tracking latency < 500ms
- Payment processing success rate > 99%
- Zero critical security vulnerabilities
- All features tested and documented