'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { cn } from '@/lib/utils';
import { getBusTypeLabel } from '@/lib/dart-bus-types';
import type { Measurement, Vehicle, WeightStatus } from '@/types';
import { format } from 'date-fns';
import { Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TicketPreviewProps {
  measurement?: Measurement;
  vehicle?: Vehicle;
  liveWeight?: number;
  operator?: string;
  className?: string;
  onPrint?: () => void;
  onDownload?: () => void;
  printing?: boolean;
  downloading?: boolean;
}

const STATUS_LABELS: Record<WeightStatus, string> = {
  SAFE: 'Within limit',
  OVERLOAD: 'Over weight limit',
  UNDERLOAD: 'Under minimum load',
};

function ReceiptLogo() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground">
      <svg viewBox="0 0 16 16" className="h-5 w-5 text-background" aria-hidden>
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => (
            <circle
              key={`${row}-${col}`}
              cx={3 + col * 5}
              cy={3 + row * 5}
              r="1.4"
              fill="currentColor"
            />
          ))
        )}
      </svg>
    </div>
  );
}

function DashedRule() {
  return (
    <div className="relative my-5 flex items-center">
      <div className="h-3 w-3 shrink-0 rounded-full border border-border bg-background -ml-1" />
      <div className="mx-2 h-px flex-1 border-t border-dashed border-border" />
      <div className="h-3 w-3 shrink-0 rounded-full border border-border bg-background -mr-1" />
    </div>
  );
}

