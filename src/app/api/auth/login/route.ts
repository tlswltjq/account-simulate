import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://tlswltjq.iptime.org:8080';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 백엔드로 명시적인 로그인 요청 전송
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok || data.status !== 'success') {
      return NextResponse.json(data, { status: res.status });
    }

    // 서버에서 발급한 토큰을 응답으로 받음 (LoginResponse)
    // data.data 구조 = { accessToken: "...", refreshToken: "..." }
    const accessToken = data.data?.accessToken;
    const refreshToken = data.data?.refreshToken;

    const response = NextResponse.json({ ...data.data, message: 'Logged in successfully' }, { status: 200 });

    if (accessToken) {
      response.cookies.set({
        name: 'accessToken',
        value: accessToken,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 30, // 30분
      });
    }

    if (refreshToken) {
      response.cookies.set({
        name: 'refreshToken',
        value: refreshToken,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7일
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
