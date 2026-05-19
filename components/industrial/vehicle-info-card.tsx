'use client';

import { cn } from '@/lib/utils';
import type { Vehicle } from '@/types';
import { Truck, User, Building2, Scale, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VehicleInfoCardProps {
  vehicle: Vehicle | null;
  className?: string;
  compact?: boolean;
}

export function VehicleInfoCard({ vehicle, className, compact = false }: VehicleInfoCardProps) {
  if (!vehicle) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No vehicle selected</p>
            <p className="text-xs">Select a vehicle to begin weighing</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const vehicleTypeIcons = {
    truck: '🚛',
    trailer: '🚚',
    tanker: '⛽',
    container: '📦',
    van: '🚐',
  };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-4 rounded-lg border bg-card p-3', className)}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xl">
          {vehicleTypeIcons[vehicle.vehicleType]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate">{vehicle.plateNumber}</p>
          <p className="text-sm text-muted-foreground truncate">{vehicle.driver}</p>
        </div>
        <div className="text-right">
          <p className="font-mono font-bold">{vehicle.allowedWeight.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">kg allowed</p>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-lg">
            {vehicleTypeIcons[vehicle.vehicleType]}
          </div>
          Vehicle Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Plate Number</p>
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
              <p className="text-xs text-muted-foreground">Company</p>
              <p className="font-medium">{vehicle.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Allowed Weight</p>
              <p className="font-bold font-mono">{vehicle.allowedWeight.toLocaleString()} kg</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
