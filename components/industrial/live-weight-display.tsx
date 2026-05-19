'use client';

import { cn } from '@/lib/utils';

interface LiveWeightDisplayProps {
  value: number;
  unit?: string;
  stable?: boolean;
  trend?: 'increasing' | 'decreasing' | 'stable';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function LiveWeightDisplay({
  value,
  unit = 'kg',
  stable = true,
  trend = 'stable',
  className,
  size = 'lg',
}: LiveWeightDisplayProps) {
  const formattedValue = value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl',
  };

  const trendIndicator = {
    increasing: '▲',
    decreasing: '▼',
    stable: '●',
  };

  const trendColor = {
    increasing: 'text-chart-3',
    decreasing: 'text-chart-1',
    stable: 'text-success',
  };

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative">
        <div
          className={cn(
            'digital-display font-bold tracking-wider transition-all',
            sizeClasses[size],
            !stable && 'animate-pulse'
          )}
        >
          {formattedValue}
        </div>
        <span
          className={cn(
            'absolute -right-8 top-1/2 -translate-y-1/2 text-lg transition-colors',
            trendColor[trend]
          )}
        >
          {trendIndicator[trend]}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-medium text-muted-foreground">{unit}</span>
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            stable ? 'bg-success' : 'bg-warning animate-pulse'
          )}
        />
        <span className="text-xs text-muted-foreground">
          {stable ? 'Stable' : 'Reading...'}
        </span>
      </div>
    </div>
  );
}
