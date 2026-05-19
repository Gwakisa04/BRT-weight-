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

const COLORS = [
  'hsl(var(--success))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
];

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
};

export function ReportsCharts() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Measurement Breakdown</CardTitle>
          <CardDescription>Status distribution by day of week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockWeeklyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="safe" name="Safe" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="overload" name="Overload" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="underload" name="Underload" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overload Trends</CardTitle>
          <CardDescription>Monthly overload incidents over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockMonthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line
                type="monotone"
                dataKey="overloads"
                name="Overloads"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--destructive))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Weight Distribution
          </CardTitle>
          <CardDescription>Percentage of allowed weight utilized</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockWeightDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ range, percentage }) => `${range}: ${percentage}%`}
                outerRadius={100}
                dataKey="count"
              >
                {mockWeightDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Type Statistics</CardTitle>
          <CardDescription>Measurements by vehicle category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { type: 'Truck', count: 450, overload: 65 },
                { type: 'Trailer', count: 380, overload: 52 },
                { type: 'Tanker', count: 220, overload: 28 },
                { type: 'Container', count: 150, overload: 18 },
                { type: 'Van', count: 47, overload: 3 },
              ]}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" className="text-xs" />
              <YAxis type="category" dataKey="type" className="text-xs" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="count" name="Total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              <Bar dataKey="overload" name="Overloaded" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
