export const AUTH_COOKIE = 'brt_session';
export const AUTH_TOKEN_KEY = 'auth_token';

export function isAuthenticatedCookie(value: string | undefined): boolean {
  return Boolean(value && value.length > 10);
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}
