'use client';

import { useEffect } from 'react';
import { useLoadGuardStore } from '@/store/loadguard-store';

const LG_BREAKPOINT = 1024;

/** Collapse sidebar on small screens; expand rail on large screens. */
export function useResponsiveSidebar() {
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`);

    const sync = () => {
      useLoadGuardStore.setState({ sidebarOpen: mq.matches });
    };

    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
}

export function closeSidebarOnMobile() {
  if (typeof window !== 'undefined' && window.innerWidth < LG_BREAKPOINT) {
    useLoadGuardStore.setState({ sidebarOpen: false });
  }
}
