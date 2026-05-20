'use client';

import { cn } from '@/lib/utils';
import { Wifi, WifiOff, Server, ServerOff, Bell, BellOff, Activity } from 'lucide-react';

type StatusType = 'sensor' | 'backend' | 'buzzer' | 'generic';

interface SensorStatusBadgeProps {
  type: StatusType;
  status: boolean;
  label?: string;
  className?: string;
  showPulse?: boolean;
}

export function SensorStatusBadge({
  type,
  status,
  label,
  className,
  showPulse = true,
}: SensorStatusBadgeProps) {
  const icons = {
    sensor: status ? Wifi : WifiOff,
    backend: status ? Server : ServerOff,
    buzzer: status ? Bell : BellOff,
    generic: Activity,
  };

  const labels = {
    sensor: status ? 'Database Live' : 'Database Offline',
    backend: status ? 'Backend Live' : 'Backend Offline',
    buzzer: status ? 'Buzzer Active' : 'Buzzer Inactive',
    generic: status ? 'Online' : 'Offline',
  };

  const Icon = icons[type];
  const displayLabel = label || labels[type];

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all',
        status
          ? 'border-success/30 bg-success/10 text-success'
          : 'border-destructive/30 bg-destructive/10 text-destructive',
        className
      )}
    >
      <div className="relative">
        <Icon className="h-4 w-4" />
        {showPulse && status && (
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-success animate-ping" />
        )}
      </div>
      <span>{displayLabel}</span>
    </div>
  );
}

interface SystemStatusPanelProps {
  sensorOnline: boolean;
  backendConnected: boolean;
  buzzerActive: boolean;
  className?: string;
}

export function SystemStatusPanel({
  sensorOnline,
  backendConnected,
  buzzerActive,
  className,
}: SystemStatusPanelProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <SensorStatusBadge type="sensor" status={sensorOnline} />
      <SensorStatusBadge type="backend" status={backendConnected} />
      <SensorStatusBadge type="buzzer" status={buzzerActive} showPulse={buzzerActive} />
    </div>
  );
}
