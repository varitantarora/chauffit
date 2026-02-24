import { create } from 'zustand';
import AdminApiService, {
  DashboardStats,
  AdminUser,
  AdminDriver,
  AdminBiker,
  AdminRide,
  AdminRideDetail,
  AdminTask,
  AdminPayment,
  AdminDispute,
  HourlyHireSettings,
} from '../services/api/AdminApiService';

interface AdminState {
  // Dashboard
  dashboard: DashboardStats | null;
  dashboardLoading: boolean;
  dashboardError: string | null;

  // Users
  users: AdminUser[];
  usersLoading: boolean;
  usersError: string | null;
  selectedUser: AdminUser | null;

  // Drivers
  drivers: AdminDriver[];
  pendingDrivers: AdminDriver[];
  driversLoading: boolean;
  driversError: string | null;

  // Bikers
  bikers: AdminBiker[];
  pendingBikers: AdminBiker[];
  bikersLoading: boolean;
  bikersError: string | null;

  // Rides
  rides: AdminRide[];
  ridesLoading: boolean;
  ridesError: string | null;
  selectedRide: AdminRideDetail | null;

  // Tasks
  tasks: AdminTask[];
  tasksLoading: boolean;
  tasksError: string | null;
  selectedTask: AdminTask | null;

  // Payments
  payments: AdminPayment[];
  paymentsLoading: boolean;
  paymentsError: string | null;
  selectedPayment: AdminPayment | null;

  // Disputes
  disputes: AdminDispute[];
  disputesLoading: boolean;
  disputesError: string | null;
  selectedDispute: AdminDispute | null;

  // Hourly Hire Settings
  hourlyHireSettings: HourlyHireSettings | null;
  hourlyHireLoading: boolean;
  hourlyHireError: string | null;

  // Actions
  fetchDashboard: () => Promise<void>;
  fetchUsers: (params?: { user_type?: string; status?: string }) => Promise<void>;
  fetchUserDetail: (id: string) => Promise<AdminUser | null>;
  updateUserStatus: (id: string, status: string) => Promise<boolean>;
  fetchDrivers: () => Promise<void>;
  fetchPendingDrivers: () => Promise<void>;
  verifyDriver: (id: string, isApproved: boolean, rejectionReason?: string) => Promise<boolean>;
  fetchBikers: () => Promise<void>;
  fetchPendingBikers: () => Promise<void>;
  verifyBiker: (id: string, isApproved: boolean, rejectionReason?: string) => Promise<boolean>;
  fetchRides: (params?: { status?: string; search?: string }) => Promise<void>;
  fetchRideDetail: (id: string) => Promise<AdminRideDetail | null>;
  dispatchRide: (id: string, driverId: string) => Promise<boolean>;
  cancelRide: (id: string, reason?: string) => Promise<boolean>;
  fetchTasks: () => Promise<void>;
  fetchTaskDetail: (id: string) => Promise<AdminTask | null>;
  fetchPayments: (params?: { status?: string; search?: string }) => Promise<void>;
  fetchPaymentDetail: (id: string) => Promise<AdminPayment | null>;
  fetchDisputes: () => Promise<void>;
  fetchDisputeDetail: (id: string) => Promise<AdminDispute | null>;
  resolveDispute: (id: string, resolution: string, status: string) => Promise<boolean>;
  fetchHourlyHireSettings: () => Promise<void>;
  updateHourlyHireSettings: (data: Partial<HourlyHireSettings>) => Promise<boolean>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  dashboard: null,
  dashboardLoading: false,
  dashboardError: null,

  users: [],
  usersLoading: false,
  usersError: null,
  selectedUser: null,

  drivers: [],
  pendingDrivers: [],
  driversLoading: false,
  driversError: null,

  bikers: [],
  pendingBikers: [],
  bikersLoading: false,
  bikersError: null,

  rides: [],
  ridesLoading: false,
  ridesError: null,
  selectedRide: null,

  tasks: [],
  tasksLoading: false,
  tasksError: null,
  selectedTask: null,

  payments: [],
  paymentsLoading: false,
  paymentsError: null,
  selectedPayment: null,

  disputes: [],
  disputesLoading: false,
  disputesError: null,
  selectedDispute: null,

  hourlyHireSettings: null,
  hourlyHireLoading: false,
  hourlyHireError: null,

  fetchDashboard: async () => {
    set({ dashboardLoading: true, dashboardError: null });
    const res = await AdminApiService.getDashboard();
    if (res.success && res.data) {
      set({ dashboard: res.data, dashboardLoading: false });
    } else {
      set({ dashboardError: res.error || 'Failed to fetch dashboard', dashboardLoading: false });
    }
  },

  fetchUsers: async (params) => {
    set({ usersLoading: true, usersError: null });
    const res = await AdminApiService.getUsers(params);
    if (res.success && res.data) {
      const users = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
      set({ users, usersLoading: false });
    } else {
      set({ usersError: res.error || 'Failed to fetch users', usersLoading: false });
    }
  },

  fetchUserDetail: async (id) => {
    const res = await AdminApiService.getUserDetail(id);
    if (res.success && res.data) {
      set({ selectedUser: res.data });
      return res.data;
    }
    return null;
  },

  updateUserStatus: async (id, status) => {
    const res = await AdminApiService.updateUserStatus(id, status);
    if (res.success) {
      if (res.data) set({ selectedUser: res.data });
      // Refresh users list
      get().fetchUsers();
      return true;
    }
    return false;
  },

  fetchDrivers: async () => {
    set({ driversLoading: true, driversError: null });
    const res = await AdminApiService.getDrivers();
    if (res.success && res.data) {
      const drivers = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
      set({ drivers, driversLoading: false });
    } else {
      set({ driversError: res.error || 'Failed to fetch drivers', driversLoading: false });
    }
  },

