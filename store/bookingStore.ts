import { create } from 'zustand';
import { BookingDetails, Chauffeur, Location, RideTracking, PaymentMethod } from '../types/navigation';

interface BookingState {
  // Current booking flow data
  currentBooking: Partial<BookingDetails> | null;
  selectedDuration: string;
  selectedChauffeur: Chauffeur | null;
  selectedPaymentMethod: PaymentMethod | null;
  
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

export const useBookingStore = create<BookingState>((set, get) => ({
  // Initial state
  currentBooking: null,
  selectedDuration: '',
  selectedChauffeur: null,
  selectedPaymentMethod: null,
  activeBookings: [],
  bookingHistory: [],
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
    pickupLocation: null,
  }),
}));