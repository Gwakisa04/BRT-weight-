'use client';

import { cn } from '@/lib/utils';
import type { Vehicle } from '@/types';
import { Bus, User, Building2, Scale, Hash, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getBusTypeLabel } from '@/lib/dart-bus-types';

interface VehicleInfoCardProps {
  vehicle: Vehicle | null;
  className?: string;
  compact?: boolean;
  measuredPassengers?: number | null;
}

export function VehicleInfoCard({
  vehicle,
  className,
  compact = false,
  measuredPassengers,
}: VehicleInfoCardProps) {
  if (!vehicle) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <Bus className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No bus selected</p>
            <p className="text-xs">Select a DART bus to begin weighing</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const busLabel = getBusTypeLabel(vehicle.vehicleType);
  const maxPax = vehicle.maxPassengers ?? 0;
  const paxOverload =
    measuredPassengers != null && maxPax > 0 && measuredPassengers > maxPax;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-4 rounded-lg border bg-card p-3', className)}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Bus className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate">{vehicle.plateNumber}</p>
          <p className="text-sm text-muted-foreground truncate">{busLabel}</p>
        </div>
        <div className="text-right">
          <p className="font-mono font-bold">{vehicle.allowedWeight.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">kg GVWR</p>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Bus className="h-4 w-4 text-primary" />
          </div>
          Bus information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm font-medium text-primary">{busLabel}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Plate</p>
              <p className="font-bold">{vehicle.plateNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Driver</p>
              <p className="font-medium">{vehicle.driver}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Operator</p>
              <p className="font-medium">{vehicle.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Max gross weight (GVWR)</p>
              <p className="font-bold font-mono">{vehicle.allowedWeight.toLocaleString()} kg</p>
            </div>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Passenger capacity</p>
              <p className="font-bold font-mono">
                {maxPax} max
                {measuredPassengers != null && (
                  <span className={cn('ml-2', paxOverload && 'text-danger')}>
                    · onboard {measuredPassengers}
                    {paxOverload ? ` (+${measuredPassengers - maxPax} over)` : ''}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
