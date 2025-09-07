import { create } from 'zustand';
import { 
  BikerEarnings, 
  BikerShift, 
  TaskHistory, 
  TaskPriority,
  TaskType 
} from '../types/navigation';

interface BikerEarningsState {
  // Current earnings data
  earnings: BikerEarnings;
  
  // Current shift
  currentShift: BikerShift | null;
  shiftHistory: BikerShift[];
  
  // Task history and analytics
  taskHistory: TaskHistory[];
  
  // Earnings breakdown
  dailyEarnings: DailyEarnings[];
  weeklyEarnings: WeeklyEarnings[];
  monthlyEarnings: MonthlyEarnings[];
  
  // Incentives and bonuses
  activeIncentives: Incentive[];
  completedIncentives: Incentive[];
  
  // Performance metrics
  performanceMetrics: PerformanceMetrics;
  
  // Actions
  startShift: () => void;
  endShift: () => void;
  updateEarnings: (amount: number, type: EarningType) => void;
  addTaskToHistory: (task: TaskHistory) => void;
  updatePerformanceMetrics: () => void;
  addIncentive: (incentive: Incentive) => void;
  completeIncentive: (incentiveId: string) => void;
  
  // Getters
  getTodayEarnings: () => number;
  getWeekEarnings: () => number;
  getMonthEarnings: () => number;
  getAverageEarningsPerTask: () => number;
  getEmergencyResponseBonus: () => number;
  getPeakTimeEarnings: () => number;
  getIncentiveProgress: (incentiveId: string) => number;
}

export type EarningType = 'base_fare' | 'emergency_bonus' | 'peak_time_bonus' | 'distance_bonus' | 'incentive' | 'tip';

export interface DailyEarnings {
  date: Date;
  totalEarnings: number;
  baseFare: number;
  emergencyBonuses: number;
  peakTimeBonuses: number;
  distanceBonuses: number;
  incentives: number;
  tips: number;
  tasksCompleted: number;
  emergenciesHandled: number;
  hoursWorked: number;
  averageRating: number;
}

export interface WeeklyEarnings {
  weekStart: Date;
  weekEnd: Date;
  totalEarnings: number;
  tasksCompleted: number;
  emergenciesHandled: number;
  hoursWorked: number;
  averageRating: number;
  dailyBreakdown: DailyEarnings[];
}

export interface MonthlyEarnings {
  month: number;
  year: number;
  totalEarnings: number;
  tasksCompleted: number;
  emergenciesHandled: number;
  hoursWorked: number;
  averageRating: number;
  weeklyBreakdown: WeeklyEarnings[];
}

