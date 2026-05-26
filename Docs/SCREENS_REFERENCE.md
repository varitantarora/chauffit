# Chauffit - Screens Reference

Complete inventory of all screens organized by role. Route paths use Expo Router v6 file-based routing.

---

## Root

| Route | File | Purpose |
|---|---|---|
| `/` | `app/index.tsx` | Entry point — initializes auth, redirects by role |
| `/onboarding` | `app/onboarding.tsx` | First-run onboarding |

---

## Auth Screens (`app/(auth)/`)

| Route | File | Purpose |
|---|---|---|
| `/login` | `(auth)/login.tsx` | Main login screen (phone/email toggle) |
| `/phone-login` | `(auth)/phone-login.tsx` | Phone number login flow |
| `/email-login` | `(auth)/email-login.tsx` | Email/password login flow |
| `/signup` | `(auth)/signup.tsx` | New user registration |
| `/otp-verification` | `(auth)/otp-verification.tsx` | OTP verification for phone login |
| `/car-details` | `(auth)/car-details.tsx` | Add car during signup |
| `/delete-account` | `(auth)/delete-account.tsx` | Account deletion flow |

---

## Customer Screens (`app/(customer)/`)

### Tab Screens

| Route | File | Purpose |
|---|---|---|
| `/` (home) | `(tabs)/index.tsx` | Customer home — service selection |
| `/services` | `(tabs)/services.tsx` | Available services list |
| `/history` | `(tabs)/history.tsx` | Ride history |
| `/profile` | `(tabs)/profile.tsx` | Customer profile & settings |

### Booking Flow

| Route | File | Purpose |
|---|---|---|
| `/book-ride-new` | `book-ride-new.tsx` | Main booking screen (map + form) |
| `/booking/select-duration` | `booking/select-duration.tsx` | Duration selection |
| `/booking/select-chauffeur` | `booking/select-chauffeur.tsx` | Driver selection |
| `/booking/confirm` | `booking/confirm.tsx` | Booking confirmation |
| `/searching-drivers` | `searching-drivers.tsx` | Searching for available drivers |
| `/submit-request` | `submit-request.tsx` | Submit ride request |
| `/request-status` | `request-status.tsx` | Request status tracking |

### Ride Tracking

| Route | File | Purpose |
|---|---|---|
| `/ride-tracking` | `ride-tracking.tsx` | Live ride tracking (legacy) |
| `/ride/tracking` | `ride/tracking.tsx` | Live ride tracking (new) |
| `/ride/completed` | `ride/completed.tsx` | Ride completion screen |
| `/ride-confirmation` | `ride-confirmation.tsx` | Ride confirmed screen |
| `/ride-details` | `ride-details.tsx` | Past ride details |
| `/ride-search` | `ride-search.tsx` | Search for rides |
| `/trip-completion` | `trip-completion.tsx` | Trip summary + rating |
| `/rating-feedback` | `rating-feedback.tsx` | Rate driver & leave feedback |
| `/trip-insurance` | `trip-insurance.tsx` | Insurance selection for trip |

### Vehicle Management

| Route | File | Purpose |
|---|---|---|
| `/car-details` | `car-details.tsx` | View car details |
| `/car-create` | `car-create.tsx` | Add new vehicle |
| `/car-edit` | `car-edit.tsx` | Edit vehicle details |

### Scheduling

| Route | File | Purpose |
|---|---|---|
| `/schedule` | `schedule.tsx` | Schedule a ride |
| `/scheduled-rides` | `scheduled-rides.tsx` | View scheduled rides |
| `/favorites` | `favorites.tsx` | Saved locations |

### Payments & Wallet

| Route | File | Purpose |
|---|---|---|
| `/payment-methods` | `payment-methods.tsx` | Manage payment methods |
| `/wallet` | `wallet.tsx` | Wallet balance & top-up |
| `/transactions` | `transactions.tsx` | Transaction history |

### Other

| Route | File | Purpose |
|---|---|---|
| `/notifications` | `notifications.tsx` | Push notification list |
| `/edit-profile` | `edit-profile.tsx` | Edit profile details |
| `/support` | `support.tsx` | Customer support |
| `/faq` | `faq.tsx` | FAQ page |
| `/user-guides` | `user-guides.tsx` | How-to guides |
| `/terms-and-conditions` | `terms-and-conditions.tsx` | Legal |
| `/blog-list` | `blog-list.tsx` | Blog articles |
| `/blog-detail` | `blog-detail.tsx` | Blog article detail |

