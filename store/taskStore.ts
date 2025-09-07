import { create } from 'zustand';
import { 
  BikerTask, 
  TaskPriority, 
  TaskType, 
  TaskStatus, 
  TaskNotification, 
  EmergencyAlert,
  BikerLocation,
  Location 
} from '../types/navigation';

interface TaskState {
  // Current tasks
  availableTasks: BikerTask[];
  acceptedTasks: BikerTask[];
  activeTasks: BikerTask[];
  completedTasks: BikerTask[];
  
  // Emergency alerts
  emergencyAlerts: EmergencyAlert[];
  activeEmergency: EmergencyAlert | null;
  
  // Notifications
  notifications: TaskNotification[];
  unreadCount: number;
  
  // Current location and tracking
  currentLocation: BikerLocation | null;
  isLocationTracking: boolean;
  
  // Task filters and sorting
  priorityFilter: TaskPriority | 'all';
  typeFilter: TaskType | 'all';
  sortBy: 'priority' | 'distance' | 'fare' | 'time';
  
  // Actions
  setAvailableTasks: (tasks: BikerTask[]) => void;
  acceptTask: (taskId: string) => void;
  startTask: (taskId: string) => void;
  completeTask: (taskId: string, rating?: number, notes?: string) => void;
  cancelTask: (taskId: string, reason: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  
  // Emergency actions
  setEmergencyAlerts: (alerts: EmergencyAlert[]) => void;
  respondToEmergency: (alertId: string) => void;
  resolveEmergency: (alertId: string) => void;
  
  // Notification actions
  addNotification: (notification: TaskNotification) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  
  // Location actions
  updateLocation: (location: BikerLocation) => void;
  startLocationTracking: () => void;
  stopLocationTracking: () => void;
  
  // Filter and sort actions
  setPriorityFilter: (priority: TaskPriority | 'all') => void;
  setTypeFilter: (type: TaskType | 'all') => void;
  setSortBy: (sortBy: 'priority' | 'distance' | 'fare' | 'time') => void;
  
  // Helper getters
  getFilteredTasks: () => BikerTask[];
  getSortedTasks: (tasks: BikerTask[]) => BikerTask[];
  getPriorityTasks: () => BikerTask[];
  getNearbyTasks: (radiusKm?: number) => BikerTask[];
  getTaskById: (taskId: string) => BikerTask | null;
}

// Helper functions
const calculateDistance = (location1: Location, location2: Location): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (location2.latitude - location1.latitude) * Math.PI / 180;
  const dLon = (location2.longitude - location1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(location1.latitude * Math.PI / 180) * Math.cos(location2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const getPriorityWeight = (priority: TaskPriority): number => {
  switch (priority) {
    case 'emergency': return 1000;
    case 'urgent': return 100;
    case 'high': return 10;
    case 'normal': return 1;
    default: return 0;
  }
};

export const useTaskStore = create<TaskState>((set, get) => ({
  // Initial state
  availableTasks: [],
  acceptedTasks: [],
  activeTasks: [],
  completedTasks: [],
  
  emergencyAlerts: [],
  activeEmergency: null,
  
  notifications: [],
  unreadCount: 0,
  
  currentLocation: null,
  isLocationTracking: false,
  
  priorityFilter: 'all',
  typeFilter: 'all',
  sortBy: 'priority',
  
  // Task actions
  setAvailableTasks: (tasks) => set({ availableTasks: tasks }),
  
  acceptTask: (taskId) => set((state) => {
    const task = state.availableTasks.find(t => t.id === taskId);
    if (!task) return state;
    
    const updatedTask = {
      ...task,
      status: 'accepted' as TaskStatus,
      acceptedAt: new Date()
    };
    
    return {
      availableTasks: state.availableTasks.filter(t => t.id !== taskId),
      acceptedTasks: [...state.acceptedTasks, updatedTask]
    };
  }),
  
  startTask: (taskId) => set((state) => {
    const task = state.acceptedTasks.find(t => t.id === taskId);
    if (!task) return state;
    
    const updatedTask = {
      ...task,
      status: 'in_progress' as TaskStatus,
      startedAt: new Date()
    };
    
    return {
      acceptedTasks: state.acceptedTasks.filter(t => t.id !== taskId),
      activeTasks: [...state.activeTasks, updatedTask]
    };
  }),
  
  completeTask: (taskId, rating, notes) => set((state) => {
    const task = state.activeTasks.find(t => t.id === taskId);
    if (!task) return state;
    
    const updatedTask = {
      ...task,
      status: 'completed' as TaskStatus,
      completedAt: new Date()
    };
    
    return {
      activeTasks: state.activeTasks.filter(t => t.id !== taskId),
      completedTasks: [...state.completedTasks, updatedTask]
    };
  }),
  
  cancelTask: (taskId, reason) => set((state) => {
    // Find task in any status
    let task = state.availableTasks.find(t => t.id === taskId) ||
              state.acceptedTasks.find(t => t.id === taskId) ||
              state.activeTasks.find(t => t.id === taskId);
    
    if (!task) return state;
    
    const updatedTask = {
      ...task,
      status: 'cancelled' as TaskStatus
    };
    
    return {
      availableTasks: state.availableTasks.filter(t => t.id !== taskId),
      acceptedTasks: state.acceptedTasks.filter(t => t.id !== taskId),
      activeTasks: state.activeTasks.filter(t => t.id !== taskId),
      completedTasks: [...state.completedTasks, updatedTask]
    };
  }),
  
  updateTaskStatus: (taskId, status) => set((state) => {
    // Update task status across all arrays
    const updateTaskInArray = (tasks: BikerTask[]) => 
      tasks.map(task => 
        task.id === taskId ? { ...task, status } : task
      );
    
    return {
      availableTasks: updateTaskInArray(state.availableTasks),
      acceptedTasks: updateTaskInArray(state.acceptedTasks),
      activeTasks: updateTaskInArray(state.activeTasks),
      completedTasks: updateTaskInArray(state.completedTasks)
    };
  }),
  
  // Emergency actions
  setEmergencyAlerts: (alerts) => set({ emergencyAlerts: alerts }),
  
  respondToEmergency: (alertId) => set((state) => {
    const alert = state.emergencyAlerts.find(a => a.id === alertId);
    if (!alert) return state;
    
    const updatedAlert = {
      ...alert,
      status: 'in_progress' as const
    };
    
    return {
      emergencyAlerts: state.emergencyAlerts.map(a => 
        a.id === alertId ? updatedAlert : a
      ),
      activeEmergency: updatedAlert
    };
  }),
  
  resolveEmergency: (alertId) => set((state) => {
    const updatedAlerts = state.emergencyAlerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'resolved' as const, resolvedAt: new Date() }
        : alert
    );
    
    return {
      emergencyAlerts: updatedAlerts,
      activeEmergency: state.activeEmergency?.id === alertId ? null : state.activeEmergency
    };
  }),
  
  // Notification actions
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + 1
  })),
  
