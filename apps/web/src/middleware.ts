import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercepta todas as rotas do painel administrativo no servidor
  if (pathname.startsWith('/painel')) {
    const sessionCookie = request.cookies.get('i7_auth_session')?.value;

    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('msg', 'admin_required');
      return NextResponse.redirect(loginUrl);
    }

    try {
      const session = JSON.parse(decodeURIComponent(sessionCookie));
      
      // Validação estrita de perfil ADMIN e validade temporal
      if (!session || session.role !== 'ADMIN' || (session.exp && session.exp < Date.now())) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        loginUrl.searchParams.set('msg', 'unauthorized_admin');
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('msg', 'invalid_session');
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/painel/:path*'],
};
