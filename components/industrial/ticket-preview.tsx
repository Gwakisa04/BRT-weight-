'use client';

import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { cn } from '@/lib/utils';
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
  variant?: 'full' | 'compact';
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
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
      <svg viewBox="0 0 16 16" className="h-5 w-5 text-primary-foreground" aria-hidden>
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
    <div className="relative my-4 flex items-center">
      <div className="h-3 w-3 shrink-0 rounded-full border border-border bg-card -ml-1" />
      <div className="mx-2 h-px flex-1 border-t border-dashed border-border" />
      <div className="h-3 w-3 shrink-0 rounded-full border border-border bg-card -mr-1" />
    </div>
  );
}

export function TicketPreview({
  measurement,
  vehicle,
  liveWeight,
  operator = 'System',
  className,
  variant = 'full',
  onPrint,
  onDownload,
  printing = false,
  downloading = false,
}: TicketPreviewProps) {
  const isCompact = variant === 'compact';
  const timestamp = measurement?.timestamp ?? new Date();

  const ticketNumber = useMemo(() => {
    if (measurement?.ticketNumber) return measurement.ticketNumber;
    return `TKT-${format(timestamp, 'yyyyMMdd')}-PREVIEW`;
  }, [measurement?.ticketNumber, timestamp]);

  const measuredWeight = measurement?.measuredWeight ?? liveWeight ?? 0;
  const allowedWeight = measurement?.allowedWeight ?? vehicle?.allowedWeight ?? 0;
  const excessWeight = measurement?.excessWeight ?? measuredWeight - allowedWeight;

  const status = useMemo((): WeightStatus => {
    if (measurement?.status) return measurement.status;
    if (!allowedWeight) return 'SAFE';
    const percentage = (measuredWeight / allowedWeight) * 100;
    if (percentage > 100) return 'OVERLOAD';
    return 'SAFE';
  }, [measurement?.status, measuredWeight, allowedWeight]);

  const displayStatus = status === 'UNDERLOAD' ? 'SAFE' : status;

  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Only generate QR for saved measurements — avoids heavy work on live weight ticks
  useEffect(() => {
    if (!measurement?.id || isCompact) {
      setQrDataUrl('');
      return;
    }

    let cancelled = false;
    const payload = JSON.stringify({
      ticket: ticketNumber,
      id: measurement.id,
      plate: vehicle?.plateNumber ?? measurement.vehicle?.plateNumber,
      weight: measuredWeight,
      status,
    });

    QRCode.toDataURL(payload, {
      margin: 1,
      width: 120,
      color: { dark: '#171717', light: '#ffffff' },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });

    return () => {
      cancelled = true;
    };
  }, [measurement?.id, ticketNumber, vehicle?.plateNumber, measurement?.vehicle?.plateNumber, measuredWeight, status, isCompact]);

  const statusTone = displayStatus === 'OVERLOAD' ? 'text-destructive' : 'text-emerald-500';

  return (
    <div className={cn('mx-auto w-full', isCompact ? 'max-w-full' : 'max-w-md', className)}>
      <div
        className={cn(
          'receipt-slip overflow-hidden rounded-xl border border-border shadow-sm',
          'bg-muted/30 print:bg-[#f7f7f7] print:text-black'
        )}
      >
        <div className={cn('bg-card px-4 pb-4 pt-4 print:bg-white', isCompact ? 'text-sm' : 'px-6 pb-6 pt-5')}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <ReceiptLogo />
              <div className="min-w-0">
                <p className="font-bold tracking-tight text-foreground truncate">BRT Weight System</p>
                <p className="text-xs text-muted-foreground">Vehicle Weighing Station</p>
              </div>
            </div>
            <div className="shrink-0 text-right text-xs text-muted-foreground">
              <p className="font-medium text-foreground">N° {ticketNumber.split('-').pop()}</p>
              <p>{format(timestamp, 'dd.MM.yyyy')}</p>
              <p>{format(timestamp, 'HH:mm')}</p>
            </div>
          </div>

          {!isCompact && (
            <>
              <div className="mt-4">
                <h2 className="text-lg font-bold leading-tight text-foreground">
                  Weighing completed successfully!
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ticket <span className="font-semibold text-primary">{ticketNumber}</span> recorded.
                </p>
              </div>
              <DashedRule />
            </>
          )}

          <div className={cn('space-y-3', isCompact && 'mt-3')}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{vehicle?.plateNumber ?? 'N/A'}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {vehicle?.driver ?? 'N/A'} · {vehicle?.company ?? 'N/A'}
                </p>
              </div>
              {!isCompact && (
                <p className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                  {allowedWeight.toLocaleString()} kg
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-muted/80 px-4 py-3 print:bg-[#efefef]">
            <div className="flex items-end justify-between gap-3">
              <p className={cn('font-bold text-foreground', isCompact ? 'text-sm' : 'text-base')}>
                Captured weight
              </p>
              <p className={cn('font-bold tabular-nums text-foreground', isCompact ? 'text-lg' : 'text-2xl')}>
                {measuredWeight.toLocaleString()} <span className="text-sm font-semibold">kg</span>
              </p>
            </div>
            <div className="mt-2 space-y-1 border-t border-border/60 pt-2 text-xs sm:text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Max allowed</span>
                <span className="font-medium tabular-nums text-foreground">
                  {allowedWeight.toLocaleString()} kg
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Difference</span>
                <span
                  className={cn(
                    'font-semibold tabular-nums',
                    excessWeight > 0 ? 'text-destructive' : 'text-emerald-500'
                  )}
                >
                  {excessWeight > 0 ? '+' : ''}
                  {excessWeight.toLocaleString()} kg
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Status</span>
                <span className={cn('font-semibold', statusTone)}>{STATUS_LABELS[displayStatus]}</span>
              </div>
              {!isCompact && (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Operator</span>
                  <span className="font-medium text-foreground">{measurement?.operator ?? operator}</span>
                </div>
              )}
            </div>
          </div>

          {!isCompact && measurement?.id && (
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
              <p className="max-w-[55%] text-xs font-medium leading-snug text-muted-foreground">
                Scan QR to verify in history.
              </p>
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR for ${ticketNumber}`}
                  className="h-20 w-20 rounded-md border border-border bg-white p-1"
                />
              ) : (
                <div className="h-20 w-20 rounded-md border border-dashed border-muted bg-muted/40" />
              )}
            </div>
          )}
        </div>
      </div>

      {(onPrint || onDownload) && (
        <div className="mt-3 flex gap-2 ticket-print-hide">
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
