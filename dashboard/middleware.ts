import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export const config = {
  matcher: [
    '/((?!api|monitoring|error|_next/static|_next/image|favicon.ico|.*.png$|.*.php$).*)',
  ],
};

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname, search } = request.nextUrl;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  // 로그인되지 않은 사용자가 /login 페이지가 아닌 다른 페이지에 접근하려는 경우
  if (!session && !pathname.includes('/login')) {
    const url = '/login';
    return NextResponse.redirect(new URL(url, request.url));
  }

  // 로그인된 상태에서 '/' 경로로 접근할 때 '/campaign'으로 리다이렉트
  if (session && pathname === '/') {
    const url = '/campaign';
    return NextResponse.redirect(new URL(url, request.url));
  }

  const response = NextResponse.next();
  // 헤더에 pathname 추가
  response.headers.set('x-current-path', pathname);
  response.headers.set('x-current-url', request.url);

  return response;
}
