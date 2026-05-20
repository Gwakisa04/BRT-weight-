'use client';

import { useState, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
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
  Receipt,
} from 'lucide-react';
import type { Measurement } from '@/types';

export default function WeighingPage() {
  const { weight, status, resetWeight } = useLiveWeight();
  const { status: systemStatus, toggleBuzzer } = useSystemStatus();

  const { selectedVehicle, vehicles, settings, setSelectedVehicle, addMeasurement, bumpScaleSession } =
    useLoadGuardStore(
      useShallow((s) => ({
        selectedVehicle: s.selectedVehicle,
        vehicles: s.vehicles,
        settings: s.settings,
        setSelectedVehicle: s.setSelectedVehicle,
        addMeasurement: s.addMeasurement,
        bumpScaleSession: s.bumpScaleSession,
      }))
    );

  const [capturedWeight, setCapturedWeight] = useState<number | null>(null);
  const [passengerCount, setPassengerCount] = useState<string>('');
  const [lastMeasurement, setLastMeasurement] = useState<Measurement | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const operatorName =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('brt_user') ?? '{}')?.name ?? 'Operator'
      : 'Operator';

  const handleVehicleSelect = (vehicleId: string) => {
    if (vehicleId === '_none') return;
    const vehicle = vehicles.find((v) => v.id === vehicleId);
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
      void refreshBackendData();
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
    weight.stable,
    weight.value,
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
    toast.info('Scale reset — select a vehicle to weigh again');
  };

  const vehicleOnScale = selectedVehicle && capturedWeight === null;
  const ticketVehicle = lastMeasurement?.vehicle ?? selectedVehicle;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
            <Scale className="h-8 w-8 text-primary shrink-0" />
            Live Weighing Station
          </h1>
          <p className="text-muted-foreground mt-1">
            Select vehicle · wait for stable reading · capture to save
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

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5 min-w-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Vehicle Selection</CardTitle>
              <CardDescription>Choose the vehicle currently on the digital scale</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={selectedVehicle?.id ?? ''}
                onValueChange={handleVehicleSelect}
                disabled={isCapturing}
              >
                <SelectTrigger className="w-full h-11">
                  <SelectValue placeholder="Select a vehicle on scale..." />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {vehicles.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      No vehicles — start backend or add vehicles
                    </SelectItem>
                  ) : (
                    vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        <span className="font-bold">{vehicle.plateNumber}</span>
                        <span className="text-muted-foreground mx-1">·</span>
                        <span>{vehicle.driver}</span>
                        <span className="text-muted-foreground ml-2 text-xs">
                          {getBusTypeLabel(vehicle.vehicleType)}
                        </span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {selectedVehicle && (
                <>
                  <VehicleInfoCard
                    vehicle={selectedVehicle}
                    measuredPassengers={
                      passengerCount.trim() ? parseInt(passengerCount, 10) : null
                    }
                  />
                  <div className="space-y-2 max-w-sm">
                    <Label htmlFor="passengerCount">Passengers on board (optional)</Label>
                    <Input
                      id="passengerCount"
                      type="number"
                      min={0}
                      max={selectedVehicle.maxPassengers + 50}
                      placeholder={`Max ${selectedVehicle.maxPassengers}`}
                      value={passengerCount}
                      onChange={(e) => setPassengerCount(e.target.value)}
                      disabled={isCapturing}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="bg-secondary/30 border-b py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${systemStatus.sensorOnline ? 'bg-success animate-pulse' : 'bg-destructive'}`}
                  />
                  <CardTitle className="text-lg">Digital Scale</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={weight.stable ? 'default' : 'secondary'}>
                    {weight.stable ? 'Stable' : 'Reading…'}
                  </Badge>
                  {selectedVehicle && (
                    <WeightStatusBadge status={status} size="sm" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <div className="text-center space-y-5">
                <LiveWeightDisplay
                  value={capturedWeight ?? weight.value}
                  stable={capturedWeight !== null || weight.stable}
                  trend={capturedWeight !== null ? 'stable' : weight.trend}
                  size="xl"
                />

                {capturedWeight !== null && (
                  <Badge variant="outline" className="text-base px-4 py-1">
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <Button
                  size="lg"
                  className="h-14 sm:h-16 gap-2"
                  onClick={handleCapture}
                  disabled={
                    !selectedVehicle || isCapturing || !weight.stable || capturedWeight !== null
                  }
                >
                  {isCapturing ? (
                    <>
                      <Activity className="h-5 w-5 animate-spin" />
                      Saving…
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
                  className="h-14 sm:h-16 gap-2"
                  onClick={handleReset}
                  disabled={isCapturing}
                >
                  <RotateCcw className="h-5 w-5" />
                  Reset
                </Button>

                <Button
                  variant={systemStatus.buzzerActive ? 'destructive' : 'outline'}
                  size="lg"
                  className="h-14 sm:h-16 gap-2"
                  onClick={toggleBuzzer}
                >
                  {systemStatus.buzzerActive ? (
                    <>
                      <VolumeX className="h-5 w-5" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-5 w-5" />
                      Test
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center rounded-lg border bg-card h-14 sm:h-16">
                  <div className="text-center">
                    <Wifi
                      className={`h-5 w-5 mx-auto ${systemStatus.sensorOnline ? 'text-success' : 'text-destructive'}`}
                    />
                    <p className="text-[10px] mt-0.5 text-muted-foreground">Sensor</p>
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

        <div className="xl:sticky xl:top-20 xl:self-start">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Printer className="h-4 w-4" />
                Last Ticket
              </CardTitle>
              <CardDescription>
                {lastMeasurement
                  ? 'Tap to open full receipt'
                  : 'Capture a weight to generate a ticket'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lastMeasurement ? (
                <button
                  type="button"
                  className="w-full text-left rounded-lg transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setReceiptOpen(true)}
                >
                  <TicketPreview
                    variant="compact"
                    measurement={lastMeasurement}
                    vehicle={ticketVehicle ?? undefined}
                  />
                </button>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 py-10 px-4 text-center">
                  <Receipt className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium text-foreground">No ticket yet</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
                    Select a vehicle, wait for a stable weight, then press Capture.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <TicketReceiptDialog
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        measurement={lastMeasurement}
        vehicle={ticketVehicle}
      />
    </div>
  );
}
