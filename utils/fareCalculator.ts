/**
 * Fare Calculation Utility
 * Aligned with Chauffit PDF pricing model (Standard/Executive tiers).
 * This is a client-side estimate; the backend is authoritative.
 */

export type ServiceTier = 'STANDARD' | 'EXECUTIVE';
export type TripType = 'one_way' | 'round_trip' | 'hourly' | 'multi_stop';

// Deprecated: kept for backward compat
export type VehicleSegment = 'HATCHBACK' | 'MICRO_SUV' | 'MID_SUV' | 'SEDAN' | 'FULL_SUV' | 'LUXURY';
export type FareMode = 'PER_KM' | 'PER_MIN' | 'HOURLY_HIRE';

// ── Pricing Configuration (from PDF) ──

const PRICING = {
  PER_KM: {
    STANDARD: { base: 99, tiers: [{ upTo: 15, rate: 12 }, { upTo: 30, rate: 10 }, { upTo: null, rate: 8 }] },
    EXECUTIVE: { base: 149, tiers: [{ upTo: 15, rate: 14 }, { upTo: 30, rate: 12 }, { upTo: null, rate: 10 }] },
  },
  PER_MIN: {
    STANDARD: { base: 99, per_min: 7 },
    EXECUTIVE: { base: 149, per_min: 8 },
  },
  MINIMUM_FARE: {
    STANDARD: 249,
    EXECUTIVE: 349,
  },
  BOOKING_FEE: 19,
};

export const HOURLY_PACKAGES = {
  STANDARD: [
    { hours: 2, price: 399 },
    { hours: 4, price: 699 },
    { hours: 6, price: 999 },
    { hours: 8, price: 1299 },
  ],
  EXECUTIVE: [
    { hours: 2, price: 549 },
    { hours: 4, price: 949 },
    { hours: 6, price: 1399 },
    { hours: 8, price: 1799 },
  ],
};

export const STOP_FEES = {
  STANDARD: { perStop: 39, freeWaitMinutes: 5, waitPerMin: 7 },
  EXECUTIVE: { perStop: 59, freeWaitMinutes: 5, waitPerMin: 9 },
};

export const OVERTIME_RATES = {
  STANDARD: 9,  // ₹/min
  EXECUTIVE: 12,
};

export const RELOCATION_FEES = {
  STANDARD: { base: 99, perKm: 8, cap: 399 },
  EXECUTIVE: { base: 99, perKm: 9, cap: 499 },
};

// Surge multipliers
const SURGE = {
  NIGHT: 1.09,
  TRAFFIC: { min: 1.10, max: 1.50 },
  HOURLY: 1.20,
};

// Deprecated: Map customer vehicle types to tiers
export function mapVehicleTypeToSegment(vehicleType: string): VehicleSegment {
  const typeMap: Record<string, VehicleSegment> = {
    'luxury_sedan': 'LUXURY',
    'executive_suv': 'FULL_SUV',
    'limousine': 'LUXURY',
    'mercedes_sprinter': 'FULL_SUV',
  };
  return typeMap[vehicleType] || 'SEDAN';
}

// Check if night time (10 PM to 6 AM)
function isNightTime(date: Date): boolean {
  const hour = date.getHours();
  return hour >= 22 || hour < 6;
}

// Get surge multiplier based on time
function getSurgeMultiplier(date: Date): number {
  let multiplier = 1.0;
  if (isNightTime(date)) {
    multiplier = Math.max(multiplier, SURGE.NIGHT);
  }
  return multiplier;
}