export function TicketPreview({
  measurement,
  vehicle,
  liveWeight,
  operator = 'System',
  className,
  onPrint,
  onDownload,
  printing = false,
  downloading = false,
}: TicketPreviewProps) {
  const now = new Date();
  const ticketNumber =
    measurement?.ticketNumber ||
    `TKT-${format(now, 'yyyyMMdd')}-${Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0')}`;

  const measuredWeight = measurement?.measuredWeight ?? liveWeight ?? 0;
  const allowedWeight = measurement?.allowedWeight ?? vehicle?.allowedWeight ?? 0;
  const excessWeight = measurement?.excessWeight ?? measuredWeight - allowedWeight;
  const timestamp = measurement?.timestamp ?? now;

  const getStatus = (): WeightStatus => {
    if (!allowedWeight) return 'SAFE';
    const percentage = (measuredWeight / allowedWeight) * 100;
    if (percentage > 100) return 'OVERLOAD';
    if (percentage < 50) return 'UNDERLOAD';
    return 'SAFE';
  };

  const status = measurement?.status ?? getStatus();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const payload = JSON.stringify({
      ticket: ticketNumber,
      id: measurement?.id,
      plate: vehicle?.plateNumber,
      weight: measuredWeight,
      status,
    });
    QRCode.toDataURL(payload, { margin: 1, width: 120, color: { dark: '#171717', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [ticketNumber, measurement?.id, vehicle?.plateNumber, measuredWeight, status]);

  const statusTone =
    status === 'OVERLOAD'
      ? 'text-red-600'
      : status === 'UNDERLOAD'
        ? 'text-amber-600'
        : 'text-emerald-600';

  return (
    <div className={cn('mx-auto w-full max-w-md', className)}>
      <div className="receipt-slip overflow-hidden rounded-2xl border border-border/80 bg-[#f7f7f7] shadow-sm">
        <div className="bg-white px-6 pb-6 pt-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <ReceiptLogo />
              <div>
                <p className="text-base font-bold tracking-tight text-foreground">BRT Weight System</p>
                <p className="text-xs text-muted-foreground">Vehicle Weighing Station</p>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Receipt N° {ticketNumber.split('-').pop()}</p>
              <p>{format(timestamp, 'dd.MM.yyyy')}</p>
              <p>{format(timestamp, 'HH:mm')}</p>
            </div>
          </div>

          <div className="mt-5">
            <h2 className="text-xl font-bold leading-tight text-foreground">
              Weighing completed successfully!
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ticket{' '}
              <span className="font-semibold text-primary">{ticketNumber}</span> has been recorded in
              the system.
            </p>
          </div>

          <DashedRule />

          {/* Line items */}
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <span className="text-sm font-medium text-muted-foreground">1</span>
                <div>
                  <p className="font-semibold text-foreground">Vehicle on scale</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {vehicle?.plateNumber ?? 'N/A'} · {vehicle?.driver ?? 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {vehicle?.company ?? 'N/A'}
                    {vehicle?.vehicleType ? ` · ${getBusTypeLabel(vehicle.vehicleType)}` : ''}
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                {allowedWeight.toLocaleString()} kg
              </p>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <span className="text-sm font-medium text-muted-foreground">2</span>
                <div>
                  <p className="font-semibold text-foreground">Weight measurement</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Captured at {format(timestamp, 'HH:mm:ss')}
                  </p>
                  {measurement?.measuredPassengers != null && (
                    <p className="text-xs text-muted-foreground">
                      Passengers: {measurement.measuredPassengers}
                      {measurement.maxPassengers != null
                        ? ` / ${measurement.maxPassengers} max`
                        : ''}
                    </p>
                  )}
                </div>
              </div>
              <p className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                {measuredWeight.toLocaleString()} kg
              </p>
            </div>
          </div>

          {/* Summary box */}
          <div className="mt-6 rounded-xl bg-[#efefef] px-5 py-4">
            <div className="flex items-end justify-between gap-4">
              <p className="text-lg font-bold text-foreground">Captured weight</p>
              <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
                {measuredWeight.toLocaleString()}{' '}
                <span className="text-base font-semibold">kg</span>
              </p>
            </div>
            <div className="mt-3 space-y-1.5 border-t border-black/5 pt-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Max allowed weight</span>
                <span className="font-medium tabular-nums">{allowedWeight.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Difference</span>
                <span
                  className={cn(
                    'font-semibold tabular-nums',
                    excessWeight > 0 ? 'text-red-600' : 'text-emerald-600'
                  )}
                >
                  {excessWeight > 0 ? '+' : ''}
                  {excessWeight.toLocaleString()} kg
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <span className={cn('font-semibold', statusTone)}>{STATUS_LABELS[status]}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Operator</span>
                <span className="font-medium">{measurement?.operator ?? operator}</span>
              </div>
            </div>
          </div>

          {/* QR + note */}
          <div className="mt-5 flex items-center justify-between gap-4 border-t border-border/60 pt-5">
            <p className="max-w-[55%] text-sm font-semibold leading-snug text-foreground">
              Scan QR code to verify this weighing record in the system history.
            </p>
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for ticket ${ticketNumber}`}
                className="h-[88px] w-[88px] rounded-lg border border-primary/20 bg-white p-1"
              />
            ) : (
              <div className="h-[88px] w-[88px] rounded-lg border border-dashed border-muted bg-muted/30" />
            )}
          </div>

          {/* Footer */}
          <div className="mt-5 flex items-end justify-between gap-4 text-[10px] leading-relaxed text-muted-foreground">
            <div>
              <p className="font-medium text-foreground/80">BRT Weight · LoadGuard</p>
              <p>Official vehicle weighing receipt</p>
            </div>
            <p className="text-right">Verify at history / {ticketNumber}</p>
          </div>
        </div>
      </div>

      {(onPrint || onDownload) && (
        <div className="mt-4 flex gap-2 ticket-print-hide">
          {onPrint && (
            <Button variant="outline" className="flex-1" onClick={onPrint} disabled={printing}>
              <Printer className="h-4 w-4 mr-2" />
              {printing ? 'Printing…' : 'Print'}
            </Button>
          )}
          {onDownload && (
            <Button variant="outline" className="flex-1" onClick={onDownload} disabled={downloading}>
              <Download className="h-4 w-4 mr-2" />
              {downloading ? 'Downloading…' : 'PDF'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
