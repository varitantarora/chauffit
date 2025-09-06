import { create } from 'zustand';
import { User, UserRole } from '../types/navigation';

interface AuthState {
  user: User | null;
  roles: UserRole[];
  activeRole: UserRole;
  isAuthenticated: boolean;
  isDarkMode: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setActiveRole: (role: UserRole) => void;
  addRole: (role: UserRole) => void;
  removeRole: (role: UserRole) => void;
  toggleTheme: () => void;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  roles: [],
  activeRole: 'customer',
  isAuthenticated: false,
  isDarkMode: false,
  
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
  
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  
  login: (user) => set((state) => ({
    user,
    isAuthenticated: true,
    roles: state.roles.length > 0 ? state.roles : ['customer'],
    activeRole: state.activeRole || 'customer'
  })),
  
  logout: () => set({
    user: null,
    isAuthenticated: false,
    roles: [],
    activeRole: 'customer'
  }),
}));