'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { mockWeeklyData, mockMonthlyTrends, mockWeightDistribution } from '@/lib/mock-data';
import { PieChart as PieChartIcon } from 'lucide-react';
import { CHART, PIE_COLORS } from '@/lib/chart-colors';

const tooltipStyle = {
  backgroundColor: CHART.tooltipBg,
  border: `1px solid ${CHART.tooltipBorder}`,
  borderRadius: '8px',
  color: CHART.tooltipText,
  fontSize: '12px',
};

export function ReportsCharts() {
  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">Weekly Measurement Breakdown</CardTitle>
          <CardDescription>Status distribution by day of week</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={mockWeeklyData} margin={{ left: -12, right: 8 }}>
              <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: CHART.muted, fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: CHART.muted, fontSize: 11 }} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
              <Bar dataKey="safe" name="Safe" fill={CHART.safe} radius={[4, 4, 0, 0]} />
              <Bar dataKey="overload" name="Overload" fill={CHART.danger} radius={[4, 4, 0, 0]} />
              <Bar dataKey="underload" name="Underload" fill={CHART.warning} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">Overload Trends</CardTitle>
          <CardDescription>Monthly overload incidents over time</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={mockMonthlyTrends} margin={{ left: -12, right: 8 }}>
              <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: CHART.muted, fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: CHART.muted, fontSize: 11 }} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="overloads"
                name="Overloads"
                stroke={CHART.danger}
                strokeWidth={2}
                dot={{ fill: CHART.danger, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <PieChartIcon className="h-5 w-5 shrink-0" />
            Weight Distribution
          </CardTitle>
          <CardDescription>Percentage of allowed weight utilized</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={mockWeightDistribution}
                cx="50%"
                cy="45%"
                labelLine={false}
                label={({ range, percentage }) =>
                  `${range} ${percentage}%`
                }
                outerRadius={72}
                innerRadius={28}
                paddingAngle={2}
                dataKey="count"
              >
                {mockWeightDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} layout="horizontal" verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">DART bus models</CardTitle>
          <CardDescription>Measurements by bus category</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={[
                { type: 'XML6185C', count: 120, overload: 18 },
                { type: 'XML6125C', count: 95, overload: 12 },
                { type: 'XML6125 Feeder', count: 80, overload: 8 },
              ]}
              layout="vertical"
              margin={{ left: 4, right: 8 }}
            >
              <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fill: CHART.muted, fontSize: 11 }} tickLine={false} />
              <YAxis
                type="category"
                dataKey="type"
                width={88}
                tick={{ fill: CHART.muted, fontSize: 10 }}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
              <Bar dataKey="count" name="Total" fill={CHART.primary} radius={[0, 4, 4, 0]} maxBarSize={20} />
              <Bar dataKey="overload" name="Overloaded" fill={CHART.danger} radius={[0, 4, 4, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
