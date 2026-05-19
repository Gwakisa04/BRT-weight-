import type { Vehicle, Measurement, DailyStats, GPSLocation } from '@/types';

// Mock GPS locations (Kenya-based for realistic data)
export const mockGPSLocations: Record<string, GPSLocation> = {
  '1': {
    latitude: -1.2921,
    longitude: 36.8219,
    altitude: 1795,
    speed: 45,
    heading: 180,
    accuracy: 5,
    timestamp: new Date(),
    address: {
      street: 'Kenyatta Avenue',
      city: 'Nairobi',
      region: 'Nairobi County',
      country: 'Kenya',
      postalCode: '00100',
      formattedAddress: 'Kenyatta Avenue, Nairobi CBD, Nairobi County, Kenya',
    },
  },
  '2': {
    latitude: -1.3032,
    longitude: 36.7073,
    altitude: 1680,
    speed: 0,
    heading: 0,
    accuracy: 3,
    timestamp: new Date(),
    address: {
      street: 'Enterprise Road',
      city: 'Nairobi',
      region: 'Nairobi County',
      country: 'Kenya',
      postalCode: '00500',
      formattedAddress: 'Enterprise Road, Industrial Area, Nairobi County, Kenya',
    },
  },
  '3': {
    latitude: -4.0435,
    longitude: 39.6682,
    altitude: 12,
    speed: 65,
    heading: 45,
    accuracy: 8,
    timestamp: new Date(),
    address: {
      street: 'Moi Avenue',
      city: 'Mombasa',
      region: 'Mombasa County',
      country: 'Kenya',
      postalCode: '80100',
      formattedAddress: 'Moi Avenue, Port Area, Mombasa County, Kenya',
    },
  },
  '4': {
    latitude: -0.0917,
    longitude: 34.7680,
    altitude: 1135,
    speed: 30,
    heading: 270,
    accuracy: 6,
    timestamp: new Date(),
    address: {
      street: 'Oginga Odinga Street',
      city: 'Kisumu',
      region: 'Kisumu County',
      country: 'Kenya',
      postalCode: '40100',
      formattedAddress: 'Oginga Odinga Street, Kisumu CBD, Kisumu County, Kenya',
    },
  },
  '5': {
    latitude: -1.2864,
    longitude: 36.8172,
    altitude: 1790,
    speed: 25,
    heading: 90,
    accuracy: 4,
    timestamp: new Date(),
    address: {
      street: 'Tom Mboya Street',
      city: 'Nairobi',
      region: 'Nairobi County',
      country: 'Kenya',
      postalCode: '00100',
      formattedAddress: 'Tom Mboya Street, CBD, Nairobi County, Kenya',
    },
  },
};

