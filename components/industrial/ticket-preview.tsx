'use client';

import { cn } from '@/lib/utils';
import type { Measurement, Vehicle } from '@/types';
import { format } from 'date-fns';
import { QrCode, Printer, Download, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WeightStatusBadge } from './weight-status';
import { Separator } from '@/components/ui/separator';

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
  const ticketNumber = measurement?.ticketNumber || `TKT-${format(now, 'yyyyMMdd')}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
  
  const measuredWeight = measurement?.measuredWeight || liveWeight || 0;
  const allowedWeight = measurement?.allowedWeight || vehicle?.allowedWeight || 0;
  const excessWeight = measuredWeight - allowedWeight;
  
  const getStatus = () => {
    if (!allowedWeight) return 'SAFE';
    const percentage = (measuredWeight / allowedWeight) * 100;
    if (percentage > 100) return 'OVERLOAD';
    if (percentage < 50) return 'UNDERLOAD';
    return 'SAFE';
  };

  const status = measurement?.status || getStatus();

  return (
    <Card className={cn('max-w-md mx-auto', className)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">LoadGuard System</h2>
          </div>
          <p className="text-sm text-muted-foreground">Vehicle Weighing Station</p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(measurement?.timestamp || now, 'PPpp')}
          </p>
        </div>

        <Separator className="my-4" />

        {/* Ticket Number */}
        <div className="text-center mb-4">
          <p className="text-xs text-muted-foreground">Ticket Number</p>
          <p className="font-mono font-bold text-lg">{ticketNumber}</p>
        </div>

        <Separator className="my-4" />

        {/* Vehicle Info */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Plate Number:</span>
            <span className="font-bold">{vehicle?.plateNumber || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Driver:</span>
            <span className="font-medium">{vehicle?.driver || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Company:</span>
            <span className="font-medium">{vehicle?.company || 'N/A'}</span>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Weight Info */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Measured Weight:</span>
            <span className="font-mono font-bold text-lg">{measuredWeight.toLocaleString()} kg</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Max Allowed Weight:</span>
            <span className="font-mono">{allowedWeight.toLocaleString()} kg</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Difference:</span>
            <span className={cn(
              'font-mono font-bold',
              excessWeight > 0 ? 'text-destructive' : 'text-success'
            )}>
              {excessWeight > 0 ? '+' : ''}{excessWeight.toLocaleString()} kg
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="flex justify-center mb-4">
          <WeightStatusBadge status={status} size="lg" />
        </div>

        <Separator className="my-4" />

        {/* Footer */}
        <div className="flex justify-between items-center text-sm mb-4">
          <span className="text-muted-foreground">Operator:</span>
          <span className="font-medium">{measurement?.operator || operator}</span>
        </div>

        {/* QR Code Placeholder */}
        <div className="flex justify-center mb-4">
          <div className="h-24 w-24 rounded-lg border-2 border-dashed border-muted flex items-center justify-center">
            <QrCode className="h-12 w-12 text-muted-foreground/50" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 ticket-print-hide">
          <Button variant="outline" className="flex-1" onClick={onPrint} disabled={printing || !onPrint}>
            <Printer className="h-4 w-4 mr-2" />
            {printing ? 'Printing…' : 'Print'}
          </Button>
          <Button variant="outline" className="flex-1" onClick={onDownload} disabled={downloading || !onDownload}>
            <Download className="h-4 w-4 mr-2" />
            {downloading ? 'Downloading…' : 'PDF'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
