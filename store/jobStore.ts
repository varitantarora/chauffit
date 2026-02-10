import { create } from 'zustand';
import { JobRequest, ActiveJob, JobHistory, Location } from '../types/navigation';
import DriverRidesApiService, { BookingDetail } from '../services/api/DriverRidesApiService';
import { useAuthStore } from './authStore';
import { isProduction } from '../config/env';

interface JobState {
  // Current job requests
  pendingRequests: JobRequest[];
  activeJob: ActiveJob | null;
  jobHistory: JobHistory[];
  acceptedJobs: JobRequest[]; // Jobs accepted but not started (driver_assigned, biker_assigned)
  inProgressJobs: JobRequest[]; // Currently active rides (driver_en_route, driver_arrived, trip_started)
  completedJobs: JobHistory[]; // Completed rides (trip_completed)

  // Driver status
  isOnline: boolean;
  currentLocation: Location | null;

  // Loading states
  loadingPending: boolean;
  loadingAccepted: boolean;
  loadingInProgress: boolean;
  loadingCompleted: boolean;
  lastAcceptError: string | null;
  lastApiError: string | null;

  // Job actions
  addJobRequest: (request: JobRequest) => void;
  removeJobRequest: (requestId: string) => void;
  acceptJob: (requestId: string) => void;
  declineJob: (requestId: string) => void;
  startJob: () => void;
  updateJobStatus: (status: ActiveJob['status']) => void;
  updateCurrentLocation: (location: Location) => void;
  completeJob: (tips?: number, rating?: number) => void;
  cancelJob: (reason?: string) => void;

  // Online status
  setOnlineStatus: (isOnline: boolean) => void;

  // Location updates
  setCurrentLocation: (location: Location) => void;
  updateETA: (eta: string) => void;

  // API Integration methods
  fetchPendingRequests: (options?: { silent?: boolean }) => Promise<void>;
  fetchAcceptedJobs: () => Promise<void>;
  fetchInProgressJobs: () => Promise<void>;
  fetchCompletedJobs: () => Promise<void>;
  fetchAllDriverJobs: () => Promise<void>;
  acceptRideFromAPI: (rideId: string) => Promise<boolean>;
  startRideFromAPI: (rideId: string) => Promise<boolean>;
  completeRideFromAPI: (rideId: string, data?: any) => Promise<boolean>;

  // Utility functions
  clearExpiredRequests: () => void;
  resetDemoRequests: () => void;
  getActiveJobRequests: () => JobRequest[];
  getTodayHistory: () => JobHistory[];
  getPendingCount: () => number;
  getAcceptedCount: () => number;
  getInProgressCount: () => number;
  getCompletedCount: () => number;
}

