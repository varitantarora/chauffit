import { create } from 'zustand';
import LoyaltyApiService, {
  CustomerLoyaltyProfile,
  CreditTransaction,
  ReferralEvent,
} from '../services/api/LoyaltyApiService';

interface LoyaltyState {
  profile: CustomerLoyaltyProfile | null;
  transactions: CreditTransaction[];
  referrals: ReferralEvent[];
  isLoadingProfile: boolean;
  isLoadingTransactions: boolean;
  isLoadingReferrals: boolean;
  error: string | null;
  // Bridge to booking flow: credits the user wants to apply to a booking
  pendingCreditsToApply: number;

  fetchProfile: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchReferrals: () => Promise<void>;
  fetchAll: () => Promise<void>;
  setPendingCreditsToApply: (amount: number) => void;
  clearPendingCredits: () => void;
  resetLoyaltyState: () => void;
}

export const useLoyaltyStore = create<LoyaltyState>((set, get) => ({
  profile: null,
  transactions: [],
  referrals: [],
  isLoadingProfile: false,
  isLoadingTransactions: false,
  isLoadingReferrals: false,
  error: null,
  pendingCreditsToApply: 0,

  fetchProfile: async () => {
    set({ isLoadingProfile: true, error: null });
    const response = await LoyaltyApiService.getProfile();
    if (response.success && response.data) {
      set({ profile: response.data, isLoadingProfile: false });
    } else {
      set({ error: response.error || 'Failed to fetch profile', isLoadingProfile: false });
    }
  },

  fetchTransactions: async () => {
    set({ isLoadingTransactions: true });
    const response = await LoyaltyApiService.getTransactions();
    if (response.success && response.data) {
      set({ transactions: response.data, isLoadingTransactions: false });
    } else {
      set({ isLoadingTransactions: false });
    }
  },

  fetchReferrals: async () => {
    set({ isLoadingReferrals: true });
    const response = await LoyaltyApiService.getReferrals();
    if (response.success && response.data) {
      set({ referrals: response.data, isLoadingReferrals: false });
    } else {
      set({ isLoadingReferrals: false });
    }
  },

  fetchAll: async () => {
    const { fetchProfile, fetchTransactions, fetchReferrals } = get();
    await Promise.all([fetchProfile(), fetchTransactions(), fetchReferrals()]);
  },

  setPendingCreditsToApply: (amount) => set({ pendingCreditsToApply: amount }),

  clearPendingCredits: () => set({ pendingCreditsToApply: 0 }),

  resetLoyaltyState: () =>
    set({
      profile: null,
      transactions: [],
      referrals: [],
      isLoadingProfile: false,
      isLoadingTransactions: false,
      isLoadingReferrals: false,
      error: null,
      pendingCreditsToApply: 0,
    }),
}));
