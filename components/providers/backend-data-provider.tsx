'use client';

import { useEffect, useRef } from 'react';
import { syncAppDataFull, pollBackendHealth, getSyncIntervals } from '@/lib/app-data-sync';
import { useLoadGuardStore } from '@/store/loadguard-store';

/** Background sync only — never blocks page render. */
export function BackendDataProvider({ children }: { children: React.ReactNode }) {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const hasCache = useLoadGuardStore.getState().vehicles.length > 0;
    const run = () => void syncAppDataFull(!hasCache);

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(run, { timeout: 800 });
    } else {
      setTimeout(run, 0);
    }

    void pollBackendHealth();

    const fullInterval = setInterval(() => void syncAppDataFull(), getSyncIntervals().fullSyncMs);
    const healthInterval = setInterval(
      () => void pollBackendHealth(),
      getSyncIntervals().healthPollMs
    );

    return () => {
      clearInterval(fullInterval);
      clearInterval(healthInterval);
    };
  }, []);

  return <>{children}</>;
}
