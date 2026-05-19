'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LiveWeightDisplay } from '@/components/industrial/live-weight-display';
import { SystemStatusPanel } from '@/components/industrial/sensor-status-badge';
import { AlarmIndicator } from '@/components/industrial/alarm-indicator';
import { VehicleInfoCard } from '@/components/industrial/vehicle-info-card';
import { MeasurementTable } from '@/components/industrial/measurement-table';
import { DashboardStatsPanel } from '@/components/industrial/metric-card';
import { WeightStatusBadge } from '@/components/industrial/weight-status';
import { useLoadGuardStore } from '@/store/loadguard-store';
import { useLiveWeight, useSystemStatus } from '@/hooks/use-sensor';
import { Truck, AlertTriangle, CheckCircle2, Scale, Activity, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const WeeklyBarChart = dynamic(
  () => import('@/components/charts/weekly-bar-chart').then((m) => m.WeeklyBarChart),
  { ssr: false, loading: () => <Skeleton className="h-[250px] w-full rounded-lg" /> }
);

export default function DashboardPage() {
  const { weight, status } = useLiveWeight();
  const { status: systemStatus, toggleBuzzer } = useSystemStatus();
  const selectedVehicle = useLoadGuardStore((s) => s.selectedVehicle);
  const dailyStats = useLoadGuardStore((s) => s.dailyStats);
  const recentMeasurements = useLoadGuardStore((s) => s.recentMeasurements);
  const backendConnected = useLoadGuardStore((s) => s.systemStatus.backendConnected);

  const stats = useMemo(
    () => [
      {
        title: 'Total Vehicles Today',
        value: dailyStats.totalVehicles,
        subtitle: 'Unique vehicles weighed',
        icon: Truck,
      },
      {
        title: 'Overloaded',
        value: dailyStats.overloadedVehicles,
        subtitle: 'Exceeded weight limit',
        icon: AlertTriangle,
        variant: 'danger' as const,
      },
      {
        title: 'Safe Vehicles',
        value: dailyStats.safeVehicles,
        subtitle: 'Within allowed weight',
        icon: CheckCircle2,
        variant: 'success' as const,
      },
      {
        title: 'Total Measurements',
        value: dailyStats.totalMeasurements,
        subtitle: 'Weighing operations today',
        icon: Scale,
      },
    ],
    [dailyStats]
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">
            {backendConnected
              ? 'Live stats from database · weight display simulated until sensor connected'
              : 'Connecting to backend…'}
          </p>
        </div>
        <SystemStatusPanel
          sensorOnline={systemStatus.sensorOnline}
          backendConnected={systemStatus.backendConnected}
          buzzerActive={systemStatus.buzzerActive}
        />
      </div>

      <DashboardStatsPanel stats={stats} />

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Live Weight Monitor
                </CardTitle>
                <CardDescription>
                  Simulated scale reading (connect ESP32 for real sensor data)
                </CardDescription>
              </div>
              <WeightStatusBadge status={status} size="lg" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center py-4">
              <LiveWeightDisplay
                value={weight.value}
                stable={weight.stable}
                trend={weight.trend}
                size="xl"
              />
            </div>
            <VehicleInfoCard vehicle={selectedVehicle} compact />
            <AlarmIndicator
              active={systemStatus.buzzerActive || status === 'OVERLOAD'}
              onTrigger={toggleBuzzer}
              onStop={toggleBuzzer}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              This Week
            </CardTitle>
            <CardDescription>Weekly measurement breakdown from database</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0 overflow-hidden pb-2">
            <WeeklyBarChart />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Measurements</CardTitle>
          <CardDescription>Latest records from MySQL</CardDescription>
        </CardHeader>
        <CardContent>
          <MeasurementTable measurements={recentMeasurements} />
        </CardContent>
      </Card>
    </div>
  );
}
