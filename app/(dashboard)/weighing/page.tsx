'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getBusTypeLabel } from '@/lib/dart-bus-types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LiveWeightDisplay } from '@/components/industrial/live-weight-display';
import { SystemStatusPanel } from '@/components/industrial/sensor-status-badge';
import { AlarmIndicator } from '@/components/industrial/alarm-indicator';
import { VehicleInfoCard } from '@/components/industrial/vehicle-info-card';
import { TicketPreview } from '@/components/industrial/ticket-preview';
import { TicketReceiptDialog } from '@/components/industrial/ticket-receipt-dialog';
import { WeightComparison, WeightStatusBadge } from '@/components/industrial/weight-status';
import { useLoadGuardStore } from '@/store/loadguard-store';
import { useLiveWeight, useSystemStatus } from '@/hooks/use-sensor';
import { measurementApi } from '@/services/api';
import { socketService } from '@/services/socket';
import { normalizeMeasurement } from '@/lib/api-normalize';
import { refreshBackendData } from '@/lib/backend-sync';
import { toast } from 'sonner';
import {
  Scale,
  Camera,
  RotateCcw,
  Volume2,
  VolumeX,
  Wifi,
  Activity,
  Printer,
  CheckCircle2,
  Truck,
} from 'lucide-react';
import type { Measurement } from '@/types';

