'use client';

import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { reportsApi } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { CHART } from '@/lib/chart-colors';

export type WeeklyChartPoint = {
  day: string;
  safe: number;
  overload: number;
  underload: number;
};

const tooltipStyle = {
  backgroundColor: CHART.tooltipBg,
  border: `1px solid ${CHART.tooltipBorder}`,
  borderRadius: '8px',
  color: CHART.tooltipText,
  fontSize: '12px',
};

export function WeeklyBarChart() {
  const [data, setData] = useState<WeeklyChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi
      .getWeeklyStats()
      .then((res) => setData(res.data as WeeklyChartPoint[]))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Skeleton className="h-[220px] sm:h-[280px] w-full rounded-lg" />;
  }

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-12 sm:py-16">
        No weekly measurement data yet
      </p>
    );
  }

  return (
    <div className="w-full min-w-0 -mx-1 px-1">
      <ResponsiveContainer width="100%" height={220} className="sm:!h-[280px]">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }} barGap={2}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: CHART.muted, fontSize: 11 }}
            axisLine={{ stroke: CHART.grid }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: CHART.muted, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
            iconType="circle"
            iconSize={8}
          />
          <Bar dataKey="safe" name="Safe" fill={CHART.safe} radius={[4, 4, 0, 0]} maxBarSize={36} />
          <Bar dataKey="overload" name="Overload" fill={CHART.danger} radius={[4, 4, 0, 0]} maxBarSize={36} />
          <Bar dataKey="underload" name="Underload" fill={CHART.warning} radius={[4, 4, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
