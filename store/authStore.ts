import { create } from 'zustand';
import { User, UserRole } from '../types/navigation';
import AuthApiService, { User as ApiUser } from '../services/api/AuthApiService';
import BaseApiService from '../services/api/BaseApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  roles: UserRole[];
  activeRole: UserRole;
  isAuthenticated: boolean;
  isDarkMode: boolean;
  hasSeenOnboarding: boolean;
  hasSelectedTheme: boolean;
  themeMode: 'system' | 'light' | 'dark';
  isInitializing: boolean; // Track auth initialization state

  // Biker-specific state (since we get this from login/profile)
  bikerIsOnline: boolean;

  // Driver-specific state (since we get this from login/profile)
  driverIsOnline: boolean;

  // Driver onboarding status for routing
  driverOnboardingStatus: string | null;

  // User metadata from login/profile API
  userType: UserRole | null; // User type from API (user_type field)
  userCreatedAt: string | null; // Account creation date
  userIsVerified: boolean; // Account verification status

  // Actions
  setUser: (user: User | null) => void;
  setActiveRole: (role: UserRole) => void;
  addRole: (role: UserRole) => void;
  removeRole: (role: UserRole) => void;
  toggleTheme: () => void;
  setThemeMode: (mode: 'system' | 'light' | 'dark') => void;
  login: (user: User) => void;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    phone_number: string;
    password: string;
    first_name: string;
    last_name: string;
    user_type: UserRole;
    date_of_birth?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<User>) => void;
  logout: () => Promise<void>;
  setHasSeenOnboarding: (seen: boolean) => void;
  switchRole: (role: UserRole) => void;
  fetchProfile: () => Promise<boolean>;
  fetchDriverOnboardingStatus: () => Promise<void>;
  initializeAuth: () => Promise<void>; // Initialize auth state on app startup
  setBikerIsOnline: (isOnline: boolean) => void; // Set biker online status
  setDriverIsOnline: (isOnline: boolean) => void; // Set driver online status
}

