import { NextResponse } from 'next/server';
import { AUTH_COOKIE } from '@/lib/auth';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? body.username ?? '').trim();
    const password = String(body.password ?? '');

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const backendRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.error ?? 'Login failed' },
        { status: backendRes.status }
      );
    }

    const response = NextResponse.json({
      success: true,
      token: data.token,
      user: data.user,
    });

    response.cookies.set(AUTH_COOKIE, data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Unable to reach authentication server. Is the backend running?' },
      { status: 503 }
    );
  }
}
