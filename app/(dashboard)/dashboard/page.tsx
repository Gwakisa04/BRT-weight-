'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LiveWeightDisplay } from '@/components/industrial/live-weight-display';
import { SystemStatusPanel } from '@/components/industrial/sensor-status-badge';
import { AlarmIndicator } from '@/components/industrial/alarm-indicator';
import { VehicleInfoCard } from '@/components/industrial/vehicle-info-card';
import { MeasurementTable } from '@/components/industrial/measurement-table';
import { DashboardStatsPanel } from '@/components/industrial/metric-card';
import { WeightStatusBadge } from '@/components/industrial/weight-status';
import { useLoadGuardStore } from '@/store/loadguard-store';
import { useLiveWeight, useSystemStatus } from '@/hooks/use-sensor';
import { reportsApi } from '@/services/api';
import { Truck, AlertTriangle, CheckCircle2, Scale, Activity, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { DashboardPeriod } from '@/types';

const WeeklyBarChart = dynamic(
  () => import('@/components/charts/weekly-bar-chart').then((m) => m.WeeklyBarChart),
  { ssr: false, loading: () => <Skeleton className="h-[250px] w-full rounded-lg" /> }
);

const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
];

const PERIOD_SUBTITLES: Record<DashboardPeriod, string> = {
  all: 'All recorded weighings',
  today: 'Weighings today',
  week: 'Last 7 days',
};

export default function DashboardPage() {
  const { weight, status } = useLiveWeight();
  const { status: systemStatus, toggleBuzzer } = useSystemStatus();
  const selectedVehicle = useLoadGuardStore((s) => s.selectedVehicle);
  const dashboardSummary = useLoadGuardStore((s) => s.dashboardSummary);
  const setDashboardSummary = useLoadGuardStore((s) => s.setDashboardSummary);
  const recentMeasurements = useLoadGuardStore((s) => s.recentMeasurements);
  const backendConnected = useLoadGuardStore((s) => s.systemStatus.backendConnected);
  const vehiclesCount = useLoadGuardStore((s) => s.vehicles.length);

  const [period, setPeriod] = useState<DashboardPeriod>('today');
  const [loadingSummary, setLoadingSummary] = useState(false);

  const fetchSummary = useCallback(
    async (p: DashboardPeriod) => {
      if (!backendConnected) return;
      setLoadingSummary(true);
      try {
        const { data } = await reportsApi.getSummary(p);
        setDashboardSummary(data);
      } catch {
        /* keep previous summary */
      } finally {
        setLoadingSummary(false);
      }
    },
    [backendConnected, setDashboardSummary]
  );

  useEffect(() => {
    void fetchSummary(period);
  }, [period, fetchSummary]);

  const stats = useMemo(() => {
    const fleet = dashboardSummary?.totalVehiclesInFleet ?? vehiclesCount;
    const safe = dashboardSummary?.safeWeighings;
    const overload = dashboardSummary?.overloadWeighings;
    const total = dashboardSummary?.totalWeighings;
    const subtitle = PERIOD_SUBTITLES[period];

    return [
      {
        title: 'Total Vehicles',
        value: loadingSummary && !dashboardSummary ? '—' : fleet,
        subtitle: 'Registered in system',
        icon: Truck,
      },
      {
        title: 'Overloaded',
        value: loadingSummary && period !== 'today' ? '—' : (overload ?? 0),
        subtitle,
        icon: AlertTriangle,
        variant: 'danger' as const,
      },
      {
        title: 'Safe Weighings',
        value: loadingSummary && period !== 'today' ? '—' : (safe ?? 0),
        subtitle,
        icon: CheckCircle2,
        variant: 'success' as const,
      },
      {
        title: 'Total Weighings',
        value: loadingSummary && period !== 'today' ? '—' : (total ?? 0),
        subtitle,
        icon: Scale,
      },
    ];
  }, [dashboardSummary, vehiclesCount, period, loadingSummary]);

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

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground mr-1">Period:</span>
        {PERIOD_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={period === opt.value ? 'default' : 'outline'}
            size="sm"
            className={cn('h-8', period === opt.value && 'shadow-sm')}
            onClick={() => setPeriod(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
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
