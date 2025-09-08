import { create } from 'zustand';
import { EarningsBreakdown, DriverEarnings } from '../types/navigation';

interface EarningsState {
  // Current earnings data
  earnings: DriverEarnings;
  dailyBreakdown: EarningsBreakdown[];
  weeklyTarget: number;
  monthlyTarget: number;
  
  // Incentives and bonuses
  activeIncentives: Incentive[];
  completedIncentives: Incentive[];
  
  // Actions
  updateTodayEarnings: (amount: number, tips?: number, incentives?: number) => void;
  addJobEarnings: (fare: number, tips: number, distance: number, duration: number) => void;
  setWeeklyTarget: (target: number) => void;
  setMonthlyTarget: (target: number) => void;
  updatePendingAmount: (amount: number) => void;
  recordPayout: (amount: number) => void;
  
  // Analytics
  getWeeklyEarnings: () => number;
  getMonthlyEarnings: () => number;
  getAveragePerRide: () => number;
  getAveragePerHour: () => number;
  getTotalRidesThisWeek: () => number;
  getTotalRidesThisMonth: () => number;
  getWeeklyProgress: () => number;
  getMonthlyProgress: () => number;
  getTodayHistory: () => EarningsBreakdown | undefined;
}

interface Incentive {
  id: string;
  title: string;
  description: string;
  type: 'rides' | 'earnings' | 'hours' | 'rating';
  target: number;
  current: number;
  reward: number;
  isCompleted: boolean;
  expiresAt: Date;
  createdAt: Date;
}

// Mock data for development
const mockDailyBreakdown: EarningsBreakdown[] = [
  {
    date: new Date(),
    totalEarnings: 10700,
    baseFare: 9500,
    tips: 800,
    incentives: 400,
    fuelReimbursement: 0,
    totalRides: 8,
    onlineHours: 9.5,
    averageRating: 4.9
  },
  {
    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    totalEarnings: 8200,
    baseFare: 7100,
    tips: 600,
    incentives: 500,
    fuelReimbursement: 0,
    totalRides: 6,
    onlineHours: 8,
    averageRating: 4.8
  },
  {
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    totalEarnings: 16000,
    baseFare: 14500,
    tips: 1000,
    incentives: 500,
    fuelReimbursement: 0,
    totalRides: 10,
    onlineHours: 10.5,
    averageRating: 4.9
  },
  {
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    totalEarnings: 12500,
    baseFare: 11200,
    tips: 800,
    incentives: 500,
    fuelReimbursement: 0,
    totalRides: 9,
    onlineHours: 9,
    averageRating: 4.7
  },
  {
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    totalEarnings: 14800,
    baseFare: 13200,
    tips: 900,
    incentives: 700,
    fuelReimbursement: 0,
    totalRides: 11,
    onlineHours: 11,
    averageRating: 4.8
  },
  {
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    totalEarnings: 11200,
    baseFare: 9800,
    tips: 700,
    incentives: 700,
    fuelReimbursement: 0,
    totalRides: 7,
    onlineHours: 8.5,
    averageRating: 4.9
  },
  {
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    totalEarnings: 9800,
    baseFare: 8600,
    tips: 600,
    incentives: 600,
    fuelReimbursement: 0,
    totalRides: 6,
    onlineHours: 7.5,
    averageRating: 4.8
  }
];

const mockActiveIncentives: Incentive[] = [
  {
    id: '1',
    title: 'Weekly Ride Challenge',
    description: 'Complete 80 rides this week to earn bonus',
    type: 'rides',
    target: 80,
    current: 68,
    reward: 2000,
    isCompleted: false,
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    title: 'Peak Hours Bonus',
    description: 'Work 50 hours during peak times',
    type: 'hours',
    target: 50,
    current: 42,
    reward: 1500,
    isCompleted: false,
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    title: 'Rating Excellence',
    description: 'Maintain 4.8+ rating with 50+ rides',
    type: 'rating',
    target: 4.8,
    current: 4.85,
    reward: 1000,
    isCompleted: false,
    expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // End of month
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  }
];

