'use client';

import { cn } from '@/lib/utils';
import { AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlarmIndicatorProps {
  active: boolean;
  onTrigger?: () => void;
  onStop?: () => void;
  className?: string;
  showControls?: boolean;
}

export function AlarmIndicator({
  active,
  onTrigger,
  onStop,
  className,
  showControls = true,
}: AlarmIndicatorProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border-2 p-4 transition-all',
        active
          ? 'border-destructive bg-destructive/10 animate-pulse-glow text-destructive'
          : 'border-border bg-card',
        className
      )}
    >
      <div className="relative">
        <AlertTriangle
          className={cn(
            'h-8 w-8 transition-all',
            active && 'animate-bounce text-destructive'
          )}
        />
        {active && (
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-destructive animate-ping" />
        )}
      </div>
      
      <div className="flex-1">
        <p className={cn('font-bold text-lg', active ? 'text-destructive' : 'text-foreground')}>
          {active ? 'ALARM ACTIVE' : 'Alarm Ready'}
        </p>
        <p className="text-sm text-muted-foreground">
          {active ? 'Overload detected - Take action immediately' : 'System monitoring for overload'}
        </p>
      </div>

      {showControls && (
        <div className="flex gap-2">
          <Button
            variant={active ? 'default' : 'destructive'}
            size="sm"
            onClick={active ? onStop : onTrigger}
            className="gap-2"
          >
            {active ? (
              <>
                <VolumeX className="h-4 w-4" />
                Stop
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" />
                Test
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
