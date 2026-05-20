'use client';

import { useEffect } from 'react';
import { socketService } from '@/services/socket';
import { useLoadGuardStore } from '@/store/loadguard-store';
import type { SystemStatus } from '@/types';

/** App-wide socket listeners for alarm and system status. */
export function SystemSocketProvider({ children }: { children: React.ReactNode }) {
  const setSystemStatus = useLoadGuardStore((s) => s.setSystemStatus);

  useEffect(() => {
    socketService.connect();

    const unsubStatus = socketService.onSystemStatus((data: SystemStatus) => {
      setSystemStatus(data);
    });

    const unsubAlarm = socketService.onAlarmEvent((data: { active: boolean; reason?: string }) => {
      setSystemStatus({ buzzerActive: data.active });
    });

    return () => {
      unsubStatus();
      unsubAlarm();
    };
  }, [setSystemStatus]);

  return <>{children}</>;
}
