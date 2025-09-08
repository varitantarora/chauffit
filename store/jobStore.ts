import { create } from 'zustand';
import { JobRequest, ActiveJob, JobHistory, Location } from '../types/navigation';

interface JobState {
  // Current job requests
  pendingRequests: JobRequest[];
  activeJob: ActiveJob | null;
  jobHistory: JobHistory[];
  
  // Driver status
  isOnline: boolean;
  currentLocation: Location | null;
  
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
  
  // Utility functions
  clearExpiredRequests: () => void;
  getActiveJobRequests: () => JobRequest[];
  getTodayHistory: () => JobHistory[];
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
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
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
    expiresAt: new Date(Date.now() + 8 * 60 * 1000), // 8 minutes from now
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
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
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
    expiresAt: new Date(Date.now() + 12 * 60 * 1000), // 12 minutes from now
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
    expiresAt: new Date(Date.now() + 7 * 60 * 1000), // 7 minutes from now
    createdAt: new Date()
  }
];

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
  // Initial state
  pendingRequests: mockJobRequests,
  activeJob: null,
  jobHistory: mockJobHistory,
  isOnline: false,
  currentLocation: null,

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
  }
}));

// Auto-cleanup expired requests every minute
setInterval(() => {
  useJobStore.getState().clearExpiredRequests();
}, 60000);