'use client';

import { useEffect, useRef } from 'react';
import { syncAppDataFull, getSyncIntervals } from '@/lib/app-data-sync';
import { useLoadGuardStore } from '@/store/loadguard-store';

/** Background sync only — never blocks page render. */
export function BackendDataProvider({ children }: { children: React.ReactNode }) {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    // Show cached store immediately; refresh in background
    const hasCache = useLoadGuardStore.getState().vehicles.length > 0;
    const run = () => void syncAppDataFull(!hasCache);

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(run, { timeout: 800 });
    } else {
      setTimeout(run, 0);
    }

    const interval = setInterval(() => void syncAppDataFull(), getSyncIntervals().fullSyncMs);
    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}
