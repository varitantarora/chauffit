import { create } from 'zustand';

interface LoginState {
  loginMethod: 'phone' | 'email';
  phoneNumber: string;
  email: string;
  password: string;
  loading: boolean;
  
  // Actions
  setLoginMethod: (method: 'phone' | 'email') => void;
  setPhoneNumber: (phone: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setLoading: (loading: boolean) => void;
  resetForm: () => void;
}

export const useLoginStore = create<LoginState>((set) => ({
  loginMethod: 'phone',
  phoneNumber: '',
  email: '',
  password: '',
  loading: false,
  
  setLoginMethod: (method) => set({ loginMethod: method }),
  setPhoneNumber: (phone) => set({ phoneNumber: phone }),
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  setLoading: (loading) => set({ loading }),
  resetForm: () => set({
    phoneNumber: '',
    email: '',
    password: '',
    loading: false
  }),
}));