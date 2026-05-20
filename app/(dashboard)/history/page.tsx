'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { WeightStatusBadge } from '@/components/industrial/weight-status';
import { TicketReceiptDialog } from '@/components/industrial/ticket-receipt-dialog';
import { useLoadGuardStore } from '@/store/loadguard-store';
import { measurementApi } from '@/services/api';
import { normalizeMeasurement } from '@/lib/api-normalize';
import { toast } from 'sonner';
import {
  History,
  Search,
  Calendar as CalendarIcon,
  Download,
  FileText,
  Filter,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Measurement } from '@/types';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function HistoryPage() {
  const measurements = useLoadGuardStore((s) => s.measurements);
  const setMeasurements = useLoadGuardStore((s) => s.setMeasurements);
  const backendConnected = useLoadGuardStore((s) => s.systemStatus.backendConnected);

  useEffect(() => {
    let cancelled = false;
    measurementApi.getAll({ limit: 200 }).then((res) => {
      if (!cancelled) {
        setMeasurements(res.data.data.map(normalizeMeasurement));
      }
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [setMeasurements]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const itemsPerPage = 10;

  const filteredMeasurements = useMemo(() => {
    return measurements.filter((m) => {
      const matchesSearch =
        m.vehicle?.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
        m.vehicle?.driver.toLowerCase().includes(search.toLowerCase()) ||
        m.ticketNumber.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      const matchesDate =
        (!dateRange.from || new Date(m.timestamp) >= dateRange.from) &&
        (!dateRange.to || new Date(m.timestamp) <= dateRange.to);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [measurements, search, statusFilter, dateRange]);

  const totalPages = Math.ceil(filteredMeasurements.length / itemsPerPage) || 1;
  const paginatedMeasurements = filteredMeasurements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportParams = {
    startDate: dateRange.from?.toISOString(),
    endDate: dateRange.to?.toISOString(),
  };

  const handleExportCSV = async () => {
    setExporting('csv');
    try {
      const { data } = await measurementApi.exportCsv(exportParams);
      downloadBlob(data as Blob, 'measurements.csv');
      toast.success('CSV downloaded');
    } catch {
      toast.error('CSV export failed. Is the backend running?');
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    setExporting('pdf');
    try {
      const { data } = await measurementApi.exportPdf(exportParams);
      downloadBlob(data as Blob, 'measurements.pdf');
      toast.success('PDF downloaded');
    } catch {
      toast.error('PDF export failed');
    } finally {
      setExporting(null);
    }
  };

  const handleRowClick = (measurement: Measurement) => {
    setSelectedMeasurement(measurement);
    setReceiptOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
            <History className="h-8 w-8 text-primary" />
            Measurement History
          </h1>
          <p className="text-muted-foreground">
            {backendConnected
              ? `${measurements.length} records from database`
              : 'Loading records from backend…'}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={exporting !== null}
            className="gap-2"
          >
            {exporting === 'csv' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={exporting !== null}
            className="gap-2"
          >
            {exporting === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Export PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by plate, driver, or ticket..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="SAFE">Safe</SelectItem>
                <SelectItem value="OVERLOAD">Overload</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full lg:w-64 justify-start text-left font-normal',
                    !dateRange.from && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd')} - {format(dateRange.to, 'LLL dd')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    'Pick a date range'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    setDateRange({ from: range?.from, to: range?.to });
                    setCurrentPage(1);
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {(dateRange.from || statusFilter !== 'all' || search) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setDateRange({ from: undefined, to: undefined });
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Measurement Records</CardTitle>
          <CardDescription>{filteredMeasurements.length} records found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket #</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead className="text-right">Measured</TableHead>
                  <TableHead className="text-right">Allowed</TableHead>
                  <TableHead className="text-right">Difference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Operator</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMeasurements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No measurements found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMeasurements.map((m) => (
                    <TableRow
                      key={m.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleRowClick(m)}
                    >
                      <TableCell className="font-mono text-sm">{m.ticketNumber}</TableCell>
                      <TableCell className="text-sm">
                        <div>{format(new Date(m.timestamp), 'PP')}</div>
                        <div className="text-muted-foreground text-xs">
                          {format(new Date(m.timestamp), 'HH:mm:ss')}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">
                        {m.vehicle?.plateNumber || 'Unknown'}
                      </TableCell>
                      <TableCell>{m.vehicle?.driver || 'N/A'}</TableCell>
                      <TableCell className="text-right font-mono">
                        {m.measuredWeight.toLocaleString()} kg
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {m.allowedWeight.toLocaleString()} kg
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right font-mono font-medium',
                          m.excessWeight > 0 ? 'text-destructive' : 'text-success'
                        )}
                      >
                        {m.excessWeight > 0 ? '+' : ''}
                        {m.excessWeight.toLocaleString()} kg
                      </TableCell>
                      <TableCell>
                        <WeightStatusBadge status={m.status} size="sm" />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{m.operator}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={
                        currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <TicketReceiptDialog
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        measurement={selectedMeasurement}
        vehicle={selectedMeasurement?.vehicle}
      />
    </div>
  );
}
