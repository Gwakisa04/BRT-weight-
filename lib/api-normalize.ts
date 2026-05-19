import type { Measurement, Vehicle } from '@/types';

export function normalizeVehicle(vehicle: Vehicle): Vehicle {
  return {
    ...vehicle,
    createdAt: new Date(vehicle.createdAt),
    updatedAt: new Date(vehicle.updatedAt),
    gpsDevice: vehicle.gpsDevice
      ? {
          ...vehicle.gpsDevice,
          lastSeen: vehicle.gpsDevice.lastSeen
            ? new Date(vehicle.gpsDevice.lastSeen)
            : undefined,
        }
      : undefined,
    currentLocation: vehicle.currentLocation
      ? {
          ...vehicle.currentLocation,
          timestamp: new Date(vehicle.currentLocation.timestamp),
        }
      : undefined,
  };
}

export function normalizeMeasurement(measurement: Measurement): Measurement {
  return {
    ...measurement,
    timestamp: new Date(measurement.timestamp),
    vehicle: measurement.vehicle ? normalizeVehicle(measurement.vehicle) : undefined,
  };
}