// Calculate tiered distance fare
function calculateTieredDistanceFare(distanceKm: number, tier: ServiceTier): number {
  const config = PRICING.PER_KM[tier];
  let totalFare = 0;
  let remaining = distanceKm;
  let prevUpper = 0;

  for (const t of config.tiers) {
    if (remaining <= 0) break;
    if (t.upTo === null) {
      totalFare += remaining * t.rate;
      remaining = 0;
    } else {
      const capacity = t.upTo - prevUpper;
      const kmInTier = Math.min(remaining, capacity);
      totalFare += kmInTier * t.rate;
      remaining -= kmInTier;
      prevUpper = t.upTo;
    }
  }

  return totalFare;
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate estimated duration (30 km/h average city speed)
export function calculateDuration(distanceKm: number): number {
  const avgSpeedKmH = 30;
  return Math.round((distanceKm / avgSpeedKmH) * 60);
}

// Calculate fare using service tier
export function calculateFare(
  distanceKm: number,
  durationMinutes: number,
  serviceTier: ServiceTier,
  tripType: TripType,
  scheduledAt?: Date | null
): {
  fare: number;
  breakdown: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    surgeMultiplier: number;
    bookingFee: number;
    stopFees?: number;
    packagePrice?: number;
  };
} {
  const scheduledTime = scheduledAt ? new Date(scheduledAt) : new Date();
  const surgeMultiplier = getSurgeMultiplier(scheduledTime);

  // Hourly packages use fixed prices
  if (tripType === 'hourly') {
    const hours = Math.max(2, Math.ceil(durationMinutes / 60));
    const packages = HOURLY_PACKAGES[serviceTier];
    const pkg = packages.find(p => p.hours >= hours) || packages[packages.length - 1];
    const packagePrice = pkg.price;
    const afterSurge = packagePrice * surgeMultiplier;
    const total = afterSurge + PRICING.BOOKING_FEE;

    return {
      fare: Math.round(total),
      breakdown: {
        baseFare: 0,
        distanceFare: 0,
        timeFare: 0,
        surgeMultiplier,
        bookingFee: PRICING.BOOKING_FEE,
        packagePrice,
      },
    };
  }

  const baseFare = PRICING.PER_KM[serviceTier].base;
  const perMin = PRICING.PER_MIN[serviceTier].per_min;

  let effectiveDistance = distanceKm;
  if (tripType === 'round_trip') {
    effectiveDistance = distanceKm * 2;
  }

  const distanceFare = calculateTieredDistanceFare(effectiveDistance, serviceTier);
  const timeFare = durationMinutes * perMin;

  let subtotal = baseFare + distanceFare + timeFare;
  subtotal = subtotal * surgeMultiplier;
  const total = subtotal + PRICING.BOOKING_FEE;
  const finalFare = Math.max(total, PRICING.MINIMUM_FARE[serviceTier]);

  return {
    fare: Math.round(finalFare),
    breakdown: {
      baseFare: Math.round(baseFare),
      distanceFare: Math.round(distanceFare),
      timeFare: Math.round(timeFare),
      surgeMultiplier,
      bookingFee: PRICING.BOOKING_FEE,
    },
  };
}

// Format fare for display
export function formatFare(fare: number): string {
  return `₹${fare.toLocaleString('en-IN')}`;
}

// Get fare estimate for booking flow
export interface FareEstimateParams {
  pickupLat: number;
  pickupLong: number;
  dropLat: number;
  dropLong: number;
  serviceTier: ServiceTier;
  tripType: TripType;
  scheduledAt?: Date | null;
  // Deprecated
  vehicleType?: string;
}

export function getFareEstimate(params: FareEstimateParams) {
  const { pickupLat, pickupLong, dropLat, dropLong, serviceTier, tripType, scheduledAt } = params;

  const distanceKm = calculateDistance(pickupLat, pickupLong, dropLat, dropLong);
  const durationMinutes = calculateDuration(distanceKm);
  const fareCalc = calculateFare(distanceKm, durationMinutes, serviceTier, tripType, scheduledAt);

  const finalDistance = tripType === 'round_trip' ? distanceKm * 2 : distanceKm;
  const finalDuration = tripType === 'round_trip' ? durationMinutes * 2 : durationMinutes;

  return {
    estimatedFare: fareCalc.fare,
    estimatedDistanceKm: Math.round(finalDistance * 10) / 10,
    estimatedDurationMinutes: finalDuration,
    breakdown: fareCalc.breakdown,
  };
}
