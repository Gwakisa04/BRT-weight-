'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { GPS_POLL_INTERVAL_MS } from '@/lib/gps-config';
import { applyVehicleLocationEvent, type VehicleLocationEvent } from '@/lib/gps-sync';
import { syncVehiclesOnly, shouldRunVehiclePoll } from '@/lib/app-data-sync';
import { useLoadGuardStore } from '@/store/loadguard-store';
import { socketService } from '@/services/socket';
import type { GPSLocation } from '@/types';

/** GPS poll only on vehicle/weighing routes; socket updates everywhere. */
export function GpsTrackingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const setGpsSync = useLoadGuardStore((s) => s.setGpsSync);
  const socketReady = useRef(false);

  useEffect(() => {
    if (socketReady.current) return;
    socketReady.current = true;

    socketService.connect();
    const unsub = socketService.onVehicleLocation((raw) => {
      const event = raw as VehicleLocationEvent & {
        location: GPSLocation & { timestamp: string | Date };
      };
      applyVehicleLocationEvent({
        vehicleId: event.vehicleId,
        plateNumber: event.plateNumber,
        location: {
          ...event.location,
          timestamp: new Date(event.location.timestamp),
        },
        gpsDevice: event.gpsDevice,
        source: event.source,
      });
    });

    return unsub;
  }, []);

  useEffect(() => {
    if (!shouldRunVehiclePoll(pathname)) return;

    void syncVehiclesOnly();
    const interval = setInterval(() => void syncVehiclesOnly(), GPS_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [pathname, setGpsSync]);

  return <>{children}</>;
}
