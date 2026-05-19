import type { Vehicle } from '@/types';

export type DartBusTypeId = Vehicle['vehicleType'];

export interface DartBusTypeSpec {
  id: DartBusTypeId;
  model: string;
  /** Compact label for selects and narrow layouts */
  shortLabel: string;
  category: string;
  lengthMeters: number;
  maxPassengers: number;
  seatedPassengers: number;
  standingPassengers: number;
  maxGrossWeightKg: number;
  primaryUsage: string;
  articulated: boolean;
}

export const DART_BUS_TYPES: DartBusTypeSpec[] = [
  {
    id: 'xml6185c',
    model: 'Golden Dragon XML6185C',
    shortLabel: 'XML6185C · Articulated 18m',
    category: 'Articulated trunk bus',
    lengthMeters: 18,
    maxPassengers: 155,
    seatedPassengers: 60,
    standingPassengers: 95,
    maxGrossWeightKg: 28000,
    primaryUsage:
      'High-volume trunk routes on dedicated centre lanes (e.g. Kimara–Kivukoni)',
    articulated: true,
  },
  {
    id: 'xml6125c',
    model: 'Golden Dragon XML6125C / XML6127',
    shortLabel: 'XML6125C · Trunk 12m',
    category: 'Rigid trunk bus',
    lengthMeters: 12,
    maxPassengers: 90,
    seatedPassengers: 30,
    standingPassengers: 60,
    maxGrossWeightKg: 18000,
    primaryUsage: 'Standard main-line and intermediate inner-city trunk routes',
    articulated: false,
  },
  {
    id: 'xml6125_feeder',
    model: 'Golden Dragon XML6125 Feeder',
    shortLabel: 'XML6125 · Feeder 12m',
    category: 'Rigid feeder bus',
    lengthMeters: 12,
    maxPassengers: 80,
    seatedPassengers: 28,
    standingPassengers: 52,
    maxGrossWeightKg: 18000,
    primaryUsage:
      'Feeder roads connecting neighbourhoods to main trunk terminals',
    articulated: false,
  },
];

const byId = new Map(DART_BUS_TYPES.map((t) => [t.id, t]));

export function getDartBusType(id: string): DartBusTypeSpec | undefined {
  return byId.get(id as DartBusTypeId);
}

export function getBusTypeLabel(id: string): string {
  const spec = getDartBusType(id);
  return spec?.shortLabel ?? spec?.model ?? id;
}

export function applyBusTypeDefaults(id: DartBusTypeId): {
  allowedWeight: string;
  maxPassengers: string;
} {
  const spec = getDartBusType(id);
  if (!spec) {
    return { allowedWeight: '', maxPassengers: '' };
  }
  return {
    allowedWeight: String(spec.maxGrossWeightKg),
    maxPassengers: String(spec.maxPassengers),
  };
}
