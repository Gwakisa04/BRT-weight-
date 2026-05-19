'use client';

import { cn } from '@/lib/utils';
import type { WeightStatus } from '@/types';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

interface WeightStatusBadgeProps {
  status: WeightStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function WeightStatusBadge({
  status,
  className,
  size = 'md',
  showIcon = true,
}: WeightStatusBadgeProps) {
  const statusConfig = {
    SAFE: {
      label: 'SAFE',
      icon: ShieldCheck,
      className: 'bg-success/10 text-success border-success/30',
    },
    UNDERLOAD: {
      label: 'UNDERLOAD',
      icon: Shield,
      className: 'bg-warning/10 text-warning border-warning/30',
    },
    OVERLOAD: {
      label: 'OVERLOAD',
      icon: ShieldAlert,
      className: 'bg-destructive/10 text-destructive border-destructive/30 animate-pulse',
    },
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-base gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-bold tracking-wide',
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{config.label}</span>
    </div>
  );
}

interface WeightComparisonProps {
  measuredWeight: number;
  allowedWeight: number;
  className?: string;
  unit?: string;
}

export function WeightComparison({
  measuredWeight,
  allowedWeight,
  className,
  unit = 'kg',
}: WeightComparisonProps) {
  const difference = measuredWeight - allowedWeight;
  const percentage = (measuredWeight / allowedWeight) * 100;
  
  const getStatus = (): WeightStatus => {
    if (percentage > 100) return 'OVERLOAD';
    if (percentage < 50) return 'UNDERLOAD';
    return 'SAFE';
  };

  const status = getStatus();

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Measured</p>
          <p className="text-2xl font-bold digital-display">
            {measuredWeight.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">{unit}</p>
        </div>
        
        <div className="text-center flex items-center justify-center">
          <div className={cn(
            'rounded-lg p-2',
            status === 'OVERLOAD' && 'bg-destructive/10',
            status === 'SAFE' && 'bg-success/10',
            status === 'UNDERLOAD' && 'bg-warning/10',
          )}>
            {status === 'OVERLOAD' ? (
              <AlertTriangle className="h-6 w-6 text-destructive" />
            ) : (
              <Shield className={cn(
                'h-6 w-6',
                status === 'SAFE' ? 'text-success' : 'text-warning'
              )} />
            )}
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Allowed</p>
          <p className="text-2xl font-bold digital-display">
            {allowedWeight.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">{unit}</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <div>
          <p className="text-sm text-muted-foreground">Difference</p>
          <p className={cn(
            'text-xl font-bold',
            difference > 0 ? 'text-destructive' : difference < 0 ? 'text-success' : 'text-muted-foreground'
          )}>
            {difference > 0 ? '+' : ''}{difference.toLocaleString()} {unit}
          </p>
        </div>
        <WeightStatusBadge status={status} size="lg" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Load capacity</span>
          <span className="font-medium">{percentage.toFixed(1)}%</span>
        </div>
        <div className="h-3 rounded-full bg-secondary overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              percentage > 100 ? 'bg-destructive' : percentage > 90 ? 'bg-warning' : 'bg-success'
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
