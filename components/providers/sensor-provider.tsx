'use client';

import { useEffect, useRef } from 'react';
import { useLoadGuardStore } from '@/store/loadguard-store';
import type { LiveWeight } from '@/types';

/** Single app-wide weight simulation — avoids duplicate intervals per page. */
export function SensorProvider({ children }: { children: React.ReactNode }) {
  const setLiveWeight = useLoadGuardStore((s) => s.setLiveWeight);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let currentWeight = useLoadGuardStore.getState().liveWeight.value || 0;
    let direction = 1;
    let stableCounter = 0;

    intervalRef.current = setInterval(() => {
      const fluctuation = (Math.random() - 0.5) * 50;
      if (Math.random() > 0.95) direction *= -1;
      const trend = direction * Math.random() * 20;
      currentWeight = Math.max(0, Math.min(50000, currentWeight + fluctuation + trend));

      const isStable = Math.abs(fluctuation) < 10;
      stableCounter = isStable ? stableCounter + 1 : 0;

      const next: LiveWeight = {
        value: Math.round(currentWeight),
        stable: stableCounter > 3,
        trend: trend > 5 ? 'increasing' : trend < -5 ? 'decreasing' : 'stable',
        timestamp: new Date(),
      };
      setLiveWeight(next);
    }, 500);

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