// Helper to convert API User to app User
const mapApiUserToAppUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.full_name || `${apiUser.first_name} ${apiUser.last_name}`,
    phone: apiUser.phone_number,
    avatar: apiUser.profile_picture,
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  roles: [],
  activeRole: 'customer',
  isAuthenticated: false,
  isDarkMode: false,
  hasSeenOnboarding: false,
  hasSelectedTheme: false,
  themeMode: 'system' as const,
  isInitializing: true, // Start with true, will be set to false after initialization
  bikerIsOnline: false, // Biker online status
  driverIsOnline: false, // Driver online status
  driverOnboardingStatus: null, // Driver onboarding status for routing
  userType: null, // User type from API (user_type field)
  userCreatedAt: null, // Account creation date from API
  userIsVerified: false, // Account verification status from API

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setActiveRole: (role) => set((state) => ({
    activeRole: state.roles.includes(role) ? role : state.activeRole
  })),

  addRole: (role) => set((state) => ({
    roles: state.roles.includes(role) ? state.roles : [...state.roles, role]
  })),

  removeRole: (role) => set((state) => ({
    roles: state.roles.filter(r => r !== role),
    activeRole: state.activeRole === role ? 'customer' : state.activeRole
  })),

  toggleTheme: () => {
    const newDarkMode = !get().isDarkMode;
    const { colorScheme } = require('nativewind');
    colorScheme.set(newDarkMode ? 'dark' : 'light');
    set({ isDarkMode: newDarkMode, themeMode: newDarkMode ? 'dark' : 'light' });
    AsyncStorage.setItem('is_dark_mode', JSON.stringify(newDarkMode));
    AsyncStorage.setItem('theme_mode', newDarkMode ? 'dark' : 'light');
  },

  setThemeMode: (mode: 'system' | 'light' | 'dark') => {
    const { colorScheme: cs } = require('nativewind');
    const { Appearance } = require('react-native');
    let isDark: boolean;
    if (mode === 'system') {
      isDark = Appearance.getColorScheme() === 'dark';
    } else {
      isDark = mode === 'dark';
    }
    cs.set(isDark ? 'dark' : 'light');
    set({ isDarkMode: isDark, themeMode: mode, hasSelectedTheme: true });
    AsyncStorage.setItem('is_dark_mode', JSON.stringify(isDark));
    AsyncStorage.setItem('theme_mode', mode);
    AsyncStorage.setItem('has_selected_theme', 'true');
  },

  login: (user) => set((state) => ({
    user,
    isAuthenticated: true,
    roles: state.roles.length > 0 ? state.roles : ['customer'],
    activeRole: state.activeRole || 'customer'
  })),

  loginWithEmail: async (email, password) => {
    try {
      const response = await AuthApiService.login({ email, password });

      if (response.success && response.data) {
        const appUser = mapApiUserToAppUser(response.data.user);
        const userRole = response.data.user.user_type as UserRole;
        const isOnline = response.data.user.status === 'active';

        const updates: any = {
          user: appUser,
          isAuthenticated: true,
          roles: get().roles.includes(userRole) ? get().roles : [...get().roles, userRole],
          activeRole: userRole,
          userType: userRole,
          userCreatedAt: response.data.user.created_at,
          userIsVerified: response.data.user.is_verified,
        };

        // Set online status based on user type
        if (userRole === 'biker') {
          updates.bikerIsOnline = isOnline;
        } else if (userRole === 'driver') {
          updates.driverIsOnline = isOnline;
        }

        set(updates);

        // Also update jobStore for drivers
        if (userRole === 'driver') {
          const { useJobStore } = await import('./jobStore');
          useJobStore.getState().setOnlineStatus(isOnline);
          // Fetch onboarding status for routing
          await get().fetchDriverOnboardingStatus();
        }

        return { success: true };
      }

      return { success: false, error: response.error || 'Login failed' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  },

  register: async (data) => {
    try {
      const response = await AuthApiService.register({
        email: data.email,
        phone_number: data.phone_number,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        user_type: data.user_type,
        date_of_birth: data.date_of_birth,
      });

      if (response.success && response.data) {
        const appUser = mapApiUserToAppUser(response.data.user);
        const userRole = response.data.user.user_type as UserRole;
        const isOnline = response.data.user.status === 'active';

        const updates: any = {
          user: appUser,
          isAuthenticated: true,
          roles: get().roles.includes(userRole) ? get().roles : [...get().roles, userRole],
          activeRole: userRole,
          userType: userRole,
          userCreatedAt: response.data.user.created_at,
          userIsVerified: response.data.user.is_verified,
        };

        // Set online status based on user type
        if (userRole === 'biker') {
          updates.bikerIsOnline = isOnline;
        } else if (userRole === 'driver') {
          updates.driverIsOnline = isOnline;
        }

        set(updates);

        // Also update jobStore for drivers
        if (userRole === 'driver') {
          const { useJobStore } = await import('./jobStore');
          useJobStore.getState().setOnlineStatus(isOnline);
        }

        return { success: true };
      }

      return { success: false, error: response.error || 'Registration failed' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  },

  updateProfile: (updates: Partial<User>) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null
  })),

  logout: async () => {
    try {
      // Try to logout via API if we have a refresh token
      // Note: We'll need to get refresh token from AsyncStorage
      // For now, we'll just clear tokens and update state
      // In a production app, you'd want to call AuthApiService.logout() with the refresh token
      await BaseApiService.clearTokens();

      set({
        user: null,
        isAuthenticated: false,
        roles: [],
        activeRole: 'customer',
        bikerIsOnline: false,
        driverIsOnline: false,
        driverOnboardingStatus: null,
        userType: null,
        userCreatedAt: null,
        userIsVerified: false,
      });
    } catch (error) {
      // Clear state even if API call fails
      await BaseApiService.clearTokens();
      set({
        user: null,
        isAuthenticated: false,
        roles: [],
        activeRole: 'customer',
        bikerIsOnline: false,
        driverIsOnline: false,
        driverOnboardingStatus: null,
        userType: null,
        userCreatedAt: null,
        userIsVerified: false,
      });
    }
  },

  fetchProfile: async () => {
    try {
      console.log('[Auth] Fetch profile start');
      const response = await AuthApiService.getProfile();
      console.log('[Auth] Fetch profile response:', {
        success: response.success,
        userType: response.data?.user_type,
        status: response.data?.status,
        userId: response.data?.id,
      });
      if (response.success && response.data) {
        const appUser = mapApiUserToAppUser(response.data);
        const userRole = response.data.user_type as UserRole;
        const isOnline = response.data.status === 'active';

        const updates: any = {
          user: appUser,
          isAuthenticated: true,
          roles: get().roles.includes(userRole) ? get().roles : [...get().roles, userRole],
          activeRole: userRole, // Always use user_type from API, don't keep existing activeRole
          userType: userRole,
          userCreatedAt: response.data.created_at,
          userIsVerified: response.data.is_verified,
        };

        // Set online status based on user type if status field is available
        if (response.data.status !== undefined) {
          if (userRole === 'biker') {
            updates.bikerIsOnline = isOnline;
          } else if (userRole === 'driver') {
            updates.driverIsOnline = isOnline;
          }
        }

        set(updates);

        // Also update jobStore for drivers if status is available
        if (userRole === 'driver' && response.data.status !== undefined) {
          const { useJobStore } = await import('./jobStore');
          useJobStore.getState().setOnlineStatus(isOnline);
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      return false;
    }
  },

  initializeAuth: async () => {
    try {
      set({ isInitializing: true });

      // Check if tokens exist in AsyncStorage
      const accessToken = await AsyncStorage.getItem('access_token');
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      const savedTheme = await AsyncStorage.getItem('is_dark_mode');
      const savedThemeMode = await AsyncStorage.getItem('theme_mode');
      const savedHasSelectedTheme = await AsyncStorage.getItem('has_selected_theme');
      const isDark = savedTheme ? JSON.parse(savedTheme) : false;

      const { colorScheme } = require('nativewind');
      colorScheme.set(isDark ? 'dark' : 'light');
      set({
        isDarkMode: isDark,
        themeMode: (savedThemeMode as 'system' | 'light' | 'dark') || 'system',
        hasSelectedTheme: savedHasSelectedTheme === 'true',
      });

      if (!accessToken || !refreshToken) {
        // No tokens found, user is not authenticated
        set({
          isAuthenticated: false,
          user: null,
          roles: [],
          activeRole: 'customer',
          isInitializing: false,
          driverOnboardingStatus: null,
          userType: null,
          userCreatedAt: null,
          userIsVerified: false,
        });
        return;
      }

      // Tokens exist, try to fetch user profile to verify session
      const profileFetched = await get().fetchProfile();

      if (!profileFetched) {
        // Profile fetch failed, tokens might be invalid
        // Clear tokens and set as unauthenticated
        await BaseApiService.clearTokens();
        set({
          isAuthenticated: false,
          user: null,
          roles: [],
          activeRole: 'customer',
          isInitializing: false,
          driverOnboardingStatus: null,
          userType: null,
          userCreatedAt: null,
          userIsVerified: false,
        });
        return;
      }

      // If driver, fetch onboarding status for routing
      if (get().activeRole === 'driver') {
        await get().fetchDriverOnboardingStatus();
      }

      // Profile fetched successfully, user is authenticated
      set({ isInitializing: false });
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      // On error, clear tokens and set as unauthenticated
      await BaseApiService.clearTokens();
      set({
        isAuthenticated: false,
        user: null,
        roles: [],
        activeRole: 'customer',
        isInitializing: false,
        driverOnboardingStatus: null,
        userType: null,
        userCreatedAt: null,
        userIsVerified: false,
      });
    }
  },

  fetchDriverOnboardingStatus: async () => {
    try {
      const DriverApiService = (await import('../services/api/DriverApiService')).default;
      const response = await DriverApiService.getOnboardingStatus();
      if (response.success && response.data) {
        set({ driverOnboardingStatus: response.data.current_status });
      }
    } catch (error) {
      console.error('Failed to fetch driver onboarding status:', error);
    }
  },

  setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),

  switchRole: (role) => set((state) => ({
    activeRole: role,
    roles: state.roles.includes(role) ? state.roles : [...state.roles, role]
  })),

  setBikerIsOnline: (isOnline: boolean) => set({ bikerIsOnline: isOnline }),
  setDriverIsOnline: (isOnline: boolean) => set({ driverIsOnline: isOnline }),
}));