export interface Incentive {
  id: string;
  title: string;
  description: string;
  type: 'task_count' | 'emergency_response' | 'rating' | 'hours' | 'streak';
  target: number;
  progress: number;
  reward: number;
  deadline?: Date;
  isActive: boolean;
  isCompleted: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface PerformanceMetrics {
  totalTasks: number;
  completedTasks: number;
  emergencyTasks: number;
  averageRating: number;
  averageResponseTime: number; // minutes
  completionRate: number; // percentage
  onTimeRate: number; // percentage
  customerSatisfactionRate: number; // percentage
  averageEarningsPerTask: number;
  averageEarningsPerHour: number;
  bestDay: {
    date: Date;
    earnings: number;
    tasks: number;
  } | null;
  currentStreak: number; // consecutive days worked
  longestStreak: number;
}

// Helper functions
const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isThisWeek = (date: Date): boolean => {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  return date >= weekAgo && date <= today;
};

const isThisMonth = (date: Date): boolean => {
  const today = new Date();
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

export const useBikerEarningsStore = create<BikerEarningsState>((set, get) => ({
  // Initial state
  earnings: {
    totalEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    todayEarnings: 0,
    pendingAmount: 0,
    baseTaskEarnings: 0,
    emergencyBonuses: 0,
    peakTimeBonuses: 0,
    distanceBonuses: 0,
    incentives: 0,
    lastPayout: undefined
  },
  
  currentShift: null,
  shiftHistory: [],
  taskHistory: [],
  
  dailyEarnings: [],
  weeklyEarnings: [],
  monthlyEarnings: [],
  
  activeIncentives: [],
  completedIncentives: [],
  
  performanceMetrics: {
    totalTasks: 0,
    completedTasks: 0,
    emergencyTasks: 0,
    averageRating: 0,
    averageResponseTime: 0,
    completionRate: 0,
    onTimeRate: 0,
    customerSatisfactionRate: 0,
    averageEarningsPerTask: 0,
    averageEarningsPerHour: 0,
    bestDay: null,
    currentStreak: 0,
    longestStreak: 0
  },
  
  // Actions
  startShift: () => set((state) => {
    if (state.currentShift) return state; // Already in shift
    
    const newShift: BikerShift = {
      id: Date.now().toString(),
      bikerId: 'current-biker', // This should come from auth
      startTime: new Date(),
      isActive: true,
      tasksCompleted: 0,
      emergenciesHandled: 0,
      earnings: 0,
      distanceCovered: 0,
      averageRating: 0,
      peakHours: 0
    };
    
    return { currentShift: newShift };
  }),
  
  endShift: () => set((state) => {
    if (!state.currentShift) return state;
    
    const endedShift: BikerShift = {
      ...state.currentShift,
      endTime: new Date(),
      isActive: false
    };
    
    return {
      currentShift: null,
      shiftHistory: [endedShift, ...state.shiftHistory]
    };
  }),
  
  updateEarnings: (amount, type) => set((state) => {
    const updatedEarnings = { ...state.earnings };
    
    switch (type) {
      case 'base_fare':
        updatedEarnings.baseTaskEarnings += amount;
        break;
      case 'emergency_bonus':
        updatedEarnings.emergencyBonuses += amount;
        break;
      case 'peak_time_bonus':
        updatedEarnings.peakTimeBonuses += amount;
        break;
      case 'distance_bonus':
        updatedEarnings.distanceBonuses += amount;
        break;
      case 'incentive':
        updatedEarnings.incentives += amount;
        break;
    }
    
    updatedEarnings.totalEarnings += amount;
    updatedEarnings.todayEarnings += amount;
    updatedEarnings.weeklyEarnings += amount;
    updatedEarnings.monthlyEarnings += amount;
    updatedEarnings.pendingAmount += amount;
    
    // Update current shift earnings
    const currentShift = state.currentShift ? {
      ...state.currentShift,
      earnings: state.currentShift.earnings + amount
    } : null;
    
    return {
      earnings: updatedEarnings,
      currentShift
    };
  }),
  
  addTaskToHistory: (task) => set((state) => ({
    taskHistory: [task, ...state.taskHistory]
  })),
  
  updatePerformanceMetrics: () => set((state) => {
    const completedTasks = state.taskHistory.filter(t => t.status === 'completed');
    const emergencyTasks = completedTasks.filter(t => 
      t.priority === 'emergency' || t.type === 'customer_emergency' || t.type === 'driver_rescue'
    );
    
    const totalRating = completedTasks.reduce((sum, task) => sum + (task.rating || 0), 0);
    const averageRating = completedTasks.length > 0 ? totalRating / completedTasks.length : 0;
    
    const totalResponseTime = emergencyTasks.reduce((sum, task) => sum + (task.responseTime || 0), 0);
    const averageResponseTime = emergencyTasks.length > 0 ? totalResponseTime / emergencyTasks.length : 0;
    
    const totalEarnings = state.earnings.totalEarnings;
    const averageEarningsPerTask = completedTasks.length > 0 ? totalEarnings / completedTasks.length : 0;
    
    // Calculate best day
    const dailyTotals = state.dailyEarnings.map(day => ({
      date: day.date,
      earnings: day.totalEarnings,
      tasks: day.tasksCompleted
    }));
    const bestDay = dailyTotals.reduce((best, day) => 
      !best || day.earnings > best.earnings ? day : best, null as any
    );
    
    const updatedMetrics: PerformanceMetrics = {
      totalTasks: state.taskHistory.length,
      completedTasks: completedTasks.length,
      emergencyTasks: emergencyTasks.length,
      averageRating,
      averageResponseTime,
      completionRate: state.taskHistory.length > 0 ? (completedTasks.length / state.taskHistory.length) * 100 : 0,
      onTimeRate: 95, // This would be calculated based on actual timing data
      customerSatisfactionRate: averageRating * 20, // Convert 5-star to percentage
      averageEarningsPerTask,
      averageEarningsPerHour: 250, // This would be calculated based on shift hours
      bestDay,
      currentStreak: 5, // This would be calculated based on consecutive working days
      longestStreak: 12
    };
    
    return { performanceMetrics: updatedMetrics };
  }),
  
  addIncentive: (incentive) => set((state) => ({
    activeIncentives: [...state.activeIncentives, incentive]
  })),
  
  completeIncentive: (incentiveId) => set((state) => {
    const incentive = state.activeIncentives.find(i => i.id === incentiveId);
    if (!incentive) return state;
    
    const completedIncentive = {
      ...incentive,
      isCompleted: true,
      completedAt: new Date()
    };
    
    return {
      activeIncentives: state.activeIncentives.filter(i => i.id !== incentiveId),
      completedIncentives: [completedIncentive, ...state.completedIncentives]
    };
  }),
  
  // Getters
  getTodayEarnings: () => {
    const state = get();
    return state.dailyEarnings
      .filter(day => isToday(day.date))
      .reduce((total, day) => total + day.totalEarnings, 0);
  },
  
  getWeekEarnings: () => {
    const state = get();
    return state.dailyEarnings
      .filter(day => isThisWeek(day.date))
      .reduce((total, day) => total + day.totalEarnings, 0);
  },
  
  getMonthEarnings: () => {
    const state = get();
    return state.dailyEarnings
      .filter(day => isThisMonth(day.date))
      .reduce((total, day) => total + day.totalEarnings, 0);
  },
  
  getAverageEarningsPerTask: () => {
    const state = get();
    const completedTasks = state.taskHistory.filter(t => t.status === 'completed').length;
    return completedTasks > 0 ? state.earnings.totalEarnings / completedTasks : 0;
  },
  
  getEmergencyResponseBonus: () => {
    const state = get();
    return state.earnings.emergencyBonuses;
  },
  
  getPeakTimeEarnings: () => {
    const state = get();
    return state.earnings.peakTimeBonuses;
  },
  
  getIncentiveProgress: (incentiveId) => {
    const state = get();
    const incentive = state.activeIncentives.find(i => i.id === incentiveId);
    return incentive ? (incentive.progress / incentive.target) * 100 : 0;
  }
}));