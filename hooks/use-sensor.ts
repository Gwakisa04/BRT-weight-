'use client';

import { useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { socketService } from '@/services/socket';
import { useLoadGuardStore } from '@/store/loadguard-store';
import type { LiveWeight, SystemStatus } from '@/types';

export function useLiveWeight() {
  const { liveWeight, selectedVehicle } = useLoadGuardStore(
    useShallow((s) => ({ liveWeight: s.liveWeight, selectedVehicle: s.selectedVehicle }))
  );
  const setLiveWeight = useLoadGuardStore((s) => s.setLiveWeight);

  const bumpScaleSession = useLoadGuardStore((s) => s.bumpScaleSession);

  const resetWeight = useCallback(() => {
    bumpScaleSession();
    setLiveWeight({
      value: 0,
      stable: false,
      trend: 'stable',
      timestamp: new Date(),
    });
  }, [setLiveWeight, bumpScaleSession]);

  const getStatus = useCallback(() => {
    if (!selectedVehicle) return 'SAFE' as const;
    const percentage = (liveWeight.value / selectedVehicle.allowedWeight) * 100;
    if (percentage > 100) return 'OVERLOAD' as const;
    if (percentage < 50) return 'UNDERLOAD' as const;
    return 'SAFE' as const;
  }, [liveWeight.value, selectedVehicle]);

  return {
    weight: liveWeight,
    isSimulating: true,
    resetWeight,
    status: getStatus(),
  };
}

export function useSystemStatus() {
  const systemStatus = useLoadGuardStore((s) => s.systemStatus);
  const setSystemStatus = useLoadGuardStore((s) => s.setSystemStatus);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      socketService.connect();
      setSystemStatus({ backendConnected: true, sensorOnline: true });
    } catch (error) {
      console.error('Connection failed:', error);
      setSystemStatus({ backendConnected: false });
    } finally {
      setIsConnecting(false);
    }
  }, [setSystemStatus]);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    setSystemStatus({ backendConnected: false, sensorOnline: false });
  }, [setSystemStatus]);

  const toggleBuzzer = useCallback(() => {
    const settings = useLoadGuardStore.getState().settings;
    if (!settings.alarmEnabled) {
      return;
    }

    const active = !systemStatus.buzzerActive;
    setSystemStatus({ buzzerActive: active });
    if (active) socketService.triggerAlarm();
    else socketService.stopAlarm();
  }, [systemStatus.buzzerActive, setSystemStatus]);

  return {
    status: systemStatus,
    isConnecting,
    connect,
    disconnect,
    toggleBuzzer,
  };
}

export function useSocket() {
  const setLiveWeight = useLoadGuardStore((s) => s.setLiveWeight);
  const setSystemStatus = useLoadGuardStore((s) => s.setSystemStatus);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketService.connect();
    const unsubWeight = socketService.onLiveWeight((data: LiveWeight) => setLiveWeight(data));
    const unsubStatus = socketService.onSystemStatus((data: SystemStatus) => setSystemStatus(data));
    const checkConnection = setInterval(() => setIsConnected(socketService.isConnected()), 1000);
    return () => {
      unsubWeight();
      unsubStatus();
      clearInterval(checkConnection);
    };
  }, [setLiveWeight, setSystemStatus]);

  return { isConnected };
}
