# Customer App Wireframes: Complete Screen Layouts

## 1. Onboarding & Authentication

### Welcome/Intro Slides
```
┌─────────────────────────────────────┐
│              CHAUFFIT               │
│         [Luxury Car Icon]           │
│                                     │
│    Professional Chauffeur Service   │
│                                     │
│ • Your car, our expert chauffeurs   │
│ • Professional, licensed drivers    │
│ • Available 24/7 across the city    │
│                                     │
│         [Slide Indicators]          │
│                                     │
│                Skip    Next         │
└─────────────────────────────────────┘
```

### Sign-Up/Log-In Screen
```
┌─────────────────────────────────────┐
│              CHAUFFIT               │
│         [Luxury Car Icon]           │
│                                     │
│    Professional Chauffeur Service   │
│                                     │
│ Language Toggle:    EN | हि         │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 📱 Continue with Phone          │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 📧 Continue with Email          │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 🍎 Continue with Apple          │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 📱 Continue with Google         │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 📘 Continue with Facebook       │ │
│  └─────────────────────────────────┘ │
│                                     │
│  Already have an account? Login     │
│                                     │
│  [Face ID/Touch ID Icon] Available  │
└─────────────────────────────────────┘
```

### Login Screen (Returning Users)
```
┌─────────────────────────────────────┐
│              CHAUFFIT               │
│         [Luxury Car Icon]           │
│                                     │
│    Welcome back!                    │
│                                     │
│ Language Toggle:    EN | हि         │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ Phone Number / Email            │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ Password                        │ │
│  └─────────────────────────────────┘ │
│                                     │
│  [ Remember Me ]    [Forgot Pass?]  │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │           LOGIN                 │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ─────────── OR ───────────         │
│                                     │
│  [🍎 Sign in with Apple]            │
│  [📱 Continue with Google]          │
│  [📘 Continue with Facebook]        │
│                                     │
│  Don't have an account? Sign Up     │
│                                     │
│  [Face ID/Touch ID Icon] Available  │
└─────────────────────────────────────┘
```

### OTP Verification Screen
```
┌─────────────────────────────────────┐
│  ← Back      Verify OTP             │
│                                     │
│     We've sent a verification       │
│     code to +91 9876543210          │
│                                     │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐│
│  │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 ││
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘│
│                                     │
│  ┌─────────────────────────────────┐ │
│  │         VERIFY OTP              │ │
│  └─────────────────────────────────┘ │
│                                     │
│      Didn't receive code?           │
│     Resend in 00:45 seconds         │
│                                     │
│        [Resend OTP]                 │
│                                     │
│     [Change Phone Number]           │
└─────────────────────────────────────┘
```

## 2. Add Vehicle (New Screen - Post Sign-Up)

### Add Your Vehicle Screen
```
┌─────────────────────────────────────┐
│  ← Back  Let's Get Your Car Details │
│                                 1/2 │
│                                     │
│ Add your vehicle to start booking   │
│ chauffeurs for professional service.│
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ Vehicle Make        [Dropdown] ▼│ │
│  │ BMW, Mercedes, Audi, Toyota...  │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ Vehicle Model       [Dropdown] ▼│ │
│  │ X5, E-Class, A6, Camry...       │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ Year                [Picker] ▼  │ │
│  │ 2024, 2023, 2022, 2021...       │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ License Plate Number            │ │
│  │ MH12AB1234                      │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ Color                           │ │
│  │ Black                           │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │      🚗 Save Vehicle            │ │
│  └─────────────────────────────────┘ │
│                                     │
│         [Skip for Now]              │
└─────────────────────────────────────┘
```

