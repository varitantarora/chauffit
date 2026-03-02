import { BookingStatus } from '../services/api/BookingApiService';
export type UserRole = 'customer' | 'driver' | 'biker' | 'admin' | 'super_admin';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
}

export interface CustomerCar {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  registrationNumber: string;
  isDefault: boolean;
  vehicleType?: string;
  transmission?: 'manual' | 'automatic';
}

export interface Chauffeur {
  id: string;
  name: string;
  photo: string;
  rating: number;
  experience: number;
  certifications: string[];
  eta: string;
  phone: string;
  location: {
    latitude: number;
    longitude: number;
  };
  isAvailable: boolean;
}

export interface BookingDetails {
  id?: string;
  customerId: string;
  chauffeurId?: string;
  chauffeurName?: string;
  carId?: string;
  duration: string;
  startTime: Date;
  endTime?: Date;
  pickupLocation: Location;
  dropLocation?: Location;
  status: BookingStatus | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  price?: number;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | string;
  vehicleType?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  name?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet' | 'cash';
  last4?: string;
  cardType?: string;
  upiId?: string;
  walletProvider?: string;
  isDefault: boolean;
}

export interface RideTracking {
  bookingId: string;
  chauffeurLocation: Location;
  customerLocation?: Location;
  eta: string;
  route?: Location[];
  status: 'driver_coming' | 'driver_arrived' | 'ride_started' | 'ride_completed';
  lastUpdated: Date;
}

export interface Rating {
  bookingId: string;
  customerId: string;
  chauffeurId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

// Driver-specific types
export interface DriverProfile extends User {
  licenseNumber: string;
  licenseExpiry: Date;
  vehicleId?: string;
  isOnline: boolean;
  rating: number;
  totalRides: number;
  experience: number; // in years
  certifications: string[];
  documents: DriverDocument[];
  bankDetails?: BankDetails;
  onlineHours: number; // weekly hours
  earnings: DriverEarnings;
}

export interface DriverDocument {
  id: string;
  type: 'license' | 'insurance' | 'registration' | 'permit' | 'passport' | 'other';
  number: string;
  imageUrl: string;
  expiryDate?: Date;
  isVerified: boolean;
  verifiedAt?: Date;
  uploadedAt: Date;
}

export interface Vehicle {
  id: string;
  driverId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  registrationNumber: string;
  fuelType: 'petrol' | 'diesel' | 'cng' | 'electric' | 'hybrid';
  isActive: boolean;
  documents: VehicleDocument[];
  createdAt: Date;
}

export interface VehicleDocument {
  id: string;
  type: 'registration' | 'insurance' | 'puc' | 'permit';
  number: string;
  imageUrl: string;
  expiryDate?: Date;
  isVerified: boolean;
  verifiedAt?: Date;
  uploadedAt: Date;
}

export interface BankDetails {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
  upiId?: string;
  isVerified: boolean;
}

export interface DriverEarnings {
  totalEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  todayEarnings: number;
  pendingAmount: number;
  lastPayout?: Date;
}

export interface JobRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerRating: number;
  pickupLocation: Location;
  dropoffLocation?: Location;
  scheduledTime: Date;
  estimatedDuration: number; // in minutes
  estimatedDistance: number; // in km
  serviceType: 'hourly' | 'trip' | 'airport' | 'outstation';
  fare: number;
  net_earnings?: number;
  vehicleType: string;
  specialRequests?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Date;
  createdAt: Date;
}

export interface ActiveJob {
  id: string;
  jobRequestId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: Location;
  dropoffLocation?: Location;
  currentLocation?: Location;
  status: 'accepted' | 'en_route_pickup' | 'arrived_pickup' | 'started' | 'en_route_destination' | 'completed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
  actualDistance?: number;
  actualDuration?: number;
  fare: number;
  net_earnings?: number;
  tips?: number;
  route?: Location[];
  eta?: string;
  lastLocationUpdate?: Date;
  // Vehicle info
  vehicleMake?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
}

export interface JobHistory {
  id: string;
  customerId: string;
  customerName: string;
  date: Date;
  pickupLocation: Location;
  dropoffLocation?: Location;
  duration: number; // in minutes
  distance: number; // in km
  fare: number;
  net_earnings?: number;
  tips: number;
  rating?: number;
  customerRating?: number;
  customerComment?: string;
  status: 'completed' | 'cancelled';
}

