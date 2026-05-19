'use client';

import { Badge } from '@/components/ui/badge';
import { useGpsTracking } from '@/hooks/use-gps-tracking';
import { Radio, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GpsLiveIndicatorProps {
  className?: string;
  showCount?: boolean;
}

export function GpsLiveIndicator({ className, showCount = true }: GpsLiveIndicatorProps) {
  const { gpsSync, lastUpdateLabel, pollIntervalSec, isLive, vehiclesWithLiveLocation } =
    useGpsTracking();

  return (
    <span className={cn('flex flex-wrap items-center gap-2', className)}>
      <Badge
        variant="outline"
        className={cn(
          'gap-1.5 font-normal',
          isLive && 'border-success/50 text-success'
        )}
      >
        {gpsSync.isPolling ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : isLive ? (
          <Radio className="h-3 w-3 animate-pulse" />
        ) : (
          <AlertCircle className="h-3 w-3 text-muted-foreground" />
        )}
        GPS live · every {pollIntervalSec}s
      </Badge>
      {showCount && (
        <Badge variant="secondary" className="font-normal">
          {vehiclesWithLiveLocation.length} with location
        </Badge>
      )}
      <span className="text-xs text-muted-foreground">{lastUpdateLabel}</span>
    </span>
  );
}
