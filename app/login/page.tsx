'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, type FormEvent, type ComponentType } from 'react';
import {
  Shield,
  Scale,
  ArrowRight,
  Wifi,
  Server,
  Truck,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { AUTH_TOKEN_KEY } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.documentElement.classList.add('dark');
    const saved = localStorage.getItem('brt_remember_email');
    if (saved) setEmail(saved);
  }, []);

  const signIn = async (userEmail: string, pass: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Login failed');
        return;
      }
      if (data.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      }
      if (data.user) {
        localStorage.setItem('brt_user', JSON.stringify(data.user));
      }
      if (remember) localStorage.setItem('brt_remember_email', userEmail);
      else localStorage.removeItem('brt_remember_email');
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Unable to reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* Ambient grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden
      />

      <div className="relative hidden w-[52%] lg:block">
        <Image
          src="/bus.webp"
          alt="BRT bus at weighing station"
          fill
          priority
          sizes="52vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
        <div className="absolute inset-0 flex flex-col justify-between p-10 xl:p-14">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/25">
              <Shield className="size-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-foreground">BRT Monitor</p>
              <p className="text-xs text-muted-foreground">Overload Detection System</p>
            </div>
          </div>

          <div className="max-w-md space-y-6">
            <div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground xl:text-4xl">
                BRT Overloading Detection &amp; Monitoring
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Real-time weighing, overload alerts, and fleet oversight for bus rapid
                transit operators.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-card/80 p-5 backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Scale Console
                </span>
                <span className="flex items-center gap-1.5 text-xs text-success">
                  <span className="size-2 animate-pulse rounded-full bg-success" />
                  Ready
                </span>
              </div>
              <div className="digital-display text-center">
                <span className="text-5xl font-bold tabular-nums text-foreground">0</span>
                <span className="ml-2 text-2xl text-muted-foreground">kg</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusPill icon={Wifi} label="Sensor Online" ok />
                <StatusPill icon={Server} label="Backend Ready" ok />
                <StatusPill icon={Truck} label="Fleet Tracking" ok />
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Bus Rapid Transit Authority · Weighing Station Portal
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 sm:px-10">
        <div className="mb-8 flex flex-col items-center text-center lg:hidden">
          <div className="mb-3 flex size-12 items-center justify-center rounded-lg bg-primary">
            <Shield className="size-7 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">BRT Monitor</h1>
          <p className="text-sm text-muted-foreground">Overload Detection System</p>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="mb-8 hidden lg:block">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <Scale className="size-5" />
              <span className="text-sm font-medium">Operator Access</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Sign in to continue</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use your registered email and password from the BRT database.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-xl shadow-black/20 sm:p-8">
            <div className="mb-6 lg:hidden">
              <h2 className="text-xl font-bold">Sign in</h2>
              <p className="text-sm text-muted-foreground">Station operator credentials</p>
            </div>

            {error && (
              <div
                className="mb-5 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger"
                role="alert"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 bg-background"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(v) => setRemember(v === true)}
                  />
                  Remember me
                </label>
                <Link
                  href="#"
                  className="text-sm text-primary hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="mt-2 h-11 w-full gap-2" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Connecting…
                  </>
                ) : (
                  <>
                    Open Dashboard
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Authorized accounts are stored in the BRT MySQL database.
          </p>
        </div>

        <div className="relative mt-8 h-32 w-full max-w-[400px] overflow-hidden rounded-xl border border-border lg:hidden">
          <Image src="/bus.webp" alt="BRT bus" fill sizes="400px" className="object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      </div>
    </div>
  );
}

function StatusPill({
  icon: Icon,
  label,
  ok,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  ok?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium',
        ok
          ? 'border-success/30 bg-success/10 text-success'
          : 'border-border bg-muted text-muted-foreground'
      )}
    >
      <Icon className="size-3" />
      {label}
    </span>
  );
}