### Vehicle Photos & Features
```
┌─────────────────────────────────────┐
│  ← Back    Vehicle Details      2/2 │
│                                     │
│ Add photos and special features     │
│ for better driver matching.         │
│                                     │
│ 📷 VEHICLE PHOTOS                   │
│ ┌─────────────────────────────────┐ │
│ │     [📷 Front View]             │ │
│ │     [📷 Side View]              │ │
│ │     [📷 Interior]               │ │
│ │     [📷 Dashboard]              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 🎯 SPECIAL FEATURES                 │
│ [ ] Sunroof / Moonroof              │
│ [ ] Premium Audio System            │
│ [ ] Leather Seats                   │
│ [ ] Navigation System               │
│ [ ] Automatic Transmission          │
│ [ ] Keyless Entry                   │
│ [ ] Parking Sensors                 │
│ [ ] Reverse Camera                  │
│                                     │
│ 🚘 VEHICLE TYPE                     │
│ ( ) Luxury        ( ) Standard      │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │        COMPLETE SETUP           │ │
│  └─────────────────────────────────┘ │
│                                     │
│         [Skip for Now]              │
└─────────────────────────────────────┘
```

## 3. Home/Booking Screen

### Main Dashboard
```
┌─────────────────────────────────────┐
│ 🏠 📍 🔔 💳         [Profile Pic] S  │
│                                     │
│ Good morning, Sarah                 │
│ Beautiful day for a drive ☀️        │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │    🚗 BOOK A CHAUFFEUR          │ │
│ │                                 │ │
│ │  From: 📍 Current Location      │ │
│ │        [Change Location]        │ │
│ │                                 │ │
│ │  To:   🎯 Select destination    │ │
│ │        [Set Destination]        │ │
│ │                                 │ │
│ │  Vehicle: BMW X5 (Primary)      │ │
│ │          [Change Vehicle]       │ │
│ │                                 │ │
│ │  When: Now        [Schedule]    │ │
│ │                                 │ │
│ │  Type: ○ One-way ○ Round-trip   │ │
│ │        ○ Hourly Flexi-Hire      │ │
│ │                                 │ │
│ │  ┌─────────────────────────────┐ │ │
│ │  │        BOOK NOW             │ │ │
│ │  └─────────────────────────────┘ │ │
│ │                                 │ │
│ │  [+ Add Stop(s)]                │ │
│ │  [🎯 Choose Amenities]          │ │
│ │  [₹ Fare Estimate: ~₹75]        │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ⚠ Surge Pricing Active - 1.3x      │
│                                     │
│ Quick Actions:                      │
│ [🏠 Home] [🏢 Work] [✈️ Airport]     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📅 UPCOMING RIDES               │ │
│ │                                 │ │
│ │ Tomorrow 8:00 AM                │ │
│ │ Home → Downtown Office          │ │
│ │ BMW X5 • Marcus R. (4.9⭐)      │ │
│ │                         [Edit]  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Recent Activity                     │
│ Yesterday • Home → Airport • ₹850   │
│ Monday • Work → Restaurant • ₹450   │
│                             [More]  │
└─────────────────────────────────────┘
```

## 4. Amenities Selection Popup

### Choose Amenities Screen
```
┌─────────────────────────────────────┐
│  ✕          Choose Amenities        │
│                                     │
│ Enhance your ride experience        │
│                                     │
│ 💧 REFRESHMENTS                     │
│ ┌─────────────────────────────────┐ │
│ │ [✓] Water Bottle          +₹10  │ │
│ │ [ ] Cold Drinks           +₹25  │ │
│ │ [ ] Snacks/Chips          +₹30  │ │
│ │ [ ] Fresh Fruits          +₹40  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 🧻 COMFORT                          │
│ ┌─────────────────────────────────┐ │
│ │ [✓] Tissues               +₹5   │ │
│ │ [ ] Hand Sanitizer        +₹10  │ │
│ │ [ ] Wet Wipes             +₹15  │ │
│ │ [ ] Phone Charger         +₹20  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 🌿 AROMATHERAPY                     │
│ ┌─────────────────────────────────┐ │
│ │ [ ] Lavender Scent        +₹25  │ │
│ │ [ ] Citrus Fresh          +₹25  │ │
│ │ [ ] No Fragrance          Free  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 🎵 ENTERTAINMENT                    │
│ ┌─────────────────────────────────┐ │
│ │ [ ] Spotify Premium       +₹30  │ │
│ │ [ ] Bluetooth Audio       Free  │ │
│ │ [ ] Newspaper/Magazine    +₹20  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Total Add-ons: +₹15                 │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │       Save Preferences          │ │
│ └─────────────────────────────────┘ │
│                                     │
│        [Save as Default]            │
└─────────────────────────────────────┘
```

