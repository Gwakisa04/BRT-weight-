'use client';

import { useMemo } from 'react';
import { useLoadGuardStore } from '@/store/loadguard-store';
import { GPS_POLL_INTERVAL_MS, GPS_POLL_INTERVAL_SEC } from '@/lib/gps-config';
import { formatDistanceToNow } from 'date-fns';

/** Read live GPS sync state (updated every GPS_POLL_INTERVAL_MS). */
export function useGpsTracking() {
  const gpsSync = useLoadGuardStore((s) => s.gpsSync);
  const vehicles = useLoadGuardStore((s) => s.vehicles);

  const vehiclesWithGps = useMemo(
    () => vehicles.filter((v) => v.gpsDevice),
    [vehicles]
  );

  const vehiclesWithLiveLocation = useMemo(
    () => vehicles.filter((v) => v.gpsDevice && v.currentLocation),
    [vehicles]
  );

  const lastUpdateLabel = useMemo(() => {
    const at = gpsSync.lastSocketAt ?? gpsSync.lastSyncAt;
    if (!at) return 'Waiting for GPS…';
    return `Updated ${formatDistanceToNow(at, { addSuffix: true })}`;
  }, [gpsSync.lastSyncAt, gpsSync.lastSocketAt]);

  return {
    pollIntervalMs: GPS_POLL_INTERVAL_MS,
    pollIntervalSec: GPS_POLL_INTERVAL_SEC,
    gpsSync,
    vehiclesWithGps,
    vehiclesWithLiveLocation,
    lastUpdateLabel,
    isLive: Boolean(gpsSync.lastSyncAt && !gpsSync.lastError),
  };
}

/** Get freshest vehicle row from store (for map / location sheet). */
export function useVehicleFromStore(vehicleId: string | null | undefined) {
  return useLoadGuardStore((s) =>
    vehicleId ? s.vehicles.find((v) => v.id === vehicleId) ?? null : null
  );
}
