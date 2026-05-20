'use client';

import { useEffect, useRef } from 'react';
import { useLoadGuardStore } from '@/store/loadguard-store';
import type { LiveWeight } from '@/types';
import { isDemoOverloadVehicle } from '@/lib/alarm-sound';

const TICK_MS = 350;

/** Deterministic target weight ratio (85–110%) from vehicle id. */
function targetRatioForVehicle(vehicleId: string, plateNumber?: string): number {
  if (isDemoOverloadVehicle(plateNumber)) {
    return 1.12;
  }

  let hash = 0;
  for (let i = 0; i < vehicleId.length; i++) {
    hash = (hash * 31 + vehicleId.charCodeAt(i)) | 0;
  }
  const normalized = (Math.abs(hash) % 1000) / 1000;
  return 0.85 + normalized * 0.25;
}

function publishWeight(setLiveWeight: (w: LiveWeight) => void, next: LiveWeight) {
  const prev = useLoadGuardStore.getState().liveWeight;
  if (
    prev.value === next.value &&
    prev.stable === next.stable &&
    prev.trend === next.trend
  ) {
    return;
  }
  setLiveWeight(next);
}

/** Single app-wide weight simulation — vehicle-aware ramp until stable. */
export function SensorProvider({ children }: { children: React.ReactNode }) {
  const setLiveWeight = useLoadGuardStore((s) => s.setLiveWeight);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let currentWeight = 0;
    let targetWeight = 0;
    let sessionVehicleId: string | null = null;
    let lastScaleSessionKey = 0;
    let stableCounter = 0;

    intervalRef.current = setInterval(() => {
      const { selectedVehicle, scaleSessionKey } = useLoadGuardStore.getState();

      if (scaleSessionKey !== lastScaleSessionKey) {
        lastScaleSessionKey = scaleSessionKey;
        currentWeight = 0;
        stableCounter = 0;
        if (selectedVehicle) {
          sessionVehicleId = selectedVehicle.id;
          targetWeight = Math.round(
            selectedVehicle.allowedWeight *
              targetRatioForVehicle(selectedVehicle.id, selectedVehicle.plateNumber)
          );
        }
      }

      if (!selectedVehicle) {
        sessionVehicleId = null;
        targetWeight = 0;
        currentWeight = 0;
        stableCounter = 0;
        publishWeight(setLiveWeight, {
          value: 0,
          stable: true,
          trend: 'stable',
          timestamp: new Date(),
        });
        return;
      }

      if (selectedVehicle.id !== sessionVehicleId) {
        sessionVehicleId = selectedVehicle.id;
        targetWeight = Math.round(
          selectedVehicle.allowedWeight *
            targetRatioForVehicle(selectedVehicle.id, selectedVehicle.plateNumber)
        );
        currentWeight = 0;
        stableCounter = 0;
      }

      const diff = targetWeight - currentWeight;
      const nearTarget = Math.abs(diff) < 150;

      let step: number;
      if (nearTarget) {
        step = diff * 0.22 + (Math.random() - 0.5) * 8;
      } else {
        step = Math.sign(diff) * (110 + Math.random() * 140) + (Math.random() - 0.5) * 30;
      }

      currentWeight = Math.max(0, Math.min(50000, currentWeight + step));

      const fluctuation = nearTarget ? Math.abs((Math.random() - 0.5) * 10) : 999;
      stableCounter = nearTarget && fluctuation < 5 ? stableCounter + 1 : 0;

      const trend: LiveWeight['trend'] =
        step > 15 ? 'increasing' : step < -15 ? 'decreasing' : 'stable';

      publishWeight(setLiveWeight, {
        value: Math.round(currentWeight),
        stable: stableCounter > 3 && nearTarget,
        trend,
        timestamp: new Date(),
      });
    }, TICK_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [setLiveWeight]);

  useEffect(() => {
    const tick = setInterval(() => {
      useLoadGuardStore.getState().setSystemStatus({ lastUpdate: new Date() });
    }, 10000);
    return () => clearInterval(tick);
  }, []);

  return <>{children}</>;
}
