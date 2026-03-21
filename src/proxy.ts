import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  
  // 로그인이나 회원가입 페이지에 토큰이 있는 상태로 접근 시 메인으로 리다이렉트 (선택적)
  if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')) {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 인증이 필요한 도메인 라우트에 토큰이 없을 경우 로그인으로 리다이렉트
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  // 인증이 필수인 페이지 라우트 명시
  matcher: ['/finance/:path*', '/splitbills/:path*', '/members/:path*', '/login', '/signup'],
};
