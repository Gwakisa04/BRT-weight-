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
import { SystemSocketProvider } from '@/components/providers/system-socket-provider';
import { AuthGuard } from '@/components/auth/auth-guard';
import { useResponsiveSidebar } from '@/hooks/use-responsive-sidebar';

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useLoadGuardStore((s) => s.sidebarOpen);
  const setSidebarOpen = useLoadGuardStore((s) => s.setSidebarOpen);
  const theme = useLoadGuardStore((s) => s.theme);
  const setTheme = useLoadGuardStore((s) => s.setTheme);

  useResponsiveSidebar();

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
    <AuthGuard>
      <SensorProvider>
        <BackendDataProvider>
          <SystemSocketProvider>
            <GpsTrackingProvider>
            <div className="min-h-screen bg-background">
              {sidebarOpen && (
                <button
                  type="button"
                  aria-label="Close navigation menu"
                  className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
              )}
              <AppSidebar />
              <div
                className={cn(
                  'flex min-h-screen flex-col transition-[margin] duration-200 ease-out',
                  'ml-0',
                  sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
                )}
              >
                <TopNavbar />
                <main className="flex-1 overflow-x-hidden p-3 sm:p-4 lg:p-6">{children}</main>
              </div>
              <Toaster position="top-right" />
            </div>
            </GpsTrackingProvider>
          </SystemSocketProvider>
        </BackendDataProvider>
      </SensorProvider>
    </AuthGuard>
  );
}

export const DashboardShell = memo(DashboardShellInner);
