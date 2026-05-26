# Chauffit - Deployment Guide

---

## Prerequisites

- Node.js 18+
- Android Studio with SDK 34+
- Java 17
- Expo CLI (`npx expo`)
- Keystore for release signing

---

## Android Build

### Version Management

Version configured in two locations — **both must be updated together**:

| File | Field | Purpose |
|---|---|---|
| `android/app/build.gradle` | `versionCode` | Incremental build number |
| `android/app/build.gradle` | `versionName` | Human-readable version (e.g., `1.0.4`) |
| `app.json` | `version` | Expo version (must match `versionName`) |
| `app.json` | `android.versionCode` | Must match Gradle `versionCode` |

Current version: **1.0.4** (versionCode: 5)

### Build AAB (Android App Bundle)

Use the `/build-aab` skill for automated version bump + build:

```bash
# Manual process:
# 1. Bump version in android/app/build.gradle
# 2. Bump version in app.json
# 3. Build
cd android && ./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Build APK (Debug)

```bash
cd android && ./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Build APK (Release)

```bash
cd android && ./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

---

## Signing Configuration

### Debug

Uses default Android debug keystore. No configuration needed.

### Release

**Keystore location:** `android/app/chauffit-release-key.jks`
**Config in:** `android/gradle.properties`

```properties
CHAUFFIT_RELEASE_STORE_FILE=chauffit-release-key.jks
CHAUFFIT_RELEASE_KEY_ALIAS=chauffit
CHAUFFIT_RELEASE_STORE_PASSWORD=*****
CHAUFFIT_RELEASE_KEY_PASSWORD=*****
```

### Generate New Keystore

```bash
keytool -genkey -v -keystore chauffit-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias chauffit
```

**Important:** Back up keystore file securely. Loss prevents app updates.

---

## Environment Configuration

### Production

```env
EXPO_PUBLIC_API_BASE_URL=https://api.chauffit.com/api/v1
EXPO_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
EXPO_PUBLIC_RAZORPAY_KEY_ID=prod_key_id
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=prod_maps_key
```

### Staging

```env
EXPO_PUBLIC_API_BASE_URL=http://54.234.146.195/api/v1
# ... staging keys
```

### Current Default API

`http://54.234.146.195/api/v1` — falls back from env var in `config/env.ts`

---

## Release Checklist

### Pre-Release

- [ ] Update `versionCode` in `android/app/build.gradle`
- [ ] Update `versionName` in `android/app/build.gradle`
- [ ] Update `version` in `app.json`
- [ ] Update `android.versionCode` in `app.json`
- [ ] Update `EXPO_PUBLIC_API_BASE_URL` for production
- [ ] Run `npx jest` — all tests pass
- [ ] Run `npx expo export --platform android` — no bundling errors
- [ ] Test on physical device (not just emulator)
- [ ] Verify all role flows work (customer, driver, biker, admin)
- [ ] Check dark mode rendering
- [ ] Test Hindi localization (`i18nStore`)
- [ ] Verify payment flow (Razorpay test mode)
- [ ] Test real-time features (Supabase connected)
- [ ] Check location permissions and GPS tracking
- [ ] Verify push notifications

### Build

- [ ] Clean previous build: `cd android && ./gradlew clean`
- [ ] Build AAB: `./gradlew bundleRelease`
- [ ] Verify AAB size is reasonable
- [ ] Test AAB on device via `bundletool`

### Upload

- [ ] Upload AAB to Google Play Console
- [ ] Fill release notes
- [ ] Set rollout percentage (start with 10%)
- [ ] Submit for review

### Post-Release

- [ ] Tag release in git: `git tag v1.0.4`
- [ ] Push tag: `git push origin v1.0.4`
- [ ] Monitor crash reports
- [ ] Monitor API error rates
- [ ] Check real-time connection stability

---

## Android SDK Versions

| Config | Value | Notes |
|---|---|---|
| `minSdk` | 23 | Android 6.0 Marshmallow |
| `targetSdk` | 34 | Android 14 |
| `compileSdk` | 34 | Android 14 |

---

## Build Optimizations

Release build enables:
- **R8/ProGuard** — code shrinking and obfuscation
- **Resource shrinking** — removes unused resources
- **PNG crunching** — compresses images
- **Bundle compression** — smaller AAB output

### ProGuard Rules

Custom rules in `android/app/proguard-rules.pro`:
- Keep Razorpay SDK classes
- Keep Supabase models
- Keep React Native bridge classes
- Keep Gson serialization models

---

## iOS Build (Future)

iOS build not yet configured. Steps when ready:

1. Configure signing in Xcode (Apple Developer account needed)
2. Set bundle identifier
3. Configure capabilities (location, push notifications)
4. Archive and upload via Xcode or Transporter
5. Submit for App Store review

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Gradle sync failed | Check `org.gradle.java.home` points to JDK 17 |
| Build OOM | Add `org.gradle.jvmargs=-Xmx4096m` to `gradle.properties` |
| Razorpay build error | Verify manual integration in `android/app/libs/` |
| Signing error | Verify keystore path and passwords in `gradle.properties` |
| Version mismatch | Ensure `app.json` and `build.gradle` versions match |
| Native module error | Run `cd android && ./gradlew clean` and rebuild |