## 5. Ride Confirmation / Fare Summary

### Booking Confirmation Screen
```
┌─────────────────────────────────────┐
│  ← Back    Confirm Booking          │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │           TRIP DETAILS          │ │
│ │                                 │ │
│ │ From: 📍 Home                   │ │
│ │       123 Main St, Palo Alto    │ │
│ │                                 │ │
│ │ To:   🏢 Downtown Office        │ │
│ │       456 Market St, SF         │ │
│ │                                 │ │
│ │ Stops: 1 stop added             │ │
│ │        🏪 Coffee Shop           │ │
│ │                                 │ │
│ │ When: Today, 2:30 PM            │ │
│ │ Type: One-way                   │ │
│ │ Duration: ~45 minutes           │ │
│ │ Distance: ~35 miles             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │        DRIVER & VEHICLE         │ │
│ │                                 │ │
│ │ [👤] Marcus Rodriguez (⭐ 4.9)   │ │
│ │      Professional Chauffeur     │ │
│ │      8 years experience         │ │
│ │                                 │ │
│ │ 🚗 Your BMW X5 (2022)           │ │
│ │    Black • License: ABC123      │ │
│ │                                 │ │
│ │ Driver Preference:              │ │
│ │ ○ Luxury   ● Standard           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │         PAYMENT SUMMARY         │ │
│ │                                 │ │
│ │ Base fare:           ₹650.00    │ │
│ │ Distance charge:     ₹120.00    │ │
│ │ Time charge:         ₹45.00     │ │
│ │ Stop fee:            ₹25.00     │ │
│ │ Surge (1.3x):        ₹252.00    │ │
│ │ Amenities:           ₹15.00     │ │
│ │ Service fee:         ₹35.00     │ │
│ │ ─────────────────────────────   │ │
│ │ Subtotal:           ₹1,142.00   │ │
│ │ Taxes (18%):         ₹205.56    │ │
│ │ ─────────────────────────────   │ │
│ │ Total:              ₹1,347.56   │ │
│ │                                 │ │
│ │ 💳 Visa ****1234    [Change]    │ │
│ │ Estimated Time: 15 min          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │      CONFIRM BOOKING            │ │
│ └─────────────────────────────────┘ │
│                                     │
│         [Cancel]                    │
└─────────────────────────────────────┘
```

## 6. Live Trip & Tracking

### Pre-Ride Driver En Route
```
┌─────────────────────────────────────┐
│  ← Back    Driver En Route      ⋮   │
│                                     │
│        Driver arriving in           │
│           ⏰ 18 minutes              │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │           [MAP VIEW]            │ │
│ │                                 │ │
│ │    🏠 Your Location             │ │
│ │     ↓                           │ │
│ │     • • • • • • •               │ │
│ │     ↓                           │ │
│ │    🚗 Marcus (Driver)           │ │
│ │                                 │ │
│ │    📍 Your BMW X5 Location      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Marcus is being transported by  │ │
│ │ Alex (Biker) to your vehicle    │ │
│ │                                 │ │
│ │ 🏍️ Alex • ⭐ 4.8               │ │
│ │    ETA: 15 min to your car      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [👤] Marcus Rodriguez           │ │
│ │      📞 Call    💬 Message      │ │
│ │      ⭐ 4.9 • 8 years exp       │ │
│ │                                 │ │
│ │ Your BMW X5 • ABC123            │ │
│ │ Parked at: Home garage          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 🔒 Share Trip with Contact          │
│ ⚠️  SOS Button                      │
│ 📞 Emergency Assistance             │
│                                     │
│ [Report Issue]    [Cancel Ride]     │
└─────────────────────────────────────┘
```

