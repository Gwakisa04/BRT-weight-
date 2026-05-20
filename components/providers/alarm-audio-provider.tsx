'use client';

import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  startAlarmSound,
  stopAlarmSound,
  setAlarmVolume,
} from '@/lib/alarm-sound';
import { socketService } from '@/services/socket';
import { useLoadGuardStore } from '@/store/loadguard-store';

/**
 * Keeps buzzerActive in sync with /alarm.mp3 and auto-triggers on stable overload.
 */
export function AlarmAudioProvider({ children }: { children: React.ReactNode }) {
  const { buzzerActive, liveWeight, selectedVehicle, settings, scaleSessionKey } =
    useLoadGuardStore(
      useShallow((s) => ({
        buzzerActive: s.systemStatus.buzzerActive,
        liveWeight: s.liveWeight,
        selectedVehicle: s.selectedVehicle,
        settings: s.settings,
        scaleSessionKey: s.scaleSessionKey,
      }))
    );

  const setSystemStatus = useLoadGuardStore((s) => s.setSystemStatus);
  const overloadAlarmFiredRef = useRef(false);
  const prevBuzzerRef = useRef(buzzerActive);

  // Play / stop audio when buzzer state changes
  useEffect(() => {
    setAlarmVolume(settings.alarmVolume);

    if (buzzerActive && settings.alarmEnabled) {
      void startAlarmSound(settings.alarmVolume);
    } else {
      stopAlarmSound();
    }
  }, [buzzerActive, settings.alarmEnabled, settings.alarmVolume]);

  // Reset auto-alarm latch when vehicle or scale session changes
  useEffect(() => {
    overloadAlarmFiredRef.current = false;
  }, [selectedVehicle?.id, scaleSessionKey]);

  // Auto-trigger alarm on stable overload (includes KEA 012D demo vehicle)
  useEffect(() => {
    if (!selectedVehicle || !settings.alarmEnabled) return;

    const allowed = selectedVehicle.allowedWeight;
    if (!allowed || allowed <= 0) return;

    const isOverload = liveWeight.value > allowed;
    const isStableOverload = isOverload && liveWeight.stable;

    if (isStableOverload && !overloadAlarmFiredRef.current && !buzzerActive) {
      overloadAlarmFiredRef.current = true;
      setSystemStatus({ buzzerActive: true });
      socketService.triggerAlarm();
    }
  }, [
    liveWeight.value,
    liveWeight.stable,
    selectedVehicle?.id,
    selectedVehicle?.allowedWeight,
    settings.alarmEnabled,
    buzzerActive,
    setSystemStatus,
  ]);

  // If user manually stops alarm while still overloaded, don't auto re-fire this session
  useEffect(() => {
    const wasActive = prevBuzzerRef.current;
    prevBuzzerRef.current = buzzerActive;

    if (wasActive && !buzzerActive && selectedVehicle) {
      const isOverload = liveWeight.value > selectedVehicle.allowedWeight;
      if (isOverload) {
        overloadAlarmFiredRef.current = true;
      }
    }
  }, [buzzerActive, liveWeight.value, selectedVehicle]);

  // Stop audio on unmount
  useEffect(() => () => stopAlarmSound(), []);

  return <>{children}</>;
}
