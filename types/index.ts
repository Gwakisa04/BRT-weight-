// Type definitions for LoadGuard System

export interface GPSDevice {
  deviceId: string;
  imei: string;
  serialNumber: string;
  isActive: boolean;
  lastSeen?: Date;
}

export interface GPSLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: Date;
  address?: LocationAddress;
}

export interface LocationAddress {
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  driver: string;
  company: string;
  allowedWeight: number;
  maxPassengers: number;
  vehicleType: 'xml6185c' | 'xml6125c' | 'xml6125_feeder';
  gpsDevice?: GPSDevice;
  currentLocation?: GPSLocation;
  createdAt: Date;
  updatedAt: Date;
}

export interface Measurement {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle;
  measuredWeight: number;
  allowedWeight: number;
  measuredPassengers?: number;
  maxPassengers?: number;
  excessWeight: number;
  status: 'SAFE' | 'UNDERLOAD' | 'OVERLOAD';
  operator: string;
  timestamp: Date;
  ticketNumber: string;
}

export interface SensorStatus {
  connected: boolean;
  lastPing: Date | null;
  signalStrength: number;
  calibrated: boolean;
}

export interface SystemStatus {
  sensorOnline: boolean;
  backendConnected: boolean;
  buzzerActive: boolean;
  lastUpdate: Date;
}

export interface LiveWeight {
  value: number;
  stable: boolean;
  trend: 'increasing' | 'decreasing' | 'stable';
  timestamp: Date;
}

export interface GpsSyncState {
  lastSyncAt: Date | null;
  lastSocketAt: Date | null;
  vehiclesWithLocation: number;
  totalGpsDevices: number;
  isPolling: boolean;
  lastError: string | null;
}

export interface DailyStats {
  date: string;
  totalVehicles: number;
  overloadedVehicles: number;
  safeVehicles: number;
  underloadVehicles: number;
  totalMeasurements: number;
}

export type DashboardPeriod = 'all' | 'today' | 'week';

export interface DashboardSummary {
  period: DashboardPeriod;
  totalVehiclesInFleet: number;
  safeWeighings: number;
  overloadWeighings: number;
  underloadWeighings: number;
  totalWeighings: number;
}

export interface WeightThreshold {
  warningPercentage: number;
  overloadPercentage: number;
}

export interface SystemSettings {
  weightUnit: 'kg' | 'ton' | 'lb';
  thresholds: WeightThreshold;
  alarmEnabled: boolean;
  alarmVolume: number;
  printerEnabled: boolean;
  printerName: string;
  backendUrl: string;
  sensorId: string;
  calibrationOffset: number;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  measurement: Measurement;
  vehicle: Vehicle;
  dateTime: Date;
  operator: string;
  companyLogo?: string;
  qrCode?: string;
}

export type WeightStatus = 'SAFE' | 'UNDERLOAD' | 'OVERLOAD';