// Mock data for development - Demo ride requests for testing
const mockJobRequests: JobRequest[] = [
  {
    id: '1',
    customerId: 'customer_1',
    customerName: 'Rajesh Kumar',
    customerPhone: '+91 98765 43210',
    customerRating: 4.8,
    pickupLocation: {
      latitude: 28.4595,
      longitude: 77.0266,
      address: 'Cyber Hub, DLF Phase 2, Sector 24, Gurugram',
      name: 'Cyber Hub'
    },
    dropoffLocation: {
      latitude: 28.5562,
      longitude: 77.1000,
      address: 'Indira Gandhi International Airport, Terminal 3, New Delhi',
      name: 'IGI Airport T3'
    },
    scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    estimatedDuration: 45,
    estimatedDistance: 25,
    serviceType: 'airport',
    fare: 2850,
    vehicleType: 'sedan',
    status: 'pending',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    createdAt: new Date()
  },
  {
    id: '2',
    customerId: 'customer_2',
    customerName: 'Priya Sharma',
    customerPhone: '+91 87654 32109',
    customerRating: 4.9,
    pickupLocation: {
      latitude: 28.4089,
      longitude: 77.0495,
      address: 'The Oberoi Hotel, Dr. APJ Abdul Kalam Road, Gurugram',
      name: 'The Oberoi Hotel'
    },
    dropoffLocation: {
      latitude: 28.4949,
      longitude: 77.0787,
      address: 'Unitech Cyber Park, Sector 39, Gurugram',
      name: 'Unitech Cyber Park'
    },
    scheduledTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    estimatedDuration: 30,
    estimatedDistance: 12,
    serviceType: 'trip',
    fare: 1500,
    vehicleType: 'sedan',
    specialRequests: 'Please call upon arrival',
    status: 'pending',
    expiresAt: new Date(Date.now() + 90 * 60 * 1000), // 1.5 hours from now
    createdAt: new Date()
  },
  {
    id: '3',
    customerId: 'customer_3',
    customerName: 'Amit Singh',
    customerPhone: '+91 98765 12345',
    customerRating: 4.7,
    pickupLocation: {
      latitude: 28.5355,
      longitude: 77.3910,
      address: 'Noida City Centre Metro Station, Noida',
      name: 'City Centre Metro'
    },
    dropoffLocation: {
      latitude: 28.5245,
      longitude: 77.1855,
      address: 'Connaught Place, New Delhi',
      name: 'Connaught Place'
    },
    scheduledTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    estimatedDuration: 50,
    estimatedDistance: 28,
    serviceType: 'trip',
    fare: 3200,
    vehicleType: 'sedan',
    specialRequests: 'AC required, prefer faster route',
    status: 'pending',
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    createdAt: new Date()
  },
  {
    id: '4',
    customerId: 'customer_4',
    customerName: 'Neha Gupta',
    customerPhone: '+91 87654 98765',
    customerRating: 5.0,
    pickupLocation: {
      latitude: 28.6139,
      longitude: 77.2090,
      address: 'India Gate, Rajpath, New Delhi',
      name: 'India Gate'
    },
    dropoffLocation: {
      latitude: 28.6562,
      longitude: 77.2410,
      address: 'Red Fort, Chandni Chowk, Old Delhi',
      name: 'Red Fort'
    },
    scheduledTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    estimatedDuration: 25,
    estimatedDistance: 8,
    serviceType: 'sightseeing',
    fare: 1200,
    vehicleType: 'hatchback',
    specialRequests: 'Tourist trip, please drive slowly for photos',
    status: 'pending',
    expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
    createdAt: new Date()
  },
  {
    id: '5',
    customerId: 'customer_5',
    customerName: 'Vikash Yadav',
    customerPhone: '+91 76543 21098',
    customerRating: 4.6,
    pickupLocation: {
      latitude: 28.4817,
      longitude: 77.0910,
      address: 'Ambience Mall, Vasant Kunj, New Delhi',
      name: 'Ambience Mall'
    },
    dropoffLocation: {
      latitude: 28.4272,
      longitude: 77.0688,
      address: 'Golf Course Road, Sector 54, Gurugram',
      name: 'Golf Course Road'
    },
    scheduledTime: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
    estimatedDuration: 35,
    estimatedDistance: 18,
    serviceType: 'trip',
    fare: 2100,
    vehicleType: 'suv',
    specialRequests: 'Family trip with luggage, need spacious vehicle',
    status: 'pending',
    expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    createdAt: new Date()
  }
];

// Helper to normalize API list responses
const normalizeBookings = (data: any): BookingDetail[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data)) return data.data;
  return [];
};

