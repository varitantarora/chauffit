import { create } from 'zustand';
import ConfigApiService, { AppConfig } from '../services/api/ConfigApiService';

interface ConfigState {
  configs: AppConfig[];
  configsLoading: boolean;
  configsError: string | null;

  fetchConfigs: () => Promise<void>;
  createConfig: (data: Pick<AppConfig, 'key' | 'name' | 'value'>) => Promise<boolean>;
  updateConfig: (key: string, data: Partial<AppConfig>) => Promise<boolean>;
  deleteConfig: (key: string) => Promise<boolean>;
  getConfigValue: (key: string) => string | null;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  configs: [],
  configsLoading: false,
  configsError: null,

  fetchConfigs: async () => {
    set({ configsLoading: true, configsError: null });
    const res = await ConfigApiService.getAll();
    if (res.success && res.data) {
      const configs = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
      console.log('[ConfigStore] Fetched configs:', { response: res, parsedConfigs: configs });
      const insuranceConfig = configs.find((c) => c.key === 'insurance_enabled');
      console.log('[ConfigStore] Insurance config:', insuranceConfig);
      set({ configs, configsLoading: false });
    } else {
      console.log('[ConfigStore] Failed to fetch configs:', res);
      set({ configsError: res.error || 'Failed to fetch configs', configsLoading: false });
    }
  },

  createConfig: async (data) => {
    const res = await ConfigApiService.create(data);
    if (res.success) {
      get().fetchConfigs();
      return true;
    }
    return false;
  },

  updateConfig: async (key, data) => {
    const res = await ConfigApiService.update(key, data);
    if (res.success) {
      get().fetchConfigs();
      return true;
    }
    return false;
  },

  deleteConfig: async (key) => {
    const res = await ConfigApiService.delete(key);
    if (res.success) {
      get().fetchConfigs();
      return true;
    }
    return false;
  },

  getConfigValue: (key) => {
    const config = get().configs.find((c) => c.key === key);
    return config?.value ?? null;
  },
}));
