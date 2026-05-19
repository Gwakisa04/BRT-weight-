'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_TOKEN_KEY } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

/** Client-side route protection for static export (no Next middleware). */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token || token.length < 10) {
      router.replace('/login');
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
