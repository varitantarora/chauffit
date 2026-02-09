/**
 * Fare Calculation Utility
 * Based on pricing schema from backend docs
 */

export type VehicleSegment = 'HATCHBACK' | 'MICRO_SUV' | 'MID_SUV' | 'SEDAN' | 'FULL_SUV' | 'LUXURY';
export type TripType = 'one_way' | 'round_trip' | 'hourly_charter';
export type FareMode = 'PER_KM' | 'PER_MIN' | 'HOURLY_HIRE';

// Pricing configuration (seeded from backend)
const PRICING = {
  // Per-km rates (base fare + per km)
  PER_KM: {
    HATCHBACK: { base: 199, per_km: 5.0 },
    MICRO_SUV: { base: 249, per_km: 6.0 },
    MID_SUV: { base: 299, per_km: 7.0 },
    SEDAN: { base: 319, per_km: 7.5 },
    FULL_SUV: { base: 389, per_km: 9.0 },
    LUXURY: { base: 499, per_km: 12.0 },
  },
  // Per-min rates
  PER_MIN: {
    HATCHBACK: { base: 199, per_min: 3.0 },
    MICRO_SUV: { base: 250, per_min: 4.0 },
    MID_SUV: { base: 300, per_min: 5.0 },
    SEDAN: { base: 300, per_min: 5.0 },
    FULL_SUV: { base: 350, per_min: 5.0 },
    LUXURY: { base: 500, per_min: 9.0 },
  },
  // Hourly hire rates
  HOURLY_HIRE: {
    HATCHBACK: { base_1h: 199, per_hour_after: 99 },
    MICRO_SUV: { base_1h: 249, per_hour_after: 149 },
    MID_SUV: { base_1h: 299, per_hour_after: 169 },
    SEDAN: { base_1h: 299, per_hour_after: 169 },
    FULL_SUV: { base_1h: 349, per_hour_after: 189 },
    LUXURY: { base_1h: 399, per_hour_after: 219 },
  },
};

// Surge multipliers
const SURGE = {
  NIGHT: 1.09,
  TRAFFIC: { min: 1.10, max: 1.50 },
  HOURLY: 1.20,
};

// Map customer vehicle types to pricing segments
export function mapVehicleTypeToSegment(vehicleType: string): VehicleSegment {
  const typeMap: Record<string, VehicleSegment> = {
    'luxury_sedan': 'LUXURY',
    'executive_suv': 'FULL_SUV',
    'limousine': 'LUXURY',
    'mercedes_sprinter': 'FULL_SUV',
  };
  return typeMap[vehicleType] || 'SEDAN';
}

// Check if night time (9 PM to 6 AM)
function isNightTime(date: Date): boolean {
  const hour = date.getHours();
  return hour >= 21 || hour < 6;
}

// Get surge multiplier based on time
function getSurgeMultiplier(date: Date): number {
  let multiplier = 1.0;

  // Night surge
  if (isNightTime(date)) {
    multiplier = Math.max(multiplier, SURGE.NIGHT);
  }

  // For hourly trips, apply hourly surge
  // This would need actual traffic data in production
  // For now, we'll use a simplified approach

  return multiplier;
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
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

// Calculate estimated duration (simplified - assumes 30 km/h average speed in city)
export function calculateDuration(distanceKm: number): number {
  const avgSpeedKmH = 30; // Average city speed
  return Math.round((distanceKm / avgSpeedKmH) * 60); // Return minutes
}

// Calculate fare for one-way or round-trip
export function calculateFare(
  distanceKm: number,
  durationMinutes: number,
  vehicleType: string,
  tripType: TripType,
  scheduledAt?: Date | null
): {
  fare: number;
  breakdown: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    surgeMultiplier: number;
  };
} {
  const segment = mapVehicleTypeToSegment(vehicleType);
  const rates = PRICING.PER_KM[segment];
  const scheduledTime = scheduledAt ? new Date(scheduledAt) : new Date();
  const surgeMultiplier = getSurgeMultiplier(scheduledTime);

  let baseFare = rates.base;
  let distanceFare = distanceKm * rates.per_km;
  let timeFare = 0;

  // For hourly_charter, use hourly rates
  if (tripType === 'hourly_charter') {
    const hourlyRates = PRICING.HOURLY_HIRE[segment];
    const hours = Math.max(1, Math.ceil(durationMinutes / 60));

    if (hours === 1) {
      baseFare = hourlyRates.base_1h;
    } else {
      baseFare = hourlyRates.base_1h + (hours - 1) * hourlyRates.per_hour_after;
    }
    distanceFare = 0;
  }

  // For round-trip, double the distance fare
  let totalFare = baseFare + distanceFare + timeFare;

  if (tripType === 'round_trip') {
    totalFare = baseFare + (distanceFare * 2);
  }

  // Apply surge multiplier
  totalFare = totalFare * surgeMultiplier;

  return {
    fare: Math.round(totalFare),
    breakdown: {
      baseFare: Math.round(baseFare),
      distanceFare: Math.round(distanceFare),
      timeFare: Math.round(timeFare),
      surgeMultiplier,
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
  vehicleType: string;
  tripType: TripType;
  scheduledAt?: Date | null;
}

export function getFareEstimate(params: FareEstimateParams) {
  const { pickupLat, pickupLong, dropLat, dropLong, vehicleType, tripType, scheduledAt } = params;

  const distanceKm = calculateDistance(pickupLat, pickupLong, dropLat, dropLong);
  const durationMinutes = calculateDuration(distanceKm);
  const fareCalc = calculateFare(distanceKm, durationMinutes, vehicleType, tripType, scheduledAt);

  // For round trip, double the distance and duration
  const finalDistance = tripType === 'round_trip' ? distanceKm * 2 : distanceKm;
  const finalDuration = tripType === 'round_trip' ? durationMinutes * 2 : durationMinutes;

  return {
    estimatedFare: fareCalc.fare,
    estimatedDistanceKm: Math.round(finalDistance * 10) / 10, // Round to 1 decimal
    estimatedDurationMinutes: finalDuration,
    breakdown: fareCalc.breakdown,
  };
}
