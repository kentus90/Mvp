import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'admin_session';

async function isValidSession(token) {
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET || '');
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin') && pathname !== '/api/admin/login';

  if (!isAdminPage && !isAdminApi) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const valid = await isValidSession(token);

  if (valid) return NextResponse.next();

  if (isAdminApi) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }
  const loginUrl = new URL('/admin/login', req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
