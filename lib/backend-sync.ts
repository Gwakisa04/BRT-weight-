import { syncAppDataFull } from '@/lib/app-data-sync';

/** Refresh vehicles, measurements, and daily stats from the backend. */
export async function refreshBackendData(): Promise<void> {
  await syncAppDataFull(true);
}
