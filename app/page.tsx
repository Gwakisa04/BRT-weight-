'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_TOKEN_KEY } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

/** Root URL: send guests to login, signed-in users to dashboard. */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    router.replace(token && token.length > 10 ? '/dashboard' : '/login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
}