---

## Driver Screens (`app/(driver)/`)

### Tab Screens

| Route | File | Purpose |
|---|---|---|
| `/` (home) | `(tabs)/index.tsx` | Driver home — status, quick stats |
| `/requests` | `(tabs)/requests.tsx` | Incoming ride requests |
| `/earnings` | `(tabs)/earnings.tsx` | Earnings overview |
| `/profile` | `(tabs)/profile.tsx` | Driver profile & settings |

### Job Flow

| Route | File | Purpose |
|---|---|---|
| `/job/accept` | `job/accept.tsx` | Accept/reject ride request |
| `/job/active` | `job/active.tsx` | Active ride management |
| `/job/navigation` | `job/navigation.tsx` | Turn-by-turn navigation |
| `/job/otp-start` | `job/otp-start.tsx` | OTP verification to start ride |
| `/job/otp-complete` | `job/otp-complete.tsx` | OTP verification to end ride |
| `/job/completed` | `job/completed.tsx` | Ride completed summary |

### Onboarding

| Route | File | Purpose |
|---|---|---|
| `/onboarding/login` | `onboarding/login.tsx` | Driver onboarding login |
| `/onboarding/registration` | `onboarding/registration.tsx` | License, DOB, vehicle details |
| `/onboarding/documents` | `onboarding/documents.tsx` | Document upload |
| `/onboarding/background-check` | `onboarding/background-check.tsx` | Background check status |
| `/onboarding/training-scheduled` | `onboarding/training-scheduled.tsx` | Training session info |
| `/onboarding/training-failed` | `onboarding/training-failed.tsx` | Training failure screen |
| `/onboarding/onboarding-complete` | `onboarding/onboarding-complete.tsx` | Onboarding complete |

### Earnings

| Route | File | Purpose |
|---|---|---|
| `/earnings/detailed` | `earnings/detailed.tsx` | Detailed earnings breakdown |
| `/earnings/withdraw` | `earnings/withdraw.tsx` | Withdraw earnings |
| `/earnings/advance` | `earnings/advance.tsx` | Advance payment request |
| `/banking-details` | `banking-details.tsx` | Bank account setup |

### Other

| Route | File | Purpose |
|---|---|---|
| `/edit-profile` | `edit-profile.tsx` | Edit profile |
| `/emergency` | `emergency.tsx` | Emergency alert |
| `/notifications` | `notifications.tsx` | Notifications |
| `/notifications-center` | `notifications-center.tsx` | Notification settings |
| `/request-status` | `request-status.tsx` | Request status |
| `/submit-request` | `submit-request.tsx` | Submit request |
| `/training-certificate` | `training-certificate.tsx` | Training certificate view |
| `/support` | `support.tsx` | Support |
| `/faq` | `faq.tsx` | FAQ |
| `/user-guides` | `user-guides.tsx` | User guides |

---

## Biker Screens (`app/(biker)/`)

### Tab Screens

| Route | File | Purpose |
|---|---|---|
| `/` (home) | `(tabs)/index.tsx` | Biker home — tasks overview |
| `/deliveries` | `(tabs)/deliveries.tsx` | Delivery list |
| `/earnings` | `(tabs)/earnings.tsx` | Earnings overview |
| `/profile` | `(tabs)/profile.tsx` | Biker profile |

### Task Flow

| Route | File | Purpose |
|---|---|---|
| `/task/emergency` | `task/emergency.tsx` | Emergency task handling |
| `/task/delivery` | `task/delivery.tsx` | Delivery task |
| `/task/driver-pickup` | `task/driver-pickup.tsx` | Driver pickup task |
| `/task/[id]` | `task/[id].tsx` | Dynamic task detail |

### Request Flow

| Route | File | Purpose |
|---|---|---|
| `/request/single-pickup` | `request/single-pickup.tsx` | Single pickup request |
| `/request/batch-pickup` | `request/batch-pickup.tsx` | Batch pickup request |

### Navigation Flow

