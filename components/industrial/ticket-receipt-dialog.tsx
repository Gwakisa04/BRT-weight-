'use client';

import { useCallback, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TicketPreview } from '@/components/industrial/ticket-preview';
import { ticketApi } from '@/services/api';
import { toast } from 'sonner';
import type { Measurement, Vehicle } from '@/types';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface TicketReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  measurement?: Measurement | null;
  vehicle?: Vehicle | null;
}

export function TicketReceiptDialog({
  open,
  onOpenChange,
  measurement,
  vehicle,
}: TicketReceiptDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);

  const resolvedVehicle = vehicle ?? measurement?.vehicle;

  const handlePrint = useCallback(async () => {
    if (!measurement?.id) return;
    setPrinting(true);
    try {
      await ticketApi.print(measurement.id);
      window.print();
      toast.success('Ticket sent to printer');
    } catch {
      window.print();
      toast.info('Print dialog opened');
    } finally {
      setPrinting(false);
    }
  }, [measurement?.id]);

  const handleDownload = useCallback(async () => {
    if (!measurement?.id) return;
    setDownloading(true);
    try {
      const { data } = await ticketApi.getPdf(measurement.id);
      downloadBlob(data as Blob, `ticket-${measurement.ticketNumber}.pdf`);
      toast.success('PDF downloaded');
    } catch {
      toast.error('Could not download PDF. Is the backend running?');
    } finally {
      setDownloading(false);
    }
  }, [measurement?.id, measurement?.ticketNumber]);

  if (!measurement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Weighing Receipt</DialogTitle>
          <DialogDescription>
            Ticket {measurement.ticketNumber} — {resolvedVehicle?.plateNumber ?? 'Unknown vehicle'}
          </DialogDescription>
        </DialogHeader>
        <div ref={printRef} id="ticket-print-root" className="ticket-print-area">
          <TicketPreview
            measurement={measurement}
            vehicle={resolvedVehicle}
            onPrint={handlePrint}
            onDownload={handleDownload}
            printing={printing}
            downloading={downloading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
