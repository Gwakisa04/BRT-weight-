/** Recharts/SVG fills — CSS variables (oklch) do not work in SVG; use hex. */
export const CHART = {
  safe: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  muted: '#64748b',
  grid: 'rgba(148, 163, 184, 0.25)',
  tooltipBg: '#1e293b',
  tooltipBorder: '#334155',
  tooltipText: '#f8fafc',
} as const;

export const PIE_COLORS = [
  CHART.safe,
  CHART.primary,
  CHART.warning,
  CHART.secondary,
  CHART.danger,
] as const;