  fetchPendingDrivers: async () => {
    set({ driversLoading: true, driversError: null });
    const res = await AdminApiService.getPendingDrivers();
    if (res.success && res.data) {
      const pendingDrivers = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
      set({ pendingDrivers, driversLoading: false });
    } else {
      set({ driversError: res.error || 'Failed to fetch pending drivers', driversLoading: false });
    }
  },

  verifyDriver: async (id, isApproved, rejectionReason) => {
    const res = await AdminApiService.verifyDriver(id, {
      current_status: isApproved ? 'active' : 'suspended',
      background_check_status: isApproved ? 'verified' : 'failed',
    });
    if (res.success) {
      get().fetchPendingDrivers();
      get().fetchDashboard();
      return true;
    }
    return false;
  },

  fetchBikers: async () => {
    set({ bikersLoading: true, bikersError: null });
    const res = await AdminApiService.getBikers();
    if (res.success && res.data) {
      const bikers = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
      set({ bikers, bikersLoading: false });
    } else {
      set({ bikersError: res.error || 'Failed to fetch bikers', bikersLoading: false });
    }
  },

  fetchPendingBikers: async () => {
    set({ bikersLoading: true, bikersError: null });
    const res = await AdminApiService.getPendingBikers();
    if (res.success && res.data) {
      const pendingBikers = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
      set({ pendingBikers, bikersLoading: false });
    } else {
      set({ bikersError: res.error || 'Failed to fetch pending bikers', bikersLoading: false });
    }
  },

  verifyBiker: async (id, isApproved, rejectionReason) => {
    const res = await AdminApiService.verifyBiker(id, {
      current_status: isApproved ? 'active' : 'suspended',
      background_check_status: isApproved ? 'verified' : 'failed',
    });
    if (res.success) {
      get().fetchPendingBikers();
      get().fetchDashboard();
      return true;
    }
    return false;
  },

  fetchRides: async (params) => {
    set({ ridesLoading: true, ridesError: null });
    const res = await AdminApiService.getRides(params);
    if (res.success && res.data) {
      const rides = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
      set({ rides, ridesLoading: false });
    } else {
      set({ ridesError: res.error || 'Failed to fetch rides', ridesLoading: false });
    }
  },

  fetchRideDetail: async (id) => {
    const res = await AdminApiService.getRideDetail(id);
    if (res.success && res.data) {
      set({ selectedRide: res.data });
      return res.data;
    }
    return null;
  },

  dispatchRide: async (id, driverId) => {
    const res = await AdminApiService.dispatchRide(id, { driver_id: driverId });
    if (res.success) {
      get().fetchRides();
      return true;
    }
    return false;
  },

  cancelRide: async (id, reason) => {
    const res = await AdminApiService.cancelRide(id, reason ? { reason } : undefined);
    if (res.success) {
      get().fetchRides();
      return true;
    }
    return false;
  },

  fetchTasks: async () => {
    set({ tasksLoading: true, tasksError: null });
    const res = await AdminApiService.getTasks();
    if (res.success && res.data) {
      const tasks = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
      set({ tasks, tasksLoading: false });
    } else {
      set({ tasksError: res.error || 'Failed to fetch tasks', tasksLoading: false });
    }
  },

  fetchTaskDetail: async (id) => {
    const res = await AdminApiService.getTaskDetail(id);
    if (res.success && res.data) {
      set({ selectedTask: res.data });
      return res.data;
    }
    return null;
  },

  fetchPayments: async (params) => {
    set({ paymentsLoading: true, paymentsError: null });
    const res = await AdminApiService.getPayments(params);
    if (res.success && res.data) {
      const payments = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
      set({ payments, paymentsLoading: false });
    } else {
      set({ paymentsError: res.error || 'Failed to fetch payments', paymentsLoading: false });
    }
  },

  fetchPaymentDetail: async (id) => {
    const res = await AdminApiService.getPaymentDetail(id);
    if (res.success && res.data) {
      set({ selectedPayment: res.data });
      return res.data;
    }
    return null;
  },

  fetchDisputes: async () => {
    set({ disputesLoading: true, disputesError: null });
    const res = await AdminApiService.getDisputes();
    if (res.success && res.data) {
      const disputes = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
      set({ disputes, disputesLoading: false });
    } else {
      set({ disputesError: res.error || 'Failed to fetch disputes', disputesLoading: false });
    }
  },

  fetchDisputeDetail: async (id) => {
    const res = await AdminApiService.getDisputeDetail(id);
    if (res.success && res.data) {
      set({ selectedDispute: res.data });
      return res.data;
    }
    return null;
  },

  resolveDispute: async (id, resolution, status) => {
    const res = await AdminApiService.resolveDispute(id, { resolution, status });
    if (res.success) {
      get().fetchDisputes();
      get().fetchDashboard();
      return true;
    }
    return false;
  },

  fetchHourlyHireSettings: async () => {
    set({ hourlyHireLoading: true, hourlyHireError: null });
    const res = await AdminApiService.getHourlyHireSettings();
    if (res.success && res.data) {
      set({ hourlyHireSettings: res.data, hourlyHireLoading: false });
    } else {
      set({ hourlyHireError: res.error || 'Failed to fetch settings', hourlyHireLoading: false });
    }
  },

  updateHourlyHireSettings: async (data) => {
    set({ hourlyHireLoading: true });
    const res = await AdminApiService.updateHourlyHireSettings(data);
    if (res.success && res.data) {
      set({ hourlyHireSettings: res.data, hourlyHireLoading: false });
      return true;
    }
    set({ hourlyHireLoading: false });
    return false;
  },
}));
