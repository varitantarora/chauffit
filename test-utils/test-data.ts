import { faker } from '@faker-js/faker';

// Set locale to India for realistic test data
faker.locale = 'en_IN';

// Indian-specific data generators
export const generateIndianPhoneNumber = () => {
  const prefixes = ['91', '92', '93', '94', '95', '96', '97', '98', '99'];
  const prefix = faker.helpers.arrayElement(prefixes);
  const number = faker.string.numeric(8);
  return `+91${prefix}${number}`;
};

export const generateIndianVehicleNumber = () => {
  const states = ['DL', 'MH', 'KA', 'TN', 'UP', 'GJ', 'RJ', 'WB'];
  const state = faker.helpers.arrayElement(states);
  const district = faker.string.numeric(2);
  const series = faker.string.alpha(2).toUpperCase();
  const number = faker.string.numeric(4);
  return `${state} ${district} ${series} ${number}`;
};

export const generateIndianAddress = () => {
  const cities = [
    'New Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata',
    'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'
  ];
  const areas = [
    'Sector', 'Block', 'Phase', 'Colony', 'Nagar', 'Vihar',
    'Extension', 'Enclave', 'Park', 'Market'
  ];
  
  const city = faker.helpers.arrayElement(cities);
  const area = faker.helpers.arrayElement(areas);
  const areaNumber = faker.number.int({ min: 1, max: 100 });
  
  return `${area} ${areaNumber}, ${city}, India`;
};

// User data generators
export const generateCustomer = () => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  phone: generateIndianPhoneNumber(),
  email: faker.internet.email(),
  profile_image: faker.image.avatar(),
  emergency_contacts: Array.from({ length: 3 }, () => ({
    name: faker.person.fullName(),
    phone: generateIndianPhoneNumber(),
    relationship: faker.helpers.arrayElement(['Family', 'Friend', 'Colleague']),
  })),
  preferred_payment_method: faker.helpers.arrayElement(['upi', 'card', 'cash']),
  rating: faker.number.float({ min: 3.5, max: 5.0, precision: 0.1 }),
  created_at: faker.date.past().toISOString(),
});

export const generateDriver = () => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  phone: generateIndianPhoneNumber(),
  email: faker.internet.email(),
  profile_image: faker.image.avatar(),
  vehicle_number: generateIndianVehicleNumber(),
  vehicle_type: faker.helpers.arrayElement(['sedan', 'suv', 'hatchback', 'luxury']),
  vehicle_model: faker.vehicle.model(),
  vehicle_color: faker.vehicle.color(),
  license_number: faker.string.alphanumeric(15).toUpperCase(),
  is_online: faker.datatype.boolean(),
  location: {
    latitude: faker.location.latitude({ min: 28.4, max: 28.8 }), // Delhi NCR bounds
    longitude: faker.location.longitude({ min: 76.8, max: 77.6 }),
  },
  rating: faker.number.float({ min: 3.5, max: 5.0, precision: 0.1 }),
  total_rides: faker.number.int({ min: 50, max: 1000 }),
  earnings: {
    today: faker.number.int({ min: 500, max: 5000 }),
    week: faker.number.int({ min: 5000, max: 25000 }),
    month: faker.number.int({ min: 20000, max: 100000 }),
  },
  documents: {
    license: faker.image.url(),
    vehicle_registration: faker.image.url(),
    insurance: faker.image.url(),
  },
  created_at: faker.date.past().toISOString(),
});

export const generateBiker = () => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  phone: generateIndianPhoneNumber(),
  email: faker.internet.email(),
  profile_image: faker.image.avatar(),
  vehicle_number: generateIndianVehicleNumber(),
  license_number: faker.string.alphanumeric(15).toUpperCase(),
  is_available: faker.datatype.boolean(),
  location: {
    latitude: faker.location.latitude({ min: 28.4, max: 28.8 }),
    longitude: faker.location.longitude({ min: 76.8, max: 77.6 }),
  },
  rating: faker.number.float({ min: 4.0, max: 5.0, precision: 0.1 }),
  response_time: faker.number.int({ min: 2, max: 15 }), // minutes
  emergency_response_count: faker.number.int({ min: 10, max: 500 }),
  earnings: {
    today: faker.number.int({ min: 300, max: 2000 }),
    week: faker.number.int({ min: 2000, max: 10000 }),
    month: faker.number.int({ min: 8000, max: 40000 }),
  },
  specializations: faker.helpers.arrayElements([
    'mechanical', 'medical', 'emergency', 'delivery', 'tire_change'
  ], { min: 1, max: 3 }),
  created_at: faker.date.past().toISOString(),
});

