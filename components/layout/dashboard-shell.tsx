'use client';

import { memo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLoadGuardStore } from '@/store/loadguard-store';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { TopNavbar } from '@/components/layout/top-navbar';
import { Toaster } from '@/components/ui/sonner';
import { SensorProvider } from '@/components/providers/sensor-provider';
import { BackendDataProvider } from '@/components/providers/backend-data-provider';
import { GpsTrackingProvider } from '@/components/providers/gps-tracking-provider';

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useLoadGuardStore((s) => s.sidebarOpen);
  const theme = useLoadGuardStore((s) => s.theme);
  const setTheme = useLoadGuardStore((s) => s.setTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setTheme(e.matches ? 'dark' : 'light');
    if (!localStorage.getItem('loadguard-storage')) {
      setTheme(mediaQuery.matches ? 'dark' : 'light');
    }
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setTheme]);

  return (
    <SensorProvider>
      <BackendDataProvider>
        <GpsTrackingProvider>
          <div className="min-h-screen bg-background">
            <AppSidebar />
            <div
              className={cn(
                'flex flex-col transition-[margin] duration-200 ease-out',
                sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
              )}
            >
              <TopNavbar />
              <main className="flex-1 p-4 lg:p-6">{children}</main>
            </div>
            <Toaster position="top-right" />
          </div>
        </GpsTrackingProvider>
      </BackendDataProvider>
    </SensorProvider>
  );
}

export const DashboardShell = memo(DashboardShellInner);