export interface EarningsBreakdown {
  date: Date;
  totalEarnings: number;
  baseFare: number;
  tips: number;
  incentives: number;
  fuelReimbursement: number;
  totalRides: number;
  onlineHours: number;
  averageRating: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  isPrimary: boolean;
}

// Biker-specific types
export type TaskPriority = 'emergency' | 'urgent' | 'high' | 'normal';
export type TaskType = 'customer_emergency' | 'driver_rescue' | 'document_delivery' | 'car_retrieval' | 'regular_delivery';
export type TaskStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface BikerProfile extends User {
  bikeDetails: BikeDetails;
  isOnline: boolean;
  isAvailableForEmergencies: boolean;
  rating: number;
  totalTasks: number;
  emergencyResponseTime: number; // average response time in minutes
  certifications: string[];
  emergencyContacts: EmergencyContact[];
  earnings: BikerEarnings;
  responseStats: EmergencyResponseStats;
}

export interface BikeDetails {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  registrationNumber: string;
  engineCapacity: string; // e.g., '150cc'
  fuelType: 'petrol' | 'electric';
  documents: BikeDocument[];
  isActive: boolean;
  createdAt: Date;
}

export interface BikeDocument {
  id: string;
  type: 'registration' | 'insurance' | 'puc' | 'license' | 'permit';
  number: string;
  imageUrl: string;
  expiryDate?: Date;
  isVerified: boolean;
  verifiedAt?: Date;
  uploadedAt: Date;
}

export interface BikerTask {
  id: string;
  type: TaskType;
  priority: TaskPriority;
  title: string;
  description: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  pickupLocation: Location;
  dropoffLocation?: Location;
  estimatedDistance: number; // in km
  estimatedDuration: number; // in minutes
  fare: number;
  emergencyBonus?: number;
  specialInstructions?: string;
  items?: TaskItem[]; // for deliveries
  status: TaskStatus;
  createdAt: Date;
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  expiresAt: Date;
  responseTimeLimit?: number; // minutes for emergency tasks
}

export interface TaskItem {
  id: string;
  name: string;
  quantity?: number;
  description?: string;
  fragile?: boolean;
  confidential?: boolean;
}

export interface BikerEarnings {
  totalEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  todayEarnings: number;
  pendingAmount: number;
  baseTaskEarnings: number;
  emergencyBonuses: number;
  peakTimeBonuses: number;
  distanceBonuses: number;
  incentives: number;
  lastPayout?: Date;
}

export interface EmergencyResponseStats {
  totalEmergencies: number;
  averageResponseTime: number; // in minutes
  successfulRescues: number;
  emergencyRating: number;
  fastestResponseTime: number; // in minutes
  thisWeekEmergencies: number;
  thisMonthEmergencies: number;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  type: TaskType;
  priority: TaskPriority;
  customerId?: string;
  customerName?: string;
  date: Date;
  pickupLocation: Location;
  dropoffLocation?: Location;
  duration: number; // in minutes
  distance: number; // in km
  fare: number;
  bonuses: number;
  rating?: number;
  customerComment?: string;
  status: 'completed' | 'cancelled';
  responseTime?: number; // for emergency tasks
}

export interface TaskNotification {
  id: string;
  taskId: string;
  type: 'new_task' | 'task_update' | 'emergency_alert' | 'payment' | 'rating';
  title: string;
  message: string;
  priority: TaskPriority;
  isRead: boolean;
  createdAt: Date;
  data?: Record<string, any>;
}

export interface BikerLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
}

export interface EmergencyAlert {
  id: string;
  type: 'customer_stranded' | 'driver_breakdown' | 'accident' | 'safety_concern';
  customerId?: string;
  driverId?: string;
  location: Location;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  estimatedResponseTime: number;
  availableBikers: string[]; // biker IDs
  assignedBikerId?: string;
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'cancelled';
  createdAt: Date;
  resolvedAt?: Date;
}

export interface BikerShift {
  id: string;
  bikerId: string;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  tasksCompleted: number;
  emergenciesHandled: number;
  earnings: number;
  distanceCovered: number; // in km
  averageRating: number;
  peakHours: number;
}