import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Vehicle,
  Measurement,
  SystemStatus,
  LiveWeight,
  SystemSettings,
  DailyStats,
  DashboardSummary,
  GpsSyncState,
} from '@/types';

interface LoadGuardState {
  // Live data
  liveWeight: LiveWeight;
  systemStatus: SystemStatus;
  
  // Vehicles
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  
  // Measurements
  measurements: Measurement[];
  recentMeasurements: Measurement[];
  
  // Stats
  dailyStats: DailyStats;
  dashboardSummary: DashboardSummary | null;

  // Scale simulation session (increment to restart ramp)
  scaleSessionKey: number;
  
  // Settings
  settings: SystemSettings;
  
  // GPS live sync (5s poll + socket)
  gpsSync: GpsSyncState;

  // UI state
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  
  // Actions
  setLiveWeight: (weight: LiveWeight) => void;
  setSystemStatus: (status: Partial<SystemStatus>) => void;
  addVehicle: (vehicle: Vehicle) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  addMeasurement: (measurement: Measurement) => void;
  setMeasurements: (measurements: Measurement[]) => void;
  setRecentMeasurements: (measurements: Measurement[]) => void;
  updateSettings: (settings: Partial<SystemSettings>) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  updateDailyStats: (stats: Partial<DailyStats>) => void;
  setDashboardSummary: (summary: DashboardSummary | null) => void;
  bumpScaleSession: () => void;
  setGpsSync: (sync: Partial<GpsSyncState>) => void;
}

const initialSettings: SystemSettings = {
  weightUnit: 'kg',
  thresholds: {
    warningPercentage: 90,
    overloadPercentage: 100,
  },
  alarmEnabled: true,
  alarmVolume: 80,
  printerEnabled: true,
  printerName: 'Default Printer',
  backendUrl:
    process.env.NEXT_PUBLIC_SOCKET_URL ?? 'https://brt-weight-backend.onrender.com',
  sensorId: 'ESP32-001',
  calibrationOffset: 0,
};

const initialSystemStatus: SystemStatus = {
  sensorOnline: false,
  backendConnected: false,
  buzzerActive: false,
  lastUpdate: new Date(),
};

const initialLiveWeight: LiveWeight = {
  value: 0,
  stable: true,
  trend: 'stable',
  timestamp: new Date(),
};

const initialGpsSync: GpsSyncState = {
  lastSyncAt: null,
  lastSocketAt: null,
  vehiclesWithLocation: 0,
  totalGpsDevices: 0,
  isPolling: false,
  lastError: null,
};

const initialDailyStats: DailyStats = {
  date: new Date().toISOString().split('T')[0],
  totalVehicles: 0,
  overloadedVehicles: 0,
  safeVehicles: 0,
  underloadVehicles: 0,
  totalMeasurements: 0,
};

export const useLoadGuardStore = create<LoadGuardState>()(
  persist(
    (set) => ({
      // Initial state
      liveWeight: initialLiveWeight,
      systemStatus: initialSystemStatus,
      vehicles: [],
      selectedVehicle: null,
      measurements: [],
      recentMeasurements: [],
      dailyStats: initialDailyStats,
      dashboardSummary: null,
      scaleSessionKey: 0,
      gpsSync: initialGpsSync,
      settings: initialSettings,
      theme: 'dark',
      sidebarOpen: false,
      
      // Actions
      setLiveWeight: (weight) => set({ liveWeight: weight }),
      
      setSystemStatus: (status) => 
        set((state) => ({ 
          systemStatus: { ...state.systemStatus, ...status, lastUpdate: new Date() } 
        })),
      
      addVehicle: (vehicle) => 
        set((state) => ({ vehicles: [...state.vehicles, vehicle] })),

      setVehicles: (vehicles) => set({ vehicles }),
      
      updateVehicle: (id, updates) =>
        set((state) => ({
          vehicles: state.vehicles.map((v) =>
            v.id === id ? { ...v, ...updates, updatedAt: new Date() } : v
          ),
        })),
      
      deleteVehicle: (id) =>
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v.id !== id),
        })),
      
      setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
      
      addMeasurement: (measurement) =>
        set((state) => {
          const newMeasurements = [measurement, ...state.measurements];
          const recentMeasurements = newMeasurements.slice(0, 10);
          return { measurements: newMeasurements, recentMeasurements };
        }),

      setMeasurements: (measurements) =>
        set({
          measurements,
          recentMeasurements: measurements.slice(0, 10),
        }),

      setRecentMeasurements: (recentMeasurements) => set({ recentMeasurements }),
      
      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),
      
      setTheme: (theme) => set({ theme }),
      
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      updateDailyStats: (stats) =>
        set((state) => ({
          dailyStats: { ...state.dailyStats, ...stats },
        })),

      setDashboardSummary: (summary) => set({ dashboardSummary: summary }),

      bumpScaleSession: () =>
        set((state) => ({ scaleSessionKey: state.scaleSessionKey + 1 })),

      setGpsSync: (sync) =>
        set((state) => ({
          gpsSync: { ...state.gpsSync, ...sync },
        })),
    }),
    {
      name: 'loadguard-storage',
      partialize: (state) => ({
        vehicles: state.vehicles,
        measurements: state.measurements,
        settings: state.settings,
        theme: state.theme,
      }),
    }
  )
);
