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

export type WeeklyChartPoint = {
  day: string;
  safe: number;
  overload: number;
  underload: number;
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
    return <Skeleton className="h-[250px] w-full rounded-lg" />;
  }

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-16">
        No weekly measurement data yet
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="day" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Bar dataKey="safe" name="Safe" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="overload" name="Overload" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="underload" name="Underload" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