// Mock vehicles data
export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    plateNumber: 'KBA 123A',
    driver: 'John Kamau',
    company: 'Safari Logistics Ltd',
    allowedWeight: 25000,
    vehicleType: 'truck',
    gpsDevice: {
      deviceId: 'GPS-001-2024',
      imei: '356938035643809',
      serialNumber: 'SN-TRK-001-KE',
      isActive: true,
      lastSeen: new Date(),
    },
    currentLocation: mockGPSLocations['1'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    plateNumber: 'KCA 456B',
    driver: 'Peter Ochieng',
    company: 'Express Cargo Kenya',
    allowedWeight: 30000,
    vehicleType: 'trailer',
    gpsDevice: {
      deviceId: 'GPS-002-2024',
      imei: '356938035643810',
      serialNumber: 'SN-TRL-002-KE',
      isActive: true,
      lastSeen: new Date(),
    },
    currentLocation: mockGPSLocations['2'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    plateNumber: 'KDA 789C',
    driver: 'James Mwangi',
    company: 'Fuel Masters Co.',
    allowedWeight: 35000,
    vehicleType: 'tanker',
    gpsDevice: {
      deviceId: 'GPS-003-2024',
      imei: '356938035643811',
      serialNumber: 'SN-TNK-003-KE',
      isActive: true,
      lastSeen: new Date(),
    },
    currentLocation: mockGPSLocations['3'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    plateNumber: 'KEA 012D',
    driver: 'David Kipchoge',
    company: 'Container World',
    allowedWeight: 28000,
    vehicleType: 'container',
    gpsDevice: {
      deviceId: 'GPS-004-2024',
      imei: '356938035643812',
      serialNumber: 'SN-CNT-004-KE',
      isActive: false,
      lastSeen: new Date(Date.now() - 3600000 * 24),
    },
    currentLocation: mockGPSLocations['4'],
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: '5',
    plateNumber: 'KFA 345E',
    driver: 'Samuel Njoroge',
    company: 'Quick Deliveries',
    allowedWeight: 8000,
    vehicleType: 'van',
    gpsDevice: {
      deviceId: 'GPS-005-2024',
      imei: '356938035643813',
      serialNumber: 'SN-VAN-005-KE',
      isActive: true,
      lastSeen: new Date(),
    },
    currentLocation: mockGPSLocations['5'],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
  },
];

let cachedMeasurements: Measurement[] | null = null;

// Generate mock measurements (cached for fast navigation)
export const generateMockMeasurements = (count: number = 20): Measurement[] => {
  if (count === 10 && cachedMeasurements) return cachedMeasurements;
  const statuses: Array<'SAFE' | 'UNDERLOAD' | 'OVERLOAD'> = ['SAFE', 'UNDERLOAD', 'OVERLOAD'];
  const operators = ['Admin', 'Operator 1', 'Operator 2', 'System'];
  
  const result = Array.from({ length: count }, (_, i) => {
    const vehicle = mockVehicles[Math.floor(Math.random() * mockVehicles.length)];
    const variancePercent = (Math.random() - 0.3) * 40; // -30% to +70%
    const measuredWeight = Math.round(vehicle.allowedWeight * (1 + variancePercent / 100));
    const excessWeight = measuredWeight - vehicle.allowedWeight;
    
    let status: 'SAFE' | 'UNDERLOAD' | 'OVERLOAD' = 'SAFE';
    if (excessWeight > 0) status = 'OVERLOAD';
    else if (measuredWeight < vehicle.allowedWeight * 0.5) status = 'UNDERLOAD';
    
    const timestamp = new Date();
    timestamp.setMinutes(timestamp.getMinutes() - i * 15);
    
    return {
      id: `m-${i + 1}`,
      vehicleId: vehicle.id,
      vehicle,
      measuredWeight,
      allowedWeight: vehicle.allowedWeight,
      excessWeight,
      status,
      operator: operators[Math.floor(Math.random() * operators.length)],
      timestamp,
      ticketNumber: `TKT-${timestamp.getFullYear()}${String(timestamp.getMonth() + 1).padStart(2, '0')}${String(timestamp.getDate()).padStart(2, '0')}-${String(i + 1).padStart(4, '0')}`,
    };
  });
  if (count === 10) cachedMeasurements = result;
  return result;
};

// Mock daily stats
export const mockDailyStats: DailyStats = {
  date: new Date().toISOString().split('T')[0],
  totalVehicles: 47,
  overloadedVehicles: 8,
  safeVehicles: 35,
  underloadVehicles: 4,
  totalMeasurements: 52,
};

// Mock weekly data for charts
export const mockWeeklyData = [
  { day: 'Mon', safe: 12, overload: 3, underload: 1 },
  { day: 'Tue', safe: 15, overload: 4, underload: 2 },
  { day: 'Wed', safe: 18, overload: 2, underload: 1 },
  { day: 'Thu', safe: 14, overload: 5, underload: 3 },
  { day: 'Fri', safe: 20, overload: 6, underload: 2 },
  { day: 'Sat', safe: 8, overload: 1, underload: 0 },
  { day: 'Sun', safe: 5, overload: 0, underload: 1 },
];

// Mock monthly trends
export const mockMonthlyTrends = [
  { month: 'Jan', overloads: 45 },
  { month: 'Feb', overloads: 38 },
  { month: 'Mar', overloads: 52 },
  { month: 'Apr', overloads: 41 },
  { month: 'May', overloads: 35 },
  { month: 'Jun', overloads: 28 },
];

// Mock weight distribution
export const mockWeightDistribution = [
  { range: '0-50%', count: 15, percentage: 10 },
  { range: '50-75%', count: 30, percentage: 20 },
  { range: '75-90%', count: 45, percentage: 30 },
  { range: '90-100%', count: 40, percentage: 27 },
  { range: '100%+', count: 20, percentage: 13 },
];
