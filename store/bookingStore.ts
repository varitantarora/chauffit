import { create } from 'zustand';
import { BookingDetails, Chauffeur, Location, RideTracking, PaymentMethod } from '../types/navigation';
import { InsurancePlan } from '../services/api/InsuranceApiService';

interface BookingState {
  // Current booking flow data
  currentBooking: Partial<BookingDetails> | null;
  selectedDuration: string;
  selectedChauffeur: Chauffeur | null;
  selectedPaymentMethod: PaymentMethod | null;
  selectedInsurancePlan: InsurancePlan | null;

  // Booking history and active bookings
  activeBookings: BookingDetails[];
  bookingHistory: BookingDetails[];

  // Available chauffeurs
  availableChauffeurs: Chauffeur[];
  loadingChauffeurs: boolean;

  // Ride tracking
  activeRideTracking: RideTracking | null;

  // Location data
  currentLocation: Location | null;
  pickupLocation: Location | null;

  // Actions
  setCurrentBooking: (booking: Partial<BookingDetails>) => void;
  updateBookingDetails: (updates: Partial<BookingDetails>) => void;
  setSelectedDuration: (duration: string) => void;
  setSelectedChauffeur: (chauffeur: Chauffeur | null) => void;
  setSelectedPaymentMethod: (method: PaymentMethod | null) => void;
  setSelectedInsurancePlan: (plan: InsurancePlan | null) => void;
  clearSelectedInsurancePlan: () => void;
  
  // Chauffeur actions
  loadAvailableChauffeurs: () => Promise<void>;
  searchChauffeurs: (location: Location, duration: string) => Promise<void>;
  
  // Booking actions
  createBooking: (bookingDetails: BookingDetails) => Promise<BookingDetails>;
  confirmBooking: (bookingId: string) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  
  // Location actions
  setCurrentLocation: (location: Location) => void;
  setPickupLocation: (location: Location) => void;
  
  // Ride tracking actions
  startRideTracking: (bookingId: string) => void;
  updateRideTracking: (tracking: RideTracking) => void;
  stopRideTracking: () => void;
  
  // Reset actions
  clearCurrentBooking: () => void;
  resetBookingFlow: () => void;
}

// Mock data for development
const mockChauffeurs: Chauffeur[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    rating: 4.8,
    experience: 8,
    certifications: ['Premium License', 'First Aid', 'Defensive Driving'],
    eta: '12 mins',
    phone: '+91 98765 43210',
    location: { latitude: 28.4595, longitude: 77.0266 },
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Suresh Sharma',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    rating: 4.6,
    experience: 6,
    certifications: ['Premium License', 'Safe Driver'],
    eta: '18 mins',
    phone: '+91 98765 43211',
    location: { latitude: 28.4695, longitude: 77.0366 },
    isAvailable: true,
  },
  {
    id: '3',
    name: 'Mohammad Ali',
    photo: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150',
    rating: 4.9,
    experience: 12,
    certifications: ['Premium License', 'First Aid', 'Luxury Car Certified'],
    eta: '25 mins',
    phone: '+91 98765 43212',
    location: { latitude: 28.4795, longitude: 77.0466 },
    isAvailable: true,
  },
];

