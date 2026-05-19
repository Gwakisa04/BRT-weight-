'use client';

import { useEffect, useState } from 'react';
import { useLoadGuardStore } from '@/store/loadguard-store';

/** True after Zustand persist has rehydrated from localStorage. */
export function useStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() =>
    typeof window === 'undefined' ? true : useLoadGuardStore.persist.hasHydrated()
  );

  useEffect(() => {
    const unsub = useLoadGuardStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useLoadGuardStore.persist.hasHydrated());
    return unsub;
  }, []);

  return hydrated;
}