export const useEarningsStore = create<EarningsState>((set, get) => ({
  // Initial state
  earnings: {
    totalEarnings: 245000,
    weeklyEarnings: 82400,
    monthlyEarnings: 245000,
    todayEarnings: 10700,
    pendingAmount: 4200,
    lastPayout: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
  },
  
  dailyBreakdown: mockDailyBreakdown,
  weeklyTarget: 67000,
  monthlyTarget: 280000,
  activeIncentives: mockActiveIncentives,
  completedIncentives: [],

  // Actions
  updateTodayEarnings: (amount, tips = 0, incentives = 0) => {
    set((state) => {
      const today = new Date();
      const todayBreakdown = state.dailyBreakdown.find(day => 
        day.date.toDateString() === today.toDateString()
      );

      if (todayBreakdown) {
        todayBreakdown.totalEarnings += amount;
        todayBreakdown.baseFare += amount - tips - incentives;
        todayBreakdown.tips += tips;
        todayBreakdown.incentives += incentives;
      }

      return {
        earnings: {
          ...state.earnings,
          todayEarnings: state.earnings.todayEarnings + amount,
          weeklyEarnings: state.earnings.weeklyEarnings + amount,
          monthlyEarnings: state.earnings.monthlyEarnings + amount,
          totalEarnings: state.earnings.totalEarnings + amount,
          pendingAmount: state.earnings.pendingAmount + amount
        }
      };
    });
  },

  addJobEarnings: (fare, tips, distance, duration) => {
    set((state) => {
      const today = new Date();
      const todayBreakdown = state.dailyBreakdown.find(day => 
        day.date.toDateString() === today.toDateString()
      );

      const totalAmount = fare + tips;

      if (todayBreakdown) {
        todayBreakdown.totalEarnings += totalAmount;
        todayBreakdown.baseFare += fare;
        todayBreakdown.tips += tips;
        todayBreakdown.totalRides += 1;
      }

      return {
        earnings: {
          ...state.earnings,
          todayEarnings: state.earnings.todayEarnings + totalAmount,
          weeklyEarnings: state.earnings.weeklyEarnings + totalAmount,
          monthlyEarnings: state.earnings.monthlyEarnings + totalAmount,
          totalEarnings: state.earnings.totalEarnings + totalAmount,
          pendingAmount: state.earnings.pendingAmount + totalAmount
        }
      };
    });
  },

  setWeeklyTarget: (target) => set({ weeklyTarget: target }),

  setMonthlyTarget: (target) => set({ monthlyTarget: target }),

  updatePendingAmount: (amount) => set((state) => ({
    earnings: {
      ...state.earnings,
      pendingAmount: amount
    }
  })),

  recordPayout: (amount) => set((state) => ({
    earnings: {
      ...state.earnings,
      pendingAmount: Math.max(0, state.earnings.pendingAmount - amount),
      lastPayout: new Date()
    }
  })),

  // Analytics functions
  getWeeklyEarnings: () => {
    const state = get();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return state.dailyBreakdown
      .filter(day => day.date >= oneWeekAgo)
      .reduce((total, day) => total + day.totalEarnings, 0);
  },

  getMonthlyEarnings: () => {
    const state = get();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    return state.dailyBreakdown
      .filter(day => day.date >= oneMonthAgo)
      .reduce((total, day) => total + day.totalEarnings, 0);
  },

  getAveragePerRide: () => {
    const state = get();
    const totalEarnings = state.dailyBreakdown.reduce((sum, day) => sum + day.totalEarnings, 0);
    const totalRides = state.dailyBreakdown.reduce((sum, day) => sum + day.totalRides, 0);
    
    return totalRides > 0 ? totalEarnings / totalRides : 0;
  },

  getAveragePerHour: () => {
    const state = get();
    const totalEarnings = state.dailyBreakdown.reduce((sum, day) => sum + day.totalEarnings, 0);
    const totalHours = state.dailyBreakdown.reduce((sum, day) => sum + day.onlineHours, 0);
    
    return totalHours > 0 ? totalEarnings / totalHours : 0;
  },

  getTotalRidesThisWeek: () => {
    const state = get();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return state.dailyBreakdown
      .filter(day => day.date >= oneWeekAgo)
      .reduce((total, day) => total + day.totalRides, 0);
  },

  getTotalRidesThisMonth: () => {
    const state = get();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    return state.dailyBreakdown
      .filter(day => day.date >= oneMonthAgo)
      .reduce((total, day) => total + day.totalRides, 0);
  },

  getWeeklyProgress: () => {
    const state = get();
    return Math.min((state.earnings.weeklyEarnings / state.weeklyTarget) * 100, 100);
  },

  getMonthlyProgress: () => {
    const state = get();
    return Math.min((state.earnings.monthlyEarnings / state.monthlyTarget) * 100, 100);
  },

  getTodayHistory: () => {
    const state = get();
    const today = new Date();
    return state.dailyBreakdown.find(day => 
      day.date.toDateString() === today.toDateString()
    );
  }
}));