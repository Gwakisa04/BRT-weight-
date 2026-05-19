'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  BarChart3,
  Download,
  TrendingUp,
  TrendingDown,
  Truck,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';

const ReportsCharts = dynamic(
  () => import('@/components/charts/reports-charts').then((m) => m.ReportsCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[380px] rounded-xl" />
        ))}
      </div>
    ),
  }
);

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('week');

  const handleDownload = (reportType: string) => {
    toast.info(`Generating ${reportType} report...`, {
      description: 'Download will start shortly',
    });
  };

  const summaryStats = [
    {
      title: 'Total Measurements',
      value: '1,247',
      change: '+12%',
      changeType: 'up' as const,
      icon: BarChart3,
    },
    {
      title: 'Overload Rate',
      value: '15.2%',
      change: '-3%',
      changeType: 'down' as const,
      icon: AlertTriangle,
    },
    {
      title: 'Compliance Rate',
      value: '84.8%',
      change: '+3%',
      changeType: 'up' as const,
      icon: CheckCircle2,
    },
    {
      title: 'Unique Vehicles',
      value: '312',
      change: '+8%',
      changeType: 'up' as const,
      icon: Truck,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and performance insights
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleDownload('full')} className="gap-2">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs">
                {stat.changeType === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
                <span className={stat.changeType === 'up' ? 'text-success' : 'text-destructive'}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ReportsCharts />

      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
          <CardDescription>Download detailed reports in various formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => handleDownload('daily')}
            >
              <BarChart3 className="h-6 w-6" />
              <span>Daily Report</span>
              <span className="text-xs text-muted-foreground">PDF / Excel</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => handleDownload('overload')}
            >
              <AlertTriangle className="h-6 w-6" />
              <span>Overload Report</span>
              <span className="text-xs text-muted-foreground">PDF / Excel</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => handleDownload('vehicle')}
            >
              <Truck className="h-6 w-6" />
              <span>Vehicle Report</span>
              <span className="text-xs text-muted-foreground">PDF / Excel</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
