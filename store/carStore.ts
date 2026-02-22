import { create } from 'zustand';
import { CustomerCar } from '../types/navigation';
import CustomerCarApiService, { CustomerCarApi } from '../services/api/CustomerCarApiService';

// Helper to convert API car to app car
const apiCarToAppCar = (apiCar: CustomerCarApi): CustomerCar => ({
  id: apiCar.id,
  make: apiCar.make,
  model: apiCar.model,
  year: apiCar.year,
  color: apiCar.color,
  registrationNumber: apiCar.plate,
  isDefault: false, // Default handling can be added later if needed
  vehicleType: apiCar.vehicle_type,
  transmission: apiCar.transmission,
});

// Helper to convert app car to API car request
const appCarToApiRequest = (car: Omit<CustomerCar, 'id'>) => ({
  make: car.make,
  model: car.model,
  year: car.year,
  plate: car.registrationNumber,
  color: car.color,
  vehicle_type: car.vehicleType || 'luxury_sedan',
  ...(car.transmission ? { transmission: car.transmission } : {}),
  is_active: true,
});

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

    try {
      const apiRequest = appCarToApiRequest(carData);
      const response = await CustomerCarApiService.addCar(apiRequest);

      if (response.success && response.data) {
        const newCar = apiCarToAppCar(response.data);
        newCar.isDefault = get().cars.length === 0; // First car becomes default

        const updatedCars = [...get().cars, newCar];
        const defaultCar = newCar.isDefault ? newCar : get().defaultCar;

        set({
          cars: updatedCars,
          defaultCar,
          isLoading: false,
          currentCarForm: null
        });

        return newCar;
      } else {
        throw new Error(response.error || 'Failed to add car');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateCar: async (id, updates) => {
    set({ isLoading: true });

    try {
      // Get existing car to build full request
      const existingCar = get().cars.find(car => car.id === id);
      if (!existingCar) {
        throw new Error('Car not found');
      }

      const carData = { ...existingCar, ...updates };
      const apiRequest = appCarToApiRequest(carData);

      const response = await CustomerCarApiService.updateCar(id, apiRequest);

      if (response.success && response.data) {
        const updatedCar = apiCarToAppCar(response.data);
        updatedCar.isDefault = updates.isDefault !== undefined ? updates.isDefault : existingCar.isDefault;

        const updatedCars = get().cars.map(car =>
          car.id === id ? updatedCar : car
        );

        // If this car was set as default, update all other cars
        if (updatedCar.isDefault) {
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
      } else {
        throw new Error(response.error || 'Failed to update car');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteCar: async (id) => {
    set({ isLoading: true });

    try {
      const response = await CustomerCarApiService.deleteCar(id);

      if (response.success) {
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
      } else {
        throw new Error(response.error || 'Failed to delete car');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setDefaultCar: async (id) => {
    set({ isLoading: true });

    try {
      const car = get().cars.find(car => car.id === id);
      if (!car) {
        throw new Error('Car not found');
      }

      // Update all cars via individual update calls
      const updatePromises = get().cars.map(c =>
        CustomerCarApiService.patchCar(c.id, { is_active: c.id === id })
      );

      await Promise.all(updatePromises);

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
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
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

    try {
      const response = await CustomerCarApiService.listCars();

      if (response.success && response.data) {
        const userCars = (response.data as CustomerCarApi[]).map(apiCarToAppCar);
        const defaultCar = userCars.find(car => car.isDefault) || userCars[0] || null;

        set({
          cars: userCars,
          defaultCar,
          isLoading: false
        });
      } else {
        // Empty list on error - user may have no cars yet
        set({
          cars: [],
          defaultCar: null,
          isLoading: false
        });
      }
    } catch (error) {
      // Empty list on error - user may have no cars yet
      set({
        cars: [],
        defaultCar: null,
        isLoading: false
      });
    }
  },
}));