### Active Ride Screen
```
┌─────────────────────────────────────┐
│      Your ride is in progress   ⋮   │
│                                     │
│        Arriving in                  │
│        ⏰ 32 minutes                 │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │           [MAP VIEW]            │ │
│ │                                 │ │
│ │    📍 Current Location          │ │
│ │     ↓                           │ │
│ │     🚗 BMW X5                   │ │
│ │     ↓                           │ │
│ │     • • • • • • •               │ │
│ │     ↓                           │ │
│ │    🏢 Destination               │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Marcus Rodriguez                │ │
│ │ 📞 Call    💬 Message           │ │
│ │                                 │ │
│ │ "Taking 101 to avoid traffic    │ │
│ │  on 280. ETA updated."          │ │
│ │                            2 min│ │
│ └─────────────────────────────────┘ │
│                                     │
│ Trip Details:                       │
│ Started: 2:35 PM                    │
│ Route: Via US-101 N                 │
│ Speed: 65 mph                       │
│                                     │
│ 🔒 Sharing location with Emma       │
│ ⚠️  SOS Button                      │
│ 📞 Emergency assistance             │
│                                     │
│ [ Contact Driver ] [ Report Issue ] │
│                                     │
│ 🎵 For Flexi-Hire: [End Trip]      │
└─────────────────────────────────────┘
```

### SOS Emergency Screen
```
┌─────────────────────────────────────┐
│  ✕          EMERGENCY SOS           │
│                                     │
│        🚨 IMMEDIATE HELP            │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │     📞 CALL EMERGENCY           │ │
│ │        (Police: 100)            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │     🏥 MEDICAL EMERGENCY        │ │
│ │        (Ambulance: 108)         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │     🔥 FIRE EMERGENCY           │ │
│ │        (Fire: 101)              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │     📞 CHAUFFIT SUPPORT         │ │
│ │        (24/7 Hotline)           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 📍 Your location is being shared    │
│ with emergency contacts:            │
│ • Emma Chen (Wife)                  │
│ • John Chen (Brother)               │
│                                     │
│ Trip details automatically sent to  │
│ emergency services and Chauffit.    │
│                                     │
│         [I'm Safe Now]              │
└─────────────────────────────────────┘
```

### Share Trip Screen
```
┌─────────────────────────────────────┐
│  ✕          Share Trip              │
│                                     │
│ Share your ride details with        │
│ friends and family for safety       │
│                                     │
│ 📱 EMERGENCY CONTACTS               │
│ ┌─────────────────────────────────┐ │
│ │ [✓] Emma Chen (Wife)            │ │
│ │     +91 9876543210              │ │
│ │                                 │ │
│ │ [ ] John Chen (Brother)         │ │
│ │     +91 9876543211              │ │
│ │                                 │ │
│ │ [ ] Sarah Wilson (Friend)       │ │
│ │     +91 9876543212              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 💬 SHARE OPTIONS                    │
│ ┌─────────────────────────────────┐ │
│ │ [📱] Send SMS                   │ │
│ │ [📧] Send Email                 │ │
│ │ [📱] WhatsApp                   │ │
│ │ [📘] Share via Link             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ℹ️ WHAT'S SHARED:                   │
│ • Real-time location                │
│ • Driver details                    │
│ • Vehicle information               │
│ • Estimated arrival time            │
│ • Emergency contact info            │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │        Start Sharing            │ │
│ └─────────────────────────────────┘ │
│                                     │
│         [Cancel]                    │
└─────────────────────────────────────┘
```

## 7. Post-Ride Summary