// Booking data generators
export const generateBooking = (customerId?: string, driverId?: string) => ({
  id: faker.string.uuid(),
  customer_id: customerId || faker.string.uuid(),
  driver_id: driverId || faker.string.uuid(),
  pickup_location: {
    latitude: faker.location.latitude({ min: 28.4, max: 28.8 }),
    longitude: faker.location.longitude({ min: 76.8, max: 77.6 }),
    address: generateIndianAddress(),
  },
  destination: {
    latitude: faker.location.latitude({ min: 28.4, max: 28.8 }),
    longitude: faker.location.longitude({ min: 76.8, max: 77.6 }),
    address: generateIndianAddress(),
  },
  duration_hours: faker.number.int({ min: 2, max: 12 }),
  base_amount: faker.number.int({ min: 800, max: 5000 }),
  surge_multiplier: faker.number.float({ min: 1.0, max: 2.5, precision: 0.1 }),
  platform_fee: faker.number.int({ min: 50, max: 200 }),
  gst_amount: faker.number.int({ min: 100, max: 500 }),
  total_amount: faker.number.int({ min: 1000, max: 8000 }),
  status: faker.helpers.arrayElement([
    'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
  ]),
  payment_status: faker.helpers.arrayElement([
    'pending', 'completed', 'failed', 'refunded'
  ]),
  special_requirements: faker.helpers.arrayElements([
    'child_seat', 'wheelchair_accessible', 'pet_friendly', 'extra_luggage'
  ], { min: 0, max: 2 }),
  otp: faker.string.numeric(6),
  created_at: faker.date.recent().toISOString(),
  scheduled_at: faker.date.future().toISOString(),
});

// Task data generators
export const generateTask = (bikerId?: string, customerId?: string) => ({
  id: faker.string.uuid(),
  type: faker.helpers.arrayElement([
    'emergency', 'delivery', 'driver_pickup', 'mechanical_help', 'tire_change'
  ]),
  priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
  customer_id: customerId || faker.string.uuid(),
  driver_id: faker.string.uuid(),
  biker_id: bikerId || faker.string.uuid(),
  location: {
    latitude: faker.location.latitude({ min: 28.4, max: 28.8 }),
    longitude: faker.location.longitude({ min: 76.8, max: 77.6 }),
    address: generateIndianAddress(),
  },
  description: faker.lorem.sentence(),
  estimated_duration: faker.number.int({ min: 15, max: 120 }), // minutes
  amount: faker.number.int({ min: 200, max: 1500 }),
  status: faker.helpers.arrayElement([
    'created', 'assigned', 'in_progress', 'completed', 'cancelled'
  ]),
  created_at: faker.date.recent().toISOString(),
  assigned_at: faker.date.recent().toISOString(),
  completed_at: faker.date.recent().toISOString(),
});

// Payment data generators
export const generatePayment = (bookingId?: string) => ({
  id: faker.string.uuid(),
  booking_id: bookingId || faker.string.uuid(),
  amount: faker.number.int({ min: 1000, max: 8000 }),
  currency: 'INR',
  method: faker.helpers.arrayElement(['upi', 'card', 'netbanking', 'wallet']),
  provider: faker.helpers.arrayElement(['stripe', 'razorpay', 'paytm']),
  transaction_id: faker.string.alphanumeric(16),
  stripe_payment_intent_id: `pi_${faker.string.alphanumeric(24)}`,
  status: faker.helpers.arrayElement(['pending', 'completed', 'failed', 'refunded']),
  failure_reason: faker.helpers.arrayElement([
    'insufficient_funds', 'card_declined', 'network_error', 'expired_card'
  ]),
  gst_details: {
    gst_number: `${faker.string.numeric(2)}${faker.string.alpha(5).toUpperCase()}${faker.string.numeric(4)}${faker.string.alpha(1).toUpperCase()}${faker.string.numeric(1)}${faker.string.alpha(1).toUpperCase()}${faker.string.numeric(1)}`,
    cgst: faker.number.int({ min: 50, max: 200 }),
    sgst: faker.number.int({ min: 50, max: 200 }),
    igst: faker.number.int({ min: 100, max: 400 }),
  },
  created_at: faker.date.recent().toISOString(),
  completed_at: faker.date.recent().toISOString(),
});

