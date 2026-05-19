'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLoadGuardStore } from '@/store/loadguard-store';
import { closeSidebarOnMobile } from '@/hooks/use-responsive-sidebar';
import {
  LayoutDashboard,
  Scale,
  Truck,
  History,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Live Weighing', href: '/weighing', icon: Scale },
  { name: 'Vehicles', href: '/vehicles', icon: Truck },
  { name: 'History', href: '/history', icon: History },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
] as const;

function NavLink({
  item,
  isActive,
  collapsed,
}: {
  item: (typeof navigation)[number];
  isActive: boolean;
  collapsed: boolean;
}) {
  const link = (
    <Link
      prefetch
      href={item.href}
      onClick={() => closeSidebarOnMobile()}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      )}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{item.name}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.name}</TooltipContent>
      </Tooltip>
    );
  }
  return link;
}

function AppSidebarInner() {
  const pathname = usePathname();
  const sidebarOpen = useLoadGuardStore((s) => s.sidebarOpen);
  const toggleSidebar = useLoadGuardStore((s) => s.toggleSidebar);
  const sensorOnline = useLoadGuardStore((s) => s.systemStatus.sensorOnline);
  const backendConnected = useLoadGuardStore((s) => s.systemStatus.backendConnected);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-sidebar transition-transform duration-200 ease-out',
          'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
          !sidebarOpen && 'lg:w-16',
          sidebarOpen && 'lg:w-64'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-3 lg:px-4">
          <Link
            prefetch
            href="/dashboard"
            onClick={() => closeSidebarOnMobile()}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            {sidebarOpen && (
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-bold text-sidebar-foreground">BRT Monitor</span>
                <span className="text-xs text-muted-foreground">DART System</span>
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden h-8 w-8 shrink-0 lg:inline-flex"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {navigation.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                collapsed={!sidebarOpen}
              />
            ))}
          </nav>
        </ScrollArea>

        <div className="border-t p-4">
          {sidebarOpen ? (
            <div className="space-y-2 text-xs">
              <StatusRow label="Sensor" ok={sensorOnline} />
              <StatusRow label="Backend" ok={backendConnected} />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className={cn('h-2 w-2 rounded-full', sensorOnline ? 'bg-success' : 'bg-destructive')} />
              <span className={cn('h-2 w-2 rounded-full', backendConnected ? 'bg-success' : 'bg-destructive')} />
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('flex items-center gap-1', ok ? 'text-success' : 'text-destructive')}>
        <span className={cn('h-2 w-2 rounded-full', ok ? 'bg-success' : 'bg-destructive')} />
        {ok ? (label === 'Sensor' ? 'Online' : 'Connected') : label === 'Sensor' ? 'Offline' : 'Disconnected'}
      </span>
    </div>
  );
}

export const AppSidebar = memo(AppSidebarInner);