| Route | File | Purpose |
|---|---|---|
| `/navigation/en-route` | `navigation/en-route.tsx` | En route to destination |
| `/navigation/pickup-confirmation` | `navigation/pickup-confirmation.tsx` | Pickup confirmed |
| `/navigation/transporting` | `navigation/transporting.tsx` | Transporting item |
| `/navigation/batch-progress` | `navigation/batch-progress.tsx` | Batch delivery progress |

### Completion

| Route | File | Purpose |
|---|---|---|
| `/completion/dropoff-complete` | `completion/dropoff-complete.tsx` | Delivery completed |

### Onboarding

| Route | File | Purpose |
|---|---|---|
| `/onboarding/login` | `onboarding/login.tsx` | Biker onboarding login |
| `/onboarding/registration` | `onboarding/registration.tsx` | Registration form |
| `/onboarding/documents` | `onboarding/documents.tsx` | Document upload |
| `/onboarding/vehicle-registration` | `onboarding/vehicle-registration.tsx` | Vehicle details |
| `/onboarding/background-check` | `onboarding/background-check.tsx` | Background check |

### Other

| Route | File | Purpose |
|---|---|---|
| `/edit-profile` | `edit-profile.tsx` | Edit profile |
| `/analytics/performance` | `analytics/performance.tsx` | Performance analytics |

---

## Admin Screens (`app/(admin)/`)

### Tab Screens

| Route | File | Purpose |
|---|---|---|
| `/` (dashboard) | `(tabs)/index.tsx` | Admin dashboard |
| `/analytics` | `(tabs)/analytics.tsx` | Platform analytics |
| `/rides` | `(tabs)/rides.tsx` | Ride management |
| `/users` | `(tabs)/users.tsx` | User management |
| `/settings` | `(tabs)/settings.tsx` | Platform settings |
| `/profile` | `(tabs)/profile.tsx` | Admin profile |

### User Management

| Route | File | Purpose |
|---|---|---|
| `/user-detail` | `user-detail.tsx` | User detail view |
| `/all-drivers` | `all-drivers.tsx` | All drivers list |
| `/all-bikers` | `all-bikers.tsx` | All bikers list |
| `/drivers-pending` | `drivers-pending.tsx` | Pending driver approvals |
| `/bikers-pending` | `bikers-pending.tsx` | Pending biker approvals |
| `/driver-verification` | `driver-verification.tsx` | Driver verification flow |
| `/biker-verification` | `biker-verification.tsx` | Biker verification flow |

### Ride & Task Management

| Route | File | Purpose |
|---|---|---|
| `/ride-detail` | `ride-detail.tsx` | Ride detail view |
| `/tasks` | `tasks.tsx` | Task management |
| `/task-detail` | `task-detail.tsx` | Task detail view |

### Financial

| Route | File | Purpose |
|---|---|---|
| `/payments` | `payments.tsx` | Payment overview |
| `/payment-detail` | `payment-detail.tsx` | Payment detail |
| `/revenue` | `revenue.tsx` | Revenue analytics |
| `/pricing-settings` | `pricing-settings.tsx` | Pricing configuration |

### Configuration

| Route | File | Purpose |
|---|---|---|
| `/config-management` | `config-management.tsx` | App config management |
| `/insurance-management` | `insurance-management.tsx` | Insurance plans |
| `/amenities-management` | `amenities-management.tsx` | Service amenities |
| `/ads-management` | `ads-management.tsx` | Advertisement management |

### Disputes

| Route | File | Purpose |
|---|---|---|
| `/disputes` | `disputes.tsx` | Dispute list |
| `/dispute-detail` | `dispute-detail.tsx` | Dispute resolution |

### Training

| Route | File | Purpose |
|---|---|---|
| `/training-batches` | `training-batches.tsx` | Training batch list |
| `/training-batch-detail` | `training-batch-detail.tsx` | Batch detail & results |

---

## Screen Count Summary

| Role | Tab Screens | Detail/Flow Screens | Total |
|---|---|---|---|
| Auth | — | 7 | 7 |
| Customer | 4 | 32 | 36 |
| Driver | 4 | 22 | 26 |
| Biker | 4 | 16 | 20 |
| Admin | 6 | 24 | 30 |
| **Total** | **18** | **101** | **119** |