const dedupeById = <T extends { id: string }>(items: T[]): T[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

// Status constants based on rides API documentation
const PENDING_BOOKING_STATUSES = new Set(['requested']);

// Accepted rides: driver assigned but trip not started yet
const ACCEPTED_BOOKING_STATUSES = new Set([
  'driver_assigned',
  'biker_assigned',
]);

// In-progress rides: trip is actively ongoing
const IN_PROGRESS_BOOKING_STATUSES = new Set([
  'driver_en_route',
  'driver_arrived',
  'trip_started',
]);

// Completed rides: trip finished successfully
const COMPLETED_BOOKING_STATUSES = new Set(['trip_completed']);

// All active rides (not pending, not completed, not cancelled)
const ACTIVE_BOOKING_STATUSES = new Set([
  'driver_assigned',
  'biker_assigned',
  'driver_en_route',
  'driver_arrived',
  'trip_started',
]);

// Cancelled rides
const CANCELLED_BOOKING_STATUSES = new Set([
  'cancelled_by_customer',
  'cancelled_by_driver',
  'cancelled_by_system',
]);

// Helper function to map BookingDetail to JobRequest
const mapBookingToJobRequest = (booking: BookingDetail, status: JobRequest['status'] = 'pending'): JobRequest => {
  // Extract customer details from embedded data (may be object or already parsed)
  const customerDetails = typeof booking.customer_details === 'object'
    ? booking.customer_details
    : null;

  return {
    id: booking.id,
    customerId: customerDetails?.id || booking.customer || '',
    customerName: customerDetails?.name || 'Customer',
    customerPhone: customerDetails?.mobile || '',
    customerRating: customerDetails?.overall_rating ?? 4.5,
    pickupLocation: {
      latitude: parseFloat(String(booking.pickup_lat)) || 0,
      longitude: parseFloat(String(booking.pickup_long)) || 0,
      address: booking.pickup_address,
      name: booking.pickup_address.split(',')[0]
    },
    dropoffLocation: {
      latitude: parseFloat(String(booking.dropoff_lat)) || 0,
      longitude: parseFloat(String(booking.dropoff_long)) || 0,
      address: booking.dropoff_address,
      name: booking.dropoff_address.split(',')[0]
    },
    scheduledTime: booking.scheduled_at ? new Date(booking.scheduled_at) : new Date(),
    estimatedDuration: booking.estimated_duration_minutes || 30,
    estimatedDistance: parseFloat(String(booking.estimated_distance_km)) || 10,
    serviceType: booking.trip_type === 'hourly_charter' ? 'hourly' : 'trip',
    fare: parseFloat(String(booking.estimated_fare)) || 0,
    vehicleType: 'sedan',
    status,
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    createdAt: new Date(booking.created_at)
  };
};

// Helper function to map BookingDetail to JobHistory
const mapBookingToJobHistory = (booking: BookingDetail): JobHistory => {
  // Extract customer details from embedded data
  const customerDetails = typeof booking.customer_details === 'object'
    ? booking.customer_details
    : null;

  return {
    id: booking.id,
    customerId: customerDetails?.id || booking.customer || '',
    customerName: customerDetails?.name || 'Customer',
    date: new Date(booking.created_at),
    pickupLocation: {
      latitude: parseFloat(String(booking.pickup_lat)) || 0,
      longitude: parseFloat(String(booking.pickup_long)) || 0,
      address: booking.pickup_address,
      name: booking.pickup_address.split(',')[0]
    },
    dropoffLocation: {
      latitude: parseFloat(String(booking.dropoff_lat)) || 0,
      longitude: parseFloat(String(booking.dropoff_long)) || 0,
      address: booking.dropoff_address,
      name: booking.dropoff_address.split(',')[0]
    },
    duration: booking.actual_duration_minutes || booking.estimated_duration_minutes || 0,
    distance: parseFloat(String(booking.actual_distance_km || booking.estimated_distance_km)) || 0,
    fare: parseFloat(String(booking.actual_fare || booking.estimated_fare)) || 0,
    tips: 0,
    rating: undefined,
    status: 'completed'
  };
};

const mockJobHistory: JobHistory[] = [
  {
    id: 'job_1',
    customerId: 'customer_3',
    customerName: 'Amit Singh',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    pickupLocation: {
      latitude: 28.4595,
      longitude: 77.0266,
      address: 'Cyber Hub, Gurugram',
      name: 'Cyber Hub'
    },
    dropoffLocation: {
      latitude: 28.5562,
      longitude: 77.1000,
      address: 'IGI Airport T3, Delhi',
      name: 'IGI Airport'
    },
    duration: 45,
    distance: 25,
    fare: 2850,
    tips: 200,
    rating: 5,
    customerRating: 4.8,
    customerComment: 'Excellent service, very punctual',
    status: 'completed'
  },
  {
    id: 'job_2',
    customerId: 'customer_4',
    customerName: 'Neha Gupta',
    date: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    pickupLocation: {
      latitude: 28.4089,
      longitude: 77.0495,
      address: 'Hotel Oberoi, Gurugram',
      name: 'Hotel Oberoi'
    },
    dropoffLocation: {
      latitude: 28.4949,
      longitude: 77.0787,
      address: 'Cyber Park, Gurugram',
      name: 'Cyber Park'
    },
    duration: 25,
    distance: 12,
    fare: 1500,
    tips: 100,
    rating: 4,
    customerRating: 4.9,
    status: 'completed'
  }
];

export const useJobStore = create<JobState>((set, get) => ({
  // Initial state - start empty, API will populate
  pendingRequests: [],
  activeJob: null,
  jobHistory: [],
  acceptedJobs: [],
  inProgressJobs: [],
  completedJobs: [],
  isOnline: false,
  currentLocation: null,
  loadingPending: false,
  loadingAccepted: false,
  loadingInProgress: false,
  loadingCompleted: false,
  lastAcceptError: null,
  lastApiError: null,

  // Job request actions
  addJobRequest: (request) => set((state) => ({
    pendingRequests: [...state.pendingRequests, request]
  })),

  removeJobRequest: (requestId) => set((state) => ({
    pendingRequests: state.pendingRequests.filter(req => req.id !== requestId)
  })),

  acceptJob: (requestId) => {
    const state = get();
    const request = state.pendingRequests.find(req => req.id === requestId);
    
    if (request) {
      const activeJob: ActiveJob = {
        id: `active_${Date.now()}`,
        jobRequestId: request.id,
        customerId: request.customerId,
        customerName: request.customerName,
        customerPhone: request.customerPhone,
        pickupLocation: request.pickupLocation,
        dropoffLocation: request.dropoffLocation,
        currentLocation: state.currentLocation || undefined,
        status: 'accepted',
        fare: request.fare,
        route: [],
        eta: '15 min',
        lastLocationUpdate: new Date()
      };

      set((state) => ({
        pendingRequests: state.pendingRequests.filter(req => req.id !== requestId),
        activeJob
      }));
    }
  },

  declineJob: (requestId) => set((state) => ({
    pendingRequests: state.pendingRequests.map(req => 
      req.id === requestId ? { ...req, status: 'declined' } : req
    ).filter(req => req.status !== 'declined')
  })),

  startJob: () => set((state) => ({
    activeJob: state.activeJob ? {
      ...state.activeJob,
      status: 'started',
      startTime: new Date()
    } : null
  })),

  updateJobStatus: (status) => set((state) => ({
    activeJob: state.activeJob ? {
      ...state.activeJob,
      status,
      lastLocationUpdate: new Date()
    } : null
  })),

  updateCurrentLocation: (location) => set((state) => ({
    currentLocation: location,
    activeJob: state.activeJob ? {
      ...state.activeJob,
      currentLocation: location,
      lastLocationUpdate: new Date()
    } : null
  })),

  completeJob: (tips = 0, rating) => {
    const state = get();
    if (state.activeJob) {
      const completedJob: JobHistory = {
        id: state.activeJob.id,
        customerId: state.activeJob.customerId,
        customerName: state.activeJob.customerName,
        date: new Date(),
        pickupLocation: state.activeJob.pickupLocation,
        dropoffLocation: state.activeJob.dropoffLocation,
        duration: state.activeJob.actualDuration || 0,
        distance: state.activeJob.actualDistance || 0,
        fare: state.activeJob.fare,
        tips,
        rating,
        status: 'completed'
      };

      set((state) => ({
        activeJob: null,
        jobHistory: [completedJob, ...state.jobHistory]
      }));
    }
  },

  cancelJob: (reason) => set((state) => ({
    activeJob: state.activeJob ? {
      ...state.activeJob,
      status: 'cancelled',
      endTime: new Date()
    } : null
  })),

  // Online status
  setOnlineStatus: (isOnline) => set({ isOnline }),

  // Location management
  setCurrentLocation: (location) => set({ currentLocation: location }),

  updateETA: (eta) => set((state) => ({
    activeJob: state.activeJob ? { ...state.activeJob, eta } : null
  })),

  // Utility functions
  clearExpiredRequests: () => {
    const now = new Date();
    set((state) => ({
      pendingRequests: state.pendingRequests.filter(req => req.expiresAt > now)
    }));
  },

  // Reset demo requests (for testing)
  resetDemoRequests: () => {
    const refreshedRequests = mockJobRequests.map(req => ({
      ...req,
      status: 'pending' as const,
      expiresAt: new Date(Date.now() + (Math.floor(Math.random() * 4) + 1) * 60 * 60 * 1000), // 1-4 hours from now
      createdAt: new Date()
    }));
    set({ pendingRequests: refreshedRequests });
  },

  getActiveJobRequests: () => {
    const state = get();
    return state.pendingRequests.filter(req => req.status === 'pending');
  },

  getTodayHistory: () => {
    const state = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return state.jobHistory.filter(job => {
      const jobDate = new Date(job.date);
      jobDate.setHours(0, 0, 0, 0);
      return jobDate.getTime() === today.getTime();
    });
  },

  // Get count of pending requests
  getPendingCount: () => {
    const state = get();
    return state.pendingRequests.length;
  },

  // Get count of accepted jobs
  getAcceptedCount: () => {
    const state = get();
    return state.acceptedJobs.length;
  },

  // Get count of in-progress jobs
  getInProgressCount: () => {
    const state = get();
    return state.inProgressJobs.length;
  },

  // Get count of completed jobs
  getCompletedCount: () => {
    const state = get();
    return state.completedJobs.length;
  },

  // API Integration: Fetch pending requests (rides without driver)
  fetchPendingRequests: async (options) => {
    const isSilent = options?.silent === true;
    if (!isSilent) {
      set({ loadingPending: true });
    }
    try {
      const response = await DriverRidesApiService.getPendingRides(50);
      if (response.success && response.data) {
        const requests = normalizeBookings(response.data)
          .filter((ride) => PENDING_BOOKING_STATUSES.has(ride.booking_status))
          .map((booking) => mapBookingToJobRequest(booking, 'pending'));
        set({ pendingRequests: dedupeById(requests), lastApiError: null });
      } else {
        // On error, set empty array and store error message
        set({
          pendingRequests: [],
          lastApiError: response.error || 'Failed to fetch pending rides'
        });
      }
    } catch (error) {
      console.error('[JobStore] Error fetching pending requests:', error);
      // On error, set empty array and store error message
      set({
        pendingRequests: [],
        lastApiError: error instanceof Error ? error.message : 'Failed to fetch pending rides'
      });
    } finally {
      if (!isSilent) {
        set({ loadingPending: false });
      }
    }
  },

  // API Integration: Fetch accepted jobs (driver assigned but trip not started)
  fetchAcceptedJobs: async () => {
    set({ loadingAccepted: true });
    try {
      console.log('[JobStore] Fetching accepted jobs...');
      const response = await DriverRidesApiService.getDriverRides('accepted');
      console.log('[JobStore] Accepted jobs API response:', response);
      if (response.success && response.data) {
        const normalized = normalizeBookings(response.data);
        console.log('[JobStore] Normalized accepted bookings:', normalized);
        const accepted = normalized.filter((ride) =>
          ACCEPTED_BOOKING_STATUSES.has(ride.booking_status)
        );
        console.log('[JobStore] Filtered accepted bookings:', accepted);
        const jobs = dedupeById(accepted.map((booking) => mapBookingToJobRequest(booking, 'accepted')));
        console.log('[JobStore] Mapped accepted jobs:', jobs);
        set({ acceptedJobs: jobs });
      } else {
        console.log('[JobStore] Failed to fetch accepted jobs:', response.error);
        set({ acceptedJobs: [] });
      }
    } catch (error) {
      console.error('[JobStore] Error fetching accepted jobs:', error);
      set({ acceptedJobs: [] });
    } finally {
      set({ loadingAccepted: false });
    }
  },

  // API Integration: Fetch in-progress jobs (currently active rides)
  fetchInProgressJobs: async () => {
    set({ loadingInProgress: true });
    try {
      console.log('[JobStore] Fetching in-progress jobs...');
      const response = await DriverRidesApiService.getDriverRides('in-progress');
      console.log('[JobStore] In-progress jobs API response:', response);
      if (response.success && response.data) {
        const normalized = normalizeBookings(response.data);
        console.log('[JobStore] Normalized in-progress bookings:', normalized);
        const inProgress = normalized.filter((ride) =>
          IN_PROGRESS_BOOKING_STATUSES.has(ride.booking_status)
        );
        console.log('[JobStore] Filtered in-progress bookings:', inProgress);
        const jobs = dedupeById(inProgress.map((booking) => mapBookingToJobRequest(booking, 'in-progress')));
        console.log('[JobStore] Mapped in-progress jobs:', jobs);
        set({ inProgressJobs: jobs });

        // Update activeJob if there's an in-progress ride
        if (jobs.length > 0) {
          const latestJob = jobs[0];
          const booking = normalized[0]; // Get raw booking for vehicle info
          const vehicleInfo = booking.vehicle_info as any;

          set({
            activeJob: {
              id: latestJob.id,
              jobRequestId: latestJob.id,
              customerId: latestJob.customerId,
              customerName: latestJob.customerName,
              customerPhone: latestJob.customerPhone,
              pickupLocation: latestJob.pickupLocation,
              dropoffLocation: latestJob.dropoffLocation,
              currentLocation: get().currentLocation || undefined,
              status: latestJob.status as ActiveJob['status'],
              eta: '5 min',
              distance: latestJob.estimatedDistance?.toString() || '5 km',
              fare: latestJob.fare,
              vehicleMake: vehicleInfo?.make,
              vehicleModel: vehicleInfo?.model,
              vehiclePlate: vehicleInfo?.plate,
            }
          });
        }
      } else {
        set({ inProgressJobs: [] });
      }
    } catch (error) {
      console.error('Error fetching in-progress jobs:', error);
      set({ inProgressJobs: [] });
    } finally {
      set({ loadingInProgress: false });
    }
  },

  // API Integration: Fetch completed jobs
  fetchCompletedJobs: async () => {
    set({ loadingCompleted: true });
    try {
      const response = await DriverRidesApiService.getDriverRides('completed');
      console.log('[JobStore] Fetch completed rides response:', response);
      if (response.success && response.data) {
        console.log('[JobStore] Raw completed data:', response.data);
        const completed = normalizeBookings(response.data);
        console.log('[JobStore] Normalized bookings:', completed);
        console.log('[JobStore] Booking statuses:', completed.map(b => b.booking_status));
        const filtered = completed.filter((ride) =>
          COMPLETED_BOOKING_STATUSES.has(ride.booking_status)
        );
        console.log('[JobStore] Filtered completed rides:', filtered);
        const jobs = dedupeById(filtered.map(mapBookingToJobHistory));
        console.log('[JobStore] Mapped completed jobs:', jobs);
        set({ completedJobs: jobs, jobHistory: jobs });
      } else {
        console.log('[JobStore] Failed to fetch completed rides:', response.error);
        set({ completedJobs: [], jobHistory: [] });
      }
    } catch (error) {
      console.error('[JobStore] Error fetching completed jobs:', error);
      set({ completedJobs: [], jobHistory: [] });
    } finally {
      set({ loadingCompleted: false });
    }
  },

  // API Integration: Fetch all driver jobs at once
  fetchAllDriverJobs: async () => {
    const state = get();
    await Promise.all([
      state.fetchPendingRequests(),
      state.fetchAcceptedJobs(),
      state.fetchInProgressJobs(),
      state.fetchCompletedJobs(),
    ]);
  },

  // API Integration: Accept a ride
  acceptRideFromAPI: async (rideId: string) => {
    try {
      set({ lastAcceptError: null });
      const response = await DriverRidesApiService.acceptRide(rideId);
      if (response.success) {
        // Get the accepted ride details
        const acceptedRide = response.data;
        const customerDetails = typeof acceptedRide.customer_details === 'object'
          ? acceptedRide.customer_details
          : null;
        const vehicleInfo = (acceptedRide as any).vehicle_info;

        const activeJob: ActiveJob = {
          id: rideId,
          jobRequestId: rideId,
          customerId: customerDetails?.id || '',
          customerName: customerDetails?.name || 'Customer',
          customerPhone: customerDetails?.mobile || '',
          pickupLocation: {
            latitude: parseFloat(String(acceptedRide.pickup_lat)) || 0,
            longitude: parseFloat(String(acceptedRide.pickup_long)) || 0,
            address: acceptedRide.pickup_address,
          },
          dropoffLocation: {
            latitude: parseFloat(String(acceptedRide.dropoff_lat)) || 0,
            longitude: parseFloat(String(acceptedRide.dropoff_long)) || 0,
            address: acceptedRide.dropoff_address,
          },
          currentLocation: get().currentLocation || undefined,
          status: 'accepted',
          fare: parseFloat(String(acceptedRide.estimated_fare)) || 0,
          route: [],
          eta: '15 min',
          lastLocationUpdate: new Date(),
          vehicleMake: vehicleInfo?.make,
          vehicleModel: vehicleInfo?.model,
          vehiclePlate: vehicleInfo?.plate,
        };

        // Remove from pending and set active
        const state = get();
        set({
          pendingRequests: state.pendingRequests.filter(req => req.id !== rideId),
          activeJob,
          acceptedJobs: [...state.acceptedJobs, {
            ...state.pendingRequests.find(req => req.id === rideId)!,
            status: 'accepted' as const
          }]
        });

        // Refresh accepted jobs from API to ensure sync with backend
        await get().fetchAcceptedJobs();

        return true;
      } else {
        set({ lastAcceptError: response.error || 'Failed to accept ride' });
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to accept ride';
      console.error('Error accepting ride:', error);
      set({ lastAcceptError: message });
      return false;
    }
  },

  // API Integration: Start a ride
  startRideFromAPI: async (rideId: string) => {
    try {
      // Default pickup location (can be enhanced with actual GPS)
      const startData = {
        pickup_lat: '0',
        pickup_long: '0',
      };

      const response = await DriverRidesApiService.startTrip(rideId, startData);
      if (response.success) {
        set((state) => ({
          activeJob: state.activeJob ? {
            ...state.activeJob,
            status: 'started',
            startTime: new Date()
          } : null
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error starting ride:', error);
      return false;
    }
  },

  // API Integration: Complete a ride
  completeRideFromAPI: async (rideId: string, data?: any) => {
    try {
      const completeData = {
        dropoff_lat: data?.dropoff_lat || '0',
        dropoff_long: data?.dropoff_long || '0',
        actual_distance_km: data?.actual_distance_km?.toString() || '0',
        actual_duration_minutes: data?.actual_duration_minutes || 0,
      };

      const response = await DriverRidesApiService.completeTrip(rideId, completeData);
      if (response.success) {
        const state = get();
        if (state.activeJob) {
          const completedJob: JobHistory = {
            id: state.activeJob.id,
            customerId: state.activeJob.customerId,
            customerName: state.activeJob.customerName,
            date: new Date(),
            pickupLocation: state.activeJob.pickupLocation,
            dropoffLocation: state.activeJob.dropoffLocation || state.activeJob.pickupLocation,
            duration: state.activeJob.actualDuration || 0,
            distance: state.activeJob.actualDistance || 0,
            fare: state.activeJob.fare,
            tips: 0,
            rating: undefined,
            status: 'completed'
          };

          set({
            activeJob: null,
            jobHistory: [completedJob, ...state.jobHistory],
            completedJobs: [completedJob, ...state.completedJobs],
            acceptedJobs: state.acceptedJobs.filter(job => job.id !== rideId)
          });
        }

        // Refresh completed jobs from API to ensure sync
        await get().fetchCompletedJobs();

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error completing ride:', error);
      return false;
    }
  }
}));

// Auto-cleanup expired requests every minute
setInterval(() => {
  useJobStore.getState().clearExpiredRequests();
}, 60000);

const PENDING_POLL_INTERVAL_MS = isProduction() ? 2000 : 120000;

// Poll pending ride requests on interval (silent in background)
setInterval(() => {
  const state = useJobStore.getState();
  if (!state.loadingPending) {
    state.fetchPendingRequests({ silent: true });
  }
}, PENDING_POLL_INTERVAL_MS);
