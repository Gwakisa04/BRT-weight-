'use client';

import { useState, useCallback, type Dispatch, type SetStateAction } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useLoadGuardStore } from '@/store/loadguard-store';
import { vehicleApi } from '@/services/api';
import { GpsLiveIndicator } from '@/components/industrial/gps-live-indicator';
import { useVehicleFromStore } from '@/hooks/use-gps-tracking';
import { useStoreHydrated } from '@/hooks/use-store-hydrated';
import { GPS_POLL_INTERVAL_SEC } from '@/lib/gps-config';
import { syncAppDataFull } from '@/lib/app-data-sync';
import { toast } from 'sonner';
import { 
  Truck, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  Filter,
  MapPin,
  Radio,
  Wifi,
  WifiOff,
  Navigation,
} from 'lucide-react';
import type { Vehicle, GPSDevice, GPSLocation } from '@/types';
import {
  DART_BUS_TYPES,
  applyBusTypeDefaults,
  getBusTypeLabel,
  getDartBusType,
} from '@/lib/dart-bus-types';
import { format } from 'date-fns';

// Dynamically import the LocationPanel to avoid SSR issues
const LocationPanel = dynamic(
  () => import('@/components/industrial/location-panel').then((mod) => mod.LocationPanel),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading location data...</div>
      </div>
    ),
  }
);

interface VehicleFormData {
  plateNumber: string;
  driver: string;
  company: string;
  allowedWeight: string;
  maxPassengers: string;
  vehicleType: Vehicle['vehicleType'];
  gpsEnabled: boolean;
  deviceId: string;
  imei: string;
  serialNumber: string;
}

const initialFormData: VehicleFormData = {
  plateNumber: '',
  driver: '',
  allowedWeight: '18000',
  maxPassengers: '90',
  vehicleType: 'xml6125c',
  company: 'DART',
  gpsEnabled: false,
  deviceId: '',
  imei: '',
  serialNumber: '',
};