// Demo booking data
const demoBookings: BookingDetails[] = [
  {
    id: 'demo_1',
    userId: '1',
    chauffeurId: '1',
    chauffeurName: 'Rajesh Kumar',
    duration: 'One-way',
    pickupLocation: {
      address: 'Connaught Place, New Delhi',
      latitude: 28.6289,
      longitude: 77.2065,
    },
    dropLocation: {
      address: 'India Gate, New Delhi',
      latitude: 28.6129,
      longitude: 77.2295,
    },
    startTime: new Date('2024-01-15T10:00:00'),
    endTime: new Date('2024-01-15T14:00:00'),
    price: 850,
    totalAmount: 850,
    status: 'completed',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    vehicleType: 'sedan',
    createdAt: new Date('2024-01-15T09:30:00'),
    updatedAt: new Date('2024-01-15T14:00:00'),
  },
  {
    id: 'demo_2',
    userId: '1',
    chauffeurId: '2',
    chauffeurName: 'Suresh Sharma',
    duration: 'Round-trip',
    pickupLocation: {
      address: 'Select City Walk, Saket',
      latitude: 28.5287,
      longitude: 77.2196,
    },
    dropLocation: {
      address: 'DLF Mall, Vasant Kunj',
      latitude: 28.5433,
      longitude: 77.1589,
    },
    startTime: new Date('2024-01-20T16:00:00'),
    endTime: new Date('2024-01-20T18:00:00'),
    price: 1350,
    totalAmount: 1350,
    status: 'completed',
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    vehicleType: 'sedan',
    createdAt: new Date('2024-01-20T15:30:00'),
    updatedAt: new Date('2024-01-20T18:00:00'),
  },
  {
    id: 'demo_3',
    userId: '1',
    chauffeurId: '3',
    chauffeurName: 'Mohammad Ali',
    duration: 'One-way',
    pickupLocation: {
      address: 'IGI Airport Terminal 3',
      latitude: 28.5562,
      longitude: 77.0999,
    },
    dropLocation: {
      address: 'Cyber Hub, Gurgaon',
      latitude: 28.6139,
      longitude: 77.2090,
    },
    startTime: new Date('2024-01-25T08:00:00'),
    endTime: new Date('2024-01-25T16:00:00'),
    price: 2200,
    totalAmount: 2200,
    status: 'cancelled',
    paymentMethod: 'cash',
    paymentStatus: 'refunded',
    vehicleType: 'suv',
    createdAt: new Date('2024-01-24T20:00:00'),
    updatedAt: new Date('2024-01-25T07:00:00'),
  },
  {
    id: 'demo_4',
    userId: '1',
    chauffeurId: '1',
    chauffeurName: 'Rajesh Kumar',
    duration: 'One-way',
    pickupLocation: {
      address: 'Home - Sector 56, Gurgaon',
      latitude: 28.4595,
      longitude: 77.0266,
    },
    dropLocation: {
      address: 'DLF Phase 3, Gurgaon',
      latitude: 28.4695,
      longitude: 77.0366,
    },
    startTime: new Date('2024-01-18T09:00:00'),
    endTime: new Date('2024-01-18T09:45:00'),
    price: 650,
    totalAmount: 650,
    status: 'completed',
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    vehicleType: 'sedan',
    createdAt: new Date('2024-01-18T08:30:00'),
    updatedAt: new Date('2024-01-18T09:45:00'),
  },
  {
    id: 'demo_5',
    userId: '1',
    chauffeurId: '2',
    chauffeurName: 'Suresh Sharma',
    duration: '4hr',
    pickupLocation: {
      address: 'Hotel Taj, Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
    },
    dropLocation: {
      address: 'City Tour - Multiple Stops',
      latitude: 28.6289,
      longitude: 77.2065,
    },
    startTime: new Date('2024-01-12T10:00:00'),
    endTime: new Date('2024-01-12T14:00:00'),
    price: 2400,
    totalAmount: 2400,
    status: 'completed',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    vehicleType: 'suv',
    createdAt: new Date('2024-01-12T09:00:00'),
    updatedAt: new Date('2024-01-12T14:00:00'),
  },
];

const demoActiveBookings: BookingDetails[] = [
  {
    id: 'active_1',
    userId: '1',
    chauffeurId: '1',
    chauffeurName: 'Rajesh Kumar',
    duration: 'One-way',
    pickupLocation: {
      address: 'Nehru Place Metro Station',
      latitude: 28.5505,
      longitude: 77.2515,
    },
    dropLocation: {
      address: 'Qutub Minar',
      latitude: 28.5244,
      longitude: 77.1855,
    },
    startTime: new Date(Date.now() + 30 * 60000), // 30 minutes from now
    endTime: new Date(Date.now() + 210 * 60000), // 3.5 hours from now
    price: 950,
    totalAmount: 950,
    status: 'confirmed',
    paymentMethod: 'card',
    paymentStatus: 'pending',
    vehicleType: 'sedan',
    createdAt: new Date(Date.now() - 15 * 60000), // 15 minutes ago
    updatedAt: new Date(),
  },
  {
    id: 'active_2',
    userId: '1',
    chauffeurId: '2',
    chauffeurName: 'Suresh Sharma',
    duration: '2hr',
    pickupLocation: {
      address: 'Your Current Location',
      latitude: 28.6139,
      longitude: 77.2090,
    },
    dropLocation: {
      address: 'Business Meeting - Multiple Stops',
      latitude: 28.5535,
      longitude: 77.2588,
    },
    startTime: new Date(),
    endTime: new Date(Date.now() + 120 * 60000), // 2 hours from now
    price: 1200,
    totalAmount: 1200,
    status: 'in_progress',
    paymentMethod: 'upi',
    paymentStatus: 'pending',
    vehicleType: 'sedan',
    createdAt: new Date(Date.now() - 5 * 60000), // 5 minutes ago
    updatedAt: new Date(),
  },
];