### Trip Completion Screen
```
┌─────────────────────────────────────┐
│              Trip Complete          │
│                                     │
│            🎉 Thank you!            │
│        You've arrived safely        │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │         TRIP SUMMARY            │ │
│ │                                 │ │
│ │ From: 📍 Home                   │ │
│ │ To:   🏢 Downtown Office        │ │
│ │ Stop: 🏪 Coffee Shop            │ │
│ │                                 │ │
│ │ Duration: 47 minutes            │ │
│ │ Distance: 34.2 miles            │ │
│ │ Started: 2:35 PM                │ │
│ │ Ended: 3:22 PM                  │ │
│ │                                 │ │
│ │ Driver: Marcus Rodriguez        │ │
│ │ Vehicle: Your BMW X5            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │        PAYMENT DETAILS          │ │
│ │                                 │ │
│ │ Trip fare:          ₹1,347.56   │ │
│ │ Add Tip:                        │ │
│ │ ○ ₹0  ○ ₹50  ● ₹100  ○ ₹150    │ │
│ │ [Custom Amount: ₹___]           │ │
│ │ ─────────────────────────────   │ │
│ │ Total paid:         ₹1,447.56   │ │
│ │                                 │ │
│ │ 💳 Visa ****1234               │ │
│ │ Receipt sent to email           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Rate your experience:               │
│ ⭐ ⭐ ⭐ ⭐ ⭐                        │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │      Submit Review              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │         BOOK RETURN TRIP        │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [📧 Download Invoice] [🔄 Book Again]│
└─────────────────────────────────────┘
```

### Rating & Feedback Screen
```
┌─────────────────────────────────────┐
│  ← Back    Rate Your Experience     │
│                                     │
│ How was your ride with Marcus?      │
│                                     │
│ OVERALL EXPERIENCE                  │
│ ⭐ ⭐ ⭐ ⭐ ⭐                        │
│                                     │
│ What went well? (Optional)          │
│                                     │
│ DRIVER PERFORMANCE                  │
│ [✓ Professional] [✓ On time]       │
│ [✓ Smooth ride]  [  Friendly]      │
│ [✓ Clean appearance] [  Helpful]   │
│ [  Courteous]    [  Safe driving]  │
│                                     │
│ VEHICLE CONDITION                   │
│ Rate your BMW X5: ⭐ ⭐ ⭐ ⭐ ⭐      │
│                                     │
│ Any issues?                         │
│ [  Low fuel]     [  Damage]        │
│ [  Cleanliness]  [  Maintenance]   │
│ [  Other issues]                   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Text Feedback (optional)        │ │
│ │                                 │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [📷 Upload photo (optional)]        │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │        SUBMIT REVIEW            │ │
│ └─────────────────────────────────┘ │
│                                     │
│         [Report an Issue]           │
│         [Skip for now]              │
└─────────────────────────────────────┘
```

## 8. Scheduled Rides

### Scheduled Rides Screen
```
┌─────────────────────────────────────┐
│  ← Back    Scheduled Rides      ⋮   │
│                                     │
│ [Upcoming] [History]                │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  📅 Tomorrow • 8:00 AM          │ │
│ │                                 │ │
│ │  🏠 Home → 🏢 Downtown Office   │ │
│ │  BMW X5 • Marcus R. (⭐ 4.9)    │ │
│ │                                 │ │
│ │  Est. ₹650 • 45 minutes         │ │
│ │  One-way • No stops             │ │
│ │                                 │ │
│ │  Status: Confirmed              │ │
│ │                                 │ │
│ │  [Edit] [Cancel] [View Details] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  📅 Friday • 6:30 PM            │ │
│ │                                 │ │
│ │  🏢 Office → ✈️ Airport         │ │
│ │  Tesla Model S • Jennifer L.    │ │
│ │                                 │ │
│ │  Est. ₹1,200 • 60 minutes       │ │
│ │  One-way • 1 stop (Hotel)       │ │
│ │                                 │ │
│ │  Status: Driver assigned        │ │
│ │                                 │ │
│ │  [Edit] [Cancel] [View Details] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  📅 Saturday • 2:00 PM          │ │
│ │                                 │ │
│ │  🏠 Home ↔️ 🍽️ Restaurant       │ │
│ │  BMW X5 • TBD                   │ │
│ │                                 │ │
│ │  Est. ₹800 • Round-trip         │ │
│ │  Wait time: 2 hours             │ │
│ │                                 │ │
│ │  Status: Pending driver         │ │
│ │                                 │ │
│ │  [Edit] [Cancel] [View Details] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [+ Schedule New Ride]               │
└─────────────────────────────────────┘
```

