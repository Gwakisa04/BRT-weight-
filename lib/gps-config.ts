/** Matches backend GPS_POLL_INTERVAL_MS (default 5 seconds). */
export const GPS_POLL_INTERVAL_MS = Number(
  process.env.NEXT_PUBLIC_GPS_POLL_INTERVAL_MS ?? 5000
);

export const GPS_POLL_INTERVAL_SEC = GPS_POLL_INTERVAL_MS / 1000;
