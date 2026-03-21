import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://tlswltjq.iptime.org:8080';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refreshToken')?.value;

  if (refreshToken) {
    // 백엔드 로그아웃 호출 (실패해도 클라이언트 쿠키는 지움)
    await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).catch(console.error);
  }

  const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  
  // 클라이언트의 쿠키를 파기
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
  
  return response;
}
