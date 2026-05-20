'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLoadGuardStore } from '@/store/loadguard-store';
import { Bell, Moon, Sun, Menu, Search, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { AUTH_TOKEN_KEY } from '@/lib/auth';

interface TopNavbarProps {
  className?: string;
}

export function TopNavbar({ className }: TopNavbarProps) {
  const router = useRouter();
  const theme = useLoadGuardStore((s) => s.theme);
  const setTheme = useLoadGuardStore((s) => s.setTheme);
  const toggleSidebar = useLoadGuardStore((s) => s.toggleSidebar);
  const sidebarOpen = useLoadGuardStore((s) => s.sidebarOpen);
  const backendConnected = useLoadGuardStore((s) => s.systemStatus.backendConnected);
  const buzzerActive = useLoadGuardStore((s) => s.systemStatus.buzzerActive);

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem('brt_user');
    router.push('/login');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden"
          onClick={toggleSidebar}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search vehicles, measurements..."
            className="w-64 pl-9 bg-secondary"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Connection Status */}
        <div className={cn(
          'hidden sm:flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm',
          backendConnected
            ? 'border-success/30 bg-success/10 text-success'
            : 'border-destructive/30 bg-destructive/10 text-destructive'
        )}>
          {backendConnected ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <span className="hidden md:inline">
            {backendConnected ? 'Backend Live' : 'Backend Offline'}
          </span>
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {buzzerActive && (
                <Badge 
                  variant="destructive" 
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center animate-pulse"
                >
                  !
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {buzzerActive ? (
              <DropdownMenuItem className="text-destructive">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">⚠️ Overload Alert Active</span>
                  <span className="text-xs text-muted-foreground">
                    Vehicle weight exceeds allowed limit
                  </span>
                </div>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem>
                <span className="text-muted-foreground">No new notifications</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">A</span>
              </div>
              <span className="hidden md:inline">Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
