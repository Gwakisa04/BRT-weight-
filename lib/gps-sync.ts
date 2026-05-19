import { useLoadGuardStore } from '@/store/loadguard-store';
import { normalizeVehicle } from '@/lib/api-normalize';
import type { GPSDevice, GPSLocation, Vehicle } from '@/types';

export interface VehicleLocationEvent {
  vehicleId: string;
  plateNumber: string;
  location: GPSLocation;
  gpsDevice?: GPSDevice;
  source?: string;
}

/** Apply instant update from Socket.IO vehicle_location (between poll ticks). */
export function applyVehicleLocationEvent(event: VehicleLocationEvent): void {
  const { updateVehicle, setSelectedVehicle, selectedVehicle, setGpsSync } =
    useLoadGuardStore.getState();

  const location: GPSLocation = {
    ...event.location,
    timestamp: new Date(event.location.timestamp),
  };

  const existing = useLoadGuardStore.getState().vehicles.find((v) => v.id === event.vehicleId);
  if (!existing) return;

  const updates: Partial<Vehicle> = {
    currentLocation: location,
    gpsDevice: event.gpsDevice
      ? {
          ...event.gpsDevice,
          lastSeen: event.gpsDevice.lastSeen
            ? new Date(event.gpsDevice.lastSeen)
            : new Date(),
          isActive: true,
        }
      : existing.gpsDevice
        ? { ...existing.gpsDevice, isActive: true, lastSeen: new Date() }
        : undefined,
  };

  updateVehicle(event.vehicleId, updates);

  if (selectedVehicle?.id === event.vehicleId) {
    setSelectedVehicle({ ...selectedVehicle, ...updates });
  }

  setGpsSync({
    lastSyncAt: new Date(),
    lastSocketAt: new Date(),
    lastError: null,
  });
}

/** @deprecated Use syncVehiclesOnly from app-data-sync */
export async function syncVehiclesGpsFromApi(): Promise<number> {
  const { syncVehiclesOnly } = await import('@/lib/app-data-sync');
  await syncVehiclesOnly(true);
  return useLoadGuardStore.getState().vehicles.length;
}
