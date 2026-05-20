import { vehicleApi, measurementApi, reportsApi } from '@/services/api';
import { normalizeMeasurement, normalizeVehicle } from '@/lib/api-normalize';
import { useLoadGuardStore } from '@/store/loadguard-store';
import type { DailyStats, Measurement, Vehicle } from '@/types';

const FULL_SYNC_MS = 60_000;
const VEHICLES_SYNC_MS = 5_000;
const HEALTH_POLL_MS = 10_000;
const MIN_GAP_MS = 1_500;

let lastFullSync = 0;
let lastVehiclesSync = 0;
let fullInFlight: Promise<void> | null = null;
let vehiclesInFlight: Promise<void> | null = null;

function vehiclesUnchanged(prev: Vehicle[], next: Vehicle[]): boolean {
  if (prev.length !== next.length) return false;
  return prev.every((v, i) => {
    const n = next[i];
    if (v.id !== n.id) return false;
    if (v.maxPassengers !== n.maxPassengers) return false;
    if (v.allowedWeight !== n.allowedWeight) return false;
    const pl = v.currentLocation;
    const nl = n.currentLocation;
    if (!pl && !nl) return true;
    if (!pl || !nl) return false;
    return (
      pl.latitude === nl.latitude &&
      pl.longitude === nl.longitude &&
      String(pl.timestamp) === String(nl.timestamp)
    );
  });
}

function measurementsUnchanged(prev: Measurement[], next: Measurement[]): boolean {
  if (prev.length !== next.length) return false;
  if (prev.length === 0) return true;
  return prev[0]?.id === next[0]?.id && prev[prev.length - 1]?.id === next[next.length - 1]?.id;
}

function healthBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api').replace(/\/api\/?$/, '');
}

/** Poll backend health — backend live when HTTP 200; sensor/DB when database connected. */
export async function pollBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${healthBaseUrl()}/health`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    const data = res.ok ? await res.json() : null;
    const dbOk = data?.database === 'connected';
    useLoadGuardStore.getState().setSystemStatus({
      backendConnected: res.ok,
      sensorOnline: dbOk ?? false,
    });
    return res.ok;
  } catch {
    useLoadGuardStore.getState().setSystemStatus({
      backendConnected: false,
      sensorOnline: false,
    });
    return false;
  }
}

/** Lightweight: vehicles + GPS positions only (every 5s on map pages). */
export async function syncVehiclesOnly(force = false): Promise<void> {
  const now = Date.now();
  if (!force && now - lastVehiclesSync < MIN_GAP_MS) return;
  if (vehiclesInFlight) return vehiclesInFlight;

  vehiclesInFlight = (async () => {
    const backendOk = await pollBackendHealth();
    if (!backendOk) return;

    const { data } = await vehicleApi.getAll();
    const vehicles = data.map(normalizeVehicle);
    const { vehicles: prev, setVehicles, setGpsSync } = useLoadGuardStore.getState();

    if (!vehiclesUnchanged(prev, vehicles)) {
      setVehicles(vehicles);
    }

    setGpsSync({
      lastSyncAt: new Date(),
      vehiclesWithLocation: vehicles.filter((v) => v.currentLocation).length,
    });
    lastVehiclesSync = Date.now();
  })().finally(() => {
    vehiclesInFlight = null;
  });

  return vehiclesInFlight;
}

/** Full background sync — throttled; never blocks UI. */
export async function syncAppDataFull(force = false): Promise<void> {
  const now = Date.now();
  if (!force && now - lastFullSync < FULL_SYNC_MS) return;
  if (fullInFlight) return fullInFlight;

  fullInFlight = (async () => {
    const backendOk = await pollBackendHealth();
    if (!backendOk) return;

    const [vehiclesRes, measurementsRes, dailyRes, summaryRes] = await Promise.all([
      vehicleApi.getAll(),
      measurementApi.getRecent(25),
      reportsApi.getDailyStats(),
      reportsApi.getSummary('today'),
    ]);

    const vehicles = vehiclesRes.data.map(normalizeVehicle);
    const measurements = measurementsRes.data.map(normalizeMeasurement);
    const stats = dailyRes.data as DailyStats;

    const state = useLoadGuardStore.getState();
    if (!vehiclesUnchanged(state.vehicles, vehicles)) {
      state.setVehicles(vehicles);
    }
    if (!measurementsUnchanged(state.measurements, measurements)) {
      state.setMeasurements(measurements);
    }
    state.updateDailyStats(stats);
    state.setDashboardSummary(summaryRes.data);

    const current = state.selectedVehicle;
    if (!current && vehicles.length > 0) {
      state.setSelectedVehicle(vehicles[0]);
    } else if (current) {
      const fresh = vehicles.find((v) => v.id === current.id);
      if (fresh) state.setSelectedVehicle(fresh);
    }

    lastFullSync = Date.now();
    lastVehiclesSync = Date.now();
  })().finally(() => {
    fullInFlight = null;
  });

  return fullInFlight;
}

export function shouldRunVehiclePoll(pathname: string): boolean {
  return pathname.startsWith('/vehicles') || pathname.startsWith('/weighing');
}

export function getSyncIntervals() {
  return { fullSyncMs: FULL_SYNC_MS, vehiclesSyncMs: VEHICLES_SYNC_MS, healthPollMs: HEALTH_POLL_MS };
}
