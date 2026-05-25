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
  AdminRateCard,
  AdminPerKmRate,
  AdminPerMinRate,
  AdminHourlyHireRate,
  AdminSurgeConfig,
  AdminInsurancePlan,
  AdminAmenity,
  RevenueData,
  AnalyticsData,
  AdminTrainingBatch,
  CreateTrainingBatchRequest,
  MarkTrainingResultsRequest,
} from '../services/api/AdminApiService';
import AdvertisementApiService, {
  Advertisement,
  AdvertisementCategory,
} from '../services/api/AdvertisementApiService';

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


  // Rate Cards / Pricing
  rateCards: AdminRateCard[];
  rateCardsLoading: boolean;
  rateCardsError: string | null;
  activeRateCard: AdminRateCard | null;

  fetchRateCards: () => Promise<void>;
  fetchRateCardDetail: (id: string) => Promise<AdminRateCard | null>;
  updateRateCard: (id: string, data: Partial<AdminRateCard>) => Promise<boolean>;

  // Pricing convenience
  pricingLoading: boolean;
  pricingError: string | null;

  fetchPricingSettings: () => Promise<void>;
  savePricingSettings: (rateCardId: string, data: Partial<AdminRateCard>) => Promise<boolean>;

  // Hourly Hire Settings
  hourlyHireSettings: HourlyHireSettings | null;
  hourlyHireLoading: boolean;
  hourlyHireError: string | null;

  // Insurance Plans
  insurancePlans: AdminInsurancePlan[];
  insurancePlansLoading: boolean;
  insurancePlansError: string | null;

  // Amenities
  amenities: AdminAmenity[];
  amenitiesLoading: boolean;
  amenitiesError: string | null;

  // Revenue
  revenue: RevenueData | null;
  revenueLoading: boolean;
  revenueError: string | null;

  // Analytics
  analytics: AnalyticsData | null;
  analyticsLoading: boolean;
  analyticsError: string | null;

  // Training Batches
  trainingBatches: AdminTrainingBatch[];
  trainingBatchesLoading: boolean;
  trainingBatchesError: string | null;
  selectedTrainingBatch: AdminTrainingBatch | null;

  // Advertisements
  advertisements: Advertisement[];
  advertisementCategories: AdvertisementCategory[];
  adsLoading: boolean;
  adsError: string | null;

  // Actions
  fetchDashboard: () => Promise<void>;
  fetchUsers: (params?: { user_type?: string; status?: string }) => Promise<void>;
  fetchUserDetail: (id: string) => Promise<AdminUser | null>;
  updateUserStatus: (id: string, status: string) => Promise<boolean>;
  fetchDrivers: () => Promise<void>;
  fetchPendingDrivers: () => Promise<void>;
  verifyDriver: (id: string, isApproved: boolean, rejectionReason?: string) => Promise<boolean>;
  updateDriverStatus: (id: string, status: string) => Promise<boolean>;
  fetchBikers: () => Promise<void>;
  fetchPendingBikers: () => Promise<void>;
  verifyBiker: (id: string, isApproved: boolean, rejectionReason?: string) => Promise<boolean>;
  updateBikerStatus: (id: string, status: string) => Promise<boolean>;
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
  fetchInsurancePlans: () => Promise<void>;
  createInsurancePlan: (data: Partial<AdminInsurancePlan>) => Promise<boolean>;
  updateInsurancePlan: (id: string, data: Partial<AdminInsurancePlan>) => Promise<boolean>;
  deleteInsurancePlan: (id: string) => Promise<boolean>;
  fetchAmenities: () => Promise<void>;
  createAmenity: (data: Partial<AdminAmenity>) => Promise<boolean>;
  updateAmenity: (id: string, data: Partial<AdminAmenity>) => Promise<boolean>;
  deleteAmenity: (id: string) => Promise<boolean>;
  fetchRevenue: (date?: string) => Promise<void>;
  fetchAnalytics: (period?: string) => Promise<void>;
  fetchTrainingBatches: () => Promise<void>;
  fetchTrainingBatch: (id: string) => Promise<AdminTrainingBatch | null>;
  createTrainingBatch: (data: CreateTrainingBatchRequest) => Promise<boolean>;
  autoAssignBatch: (id: string) => Promise<boolean>;
  markTrainingResults: (id: string, results: MarkTrainingResultsRequest[]) => Promise<boolean>;

  fetchAdvertisements: () => Promise<void>;
  fetchAdvertisementCategories: () => Promise<void>;
  createAdvertisement: (data: Partial<Advertisement>) => Promise<boolean>;
  updateAdvertisement: (id: string, data: Partial<Advertisement>) => Promise<boolean>;
  deleteAdvertisement: (id: string) => Promise<boolean>;
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


  rateCards: [],
  rateCardsLoading: false,
  rateCardsError: null,
  activeRateCard: null,

  hourlyHireSettings: null,
  hourlyHireLoading: false,
  hourlyHireError: null,

  pricingLoading: false,
  pricingError: null,

  insurancePlans: [],
  insurancePlansLoading: false,
  insurancePlansError: null,

  amenities: [],
  amenitiesLoading: false,
  amenitiesError: null,

  revenue: null,
  revenueLoading: false,
  revenueError: null,

  analytics: null,
  analyticsLoading: false,
  analyticsError: null,

  trainingBatches: [],
  trainingBatchesLoading: false,
  trainingBatchesError: null,
  selectedTrainingBatch: null,

  advertisements: [],
  advertisementCategories: [],
  adsLoading: false,
  adsError: null,

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
      action: isApproved ? 'approve' : 'reject',
      rejection_reason: rejectionReason || '',
    });
    if (res.success) {
      get().fetchPendingDrivers();
      get().fetchDashboard();
      return true;
    }
    return false;
  },

  updateDriverStatus: async (id, status) => {
    const res = await AdminApiService.updateDriverStatus(id, status);
    if (res.success) {
      get().fetchDrivers();
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

  updateBikerStatus: async (id, status) => {
    const res = await AdminApiService.updateBikerStatus(id, status);
    if (res.success) {
      get().fetchBikers();
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


  fetchRateCards: async () => {
    set({ rateCardsLoading: true, rateCardsError: null });
    const res = await AdminApiService.getRateCards();
    if (res.success && res.data) {
      const rateCards = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
      set({ rateCards, rateCardsLoading: false });
    } else {
      set({ rateCardsError: res.error || 'Failed to fetch rate cards', rateCardsLoading: false });
    }
  },

  fetchRateCardDetail: async (id) => {
    const res = await AdminApiService.getRateCard(id);
    if (res.success && res.data) {
      set({ activeRateCard: res.data });
      return res.data;
    }
    return null;
  },

  updateRateCard: async (id, data) => {
    set({ rateCardsLoading: true });
    const res = await AdminApiService.updateRateCard(id, data);
    if (res.success && res.data) {
      set({ activeRateCard: res.data, rateCardsLoading: false });
      return true;
    }
    set({ rateCardsLoading: false });
    return false;
  },

  fetchPricingSettings: async () => {
    set({ pricingLoading: true, pricingError: null });
    const res = await AdminApiService.getRateCards();
    if (res.success && res.data) {
      const rateCards = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
      set({ rateCards });
      const activeCard = rateCards.find((rc: AdminRateCard) => rc.is_active) || rateCards[0];
      if (activeCard) {
        const detail = await AdminApiService.getRateCard(activeCard.id);
        if (detail.success && detail.data) {
          set({ activeRateCard: detail.data, pricingLoading: false });
          return;
        }
      }
      set({ pricingLoading: false });
    } else {
      set({ pricingError: res.error || 'Failed to fetch pricing settings', pricingLoading: false });
    }
  },

  savePricingSettings: async (rateCardId, data) => {
    set({ pricingLoading: true, pricingError: null });
    const res = await AdminApiService.updateRateCard(rateCardId, data);
    if (res.success && res.data) {
      set({ activeRateCard: res.data, pricingLoading: false });
      return true;
    }
    set({ pricingError: res.error || 'Failed to save pricing settings', pricingLoading: false });
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

  fetchInsurancePlans: async () => {
    set({ insurancePlansLoading: true, insurancePlansError: null });
    const res = await AdminApiService.getInsurancePlans();
    if (res.success && res.data) {
      const plans = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
      set({ insurancePlans: plans, insurancePlansLoading: false });
    } else {
      set({ insurancePlansError: res.error || 'Failed to fetch insurance plans', insurancePlansLoading: false });
    }
  },

  createInsurancePlan: async (data) => {
    const res = await AdminApiService.createInsurancePlan(data);
    if (res.success) {
      get().fetchInsurancePlans();
      return true;
    }
    return false;
  },

  updateInsurancePlan: async (id, data) => {
    const res = await AdminApiService.updateInsurancePlan(id, data);
    if (res.success) {
      get().fetchInsurancePlans();
      return true;
    }
    return false;
  },

  deleteInsurancePlan: async (id) => {
    const res = await AdminApiService.deleteInsurancePlan(id);
    if (res.success) {
      get().fetchInsurancePlans();
      return true;
    }
    return false;
  },

  fetchAmenities: async () => {
    set({ amenitiesLoading: true, amenitiesError: null });
    const res = await AdminApiService.getAmenities();
    if (res.success && res.data) {
      const amenities = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
      set({ amenities, amenitiesLoading: false });
    } else {
      set({ amenitiesError: res.error || 'Failed to fetch amenities', amenitiesLoading: false });
    }
  },

  createAmenity: async (data) => {
    const res = await AdminApiService.createAmenity(data);
    if (res.success) {
      get().fetchAmenities();
      return true;
    }
    return false;
  },

  updateAmenity: async (id, data) => {
    const res = await AdminApiService.updateAmenity(id, data);
    if (res.success) {
      get().fetchAmenities();
      return true;
    }
    return false;
  },

  deleteAmenity: async (id) => {
    const res = await AdminApiService.deleteAmenity(id);
    if (res.success) {
      get().fetchAmenities();
      return true;
    }
    return false;
  },

  fetchRevenue: async (date) => {
    set({ revenueLoading: true, revenueError: null });
    const res = await AdminApiService.getRevenue(date);
    if (res.success && res.data) {
      set({ revenue: res.data, revenueLoading: false });
    } else {
      set({ revenueError: res.error || 'Failed to fetch revenue', revenueLoading: false });
    }
  },

  fetchAnalytics: async (period) => {
    set({ analyticsLoading: true, analyticsError: null });
    const res = await AdminApiService.getAnalytics(period);
    if (res.success && res.data) {
      set({ analytics: res.data, analyticsLoading: false });
    } else {
      set({ analyticsError: res.error || 'Failed to fetch analytics', analyticsLoading: false });
    }
  },

  fetchTrainingBatches: async () => {
    set({ trainingBatchesLoading: true, trainingBatchesError: null });
    const res = await AdminApiService.getTrainingBatches();
    if (res.success && res.data) {
      const batches = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
      set({ trainingBatches: batches, trainingBatchesLoading: false });
    } else {
      set({ trainingBatchesError: res.error || 'Failed to fetch training batches', trainingBatchesLoading: false });
    }
  },

  fetchTrainingBatch: async (id) => {
    const res = await AdminApiService.getTrainingBatch(id);
    if (res.success && res.data) {
      set({ selectedTrainingBatch: res.data });
      return res.data;
    }
    return null;
  },

  createTrainingBatch: async (data) => {
    const res = await AdminApiService.createTrainingBatch(data);
    if (res.success) {
      get().fetchTrainingBatches();
      return true;
    }
    return false;
  },

  autoAssignBatch: async (id) => {
    const res = await AdminApiService.autoAssignBatch(id);
    if (res.success) {
      await get().fetchTrainingBatch(id);
      return true;
    }
    return false;
  },

  markTrainingResults: async (id, results) => {
    const res = await AdminApiService.markTrainingResults(id, results);
    if (res.success) {
      get().fetchTrainingBatch(id);
      return true;
    }
    return false;
  },

  fetchAdvertisements: async () => {
    set({ adsLoading: true, adsError: null });
    const res = await AdvertisementApiService.getAdvertisements();
    if (res.success && res.data) {
      set({ advertisements: res.data, adsLoading: false });
    } else {
      set({ adsError: res.error || 'Failed to fetch advertisements', adsLoading: false });
    }
  },

  fetchAdvertisementCategories: async () => {
    const res = await AdvertisementApiService.getAdvertisementCategories();
    if (res.success && res.data) {
      set({ advertisementCategories: res.data });
    }
  },

  createAdvertisement: async (data) => {
    const res = await AdvertisementApiService.createAdvertisement(data);
    if (res.success) {
      get().fetchAdvertisements();
      return true;
    }
    return false;
  },

  updateAdvertisement: async (id, data) => {
    const res = await AdvertisementApiService.updateAdvertisement(id, data);
    if (res.success) {
      get().fetchAdvertisements();
      return true;
    }
    return false;
  },

  deleteAdvertisement: async (id) => {
    const res = await AdvertisementApiService.deleteAdvertisement(id);
    if (res.success) {
      get().fetchAdvertisements();
      return true;
    }
    return false;
  },
}));