export default function WeighingPage() {
  const { weight, status, resetWeight } = useLiveWeight();
  const { status: systemStatus, toggleBuzzer } = useSystemStatus();
  const { selectedVehicle, setSelectedVehicle, addMeasurement, vehicles, settings } =
    useLoadGuardStore();
  const bumpScaleSession = useLoadGuardStore((s) => s.bumpScaleSession);

  const [capturedWeight, setCapturedWeight] = useState<number | null>(null);
  const [passengerCount, setPassengerCount] = useState<string>('');
  const [lastMeasurement, setLastMeasurement] = useState<Measurement | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const availableVehicles = vehicles;
  const operatorName =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('brt_user') ?? '{}')?.name ?? 'Operator'
      : 'Operator';

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = availableVehicles.find((v) => v.id === vehicleId);
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setCapturedWeight(null);
      setLastMeasurement(null);
      setPassengerCount('');
      bumpScaleSession();
    }
  };

  const handleCapture = useCallback(async () => {
    if (!selectedVehicle) {
      toast.error('Please select a vehicle first');
      return;
    }

    if (!weight.stable) {
      toast.warning('Weight is not stable. Please wait...');
      return;
    }

    setIsCapturing(true);
    const measuredWeight = weight.value;

    try {
      const pax = passengerCount.trim() ? parseInt(passengerCount, 10) : undefined;
      const { data } = await measurementApi.create({
        vehicleId: selectedVehicle.id,
        measuredWeight,
        allowedWeight: selectedVehicle.allowedWeight,
        measuredPassengers: Number.isFinite(pax) ? pax : undefined,
        operator: operatorName,
        timestamp: new Date(),
      });

      const saved = normalizeMeasurement(data);
      setCapturedWeight(measuredWeight);
      setLastMeasurement(saved);
      addMeasurement(saved);
      await refreshBackendData();
      setReceiptOpen(true);

      if (saved.status === 'OVERLOAD') {
        if (settings.alarmEnabled) {
          socketService.triggerAlarm();
          useLoadGuardStore.getState().setSystemStatus({ buzzerActive: true });
        }
        toast.error('OVERLOAD DETECTED!', {
          description: `Excess weight: +${saved.excessWeight.toLocaleString()} kg · ${saved.ticketNumber}`,
        });
      } else {
        toast.success('Measurement saved to database', {
          description: `${measuredWeight.toLocaleString()} kg · ${saved.ticketNumber}`,
        });
      }
    } catch {
      toast.error('Could not save measurement. Is the backend running?');
    } finally {
      setIsCapturing(false);
    }
  }, [
    selectedVehicle,
    weight,
    passengerCount,
    addMeasurement,
    operatorName,
    settings.alarmEnabled,
  ]);

  const handleReset = () => {
    resetWeight();
    setCapturedWeight(null);
    setPassengerCount('');
    setLastMeasurement(null);
    toast.info('Scale reset');
  };

  const vehicleOnScale = selectedVehicle && capturedWeight === null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
            <Scale className="h-8 w-8 text-primary" />
            Live Weighing Station
          </h1>
          <p className="text-muted-foreground">
            Select vehicle on scale · simulation ramps until stable · capture to save
          </p>
        </div>
        <SystemStatusPanel
          sensorOnline={systemStatus.sensorOnline}
          backendConnected={systemStatus.backendConnected}
          buzzerActive={systemStatus.buzzerActive}
        />
      </div>

      {vehicleOnScale && (
        <Alert className="border-primary/30 bg-primary/5">
          <Truck className="h-4 w-4" />
          <AlertTitle>Vehicle on scale</AlertTitle>
          <AlertDescription>
            {selectedVehicle.plateNumber} ({getBusTypeLabel(selectedVehicle.vehicleType)}) —{' '}
            {weight.stable
              ? 'Weight is stable. You can capture now.'
              : 'Waiting for weight to stabilize…'}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Vehicle Selection</CardTitle>
              <CardDescription>Choose the vehicle currently on the digital scale</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select
                  value={selectedVehicle?.id || ''}
                  onValueChange={handleVehicleSelect}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a vehicle on scale..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.length === 0 ? (
                      <SelectItem value="_none" disabled>
                        No vehicles — start backend or add vehicles
                      </SelectItem>
                    ) : null}
                    {availableVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{vehicle.plateNumber}</span>
                          <span className="text-muted-foreground">-</span>
                          <span>{vehicle.driver}</span>
                          <Badge variant="outline" className="ml-2">
                            {getBusTypeLabel(vehicle.vehicleType)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedVehicle && (
                <div className="mt-4 space-y-4">
                  <VehicleInfoCard
                    vehicle={selectedVehicle}
                    measuredPassengers={
                      passengerCount.trim() ? parseInt(passengerCount, 10) : null
                    }
                  />
                  <div className="space-y-2 max-w-xs">
                    <Label htmlFor="passengerCount">Passengers on board (optional)</Label>
                    <Input
                      id="passengerCount"
                      type="number"
                      min={0}
                      max={selectedVehicle.maxPassengers + 50}
                      placeholder={`Max ${selectedVehicle.maxPassengers}`}
                      value={passengerCount}
                      onChange={(e) => setPassengerCount(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Manufacturer limit: {selectedVehicle.maxPassengers} passengers for this bus
                      model
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="bg-secondary/30 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full ${systemStatus.sensorOnline ? 'bg-success animate-pulse' : 'bg-destructive'}`}
                  />
                  <CardTitle className="text-lg">Digital Scale</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={weight.stable ? 'default' : 'secondary'}>
                    {weight.stable ? 'Stable' : 'Reading...'}
                  </Badge>
                  <Badge variant="outline" className="font-mono">
                    ESP32-001
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <LiveWeightDisplay
                  value={capturedWeight ?? weight.value}
                  stable={capturedWeight !== null || weight.stable}
                  trend={capturedWeight !== null ? 'stable' : weight.trend}
                  size="xl"
                />

                {capturedWeight !== null && (
                  <Badge variant="outline" className="text-lg px-4 py-1">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-success" />
                    Weight Captured
                  </Badge>
                )}

                {selectedVehicle && (
                  <WeightComparison
                    measuredWeight={capturedWeight ?? weight.value}
                    allowedWeight={selectedVehicle.allowedWeight}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  size="lg"
                  className="h-16 text-lg gap-2"
                  onClick={handleCapture}
                  disabled={!selectedVehicle || isCapturing || !weight.stable || capturedWeight !== null}
                >
                  {isCapturing ? (
                    <>
                      <Activity className="h-5 w-5 animate-spin" />
                      Capturing...
                    </>
                  ) : (
                    <>
                      <Camera className="h-5 w-5" />
                      Capture
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="h-16 text-lg gap-2"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-5 w-5" />
                  Reset
                </Button>

                <Button
                  variant={systemStatus.buzzerActive ? 'destructive' : 'outline'}
                  size="lg"
                  className="h-16 text-lg gap-2"
                  onClick={toggleBuzzer}
                >
                  {systemStatus.buzzerActive ? (
                    <>
                      <VolumeX className="h-5 w-5" />
                      Stop Alarm
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-5 w-5" />
                      Test Alarm
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center rounded-lg border bg-card">
                  <div className="text-center">
                    <Wifi
                      className={`h-6 w-6 mx-auto ${systemStatus.sensorOnline ? 'text-success' : 'text-destructive'}`}
                    />
                    <p className="text-xs mt-1 text-muted-foreground">
                      {systemStatus.sensorOnline ? 'Connected' : 'Disconnected'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <AlarmIndicator
            active={systemStatus.buzzerActive || status === 'OVERLOAD'}
            onTrigger={toggleBuzzer}
            onStop={toggleBuzzer}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Last Ticket
              </CardTitle>
              <CardDescription>
                {lastMeasurement
                  ? 'Click to reopen full receipt'
                  : 'Capture weight to generate ticket'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lastMeasurement ? (
                <button
                  type="button"
                  className="w-full text-left rounded-lg transition-opacity hover:opacity-90"
                  onClick={() => setReceiptOpen(true)}
                >
                  <TicketPreview
                    measurement={lastMeasurement}
                    vehicle={selectedVehicle || undefined}
                    liveWeight={capturedWeight ?? weight.value}
                  />
                </button>
              ) : (
                <TicketPreview
                  vehicle={selectedVehicle || undefined}
                  liveWeight={weight.value}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <TicketReceiptDialog
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        measurement={lastMeasurement}
        vehicle={selectedVehicle}
      />
    </div>
  );
}
