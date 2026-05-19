'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  variant = 'default',
}: MetricCardProps) {
  const variantStyles = {
    default: 'bg-card',
    success: 'bg-success/10 border-success/30',
    warning: 'bg-warning/10 border-warning/30',
    danger: 'bg-destructive/10 border-destructive/30',
  };

  const iconVariantStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
    danger: 'bg-destructive/20 text-destructive',
  };

  const TrendIcon = trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus;

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className={cn('rounded-lg p-2', iconVariantStyles[variant])}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold digital-display">{value}</div>
        <div className="flex items-center justify-between mt-1">
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                trend.direction === 'up' && 'text-success',
                trend.direction === 'down' && 'text-destructive',
                trend.direction === 'neutral' && 'text-muted-foreground'
              )}
            >
              <TrendIcon className="h-3 w-3" />
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsGridProps {
  stats: Array<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: LucideIcon;
    trend?: {
      value: number;
      direction: 'up' | 'down' | 'neutral';
    };
    variant?: 'default' | 'success' | 'warning' | 'danger';
  }>;
  className?: string;
  columns?: 2 | 3 | 4;
}

export function StatsGrid({ stats, className, columns = 4 }: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {stats.map((stat, i) => (
        <MetricCard key={i} {...stat} />
      ))}
    </div>
  );
}

const variantAccent: Record<
  NonNullable<StatsGridProps['stats'][number]['variant']> | 'default',
  string
> = {
  default: 'text-primary',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  danger: 'text-red-500',
};

/** Combined stats on small screens; grid from md breakpoint up. */
export function DashboardStatsPanel({ stats, className }: StatsGridProps) {
  return (
    <>
      <Card className={cn('overflow-hidden md:hidden', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Today&apos;s overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-px rounded-lg border bg-border overflow-hidden">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              const variant = stat.variant ?? 'default';
              return (
                <div key={i} className="flex flex-col gap-1 bg-card p-3 min-h-[88px]">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-medium text-muted-foreground leading-tight line-clamp-2">
                      {stat.title}
                    </span>
                    {Icon && (
                      <Icon className={cn('h-4 w-4 shrink-0', variantAccent[variant])} />
                    )}
                  </div>
                  <span className={cn('text-2xl font-bold tabular-nums', variantAccent[variant])}>
                    {stat.value}
                  </span>
                  {stat.subtitle && (
                    <span className="text-[10px] text-muted-foreground line-clamp-1">
                      {stat.subtitle}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <div className="hidden md:block">
        <StatsGrid stats={stats} columns={4} />
      </div>
    </>
  );
}