function VehicleForm({
  formData,
  setFormData,
  activeTab,
  onTabChange,
}: {
  formData: VehicleFormData;
  setFormData: Dispatch<SetStateAction<VehicleFormData>>;
  activeTab: string;
  onTabChange: (value: string) => void;
}) {
  const selectedSpec = getDartBusType(formData.vehicleType);

  const onBusTypeChange = (value: Vehicle['vehicleType']) => {
    const defaults = applyBusTypeDefaults(value);
    setFormData((prev) => ({
      ...prev,
      vehicleType: value,
      allowedWeight: defaults.allowedWeight,
      maxPassengers: defaults.maxPassengers,
    }));
  };

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="vehicle">Vehicle Info</TabsTrigger>
        <TabsTrigger value="gps">GPS Device</TabsTrigger>
      </TabsList>
      
      <TabsContent value="vehicle" className="space-y-4 mt-4 min-w-0">
        <div className="space-y-2">
          <Label htmlFor="vehicleType">DART bus model *</Label>
          <Select value={formData.vehicleType} onValueChange={onBusTypeChange}>
            <SelectTrigger className="w-full min-w-0 h-auto min-h-10 py-2 [&>span]:line-clamp-2 [&>span]:text-left [&>span]:whitespace-normal">
              <SelectValue placeholder="Select bus type">
                {getBusTypeLabel(formData.vehicleType)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-w-[min(calc(100vw-2rem),24rem)]">
              {DART_BUS_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id} className="items-start py-2.5">
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="font-medium leading-snug">{type.shortLabel}</span>
                    <span className="text-xs text-muted-foreground line-clamp-2">{type.category}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2 sm:max-w-xs">
            <Label htmlFor="plateNumber">Plate Number *</Label>
            <Input
              id="plateNumber"
              placeholder="T 101 DAR"
              value={formData.plateNumber}
              onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
            />
          </div>
        </div>
        {selectedSpec && (
          <div className="rounded-lg border border-border/60 bg-muted/40 p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{selectedSpec.category}</p>
            <p className="mt-1">{selectedSpec.primaryUsage}</p>
            <p className="mt-2 text-xs">
              {selectedSpec.lengthMeters} m · GVWR {selectedSpec.maxGrossWeightKg.toLocaleString()} kg · max{' '}
              {selectedSpec.maxPassengers} passengers
            </p>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="driver">Driver Name *</Label>
          <Input
            id="driver"
            placeholder="Driver name"
            value={formData.driver}
            onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            placeholder="Company Name"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="allowedWeight">Max gross weight / GVWR (kg) *</Label>
            <Input
              id="allowedWeight"
              type="number"
              value={formData.allowedWeight}
              onChange={(e) => setFormData({ ...formData, allowedWeight: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Auto-filled from bus model (editable)</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxPassengers">Max passengers *</Label>
            <Input
              id="maxPassengers"
              type="number"
              value={formData.maxPassengers}
              onChange={(e) => setFormData({ ...formData, maxPassengers: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Auto-filled from manufacturer capacity</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="gps" className="space-y-4 mt-4">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Radio className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">GPS Tracking</p>
              <p className="text-sm text-muted-foreground">Enable GPS device for this vehicle</p>
            </div>
          </div>
          <Switch
            checked={formData.gpsEnabled}
            onCheckedChange={(checked) => setFormData({ ...formData, gpsEnabled: checked })}
          />
        </div>

        {formData.gpsEnabled && (
          <div className="space-y-4 pt-2">
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="deviceId">Device ID *</Label>
              <Input
                id="deviceId"
                placeholder="GPS-001-2024"
                value={formData.deviceId}
                onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Unique identifier for the GPS device</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="imei">IMEI Number *</Label>
              <Input
                id="imei"
                placeholder="356938035643809"
                value={formData.imei}
                onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                maxLength={15}
              />
              <p className="text-xs text-muted-foreground">
                15-digit IMEI from the GPS module (used to match live location every 5s)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number *</Label>
              <Input
                id="serialNumber"
                placeholder="SN-TRK-001-KE"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Manufacturer serial number</p>
            </div>
          </div>
        )}

        {!formData.gpsEnabled && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 bg-muted rounded-full mb-3">
              <WifiOff className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">GPS tracking is disabled</p>
            <p className="text-sm text-muted-foreground">Enable the toggle above to add GPS device details</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

export default function VehiclesPage() {
  const vehicles = useLoadGuardStore((s) => s.vehicles);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
  const [formTab, setFormTab] = useState('vehicle');
  const hydrated = useStoreHydrated();
  const loading = hydrated && vehicles.length === 0;

  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const [locationVehicleId, setLocationVehicleId] = useState<string | null>(null);
  const locationVehicle = useVehicleFromStore(locationVehicleId);

  const refreshVehicles = useCallback(async () => {
    try {
      await syncAppDataFull(true);
    } catch {
      toast.error('Could not refresh vehicles. Is the backend running?');
    }
  }, []);

  const allVehicles = vehicles;

  const filteredVehicles = allVehicles.filter((vehicle) => {
    const matchesSearch = 
      vehicle.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.driver.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.company.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || vehicle.vehicleType === typeFilter;
    return matchesSearch && matchesType;
  });

  const resetForm = () => {
    setFormData(initialFormData);
    setFormTab('vehicle');
  };

  const handleAdd = async () => {
    if (!formData.plateNumber || !formData.driver || !formData.allowedWeight || !formData.maxPassengers) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.gpsEnabled && (!formData.deviceId || !formData.imei || !formData.serialNumber)) {
      toast.error('Please fill in all GPS device fields');
      return;
    }
    if (formData.gpsEnabled && !/^\d{15}$/.test(formData.imei.trim())) {
      toast.error('IMEI must be exactly 15 digits');
      return;
    }

    const gpsDevice = formData.gpsEnabled
      ? {
          deviceId: formData.deviceId,
          imei: formData.imei,
          serialNumber: formData.serialNumber,
          isActive: true,
          lastSeen: new Date(),
        }
      : undefined;

    try {
      await vehicleApi.create({
        plateNumber: formData.plateNumber.toUpperCase(),
        driver: formData.driver,
        company: formData.company,
        allowedWeight: parseInt(formData.allowedWeight, 10),
        maxPassengers: parseInt(formData.maxPassengers, 10),
        vehicleType: formData.vehicleType,
        gpsDevice,
      });
      await refreshVehicles();
      setIsAddOpen(false);
      resetForm();
      toast.success('Vehicle saved to database');
    } catch {
      toast.error('Failed to save vehicle to database');
    }
  };

  const handleEdit = async () => {
    if (!editingVehicle) return;

    if (formData.gpsEnabled && (!formData.deviceId || !formData.imei || !formData.serialNumber)) {
      toast.error('Please fill in all GPS device fields');
      return;
    }
    if (formData.gpsEnabled && !/^\d{15}$/.test(formData.imei.trim())) {
      toast.error('IMEI must be exactly 15 digits');
      return;
    }

    const gpsDevice = formData.gpsEnabled
      ? {
          deviceId: formData.deviceId,
          imei: formData.imei,
          serialNumber: formData.serialNumber,
          isActive: editingVehicle.gpsDevice?.isActive ?? true,
          lastSeen:
            editingVehicle.gpsDevice?.lastSeen != null
              ? new Date(editingVehicle.gpsDevice.lastSeen)
              : new Date(),
        }
      : undefined;

    try {
      await vehicleApi.update(editingVehicle.id, {
        plateNumber: formData.plateNumber.toUpperCase(),
        driver: formData.driver,
        company: formData.company,
        allowedWeight: parseInt(formData.allowedWeight, 10),
        maxPassengers: parseInt(formData.maxPassengers, 10),
        vehicleType: formData.vehicleType,
        gpsDevice,
      });
      await refreshVehicles();
      setIsEditOpen(false);
      setEditingVehicle(null);
      resetForm();
      toast.success('Vehicle updated in database');
    } catch {
      toast.error('Failed to update vehicle in database');
    }
  };

  const handleDelete = async (vehicle: Vehicle) => {
    try {
      await vehicleApi.delete(vehicle.id);
      await refreshVehicles();
      toast.success('Vehicle removed from database');
    } catch {
      toast.error('Failed to delete vehicle from database');
    }
  };

  const openEditDialog = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      plateNumber: vehicle.plateNumber,
      driver: vehicle.driver,
      company: vehicle.company,
      allowedWeight: vehicle.allowedWeight.toString(),
      maxPassengers: (vehicle.maxPassengers ?? 80).toString(),
      vehicleType: vehicle.vehicleType as Vehicle['vehicleType'],
      gpsEnabled: !!vehicle.gpsDevice,
      deviceId: vehicle.gpsDevice?.deviceId || '',
      imei: vehicle.gpsDevice?.imei || '',
      serialNumber: vehicle.gpsDevice?.serialNumber || '',
    });
    setFormTab(vehicle.gpsDevice ? 'gps' : 'vehicle');
    setIsEditOpen(true);
  };

  const openLocationSheet = (vehicle: Vehicle) => {
    setLocationVehicleId(vehicle.id);
    setLocationSheetOpen(true);
  };

  const getVehicleLocation = (vehicle: Vehicle): GPSLocation | null => {
    return vehicle.currentLocation ?? null;
  };

  const formProps = {
    formData,
    setFormData,
    activeTab: formTab,
    onTabChange: setFormTab,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
            <Truck className="h-7 w-7 sm:h-8 sm:w-8 text-primary shrink-0" />
            Vehicle Management
          </h1>
          <p className="text-muted-foreground">
            GPS locations refresh every {GPS_POLL_INTERVAL_SEC}s from the backend
          </p>
          <GpsLiveIndicator className="mt-2" />
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100vw-1.5rem)] max-w-lg max-h-[min(90vh,720px)] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
              <DialogDescription>
                Register a new vehicle and optionally configure GPS tracking
              </DialogDescription>
            </DialogHeader>
            <VehicleForm {...formProps} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd}>Add Vehicle</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by plate, driver, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {DART_BUS_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registered Vehicles</CardTitle>
          <CardDescription>
            {loading ? 'Loading from database...' : `${filteredVehicles.length} vehicles found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Plate Number</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>GPS</TableHead>
                  <TableHead className="text-right">GVWR (kg)</TableHead>
                  <TableHead className="text-right">Max pax</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No vehicles found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVehicles.map((vehicle) => {
                    const typeLabel = getBusTypeLabel(vehicle.vehicleType);
                    const hasGPS = !!vehicle.gpsDevice;
                    const gpsActive = vehicle.gpsDevice?.isActive ?? false;
                    const hasLocation = !!getVehicleLocation(vehicle);
                    
                    return (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <Badge variant="outline">{typeLabel}</Badge>
                        </TableCell>
                        <TableCell className="font-bold">
                          {vehicle.plateNumber}
                        </TableCell>
                        <TableCell>{vehicle.driver}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {vehicle.company || '-'}
                        </TableCell>
                        <TableCell>
                          {hasGPS ? (
                            <Badge 
                              variant={gpsActive ? 'default' : 'secondary'} 
                              className="gap-1"
                            >
                              {gpsActive ? (
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
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <Badge variant="outline">
                            {vehicle.allowedWeight.toLocaleString()} kg
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {vehicle.maxPassengers ?? '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(vehicle.createdAt), 'PP')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {hasGPS && hasLocation && (
                                <>
                                  <DropdownMenuItem onClick={() => openLocationSheet(vehicle)}>
                                    <MapPin className="h-4 w-4 mr-2" />
                                    View Location
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem onClick={() => openEditDialog(vehicle)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(vehicle)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) { setEditingVehicle(null); resetForm(); }}}>
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-lg max-h-[min(90vh,720px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>
              Update vehicle information and GPS device settings
            </DialogDescription>
          </DialogHeader>
          <VehicleForm {...formProps} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet
        open={locationSheetOpen}
        onOpenChange={(open) => {
          setLocationSheetOpen(open);
          if (!open) setLocationVehicleId(null);
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Vehicle Location
            </SheetTitle>
            <SheetDescription>
              {locationVehicle
                ? `${locationVehicle.plateNumber} · ${locationVehicle.driver}`
                : 'Select a vehicle to view live GPS'}
            </SheetDescription>
            {locationVehicle && (
              <GpsLiveIndicator showCount={false} className="mt-3" />
            )}
          </SheetHeader>
          
          {locationVehicle && getVehicleLocation(locationVehicle) && (
            <LocationPanel 
              key={`${locationVehicle.id}-${String(getVehicleLocation(locationVehicle)!.timestamp)}`}
              vehicle={locationVehicle} 
              location={getVehicleLocation(locationVehicle)!} 
            />
          )}
          
          {locationVehicle && !getVehicleLocation(locationVehicle) && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="p-4 bg-muted rounded-full mb-4">
                <WifiOff className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium">No Location Data Yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Waiting for GPS (IMEI {locationVehicle.gpsDevice?.imei ?? '—'}). Updates every{' '}
                {GPS_POLL_INTERVAL_SEC}s.
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
