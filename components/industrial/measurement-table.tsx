'use client';

import { cn } from '@/lib/utils';
import type { Measurement } from '@/types';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WeightStatusBadge } from './weight-status';
import { Skeleton } from '@/components/ui/skeleton';

interface MeasurementTableProps {
  measurements: Measurement[];
  loading?: boolean;
  className?: string;
  compact?: boolean;
  onRowClick?: (measurement: Measurement) => void;
}

export function MeasurementTable({
  measurements,
  loading = false,
  className,
  compact = false,
  onRowClick,
}: MeasurementTableProps) {
  if (loading) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (measurements.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-muted-foreground">No measurements recorded</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn('space-y-2', className)}>
        {measurements.map((m) => (
          <div
            key={m.id}
            className={cn(
              'flex items-center justify-between rounded-lg border bg-card p-3 transition-colors',
              onRowClick && 'cursor-pointer hover:bg-accent'
            )}
            onClick={() => onRowClick?.(m)}
          >
            <div className="flex items-center gap-3">
              <WeightStatusBadge status={m.status} size="sm" showIcon={false} />
              <div>
                <p className="font-medium">{m.vehicle?.plateNumber || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(m.timestamp), 'HH:mm')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold">{m.measuredWeight.toLocaleString()} kg</p>
              {m.excessWeight > 0 && (
                <p className="text-xs text-destructive">+{m.excessWeight.toLocaleString()}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead className="text-right">Measured</TableHead>
            <TableHead className="text-right">Allowed</TableHead>
            <TableHead className="text-right">Diff</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {measurements.map((m) => (
            <TableRow
              key={m.id}
              className={cn(onRowClick && 'cursor-pointer')}
              onClick={() => onRowClick?.(m)}
            >
              <TableCell className="font-mono text-sm">
                {format(new Date(m.timestamp), 'HH:mm:ss')}
              </TableCell>
              <TableCell className="font-medium">
                {m.vehicle?.plateNumber || 'Unknown'}
              </TableCell>
              <TableCell>{m.vehicle?.driver || 'N/A'}</TableCell>
              <TableCell className="text-right font-mono">
                {m.measuredWeight.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-mono text-muted-foreground">
                {m.allowedWeight.toLocaleString()}
              </TableCell>
              <TableCell
                className={cn(
                  'text-right font-mono font-medium',
                  m.excessWeight > 0 ? 'text-destructive' : 'text-success'
                )}
              >
                {m.excessWeight > 0 ? '+' : ''}{m.excessWeight.toLocaleString()}
              </TableCell>
              <TableCell>
                <WeightStatusBadge status={m.status} size="sm" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