## 9. Wallet & Payments

### Wallet & Payment Methods
```
┌─────────────────────────────────────┐
│  ← Back        Wallet           ⋮   │
│                                     │
│ 💰 WALLET BALANCE                   │
│ ┌─────────────────────────────────┐ │
│ │         ₹1,250.00               │ │
│ │                                 │ │
│ │ [+ Add Money] [↗️ Withdraw]      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 💳 PAYMENT METHODS                  │
│ ┌─────────────────────────────────┐ │
│ │ [💳] Visa ****1234 (Default)   │ │
│ │      Expires: 12/26             │ │
│ │                        [Remove] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [💳] Mastercard ****5678        │ │
│ │      Expires: 08/25             │ │
│ │                        [Remove] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [📱] UPI: sarah@okicici         │ │
│ │      Linked to ICICI Bank       │ │
│ │                        [Remove] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [💵] Cash Payment               │ │
│ │      Pay driver directly        │ │
│ │                     [Available] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [+ Add New Payment Method]          │
│                                     │
│ 📊 RECENT TRANSACTIONS              │
│ Today • Trip to Office • -₹650     │
│ Yesterday • Wallet topup • +₹1,000  │
│ 2 days ago • Airport trip • -₹1,200│
│                             [More]  │
│                                     │
│ [Set Default Payment] [Pay Now]     │
│ [View All Transactions]             │
└─────────────────────────────────────┘
```

## 10. Profile & Settings

### Profile Screen
```
┌─────────────────────────────────────┐
│  ← Back        Profile           ⋮   │
│                                     │
│        [👤 Profile Photo]           │
│           Sarah Chen                │
│      sarah.chen@email.com          │
│         Member since 2024           │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │    ⭐ 4.9 Rating • Gold Member  │ │
│ │         127 trips completed     │ │
│ │         ₹45,000 total spent     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 🚗 MY VEHICLES                      │
│ ┌─────────────────────────────────┐ │
│ │ [🚗] 2022 BMW X5 (Primary)     │ │
│ │      Black • ABC123             │ │
│ │      [Edit] [Delete] [Primary]  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [🚗] 2021 Tesla Model S        │ │
│ │      Red • DEF456               │ │
│ │      [Edit] [Delete] [Primary]  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [➕ Add Another Vehicle]            │
│                                     │
│ ⚙️  ACCOUNT SETTINGS                │
│ 📍 Saved Addresses                  │
│ 💳 Payment Methods                  │
│ 🔔 Notifications                    │
│ 🛡️  Safety & Privacy               │
│ 📞 Emergency Contacts               │
│ 🎯 Ride Preferences                 │
│ 📊 Trip History                     │
│ 🏆 Loyalty Status                   │
│ 🌐 Language Settings                │
│ 💬 Help & Support                   │
│                                     │
│ [Sign Out]                          │
└─────────────────────────────────────┘
```

