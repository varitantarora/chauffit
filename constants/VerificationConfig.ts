// Feature flags for document verification flows
// Set EXPO_PUBLIC_AADHAAR_OTP_ENABLED=true in .env to enable API-based Aadhaar OTP verification
// When false, Aadhaar is verified manually by admin after photo upload

export const AADHAAR_API_VERIFICATION_ENABLED =
  process.env.EXPO_PUBLIC_AADHAAR_OTP_ENABLED === 'true';