// Emergency data generators
export const generateEmergencyAlert = (customerId?: string) => ({
  id: faker.string.uuid(),
  customer_id: customerId || faker.string.uuid(),
  type: faker.helpers.arrayElement([
    'sos', 'accident', 'breakdown', 'medical', 'police', 'fire'
  ]),
  severity: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
  location: {
    latitude: faker.location.latitude({ min: 28.4, max: 28.8 }),
    longitude: faker.location.longitude({ min: 76.8, max: 77.6 }),
    address: generateIndianAddress(),
  },
  description: faker.lorem.sentence(),
  contacts_notified: faker.number.int({ min: 1, max: 5 }),
  biker_assigned: faker.datatype.boolean(),
  biker_id: faker.string.uuid(),
  estimated_arrival: faker.number.int({ min: 5, max: 30 }), // minutes
  status: faker.helpers.arrayElement([
    'created', 'dispatched', 'in_progress', 'resolved', 'cancelled'
  ]),
  created_at: faker.date.recent().toISOString(),
  resolved_at: faker.date.recent().toISOString(),
});

// Location data for Indian cities
export const indianCityLocations = {
  delhi: {
    connaught_place: { latitude: 28.6304, longitude: 77.2177 },
    india_gate: { latitude: 28.6129, longitude: 77.2295 },
    red_fort: { latitude: 28.6562, longitude: 77.2410 },
    qutub_minar: { latitude: 28.5244, longitude: 77.1855 },
    lotus_temple: { latitude: 28.5535, longitude: 77.2588 },
  },
  mumbai: {
    gateway_of_india: { latitude: 18.9220, longitude: 72.8347 },
    marine_drive: { latitude: 18.9432, longitude: 72.8230 },
    bandra: { latitude: 19.0596, longitude: 72.8295 },
    andheri: { latitude: 19.1136, longitude: 72.8697 },
    powai: { latitude: 19.1176, longitude: 72.9060 },
  },
  bangalore: {
    mg_road: { latitude: 12.9716, longitude: 77.5946 },
    koramangala: { latitude: 12.9279, longitude: 77.6271 },
    whitefield: { latitude: 12.9698, longitude: 77.7500 },
    electronic_city: { latitude: 12.8456, longitude: 77.6603 },
    hebbal: { latitude: 13.0358, longitude: 77.5970 },
  },
};

// Test scenarios
export const testScenarios = {
  booking: {
    normal: () => generateBooking(),
    surge: () => ({
      ...generateBooking(),
      surge_multiplier: faker.number.float({ min: 1.5, max: 2.5, precision: 0.1 }),
    }),
    longDistance: () => ({
      ...generateBooking(),
      duration_hours: faker.number.int({ min: 8, max: 12 }),
      total_amount: faker.number.int({ min: 5000, max: 15000 }),
    }),
    scheduled: () => ({
      ...generateBooking(),
      scheduled_at: faker.date.future().toISOString(),
    }),
  },
  emergency: {
    critical: () => ({
      ...generateEmergencyAlert(),
      severity: 'critical',
      type: 'sos',
    }),
    medical: () => ({
      ...generateEmergencyAlert(),
      type: 'medical',
      severity: 'high',
    }),
    breakdown: () => ({
      ...generateEmergencyAlert(),
      type: 'breakdown',
      severity: 'medium',
    }),
  },
  payment: {
    upi: () => ({
      ...generatePayment(),
      method: 'upi',
      provider: 'razorpay',
    }),
    card: () => ({
      ...generatePayment(),
      method: 'card',
      provider: 'stripe',
    }),
    failed: () => ({
      ...generatePayment(),
      status: 'failed',
      failure_reason: 'insufficient_funds',
    }),
  },
};

// Generate test data sets
export const generateTestDataSet = (count: number = 10) => ({
  customers: Array.from({ length: count }, generateCustomer),
  drivers: Array.from({ length: count }, generateDriver),
  bikers: Array.from({ length: count }, generateBiker),
  bookings: Array.from({ length: count }, () => generateBooking()),
  tasks: Array.from({ length: count }, () => generateTask()),
  payments: Array.from({ length: count }, () => generatePayment()),
  emergencyAlerts: Array.from({ length: count }, () => generateEmergencyAlert()),
});

export default {
  generateCustomer,
  generateDriver,
  generateBiker,
  generateBooking,
  generateTask,
  generatePayment,
  generateEmergencyAlert,
  generateTestDataSet,
  testScenarios,
  indianCityLocations,
  generateIndianPhoneNumber,
  generateIndianVehicleNumber,
  generateIndianAddress,
};