### My Vehicles Section
```
┌─────────────────────────────────────┐
│  ← Back     My Vehicles          ⋮  │
│                                     │
│ Manage your registered vehicles     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [🚗] 2022 BMW X5                │ │
│ │                                 │ │
│ │ Color: Black                    │ │
│ │ License: MH12AB1234             │ │
│ │ Status: ✅ Primary Vehicle      │ │
│ │                                 │ │
│ │ Features:                       │
│ │ • Sunroof • Premium Audio      │ │
│ │ • Leather Seats • Navigation   │ │
│ │                                 │ │
│ │ [Edit] [Set Primary] [Delete]   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [🚗] 2021 Tesla Model S         │ │
│ │                                 │ │
│ │ Color: Red                      │ │
│ │ License: MH12CD5678             │ │
│ │ Status: Secondary               │ │
│ │                                 │ │
│ │ Features:                       │ │
│ │ • Electric • Autopilot         │ │
│ │ • Premium Interior              │ │
│ │                                 │ │
│ │ [Edit] [Set Primary] [Delete]   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │      + Add Another Vehicle      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ℹ️ You can register up to 3 vehicles│
│ per account. Primary vehicle is     │
│ selected by default for bookings.   │
│                                     │
│ [Save Changes]                      │
└─────────────────────────────────────┘
```

## 11. Help & Support

### Help & Support Center
```
┌─────────────────────────────────────┐
│  ← Back    Help & Support        ⋮  │
│                                     │
│ How can we help you today?          │
│                                     │
│ 🔍 QUICK SEARCH                     │
│ ┌─────────────────────────────────┐ │
│ │ Search FAQs, issues, topics...  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 💬 CONTACT SUPPORT                  │
│ ┌─────────────────────────────────┐ │
│ │     📞 24/7 Chat Support        │ │
│ │     Average wait: 2 minutes     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │     📞 Call Us                  │ │
│ │     1800-123-CHAUFFIT           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 📚 BROWSE FAQS                      │
│ ┌─────────────────────────────────┐ │
│ │ • Booking & Cancellation       │ │
│ │ • Payments & Billing            │ │
│ │ • Driver & Vehicle Issues       │ │
│ │ • Safety & Security             │ │
│ │ • Account Management            │ │
│ │ • Emergency Situations          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 🚨 REPORT AN ISSUE                  │
│ ┌─────────────────────────────────┐ │
│ │ • Report Safety Issue           │ │
│ │ • Driver Behavior               │ │
│ │ • Vehicle Problems              │ │
│ │ • Billing Dispute               │ │
│ │ • Lost Items                    │ │
│ │ • Technical Issues              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 📱 EMERGENCY ASSISTANCE             │
│ For immediate help during rides     │
│ ⚠️ Use SOS button in active ride    │
│ 📞 Emergency: 1800-911-HELP         │
└─────────────────────────────────────┘
```

### Report Issue Screen
```
┌─────────────────────────────────────┐
│  ← Back     Report an Issue         │
│                                     │
│ What issue would you like to report?│
│                                     │
│ 🚗 RIDE-RELATED ISSUES              │
│ ┌─────────────────────────────────┐ │
│ │ [ ] Driver was late/no-show     │ │
│ │ [ ] Unprofessional behavior     │ │
│ │ [ ] Vehicle condition poor      │ │
│ │ [ ] Route/navigation issues     │ │
│ │ [ ] Overcharging/billing error  │ │
│ │ [ ] Lost item in vehicle        │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 🔒 SAFETY CONCERNS                  │
│ ┌─────────────────────────────────┐ │
│ │ [ ] Unsafe driving              │ │
│ │ [ ] Inappropriate behavior      │ │
│ │ [ ] Vehicle safety issues       │ │
│ │ [ ] Emergency situation         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 📱 APP/TECHNICAL ISSUES             │
│ ┌─────────────────────────────────┐ │
│ │ [ ] App not working properly    │ │
│ │ [ ] Payment issues              │ │
│ │ [ ] GPS/location problems       │ │
│ │ [ ] Notification issues         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 📝 DESCRIBE THE ISSUE               │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 📅 When did this occur?             │
│ [📅 Select Date & Time]             │
│                                     │
│ 🔢 Trip ID (if applicable):         │
│ [Enter Trip ID]                     │
│                                     │
│ [📷 Add Photos/Screenshots]         │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │        Submit Report            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

This comprehensive wireframe set includes all the screens, buttons, and functions you specified for the Customer App, with proper ₹ currency symbols throughout and detailed user flows for each major feature.