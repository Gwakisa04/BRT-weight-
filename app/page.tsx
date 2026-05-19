import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AUTH_COOKIE, isAuthenticatedCookie } from '@/lib/auth';

/** Root URL: login first; dashboard only when already signed in. */
export default async function RootPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE)?.value;

  if (isAuthenticatedCookie(session)) {
    redirect('/dashboard');
  }

  redirect('/login');
}
