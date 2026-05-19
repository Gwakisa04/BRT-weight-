import axios from 'axios';
import type { Vehicle, Measurement, SystemSettings, DailyStats } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ success: boolean; token: string; user: { id: string; email: string; name: string; role: string } }>(
      '/auth/login',
      { email, password }
    ),
  me: () =>
    api.get<{ user: { id: string; email: string; name: string; role: string } }>('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Vehicles API
export const vehicleApi = {
  getAll: () => api.get<Vehicle[]>('/vehicles'),
  getById: (id: string) => api.get<Vehicle>(`/vehicles/${id}`),
  create: (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<Vehicle>('/vehicles', data),
  update: (id: string, data: Partial<Vehicle> & { gpsDevice?: Vehicle['gpsDevice'] | null }) => 
    api.put<Vehicle>(`/vehicles/${id}`, data),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
  search: (query: string) => api.get<Vehicle[]>(`/vehicles/search?q=${query}`),
};

// Measurements API
export const measurementApi = {
  getAll: (params?: { 
    startDate?: string; 
    endDate?: string; 
    vehicleId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => api.get<{ data: Measurement[]; total: number }>('/measurements', { params }),
  getById: (id: string) => api.get<Measurement>(`/measurements/${id}`),
  create: (data: {
    vehicleId: string;
    measuredWeight: number;
    allowedWeight?: number;
    operator: string;
    timestamp?: Date | string;
  }) => api.post<Measurement>('/measurements', data),
  getRecent: (limit?: number) => 
    api.get<Measurement[]>(`/measurements/recent?limit=${limit || 10}`),
  exportCsv: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/measurements/export/csv', { params, responseType: 'blob' }),
  exportPdf: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/measurements/export/pdf', { params, responseType: 'blob' }),
};

// Sensor/Weight API
export const sensorApi = {
  getLiveWeight: () => api.get<{ value: number; stable: boolean; timestamp: string }>('/live-weight'),
  getStatus: () => api.get<{ connected: boolean; signalStrength: number; calibrated: boolean }>('/sensor/status'),
  calibrate: (offset: number) => api.post('/sensor/calibrate', { offset }),
  reset: () => api.post('/sensor/reset'),
};

// Alarm API
export const alarmApi = {
  on: () => api.post('/alarm/on'),
  off: () => api.post('/alarm/off'),
  getStatus: () => api.get<{ active: boolean }>('/alarm/status'),
  test: () => api.post('/alarm/test'),
};

export type WeeklyChartPoint = {
  day: string;
  safe: number;
  overload: number;
  underload: number;
};

// Reports API
export const reportsApi = {
  getDailyStats: (date?: string) =>
    api.get<DailyStats>(`/reports/daily${date ? `?date=${date}` : ''}`),
  getWeeklyStats: () => api.get<WeeklyChartPoint[]>('/reports/weekly'),
  getMonthlyStats: () => api.get('/reports/monthly'),
  getOverloadTrends: (days?: number) => 
    api.get(`/reports/overload-trends?days=${days || 30}`),
  getVehicleStats: () => api.get('/reports/vehicle-stats'),
};

// Settings API
export const settingsApi = {
  get: () => api.get<SystemSettings>('/settings'),
  update: (settings: Partial<SystemSettings>) => 
    api.put<SystemSettings>('/settings', settings),
};

// GPS tracking API
export const gpsApi = {
  getStatus: () =>
    api.get<{
      tracking: {
        running: boolean;
        intervalMs: number;
        lastPollAt: string | null;
        devicesTracked: number;
        updated: number;
        failed: number;
      };
      activeDevices: number;
      config: { pollIntervalMs: number; traccar: boolean; simulator: boolean };
    }>('/gps/status'),
  getDevices: () => api.get('/gps/devices'),
  sync: () => api.post('/gps/sync'),
};

// Ticket API
export const ticketApi = {
  generate: (measurementId: string) => 
    api.post(`/tickets/generate/${measurementId}`),
  print: (measurementId: string) => 
    api.post(`/tickets/print/${measurementId}`),
  getPdf: (measurementId: string) =>
    api.get(`/tickets/pdf/${measurementId}`, { responseType: 'blob' }),
};

export default api;
