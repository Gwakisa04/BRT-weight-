'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Vehicle, GPSLocation } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import { GPS_POLL_INTERVAL_SEC } from '@/lib/gps-config';
import {
  MapPin,
  Navigation,
  Gauge,
  Clock,
  Radio,
  Building,
  Map,
  Compass,
  Mountain,
  Target,
  Wifi,
  WifiOff,
} from 'lucide-react';

// Dynamically import the map component to avoid SSR issues with Leaflet
const VehicleMap = dynamic(
  () => import('./vehicle-map').then((mod) => mod.VehicleMap),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[400px] bg-muted rounded-lg flex items-center justify-center">
        <div className="text-muted-foreground flex items-center gap-2">
          <Map className="h-5 w-5 animate-pulse" />
          Loading map...
        </div>
      </div>
    ),
  }
);

interface LocationDetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | undefined;
  unit?: string;
}

function LocationDetailRow({ icon, label, value, unit }: LocationDetailRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-mono text-sm font-medium">
        {value ?? '-'}{unit && value ? ` ${unit}` : ''}
      </span>
    </div>
  );
}

interface LocationPanelProps {
  vehicle: Vehicle;
  location: GPSLocation;
}

export function LocationPanel({ vehicle, location }: LocationPanelProps) {
  const isActive = vehicle.gpsDevice?.isActive ?? false;
  const locationTime =
    location.timestamp instanceof Date ? location.timestamp : new Date(location.timestamp);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
        <span className="text-muted-foreground">
          Live GPS · refreshes every {GPS_POLL_INTERVAL_SEC}s
        </span>
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Tracking' : 'Inactive'}
        </Badge>
        <span className="text-xs text-muted-foreground w-full sm:w-auto">
          Position {formatDistanceToNow(locationTime, { addSuffix: true })}
        </span>
      </div>
      {/* Map Section */}
      <div>
        <VehicleMap vehicle={vehicle} location={location} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* GPS Device Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Radio className="h-4 w-4 text-primary" />
              GPS Device Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={isActive ? 'default' : 'secondary'} className="gap-1">
                {isActive ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    Active
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    Offline
                  </>
                )}
              </Badge>
            </div>
            <Separator />
            <LocationDetailRow
              icon={<Target className="h-4 w-4" />}
              label="Device ID"
              value={vehicle.gpsDevice?.deviceId}
            />
            <Separator />
            <LocationDetailRow
              icon={<Radio className="h-4 w-4" />}
              label="IMEI"
              value={vehicle.gpsDevice?.imei}
            />
            <Separator />
            <LocationDetailRow
              icon={<Building className="h-4 w-4" />}
              label="Serial Number"
              value={vehicle.gpsDevice?.serialNumber}
            />
            {vehicle.gpsDevice?.lastSeen && (
              <>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Last Seen</span>
                  </div>
                  <span className="text-sm font-medium">
                    {format(new Date(vehicle.gpsDevice.lastSeen), 'PPp')}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Coordinates & Movement */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Navigation className="h-4 w-4 text-primary" />
              Coordinates & Movement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <LocationDetailRow
              icon={<MapPin className="h-4 w-4" />}
              label="Latitude"
              value={location.latitude.toFixed(6)}
            />
            <Separator />
            <LocationDetailRow
              icon={<MapPin className="h-4 w-4" />}
              label="Longitude"
              value={location.longitude.toFixed(6)}
            />
            <Separator />
            <LocationDetailRow
              icon={<Mountain className="h-4 w-4" />}
              label="Altitude"
              value={location.altitude}
              unit="m"
            />
            <Separator />
            <LocationDetailRow
              icon={<Gauge className="h-4 w-4" />}
              label="Speed"
              value={location.speed}
              unit="km/h"
            />
            <Separator />
            <LocationDetailRow
              icon={<Compass className="h-4 w-4" />}
              label="Heading"
              value={location.heading}
              unit="deg"
            />
            <Separator />
            <LocationDetailRow
              icon={<Target className="h-4 w-4" />}
              label="Accuracy"
              value={location.accuracy}
              unit="m"
            />
          </CardContent>
        </Card>
      </div>

      {/* Address Information */}
      {location.address && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building className="h-4 w-4 text-primary" />
              Location Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Street</p>
                  <p className="font-medium">{location.address.street || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">City</p>
                  <p className="font-medium">{location.address.city || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Region</p>
                  <p className="font-medium">{location.address.region || '-'}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Country</p>
                  <p className="font-medium">{location.address.country || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Postal Code</p>
                  <p className="font-medium">{location.address.postalCode || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Last Updated</p>
                  <p className="font-medium">{format(new Date(location.timestamp), 'PPp')}</p>
                </div>
              </div>
            </div>
            {location.address.formattedAddress && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Full Address</p>
                <p className="font-medium">{location.address.formattedAddress}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