export const useBookingStore = create<BookingState>((set, get) => ({
  // Initial state with demo data
  currentBooking: null,
  selectedDuration: '',
  selectedChauffeur: null,
  selectedPaymentMethod: null,
  selectedInsurancePlan: null,
  activeBookings: demoActiveBookings,
  bookingHistory: demoBookings,
  availableChauffeurs: [],
  loadingChauffeurs: false,
  activeRideTracking: null,
  currentLocation: null,
  pickupLocation: null,

  // Actions
  setCurrentBooking: (booking) => set({ currentBooking: booking }),
  
  updateBookingDetails: (updates) => set((state) => ({
    currentBooking: state.currentBooking ? { ...state.currentBooking, ...updates } : updates
  })),
  
  setSelectedDuration: (duration) => set({ selectedDuration: duration }),
  
  setSelectedChauffeur: (chauffeur) => set({ selectedChauffeur: chauffeur }),
  
  setSelectedPaymentMethod: (method) => set({ selectedPaymentMethod: method }),

  setSelectedInsurancePlan: (plan) => set({ selectedInsurancePlan: plan }),

  clearSelectedInsurancePlan: () => set({ selectedInsurancePlan: null }),

  // Chauffeur actions
  loadAvailableChauffeurs: async () => {
    set({ loadingChauffeurs: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    set({ 
      availableChauffeurs: mockChauffeurs,
      loadingChauffeurs: false 
    });
  },

  searchChauffeurs: async (location, duration) => {
    set({ loadingChauffeurs: true });
    
    // Simulate API call with location and duration filters
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Filter mock data based on duration (in real app, this would be server-side)
    const filteredChauffeurs = mockChauffeurs.map((chauffeur, index) => ({
      ...chauffeur,
      eta: duration === '2hr' ? `${10 + index * 5} mins` : `${15 + index * 7} mins`
    }));
    
    set({ 
      availableChauffeurs: filteredChauffeurs,
      loadingChauffeurs: false 
    });
  },

  // Booking actions
  createBooking: async (bookingDetails) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newBooking: BookingDetails = {
      ...bookingDetails,
      id: `booking_${Date.now()}`,
      createdAt: new Date(),
      status: 'pending',
      paymentStatus: 'pending',
    };
    
    set((state) => ({
      activeBookings: [...state.activeBookings, newBooking],
      currentBooking: null,
    }));
    
    return newBooking;
  },

  confirmBooking: async (bookingId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set((state) => ({
      activeBookings: state.activeBookings.map(booking =>
        booking.id === bookingId 
          ? { ...booking, status: 'confirmed' as const, updatedAt: new Date() }
          : booking
      )
    }));
  },

  cancelBooking: async (bookingId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set((state) => ({
      activeBookings: state.activeBookings.map(booking =>
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' as const, updatedAt: new Date() }
          : booking
      )
    }));
  },

  // Location actions
  setCurrentLocation: (location) => set({ currentLocation: location }),
  
  setPickupLocation: (location) => set({ pickupLocation: location }),

  // Ride tracking actions
  startRideTracking: (bookingId) => {
    const booking = get().activeBookings.find(b => b.id === bookingId);
    if (booking && booking.chauffeurId) {
      const chauffeur = get().availableChauffeurs.find(c => c.id === booking.chauffeurId);
      if (chauffeur) {
        const tracking: RideTracking = {
          bookingId,
          chauffeurLocation: {
            latitude: chauffeur.location.latitude,
            longitude: chauffeur.location.longitude,
            address: 'Driver Location',
          },
          customerLocation: booking.pickupLocation,
          eta: chauffeur.eta,
          status: 'driver_coming',
          lastUpdated: new Date(),
        };
        set({ activeRideTracking: tracking });
      }
    }
  },

  updateRideTracking: (tracking) => set({ activeRideTracking: tracking }),
  
  stopRideTracking: () => set({ activeRideTracking: null }),

  // Reset actions
  clearCurrentBooking: () => set({ currentBooking: null }),

  resetBookingFlow: () => set({
    currentBooking: null,
    selectedDuration: '',
    selectedChauffeur: null,
    selectedPaymentMethod: null,
    selectedInsurancePlan: null,
    pickupLocation: null,
  }),
}));