  markNotificationRead: (notificationId) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1)
  })),
  
  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
    unreadCount: 0
  })),
  
  clearNotifications: () => set({
    notifications: [],
    unreadCount: 0
  }),
  
  // Location actions
  updateLocation: (location) => set({ currentLocation: location }),
  
  startLocationTracking: () => set({ isLocationTracking: true }),
  
  stopLocationTracking: () => set({ isLocationTracking: false }),
  
  // Filter and sort actions
  setPriorityFilter: (priority) => set({ priorityFilter: priority }),
  
  setTypeFilter: (type) => set({ typeFilter: type }),
  
  setSortBy: (sortBy) => set({ sortBy }),
  
  // Helper getters
  getFilteredTasks: () => {
    const state = get();
    let tasks = state.availableTasks;
    
    if (state.priorityFilter !== 'all') {
      tasks = tasks.filter(task => task.priority === state.priorityFilter);
    }
    
    if (state.typeFilter !== 'all') {
      tasks = tasks.filter(task => task.type === state.typeFilter);
    }
    
    return state.getSortedTasks(tasks);
  },
  
  getSortedTasks: (tasks) => {
    const state = get();
    const currentLocation = state.currentLocation;
    
    return [...tasks].sort((a, b) => {
      switch (state.sortBy) {
        case 'priority':
          return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
        
        case 'distance':
          if (!currentLocation) return 0;
          const distanceA = calculateDistance(currentLocation, a.pickupLocation);
          const distanceB = calculateDistance(currentLocation, b.pickupLocation);
          return distanceA - distanceB;
        
        case 'fare':
          return (b.fare + (b.emergencyBonus || 0)) - (a.fare + (a.emergencyBonus || 0));
        
        case 'time':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        
        default:
          return 0;
      }
    });
  },
  
  getPriorityTasks: () => {
    const state = get();
    return state.availableTasks
      .filter(task => task.priority === 'emergency' || task.priority === 'urgent')
      .sort((a, b) => getPriorityWeight(b.priority) - getPriorityWeight(a.priority));
  },
  
  getNearbyTasks: (radiusKm = 10) => {
    const state = get();
    const currentLocation = state.currentLocation;
    
    if (!currentLocation) return [];
    
    return state.availableTasks.filter(task => {
      const distance = calculateDistance(currentLocation, task.pickupLocation);
      return distance <= radiusKm;
    });
  },
  
  getTaskById: (taskId) => {
    const state = get();
    return (
      state.availableTasks.find(t => t.id === taskId) ||
      state.acceptedTasks.find(t => t.id === taskId) ||
      state.activeTasks.find(t => t.id === taskId) ||
      state.completedTasks.find(t => t.id === taskId) ||
      null
    );
  }
}));