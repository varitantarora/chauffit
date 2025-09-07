import { create } from 'zustand';
import { CustomerCar } from '../types/navigation';

interface CarState {
  // Car data
  cars: CustomerCar[];
  defaultCar: CustomerCar | null;
  isLoading: boolean;
  
  // Form state for adding/editing cars
  currentCarForm: Partial<CustomerCar> | null;
  
  // Actions
  setCars: (cars: CustomerCar[]) => void;
  addCar: (car: Omit<CustomerCar, 'id'>) => Promise<CustomerCar>;
  updateCar: (id: string, updates: Partial<CustomerCar>) => Promise<void>;
  deleteCar: (id: string) => Promise<void>;
  setDefaultCar: (id: string) => Promise<void>;
  
  // Form actions
  setCurrentCarForm: (car: Partial<CustomerCar> | null) => void;
  updateCarForm: (updates: Partial<CustomerCar>) => void;
  clearCarForm: () => void;
  
  // Utility actions
  getCarById: (id: string) => CustomerCar | undefined;
  loadUserCars: (userId: string) => Promise<void>;
}

// Mock data for development
const mockCars: CustomerCar[] = [
  {
    id: '1',
    make: 'BMW',
    model: 'X5',
    year: 2022,
    color: 'Black',
    registrationNumber: 'DL 01 AB 1234',
    isDefault: true,
  },
  {
    id: '2',
    make: 'Mercedes-Benz',
    model: 'E-Class',
    year: 2021,
    color: 'Silver',
    registrationNumber: 'DL 02 CD 5678',
    isDefault: false,
  },
];

export const useCarStore = create<CarState>((set, get) => ({
  // Initial state
  cars: [],
  defaultCar: null,
  isLoading: false,
  currentCarForm: null,

  // Actions
  setCars: (cars) => {
    const defaultCar = cars.find(car => car.isDefault) || cars[0] || null;
    set({ cars, defaultCar });
  },

  addCar: async (carData) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newCar: CustomerCar = {
      ...carData,
      id: `car_${Date.now()}`,
      isDefault: get().cars.length === 0, // First car becomes default
    };
    
    const updatedCars = [...get().cars, newCar];
    const defaultCar = newCar.isDefault ? newCar : get().defaultCar;
    
    set({ 
      cars: updatedCars, 
      defaultCar,
      isLoading: false,
      currentCarForm: null 
    });
    
    return newCar;
  },

  updateCar: async (id, updates) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedCars = get().cars.map(car =>
      car.id === id ? { ...car, ...updates } : car
    );
    
    // If this car was set as default, update all other cars
    if (updates.isDefault === true) {
      updatedCars.forEach(car => {
        if (car.id !== id) {
          car.isDefault = false;
        }
      });
    }
    
    const defaultCar = updatedCars.find(car => car.isDefault) || updatedCars[0] || null;
    
    set({ 
      cars: updatedCars, 
      defaultCar,
      isLoading: false,
      currentCarForm: null 
    });
  },

  deleteCar: async (id) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const carToDelete = get().cars.find(car => car.id === id);
    const updatedCars = get().cars.filter(car => car.id !== id);
    
    // If deleted car was default and there are other cars, make the first one default
    if (carToDelete?.isDefault && updatedCars.length > 0) {
      updatedCars[0].isDefault = true;
    }
    
    const defaultCar = updatedCars.find(car => car.isDefault) || updatedCars[0] || null;
    
    set({ 
      cars: updatedCars, 
      defaultCar,
      isLoading: false 
    });
  },

  setDefaultCar: async (id) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedCars = get().cars.map(car => ({
      ...car,
      isDefault: car.id === id
    }));
    
    const defaultCar = updatedCars.find(car => car.isDefault) || null;
    
    set({ 
      cars: updatedCars, 
      defaultCar,
      isLoading: false 
    });
  },

  // Form actions
  setCurrentCarForm: (car) => set({ currentCarForm: car }),
  
  updateCarForm: (updates) => set((state) => ({
    currentCarForm: state.currentCarForm ? { ...state.currentCarForm, ...updates } : updates
  })),
  
  clearCarForm: () => set({ currentCarForm: null }),

  // Utility actions
  getCarById: (id) => get().cars.find(car => car.id === id),

  loadUserCars: async (userId) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would fetch cars for the specific user
    const userCars = mockCars;
    const defaultCar = userCars.find(car => car.isDefault) || userCars[0] || null;
    
    set({ 
      cars: userCars, 
      defaultCar,
      isLoading: false 
    });
  },
}));